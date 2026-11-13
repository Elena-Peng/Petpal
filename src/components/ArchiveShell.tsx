import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import "@/styles/archive.css";
import "@/styles/home-adapt.css"; // 复用今日状态记录弹窗样式
import {
  getStatus,
  setStatus,
  clearStatus,
  setPetMetricRecord,
  subscribeStatusChange,
  ensureSeed,
  getStatusDefs,
  getDefaultDefs,
} from "@/utils/statusStore";
import {
  getHealthRecords,
  addHealthRecord,
  getWeightSeries,
  computeHealthScore,
  getStreakDays,
  typeLabel,
  recordMetricChanges,
} from "@/utils/healthStore";
import {
  getCurrentPet,
  getPetType,
  savePet,
  PET_SWITCH_EVENT,
  type Pet,
} from "@/utils/petStore";

// 档案页线性图标素材
import icCheck from "@/assets/images/archive/icon-check.png";
import icPlus from "@/assets/images/archive/icon-plus-gray.png";
import icBone from "@/assets/images/archive/icon-bone.png";
import icWater from "@/assets/images/archive/icon-water-drop.png";
import icWave from "@/assets/images/archive/icon-wave-dark.png";
import icPaw from "@/assets/images/archive/icon-paw.png";
import icClock from "@/assets/images/archive/icon-clock-green.png";
import icWeight from "@/assets/images/archive/icon-weight-wave.png";
import icShield from "@/assets/images/archive/icon-shield-cyan.png";
import icSteth from "@/assets/images/archive/icon-stethoscope-pink.png";
import icSyringe from "@/assets/images/archive/icon-syringe-orange.png";
// 报告 Tab 深绿统一图标
import icStethDark from "@/assets/images/archive/ic-steth-dark.png";
import icBook from "@/assets/images/archive/ic-book.png";
import icSyringeDark from "@/assets/images/archive/ic-syringe-dark.png";
import icWave2 from "@/assets/images/archive/ic-wave2-dark.png";
import icHeartPulse from "@/assets/images/archive/ic-heart-pulse.png";
import icShieldDark from "@/assets/images/archive/ic-shield-dark.png";

const TABS = ["概览", "记录", "报告"];
// 分类筛选动态生成（全部 + 健康记录中出现的类型）

// 今日快速记录：默认项图标/底色（自定义项使用统一默认样式）
const QUICK_ICONS: Record<string, string> = {
  food: icBone,
  water: icWater,
  poop: icWave,
  exercise: icPaw,
  sleep: icClock,
};
const QUICK_TINTS: Record<string, string> = {
  food: "#e4f5d8",
  water: "#e8f3fb",
  poop: "#f3ecec",
  exercise: "#e4f5d8",
  sleep: "#fdf1dd",
};
const QUICK_DEFAULT_TINT = "#eef7e6";
const QUICK_DEFAULT_ICON = icWeight;

// 健康记录 → 记录页列表的图标/底色映射
const LOG_ICONS: Record<string, string> = {
  weight: icWeight,
  care: icShield,
  medical: icSteth,
};
const LOG_TINTS: Record<string, string> = {
  weight: "#e4f5d8",
  care: "#e3f0fb",
  medical: "#fdeaf1",
};
const LOG_DEFAULT_TINT = "#eef7e6";
const LOG_DEFAULT_ICON = icWeight;

const R = 34;
const CIRC = 2 * Math.PI * R;

const pad = (n: number) => String(n).padStart(2, "0");

// 体重记录缺值（空数值 / 仅残留单位 / 历史脏数据"更新为 kg"）时兜底，避免单位裸露
function isEmptyWeight(r: { type: string; value?: string; title: string }): boolean {
  if (r.type !== "weight") return false;
  const v = String(r.value ?? "").trim();
  return !v || /^kg$/i.test(v) || /更新为\s*kg/i.test(r.title);
}
function weightTitle(r: { type: string; value?: string; title: string }): string {
  return isEmptyWeight(r) ? "暂无体重" : r.title;
}
const formatNow = () => {
  const d = new Date();
  return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 体重折线：viewBox 340×120，y 越小越高，值域映射到 30..90
function toPolyline(points: { value: number }[]): string {
  const vals = points.map((p) => p.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const span = maxV - minV || 1;
  const n = points.length;
  return points
    .map((p, i) => {
      const x = n > 1 ? 8 + (i * 324) / (n - 1) : 170;
      const y = 90 - ((p.value - minV) / span) * 60;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(" ");
}

export default function ArchiveShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => Number(searchParams.get("tab")) || 0);
  const [filter, setFilter] = useState(0);
  // 健康记录刷新触发器（指标改值 / 新增记录后重算评分、折线与近期记录）
  const [, setHealthTick] = useState(0);

  // 当前宠物健康指标：健康档案内直接查看/编辑（不依赖宠物编辑页）
  const [pet, setPet] = useState<Pet | undefined>(() => getCurrentPet());
  const petId = pet?.id ?? "";
  useEffect(() => {
    const onSwitch = () => setPet(getCurrentPet());
    window.addEventListener(PET_SWITCH_EVENT, onSwitch);
    return () => window.removeEventListener(PET_SWITCH_EVENT, onSwitch);
  }, []);
  const petMetrics = pet && Array.isArray(pet.metrics) ? pet.metrics : [];
  const [metricModal, setMetricModal] = useState(false);
  const [metricRows, setMetricRows] = useState<{ label: string; value: string; unit: string }[]>([]);
  const openMetricModal = () => {
    let rows = petMetrics.map((m) => ({
      label: m.label,
      value: m.value && m.value !== "--" ? String(m.value) : "",
      unit: m.unit || "",
    }));
    // 犬/猫：去掉异宠专属指标（笼温/光照/湿度），确保含 体重 + 体温
    const pt = getPetType(pet);
    if (pt === "犬" || pt === "猫") {
      rows = rows.filter((m) => !["笼温", "光照", "湿度", "箱温"].includes(m.label));
      if (!rows.some((m) => m.label === "体重")) rows.unshift({ label: "体重", value: "", unit: "kg" });
      if (!rows.some((m) => m.label === "体温")) rows.push({ label: "体温", value: "", unit: "℃" });
    }
    setMetricRows(rows);
    setMetricModal(true);
  };
  const saveMetrics = () => {
    if (!pet) return;
    const prevMetrics = (pet.metrics || []).map((m) => ({
      label: m.label || "",
      value: String(m.value ?? ""),
      unit: m.unit || "",
    }));
    const updated: Pet = {
      ...pet,
      metrics: metricRows.map((m) => ({
        label: m.label.trim() || "指标",
        value: m.value.trim() || "--",
        unit: m.unit.trim() || "",
      })),
    };
    // 指标改值 → 同步写入健康记录，让「近期记录」也能看到这次变化
    recordMetricChanges(
      pet.id,
      prevMetrics,
      updated.metrics.map((m) => ({ label: m.label, value: m.value, unit: m.unit }))
    );
    savePet(updated);
    setPet(updated);
    setHealthTick((t) => t + 1);
    setMetricModal(false);
  };

  // 返回：优先来源页 state.from（仅当为有效路由路径时），否则兜底回首页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from.startsWith("/") ? from : "/");
  };

  // 今日快速记录：与首页「今日状态」共享数据 + 动态记录项（默认+自定义）
  const quickDefs = getStatusDefs();
  const [quick, setQuick] = useState<Record<string, { value: string; done: boolean }>>(() => {
    ensureSeed(petId);
    const init: Record<string, { value: string; done: boolean }> = {};
    getStatusDefs().forEach((q) => {
      const rec = getStatus(petId, q.key);
      if (rec) init[q.key] = rec;
    });
    return init;
  });

  // 健康记录数据（评分/体重/记录列表/报告共用；按宠物隔离）
  const records = getHealthRecords(petId);
  const scoreInfo = computeHealthScore(petId);
  const streak = getStreakDays(petId);
  const { points: weightPoints, current: currentWeight, change: weightChange } = getWeightSeries(petId);

  // 记录弹窗（今日快速记录）
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [input, setInput] = useState("");

  // 添加健康记录弹窗
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<string>("weight");
  const [addTypeName, setAddTypeName] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addSub, setAddSub] = useState("");
  const [addValue, setAddValue] = useState("");

  // 从首页宠物卡数据三格进入时：自动弹出「添加健康记录」，登记后同步更新宠物卡
  useEffect(() => {
    const st = location.state as { autoAddHealth?: boolean } | null;
    if (st?.autoAddHealth) {
      setAddOpen(true);
      // 清除标记，避免刷新/返回重复弹出
      window.history.replaceState({}, "", window.location.pathname + "?tab=0");
    }
  }, [location.state]);

  // 订阅共享状态变更（首页/档案页互相同步 + 自定义记录项增删）
  useEffect(() => {
    const unsub = subscribeStatusChange(() => {
      setQuick((prev) => {
        const next: Record<string, { value: string; done: boolean }> = { ...prev };
        getStatusDefs().forEach((q) => {
          const rec = getStatus(petId, q.key);
          if (rec) next[q.key] = rec;
          else delete next[q.key];
        });
        return next;
      });
      setHealthTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const openQuick = (key: string) => {
    const rec = getStatus(petId, key);
    setActiveKey(key);
    setInput(rec?.value || "");
  };

  const saveQuick = () => {
    if (activeKey === null) return;
    const value = input.trim() || "1";
    setStatus(petId, activeKey, value);
    setQuick((prev) => ({ ...prev, [activeKey!]: { value, done: true } }));
    setActiveKey(null);
    setInput("");
  };

  const clearQuick = () => {
    if (activeKey === null) return;
    clearStatus(petId, activeKey);
    setQuick((prev) => {
      const next = { ...prev };
      delete next[activeKey!];
      return next;
    });
    setActiveKey(null);
    setInput("");
  };

  const activeItem = activeKey ? quickDefs.find((q) => q.key === activeKey) : null;
  const activeDone = activeKey ? !!getStatus(petId, activeKey) : false;
  const doneCount = quickDefs.filter((q) => getStatus(petId, q.key)).length;

  // 记录页分类筛选（动态：全部 + 出现过的类型）
  const typeOptions = Array.from(new Set(records.map((r) => typeLabel(r.type))));
  const filters = ["全部", ...typeOptions];
  const typeFilter = filters[filter] ?? "全部";
  const filteredLogs =
    typeFilter === "全部"
      ? records
      : records.filter((r) => typeLabel(r.type) === typeFilter);

  // 添加健康记录
  const saveHealth = () => {
    let type = addType;
    if (addType === "custom") type = addTypeName.trim() || "其他";
    let title = addTitle.trim();
    let sub = addSub.trim();
    let value = addValue.trim();
    if (type === "weight") {
      const kg = value;
      if (kg) {
        title = `体重更新为 ${kg} kg`;
        value = `${kg} kg`;
      } else {
        // 体重缺失：不渲染裸单位，标题兜底"暂无体重"
        title = "暂无体重";
        value = "";
      }
      sub = sub || "较上周变化 · 手动记录";
    } else if (type === "medical" && value) {
      title = title || "健康检查";
      sub = sub || "检查结果良好";
      value = `${value}分`;
    } else {
      title = title || (typeLabel(type) + "记录");
      sub = sub || "手动记录";
    }
    addHealthRecord(petId, { type, title, sub, value, date: formatNow() });
    // 同步首页宠物卡指标格：登记的数据写入该宠物对应指标的最新记录，宠物卡即时更新
    const mapLabel =
      type === "weight" ? "体重"
      : type === "custom" ? (addTypeName.trim() || "")
      : "";
    const num = value.replace(/[^\d.]/g, "");
    if (mapLabel && num) {
      setPetMetricRecord(petId, mapLabel, num);
    }
    setAddOpen(false);
    setAddType("weight");
    setAddTypeName("");
    setAddTitle("");
    setAddSub("");
    setAddValue("");
    setHealthTick((t) => t + 1);
  };

  // 报告页指标
  const exerciseRec = getStatus(petId, "exercise");
  const careCount = records.filter((r) => r.type === "care").length;
  const medicalCount = records.filter((r) => r.type === "medical").length;
  const activityText = exerciseRec ? `${exerciseRec.value} 分钟` : "73 分钟";
  const careText = careCount > 0 ? "驱虫记录已完成" : "暂无护理记录";
  const month = `${new Date().getFullYear()}.${pad(new Date().getMonth() + 1)}.${pad(new Date().getDate())}`;

  // 导出完整健康报告
  const exportReport = () => {
    const lines = [
      "=== PetPal 健康报告 ===",
      `综合健康评分：${scoreInfo.score}/100（${scoreInfo.status}）`,
      `当前体重：${currentWeight} kg（近30天 ${weightChange > 0 ? "+" : ""}${weightChange} kg）`,
      `今日记录完成：${doneCount}/${quickDefs.length} 项`,
      `健康记录：${records.length} 条（体重 ${records.filter((r) => r.type === "weight").length} / 护理 ${careCount} / 医疗 ${medicalCount}）`,
      "",
      "--- 健康记录明细 ---",
      ...records.slice(0, 20).map((r) => `${r.date}｜${r.title}${r.sub ? " · " + r.sub : ""}`),
      "",
      "生成时间：" + new Date().toLocaleString(),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "petpal-health-report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ar-stage">
      <div className="ar-canvas">
        <header className="ar-topbar">
          <button className="ar-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="ar-title">健康档案</h1>
        </header>

        <div className="ar-scroll">
          {/* 综合健康评分卡（三 Tab 共用，动态计算） */}
          <section className="ar-score-card">
            <div className="ar-score-left">
              <p className="ar-score-label">综合健康评分</p>
              <p className="ar-score-num">
                <b>{scoreInfo.score}</b>
                <span>/100</span>
              </p>
              <p className="ar-score-status">{scoreInfo.status}，已连续记录{streak}天</p>
            </div>
            <svg className="ar-ring" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r={R} className="ar-ring-bg" />
              <circle
                cx="42"
                cy="42"
                r={R}
                className="ar-ring-val"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC - (scoreInfo.score / 100) * CIRC}
                transform="rotate(-90 42 42)"
              />
              <text x="42" y="47" textAnchor="middle" className="ar-ring-num">
                {scoreInfo.score}
              </text>
            </svg>
          </section>

          {/* Tab：概览 / 记录 / 报告 */}
          <div className="ar-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={"ar-tab" + (i === tab ? " active" : "")} onClick={() => setTab(i)}>
                {t}
              </button>
            ))}
          </div>

          {/* ===== 概览 ===== */}
          {tab === 0 && (
            <>
              <section className="ar-card ar-weight">
                <div className="ar-weight-head">
                  <span className="ar-weight-title">近 30 天体重</span>
                  <span className="ar-weight-tag">{weightChange > 0 ? "＋" : ""}{weightChange} kg</span>
                </div>
                <p className="ar-weight-value">
                  {currentWeight} <span>kg</span>
                </p>
                <svg className="ar-chart" viewBox="0 0 340 120" preserveAspectRatio="none">
                  <line x1="8" y1="30" x2="332" y2="30" className="ar-grid" />
                  <line x1="8" y1="58" x2="332" y2="58" className="ar-grid" />
                  <line x1="8" y1="86" x2="332" y2="86" className="ar-grid" />
                  <polyline points={toPolyline(weightPoints)} className="ar-line" />
                </svg>
                <div className="ar-xaxis">
                  {weightPoints.map((p, i) => (
                    <span key={i}>{p.label || ""}</span>
                  ))}
                </div>
              </section>

              <section className="ar-recent">
                <div className="ar-recent-head">
                  <h2>近期记录</h2>
                </div>
                <ul className="ar-timeline">
                  {records.slice(0, 3).map((r) => (
                    <li key={r.id}>
                      <div className="ar-tl-body">
                        <p className="ar-tl-title">{weightTitle(r)}</p>
                        <p className="ar-tl-meta">{r.date} · {typeLabel(r.type)}记录</p>
                      </div>
                    </li>
                  ))}
                  {records.length === 0 && (
                    <li className="ar-tl-empty">暂无健康记录，点下方按钮添加</li>
                  )}
                </ul>
              </section>

              <button className="ar-add-btn" onClick={() => setAddOpen(true)}>＋ 添加健康记录</button>
            </>
          )}

          {/* ===== 记录 ===== */}
          {tab === 1 && (
            <>
              {/* 健康指标：记录界面简单入口，点击进入独立管理页 */}
              <section className="ar-metrics-entry" onClick={() => navigate("/archive/metrics")}>
                <span className="ar-metrics-entry-title">健康指标</span>
                <span className="ar-metrics-entry-sum">
                  {petMetrics.length
                    ? petMetrics.map((m) => `${m.value}${m.unit || ""}·${m.label}`).join("、")
                    : "未设置"}
                </span>
                <span className="ar-metrics-entry-arrow">›</span>
              </section>

              <section className="ar-quick-head">
                <h2>今日快速记录</h2>
                <div className="ar-quick-actions">
                  <button className="ar-quick-add" onClick={() => navigate("/archive/quick-options")}>＋ 记录选项</button>
                  <button className="ar-quick-more">{doneCount}/{quickDefs.length} 已完成 ›</button>
                </div>
              </section>

              <div className="ar-quick-grid">
                {quickDefs.map((q) => {
                  const rec = quick[q.key];
                  const done = !!rec?.done;
                  return (
                    <button
                      className="ar-quick-item"
                      key={q.key}
                      onClick={() => openQuick(q.key)}
                    >
                      <span className="ar-quick-icon" style={{ background: QUICK_TINTS[q.key] || QUICK_DEFAULT_TINT }}>
                        <img src={QUICK_ICONS[q.key] || QUICK_DEFAULT_ICON} alt="" />
                      </span>
                      <span className="ar-quick-text">
                        <b>{q.title}</b>
                        <small>{done ? `${rec.value}${q.unit}` : "点击记录"}</small>
                      </span>
                      <img
                        className={"ar-quick-state" + (done ? " done" : "")}
                        src={done ? icCheck : icPlus}
                        alt=""
                      />
                    </button>
                  );
                })}
              </div>

              <div className="ar-filters">
                {filters.map((f, i) => {
                  const count =
                    f === "全部"
                      ? records.length
                      : records.filter((r) => typeLabel(r.type) === f).length;
                  return (
                    <button
                      key={f}
                      className={"ar-filter-chip" + (i === filter ? " active" : "")}
                      onClick={() => setFilter(i)}
                    >
                      {f} {count > 0 && <em>{count}</em>}
                    </button>
                  );
                })}
              </div>

              <div className="ar-log">
                {filteredLogs.map((l) => (
                  <div className="ar-log-item" key={l.id}>
                    <span className="ar-log-icon" style={{ background: LOG_TINTS[l.type] || LOG_DEFAULT_TINT }}>
                      <img src={LOG_ICONS[l.type] || LOG_DEFAULT_ICON} alt="" />
                    </span>
                    <div className="ar-log-main">
                      <small className="ar-log-time">{l.date}</small>
                      <b className="ar-log-title">{weightTitle(l)}</b>
                      <small className="ar-log-sub">{l.sub}</small>
                    </div>
                    <span className={"ar-log-tag" + (l.value ? " link" : "")}>
                      {l.value || "已完成"}{l.value && " ›"}
                    </span>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="ar-log-empty">{typeFilter}分类暂无记录</div>
                )}
              </div>
            </>
          )}

          {/* ===== 报告 ===== */}
          {tab === 2 && (
            <>
              <section className="ar-report-banner">
                <div className="ar-banner-left">
                  <p className="ar-banner-en">AUGUST HEALTH REPORT</p>
                  <h2>本月健康表现{scoreInfo.score >= 80 ? "稳定" : scoreInfo.score >= 60 ? "平稳" : "需关注"}</h2>
                  <p className="ar-banner-desc">
                    {scoreInfo.status}。体重变化处于正常范围，运动量达标。
                    {medicalCount > 0 && `已有 ${medicalCount} 条医疗记录，建议按时复查。`}
                  </p>
                </div>
                <svg className="ar-banner-ring" viewBox="0 0 84 84">
                  <circle cx="42" cy="42" r={R} className="ar-banner-ring-bg" />
                  <circle
                    cx="42"
                    cy="42"
                    r={R}
                    className="ar-banner-ring-val"
                    strokeDasharray={CIRC}
                    strokeDashoffset={CIRC - (scoreInfo.score / 100) * CIRC}
                    transform="rotate(-90 42 42)"
                  />
                  <text x="42" y="47" textAnchor="middle" className="ar-banner-ring-num">
                    {scoreInfo.score}
                  </text>
                </svg>
              </section>

              <div className="ar-metrics">
                <div className="ar-metric">
                  <span className="ar-metric-icon"><img src={icWave2} alt="" /></span>
                  <b>体重稳定</b>
                  <small>近30天 {weightChange > 0 ? "+" : ""}{weightChange}kg</small>
                </div>
                <div className="ar-metric">
                  <span className="ar-metric-icon"><img src={icHeartPulse} alt="" /></span>
                  <b>活动达标</b>
                  <small>平均每日{activityText}</small>
                </div>
                <div className="ar-metric">
                  <span className="ar-metric-icon"><img src={icShieldDark} alt="" /></span>
                  <b>护理正常</b>
                  <small>{careText}</small>
                </div>
              </div>

              <section className="ar-reports">
                <div className="ar-reports-head">
                  <h2>全部报告</h2>
                  <button className="ar-reports-more" onClick={() => setTab(1)}>查看记录 ›</button>
                </div>
                <div className="ar-report-item">
                  <span className="ar-report-icon"><img src={icBook} alt="" /></span>
                  <div className="ar-report-main">
                    <b className="ar-report-title">本月健康月报</b>
                    <small className="ar-report-sub">体重、运动、睡眠与护理趋势</small>
                    <small className="ar-report-date">{month}</small>
                  </div>
                  <span className="ar-report-tag good">最新 ›</span>
                </div>
                <div className="ar-report-item">
                  <span className="ar-report-icon"><img src={icSyringeDark} alt="" /></span>
                  <div className="ar-report-main">
                    <b className="ar-report-title">疫苗与驱虫记录</b>
                    <small className="ar-report-sub">{careCount + medicalCount}条有效记录·{medicalCount}项医疗</small>
                    <small className="ar-report-date">{records.length ? records[0].date : month}</small>
                  </div>
                  <span className="ar-report-tag warn">需关注 ›</span>
                </div>
                <div className="ar-report-item">
                  <span className="ar-report-icon"><img src={icStethDark} alt="" /></span>
                  <div className="ar-report-main">
                    <b className="ar-report-title">年度健康体检报告</b>
                    <small className="ar-report-sub">血常规、基础检查与医生建议</small>
                    <small className="ar-report-date">{month}</small>
                  </div>
                  <span className="ar-report-tag good">良好 ›</span>
                </div>
              </section>

              <button className="ar-export-btn" onClick={exportReport}>📋 导出完整健康报告</button>
            </>
          )}

          {/* 今日快速记录弹窗（与首页今日状态共用数据） */}
          {activeItem && (
            <div className="status-modal-mask" onClick={() => setActiveKey(null)}>
              <div className="status-modal" onClick={(e) => e.stopPropagation()}>
                <div className="status-modal-title">{activeDone ? "修改" : "记录"}{activeItem.title}</div>
                <div className="status-modal-body">
                  <input
                    type="number"
                    className="status-modal-input"
                    placeholder={activeItem.placeholder}
                    value={input}
                    autoFocus
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveQuick(); }}
                  />
                  <span className="status-modal-unit">{activeItem.unit}</span>
                </div>
                <div className="status-modal-actions">
                  {activeDone && (
                    <button className="status-modal-clear" onClick={clearQuick}>清除记录</button>
                  )}
                  <button className="status-modal-cancel" onClick={() => setActiveKey(null)}>取消</button>
                  <button className="status-modal-save" onClick={saveQuick}>保存</button>
                </div>
              </div>
            </div>
          )}

          {/* 添加健康记录弹窗 */}
          {addOpen && (
            <div className="status-modal-mask" onClick={() => setAddOpen(false)}>
              <div className="status-modal" onClick={(e) => e.stopPropagation()}>
                <div className="status-modal-title">添加健康记录</div>
                <div className="ar-add-types">
                  {[{ value: "weight", label: "体重" }, { value: "care", label: "护理" }, { value: "medical", label: "医疗" }, { value: "custom", label: "其他" }].map((t) => (
                    <button
                      key={t.value}
                      className={"ar-add-type" + (addType === t.value ? " active" : "")}
                      onClick={() => setAddType(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {addType === "custom" && (
                  <div className="ar-add-custom-type">
                    <input
                      className="ar-add-input"
                      placeholder="类型名称（如：体温 / 睡眠时长）"
                      value={addTypeName}
                      onChange={(e) => setAddTypeName(e.target.value)}
                    />
                  </div>
                )}
                <div className="status-modal-body ar-add-body">
                  <input
                    className="ar-add-input"
                    placeholder={addType === "weight" ? "体重（kg）" : addType === "medical" ? "标题（如：年度体检）" : "标题（如：体外驱虫 / 睡眠时长）"}
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                  />
                  {addType !== "care" && (
                    <input
                      className="ar-add-input"
                      placeholder={addType === "weight" ? "数值（kg）" : addType === "medical" ? "分值（如：92）" : "数值（可选）"}
                      value={addValue}
                      onChange={(e) => setAddValue(e.target.value)}
                    />
                  )}
                  <input
                    className="ar-add-input"
                    placeholder="备注（如：大宠爱 / 萌爪动物医院）"
                    value={addSub}
                    onChange={(e) => setAddSub(e.target.value)}
                  />
                </div>
                <div className="status-modal-actions">
                  <button className="status-modal-cancel" onClick={() => setAddOpen(false)}>取消</button>
                  <button className="status-modal-save" onClick={saveHealth}>保存</button>
                </div>
              </div>
            </div>
          )}

          {/* 管理健康指标弹窗：增删/修改当前宠物指标（按类型预设 + 自定义） */}
          {metricModal && (
            <div className="status-modal-mask" onClick={() => setMetricModal(false)}>
              <div className="status-modal" onClick={(e) => e.stopPropagation()}>
                <div className="status-modal-title">管理健康指标</div>
                <div className="ar-metric-rows">
                  {metricRows.map((row, i) => (
                    <div className="ar-metric-row" key={i}>
                      <input className="ar-metric-input" placeholder="指标名" value={row.label} onChange={(e) => setMetricRows((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                      <input className="ar-metric-input" type="number" placeholder="数值" value={row.value} onChange={(e) => setMetricRows((p) => p.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                      <input className="ar-metric-input" placeholder="单位" value={row.unit} onChange={(e) => setMetricRows((p) => p.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))} />
                      <button className="ar-metric-del" onClick={() => setMetricRows((p) => p.filter((_, j) => j !== i))}>×</button>
                    </div>
                  ))}
                  <button className="ar-metric-add" onClick={() => setMetricRows((p) => [...p, { label: "", value: "", unit: "" }])}>＋ 添加指标</button>
                </div>
                <p className="ar-metric-tip">保存后首页宠物卡即时展示；值可在首页今日状态每日记录更新。</p>
                <div className="status-modal-actions">
                  <button className="status-modal-cancel" onClick={() => setMetricModal(false)}>取消</button>
                  <button className="status-modal-save" onClick={saveMetrics}>保存</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
