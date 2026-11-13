import Bar from "@/components/Bar";
import CommunityHomeEntry from "@/components/CommunityHomeEntry";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router";
import { useState, useMemo, useEffect } from "react";
import { getOrders } from "@/utils/orderStore";
import "@/styles/service.css";
import "@/styles/mine.css";
import { getCurrentUser, USER_UPDATE_EVENT } from "@/utils/userStore";

import avatar from "@/assets/images/mine/mine-avatar.jpg";
import careStar from "@/assets/images/mine/care-star.png";
import orderClipboard from "@/assets/images/mine/order-clipboard.png";
import orderPay from "@/assets/images/mine/order-pay.png";
import orderShip from "@/assets/images/mine/order-ship.png";
import orderTruck from "@/assets/images/mine/order-truck.png";
import orderReview from "@/assets/images/mine/order-review.png";
import orderAftersale from "@/assets/images/mine/order-aftersale.png";
import msg from "@/assets/images/mine/msg.png";
import edit from "@/assets/images/mine/edit.png";
import paw from "@/assets/images/mine/paw.png";
import stetho from "@/assets/images/mine/stetho.png";
import cube from "@/assets/images/mine/set-cube.png";
import shield from "@/assets/images/mine/set-shield.png";
import star from "@/assets/images/mine/star.png";
import pin from "@/assets/images/mine/pin.png";
import gear from "@/assets/images/mine/gear.png";
import medal from "@/assets/images/mine/medal.png";
import bookmark from "@/assets/images/mine/bookmark.png";

const ORDERS = [
  { icon: orderClipboard, label: "我的订单", primary: true, path: "/orders", count: null as string | null },
  { icon: orderPay, label: "待支付", path: "/orders?tab=待支付", count: "待支付" },
  { icon: orderShip, label: "待发货", path: "/orders?tab=待发货", count: "待发货" },
  { icon: orderTruck, label: "待收货", path: "/orders?tab=待收货", count: "待收货" },
  { icon: orderReview, label: "评价", path: "/orders?tab=评价", count: "交易完成" },
  { icon: orderAftersale, label: "售后", path: "/orders?tab=售后", count: "售后" },
];

const MENU = [
  { icon: msg, label: "消息管理", path: "/mine/messages" },
  { icon: edit, label: "我的动态", path: "/mine/publishes" },
  { icon: paw, label: "宠物家庭", path: "/mine/health" },
  { icon: stetho, label: "健康档案", path: "/archive" },
  { icon: cube, label: "商家中心", path: "/mine/merchant" },
  { icon: shield, label: "救助站认证", path: "/mine/rescue-station" },
  { icon: star, label: "收藏与关注", path: "/mine/favorites" },
  { icon: pin, label: "地址管理", path: "/mine/address" },
  { icon: medal, label: "我的勋章", path: "/mine/medals" },
  { icon: bookmark, label: "浏览足迹", path: "/mine/history" },
];

export default function MineShell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const loggedIn = !!user;

  // 换头像/改资料后实时刷新本页用户头像与昵称（与首页问候区共用同一数据源）
  useEffect(() => {
    const onUser = () => setUser(getCurrentUser());
    window.addEventListener(USER_UPDATE_EVENT, onUser);
    return () => window.removeEventListener(USER_UPDATE_EVENT, onUser);
  }, []);

  // 各状态订单数量（我的订单格子不显示角标）
  const orderCounts = useMemo(() => {
    const by: Record<string, number> = { 待支付: 0, 待发货: 0, 待收货: 0, 交易完成: 0, 售后: 0 };
    getOrders().forEach((o) => {
      if (o.status in by) by[o.status] += 1;
    });
    return by;
  }, []);

  const handleUserClick = () => {
    if (loggedIn) navigate("/mine/profile/edit");
    else navigate("/login?redirect=" + encodeURIComponent("/mine"));
  };

  // 受保护子页统一走登录校验：未登录带 redirect 跳登录页（与全局守卫口径一致，避免进入空数据子页）
  const openProtected = (path: string) => {
    if (loggedIn) navigate(path);
    else navigate("/login?redirect=" + encodeURIComponent(path));
  };
  return (
    <div className="sv-stage">
      <div className="sv-canvas mine-canvas">
        {/* 顶部：PetPal 左 / 铃铛+齿轮 右 */}
        <header className="mine-head">
          <div className="mine-brand">
            <img
              src="/assets/logo.png"
              alt="PetPal 图标"
              className="mine-brand-logo"
            />
            <img
              src="/assets/wordmark.png"
              alt="PetPal"
              className="mine-brand-word"
            />
          </div>
          <div className="mine-head-actions">
            <button className="mine-head-icon" aria-label="设置" onClick={() => navigate("/settings")}>
              <img src={gear} alt="设置" />
            </button>
          </div>
        </header>

        {/* 用户信息 */}
        <section className="mine-user" onClick={handleUserClick} style={{ cursor: "pointer" }}>
          {loggedIn && user?.avatar && String(user.avatar).startsWith("data:") ? (
            <img className="mine-avatar" src={user.avatar} alt="头像" />
          ) : (
            <div className="mine-avatar mine-avatar-empty" aria-label="暂无头像">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
          )}
          <div className="mine-user-text">
            {loggedIn ? (
              <>
                <h1 className="mine-nick">{user.nickname}</h1>
                <p className="mine-meta">账号：{user.account}</p>
              </>
            ) : (
              <>
                <h1 className="mine-nick">点击登录</h1>
                <p className="mine-meta">登录后可同步收藏、订单与健康档案</p>
              </>
            )}
          </div>
        </section>

        {/* PetPal Care+ 胶囊 */}
        <div className="mine-care">
          <img src={careStar} alt="" />
          <span>PetPal Care+</span>
        </div>

        {/* 订单快捷 */}
        <section className="mine-orders">
          {ORDERS.map((o) => (
            <div
              className={"mine-order" + (o.primary ? " primary" : "")}
              key={o.label}
              onClick={() => o.path && openProtected(o.path)}
              style={{ cursor: o.path ? "pointer" : "default" }}
            >
              <img className="mine-order-icon" src={o.icon} alt={o.label} />
              {o.count && (orderCounts[o.count] ?? 0) > 0 && (
                <span className="mine-order-badge">{orderCounts[o.count]}</span>
              )}
              <span className="mine-order-label">{o.label}</span>
              {o.primary && <span className="mine-order-divider" />}
            </div>
          ))}
        </section>

        <div className="mine-content">
        {/* 菜单列表 */}
        <section className="mine-menu">
          {MENU.map((m) => (
            <button className="mine-menu-row" key={m.label} onClick={() => openProtected(m.path)}>
              <img className="mine-menu-icon" src={m.icon} alt={m.label} />
              <span className="mine-menu-label">{m.label}</span>
              <svg className="mine-menu-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </section>
        </div>

        <Bar />
        <CommunityHomeEntry />
        <BottomNav />
      </div>
    </div>
  );
}
