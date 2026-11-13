// 健康档案数据层：健康记录 + 综合健康评分 + 近30天体重
// 存储于 localStorage petpal-health-records，结构贴近未来后端表设计
// （records 表：id / type / title / sub / value / date / ts），便于后续迁移 API。

import { getStatusDefs, getStatus } from "@/utils/statusStore";

// 记录类型：默认 体重/护理/医疗，另支持用户自定义类型（如 体温、睡眠），
// 存为字符串，贴近后端 type 字段，可平滑迁移数据库。
export type HealthType = "weight" | "care" | "medical" | (string & {});

export const DEFAULT_HEALTH_TYPES: { value: string; label: string }[] = [
  { value: "weight", label: "体重" },
  { value: "care", label: "护理" },
  { value: "medical", label: "医疗" },
];

// 展示名称：默认三类有中文名，自定义类型直接用原名
export function typeLabel(t: string): string {
  switch (t) {
    case "weight": return "体重";
    case "care": return "护理";
    case "medical": return "医疗";
    default: return t;
  }
}

export interface HealthRecord {
  id: number;
  petId: string;    // 所属宠物（不同宠物独立数据库）
  type: HealthType;
  title: string;   // 主标题，如「体重更新为 26.4 kg」
  sub: string;     // 副标题，如「较上周增加 0.2 kg · 手动记录」
  value: string;   // 右侧标签，如「26.4 kg」
  date: string;    // 展示时间，如「今天 08:20」
  ts: number;      // 排序时间戳
}

const LEGACY_RECORDS_KEY = "petpal-health-records";
let idSeq = Date.now() % 100000;

function recordsKey(petId: string): string {
  return `petpal-health-records-${petId}`;
}

/** 读取指定宠物的健康记录；首次使用时迁移旧版全局记录到该宠物（避免演示数据丢失） */
export function getHealthRecords(petId: string): HealthRecord[] {
  try {
    const key = recordsKey(petId);
    let raw = localStorage.getItem(key);
    if (raw === null) {
      // 旧版全局记录（无 petId）：归属到该宠物并清空全局
      const legacy = localStorage.getItem(LEGACY_RECORDS_KEY);
      if (legacy !== null) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem(LEGACY_RECORDS_KEY);
        raw = legacy;
      }
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHealthRecord(
  petId: string,
  data: Omit<HealthRecord, "id" | "petId" | "ts">
): HealthRecord {
  const list = getHealthRecords(petId);
  const rec: HealthRecord = { ...data, petId, id: ++idSeq, ts: Date.now() };
  list.push(rec);
  list.sort((a, b) => b.ts - a.ts);
  try {
    localStorage.setItem(recordsKey(petId), JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return rec;
}

export function removeHealthRecord(petId: string, id: number): void {
  const list = getHealthRecords(petId).filter((r) => r.id !== id);
  try {
    localStorage.setItem(recordsKey(petId), JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/* ---------- 健康指标变更 → 自动写入健康记录 ---------- */

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 记录时间展示文案，与档案页「近期记录」保持一致（今天 HH:mm） */
export function formatRecordNow(): string {
  const d = new Date();
  return `今天 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export interface MetricLike {
  label: string;
  value: string;
  unit: string;
}

/**
 * 健康指标（体重/体温/笼温等）新增或改值时，自动追加一条健康记录，
 * 让「近期记录」能看到指标变化，而不是只在指标卡里留一个最新值。
 * 未变化、空值、占位值（--）不写入，避免重复刷记录。
 */
export function recordMetricChanges(
  petId: string,
  prev: MetricLike[] | undefined,
  next: MetricLike[]
): number {
  if (!petId || !Array.isArray(next)) return 0;
  const before = new Map(
    (prev || []).map((m) => [(m?.label || "").trim(), String(m?.value ?? "").trim()])
  );
  let added = 0;
  next.forEach((m) => {
    const label = (m?.label || "").trim();
    const val = String(m?.value ?? "").trim();
    if (!label || !val || val === "--") return;
    if (before.get(label) === val) return; // 值没变，不重复记录
    const unit = (m?.unit || "").trim();
    const type: HealthType = label === "体重" ? "weight" : label;
    addHealthRecord(petId, {
      type,
      title: `${label}更新为 ${val}${unit}`,
      sub: "健康指标 · 手动记录",
      value: unit ? `${val} ${unit}` : val,
      date: formatRecordNow(),
    });
    added += 1;
  });
  return added;
}

/* ---------- 近 30 天体重（折线） ---------- */

interface WeightPoint {
  value: number; // kg
  label: string; // 坐标轴标签
}

// 默认种子体重序列（用户未记录体重时展示，围绕 26.4kg 波动）
const SEED_WEIGHTS: WeightPoint[] = [
  { value: 26.4, label: "7/14" },
  { value: 26.5, label: "7/21" },
  { value: 26.2, label: "7/28" },
  { value: 26.3, label: "8/04" },
  { value: 26.4, label: "今天" },
];

// 折线横轴标签：带「今天 HH:mm」的记录取时间，其余取原日期片段
function pointLabel(date: string): string {
  const m = String(date ?? "").match(/(\d{1,2}:\d{2})/);
  if (m) return m[1];
  return String(date ?? "").slice(0, 5);
}

// 从指定宠物的健康记录(weight 类型)提取体重序列；无记录则返回种子
export function getWeightSeries(petId: string): { points: WeightPoint[]; current: number; change: number } {
  const weightRecs = getHealthRecords(petId).filter((r) => r.type === "weight");
  if (weightRecs.length === 0) {
    const cur = SEED_WEIGHTS[SEED_WEIGHTS.length - 1].value;
    return { points: SEED_WEIGHTS, current: cur, change: 0 };
  }
  // 取最近 5 条，倒序显示（旧→新）
  const recent = weightRecs.slice(0, 5).reverse();
  const points: WeightPoint[] = recent.map((r) => {
    const num = parseFloat(String(r.value).replace(/[^\d.]/g, "")) || 0;
    return { value: num, label: pointLabel(r.date) };
  });
  // 若不足 5 个点，补充种子前导点保证折线完整
  while (points.length < 5) {
    points.unshift({ value: SEED_WEIGHTS[SEED_WEIGHTS.length - points.length - 1].value, label: "" });
  }
  const current = points[points.length - 1].value;
  const first = points[0].value;
  return { points, current, change: Math.round((current - first) * 10) / 10 };
}

/* ---------- 综合健康评分（动态计算，非固定） ---------- */

// 依据：该宠物今日记录完成度 + 体重趋势 + 健康记录
// 返回 40-100 的整数评分与状态文案
export function computeHealthScore(petId: string): { score: number; status: string } {
  const defs = getStatusDefs();
  const total = defs.length;
  const done = defs.filter((d) => getStatus(petId, d.key) !== null).length;
  const completion = total > 0 ? done / total : 0;

  let score = 55 + Math.round(completion * 30); // 记录完成度权重
  if (total === 0) score = 60;

  // 体重趋势：有体重记录时按变化幅度加减
  const weightRecs = getHealthRecords(petId).filter((r) => r.type === "weight");
  if (weightRecs.length >= 2) {
    const vs = getWeightSeries(petId);
    const change = Math.abs(vs.change);
    if (change <= 0.5) score += 8;      // 稳定
    else if (change <= 2) score += 2;   // 小幅波动
    else score -= 8;                     // 明显变化
  }

  // 近期有健康记录（护理/医疗）加分
  const careCount = getHealthRecords(petId).filter((r) => r.type !== "weight").length;
  score += Math.min(careCount * 2, 10);

  score = Math.max(40, Math.min(100, score));

  let status: string;
  if (score >= 90) status = "状态优秀";
  else if (score >= 80) status = "状态良好";
  else if (score >= 70) status = "状态稳定";
  else status = "需要关注";

  return { score, status };
}

// 记录连续天数（简化：该宠物今日有任一记录视为连续，否则 0）
export function getStreakDays(petId: string): number {
  const defs = getStatusDefs();
  const anyDone = defs.some((d) => getStatus(petId, d.key) !== null);
  return anyDone ? 18 : 0;
}
