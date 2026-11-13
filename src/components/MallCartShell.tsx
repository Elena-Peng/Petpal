// 购物车页：/mall/cart
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import BottomNav from "@/components/BottomNav";
import {
  getCart,
  setQty,
  removeItem,
  clearCart,
  type CartItem,
} from "@/utils/cartStore";
import { createOrderFromCart } from "@/utils/orderStore";
import {
  getAddresses,
  getDefaultAddress,
  toSnapshot,
  type Address,
} from "@/utils/addressStore";
import cartEmptyIcon from "@/assets/images/mall/cart-empty.png";
import "@/styles/service.css";
import "@/styles/orders.css";

export default function MallCartShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<CartItem[]>(() => getCart());
  const [picked, setPicked] = useState<Record<string, boolean>>(() => {
    // 默认全选
    const m: Record<string, boolean> = {};
    getCart().forEach((x) => (m[x.id] = true));
    return m;
  });
  const [addresses, setAddresses] = useState<Address[]>(() => getAddresses());
  const [addrId, setAddrId] = useState<string>(
    () => getDefaultAddress()?.id ?? ""
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addrPickerOpen, setAddrPickerOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };

  // 立即购买（从商品页跳入）：直接进入确认订单步骤
  useEffect(() => {
    const buyNow = (location.state as { buyNow?: boolean } | null)?.buyNow;
    if (buyNow && getCart().length > 0) {
      const list = getAddresses();
      if (list.length > 0) setConfirmOpen(true);
    }
    // 仅在挂载时读取一次跳转来源
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allPicked = items.length > 0 && items.every((x) => picked[x.id]);
  const pickedItems = items.filter((x) => picked[x.id]);
  const sum = pickedItems.reduce((s, x) => s + x.qty * x.price, 0);
  const count = pickedItems.reduce((s, x) => s + x.qty, 0);

  // 返回：优先来源页 state.from，无历史/深链进入时兜底商城
  const back = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : "/service?sub=商城");
  };

  const toggleAll = () => {
    const next: Record<string, boolean> = {};
    items.forEach((x) => (next[x.id] = !allPicked));
    setPicked(next);
  };
  const toggleOne = (id: string) =>
    setPicked((p) => ({ ...p, [id]: !p[id] }));

  const changeQty = (id: string, d: number) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    setItems(setQty(id, it.qty + d));
  };
  const remove = (id: string) => {
    setItems(removeItem(id));
  };

  // 去结算：先校验收货地址，无地址拦截并引导新增
  const handleCheckout = () => {
    if (count === 0) {
      showToast("请先勾选要结算的商品");
      return;
    }
    const list = getAddresses();
    if (list.length === 0) {
      showToast("请先添加收货地址");
      navigate("/mine/address?redirect=/mall/cart");
      return;
    }
    setAddresses(list);
    if (!addrId || !list.find((a) => a.id === addrId)) {
      const def = getDefaultAddress();
      setAddrId(def?.id ?? list[0].id);
    }
    setAddrPickerOpen(false);
    setConfirmOpen(true);
  };

  const selectedAddr = addresses.find((a) => a.id === addrId);

  const handleSubmit = () => {
    if (!selectedAddr) {
      showToast("请选择收货地址");
      return;
    }
    const snapshot = toSnapshot(selectedAddr);
    const payload = pickedItems.map((x) => ({
      title: x.title,
      price: x.price,
      img: x.img,
      qty: x.qty,
    }));
    const order = createOrderFromCart(payload, snapshot);
    if (!order) {
      showToast("结算失败，请重试");
      return;
    }
    clearCart();
    setItems([]);
    setConfirmOpen(false);
    navigate("/orders", { state: { justOrdered: true } });
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas">
        <header className="sv-head">
          <div className="sv-head-row">
            <div>
              <button
                className="cp-back"
                aria-label="返回"
                onClick={back}
                style={{ marginBottom: 8 }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <p className="sv-head-sub">已选 {count} 件</p>
              <h1 className="sv-head-title">购物车</h1>
            </div>
          </div>
        </header>

        <div className="sv-content">
          {items.length === 0 ? (
            <div className="sv-empty">
              <img src={cartEmptyIcon} alt="购物车为空" style={{ width: 72, height: 72, opacity: 0.4, marginBottom: 16 }} />
              <p className="sv-empty-title">购物车还是空的</p>
              <p className="sv-empty-desc">去商城挑几件适合毛孩子的好物吧</p>
              <button
                className="sv-empty-btn"
                onClick={() => navigate("/service?sub=商城")}
              >
                去逛逛
              </button>
            </div>
          ) : (
            <>
              <div className="mc-list">
                {items.map((it) => (
                  <div className="mc-row" key={it.id}>
                    <button
                      className={"mc-check" + (picked[it.id] ? " on" : "")}
                      onClick={() => toggleOne(it.id)}
                      aria-label="选择"
                    >
                      {picked[it.id] && (
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </button>
                    <img className="mc-img" src={it.img} alt={it.title} />
                    <div className="mc-info">
                      <p className="mc-title">{it.title}</p>
                      <p className="mc-price">¥ {it.price.toFixed(2)}</p>
                      <div className="mc-qty">
                        <button onClick={() => changeQty(it.id, -1)} disabled={it.qty <= 1}>−</button>
                        <span>{it.qty}</span>
                        <button onClick={() => changeQty(it.id, 1)}>＋</button>
                        <button className="mc-del" onClick={() => remove(it.id)}>删除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mc-footer">
                <button className={"mc-check mc-check-all" + (allPicked ? " on" : "")} onClick={toggleAll}>
                  {allPicked && (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </button>
                <span className="mc-all-label">全选</span>
                <span className="mc-sum">合计：<b>¥ {sum.toFixed(2)}</b></span>
                <button className="mc-pay" onClick={handleCheckout}>
                  去结算（{count}）
                </button>
              </div>
            </>
          )}
        </div>

        {/* 确认订单弹层：核对收货地址 / 商品清单 / 合计金额 */}
        {confirmOpen && (
          <div className="co-mask" onClick={() => setConfirmOpen(false)}>
            <div className="co-panel" onClick={(e) => e.stopPropagation()}>
              <div className="co-head">
                <h2 className="co-title">确认订单</h2>
                <button className="co-close" aria-label="关闭" onClick={() => setConfirmOpen(false)}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="co-body">
                {/* 收货地址 */}
                {selectedAddr ? (
                  <div className="co-address">
                    <div className="co-address-main">
                      <p className="co-address-contact">
                        {selectedAddr.name}　{selectedAddr.phone}
                        {selectedAddr.isDefault && <span className="ad-default">默认</span>}
                      </p>
                      <p className="co-address-detail">
                        {`${selectedAddr.province}${selectedAddr.city}${selectedAddr.district}${selectedAddr.detail}`}
                      </p>
                    </div>
                    {addresses.length > 1 && (
                      <button
                        className="co-address-switch"
                        onClick={() => setAddrPickerOpen((v) => !v)}
                      >
                        {addrPickerOpen ? "收起" : "切换"}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    className="co-address-add"
                    onClick={() => navigate("/mine/address?redirect=/mall/cart")}
                  >
                    ＋ 请先添加收货地址
                  </button>
                )}

                {/* 地址切换列表 */}
                {addrPickerOpen && addresses.length > 1 && (
                  <div className="co-addr-list">
                    {addresses.map((a) => (
                      <button
                        key={a.id}
                        className={"co-addr-item" + (a.id === addrId ? " on" : "")}
                        onClick={() => {
                          setAddrId(a.id);
                          setAddrPickerOpen(false);
                        }}
                      >
                        <span className="co-addr-contact">{a.name}　{a.phone}</span>
                        <span className="co-addr-detail">{`${a.province}${a.city}${a.district}${a.detail}`}</span>
                      </button>
                    ))}
                    <button
                      className="co-address-add"
                      onClick={() => navigate("/mine/address?redirect=/mall/cart")}
                    >
                      ＋ 新增收货地址
                    </button>
                  </div>
                )}

                {/* 商品清单 */}
                <div className="co-items">
                  {pickedItems.map((x) => (
                    <div className="co-item" key={x.id}>
                      <img className="co-item-img" src={x.img} alt={x.title} />
                      <div className="co-item-info">
                        <p className="co-item-title">{x.title}</p>
                        <p className="co-item-qty">x{x.qty}</p>
                      </div>
                      <span className="co-item-price">¥ {x.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="co-total">
                  合计：<b>¥ {sum.toFixed(2)}</b>
                </div>
              </div>

              <div className="co-footer">
                <button className="co-cancel" onClick={() => setConfirmOpen(false)}>
                  取消
                </button>
                <button className="co-submit" onClick={handleSubmit}>
                  提交订单
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="ord-toast">{toast}</div>}

        <BottomNav />
      </div>
    </div>
  );
}
