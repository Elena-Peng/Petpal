import { useState } from "react";
import { useNavigate } from "react-router";
import "@/styles/archive.css";
import {
  getCurrentPet,
  getPetType,
  savePet,
  PET_SWITCH_EVENT,
} from "@/utils/petStore";
import { recordMetricChanges } from "@/utils/healthStore";

// 健康指标独立管理页（从健康档案「记录」tab 顶部入口进入）
export default function HealthMetricsShell() {
  const navigate = useNavigate();
  const pet = getCurrentPet();

  const [rows, setRows] = useState(() => {
    let r = (pet?.metrics || []).map((m) => ({
      label: m.label,
      value: m.value && m.value !== "--" ? String(m.value) : "",
      unit: m.unit || "",
    }));
    // 犬/猫：去掉异宠专属指标（笼温/光照/湿度），确保含 体重 + 体温
    const pt = getPetType(pet);
    if (pt === "犬" || pt === "猫") {
      r = r.filter((x) => !["笼温", "光照", "湿度", "箱温"].includes(x.label));
      if (!r.some((x) => x.label === "体重")) r.unshift({ label: "体重", value: "", unit: "kg" });
      if (!r.some((x) => x.label === "体温")) r.push({ label: "体温", value: "", unit: "℃" });
    }
    return r;
  });

  const changeRow = (i: number, k: "label" | "value" | "unit", v: string) =>
    setRows((prev) => prev.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const delRow = (i: number) => setRows((prev) => prev.filter((_, j) => j !== i));
  const addRow = () => setRows((prev) => [...prev, { label: "", value: "", unit: "" }]);

  const save = () => {
    if (!pet) return;
    const next = rows.map((m) => ({
      label: m.label.trim() || "指标",
      value: m.value.trim() || "--",
      unit: m.unit.trim() || "",
    }));
    // 指标新增/改值 → 自动写一条健康记录，「近期记录」能看到这次变化
    recordMetricChanges(
      pet.id,
      (pet.metrics || []).map((m) => ({
        label: m.label || "",
        value: String(m.value ?? ""),
        unit: m.unit || "",
      })),
      next
    );
    savePet({ ...pet, metrics: next });
    window.dispatchEvent(new CustomEvent(PET_SWITCH_EVENT));
    navigate("/archive?tab=1");
  };

  return (
    <div className="ar-stage">
      <div className="ar-canvas">
        <header className="ar-topbar">
          <button className="ar-back" onClick={() => navigate(-1)} aria-label="返回">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="ar-title">健康指标</h1>
        </header>

        <div className="ar-scroll qo-scroll">
          <p className="qo-hint">指标按宠物类型预设（犬/猫：体重、体温；异宠：体重、笼温、光照、湿度），可自行增删自定义。保存后首页宠物卡即时展示，值可在首页今日状态每日记录更新。</p>

          <section className="qo-block">
            <h2 className="qo-block-title">{pet?.name || "宠物"} 的健康指标</h2>
            <div className="hm-rows">
              {rows.map((m, i) => (
                <div className="hm-row" key={i}>
                  <input
                    className="ar-metric-input"
                    value={m.label}
                    placeholder="指标名"
                    onChange={(e) => changeRow(i, "label", e.target.value)}
                  />
                  <input
                    className="ar-metric-input"
                    type="number"
                    inputMode="decimal"
                    value={m.value}
                    placeholder="数值"
                    onChange={(e) => changeRow(i, "value", e.target.value)}
                  />
                  <input
                    className="ar-metric-input hm-unit"
                    value={m.unit}
                    placeholder="单位"
                    onChange={(e) => changeRow(i, "unit", e.target.value)}
                  />
                  <button className="ar-metric-del" onClick={() => delRow(i)} aria-label="删除该指标">×</button>
                </div>
              ))}
              {rows.length === 0 && <div className="qo-item-empty">暂无健康指标，点下方「＋ 添加指标」新增</div>}
            </div>
            <button className="ar-metric-add" onClick={addRow}>＋ 添加指标</button>
          </section>

          <button className="hm-save" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
}
