// 今日状态共享数据源：首页「今日状态」与健康档案「今日快速记录」共用
// 统一读写 localStorage: petpal-status-<petId>-<key>（按宠物隔离，契合后端 petId 迁移方向），
// 并在同页签内广播变更事件，跨组件/跨路由实时联动。
import { getCurrentPet } from "@/utils/petStore";

export const STATUS_CHANGE_EVENT = "petpal-status-change";

// 首次使用时的预置记录（对应导出稿初始视觉：饮食/饮水已完成，其余待记录）
const DEFAULT_STATUS: Record<string, string> = {
  food: "3",
  water: "300",
};

const SEED_FLAG = "petpal-status-seeded";

/** 首次使用时写入预置记录（每只宠物独立执行一次，之后用户清除/修改均不会被覆盖） */
export function ensureSeed(petId: string): void {
  try {
    if (localStorage.getItem(`${SEED_FLAG}-${petId}`)) return;
    Object.entries(DEFAULT_STATUS).forEach(([key, value]) => {
      if (!localStorage.getItem(`petpal-status-${petId}-${key}`)) {
        localStorage.setItem(`petpal-status-${petId}-${key}`, value);
      }
    });
    localStorage.setItem(`${SEED_FLAG}-${petId}`, "1");
  } catch {
    /* ignore */
  }
}

export interface StatusRecord {
  value: string;
  done: boolean;
}

/** 读取指定宠物的单项记录，未记录返回 null */
export function getStatus(petId: string, key: string): StatusRecord | null {
  try {
    const raw = localStorage.getItem(`petpal-status-${petId}-${key}`);
    if (raw === null || raw === "") return null;
    return { value: raw, done: true };
  } catch {
    return null;
  }
}

/** 写入指定宠物的单项记录（记录后 done=true） */
export function setStatus(petId: string, key: string, value: string): void {
  try {
    localStorage.setItem(`petpal-status-${petId}-${key}`, value);
  } catch {
    /* ignore */
  }
  emitStatusChange();
}

/** 清除指定宠物的单项记录，回到未记录状态 */
export function clearStatus(petId: string, key: string): void {
  try {
    localStorage.removeItem(`petpal-status-${petId}-${key}`);
  } catch {
    /* ignore */
  }
  emitStatusChange();
}

/** 同页签内广播状态变更（storage 事件只在跨页签触发，同页签需自定义事件） */
export function emitStatusChange(): void {
  try {
    window.dispatchEvent(new CustomEvent(STATUS_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

/** 订阅状态变更，返回取消订阅函数 */
export function subscribeStatusChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(STATUS_CHANGE_EVENT, handler);
  return () => window.removeEventListener(STATUS_CHANGE_EVENT, handler);
}

/* ============================================================
 * 记录项定义（今日状态卡片 / 今日快速记录共用）
 * 默认 5 项固定，用户可在健康档案「记录项选择」页新增/移除自定义项，
 * 自定义项存于 localStorage petpal-status-defs，两处动态读取保持一致。
 * ============================================================ */

export interface StatusDef {
  key: string;         // localStorage 记录标识
  title: string;       // 标题
  unit: string;        // 记录单位
  placeholder: string; // 输入框提示
  defaultValue: string;// 未记录时展示文案
  fullRow?: boolean;   // 是否独占整行（睡眠）
}

// 默认 5 项（对应导出稿初始视觉）
const DEFAULT_DEFS: StatusDef[] = [
  { key: "food", title: "饮食", unit: "餐", placeholder: "例如：3", defaultValue: "点击记录" },
  { key: "water", title: "饮水", unit: "ml", placeholder: "例如：200", defaultValue: "点击记录" },
  { key: "poop", title: "排便", unit: "次", placeholder: "例如：2", defaultValue: "点击记录" },
  { key: "exercise", title: "运动", unit: "分钟", placeholder: "例如：30", defaultValue: "点击记录" },
  { key: "sleep", title: "睡眠", unit: "小时", placeholder: "例如：8", defaultValue: "点击记录", fullRow: true },
];

const DEFS_KEY = "petpal-status-defs";

// 被隐藏的默认记录项 key（用户可在「记录项选择」页移除/恢复，首页与档案两处联动）
const HIDDEN_KEY = "petpal-status-hidden-defaults";

export function getHiddenDefaultKeys(): string[] {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setHiddenDefaultKeys(keys: string[]): void {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(keys));
  } catch {
    /* ignore */
  }
}

/** 隐藏一个默认记录项（保留其记录值，仅不再显示；可随时恢复） */
export function hideDefaultDef(key: string): void {
  const cur = getHiddenDefaultKeys();
  if (!cur.includes(key)) setHiddenDefaultKeys([...cur, key]);
  emitStatusChange();
}

/** 恢复一个被隐藏的默认记录项 */
export function restoreDefaultDef(key: string): void {
  setHiddenDefaultKeys(getHiddenDefaultKeys().filter((k) => k !== key));
  emitStatusChange();
}

export function getDefaultDefs(): StatusDef[] {
  return DEFAULT_DEFS.map((d) => ({ ...d }));
}

function loadCustomDefs(): StatusDef[] {
  try {
    const raw = localStorage.getItem(DEFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCustomDefs(): StatusDef[] {
  return loadCustomDefs();
}

// 全部记录项（启用的默认项 + 自定义）
export function getStatusDefs(): StatusDef[] {
  const hidden = getHiddenDefaultKeys();
  const visibleDefaults = DEFAULT_DEFS.filter((d) => !hidden.includes(d.key));
  return [...visibleDefaults, ...loadCustomDefs()];
}

// 新增自定义记录项，返回带 key 的完整 def
export function addStatusDef(def: Omit<StatusDef, "key">): StatusDef {
  const custom = loadCustomDefs();
  const key = `c${Date.now().toString(36)}${custom.length}`;
  const full: StatusDef = { ...def, key };
  custom.push(full);
  try {
    localStorage.setItem(DEFS_KEY, JSON.stringify(custom));
  } catch {
    /* ignore */
  }
  emitStatusChange();
  return full;
}

// 移除自定义记录项（定义移除后各宠物不再显示该项；其历史记录值残留无害），默认项不可移除
export function removeStatusDef(key: string): void {
  const custom = loadCustomDefs().filter((d) => d.key !== key);
  try {
    localStorage.setItem(DEFS_KEY, JSON.stringify(custom));
  } catch {
    /* ignore */
  }
  emitStatusChange();
}

/* ============================================================
 * 宠物健康指标 → 每日记录项
 * 当前宠物的健康指标（体重/体温/笼温/光照等，按宠物类型预设+可自定义）
 * 作为记录项注入「今日状态」，用户可每日记录；首页宠物卡数据三格显示该指标
 * 的最新记录值。记录 key 带宠物 id，天然按宠物隔离，契合后端 petId 迁移方向。
 * ============================================================ */

// 当前宠物指标生成记录项（key: pm-<label>，配合 getStatus(petId, key) 按宠物隔离读写）
export function getPetMetricDefs(): StatusDef[] {
  const pet = getCurrentPet();
  if (!pet || !Array.isArray(pet.metrics)) return [];
  return pet.metrics
    .filter((m) => m && m.label && m.label !== "--")
    .map((m) => ({
      key: `pm-${m.label}`,
      title: m.label,
      unit: m.unit || "",
      placeholder: `例如：记录今天的${m.label}`,
      defaultValue: m.value && m.value !== "--" ? m.value : "点击记录",
    }));
}

// 读取某宠物某指标的最新记录值（petpal-status-<petId>-pm-<label>）；无记录返回 null
export function getPetMetricRecord(petId: string, label: string): string | null {
  try {
    const raw = localStorage.getItem(`petpal-status-${petId}-pm-${label}`);
    if (raw === null || raw === "") return null;
    return raw;
  } catch {
    return null;
  }
}

// 记录某宠物某指标的值
export function setPetMetricRecord(petId: string, label: string, value: string): void {
  try {
    localStorage.setItem(`petpal-status-${petId}-pm-${label}`, value);
  } catch {
    /* ignore */
  }
  emitStatusChange();
}
