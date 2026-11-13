import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import "@/styles/reminder-manage.css";
import {
  getCustoms,
  saveCustoms,
  getAddedIds,
  saveAddedIds,
  petFromParam,
  genCustomId,
  REMINDER_TYPE_LABELS,
  type PetId,
  type ReminderType,
} from "@/utils/reminderStore";
import { getCurrentPet, reminderPetKey } from "@/utils/petStore";

import iconCustom from "@/assets/images/mine/reminder-custom.png";
import iconDeworm from "@/assets/images/mine/reminder-deworm.png";
import iconMedicine from "@/assets/images/mine/reminder-medicine.png";
import iconCheckup from "@/assets/images/mine/reminder-checkup.png";
import iconWater from "@/assets/images/mine/reminder-water.png";

const TYPE_OPTIONS: { type: ReminderType; icon: string }[] = [
  { type: "deworm", icon: iconDeworm },
  { type: "vaccine", icon: iconMedicine },
  { type: "checkup", icon: iconCheckup },
  { type: "feeding", icon: iconWater },
  { type: "custom", icon: iconCustom },
];

const TYPE_ICON: Record<ReminderType, string> = {
  deworm: iconDeworm,
  vaccine: iconMedicine,
  checkup: iconCheckup,
  feeding: iconWater,
  custom: iconCustom,
};

export default function ReminderNewShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const rawPet = searchParams.get("pet");
  const pet: PetId = rawPet
    ? petFromParam(rawPet)
    : (reminderPetKey(getCurrentPet()) as PetId);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<ReminderType>("custom");
  const [time, setTime] = useState("");
  const [titleError, setTitleError] = useState("");
  const [toast, setToast] = useState("");

  // 返回：优先来源页 state.from，无历史/深链进入时兜底提醒管理页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : `/reminders?pet=${pet}`);
  };

  const save = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("请填写提醒名称");
      return;
    }

    const customs = getCustoms(pet);
    const id = genCustomId(customs);
    const note = desc.trim();
    const timeLabel = time.trim();
    const descText =
      [timeLabel, note].filter(Boolean).join("・") || REMINDER_TYPE_LABELS[type];

    const newItem = {
      id,
      icon: TYPE_ICON[type],
      title: trimmedTitle,
      desc: descText,
      type,
      time: timeLabel,
    };
    customs.push(newItem);
    saveCustoms(pet, customs);

    // 同时加到首页显示列表
    const homeList = getAddedIds(pet);
    if (!homeList.includes(id)) {
      homeList.push(id);
      saveAddedIds(pet, homeList);
    }

    setToast("提醒已保存");
    window.setTimeout(() => {
      navigate(`/reminders?pet=${pet}`);
    }, 300);
  };

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
          <h1 className="rm-title">新增提醒</h1>
          <button className="rm-add" onClick={save}>保存</button>
        </header>

        {/* 表单 */}
        <div className="rm-form">
          <div className="rm-form-icon">
            <img src={TYPE_ICON[type]} alt="" />
          </div>

          {/* 提醒类型选择 */}
          <div className="rm-form-field">
            <label className="rm-form-label">提醒类型</label>
            <div className="rm-type-row">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  className={"rm-type-chip" + (type === opt.type ? " active" : "")}
                  onClick={() => setType(opt.type)}
                >
                  {REMINDER_TYPE_LABELS[opt.type]}
                </button>
              ))}
            </div>
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
            <label className="rm-form-label">提醒时间</label>
            <input
              type="time"
              className="rm-form-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="rm-form-field">
            <label className="rm-form-label">备注</label>
            <input
              type="text"
              className="rm-form-input"
              placeholder="例如：1 勺猫粮、清洗水碗..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>

        {toast && <div className="rm-toast">{toast}</div>}
      </div>
    </div>
  );
}
