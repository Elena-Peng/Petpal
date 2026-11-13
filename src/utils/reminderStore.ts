// 提醒数据按宠物隔离存储工具。
// localStorage key 结构：<base>-<pet>，如 petpal-reminders-jijiu。
// 啾啾(jijiu)首次使用时，把早期全局 key（petpal-reminders 等）迁移到带宠物后缀的 key，
// 保证既有提醒不丢失；米糕(migao)、露露(lulu)各自独立，从空列表开始由用户自行管理。

// 提醒存储的宠物 key：种子宠为 jijiu/migao/lulu，
// 用户新建宠物直接使用其 id 后缀（如时间戳），保证与管理页 ?pet= 参数一致
export type PetId = string;

export const PETS: { id: PetId; name: string }[] = [
  { id: "jijiu", name: "啾啾" },
  { id: "migao", name: "米糕" },
  { id: "lulu", name: "露露" },
];

export const DEFAULT_PET: PetId = "jijiu";

// 一次性的旧全局数据迁移（仅对 jijiu）
function ensureMigrated(pet: PetId) {
  if (pet !== "jijiu") return;
  const migrate = (base: string) => {
    const old = localStorage.getItem(base);
    const neu = `${base}-jijiu`;
    if (old !== null && localStorage.getItem(neu) === null) {
      localStorage.setItem(neu, old);
    }
  };
  migrate("petpal-reminders");
  migrate("petpal-custom-reminders");
  migrate("petpal-reminder-overrides");
}

// 读取（jijiu 触发迁移）
export function getPetStore(pet: PetId, base: string): string | null {
  ensureMigrated(pet);
  return localStorage.getItem(`${base}-${pet}`);
}

// 写入
export function setPetStore(pet: PetId, base: string, val: string) {
  localStorage.setItem(`${base}-${pet}`, val);
}

// 从路由查询参数解析宠物 id，非法/缺失回退默认
export function petFromParam(raw: string | null): PetId {
  const v = (raw || "").trim();
  // 只保留合法字符，避免把异常字符拼进 localStorage key；空值回退默认宠物
  const safe = v.replace(/[^a-zA-Z0-9_-]/g, "");
  return safe || DEFAULT_PET;
}

// 管理页返回时对应宠物的首页路径
export function petHomePath(pet: PetId): string {
  // 只有种子宠「米糕」「露露」有独立首页，其余（含用户新建宠物）回到主首页
  return pet === "migao" || pet === "lulu" ? `/${pet}` : "/";
}

/* ============================================================
 * 提醒业务结构（JSON 可序列化，时间用字符串、类型用枚举字符串，
 * 便于后续迁移到后端接口/数据库表）
 * ============================================================ */

// 提醒类型枚举（字符串值落库，不在前端存中文文案）
export type ReminderType = "deworm" | "vaccine" | "checkup" | "feeding" | "custom";

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  deworm: "驱虫",
  vaccine: "疫苗",
  checkup: "体检",
  feeding: "喂食",
  custom: "自定义",
};

export interface ReminderItem {
  id: number;
  icon?: string;
  title: string;
  desc: string;
  type?: ReminderType;
  time?: string; // 时间字符串（HH:MM 或文本），可序列化
}

// 预设提醒的编辑覆盖 / 删除标记
export interface ReminderOverride {
  id: number;
  title?: string;
  desc?: string;
  deleted?: boolean;
}

// 安全解析 JSON：localStorage 数据损坏/非法时回退兜底值，避免整页白屏
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw === null || raw === "") return fallback;
  try {
    const value = JSON.parse(raw);
    return value == null ? fallback : (value as T);
  } catch {
    return fallback;
  }
}

// 首页已勾选/展示的提醒 id 列表（petpal-reminders-<pet>）
export function getAddedIds(pet: PetId): number[] {
  return safeParse<number[]>(getPetStore(pet, "petpal-reminders"), []);
}

export function saveAddedIds(pet: PetId, ids: number[]): void {
  setPetStore(pet, "petpal-reminders", JSON.stringify(ids));
}

// 自定义提醒列表（petpal-custom-reminders-<pet>）
export function getCustoms(pet: PetId): ReminderItem[] {
  return safeParse<ReminderItem[]>(getPetStore(pet, "petpal-custom-reminders"), []);
}

export function saveCustoms(pet: PetId, list: ReminderItem[]): void {
  setPetStore(pet, "petpal-custom-reminders", JSON.stringify(list));
}

// 预设提醒的覆盖/删除记录（petpal-reminder-overrides-<pet>）
export function getOverrides(pet: PetId): ReminderOverride[] {
  return safeParse<ReminderOverride[]>(getPetStore(pet, "petpal-reminder-overrides"), []);
}

export function saveOverrides(pet: PetId, list: ReminderOverride[]): void {
  setPetStore(pet, "petpal-reminder-overrides", JSON.stringify(list));
}

// 生成不碰撞的自定义提醒 id（>=100，编辑页据此区分自定义与预设）
// 以时间戳为基准，遇到已存在 id 自增兜底，避免删除后再新增发生碰撞
export function genCustomId(existing: { id: number }[]): number {
  const ids = new Set(existing.map((e) => e.id));
  let id = Math.max(100, Date.now() % 1000000000);
  while (ids.has(id)) id += 1;
  return id;
}
