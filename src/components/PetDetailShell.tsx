// 通用宠物详情页：/service/pet?name=xxx
// 每只领养动物都有此页，右上角可收藏（serviceStore favs）。
// 参数匹配不到时走"内容不存在/已下架"空态，不静默回退首条。
import { useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import "@/styles/service.css";
import "@/styles/provider.css";
import { ADOPT_LIST } from "@/utils/serviceData";
import { getFavs, toggleFav, addSvcChat } from "@/utils/serviceStore";
import { submitAdoptionRequest } from "@/utils/rescueStore";

import female from "@/assets/images/service/sv-female.png";
import male from "@/assets/images/service/sv-male.png";
import pin from "@/assets/images/service/sv-pin.png";
import star from "@/assets/images/service/sv-star-line.png";

export default function PetDetailShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const name = params.get("name") || "";
  const pet = ADOPT_LIST.find((p) => p.name === name);
  const [favs, setFavs] = useState<Record<string, boolean>>(() => getFavs());
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/service/rescue");
  };

  const showToast = (t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2000);
  };

  // 参数缺失或匹配不到：空态 + 返回列表入口，不回退首条
  if (!pet) {
    return (
      <div className="sv-stage">
        <div className="sv-canvas pv-canvas">
          <header className="pv-head pv-head-center">
            <button className="pv-back" onClick={goBack} aria-label="返回">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="pv-head-title">宠物详情</h1>
            <span className="pv-head-spacer" />
          </header>
          <div className="sv-empty">
            <p className="sv-empty-title">内容不存在或已下架</p>
            <p className="sv-empty-desc">这只动物可能已被领养，或链接已失效。</p>
            <button className="sv-empty-btn" onClick={() => navigate("/service/rescue")}>
              返回救助基地
            </button>
          </div>
        </div>
      </div>
    );
  }

  const faved = !!favs[pet.name];

  const handleFav = () => {
    toggleFav(pet.name);
    setFavs(getFavs());
  };

  // 联系主人：写入服务咨询会话并进入聊天。
  // 聊天契约：当前 ChatShell 读取 ?name=；先按 ?to=<主人名> 传参并保留 name 兜底，待聊天参数统一后可只留 to。
  const contactOwner = () => {
    const ownerName = pet.owner?.name || "PetPal 救助人";
    addSvcChat({
      name: ownerName,
      lastMsg: `你好，我想了解一下「${pet.name}」的领养情况`,
      avatar: pet.img,
    });
    navigate(
      "/mine/messages/chat?to=" + encodeURIComponent(ownerName) + "&name=" + encodeURIComponent(ownerName)
    );
  };

  // 申请领养：生成可迁移的领养申请记录（rescueStore 独立 adoption 桶），成功 toast 反馈
  const applyAdopt = () => {
    submitAdoptionRequest({
      petName: pet.name,
      breed: pet.breed,
      age: pet.age,
      location: pet.location,
      ownerName: pet.owner?.name || "PetPal 救助人",
      ownerPhone: pet.owner?.phone || "敬请咨询",
      contact: pet.owner?.phone || "待补充",
    });
    showToast("领养申请已提交，主人将在 24 小时内联系你");
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas pv-canvas">
        {/* 顶部返回 + 标题 + 收藏 */}
        <header className="pv-head pv-head-center">
          <button className="pv-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pv-head-title">宠物详情</h1>
          <button
            className="pv-star-btn"
            aria-label="收藏"
            onClick={handleFav}
          >
            <img className={"pv-star" + (faved ? " pv-star-faved" : "")} src={star} alt="收藏" />
          </button>
        </header>

        {/* 大幅头图 */}
        <section className="pet-hero">
          <img src={pet.img} alt={pet.name} />
        </section>

        {/* 白卡 */}
        <section className="pv-card">
          <div className="pet-title-row">
            <h2 className="pet-name">{pet.name}</h2>
            <span className="pet-price">{pet.price}</span>
          </div>
          <div className="pv-tags pet-tags">
            <img className="pv-gender" src={pet.gender === "m" ? male : female} alt="" />
            <span>{pet.breed}</span>
            <span>{pet.age}</span>
          </div>
          <div className="sv-adopt-tags pet-status-tags">
            {pet.tags.map((t) => (
              <span key={t.label} className={"sv-adopt-tag tone-" + t.tone}>{t.label}</span>
            ))}
          </div>

          <h2 className="pv-section-title pv-divider">领养地点</h2>
          <div className="pv-info-row">
            <img src={pin} alt="" />
            <span>{pet.location}</span>
          </div>

          <h2 className="pv-section-title">宠物介绍</h2>
          <p className="pv-text">{pet.desc}</p>

          <h2 className="pv-section-title pv-divider">主人信息</h2>
          <div className="pet-owner-row">
            <span>{pet.owner?.name || "PetPal 救助人"}</span>
            <span className="pv-info-phone">联系方式：{pet.owner?.phone || "敬请咨询"}</span>
            <button className="pet-contact-btn" onClick={contactOwner}>联系主人</button>
          </div>

          <h2 className="pv-section-title pv-divider">温馨提示</h2>
          <p className="pv-text">仅限同城领养，如有疑问，请联系宠物主人</p>
        </section>

        {/* 底部申请按钮 */}
        <button className="pet-apply-btn" onClick={applyAdopt}>
          申请领养
        </button>

        {toast && <div className="pv-toast">{toast}</div>}
      </div>
    </div>
  );
}
