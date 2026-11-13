// 登录注册数据层（localStorage 实现，字段对齐后端 User 表，可迁移到 API/数据库）
// petpal-users      用户库: [{ account, password, nickname, avatar, createdAt, phone, gender, birthday, city, bio }]
// petpal-auth-user  当前登录用户: { account, nickname, avatar, ...资料字段 }
// petpal_auth       兼容旧登录标记 '1'
// 注意：仅使用 JSON 可序列化字段（字符串/布尔/数字），不写入 Date 对象。

// 可迁移的个人资料扩展字段（后端 user 表可直接对应列）
export type ProfileExtra = {
  phone?: string;
  gender?: string;
  birthday?: string;
  city?: string;
  bio?: string;
};

export type User = {
  account: string;
  password: string;
  nickname: string;
  avatar: string; // 存标识或 dataURL，渲染时映射原图
  createdAt: number;
} & ProfileExtra;

export type CurrentUser = Pick<User, "account" | "nickname" | "avatar"> & ProfileExtra;

const USERS_KEY = "petpal-users";
const AUTH_USER_KEY = "petpal-auth-user";
const AUTH_LEGACY = "petpal_auth";

// 当前登录用户资料变更（登录/注册/改昵称/换头像）广播，供首页问候区、我的页等订阅后实时刷新
export const USER_UPDATE_EVENT = "petpal-user-update";

export const DEFAULT_AVATAR = "@mine-default"; // 标识 → 渲染时映射 mine-avatar.jpg

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveUsers(list: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function writeAuth(user: CurrentUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_LEGACY, "1"); // 兼容旧逻辑
  window.dispatchEvent(new Event(USER_UPDATE_EVENT)); // 通知首页/我的页刷新用户头像等资料
}

// 由用户库记录组装当前登录用户对象（剔除密码等敏感字段）
function toCurrentUser(u: User): CurrentUser {
  return {
    account: u.account,
    nickname: u.nickname,
    avatar: u.avatar,
    phone: u.phone,
    gender: u.gender,
    birthday: u.birthday,
    city: u.city,
    bio: u.bio,
  };
}

export function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && u.account ? u : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getCurrentUser();
}

/** 按昵称查用户（供社区作者主页展示注册用户资料，不返回密码） */
export function findUserByNickname(nickname: string): Omit<User, "password"> | undefined {
  const n = (nickname || "").trim();
  if (!n) return undefined;
  const hit = readUsers().find((u) => (u.nickname || "").trim() === n);
  if (!hit) return undefined;
  const rest = { ...hit } as Partial<User>;
  delete rest.password;
  return rest as Omit<User, "password">;
}

// 账号容错归一化：去除所有空格、全角数字转半角，便于模糊匹配已注册账号
function normalizeAccount(s: string): string {
  return s
    .replace(/\s+/g, "")
    .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0));
}

export function registerUser(input: {
  account: string;
  password: string;
  nickname: string; // 与注册页前端校验口径一致：昵称必填
  avatar?: string; // 用户上传的头像（dataURL），缺省用默认标识
}): { ok: boolean; error?: string; user?: CurrentUser } {
  const account = input.account.trim();
  const password = input.password;
  const nickname = (input.nickname ?? "").trim();

  if (!account) return { ok: false, error: "请输入账号" };
  if (/\s/.test(account)) return { ok: false, error: "账号不能包含空格" };
  if (account.length < 4) return { ok: false, error: "账号至少 4 位" };
  if (!nickname) return { ok: false, error: "请填写用户名" };
  if (!password) return { ok: false, error: "请输入密码" };
  if (password.length < 6) return { ok: false, error: "密码至少 6 位" };

  const users = readUsers();
  if (users.some((u) => u.account === account)) {
    return { ok: false, error: "该账号已被注册，请直接登录" };
  }

  const user: User = {
    account,
    password,
    nickname,
    avatar: input.avatar || DEFAULT_AVATAR,
    createdAt: Date.now(),
  };
  users.push(user);
  saveUsers(users);

  const current = toCurrentUser(user);
  writeAuth(current);
  return { ok: true, user: current };
}

export function loginUser(
  account: string,
  password: string
): { ok: boolean; error?: string; user?: CurrentUser } {
  const acc = account.trim();
  if (!acc) return { ok: false, error: "请输入你的账号" };
  if (!password) return { ok: false, error: "请输入你的密码" };

  const users = readUsers();
  // 精确匹配优先；找不到再按容错（去空格/全角转半角）匹配，避免小差异误判未注册
  const user =
    users.find((u) => u.account === acc) ||
    users.find((u) => normalizeAccount(u.account) === normalizeAccount(acc));
  if (!user)
    return { ok: false, error: "未找到该账号，请核对账号是否输入正确（不含空格）" };
  if (user.password !== password) return { ok: false, error: "密码不正确，请重试" };

  const current = toCurrentUser(user);
  writeAuth(current);
  return { ok: true, user: current };
}

// 更新当前登录用户的资料（昵称/头像/性别/生日/城市/简介/手机号）。
// 同时回写用户库与当前登录态，结构保持纯 JSON，可平滑迁移到后端接口。
export function updateProfile(
  patch: Partial<ProfileExtra & { nickname?: string; avatar?: string }>
): { ok: boolean; error?: string; user?: CurrentUser } {
  const current = getCurrentUser();
  if (!current) return { ok: false, error: "请先登录" };

  const users = readUsers();
  const idx = users.findIndex((u) => u.account === current.account);
  if (idx < 0) return { ok: false, error: "账号信息异常，请重新登录" };

  const next: User = { ...users[idx] };

  if (patch.nickname !== undefined) {
    const nick = patch.nickname.trim();
    if (!nick) return { ok: false, error: "昵称不能为空" };
    next.nickname = nick;
  }
  if (patch.avatar !== undefined) {
    next.avatar = patch.avatar || DEFAULT_AVATAR;
  }
  (["phone", "gender", "birthday", "city", "bio"] as const).forEach((k) => {
    if (patch[k] !== undefined) next[k] = patch[k]?.trim() || "";
  });

  users[idx] = next;
  saveUsers(users);

  const currentUser = toCurrentUser(next);
  writeAuth(currentUser);
  return { ok: true, user: currentUser };
}

export function logoutUser() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_LEGACY);
}
