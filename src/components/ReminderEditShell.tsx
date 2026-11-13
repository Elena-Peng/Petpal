import { useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router";
import "@/styles/reminder-manage.css";
import {
  getCustoms,
  saveCustoms,
  getOverrides,
  saveOverrides,
  getAddedIds,
  saveAddedIds,
  petFromParam,
  type PetId,
  type ReminderItem,
} from "@/utils/reminderStore";
import { getCurrentPet, reminderPetKey } from "@/utils/petStore";
import iconCustom from "@/assets/images/mine/reminder-custom.png";

import iconWater from "@/assets/images/mine/reminder-water.png";
import iconDeworm from "@/assets/images/mine/reminder-deworm.png";
import iconComb from "@/assets/images/mine/reminder-comb.png";
import iconLitter from "@/assets/images/mine/reminder-litter.png";
import iconMedicine from "@/assets/images/mine/reminder-medicine.png";
import iconUvb from "@/assets/images/mine/reminder-uvb.png";
import iconCheckup from "@/assets/images/mine/reminder-checkup.png";
import iconPhoto from "@/assets/images/mine/reminder-photo.png";

const PRESET_MAP: Record<number, { icon: string; title: string; desc: string }> = {
  1: { icon: iconWater, title: "更换饮用水", desc: "今天 09:00・清洗水碗" },
  2: { icon: iconDeworm, title: "体内驱虫日", desc: "8 月 20 日前・大宠爱 1/2 片" },
  3: { icon: iconComb, title: "梳理换毛", desc: "今天 18:00・梳毛刷 5 分钟" },
  4: { icon: iconLitter, title: "清理猫砂盆", desc: "今天 12:30・全套更换" },
  5: { icon: iconMedicine, title: "喂处方药", desc: "今天 08:00/20:00・肾衰停 1 粒" },
  6: { icon: iconUvb, title: "爬宠 UVB 开灯", desc: "今天 07:30・持续 10 小时" },
  7: { icon: iconCheckup, title: "年度体检预约", desc: "8 月 25 日前・伴侣宠物医院" },
  8: { icon: iconPhoto, title: "拍照成长记录", desc: "今天 21:00・本月第 3 张" },
};

export default function ReminderEditShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const rawPet = searchParams.get("pet");
  const pet: PetId = rawPet
    ? petFromParam(rawPet)
    : (reminderPetKey(getCurrentPet()) as PetId);

  const itemId = Number(id);

  // 读取自定义覆盖与预设覆盖（损坏数据回退空数组）
  const customs = getCustoms(pet);
  const overrides = getOverrides(pet);
  const customItem = customs.find((c) => c.id === itemId);
  const presetBase = PRESET_MAP[itemId];
  const override = overrides.find((o) => o.id === itemId);

  const item: (ReminderItem & { icon?: string }) | null = customItem
    ? customItem
    : presetBase
      ? {
          id: itemId,
          icon: presetBase.icon,
          title: override?.title || presetBase.title,
          desc: override?.desc || presetBase.desc,
        }
      : null;

  const [title, setTitle] = useState(item?.title || "");
  const [desc, setDesc] = useState(item?.desc || "");
  const [titleError, setTitleError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState("");

  // 返回：优先来源页 state.from，无历史/深链进入时兜底提醒管理页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : `/reminders?pet=${pet}`);
  };

  const save = () => {
    if (!item) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("请填写提醒名称");
      return;
    }
    const trimmedDesc = desc.trim();

    if (itemId >= 100) {
      // 自定义事项：更新（保留原 type/time 等可迁移字段）
      const newCustoms = customs.map((c) =>
        c.id === itemId ? { ...c, title: trimmedTitle, desc: trimmedDesc } : c
      );
      saveCustoms(pet, newCustoms);
    } else {
      // 预设提醒：写入覆盖列表持久化文案，同时解除删除标记
      const existing = overrides.find((o) => o.id === itemId);
      const next = existing
        ? { ...existing, title: trimmedTitle, desc: trimmedDesc, deleted: false }
        : { id: itemId, title: trimmedTitle, desc: trimmedDesc };
      const newOverrides = existing
        ? overrides.map((o) => (o.id === itemId ? next : o))
        : [...overrides, next];
      saveOverrides(pet, newOverrides);
    }

    setToast("提醒已保存");
    window.setTimeout(() => navigate(`/reminders?pet=${pet}`), 300);
  };

  const del = () => {
    if (!item) return;
    // 二次确认：首次点击进入确认态，再次点击才真正删除
    if (!confirming) {
      setConfirming(true);
      return;
    }

    if (itemId >= 100) {
      // 删除自定义事项
      saveCustoms(pet, customs.filter((c) => c.id !== itemId));
    } else {
      // 预设提醒：写入删除标记到 overrides 持久化，管理页读取同一来源后不再列出
      const existing = overrides.find((o) => o.id === itemId);
      const next = { id: itemId, deleted: true as const };
      const newOverrides = existing
        ? overrides.map((o) => (o.id === itemId ? { ...o, ...next } : o))
        : [...overrides, next];
      saveOverrides(pet, newOverrides);
    }

    // 从首页显示列表移除
    saveAddedIds(pet, getAddedIds(pet).filter((h) => h !== itemId));

    setToast("提醒已删除");
    window.setTimeout(() => navigate(`/reminders?pet=${pet}`), 300);
  };

  // 非法 id 兜底：不回退到首条预设，展示空态 + 返回列表入口
  if (!item) {
    return (
      <div className="sv-stage">
        <div className="sv-canvas rm-canvas">
          <header className="rm-head">
            <button className="rm-back" onClick={goBack} aria-label="返回">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="rm-title">编辑提醒</h1>
            <span className="rm-head-ghost" />
          </header>
          <div className="rm-empty-state">
            <p className="rm-empty-title">提醒不存在或已被删除</p>
            <button className="rm-add" onClick={goBack}>返回提醒列表</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-stage">
      <div className="sv-canvas rm-canvas">
        {/* 顶部 */}
        <header className="rm-head">
          <button className="rm-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="rm-title">编辑提醒</h1>
          <button className="rm-add" onClick={save}>保存</button>
        </header>

        {/* 表单 */}
        <div className="rm-form">
          <div className="rm-form-icon">
            <img src={item.icon || iconCustom} alt="" />
          </div>

          <div className="rm-form-field">
            <label className="rm-form-label">提醒名称</label>
            <input
              type="text"
              className="rm-form-input"
              placeholder="例如：喂猫、换水..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              autoFocus
            />
            {titleError && <p className="rm-form-error">{titleError}</p>}
          </div>

          <div className="rm-form-field">
            <label className="rm-form-label">备注/时间</label>
            <input
              type="text"
              className="rm-form-input"
              placeholder="例如：今天 18:00・1 勺猫粮"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <button
            className={"rm-delete-btn" + (confirming ? " confirm" : "")}
            onClick={del}
          >
            {confirming ? "再次点击确认删除" : "删除此提醒"}
          </button>
        </div>

        {toast && <div className="rm-toast">{toast}</div>}
      </div>
    </div>
  );
}
