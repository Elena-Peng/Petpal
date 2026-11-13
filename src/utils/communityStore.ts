// 社区帖子互动共享数据源：评论 / 收藏 / 点赞
// 统一读写 localStorage: petpal-community-interactions:<账号>（每个账号自己的点赞/评论记录），
// 帖子以「作者名::首行文案」为稳定标识，社区流与作者页共用同一份互动状态；
// 结构可平滑迁移到后端接口（interaction 表 + comment 表）。
import { adoptLegacyKey, scopedKey } from "./accountScoped";

export const COMMUNITY_CHANGE_EVENT = "petpal-community-change";

const KEY_BASE = "petpal-community-interactions";
const key = () => {
  adoptLegacyKey(KEY_BASE);
  return scopedKey(KEY_BASE);
};

export interface Interaction {
  liked: boolean;
  favorited: boolean;
  comments: string[];
}

export const EMPTY_INTERACTION: Interaction = {
  liked: false,
  favorited: false,
  comments: [],
};

/** 帖子稳定标识（作者名 + 首行文案） */
export function getPostId(p: { name: string; lines: string[] }): string {
  return `${p.name}::${p.lines.join("|")}`;
}

export function getInteractions(): Record<string, Interaction> {
  try {
    const raw = localStorage.getItem(key());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveInteractions(map: Record<string, Interaction>): void {
  try {
    localStorage.setItem(key(), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function emitCommunityChange(): void {
  try {
    window.dispatchEvent(new CustomEvent(COMMUNITY_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function subscribeCommunityChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(COMMUNITY_CHANGE_EVENT, handler);
  return () => window.removeEventListener(COMMUNITY_CHANGE_EVENT, handler);
}

// 关注集合（按作者名），与互动分开存储；供社区流与帖子详情页共用
const FOLLOW_KEY = "petpal-community-follows";

export function getFollows(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveFollows(map: Record<string, boolean>): void {
  try {
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** 关注 / 取关指定作者：写入持久化集合并广播变更，供社区流与作者页回读 */
export function setFollow(name: string, next: boolean): void {
  saveFollows({ ...getFollows(), [name]: next });
  emitCommunityChange();
}
