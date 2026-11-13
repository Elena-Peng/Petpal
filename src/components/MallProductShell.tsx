// 商品详情页：/mall/product?title=xxx
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { MALL_ITEMS } from "@/utils/serviceData";
import { addToCart, cartCount } from "@/utils/cartStore";
import cartIcon from "@/assets/images/mall/cart-empty.png";
import "@/styles/service.css";
import "@/styles/orders.css";

export default function MallProductShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const title = params.get("title") || "";
  // 匹配不到时不再回退首条商品，渲染“商品不存在”空态
  const item = MALL_ITEMS.find((x) => x.title === title);
  const priceNum = item
    ? parseFloat(String(item.price).replace(/[^\d.]/g, "")) || 0
    : 0;
  const [added, setAdded] = useState(false);
  const [cartN, setCartN] = useState(cartCount());

  // 返回：优先来源页 state.from，无历史/深链进入时兜底商城
  const back = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : "/service?sub=商城");
  };

  const handleAdd = () => {
    if (!item) return;
    addToCart({
      id: item.title,
      title: item.title,
      price: priceNum,
      img: item.img,
    });
    setCartN(cartCount());
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // 立即购买：加入购物车后直接进入购物车页确认步骤（复用同一结算流程）
  const handleBuyNow = () => {
    if (!item) return;
    addToCart({
      id: item.title,
      title: item.title,
      price: priceNum,
      img: item.img,
    });
    navigate("/mall/cart", { state: { buyNow: true } });
  };

  // 商品不存在 / 已下架空态
  if (!item) {
    return (
      <div className="sv-stage">
        <div className="sv-canvas pdp-canvas">
          <header className="pdp-head">
            <button className="pdp-icon" aria-label="返回" onClick={back}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="pdp-title">商品详情</h1>
            <button className="pdp-icon" aria-label="关闭" onClick={() => navigate("/service?sub=商城")}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div className="sv-empty">
            <img src={cartIcon} alt="商品不存在" style={{ width: 72, height: 72, opacity: 0.4, marginBottom: 16 }} />
            <p className="sv-empty-title">商品不存在或已下架</p>
            <p className="sv-empty-desc">你查看的商品可能已移除，去商城看看其它好物吧</p>
            <button className="sv-empty-btn" onClick={() => navigate("/service?sub=商城")}>
              返回商城
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-stage">
      <div className="sv-canvas pdp-canvas">
        {/* 顶部：返回 / 标题 / 关闭 */}
        <header className="pdp-head">
          <button className="pdp-icon" aria-label="返回" onClick={back}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="pdp-title">商品详情</h1>
          <button className="pdp-icon" aria-label="关闭" onClick={() => navigate("/service?sub=商城")}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="pdp-content">
          {/* 大图 */}
          <img className="pdp-img" src={item.img} alt={item.title} />

          <div className="pdp-body">
            {/* 绿色适配标签 */}
            <span className="pdp-tag">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l2.5 6 6.5.5-5 4 1.5 6.5L12 16.8 6.5 20l1.5-6.5-5-4L9.5 9z" />
              </svg>
              适合米糕 · 异宠适配
            </span>

            <h2 className="pdp-name">{item.title}</h2>
            <p className="pdp-desc">{item.sales} · 品质优选，毛孩子放心用</p>
            <p className="pdp-price">{item.price}</p>

            {/* 三宫格服务承诺 */}
            <div className="pdp-promise">
              <div className="pdp-promise-item">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1f6d2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>正品保障</span>
              </div>
              <div className="pdp-promise-item">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1f6d2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
                  <path d="M3 8l9 5 9-5M12 13v8" />
                </svg>
                <span>48小时发货</span>
              </div>
              <div className="pdp-promise-item">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1f6d2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
                <span>宠物适配筛查</span>
              </div>
            </div>

            {/* 配送与保障 */}
            <h3 className="pdp-sec-title">配送与保障</h3>
            <div className="pdp-ship">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1f6d2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
                <path d="M3 8l9 5 9-5M12 13v8" />
              </svg>
              <div>
                <p className="pdp-ship-title">Care+ 会员免运费</p>
                <p className="pdp-ship-desc">上海地区预计 1-2 天送达 · 支持 7 天无理由</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部固定操作栏 */}
        <div className="pdp-footer">
          <button className="pdp-cart-btn" onClick={() => navigate("/mall/cart")}>
            <span className="pdp-cart-icon">
              <img src={cartIcon} alt="购物车" />
              {cartN > 0 && <span className="pdp-cart-badge">{cartN}</span>}
            </span>
            <span>购物车</span>
          </button>
          <button className="pdp-add-btn pdp-add-outline" onClick={handleAdd}>
            {added ? "已加入 ✓" : "加入购物车"}
          </button>
          <button className="pdp-buy-btn" onClick={handleBuyNow}>
            立即购买
          </button>
        </div>
      </div>
    </div>
  );
}
