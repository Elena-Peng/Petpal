import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import "@/styles/reminder-manage.css";
import {
  getAddedIds,
  saveAddedIds,
  getCustoms,
  getOverrides,
  petFromParam,
  petHomePath,
  type PetId,
  type ReminderOverride,
} from "@/utils/reminderStore";
import { getCurrentPet, reminderPetKey } from "@/utils/petStore";

import iconWater from "@/assets/images/mine/reminder-water.png";
import iconDeworm from "@/assets/images/mine/reminder-deworm.png";
import iconComb from "@/assets/images/mine/reminder-comb.png";
import iconLitter from "@/assets/images/mine/reminder-litter.png";
import iconMedicine from "@/assets/images/mine/reminder-medicine.png";
import iconUvb from "@/assets/images/mine/reminder-uvb.png";
import iconCheckup from "@/assets/images/mine/reminder-checkup.png";
import iconPhoto from "@/assets/images/mine/reminder-photo.png";
import iconCustom from "@/assets/images/mine/reminder-custom.png";

const PRESET_REMINDERS = [
  { id: 1, icon: iconWater, title: "更换饮用水", desc: "今天 09:00・清洗水碗" },
  { id: 2, icon: iconDeworm, title: "体内驱虫日", desc: "8 月 20 日前・大宠爱 1/2 片" },
  { id: 3, icon: iconComb, title: "梳理换毛", desc: "今天 18:00・梳毛刷 5 分钟" },
  { id: 4, icon: iconLitter, title: "清理猫砂盆", desc: "今天 12:30・全套更换" },
  { id: 5, icon: iconMedicine, title: "喂处方药", desc: "今天 08:00/20:00・肾衰停 1 粒" },
  { id: 6, icon: iconUvb, title: "爬宠 UVB 开灯", desc: "今天 07:30・持续 10 小时" },
  { id: 7, icon: iconCheckup, title: "年度体检预约", desc: "8 月 25 日前・伴侣宠物医院" },
  { id: 8, icon: iconPhoto, title: "拍照成长记录", desc: "今天 21:00・本月第 3 张" },
];

export default function ReminderManageShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 有 ?pet= 参数按参数展示；无参数时默认当前选中宠物（只读 petStore 导出）
  const rawPet = searchParams.get("pet");
  const pet: PetId = rawPet
    ? petFromParam(rawPet)
    : (reminderPetKey(getCurrentPet()) as PetId);

  const [added, setAdded] = useState<number[]>(() => getAddedIds(pet));
  const [customs, setCustoms] = useState<ReturnType<typeof getCustoms>>([]);
  const [overrides, setOverrides] = useState<ReminderOverride[]>([]);

  useEffect(() => {
    setAdded(getAddedIds(pet));
    setCustoms(getCustoms(pet));
    setOverrides(getOverrides(pet));
  }, [pet]);

  // 返回：优先来源页 state.from，无历史/深链进入时兜底当前宠物首页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : petHomePath(pet));
  };

  const toggleAdd = (id: number) => {
    const newAdded = added.includes(id) ? added.filter((a) => a !== id) : [...added, id];
    setAdded(newAdded);
    saveAddedIds(pet, newAdded);
  };

  // 合并预设提醒与 overrides：按 id 取最新文案；deleted 标记的预设不再展示
  const overrideMap: Record<number, ReminderOverride> = {};
  overrides.forEach((o) => {
    overrideMap[o.id] = o;
  });

  const presetItems = PRESET_REMINDERS.filter((r) => !overrideMap[r.id]?.deleted).map((r) => ({
    ...r,
    title: overrideMap[r.id]?.title || r.title,
    desc: overrideMap[r.id]?.desc || r.desc,
  }));

  const allItems = [...presetItems, ...customs];

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
          <h1 className="rm-title">今日提醒管理</h1>
          <button className="rm-add" onClick={() => navigate(`/reminders/new?pet=${pet}`)}>新增</button>
        </header>

        {/* 提醒列表 */}
        <div className="rm-list">
          {allItems.length === 0 ? (
            <div className="rm-empty">暂无提醒，点击右上角「新增」创建</div>
          ) : (
            allItems.map((r) => (
              <div key={r.id} className={"rm-item" + (added.includes(r.id) ? " rm-item-added" : "")}>
                <img src={r.icon || iconCustom} alt="" className="rm-icon" />
                <div className="rm-info">
                  <p className="rm-name">{r.title}</p>
                  <p className="rm-desc">{r.desc}</p>
                </div>
                <button className="rm-edit-btn" onClick={() => navigate(`/reminders/edit/${r.id}?pet=${pet}`)}>编辑</button>
                <button className={"rm-check" + (added.includes(r.id) ? " rm-check-added" : "")} onClick={() => toggleAdd(r.id)}>
                  {added.includes(r.id) && <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
