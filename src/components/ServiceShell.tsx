import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Bar from "@/components/Bar";
import CommunityHomeEntry from "@/components/CommunityHomeEntry";
import BottomNav from "@/components/BottomNav";
import { getFavs, toggleFav, shouldShowCategory } from "@/utils/serviceStore";
import {
  getVerifiedMerchants,
  ROLE_UPDATE_EVENT,
  SHOP_UPDATE_EVENT,
  type MerchantProfile,
} from "@/utils/roleStore";
import { getCart, addToCart, cartCount } from "@/utils/cartStore";
import cartIcon from "@/assets/images/mall/cart-empty.png";
import {
  SUB_TABS,
  EXOTIC_GRID,
  QUICK_GRID,
  FILTERS,
  NEARBY,
  PLACES,
  MALL_ITEMS,
  ADOPT_TABS,
  ADOPT_FILTERS,
  ADOPT_LIST,
  RESCUE_BASES,
  countFavInBucket,
  type SvcCard,
  type AdoptPet,
} from "@/utils/serviceData";
import svStetho from "@/assets/images/service/sv-stetho.png";
import svHouseGreen from "@/assets/images/service/sv-house-green.png";
import svHouseBlue from "@/assets/images/service/sv-house-blue.png";
import svBath from "@/assets/images/service/sv-bath.png";
import svTemp from "@/assets/images/service/sv-temp.png";
import svBird from "@/assets/images/service/sv-bird.png";
import svBone from "@/assets/images/service/sv-bone.png";
import svPlane from "@/assets/images/service/sv-plane.png";
import svStarLine from "@/assets/images/service/sv-star-line.png";
import svCorgi from "@/assets/images/service/sv-corgi.jpg";
import svShiba from "@/assets/images/service/sv-shiba.jpg";
import svClinic from "@/assets/images/service/sv-clinic.jpg";
import svHamster from "@/assets/images/service/sv-hamster.jpg";
import svCemetery from "@/assets/images/service/sv-cemetery.jpg";
import svMemorial from "@/assets/images/service/sv-memorial.jpg";
import svOwner from "@/assets/images/service/sv-owner.jpg";
import svKitten from "@/assets/images/service/sv-kitten.jpg";
import svCafe from "@/assets/images/service/sv-cafe.jpg";
import svFeeder from "@/assets/images/service/sv-feeder.jpg";
import svTerrarium from "@/assets/images/service/sv-terrarium.jpg";
import svReptileBox from "@/assets/images/service/sv-reptile-box.jpg";
import svCans from "@/assets/images/service/sv-cans.jpg";
import svParrot from "@/assets/images/service/sv-parrot.jpg";
import svCatbed from "@/assets/images/service/sv-catbed.jpg";
import svWoodHouse from "@/assets/images/service/sv-wood-house.jpg";
import svKibble from "@/assets/images/service/sv-kibble.jpg";
import svVip from "@/assets/images/service/sv-vip.png";
import svAdoptShiba from "@/assets/images/service/sv-adopt-shiba.jpg";
import svAdoptBluecat from "@/assets/images/service/sv-adopt-bluecat.jpg";
import svAdoptHamster from "@/assets/images/service/sv-adopt-hamster.jpg";
import svMale from "@/assets/images/service/sv-male.png";
import svFemale from "@/assets/images/service/sv-female.png";
import svHeart from "@/assets/images/service/sv-heart.png";
import svPin from "@/assets/images/service/sv-pin.png";
import svRescuePark from "@/assets/images/service/sv-rescue-park.jpg";
import svRescueBase from "@/assets/images/service/sv-rescue-base.jpg";
import svRescueThanks from "@/assets/images/service/sv-rescue-thanks.jpg";
import svClock from "@/assets/images/service/sv-clock.png";
import svHelpQuestion from "@/assets/images/service/sv-help-question.png";
import svShield from "@/assets/images/service/sv-shield.png";
import svBirdLine from "@/assets/images/service/sv-bird.png";
import svCamera from "@/assets/images/service/sv-camera.png";
import "@/styles/service.css";

function Card({
  c,
  fav,
  onToggleFav,
  onTagClick,
}: {
  c: SvcCard;
  fav?: boolean;
  onToggleFav?: (id: string) => void;
  onTagClick?: (tag: string, cats?: string[]) => void;
}) {
  return (
    <article className={"sv-card" + (c.person ? " person" : "")}>
      <div className="sv-card-title">
        <h3 className="sv-card-name">{c.name}</h3>
        <img
          className={"sv-card-star" + (fav ? " faved" : "")}
          src={svStarLine}
          alt="收藏"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav?.(c.name);
          }}
        />
      </div>
      <div className="sv-card-body">
        {c.img ? (
          <img className="sv-card-img" src={c.img} alt={c.name} />
        ) : (
          // 无图（商家还没上传店铺图/商品图）用店名首字占位
          <div className="sv-card-img sv-ms-img-empty">{c.name.slice(0, 1)}</div>
        )}
        <div className="sv-card-info">
          <div className="sv-card-tags">
            {c.tags.map((t) => (
              <span
                className="sv-card-tag"
                key={t}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(t, c.cats);
                }}
              >
                {t}
              </span>
            ))}
          </div>
          {c.person ? (
            <p className="sv-card-desc">
              {c.price && <span className="sv-card-price">{c.price}</span>}
              {"　"}
              {c.desc}
            </p>
          ) : (
            <>
              <p className="sv-card-desc">{c.desc}</p>
              {c.skill && <p className="sv-card-skill">{c.skill}</p>}
            </>
          )}
          {c.meta && <p className="sv-card-meta">{c.meta}</p>}
        </div>
      </div>
      {c.person && c.stat && <div className="sv-card-stat">{c.stat}</div>}
    </article>
  );
}

export default function ServiceShell() {
  const [sub, setSub] = useState("服务");
  const [filter, setFilter] = useState("全部");
  const [adoptTab, setAdoptTab] = useState("领养动物");
  const [adoptFilter, setAdoptFilter] = useState("全部");
  const [favs, setFavs] = useState<Record<string, boolean>>(() => getFavs());
  const [cartN, setCartN] = useState<number>(() => cartCount());
  // 认证商家（商家中心发布后自动出现在这里，可按经营类目筛选）
  const [merchants, setMerchants] = useState<
    Array<{ account: string; profile: MerchantProfile; productCount: number; cover: string }>
  >(() => getVerifiedMerchants());
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => setMerchants(getVerifiedMerchants());
    window.addEventListener(ROLE_UPDATE_EVENT, refresh);
    window.addEventListener(SHOP_UPDATE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ROLE_UPDATE_EVENT, refresh);
      window.removeEventListener(SHOP_UPDATE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // 购物车角标实时性：挂载时初始化 + 订阅同页签自定义事件与跨页签 storage 事件。
  // 购物车数据写在 cartStore（G6 模块，不改）；这里只订阅变更后刷新数字。
  useEffect(() => {
    const refresh = () => setCartN(cartCount());
    refresh();
    window.addEventListener("petpal:cart-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("petpal:cart-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleToggleFav = (id: string) => {
    toggleFav(id);
    setFavs(getFavs());
  };

  // 进入分类专属页（只显示该分类下我收藏的服务）
  const jumpCategory = (name: string) => {
    navigate("/service/category?name=" + encodeURIComponent(name));
  };

  // 卡片上的小标签点击：按该卡所属分类过滤附近优选（保留原快捷过滤能力）
  const jumpFilter = (f: string) => {
    setSub("服务");
    setFilter(f);
    setTimeout(() => {
      document.querySelector(".sv-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // 服务页桌面要展示的分类：自动 = 有收藏才显示，或用户在管理里固定显示
  // bucket 映射：EXOTIC_GRID/QUICK_GRID 的 cat 字段
  const buck = (name: string): string => {
    if (name === "异宠专科中心" || name === "环境调试" || name === "鸟类护理") return "异宠专科";
    if (name === "异宠寄养") return "寄养";
    if (name === "医疗问诊") return "医院";
    if (name === "洗护美容") return "洗护";
    if (name === "寄养托管") return "寄养";
    if (name === "上门照护") return "上门";
    return "";
  };
  const cntOf = (name: string) => {
    const b = buck(name);
    return b ? countFavInBucket(b, favs) : 0;
  };
  const visibleExotic = EXOTIC_GRID.filter((c) => shouldShowCategory(c.name, cntOf(c.name)));
  const visibleQuick = QUICK_GRID.filter((g) => shouldShowCategory(g.name, cntOf(g.name)));

  // 认证商家：经营类目 → 附近优选的分类桶（食品/用品没有同名分类，只在"全部"里出现）
  const mBucket = (cat: string): string[] => {
    if (cat === "宠物医疗") return ["医院"];
    if (cat === "宠物美容") return ["洗护"];
    if (cat === "宠物寄养") return ["寄养"];
    if (cat === "异宠专营") return ["异宠专科"];
    return [];
  };
  // 所有账号（含未认证的普通用户）打开服务页时，都会在「附近优选」里看到这些店铺
  const merchantCards = merchants
    .filter((m) => filter === "全部" || mBucket(m.profile.category).includes(filter))
    .map((m) => ({
      account: m.account,
      card: {
        img: m.cover,
        name: m.profile.shopName,
        tags: [m.profile.category, "已认证商家"],
        desc: m.profile.intro || "这家店铺还没有填写店铺简介。",
        skill: `在售 ${m.productCount} 件 · 支持到店自提`,
        meta: `地点：${m.profile.address || "地址待完善"}`,
        cats: mBucket(m.profile.category),
      } as SvcCard,
    }));

  return (
    <div className="sv-stage">
      <div className="sv-canvas">
        {/* 顶部：小标语 + 大标题（消息/购物车入口在右侧侧边快捷栏） */}
        <header className="sv-head">
          <div className="sv-head-row">
            <div>
              <p className="sv-head-sub">犬猫与异宠服务专科</p>
              <h1 className="sv-head-title">服务</h1>
            </div>
          </div>
        </header>

        {/* 二级 Tab 分段选择器：服务 / 商城 / 领养公益 */}
        <div className="sv-subtabs">
          {SUB_TABS.map((t) => (
            <button
              key={t}
              className={"sv-subtab" + (sub === t ? " active" : "")}
              onClick={() => setSub(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="sv-content">
        {/* 搜索框 */}
        <div className="sv-search-row">
          <button
            className="sv-search"
            onClick={() => navigate("/service/search?sub=" + encodeURIComponent(sub))}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <span>{sub === "商城" ? "搜索适合米糕或异宠的商品" : "搜索异宠医生、寄养或环境服务"}</span>
          </button>
          {/* 购物车入口在服务主界面常驻可见；角标订阅变更事件实时刷新 */}
          <button
            className="sv-mall-cart"
            aria-label="购物车"
            onClick={() => navigate("/mall/cart")}
          >
            <img src={cartIcon} alt="购物车" />
            {cartN > 0 && <span className="sv-mall-cart-badge">{cartN}</span>}
          </button>
        </div>

        {sub === "服务" && (
          <>
            {/* 异宠专科中心 深绿 banner */}
            <section className="sv-banner">
              <div className="sv-banner-left">
                <p className="sv-banner-en">EXOTIC CARE</p>
                <h2 className="sv-banner-title">异宠专科中心</h2>
                <p className="sv-banner-desc">按物种匹配医生、护理与寄养，服务前共享专属档案。</p>
              </div>
              <button className="sv-banner-btn" onClick={() => navigate("/service/category?name=" + encodeURIComponent("异宠专科中心"))}>查看适配服务</button>
            </section>

            {/* 异宠专科 2×2 大卡（自动：仅显示有收藏或被固定的分类） */}
            {visibleExotic.length > 0 && (
              <div className="sv-exotic-grid">
                {visibleExotic.map((c) => {
                  const n = cntOf(c.name);
                  return (
                    <button
                      className="sv-exotic-card"
                      key={c.name}
                      onClick={() => jumpCategory(c.name)}
                    >
                      <img className="sv-exotic-icon" src={c.icon} alt={c.name} />
                      <div className="sv-exotic-text">
                        <p className="sv-exotic-name">
                          {c.name}
                          {n > 0 && <span className="sv-cat-badge">{n} 项</span>}
                        </p>
                        <p className="sv-exotic-desc">{c.desc}</p>
                      </div>
                      <svg className="sv-exotic-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 通用服务一行四宫格（自动：仅显示有收藏或被固定的分类） */}
            {visibleQuick.length > 0 && (
              <div className="sv-quick-grid">
                {visibleQuick.map((g) => {
                  const n = cntOf(g.name);
                  return (
                    <button
                      className="sv-quick-item"
                      key={g.name}
                      onClick={() => jumpCategory(g.name)}
                    >
                      <span className={"sv-quick-icon tint-" + g.tint}>
                        <img src={g.icon} alt={g.name} />
                      </span>
                      <span className="sv-quick-name">
                        {g.name}
                        {n > 0 && <span className="sv-cat-badge">{n}</span>}
                      </span>
                      <span className="sv-quick-desc">{g.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 附近优选标题行：左标题 右地图查看 */}
            <div className="sv-section-head">
              <h2 className="sv-section-title">附近优选</h2>
              {/* 地图视图暂未开放：置灰标注，保持视觉不隐藏 */}
              <button className="sv-section-link disabled" aria-disabled="true" title="地图查看即将上线">
                地图查看 · 即将上线
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            {/* 分类胶囊 */}
            <div className="sv-filters">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={"sv-filter" + (filter === f ? " active" : "")}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* 附近优选卡片列表（按分类胶囊过滤）：认证商家发布的店铺排在最前，任何账号都能看到 */}
            <div className="sv-list">
              {merchantCards.map(({ account, card }) => (
                <div
                  key={"shop-" + account}
                  onClick={() => navigate("/shop?m=" + encodeURIComponent(account))}
                  style={{ cursor: "pointer" }}
                >
                  <Card
                    c={card}
                    fav={!!favs[card.name]}
                    onToggleFav={handleToggleFav}
                    onTagClick={(_tag, cats) => jumpFilter(cats?.[0] ?? "全部")}
                  />
                </div>
              ))}
              {NEARBY.filter((c) => filter === "全部" || (c.cats ?? []).includes(filter)).map((c) => (
                <div
                  key={c.name}
                  onClick={() => navigate("/service/detail?name=" + encodeURIComponent(c.name))}
                  style={{ cursor: "pointer" }}
                >
                  <Card
                    c={c}
                    fav={!!favs[c.name]}
                    onToggleFav={handleToggleFav}
                    onTagClick={(_tag, cats) => jumpFilter(cats?.[0] ?? "全部")}
                  />
                </div>
              ))}
            </div>

            {/* 友宠场所推荐标题行 */}
            <div className="sv-place-head">
              <div>
                <h2 className="sv-section-title">友宠场所推荐</h2>
                <p className="sv-place-desc">酒店、寄宿与训练，提前确认接收物种和服务条件。</p>
              </div>
              <button className="sv-section-link" onClick={() => navigate("/service/category?name=" + encodeURIComponent("上门照护"))}>
                查看全部
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            {/* 友宠场所卡片 */}
            <div className="sv-list">
              {PLACES.map((c) => (
                <div
                  key={c.name}
                  onClick={() => navigate("/service/detail?name=" + encodeURIComponent(c.name))}
                  style={{ cursor: "pointer" }}
                >
                  <Card
                    c={c}
                    fav={!!favs[c.name]}
                    onToggleFav={handleToggleFav}
                    onTagClick={(_tag, cats) => jumpFilter(cats?.[0] ?? "全部")}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {sub === "商城" && (
          <>
            {/* SHOPPING CASES 区块 */}
            <section className="sv-mall-banner">
              <div className="sv-mall-text">
                <p className="sv-mall-en">SHOPPING CASES</p>
                <h2 className="sv-mall-title">按照养护场景选购</h2>
                <p className="sv-mall-sub">主粮、环境、出行和护理，30件常用商品一次看完。</p>
              </div>
              <div className="sv-mall-thumbs">
                <img src={svCatbed} alt="" />
                <img src={svKibble} alt="" />
                <img src={svWoodHouse} alt="" />
              </div>
            </section>

            {/* 为米糕精准挑选（个性化推荐暂未开放：置灰标注，保持视觉不隐藏） */}
            <section className="sv-vip-bar disabled" aria-disabled="true">
              <img className="sv-vip-icon" src={svVip} alt="精准挑选" />
              <div className="sv-vip-text">
                <p className="sv-vip-title">为米糕精准挑选</p>
                <p className="sv-vip-desc">个性化精选即将上线，已自动避开鸡肉蛋白，也可以切换到异宠专科用品。</p>
              </div>
              <svg className="sv-vip-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </section>

            {/* 商品推荐标题 */}
            <h2 className="sv-section-title sv-mall-head">商品推荐</h2>

            {/* 商品网格 2 列 */}
            <div className="sv-mall-grid">
              {MALL_ITEMS.map((p) => (
                <article
                  className="sv-product"
                  key={p.title}
                  onClick={() => navigate("/mall/product?title=" + encodeURIComponent(p.title))}
                  style={{ cursor: "pointer" }}
                >
                  <img className="sv-product-img" src={p.img} alt={p.title} />
                  <div className="sv-product-info">
                    <p className="sv-product-title">{p.title}</p>
                    <div className="sv-product-row">
                      <p className="sv-product-price">{p.price}</p>
                      <p className="sv-product-sales">{p.sales}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {sub === "领养公益" && (
          <>
            {/* 公益 banner */}
            <section className="sv-adopt-banner">
              <div className="sv-adopt-banner-text">
                <p className="sv-adopt-banner-en">让相遇成为家</p>
                <h2 className="sv-adopt-banner-title">认真领养，负责一生</h2>
                <p className="sv-adopt-banner-sub">信息核验 · 领养审核 · 异宠适配提醒</p>
              </div>
              <img className="sv-adopt-heart" src={svHeart} alt="" />
            </section>

            {/* 三段子切换 */}
            <div className="sv-adopt-seg">
              {ADOPT_TABS.map((t) => (
                <button
                  key={t}
                  className={"sv-adopt-seg-item" + (adoptTab === t ? " active" : "")}
                  onClick={() => setAdoptTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {adoptTab === "领养动物" && (
              <>
                {/* 分类胶囊 */}
                <div className="sv-adopt-filters">
                  {ADOPT_FILTERS.map((f) => (
                    <button
                      key={f}
                      className={"sv-adopt-filter" + (adoptFilter === f ? " active" : "")}
                      onClick={() => setAdoptFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <h2 className="sv-section-title sv-adopt-head">等待一个家</h2>

                {/* 领养动物列表 */}
                <div className="sv-adopt-list">
                  {ADOPT_LIST.filter((p) => adoptFilter === "全部" || p.kind === adoptFilter).map((p) => (
                    <div
                      className="sv-adopt-card"
                      key={p.name}
                      onClick={() => navigate("/service/pet?name=" + encodeURIComponent(p.name))}
                      style={{ cursor: "pointer" }}
                    >
                      <img className="sv-adopt-img" src={p.img} alt={p.name} />
                      <div className="sv-adopt-info">
                        <div className="sv-adopt-row sv-adopt-row-top">
                          <h3 className="sv-adopt-name">{p.name}</h3>
                          <span className="sv-adopt-price">{p.price}</span>
                          <img className={"sv-adopt-star" + (favs[p.name] ? " faved" : "")} src={svStarLine} alt="收藏" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); handleToggleFav(p.name); }} />
                        </div>
                        <div className="sv-adopt-row sv-adopt-row-meta">
                          <img className="sv-adopt-gender" src={p.gender === "m" ? svMale : svFemale} alt="" />
                          <span className="sv-adopt-breed">{p.breed}</span>
                          <span className="sv-adopt-age">{p.age}</span>
                        </div>
                        <p className="sv-adopt-desc">{p.desc}</p>
                        <div className="sv-adopt-tags">
                          {p.tags.map((t) => (
                            <span key={t.label} className={"sv-adopt-tag tone-" + t.tone}>{t.label}</span>
                          ))}
                        </div>
                        <div className="sv-adopt-row sv-adopt-row-loc">
                          <img className="sv-adopt-pin" src={svPin} alt="" />
                          <span>{p.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {adoptTab === "救助基地" && (
              <>
                {/* 深绿 RESCUE RESOURCE MAP banner */}
                <section className="sv-rescue-banner">
                  <div className="sv-rescue-banner-text">
                    <p className="sv-rescue-banner-en">RESCUE RESOURCE MAP</p>
                    <h2 className="sv-rescue-banner-title">先了解，再出发</h2>
                    <p className="sv-rescue-banner-desc">
                      这里汇总的是长沙公开可核验的领养与救助资源。每个资源的接收物种、开放时间和场地都可能变化，出发前请先联系确认。
                    </p>
                  </div>
                  <img className="sv-rescue-banner-pin" src={svPin} alt="" />
                </section>

                {/* 救助基地卡 */}
                <div className="sv-rescue-list">
                  {RESCUE_BASES.map((b) => (
                    <article className="sv-rescue-card" key={b.name} onClick={() => navigate("/service/rescue?name=" + encodeURIComponent(b.name))} style={{ cursor: "pointer" }}>
                      <div className="sv-rescue-cover">
                        <img className="sv-rescue-img" src={b.img} alt={b.name} />
                        <span className="sv-rescue-verified">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
                            <path d="M9 12l2 2 4-4" />
                          </svg>
                          已核验信息源
                        </span>
                      </div>
                      <div className="sv-rescue-body">
                        <div className="sv-rescue-row-top">
                          <span className="sv-rescue-city">{b.city}</span>
                          <span className="sv-rescue-scope">{b.scope}</span>
                        </div>
                        <h3 className="sv-rescue-name">{b.name}</h3>
                        <p className="sv-rescue-desc">{b.desc}</p>
                        <div className="sv-rescue-line">
                          <img className="sv-rescue-line-icon" src={svClock} alt="" />
                          <span>{b.open}</span>
                        </div>
                        <div className="sv-rescue-line">
                          <img className="sv-rescue-line-icon" src={svPin} alt="" />
                          <span>{b.location}</span>
                        </div>
                        <div className="sv-rescue-tags">
                          <span className="sv-rescue-tag">{b.species}</span>
                          <span className="sv-rescue-tag">{b.services}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {adoptTab === "我要救助" && (
              <section className="sv-support-card">
                <p className="sv-support-en">RESCUE SUPPORT</p>
                <h2 className="sv-support-title">发现需要帮助的动物?</h2>
                <p className="sv-support-desc">
                  提交地点、物种和现场情况，PetPal 会把信息写入救助队列，方便后续匹配基地与志愿者。
                </p>
                <div className="sv-support-actions">
                  <button className="sv-support-btn sv-support-btn-primary" onClick={() => navigate("/service/rescue-publish")}>
                    <img src={svHelpQuestion} alt="" />
                    提交救助请求
                  </button>
                  <button className="sv-support-btn sv-support-btn-ghost" onClick={() => setAdoptTab("救助基地")}>
                    <img src={svPin} alt="" />
                    查看附近资源
                  </button>
                </div>
                <div className="sv-support-tips">
                  <div className="sv-support-tip">
                    <img src={svShield} alt="" />
                    <span>不要擅自抓捕受伤动物</span>
                  </div>
                  <div className="sv-support-tip">
                    <img src={svBirdLine} alt="" />
                    <span>异宠先联系专科或有经验的救助人</span>
                  </div>
                  <div className="sv-support-tip">
                    <img src={svCamera} alt="" />
                    <span>尽量上传环境与伤情照片</span>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* 底部导航 */}
        <Bar />
        <CommunityHomeEntry />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
