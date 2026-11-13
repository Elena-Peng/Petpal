// 商家中心：/mine/merchant
// 流程：填资料 → 提交认证（审核中）→（演示）后台通过 → 管理店铺与商品。
// 认证与商品数据都在 roleStore，可平滑迁移到后端 shops / shop_products。
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "@/styles/service.css";
import "@/styles/provider.css";
import "@/styles/merchant.css";
import {
  MERCHANT_CATEGORIES,
  addProduct,
  approveMerchant,
  getMerchant,
  getMyProducts,
  removeProduct,
  submitMerchant,
  toggleProduct,
  updateMerchant,
  ROLE_UPDATE_EVENT,
  SHOP_UPDATE_EVENT,
  type MerchantProfile,
  type ShopProduct,
} from "@/utils/roleStore";
import { getCurrentUser } from "@/utils/userStore";

const PRODUCT_CATS = ["主食", "零食", "用品", "玩具", "保健", "其他"];

function StatusPill({ status }: { status: MerchantProfile["status"] }) {
  if (status === "approved") return <span className="mc-pill is-on">已认证商家</span>;
  if (status === "pending") return <span className="mc-pill is-wait">审核中</span>;
  return <span className="mc-pill">未认证</span>;
}

export default function MerchantShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine");
  };

  const user = getCurrentUser();
  const [merchant, setMerchant] = useState<MerchantProfile | null>(getMerchant());
  const [products, setProducts] = useState<ShopProduct[]>(getMyProducts());
  const [panel, setPanel] = useState<"" | "verify" | "product" | "shop">("");
  const [toast, setToast] = useState("");

  // 表单
  const [form, setForm] = useState({
    shopName: "",
    category: MERCHANT_CATEGORIES[0],
    contact: "",
    phone: "",
    address: "",
    licenseNo: "",
    intro: "",
    logo: "",
  });
  const [shopForm, setShopForm] = useState({ shopName: "", intro: "", phone: "", address: "" });
  const [prod, setProd] = useState({
    name: "",
    price: "",
    stock: "",
    category: PRODUCT_CATS[0],
    desc: "",
    image: "",
  });

  const logoInput = useRef<HTMLInputElement>(null);
  const imgInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => {
      setMerchant(getMerchant());
      setProducts(getMyProducts());
    };
    window.addEventListener(ROLE_UPDATE_EVENT, refresh);
    window.addEventListener(SHOP_UPDATE_EVENT, refresh);
    return () => {
      window.removeEventListener(ROLE_UPDATE_EVENT, refresh);
      window.removeEventListener(SHOP_UPDATE_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const pickImage = (file: File | undefined, key: "logo" | "image") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast("请选择图片文件");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      if (key === "logo") setForm((f) => ({ ...f, logo: url }));
      else setProd((p) => ({ ...p, image: url }));
    };
    reader.readAsDataURL(file);
  };

  const submitVerify = () => {
    if (!form.shopName.trim()) return setToast("请填写店铺名称");
    if (!form.licenseNo.trim()) return setToast("请填写营业执照号");
    if (!/^1\d{10}$/.test(form.phone.trim())) return setToast("请填写 11 位手机号");
    submitMerchant({
      shopName: form.shopName.trim(),
      category: form.category,
      contact: form.contact.trim() || user?.nickname || "",
      phone: form.phone.trim(),
      address: form.address.trim(),
      licenseNo: form.licenseNo.trim(),
      intro: form.intro.trim(),
      logo: form.logo || undefined,
    });
    setPanel("");
    setToast("资料已提交，等待审核");
  };

  const simulateApprove = () => {
    approveMerchant();
    setToast("审核通过，店铺已开通");
  };

  const openShopEdit = () => {
    if (!merchant) return;
    setShopForm({
      shopName: merchant.shopName,
      intro: merchant.intro,
      phone: merchant.phone,
      address: merchant.address,
    });
    setPanel("shop");
  };

  const saveShop = () => {
    if (!shopForm.shopName.trim()) return setToast("店铺名称不能为空");
    updateMerchant({
      shopName: shopForm.shopName.trim(),
      intro: shopForm.intro,
      phone: shopForm.phone,
      address: shopForm.address,
    });
    setPanel("");
    setToast("店铺信息已更新");
  };

  const submitProduct = () => {
    if (!prod.name.trim()) return setToast("请填写商品名称");
    const price = Number(prod.price);
    const stock = Number(prod.stock);
    if (!Number.isFinite(price) || price <= 0) return setToast("请填写有效价格");
    if (!Number.isFinite(stock) || stock < 0) return setToast("请填写库存数量");
    const p = addProduct({
      name: prod.name.trim(),
      price,
      stock,
      category: prod.category,
      desc: prod.desc.trim(),
      image: prod.image || undefined,
    });
    if (!p) return setToast("请先完成商家认证");
    setPanel("");
    setProd({ name: "", price: "", stock: "", category: PRODUCT_CATS[0], desc: "", image: "" });
    setToast("商品已上架");
  };

  const status = merchant?.status ?? "none";

  return (
    <div className="sv-stage">
      <div className="sv-canvas pv-canvas mc-canvas">
        <header className="pv-head pv-head-center">
          <button className="pv-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pv-head-title">商家中心</h1>
          <span className="pv-head-spacer" />
        </header>

        {!user && (
          <div className="sv-empty">
            <p className="sv-empty-title">登录后申请商家认证</p>
            <p className="sv-empty-desc">认证通过后可以开店、发布商品。</p>
            <button className="sv-empty-btn" onClick={() => navigate("/login?redirect=" + encodeURIComponent("/mine/merchant"))}>
              去登录
            </button>
          </div>
        )}

        {user && status === "none" && (
          <>
            <section className="mc-hero">
              <div className="mc-hero-badge">B</div>
              <div className="mc-hero-text">
                <h2>成为 PetPal 认证商家</h2>
                <p>认证后拥有自己的店铺主页，可发布商品、接收用户咨询与订单。</p>
              </div>
            </section>
            <section className="mc-benefits">
              {[
                ["店铺主页", "独立店铺链接，用户可直接浏览与下单"],
                ["商品上架", "随时发布/下架商品，管理库存"],
                ["认证标识", "商品与店铺展示「已认证商家」"],
              ].map(([t, d]) => (
                <div className="mc-benefit" key={t}>
                  <span className="mc-benefit-title">{t}</span>
                  <span className="mc-benefit-desc">{d}</span>
                </div>
              ))}
            </section>
            <button className="mc-primary" onClick={() => setPanel("verify")}>
              申请商家认证
            </button>
          </>
        )}

        {user && status === "pending" && merchant && (
          <>
            <section className="mc-card">
              <div className="mc-card-head">
                <h2>{merchant.shopName}</h2>
                <StatusPill status="pending" />
              </div>
              <p className="mc-muted">资料已提交，平台将在 1–3 个工作日内完成审核。</p>
              <dl className="mc-kv">
                <div><dt>经营类目</dt><dd>{merchant.category}</dd></div>
                <div><dt>营业执照</dt><dd>{merchant.licenseNo}</dd></div>
                <div><dt>联系电话</dt><dd>{merchant.phone}</dd></div>
                <div><dt>经营地址</dt><dd>{merchant.address || "—"}</dd></div>
              </dl>
            </section>
            <div className="mc-row">
              <button className="mc-ghost" onClick={() => setPanel("verify")}>
                修改资料
              </button>
              <button className="mc-primary" onClick={simulateApprove}>
                模拟审核通过
              </button>
            </div>
            <p className="mc-hint">真实上线后这一按钮由运营后台点「通过」触发，前端只读状态。</p>
          </>
        )}

        {user && status === "approved" && merchant && (
          <>
            <section className="mc-shop">
              {merchant.logo ? (
                <img className="mc-shop-logo" src={merchant.logo} alt={merchant.shopName} />
              ) : (
                <div className="mc-shop-logo mc-shop-logo-empty">{merchant.shopName.slice(0, 1)}</div>
              )}
              <div className="mc-shop-info">
                <div className="mc-shop-name">
                  <h2>{merchant.shopName}</h2>
                  <StatusPill status="approved" />
                </div>
                <p className="mc-muted">{merchant.category} · {merchant.address || "未填写地址"}</p>
                <p className="mc-muted">{products.filter((p) => p.status === "on").length} 件在售 · {products.length} 件商品</p>
              </div>
            </section>
            <div className="mc-row">
              <button className="mc-ghost" onClick={openShopEdit}>店铺设置</button>
              <button className="mc-ghost" onClick={() => navigate("/shop?m=" + encodeURIComponent(user.account || ""))}>
                预览店铺
              </button>
              <button className="mc-primary" onClick={() => setPanel("product")}>发布商品</button>
            </div>

            <section className="mc-products">
              <div className="mc-section-head">
                <h3>我的商品</h3>
                <span className="mc-muted">{products.length} 件</span>
              </div>
              {products.length === 0 && (
                <div className="mc-empty">
                  <p>还没有商品</p>
                  <button className="mc-link" onClick={() => setPanel("product")}>发布第一件商品</button>
                </div>
              )}
              {products.map((p) => (
                <article className="mc-prod" key={p.id}>
                  {p.image ? (
                    <img className="mc-prod-img" src={p.image} alt={p.name} />
                  ) : (
                    <div className="mc-prod-img mc-prod-img-empty">{p.name.slice(0, 1)}</div>
                  )}
                  <div className="mc-prod-main">
                    <div className="mc-prod-title">
                      <span>{p.name}</span>
                      <span className={"mc-pill" + (p.status === "on" ? " is-on" : " is-off")}>
                        {p.status === "on" ? "在售" : "已下架"}
                      </span>
                    </div>
                    <p className="mc-prod-meta">¥{p.price} · 库存 {p.stock} · {p.category}</p>
                    <div className="mc-prod-actions">
                      <button className="mc-link" onClick={() => { toggleProduct(p.id); setToast(p.status === "on" ? "已下架" : "已上架"); }}>
                        {p.status === "on" ? "下架" : "上架"}
                      </button>
                      <button className="mc-link is-danger" onClick={() => { removeProduct(p.id); setToast("已删除商品"); }}>
                        删除
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {/* 认证表单 */}
        {panel === "verify" && (
          <div className="mc-sheet-mask" onClick={() => setPanel("")}>
            <div className="mc-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="mc-sheet-bar" />
              <h3 className="mc-sheet-title">商家认证资料</h3>
              <div className="mc-form">
                <label className="mc-field">
                  <span>店铺名称 *</span>
                  <input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="例如：小虎宠物生活馆" />
                </label>
                <label className="mc-field">
                  <span>经营类目 *</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {MERCHANT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="mc-field">
                  <span>联系人</span>
                  <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="负责人姓名" />
                </label>
                <label className="mc-field">
                  <span>手机号 *</span>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="11 位手机号" inputMode="numeric" />
                </label>
                <label className="mc-field">
                  <span>经营地址</span>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="门店或仓库地址" />
                </label>
                <label className="mc-field">
                  <span>营业执照号 *</span>
                  <input value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} placeholder="统一社会信用代码" />
                </label>
                <label className="mc-field">
                  <span>店铺简介</span>
                  <textarea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} rows={3} placeholder="主营品类、服务承诺等" />
                </label>
                <div className="mc-field">
                  <span>店铺 Logo</span>
                  <div className="mc-upload">
                    {form.logo ? <img src={form.logo} alt="logo" /> : <span className="mc-upload-plus">＋</span>}
                    <button className="mc-link" onClick={() => logoInput.current?.click()}>
                      {form.logo ? "更换图片" : "上传图片"}
                    </button>
                    <input
                      ref={logoInput}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => pickImage(e.target.files?.[0], "logo")}
                    />
                  </div>
                </div>
              </div>
              <button className="mc-primary mc-sheet-submit" onClick={submitVerify}>提交认证</button>
            </div>
          </div>
        )}

        {/* 店铺设置 */}
        {panel === "shop" && (
          <div className="mc-sheet-mask" onClick={() => setPanel("")}>
            <div className="mc-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="mc-sheet-bar" />
              <h3 className="mc-sheet-title">店铺设置</h3>
              <div className="mc-form">
                <label className="mc-field">
                  <span>店铺名称</span>
                  <input value={shopForm.shopName} onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })} />
                </label>
                <label className="mc-field">
                  <span>联系电话</span>
                  <input value={shopForm.phone} onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })} />
                </label>
                <label className="mc-field">
                  <span>经营地址</span>
                  <input value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} />
                </label>
                <label className="mc-field">
                  <span>店铺简介</span>
                  <textarea rows={3} value={shopForm.intro} onChange={(e) => setShopForm({ ...shopForm, intro: e.target.value })} />
                </label>
              </div>
              <button className="mc-primary mc-sheet-submit" onClick={saveShop}>保存</button>
            </div>
          </div>
        )}

        {/* 发布商品 */}
        {panel === "product" && (
          <div className="mc-sheet-mask" onClick={() => setPanel("")}>
            <div className="mc-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="mc-sheet-bar" />
              <h3 className="mc-sheet-title">发布商品</h3>
              <div className="mc-form">
                <label className="mc-field">
                  <span>商品名称 *</span>
                  <input value={prod.name} onChange={(e) => setProd({ ...prod, name: e.target.value })} placeholder="例如：鸡肉冻干 250g" />
                </label>
                <div className="mc-field-row">
                  <label className="mc-field">
                    <span>价格（元）*</span>
                    <input value={prod.price} onChange={(e) => setProd({ ...prod, price: e.target.value })} inputMode="decimal" placeholder="0.00" />
                  </label>
                  <label className="mc-field">
                    <span>库存 *</span>
                    <input value={prod.stock} onChange={(e) => setProd({ ...prod, stock: e.target.value })} inputMode="numeric" placeholder="0" />
                  </label>
                </div>
                <label className="mc-field">
                  <span>商品分类</span>
                  <select value={prod.category} onChange={(e) => setProd({ ...prod, category: e.target.value })}>
                    {PRODUCT_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="mc-field">
                  <span>商品描述</span>
                  <textarea rows={3} value={prod.desc} onChange={(e) => setProd({ ...prod, desc: e.target.value })} placeholder="成分、适用宠物、规格" />
                </label>
                <div className="mc-field">
                  <span>商品图片</span>
                  <div className="mc-upload">
                    {prod.image ? <img src={prod.image} alt="商品" /> : <span className="mc-upload-plus">＋</span>}
                    <button className="mc-link" onClick={() => imgInput.current?.click()}>
                      {prod.image ? "更换图片" : "上传图片"}
                    </button>
                    <input
                      ref={imgInput}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => pickImage(e.target.files?.[0], "image")}
                    />
                  </div>
                </div>
              </div>
              <button className="mc-primary mc-sheet-submit" onClick={submitProduct}>上架商品</button>
            </div>
          </div>
        )}

        {toast && <div className="mc-toast">{toast}</div>}
      </div>
    </div>
  );
}
