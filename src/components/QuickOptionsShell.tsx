import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "@/styles/archive.css";
import {
  getDefaultDefs,
  getCustomDefs,
  getHiddenDefaultKeys,
  addStatusDef,
  removeStatusDef,
  hideDefaultDef,
  restoreDefaultDef,
  subscribeStatusChange,
} from "@/utils/statusStore";
import icPlus from "@/assets/images/archive/icon-plus-gray.png";
import icCheck from "@/assets/images/archive/icon-check.png";

// 其他可选的记录项（用户点选即加入「今日快速记录 / 首页今日状态」）
const CANDIDATES: { title: string; unit: string }[] = [
  { title: "体温", unit: "°C" },
  { title: "喂药", unit: "次" },
  { title: "洗澡", unit: "次" },
  { title: "美容", unit: "次" },
  { title: "驱虫", unit: "次" },
  { title: "体重", unit: "kg" },
];

export default function QuickOptionsShell() {
  const navigate = useNavigate();
  const [customs, setCustoms] = useState<any[]>(() => getCustomDefs());
  const [hiddenKeys, setHiddenKeys] = useState<string[]>(() => getHiddenDefaultKeys());
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeStatusChange(() => {
      setCustoms(getCustomDefs());
      setHiddenKeys(getHiddenDefaultKeys());
    });
    return unsub;
  }, []);

  const defaults = getDefaultDefs();

  const enabledTitles = new Set([
    ...defaults.filter((d) => !hiddenKeys.includes(d.key)).map((d) => d.title),
    ...customs.map((c) => c.title),
  ]);

  const hiddenDefaults = defaults.filter((d) => hiddenKeys.includes(d.key));

  const addCandidate = (title: string, unit: string) => {
    addStatusDef({ title, unit, placeholder: `例如：${unit === "°C" ? "38.5" : "1"}`, defaultValue: "点击记录" });
  };

  const addCustom = () => {
    const t = name.trim();
    if (!t) {
      setError("请填写记录名称");
      return;
    }
    const u = unit.trim() || "次";
    addStatusDef({ title: t, unit: u, placeholder: `例如：${u}`, defaultValue: "点击记录" });
    setError("");
    setName("");
    setUnit("");
  };

  const remove = (key: string) => {
    removeStatusDef(key);
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
          <h1 className="ar-title">选择记录项</h1>
        </header>

        <div className="ar-scroll qo-scroll">
          <p className="qo-hint">勾选的记录项会出现在「记录页 · 今日快速记录」和「首页 · 今日状态」。</p>

          {/* 已启用记录项 */}
          <section className="qo-block">
            <h2 className="qo-block-title">已启用记录项</h2>
            <ul className="qo-list">
              {defaults.filter((d) => !hiddenKeys.includes(d.key)).map((d) => (
                <li className="qo-item" key={d.key}>
                  <span className="qo-item-state on"><img src={icCheck} alt="" /></span>
                  <span className="qo-item-name">{d.title}</span>
                  <span className="qo-item-unit">{d.unit}</span>
                  <button className="qo-item-del" onClick={() => hideDefaultDef(d.key)} aria-label="移除">×</button>
                </li>
              ))}
              {customs.map((c) => (
                <li className="qo-item" key={c.key}>
                  <span className="qo-item-state on"><img src={icCheck} alt="" /></span>
                  <span className="qo-item-name">{c.title}</span>
                  <span className="qo-item-unit">{c.unit}</span>
                  <button className="qo-item-del" onClick={() => remove(c.key)} aria-label="移除">×</button>
                </li>
              ))}
              {defaults.filter((d) => !hiddenKeys.includes(d.key)).length === 0 && customs.length === 0 && (
                <li className="qo-item-empty">暂无启用项，可从下方添加</li>
              )}
            </ul>
          </section>

          {/* 已隐藏记录项（可恢复） */}
          {hiddenDefaults.length > 0 && (
            <section className="qo-block">
              <h2 className="qo-block-title">已隐藏记录项</h2>
              <ul className="qo-list">
                {hiddenDefaults.map((d) => (
                  <li className="qo-item qo-hidden" key={d.key}>
                    <span className="qo-item-state off"><img src={icPlus} alt="" /></span>
                    <span className="qo-item-name">{d.title}</span>
                    <span className="qo-item-unit">{d.unit}</span>
                    <button className="qo-item-restore" onClick={() => restoreDefaultDef(d.key)}>恢复</button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 其他可选记录项 */}
          <section className="qo-block">
            <h2 className="qo-block-title">添加其他记录项</h2>
            <ul className="qo-list">
              {CANDIDATES.map((c) => {
                const on = enabledTitles.has(c.title);
                return (
                  <li
                    className={"qo-item" + (on ? " disabled" : "")}
                    key={c.title}
                    onClick={() => !on && addCandidate(c.title, c.unit)}
                  >
                    <span className={"qo-item-state" + (on ? " on" : "")}>
                      {on ? <img src={icCheck} alt="" /> : <img src={icPlus} alt="" />}
                    </span>
                    <span className="qo-item-name">{c.title}</span>
                    <span className="qo-item-unit">{c.unit}</span>
                    {on && <span className="qo-item-flag">已添加</span>}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* 自定义记录项 */}
          <section className="qo-block">
            <h2 className="qo-block-title">自定义记录项</h2>
            <div className="qo-custom">
              <input
                className="qo-input"
                placeholder="记录名称（如：遛弯）"
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
              />
              <input
                className="qo-input qo-input-unit"
                placeholder="单位（如：分钟）"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
              <button className="qo-add" onClick={addCustom}>＋ 添加</button>
              {error && (
                <p style={{ width: "100%", margin: "6px 0 0", fontSize: 12, color: "#d64545" }}>{error}</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
