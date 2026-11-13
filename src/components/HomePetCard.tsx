import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getCurrentPet,
  getPetType,
  PET_SWITCH_EVENT,
  type Pet,
} from "@/utils/petStore";
import { getStatus, subscribeStatusChange } from "@/utils/statusStore";
import "@/styles/HomePetCard.css";

// 首页宠物卡：数据驱动（读取当前宠物），覆盖 Pixso 原宠物卡(332_320/332_335)
// - 显示宠物头像 + 名字（点名字胶囊弹出切换菜单）+ 档案标签 + 状态 + 数据三格
// - 无宠物（新用户/清空）时显示"建立宠物档案"引导卡
export default function HomePetCard() {
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | undefined>(() => getCurrentPet());

  // 监听宠物切换事件刷新
  useEffect(() => {
    const onSwitch = () => setPet(getCurrentPet());
    window.addEventListener(PET_SWITCH_EVENT, onSwitch);
    return () => window.removeEventListener(PET_SWITCH_EVENT, onSwitch);
  }, []);

  // 每日记录变更（今日状态记录指标）时刷新：宠物卡指标显示最新记录值
  useEffect(() => {
    const unsub = subscribeStatusChange(() => setPet(getCurrentPet()));
    return unsub;
  }, []);

  if (!pet) {
    // 无宠物：引导建立档案
    return (
      <div className="hpc-stage">
        <div className="hpc-card hpc-empty">
          <div className="hpc-empty-icon">＋</div>
          <div className="hpc-empty-title">为你的宠物建立档案</div>
          <div className="hpc-empty-sub">上传照片与名字，首页会展示它的状态与健康数据</div>
          <button className="hpc-empty-btn" onClick={() => navigate("/mine/health/edit")}>立即建立档案</button>
        </div>
      </div>
    );
  }

  // 兼容旧结构：metrics 可能是 {weight,temp,light} 对象（旧 localStorage 数据）
  let m = Array.isArray(pet.metrics)
    ? pet.metrics
    : [
        { label: "体重", value: (pet.metrics as any)?.weight ?? "--", unit: (pet.metrics as any)?.weightUnit ?? "kg" },
        { label: "笼温", value: (pet.metrics as any)?.temp ?? "--", unit: (pet.metrics as any)?.tempUnit ?? "℃" },
        { label: "光照", value: (pet.metrics as any)?.light ?? "--", unit: (pet.metrics as any)?.lightUnit ?? "h" },
      ];
  // 犬/猫不展示异宠专属指标（笼温/光照/湿度），确保含 体重 + 体温
  const pt = getPetType(pet);
  if (pt === "犬" || pt === "猫") {
    m = m.filter((x) => !["笼温", "光照", "湿度", "箱温"].includes(x.label));
    if (!m.some((x) => x.label === "体重")) m.unshift({ label: "体重", value: "--", unit: "kg" });
    if (!m.some((x) => x.label === "体温")) m.push({ label: "体温", value: "--", unit: "℃" });
  }
  // 点击宠物卡（照片/名称/状态/指标区）进入档案；名字胶囊由 PetSwitcher 接管展开切换菜单
  const openArchive = () => navigate("/archive", { state: { from: "home-pet-card" } });

  return (
    <div className="hpc-stage">
      <div className="hpc-card" onClick={openArchive} style={{ cursor: "pointer" }}>
        <div className="hpc-body">
        {/* 名字胶囊（id=332_322 供 PetSwitcher 绑定展开切换菜单） */}
        <div className="hpc-name-pill" id="332_322">
          {pet.avatar ? (
            <img className="hpc-avatar" src={pet.avatar} alt={pet.name} />
          ) : (
            <span className="hpc-avatar hpc-avatar-ph">{pet.name[0]}</span>
          )}
          <span className="hpc-name">{pet.name}</span>
          <svg className="hpc-caret" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* 状态 */}
        <div className="hpc-status">{pet.status}</div>
        <div className="hpc-status-sub">{pet.statusSub}</div>

        {/* 档案标签 */}
        <div className="hpc-profile">
          <span className="hpc-profile-dot" />
          {pet.profile}
        </div>

        {/* 数据三格（不同宠物展示不同指标；点三格直接进「健康指标」页，可改值并保存，
            保存后写入健康记录，「近期记录」与首页指标格同步更新） */}
        <div
          className="hpc-metrics"
          title="查看/记录健康指标"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/archive/metrics");
          }}
        >
          {m.map((mt, i) => {
            const rec = getStatus(pet.id, `pm-${mt.label}`);
            const val = rec ? rec.value : (mt.value ?? "--");
            return (
              <div className="hpc-metric" key={i}>
                <strong>{val}</strong>
                <span>{mt.unit}·{mt.label}</span>
              </div>
            );
          })}
        </div>
        </div>
        {/* 右侧宠物照片（左缘 mask 渐变柔化） */}
        {pet.avatar && (
          <div className="hpc-photo">
            <img src={pet.avatar} alt={pet.name} />
          </div>
        )}
      </div>
    </div>
  );
}
