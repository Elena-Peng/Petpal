// 商家店铺公开页：/shop?m=<商家账号>
// 任意登录/未登录用户都能浏览：其它账号发布的店铺与在售商品在这里可见。
import { useSearchParams, useNavigate, useLocation } from "react-router";
import "@/styles/service.css";
import "@/styles/provider.css";
import "@/styles/merchant.css";
import { getRoles, getShopProducts } from "@/utils/roleStore";

export default function ShopShell() {
  const [params] = useSearchParams();
  const account = params.get("m") || "";
  const merchant = account ? getRoles(account).merchant : null;
  const products = account && merchant?.status === "approved" ? getShopProducts(account) : [];
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine/merchant");
  };

  if (!merchant || merchant.status !== "approved") {
    return (
      <div className="sv-stage">
        <div className="sv-canvas pv-canvas mc-canvas">
          <header className="pv-head pv-head-center">
            <button className="pv-back" onClick={goBack} aria-label="返回">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="pv-head-title">店铺</h1>
            <span className="pv-head-spacer" />
          </header>
          <div className="sv-empty">
            <p className="sv-empty-title">店铺不存在或未认证</p>
            <p className="sv-empty-desc">该店铺可能尚未通过认证，或链接已失效。</p>
            <button className="sv-empty-btn" onClick={() => navigate("/service")}>去服务页逛逛</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-stage">
      <div className="sv-canvas pv-canvas mc-canvas">
        <header className="pv-head pv-head-center">
          <button className="pv-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pv-head-title">店铺</h1>
          <span className="pv-head-spacer" />
        </header>

        <section className="mc-shop is-public">
          {merchant.logo ? (
            <img className="mc-shop-logo" src={merchant.logo} alt={merchant.shopName} />
          ) : (
            <div className="mc-shop-logo mc-shop-logo-empty">{merchant.shopName.slice(0, 1)}</div>
          )}
          <div className="mc-shop-info">
            <div className="mc-shop-name">
              <h2>{merchant.shopName}</h2>
              <span className="mc-pill is-on">已认证商家</span>
            </div>
            <p className="mc-muted">{merchant.category} · {products.length} 件在售</p>
          </div>
        </section>

        {merchant.intro && <p className="mc-shop-intro">{merchant.intro}</p>}
        {(merchant.address || merchant.phone) && (
          <div className="mc-shop-meta">
            {merchant.address && <span>地址：{merchant.address}</span>}
            {merchant.phone && <span>电话：{merchant.phone}</span>}
          </div>
        )}

        <section className="mc-products">
          <div className="mc-section-head">
            <h3>全部商品</h3>
            <span className="mc-muted">{products.length} 件</span>
          </div>
          {products.length === 0 && (
            <div className="mc-empty"><p>商家还没有上架商品</p></div>
          )}
          <div className="mc-grid">
            {products.map((p) => (
              <article className="mc-goods" key={p.id}>
                {p.image ? (
                  <img className="mc-goods-img" src={p.image} alt={p.name} />
                ) : (
                  <div className="mc-goods-img mc-prod-img-empty">{p.name.slice(0, 1)}</div>
                )}
                <p className="mc-goods-name">{p.name}</p>
                <p className="mc-goods-price">¥{p.price}</p>
                <p className="mc-goods-meta">{p.category} · 库存 {p.stock}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
