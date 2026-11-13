import { useState, useEffect } from "react";
import "@/styles/home-adapt.css";
import { getPetStore, type PetId } from "@/utils/reminderStore";
import { getCurrentPet, getPets, reminderPetKey, PET_SWITCH_EVENT } from "@/utils/petStore";

import iconWater from "@/assets/images/mine/reminder-water.png";
import iconDeworm from "@/assets/images/mine/reminder-deworm.png";
import iconComb from "@/assets/images/mine/reminder-comb.png";
import iconLitter from "@/assets/images/mine/reminder-litter.png";
import iconMedicine from "@/assets/images/mine/reminder-medicine.png";
import iconUvb from "@/assets/images/mine/reminder-uvb.png";
import iconCheckup from "@/assets/images/mine/reminder-checkup.png";
import iconPhoto from "@/assets/images/mine/reminder-photo.png";
import iconCustom from "@/assets/images/mine/reminder-custom.png";
import iconBirthday from "@/assets/images/mine/care-star.png";

const ALL_REMINDERS: Record<number, { icon: string; title: string; desc: string }> = {
  1: { icon: iconWater, title: "更换饮用水", desc: "今天 09:00・清洗水碗" },
  2: { icon: iconDeworm, title: "体内驱虫日", desc: "8 月 20 日前・大宠爱 1/2 片" },
  3: { icon: iconComb, title: "梳理换毛", desc: "今天 18:00・梳毛刷 5 分钟" },
  4: { icon: iconLitter, title: "清理猫砂盆", desc: "今天 12:30・全套更换" },
  5: { icon: iconMedicine, title: "喂处方药", desc: "今天 08:00/20:00・肾衰停 1 粒" },
  6: { icon: iconUvb, title: "爬宠 UVB 开灯", desc: "今天 07:30・持续 10 小时" },
  7: { icon: iconCheckup, title: "年度体检预约", desc: "8 月 25 日前・伴侣宠物医院" },
  8: { icon: iconPhoto, title: "拍照成长记录", desc: "今天 21:00・本月第 3 张" },
  9: { icon: iconCustom, title: "自定义事项", desc: "点击编辑" },
};

// 安全解析 JSON：localStorage 数据损坏时回退空数组/空对象，避免整页白屏
function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function HomeReminders({ pet: petProp }: { pet?: PetId }) {
  // 提醒按当前选中宠物读取；切换宠物后跟随刷新
  const [petKey, setPetKey] = useState<string>(() => {
    const cur = getCurrentPet();
    return cur ? reminderPetKey(cur) : petProp || "jijiu";
  });
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [doneIds, setDoneIds] = useState<number[]>([]);
  const [customs, setCustoms] = useState<{id:number;icon:string;title:string;desc:string}[]>([]);

  // 监听宠物切换事件，重新按当前宠物读取提醒
  useEffect(() => {
    const refresh = () => {
      const cur = getCurrentPet();
      setPetKey(cur ? reminderPetKey(cur) : (petProp || "jijiu"));
    };
    refresh();
    window.addEventListener(PET_SWITCH_EVENT, refresh);
    return () => window.removeEventListener(PET_SWITCH_EVENT, refresh);
  }, [petProp]);

  useEffect(() => {
    const saved = getPetStore(petKey as PetId, "petpal-reminders");
    setAddedIds(safeParse<number[]>(saved, []));
    const customSaved = getPetStore(petKey as PetId, "petpal-custom-reminders");
    setCustoms(safeParse(customSaved, []));
  }, [petKey]);

  const toggleDone = (id: number) => {
    setDoneIds(doneIds.includes(id) ? doneIds.filter(d => d !== id) : [...doneIds, id]);
  };

  // 合并预设 + 自定义 + 预设覆盖
  const customMap: Record<number, { icon: string; title: string; desc: string }> = {};
  customs.forEach(c => { customMap[c.id] = c; });

  // 读取预设覆盖（损坏数据回退空数组）
  const overrideSaved = getPetStore(petKey as PetId, "petpal-reminder-overrides");
  const overrides = safeParse<{ id: number; title?: string; desc?: string }[]>(overrideSaved, []);
  const overrideMap: Record<number, { title?: string; desc?: string }> = {};
  overrides.forEach((o) => { overrideMap[o.id] = o; });

  const allMap: Record<number, { icon: string; title: string; desc: string }> = {};
  Object.keys(ALL_REMINDERS).forEach(k => {
    const id = Number(k);
    allMap[id] = { ...ALL_REMINDERS[id], ...overrideMap[id] };
  });
  Object.assign(allMap, customMap);

  type ReminderItem = { id: number; icon: string; title: string; desc: string };
  const reminders = addedIds
    .map((id) => {
      const base = allMap[id];
      return base ? ({ id, ...base } as ReminderItem) : null;
    })
    .filter((r): r is ReminderItem => r !== null);

  // 生日提醒：按当前宠物档案里的生日，生日当天自动置顶显示（无需在提醒管理里勾选）
  const petList = getPets();
  const curPet = petList.find((p) => reminderPetKey(p) === petKey) ?? getCurrentPet();
  const birthdayToday = (() => {
    const bday = curPet?.birthday;
    if (!bday) return false;
    const parts = bday.split("-").map(Number);
    const now = new Date();
    return parts[1] === now.getMonth() + 1 && parts[2] === now.getDate();
  })();
  const shown: ReminderItem[] = birthdayToday
    ? [
        {
          id: -101,
          icon: iconBirthday,
          title: `${curPet?.name ?? "它"} 生日快乐`,
          desc: "今天・生日当天・准备一个小惊喜吧",
        },
        ...reminders,
      ]
    : reminders;

  return (
    <div className="home-reminders">
      {shown.length === 0 ? (
        <div className="home-reminder-empty">暂无今日提醒</div>
      ) : (
        shown.map(r => (
          <div key={r.id} className={"home-reminder-item" + (doneIds.includes(r.id) ? " done" : "")}>
            <img src={r.icon} alt="" className="home-reminder-icon" />
            <div className="home-reminder-info">
              <p className="home-reminder-name">{r.title}</p>
              <p className="home-reminder-desc">{r.desc}</p>
            </div>
            <div
              className={"home-reminder-check" + (doneIds.includes(r.id) ? " done" : "")}
              onClick={() => toggleDone(r.id)}
            />
          </div>
        ))
      )}
    </div>
  );
}
