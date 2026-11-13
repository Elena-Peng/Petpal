import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "@/styles/service.css";
import "@/styles/provider.css";

import avatar from "@/assets/images/service/sv-avatar-lili.jpg";
import female from "@/assets/images/service/sv-female.png";
import svcCat from "@/assets/images/service/sv-svc-cat.jpg";
import svcDog from "@/assets/images/service/sv-svc-dog.jpg";
import pin from "@/assets/images/service/sv-pin.png";
import star from "@/assets/images/service/sv-star-line.png";
import starFilled from "@/assets/images/service/sv-star-fill.png";
import reviewAvatar from "@/assets/images/service/sv-review-avatar.jpg";
import { getFavs, toggleFav, addSvcChat } from "@/utils/serviceStore";

// 服务商在 NEARBY 中的稳定名称（收藏/咨询以名称为 id，与服务详情页口径一致）
const PROVIDER_NAME = "丽丽";

const SERVICES = [
  { img: svcCat, title: "猫狗上门喂养1-2KM", price: "¥ 25" },
  { img: svcDog, title: "遛狗1小时 1-5KM", price: "¥ 30" },
];

export default function ProviderShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fav, setFav] = useState(() => !!getFavs()[PROVIDER_NAME]);

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/service");
  };

  const handleFav = () => {
    toggleFav(PROVIDER_NAME);
    setFav(!!getFavs()[PROVIDER_NAME]);
  };

  // 预定 / 咨询：先写入服务咨询会话，再进入聊天页（参数与服务详情页统一用 name）
  const consult = () => {
    addSvcChat({
      name: PROVIDER_NAME,
      lastMsg: `你好，这里是${PROVIDER_NAME}，请问有什么可以帮您？`,
      avatar,
    });
    navigate("/mine/messages/chat?name=" + encodeURIComponent(PROVIDER_NAME));
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas pv-canvas">
        {/* 顶部返回 + 收藏 */}
        <header className="pv-head">
          <button className="pv-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <img
            className={"pv-star" + (fav ? " faved" : "")}
            src={fav ? starFilled : star}
            alt="收藏"
            style={{ cursor: "pointer" }}
            onClick={handleFav}
          />
        </header>

        {/* 服务者信息卡 */}
        <section className="pv-card">
          <div className="pv-profile">
            <img className="pv-avatar" src={avatar} alt="丽丽" />
            <div className="pv-profile-text">
              <h1 className="pv-name">丽丽</h1>
              <div className="pv-tags">
                <img className="pv-gender" src={female} alt="" />
                <span>上门喂养</span>
                <span>猫咪铲屎</span>
                <span>狗狗遛弯</span>
              </div>
            </div>
          </div>
          <div className="pv-stats">
            <span>养宠年限：5年</span>
            <span>服务记录：121次</span>
            <span>服务评价：★★★★★</span>
          </div>

          <h2 className="pv-section-title">个人简介</h2>
          <p className="pv-desc">
            自己养了1只边牧和2只蓝猫，养宠5年，对动物习性非常了解，熟悉猫狗照顾流程，擅长和猫猫狗狗打交道。
          </p>

          <h2 className="pv-section-title pv-divider">资格证书</h2>
          <p className="pv-text">个人健康证、宠物营养师</p>

          <h2 className="pv-section-title pv-divider">个人信息</h2>
          <div className="pv-info-row">
            <img src={pin} alt="" />
            <span>湖南省长沙市雨花区</span>
            <span className="pv-info-phone">联系方式：15632592574</span>
          </div>

          <h2 className="pv-section-title pv-divider">温馨提示</h2>
          <p className="pv-text">仅限同城服务，如有疑问，请联系</p>
        </section>

        {/* 服务项目 */}
        <section className="pv-svc-list">
          {SERVICES.map((s) => (
            <article className="pv-svc-card" key={s.title}>
              <img className="pv-svc-img" src={s.img} alt={s.title} />
              <div className="pv-svc-info">
                <h3 className="pv-svc-title">{s.title}</h3>
                <div className="pv-svc-tags">
                  <span>随时退</span>
                  <span>上门服务</span>
                </div>
                <div className="pv-svc-bottom">
                  <span className="pv-svc-price">{s.price}</span>
                  <button className="pv-svc-btn" onClick={consult}>立即预定</button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* 评价 */}
        <section className="pv-review-head">
          <h2 className="pv-review-title">评价（55）</h2>
          {/* 评价列表详情页暂未开放：箭头置灰，不做无效跳转 */}
          <svg
            className="pv-review-arrow-disabled"
            viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            aria-label="评价详情暂未开放"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </section>
        <section className="pv-review-card">
          <div className="pv-review-score">
            <span className="pv-review-num">4.7</span>
            <span className="pv-review-stars">★★★★★</span>
            <span className="pv-review-tag">非常棒</span>
          </div>
          <div className="pv-review-user">
            <img className="pv-review-avatar" src={reviewAvatar} alt="" />
            <div>
              <p className="pv-review-name">林****</p>
              <p className="pv-review-meta">2025年12月18日　猫狗上门喂养</p>
            </div>
          </div>
          <p className="pv-review-comment">小姐姐非常有耐心，辛苦啦</p>
        </section>
      </div>
    </div>
  );
}
