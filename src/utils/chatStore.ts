// 消息会话数据层：localStorage 持久化，管理已读/置顶/删除
// 会话列表按账号隔离（petpal-chats:<账号>）；
// 两个「已注册账号」之间的私聊线程改为共用一条 dm 线程（petpal-dm:<A>|<B>），
// 这样同一浏览器里 A 发给 B 的消息，B 登录后也能读到（跨设备仍需后端）。
import { adoptLegacyKey, currentAccount, scopedKey } from "./accountScoped";
import { findUserByNickname, getCurrentUser } from "./userStore";

const CHATS_BASE = "petpal-chats";
const MSG_BASE = "petpal-chat-messages";
const DM_BASE = "petpal-dm";
const PRUNE_FLAG = "petpal-chats-pruned-v2";

const chatsKey = () => {
  adoptLegacyKey(CHATS_BASE);
  return scopedKey(CHATS_BASE);
};
const msgsKey = () => {
  adoptLegacyKey(MSG_BASE);
  return scopedKey(MSG_BASE);
};

export type Chat = {
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  pinned: boolean;
  isGroup?: boolean;
  /** 对方账号：同名昵称（如两个「黄黄」）时用它锁定私聊对象 */
  account?: string;
};

// 新用户没有任何好友会话：会话只在真正聊过之后才建立（社区/服务页发起咨询或私信）。
// 早期版本预置的演示会话（胖宝宝/小虎/小宝/年糕/陌生人消息/系统通知/宠物爱好者交流群）
// 在这里做一次性清理：没有任何真实消息线程的，直接移除。
const SEED_NAMES = [
  "胖宝宝",
  "小虎",
  "小宝",
  "年糕",
  "陌生人消息",
  "系统通知",
  "宠物爱好者交流群",
];

const DEFAULTS: Chat[] = [];

export function getChats(): Chat[] {
  try {
    const raw = localStorage.getItem(chatsKey());
    if (!raw) {
      save([]);
      return [];
    }
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // 一次性剔除「从没聊过」的旧演示会话，保留用户真实聊过的
    if (localStorage.getItem(PRUNE_FLAG) === null) {
      const threads = readThreads();
      const kept = arr.filter(
        (c: Chat) => !SEED_NAMES.includes(c.name) || (threads[c.name]?.length ?? 0) > 0
      );
      save(kept);
      localStorage.setItem(PRUNE_FLAG, "1");
      return kept;
    }
    return arr;
  } catch {
    return [];
  }
}

function save(chats: Chat[]) {
  try {
    localStorage.setItem(chatsKey(), JSON.stringify(chats));
  } catch { /* ignore */ }
}

/** 读取当前账号的会话列表（不做清理/写回，供内部解析使用） */
function readChats(): Chat[] {
  try {
    const raw = localStorage.getItem(chatsKey());
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** 打开聊天 = 已读，清除头像右上角红点 */
export function markChatRead(name: string): void {
  const chats = getChats();
  const c = chats.find((x) => x.name === name);
  if (c && c.unread !== 0) {
    c.unread = 0;
    save(chats);
  }
}

/** 置顶 / 取消置顶 */
export function togglePin(name: string): void {
  const chats = getChats();
  const c = chats.find((x) => x.name === name);
  if (!c) return;
  c.pinned = !c.pinned;
  save(chats);
}

/** 删除会话 */
export function removeChat(name: string): void {
  save(getChats().filter((x) => x.name !== name));
}

// ===== 会话消息线程（与会话列表分开存储，结构可平滑迁移到后端 messages 表）=====
// 消息卡片（如家庭邀请）：后端可用 message.type + payload 表达，前端这里用 card 字段承载
export type ChatPet = { name: string; species: string; age: string; avatar: string };

export type ChatCard = {
  kind: "invite" | "accept";
  title: string;
  sub?: string;
  pet?: ChatPet;
  /** 邀请卡片随附的家庭宠物档案（对方同意后即可查看） */
  pets?: ChatPet[];
  /** 邀请状态：等待确认 / 已同意 / 已拒绝 */
  state?: "pending" | "accepted" | "declined";
};

/** 消息类型：文本 / 图片 / 语音 / 卡片（默认文本，兼容历史数据） */
export type ChatMessageKind = "text" | "image" | "voice" | "invite";

export type ChatMessage = {
  from: "them" | "me";
  text: string;
  time: string; // 展示用时间文案（如「刚刚」），避免在 localStorage 存 Date 实例
  card?: ChatCard;
  kind?: ChatMessageKind;
  /** 图片消息：dataURL（接后端后替换为 uploadUrl） */
  image?: string;
  /** 语音消息：时长（秒） */
  duration?: number;
  /** 语音消息：音频 dataURL（无麦克风权限时为 undefined，气泡只展示时长） */
  audio?: string;
};

// 会话/消息变化事件：聊天页、消息页监听后刷新，避免新消息只在刷新后才出现
export const CHAT_UPDATE_EVENT = "petpal-chat-update";

function notify(): void {
  try {
    window.dispatchEvent(new Event(CHAT_UPDATE_EVENT));
  } catch {
    /* ignore */
  }
}

function readThreads(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(msgsKey());
    const arr = raw ? JSON.parse(raw) : {};
    return arr && typeof arr === "object" ? arr : {};
  } catch {
    return {};
  }
}

function writeThreads(map: Record<string, ChatMessage[]>): void {
  try {
    localStorage.setItem(msgsKey(), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

// ===== 跨账号私聊线程 =====
type StoredMsg = ChatMessage & { sender?: string };

/** 两个账号共用的线程键：账号排序后拼接，双方读到同一条线程 */
function dmKey(a: string, b: string): string {
  return `${DM_BASE}:${[a, b].sort().join("|")}`;
}

/** 当前账号与「会话名」是否构成两个已注册账号之间的私聊；是则返回对方账号 */
function peerAccount(name: string): string | null {
  const me = currentAccount();
  if (!me) return null;
  // 优先用会话条目上绑定的账号（同名昵称时不会串账号）
  const entry = readChats().find((c) => c.name === name && !!c.account);
  if (entry?.account && entry.account !== me) return entry.account;
  const u = findUserByNickname(name);
  if (!u || !u.account || u.account === me) return null;
  return u.account;
}

function readDm(key: string): StoredMsg[] {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeDm(key: string, list: StoredMsg[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/** 存储态（带 sender）→ 展示态（按当前账号判定 me / them） */
function toView(list: StoredMsg[], me: string): ChatMessage[] {
  return list.map((m) => {
    if (!m.sender) return m;
    const { sender, ...rest } = m;
    return { ...rest, from: sender === me ? "me" : "them" };
  });
}

/** 把「我发给对方」的消息同步进对方账号的会话列表（含未读数），对方登录即可看到 */
function writePeerChats(
  peer: string,
  myName: string,
  myAvatar: string,
  lastMsg: string
): void {
  try {
    const key = scopedKey(CHATS_BASE, peer);
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    const list: Chat[] = Array.isArray(parsed) ? parsed : [];
    const myAccount = currentAccount() || undefined;
    let idx = list.findIndex((x) => x.name === myName && x.account === myAccount);
    // 兼容旧数据：同名但没有绑定账号的条目直接升级，避免出现两条同名会话
    if (idx < 0) idx = list.findIndex((x) => x.name === myName && !x.account);
    if (idx >= 0) {
      list[idx].lastMsg = lastMsg;
      list[idx].time = "刚刚";
      list[idx].unread = (list[idx].unread || 0) + 1;
      if (myAvatar) list[idx].avatar = myAvatar;
      list[idx].account = myAccount;
    } else {
      list.unshift({
        name: myName,
        avatar: myAvatar,
        lastMsg,
        time: "刚刚",
        unread: 1,
        pinned: false,
        account: myAccount,
      });
    }
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/** 由消息内容推出会话列表里展示的摘要 */
function previewOf(msg: ChatMessage): string {
  if (msg.card) return msg.card.title || "家庭邀请";
  if (msg.kind === "image") return "[图片]";
  if (msg.kind === "voice") return `[语音] ${msg.duration ?? 0}″`;
  return msg.text || "";
}

function myDisplay(): { name: string; avatar: string } {
  const u = getCurrentUser();
  return { name: u?.nickname || "我", avatar: u?.avatar || "" };
}

/** 回读某会话历史消息；两个已注册账号之间读共享 dm 线程，其余走本账号线程 */
export function getChatMessages(name: string, seed: ChatMessage[] = []): ChatMessage[] {
  if (!name) return seed;
  const me = currentAccount();
  const peer = peerAccount(name);
  if (me && peer) {
    const list = readDm(dmKey(me, peer));
    if (list.length > 0) return toView(list, me);
    return seed;
  }
  const map = readThreads();
  const stored = map[name];
  return Array.isArray(stored) ? stored : seed;
}

/** 追加一条消息并持久化，返回最新线程；seed 作为首次写入前的基线 */
export function appendChatMessage(
  name: string,
  msg: ChatMessage,
  seed: ChatMessage[] = []
): ChatMessage[] {
  const me = currentAccount();
  const peer = peerAccount(name);
  // 两个已注册账号：共写一条 dm 线程，并给对方账号的会话列表投一条未读
  if (me && peer) {
    const key = dmKey(me, peer);
    const list = readDm(key);
    const sender = msg.from === "me" ? me : peer;
    const next: StoredMsg[] = [...list, { ...msg, sender }];
    writeDm(key, next);
    if (msg.from === "me") {
      const mine = myDisplay();
      writePeerChats(peer, mine.name, mine.avatar, previewOf(msg));
    }
    notify();
    return toView(next, me);
  }

  const map = readThreads();
  const existing = Array.isArray(map[name]) ? map[name] : seed;
  const next = [...existing, msg];
  map[name] = next;
  writeThreads(map);
  notify();
  return next;
}

/** 把最近一条待确认的家庭邀请标记为已同意/已拒绝（对方回应后回写原卡片） */
export function resolveInviteState(
  name: string,
  state: "accepted" | "declined"
): void {
  const me = currentAccount();
  const peer = peerAccount(name);
  const target: StoredMsg[] = me && peer ? readDm(dmKey(me, peer)) : [];
  const list: StoredMsg[] = me && peer ? target : (readThreads()[name] as StoredMsg[]) || [];
  if (!Array.isArray(list)) return;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const m = list[i];
    if (m.card && m.card.kind === "invite" && (m.card.state ?? "pending") === "pending") {
      list[i] = { ...m, card: { ...m.card, state } };
      if (me && peer) writeDm(dmKey(me, peer), list);
      else {
        const map = readThreads();
        map[name] = list as ChatMessage[];
        writeThreads(map);
      }
      notify();
      return;
    }
  }
}

/** 发送消息后同步会话列表元信息（最后一条 / 时间）；不存在则新建会话条目 */
export function upsertChatMeta(name: string, avatar: string, lastMsg: string): void {
  if (!name) return;
  const chats = getChats();
  const idx = chats.findIndex((x) => x.name === name);
  if (idx >= 0) {
    chats[idx].lastMsg = lastMsg;
    chats[idx].time = "刚刚";
  } else {
    chats.unshift({ name, avatar, lastMsg, time: "刚刚", unread: 0, pinned: false });
  }
  save(chats);
  notify();
}
