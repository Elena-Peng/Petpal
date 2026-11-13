import { useState, useEffect } from "react";
import "@/styles/home-adapt.css";
import { getStatus, setStatus, clearStatus, ensureSeed, getStatusDefs, subscribeStatusChange } from "@/utils/statusStore";
import { PET_SWITCH_EVENT, getCurrentPet } from "@/utils/petStore";

/* 今日状态卡片：真正的 React 可点击元素，点击弹出 Modal 记录窗口，记录后加号变勾、状态文字变化
 * 记录项定义来自共享 getStatusDefs()（默认 5 项 + 健康档案「记录项选择」页自定义项），
 * 与健康档案「今日快速记录」完全联动；首页 grid 两列布局自动适应任意数量的卡片，fullRow 独占整行。 */

import iconFood from "@/assets/images/0f39b776e4f20737fc2ca259a5c33e43ef7685c7.png";
import iconWater from "@/assets/images/330c840b768eb7e5fce82c0ec7ecd58bc4bab32e.png";
import iconPoop from "@/assets/images/58dcd39e1df749b76a4732ada297742167783c40.png";
import iconExercise from "@/assets/images/liulanjilu2.png";
import iconSleep from "@/assets/images/d68e141f862ca51d348761ebf29768bb3efc49a7.png";
import iconCheck from "@/assets/images/b3d73e72e2558b5680a431be826b4a7ab404593f.png";
import iconPlus from "@/assets/images/8a20b02d75070450aa0b36e706833db205bd5d4c.png";
// 自定义记录项统一图标（不与默认5项：骨/水滴/波纹/爪/时钟 重复）
import iconCustom from "@/assets/images/archive/icon-weight-wave.png";

// 默认项的固定图标；自定义项使用统一独立图标（避免与默认项图标重复）
const DEFAULT_ICONS: Record<string, string> = {
  food: iconFood,
  water: iconWater,
  poop: iconPoop,
  exercise: iconExercise,
  sleep: iconSleep,
};
const CUSTOM_ICON = iconCustom;

export default function StatusCards() {
  // 当前宠物 id（今日状态记录按宠物隔离）
  const [petId, setPetId] = useState(() => getCurrentPet()?.id ?? "");
  // 全部记录项：共享默认项 + 自定义记录项（与健康档案「今日快速记录」同源一致）
  // 健康指标（体重/体温/笼温等）不注入今日状态，避免与日常记录重复
  const allDefs = () => getStatusDefs();
  // 记录数据：{ [key]: { value, done } }
  const [records, setRecords] = useState<Record<string, { value: string; done: boolean }>>(() => {
    // 首次使用先写入预置记录，保证与健康档案页数据一致
    ensureSeed(petId);
    const init: Record<string, { value: string; done: boolean }> = {};
    allDefs().forEach((d) => {
      const rec = getStatus(petId, d.key);
      if (rec) init[d.key] = rec;
    });
    return init;
  });
  // 用于在记录项增删时强制刷新（自定义项来自共享 defs）
  const [, setTick] = useState(0);

  // 订阅共享状态变更（健康档案记录/清除/自定义项增删时同步刷新）
  useEffect(() => {
    const unsub = subscribeStatusChange(() => {
      setTick((t) => t + 1);
      setRecords((prev) => {
        const next: Record<string, { value: string; done: boolean }> = {};
        allDefs().forEach((d) => {
          const rec = getStatus(petId, d.key);
          if (rec) next[d.key] = rec;
        });
        return next;
      });
    });
    // 宠物切换时指标记录项变化，同步刷新
    const onPetSwitch = () => {
      setPetId(getCurrentPet()?.id ?? "");
      setTick((t) => t + 1);
      setRecords((prev) => {
        const next: Record<string, { value: string; done: boolean }> = {};
        allDefs().forEach((d) => {
          const rec = getStatus(getCurrentPet()?.id ?? "", d.key);
          if (rec) next[d.key] = rec;
        });
        return next;
      });
    };
    window.addEventListener(PET_SWITCH_EVENT, onPetSwitch);
    return () => {
      unsub();
      window.removeEventListener(PET_SWITCH_EVENT, onPetSwitch);
    };
  }, []);

  const defs = allDefs();

  // 当前正在记录的卡片 key，null 表示无弹窗
  const [active, setActive] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const openLog = (key: string) => {
    setActive(key);
    setInput(records[key]?.value || "");
  };

  const save = () => {
    if (active === null) return;
    const def = defs.find((d) => d.key === active);
    if (!def) return;
    const value = input.trim() || "1";
    setStatus(active, value);
    setRecords((prev) => ({ ...prev, [active]: { value, done: true } }));
    setActive(null);
    setInput("");
  };

  // 清除记录：回到未记录状态（加号）
  const clearRecord = () => {
    if (active === null) return;
    clearStatus(active);
    setRecords((prev) => ({ ...prev, [active]: { value: "", done: false } }));
    setActive(null);
    setInput("");
  };

  const activeDef = active ? defs.find((d) => d.key === active) : null;
  // 当前弹窗对应卡片是否为已记录状态
  const activeDone = activeDef ? !!records[activeDef.key]?.done : false;

  return (
    <>
      <div className="status-cards">
        {defs.map((def) => {
          const rec = records[def.key];
          const done = !!rec?.done;
          const icon = DEFAULT_ICONS[def.key] || CUSTOM_ICON;
          return (
            <button
              key={def.key}
              className={`status-card ${done ? "done" : ""} ${def.fullRow ? "full-row" : ""}`}
              onClick={() => openLog(def.key)}
            >
              <span className="status-card-icon">
                <img src={icon} alt={def.title} />
              </span>
              <span className="status-card-text">
                <span className="status-card-title">{def.title}</span>
                <span className="status-card-desc">
                  {done ? `${rec.value}${def.unit}` : def.defaultValue}
                </span>
              </span>
              <span className={`status-card-check ${done ? "checked" : ""}`}>
                <img src={done ? iconCheck : iconPlus} alt={done ? "已完成" : "记录"} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Modal 记录小窗口 */}
      {activeDef && (
        <div className="status-modal-mask" onClick={() => setActive(null)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-title">{activeDone ? "修改" : "记录"}{activeDef.title}</div>
            <div className="status-modal-body">
              <input
                type="number"
                className="status-modal-input"
                placeholder={activeDef.placeholder}
                value={input}
                autoFocus
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              />
              <span className="status-modal-unit">{activeDef.unit}</span>
            </div>
            <div className="status-modal-actions">
              {activeDone && (
                <button className="status-modal-clear" onClick={clearRecord}>清除记录</button>
              )}
              <button className="status-modal-cancel" onClick={() => setActive(null)}>取消</button>
              <button className="status-modal-save" onClick={save}>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
