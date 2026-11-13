// 社区动态数据层：
// - 发布内容进「全局共享池」petpal-community-posts，所有账号互相可见（社区是公共广场）
// - 每条帖子带发布者 account / authorName，用于「我的动态」按账号过滤
// - 旧版按账号私有存储 petpal-my-posts:<账号> 会在首次读取时自动并入共享池
// 结构沿用 communityData.Post，可平滑迁移到后端 posts 表。
import { type Post } from "./communityData";
import { getCurrentUser } from "./userStore";

const SHARED_KEY = "petpal-community-posts";
const LEGACY_PREFIX = "petpal-my-posts:";
const MIGRATED_FLAG = "petpal-community-posts-migrated-v3";

/** 帖子内容指纹：作者名会被换成昵称，因此按正文内容判重，避免同一条被迁移两次 */
function contentKey(p: Post): string {
  return JSON.stringify(p.lines || []);
}

/** 取账号昵称：旧帖迁移时把「我」/账号名换成真实昵称 */
function nicknameOf(account: string): string {
  try {
    const users = JSON.parse(localStorage.getItem("petpal-users") || "[]") as {
      account?: string;
      nickname?: string;
    }[];
    const u = Array.isArray(users) ? users.find((x) => x.account === account) : undefined;
    return (u?.nickname || "").trim();
  } catch {
    return "";
  }
}

/** 发布时附加的关联信息（宠物 / 话题 / 位置 / 视频草稿标记），均为 JSON 可序列化字段 */
export interface ComposePost extends Post {
  pet?: string;
  topic?: string;
  loc?: string;
  videoDraft?: boolean;
  account?: string; // 发布者账号（「我的动态」归属）
  authorName?: string; // 发布者昵称（跨账号展示）
}

function readShared(): ComposePost[] {
  try {
    const raw = localStorage.getItem(SHARED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeShared(list: ComposePost[]): void {
  try {
    localStorage.setItem(SHARED_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/** 一次性迁移：各账号私有的旧帖子并入共享池，避免改造后旧动态消失 */
function migrateScopedPosts(): void {
  try {
    if (localStorage.getItem(MIGRATED_FLAG)) return;
    const merged = readShared();
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(LEGACY_PREFIX));
    keys.forEach((k) => {
      const account = k.slice(LEGACY_PREFIX.length);
      let arr: ComposePost[] = [];
      try {
        arr = JSON.parse(localStorage.getItem(k) || "[]");
      } catch {
        return;
      }
      if (!Array.isArray(arr)) return;
      arr.forEach((p) => {
        if (!p || !Array.isArray(p.lines)) return;
        if (merged.some((q) => contentKey(q) === contentKey(p))) return;
        const raw = (p.name || "").trim();
        const nick = nicknameOf(account);
        const name = p.authorName && p.authorName !== account
          ? p.authorName.trim()
          : raw === "我" || raw === account || !raw
            ? (nick || account)
            : raw;
        merged.push({ ...p, name, account: p.account || account, authorName: name });
      });
      // 迁移完删掉旧 key，避免下次再并一次
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
    // 回填昵称：早期迁移留下的 name 是账号名（如 2222），有昵称时换成昵称
    merged.forEach((p) => {
      if (!p.account) return;
      const nick = nicknameOf(p.account);
      if (nick && (p.name === p.account || p.authorName === p.account)) {
        p.name = nick;
        p.authorName = nick;
      }
    });
    // 终局去重：同正文内容只保留一条，优先保留已换成昵称的那条
    const dedup: ComposePost[] = [];
    merged.forEach((p) => {
      const i = dedup.findIndex((q) => contentKey(q) === contentKey(p));
      if (i < 0) dedup.push(p);
      else if (dedup[i].name === dedup[i].account && p.name !== p.account) dedup[i] = p;
    });
    writeShared(dedup);
    localStorage.setItem(MIGRATED_FLAG, "1");
  } catch {
    /* ignore */
  }
}

/** 社区流：所有账号发布的动态（共享可见） */
export function getAllPosts(): ComposePost[] {
  migrateScopedPosts();
  return readShared();
}

/** 我的动态：按当前登录账号过滤 */
export function getMyPosts(): ComposePost[] {
  migrateScopedPosts();
  const me = getCurrentUser()?.account || "guest";
  return readShared().filter((p) => (p.account || "guest") === me);
}

/** 发布：写入共享池，并打上当前账号与昵称，其他账号也能看到 */
export function saveMyPost(p: ComposePost): ComposePost[] {
  migrateScopedPosts();
  const me = getCurrentUser();
  const account = me?.account || "guest";
  const authorName = (me?.nickname || "").trim() || p.name || account;
  const post: ComposePost = { ...p, account, authorName, name: authorName };
  const list = [post, ...readShared()];
  writeShared(list);
  return list;
}
