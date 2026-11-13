import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import "@/styles/service.css";
import "@/styles/orders.css";
import { getOrders, updateOrderStatus, removeOrder, type Order } from "@/utils/orderStore";
import type { AddressSnapshot } from "@/utils/addressStore";

import bowl from "@/assets/images/mine/ord-bowl.jpg";
import food from "@/assets/images/mine/ord-food.jpg";
import iconAll from "@/assets/images/mine/ord-all.png";
import iconPay from "@/assets/images/mine/ord-pay.png";
import iconShip from "@/assets/images/mine/ord-ship.png";
import iconReceive from "@/assets/images/mine/ord-receive.png";
import iconReview from "@/assets/images/mine/ord-review.png";
import iconAfter from "@/assets/images/mine/ord-after.png";
import iconSearch from "@/assets/images/mine/ord-search.png";

const TABS = [
  { icon: iconAll, label: "我的订单", statusFilter: null },
  { icon: iconPay, label: "待支付", statusFilter: "待支付" },
  { icon: iconShip, label: "待发货", statusFilter: "待发货" },
  { icon: iconReceive, label: "待收货", statusFilter: "待收货" },
  { icon: iconReview, label: "评价", statusFilter: "交易完成" },
  { icon: iconAfter, label: "售后", statusFilter: "售后" },
];

// 演示订单（静态）
const DEMO_ORDERS = [
  {
    shop: "乐乐宠物馆",
    status: "待收货",
    img: bowl,
    title: "厂家直销批发狗碗猫碗密胺防...",
    spec: "白色/17*6",
    price: "¥12.00",
    qty: "x2",
    total: "¥24.00",
  },
  {
    shop: "纯皓（Nutrifresh）自营店",
    status: "交易完成",
    img: food,
    title: "纯皓（Nutrifresh）狗粮小型幼...",
    spec: "源边犬/3kg/袋",
    price: "¥49.00",
    qty: "x1",
    total: "¥49.00",
  },
];

type OrderView = {
  key: string;
  shop: string;
  status: string;
  img: string;
  title: string;
  spec: string;
  price: string;
  qty: string;
  total: string;
  address: AddressSnapshot | null;
  actions: { label: string; tone: string }[];
};

function actionsFor(status: string) {
  if (status === "待收货")
    return [
      { label: "更多", tone: "plain" },
      { label: "申请售后", tone: "outline" },
      { label: "查看物流", tone: "outline" },
      { label: "确认收货", tone: "solid-red" },
    ];
  if (status === "待发货")
    return [
      { label: "更多", tone: "plain" },
      { label: "申请售后", tone: "outline" },
      { label: "提醒发货", tone: "outline" },
      { label: "取消订单", tone: "outline-red" },
    ];
  if (status === "待支付")
    return [
      { label: "更多", tone: "plain" },
      { label: "取消订单", tone: "outline" },
      { label: "去支付", tone: "solid-red" },
    ];
  if (status === "交易完成")
    return [
      { label: "更多", tone: "plain" },
      { label: "申请售后", tone: "outline" },
      { label: "再来一单", tone: "outline" },
      { label: "去评价", tone: "outline-red" },
    ];
  return [
    { label: "更多", tone: "plain" },
    { label: "申请售后", tone: "outline" },
    { label: "查看物流", tone: "outline" },
  ];
}

function fromRealOrder(o: Order): OrderView {
  const first = o.items[0];
  const more = o.items.length - 1;
  return {
    key: o.id,
    shop: o.shop,
    status: o.status,
    img: first.img,
    title: first.title + (more > 0 ? ` 等 ${o.items.length} 件商品` : ""),
    spec: "PetPal 商城订单",
    price: "¥" + first.price.toFixed(2),
    qty: "x" + first.qty,
    total: "¥" + o.total.toFixed(2),
    address: o.address ?? null,
    actions: actionsFor(o.status),
  };
}

function fromDemo(d: (typeof DEMO_ORDERS)[number], i: number): OrderView {
  return {
    key: "demo-" + i,
    shop: d.shop,
    status: d.status,
    img: d.img,
    title: d.title,
    spec: d.spec,
    price: d.price,
    qty: d.qty,
    total: d.total,
    address: null,
    actions: actionsFor(d.status),
  };
}

export default function OrdersShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  // 返回：优先来源页 state.from，无历史/深链进入时兜底“我的”
  const back = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : "/mine");
  };
  // 支持 ?tab= 定位到对应状态（我的订单/待支付/待发货/待收货/评价/售后）
  const initialTab = Math.max(
    0,
    TABS.findIndex((t) => t.label === params.get("tab")) >= 0
      ? TABS.findIndex((t) => t.label === params.get("tab"))
      : 0
  );
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toast, setToast] = useState("");

  // 合并：真实订单在前（最新下单的），演示订单在后；存 state 以支持状态流转
  const [all, setAll] = useState<OrderView[]>(() => [
    ...getOrders().map(fromRealOrder),
    ...DEMO_ORDERS.map(fromDemo),
  ]);

  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };

  // 结算跳转回来：提示下单成功
  useEffect(() => {
    if ((location.state as { justOrdered?: boolean } | null)?.justOrdered) {
      notify("下单成功");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 状态流转：更新某订单状态并重算按钮
  const changeStatus = (key: string, status: string) => {
    setAll((prev) => {
      const next = prev.map((o) =>
        o.key === key ? { ...o, status, actions: actionsFor(status) } : o
      );
      return next;
    });
    // 真实订单写回 store 持久化；演示订单仅内存流转
    if (!key.startsWith("demo-")) updateOrderStatus(key, status as Order["status"]);
  };

  const removeOne = (key: string) => {
    setAll((prev) => prev.filter((o) => o.key !== key));
    if (!key.startsWith("demo-")) removeOrder(key);
  };

  const handleAction = (o: OrderView, label: string) => {
    switch (label) {
      case "去支付":
        changeStatus(o.key, "待发货");
        notify("支付成功，商品准备发货");
        break;
      case "确认收货":
        changeStatus(o.key, "交易完成");
        notify("已确认收货，感谢你的信任");
        break;
      case "取消订单":
        removeOne(o.key);
        notify("订单已取消");
        break;
      case "申请售后":
        changeStatus(o.key, "售后");
        notify("售后申请已提交，请等待处理");
        break;
      case "提醒发货":
        notify("已提醒卖家尽快发货");
        break;
      case "查看物流":
        notify("物流：运输中，预计明日送达");
        break;
      case "再来一单":
        notify("已为你重新下单");
        break;
      case "去评价":
        notify("评价功能即将上线，敬请期待");
        break;
      case "更多":
        notify("更多操作敬请期待");
        break;
      default:
        notify("操作成功");
    }
  };

  const filter = TABS[activeTab].statusFilter;
  const orders = filter ? all.filter((o) => o.status === filter) : all;

  return (
    <div className="sv-stage">
      <div className="sv-canvas ord-canvas">
        {/* 顶部返回 + 搜索 */}
        <header className="ord-head">
          <button className="ord-back" onClick={back} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="ord-search">
            <img src={iconSearch} alt="" />
            <span>搜索商品名/订单号/快递单号</span>
          </div>
          <button className="ord-more" aria-label="更多">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </header>

        {/* 状态 Tab */}
        <section className="ord-tabs">
          {TABS.map((t, i) => (
            <div
              className={"ord-tab" + (i === activeTab ? " ord-tab-active" : "")}
              key={t.label}
              onClick={() => setActiveTab(i)}
            >
              <img src={t.icon} alt="" />
              <span>{t.label}</span>
            </div>
          ))}
        </section>

        {/* 订单卡 */}
        {orders.length === 0 ? (
          <div className="ord-empty">
            <p className="ord-empty-title">暂无相关订单</p>
            <p className="ord-empty-desc">去商城挑几件适合毛孩子的好物吧</p>
            <button className="ord-empty-btn" onClick={() => navigate("/service?sub=商城")}>
              去逛逛
            </button>
          </div>
        ) : (
          orders.map((o) => (
            <article className="ord-card" key={o.key}>
              <div className="ord-card-head">
                <span className="ord-shop">
                  {o.shop}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
                <span className={"ord-status " + (o.status === "交易完成" ? "ord-status-gray" : "ord-status-red")}>
                  {o.status}
                </span>
              </div>
              <div className="ord-item">
                <img className="ord-item-img" src={o.img} alt={o.title} />
                <div className="ord-item-info">
                  <p className="ord-item-title">{o.title}</p>
                  <p className="ord-item-spec">{o.spec}</p>
                </div>
                <div className="ord-item-price">
                  <span>{o.price}</span>
                  <span className="ord-item-qty">{o.qty}</span>
                </div>
              </div>
              {o.address && (
                <p className="ord-address">
                  {o.address.name}　{o.address.phone} · {o.address.region}{o.address.detail}
                </p>
              )}
              <div className="ord-total">合计：{o.total}</div>
              <div className="ord-actions">
                <span className="ord-act-plain">{o.actions[0].label}</span>
                <div className="ord-act-btns">
                  {o.actions.slice(1).map((a) => (
                    <button key={a.label} className={"ord-btn " + (a.tone === "solid-red" ? "ord-btn-solid" : a.tone === "outline-red" ? "ord-btn-outline-red" : "ord-btn-outline")} onClick={() => handleAction(o, a.label)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))
        )}

        {/* 操作轻提示 */}
        {toast && (
          <div className="ord-toast">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
