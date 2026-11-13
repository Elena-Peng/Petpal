// 救助基地详情页：/service/rescue?name=xxx
// 查看基地详情 + 参与救助活动（志愿者报名 / 捐赠支持 / 领养对接）。
// 参数匹配不到时走"内容不存在/已下架"空态，不静默回退首条。
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import "@/styles/service.css";
import "@/styles/provider.css";
import { RESCUE_BASES } from "@/utils/serviceData";

import pin from "@/assets/images/service/sv-pin.png";
import clock from "@/assets/images/service/sv-clock.png";

const ACTIVITIES = [
  { key: "volunteer", label: "报名志愿者", desc: "周末探访 / 喂食 / 清洁 / 陪护" },
  { key: "donate", label: "捐赠支持", desc: "猫粮狗粮 / 药品 / 资金" },
  { key: "adopt", label: "领养对接", desc: "把有家的动物带回新家" },
];

export default function RescueBaseShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const name = params.get("name") || "";
  const base = RESCUE_BASES.find((b) => b.name === name);
  const [joined, setJoined] = useState<string | null>(null);

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/service");
  };

  // 参数缺失或匹配不到：空态 + 返回入口
  if (!base) {
    return (
      <div className="sv-stage">
        <div className="sv-canvas pv-canvas rsb-canvas">
          <header className="pv-head pv-head-center">
            <button className="pv-back" onClick={goBack} aria-label="返回">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="pv-head-title">救助基地</h1>
            <span className="pv-head-spacer" />
          </header>
          <div className="sv-empty">
            <p className="sv-empty-title">内容不存在或已下架</p>
            <p className="sv-empty-desc">该救助基地可能已下线，或链接已失效。</p>
            <button className="sv-empty-btn" onClick={() => navigate("/service")}>
              返回服务页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-stage">
      <div className="sv-canvas pv-canvas rsb-canvas">
        {/* 顶部返回 + 标题 */}
        <header className="pv-head pv-head-center">
          <button className="pv-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pv-head-title">救助基地</h1>
          <span className="pv-head-spacer" />
        </header>

        {/* 基地头图 */}
        <section className="pet-hero">
          <img src={base.img} alt={base.name} />
        </section>

        {/* 发布救助入口 */}
        <button className="rsb-publish-btn" onClick={() => navigate("/service/rescue-publish")}>
          发布救助请求
        </button>

        {/* 白卡：基地信息 */}
        <section className="pv-card">
          <div className="rsb-tags">
            <span className="rsb-tag">{base.city}</span>
            <span className="rsb-tag">{base.scope}</span>
          </div>
          <h2 className="rsb-name">{base.name}</h2>
          <p className="rsb-desc">{base.desc}</p>

          <h2 className="pv-section-title pv-divider">开放时间</h2>
          <div className="pv-info-row">
            <img src={clock} alt="" />
            <span>{base.open}</span>
          </div>

          <h2 className="pv-section-title">基地地址</h2>
          <div className="pv-info-row">
            <img src={pin} alt="" />
            <span>{base.location}</span>
          </div>

          <h2 className="pv-section-title">接收物种</h2>
          <div className="rsb-line">{base.species}</div>

          <h2 className="pv-section-title">提供的服务</h2>
          <div className="rsb-line">{base.services}</div>
        </section>

        {/* 参与救助活动 */}
        <h2 className="rsb-act-title">参与救助活动</h2>
        <div className="rsb-act-list">
          {ACTIVITIES.map((a) => (
            <button
              className={"rsb-act-card" + (joined === a.key ? " joined" : "")}
              key={a.key}
              onClick={() => setJoined(a.key)}
            >
              <div className="rsb-act-info">
                <p className="rsb-act-label">{a.label}</p>
                <p className="rsb-act-desc">{a.desc}</p>
              </div>
              <span className="rsb-act-state">
                {joined === a.key ? "已报名 ✓" : "去参与 ›"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
