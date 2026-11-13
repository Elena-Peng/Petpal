// 账号私有本地存储：同一浏览器多账号互不串数据
// 约定：所有「属于某个登录账号」的 key 统一带账号后缀，形如 petpal-pets:2222
// 未登录时退化为 guest，保证未登录态也有独立的一份数据。
// 后续迁移到后端时，只需把这些 key 对应到 API 的 user 维度资源即可。

import { getCurrentUser } from "./userStore";

/** 当前账号标识（未登录为 guest） */
export function currentAccount(): string {
  const u = getCurrentUser();
  return u?.account || "guest";
}

/** 账号私有 key：base + ':' + account */
export function scopedKey(base: string, account?: string): string {
  return `${base}:${account ?? currentAccount()}`;
}

/** 该账号是否已经有自己的数据（用于判断是否需要从旧全局 key 迁移） */
export function hasScopedData(base: string): boolean {
  try {
    return localStorage.getItem(scopedKey(base)) !== null;
  } catch {
    return false;
  }
}

/**
 * 旧版全局 key 的一次性归属迁移：
 * 旧数据只属于「第一个读到它的账号」，搬进该账号私有 key 后立刻删除旧 key，
 * 这样后续登录的其它账号从空数据开始，不会再看到别人的内容。
 */
export function adoptLegacyKey(base: string): void {
  try {
    if (hasScopedData(base)) return;
    const legacy = localStorage.getItem(base);
    if (legacy === null) return;
    localStorage.setItem(scopedKey(base), legacy);
    localStorage.removeItem(base);
  } catch {
    /* 存储不可用时忽略 */
  }
}
