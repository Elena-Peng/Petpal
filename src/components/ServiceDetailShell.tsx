import { useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { NEARBY, PLACES, type SvcCard } from "@/utils/serviceData";
import { getFavs, toggleFav, addSvcChat } from "@/utils/serviceStore";
import star from "@/assets/images/service/sv-star-line.png";
import pin from "@/assets/images/service/sv-pin.png";
import "@/styles/service.css";

// 通用服务详情页：项目信息 + 价格 + 预约 + 在线咨询（跳消息聊天）
// /service/detail?name=<服务名>；从 NEARBY/PLACES 取数据
const ALL_CARDS: SvcCard[] = [...NEARBY, ...PLACES];

export default function ServiceDetailShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const name = params.get("name") || "";
  const c = ALL_CARDS.find((x) => x.name === name);

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/service");
  };

  // 参数缺失或匹配不到：空态 + 返回入口，不静默回退首条
  if (!c) {
    return (
      <div className="sv-stage">
        <div className="sv-canvas pv-canvas">
          <header className="pv-head pv-head-center">
            <button className="pv-back" onClick={goBack} aria-label="返回">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="pv-head-title">服务详情</h1>
            <span className="pv-head-spacer" />
          </header>
          <div className="sv-empty">
            <p className="sv-empty-title">内容不存在或已下架</p>
            <p className="sv-empty-desc">该服务可能已下线，或链接已失效。</p>
            <button className="sv-empty-btn" onClick={() => navigate("/service")}>
              返回服务页
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [fav, setFav] = useState(() => !!getFavs()[c.name]);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const canBook = !!(c.projects && c.projects.length > 0);

  const showToast = (t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  };

  const handleFav = () => {
    toggleFav(c.name);
    setFav(!!getFavs()[c.name]);
  };

  // 预约：进入三步预约流程（宠物与套餐 → 时间与医生 → 确认订单），下单后写入订单页
  const book = (project?: string) => {
    const t = project || c.projects?.[0]?.title || "到店服务";
    navigate(
      `/service/appointment?name=${encodeURIComponent(c.name)}&project=${encodeURIComponent(t)}`,
      { state: { from: location.pathname + location.search } }
    );
  };

  const consult = () => {
    addSvcChat({ name: c.name, lastMsg: `你好，这里是${c.name}，请问有什么可以帮您？`, avatar: c.img });
    navigate("/mine/messages/chat?name=" + encodeURIComponent(c.name));
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
            src={star}
            alt="收藏"
            onClick={handleFav}
            style={{ cursor: "pointer" }}
          />
        </header>

        {/* 服务者 / 机构信息卡 */}
        <section className="pv-card">
          <div className="pv-profile">
            <img className="pv-avatar" src={c.img} alt={c.name} />
            <div className="pv-profile-text">
              <h1 className="pv-name">{c.name}</h1>
              <div className="pv-tags">
                {c.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          {c.stat && (
            <div className="pv-stats">
              {c.stat.split("　").map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          )}

          <h2 className="pv-section-title">
            {c.person ? "个人简介" : "机构介绍"}
          </h2>
          <p className="pv-desc">{c.desc}</p>

          {c.person && (
            <>
              <h2 className="pv-section-title pv-divider">资格证书</h2>
              <p className="pv-text">个人健康证、宠物营养师</p>
              <h2 className="pv-section-title pv-divider">个人信息</h2>
              <div className="pv-info-row">
                <img src={pin} alt="" />
                <span>湖南省长沙市（同城服务）</span>
                <span className="pv-info-phone">联系方式：请在线咨询</span>
              </div>
            </>
          )}

          {c.skill && (
            <>
              <h2 className="pv-section-title pv-divider">服务专长</h2>
              <p className="pv-text">{c.skill}</p>
            </>
          )}

          {c.meta && (
            <div className="pv-info-row pv-info-meta">
              <img src={pin} alt="" />
              <span>{c.meta}</span>
            </div>
          )}

          <h2 className="pv-section-title pv-divider">温馨提示</h2>
          <p className="pv-text">
            服务内容与价格以商家确认为准，建议先在线咨询确认可接待物种与服务时间。
          </p>
        </section>

        {/* 服务项目与价格 */}
        <section className="pv-svc-list">
          {canBook ? (
            c.projects!.map((p) => (
              <article className="pv-svc-card" key={p.title}>
                <div className="pv-svc-info">
                  <h3 className="pv-svc-title">{p.title}</h3>
                  <div className="pv-svc-tags">
                    <span>随时退</span>
                    <span>{c.person ? "上门服务" : "到店服务"}</span>
                  </div>
                  <div className="pv-svc-bottom">
                    <span className="pv-svc-price">{p.price}</span>
                    <button className="pv-svc-btn" onClick={() => book(p.title)}>
                      立即预约
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="pv-text pv-nobook">
              到店服务场所，暂不支持线上预约，可先在线咨询确认接待条件。
            </p>
          )}
        </section>

        {/* 底部操作条：预约 + 在线咨询 */}
        <div className="pv-bar">
          {canBook ? (
            <button className="pv-bar-book" onClick={() => book()}>
              立即预约
            </button>
          ) : (
            <button className="pv-bar-book" onClick={() => showToast("可先在线咨询确认接待条件")}>
              到店咨询
            </button>
          )}
          <button className="pv-bar-consult" onClick={consult}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.2 0-2.4-.3-3.4-.8L3 20l1-5.7A8.5 8.5 0 1 1 21 11.5z" />
              <path d="M8 10h.01M12 10h.01M16 10h.01" />
            </svg>
            在线咨询
          </button>
        </div>

        {/* 轻提示 */}
        {toast && <div className="pv-toast">{toast}</div>}
      </div>
    </div>
  );
}
