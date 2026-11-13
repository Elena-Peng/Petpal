// 服务页收藏（附近优选 / 友宠场所 / 领养动物）：localStorage 持久化，可平滑迁移到后端 favorites 表。
// 以卡片名称作为稳定 id。按账号隔离（petpal-service-favs:<账号>）。
import { adoptLegacyKey, scopedKey } from "./accountScoped";

const KEY_BASE = "petpal-service-favs";
const key = () => {
  adoptLegacyKey(KEY_BASE);
  return scopedKey(KEY_BASE);
};

export type FavMap = Record<string, boolean>;

export function getFavs(): FavMap {
  try {
    const raw = localStorage.getItem(key());
    return raw ? (JSON.parse(raw) as FavMap) : {};
  } catch {
    return {};
  }
}

export function toggleFav(id: string): boolean {
  const map = getFavs();
  const next = !map[id];
  if (next) map[id] = true;
  else delete map[id];
  try {
    localStorage.setItem(key(), JSON.stringify(map));
  } catch {
    /* ignore */
  }
  return next;
}

export function isFav(id: string): boolean {
  return !!getFavs()[id];
}

// 分类栏目在服务页的显示策略：
//   - 未设置（null）= 自动：有收藏就显示，没收藏就隐藏
//   - true  = 强制固定显示（即使没收藏也显示）
//   - false = 强制隐藏（即使有收藏也不显示）
const CAT_KEY = "petpal-svc-cat-visible";

export type CatVisibleMap = Record<string, boolean>;

export function getCategoryVisible(): CatVisibleMap {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    return raw ? (JSON.parse(raw) as CatVisibleMap) : {};
  } catch {
    return {};
  }
}

/** 该分类是否被用户"强制固定显示" */
export function isCategoryPinned(name: string): boolean {
  return getCategoryVisible()[name] === true;
}

/** 该分类是否被用户"强制隐藏" */
export function isCategoryHidden(name: string): boolean {
  return getCategoryVisible()[name] === false;
}

/** 桌面是否显示该分类：未强制隐藏 且（有收藏 或 被强制固定显示） */
export function shouldShowCategory(name: string, favCount: number): boolean {
  if (isCategoryHidden(name)) return false;
  return favCount > 0 || isCategoryPinned(name);
}

export function setCategoryVisible(name: string, visible: boolean): void {
  const m = getCategoryVisible();
  m[name] = visible;
  try {
    localStorage.setItem(CAT_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

// ===== 服务在线咨询会话（消息页"服务"栏目） =====
// 咨询进入聊天即写入一条会话；打开聊天=已读（unread=0），红点消失。按账号隔离。
const CHAT_BASE = "petpal-service-chats";
const chatKey = () => {
  adoptLegacyKey(CHAT_BASE);
  return scopedKey(CHAT_BASE);
};

export type SvcChat = {
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  avatar: string;
};

export function getSvcChats(): SvcChat[] {
  try {
    const raw = localStorage.getItem(chatKey());
    const arr = raw ? (JSON.parse(raw) as SvcChat[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveSvcChats(list: SvcChat[]): void {
  try {
    localStorage.setItem(chatKey(), JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/** 记录一次咨询会话：已存在则更新消息与未读+1，否则新建 */
export function addSvcChat(c: { name: string; lastMsg: string; avatar: string }): void {
  const list = getSvcChats();
  const exist = list.find((x) => x.name === c.name);
  if (exist) {
    exist.lastMsg = c.lastMsg;
    exist.time = "刚刚";
    exist.avatar = c.avatar;
    exist.unread = (exist.unread || 0) + 1;
  } else {
    list.unshift({ ...c, time: "刚刚", unread: 1 });
  }
  saveSvcChats(list);
}

/** 打开该服务聊天 = 已读，清除未读红点 */
export function markSvcChatRead(name: string): void {
  const list = getSvcChats();
  const exist = list.find((x) => x.name === name);
  if (exist && exist.unread !== 0) {
    exist.unread = 0;
    saveSvcChats(list);
  }
}
