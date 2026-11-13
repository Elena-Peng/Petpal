// 我的 → 收藏与关注 总览页：/mine/favorites
// 聚合三类收藏：服务者/友宠场所（serviceStore）、领养动物（serviceData）、社区帖子（communityStore 互动存储，只读）。
// 分组计数与实际渲染条目一致；收藏数据来自其它模块既有导出，本页不修改其存储文件。
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import BottomNav from "@/components/BottomNav";
import {
  FAV_CATEGORIES,
  countFavInBucket,
  NEARBY,
  PLACES,
  ADOPT_LIST,
  type SvcCard,
  type AdoptPet,
} from "@/utils/serviceData";
import { getFavs, isCategoryPinned, setCategoryVisible } from "@/utils/serviceStore";
import { getInteractions, getPostId } from "@/utils/communityStore";
import { getAllPosts } from "@/utils/publishStore";
import { ALL_POSTS, type Post } from "@/utils/communityData";
import "@/styles/service.css";

export default function MineFavoritesShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const favs = getFavs();
  const [showManage, setShowManage] = useState(false);
  const [, setTick] = useState(0);

  // 三类收藏条目（计数 = 实际渲染条目，保证口径一致）
  const favNearby = NEARBY.filter((c) => favs[c.name]);
  const favPlaces = PLACES.filter((c) => favs[c.name]);
  const favAdopt = ADOPT_LIST.filter((p) => favs[p.name]);
  const interactions = getInteractions();
  const favPosts = [...getAllPosts(), ...ALL_POSTS].filter(
    (p) => interactions[getPostId(p)]?.favorited
  );
  const total = favNearby.length + favPlaces.length + favAdopt.length + favPosts.length;

  // 返回兜底：有来源页用来源页，无历史记录时固定回我的页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine");
  };

  const exotic = FAV_CATEGORIES.filter((c) => c.group === "异宠专科");
  const common = FAV_CATEGORIES.filter((c) => c.group === "通用服务");

  const renderGroup = (title: string, list: typeof FAV_CATEGORIES) => (
    <section className="mf-group">
      <h2 className="mf-group-title">{title}</h2>
      <div className="mf-list">
        {list.map((c) => {
          const cnt = countFavInBucket(c.bucket, favs);
          const dimmed = cnt === 0 && !isCategoryPinned(c.name);
          return (
            <button
              className={"mf-row" + (dimmed ? " dimmed" : "")}
              key={c.name}
              onClick={() => navigate("/service/category?name=" + encodeURIComponent(c.name))}
            >
              <span className="mf-icon">
                <img src={c.icon} alt="" />
              </span>
              <span className="mf-text">
                <span className="mf-name">{c.name}</span>
                <span className="mf-desc">{c.desc}</span>
              </span>
              <span className={"mf-badge" + (cnt > 0 ? " on" : "")}>
                {cnt > 0 ? `${cnt} 项` : "未收藏"}
              </span>
              <svg className="mf-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderSvcCard = (c: SvcCard) => (
    <article className="sv-card" key={c.name}>
      <div className="sv-card-title">
        <h3 className="sv-card-name">{c.name}</h3>
      </div>
      <div className="sv-card-body">
        <img className="sv-card-img" src={c.img} alt={c.name} />
        <div className="sv-card-info">
          <div className="sv-card-tags">
            {c.tags.map((t) => (
              <span className="sv-card-tag" key={t}>{t}</span>
            ))}
          </div>
          <p className="sv-card-desc">{c.desc}</p>
          {c.meta && <p className="sv-card-meta">{c.meta}</p>}
        </div>
      </div>
    </article>
  );

  const renderAdoptCard = (p: AdoptPet) => (
    <div className="sv-adopt-card" key={p.name}>
      <img className="sv-adopt-img" src={p.img} alt={p.name} />
      <div className="sv-adopt-info">
        <div className="sv-adopt-row sv-adopt-row-top">
          <h3 className="sv-adopt-name">{p.name}</h3>
          <span className="sv-adopt-price">{p.price}</span>
        </div>
        <div className="sv-adopt-row sv-adopt-row-meta">
          <span className="sv-adopt-breed">{p.breed}</span>
          <span className="sv-adopt-age">{p.age}</span>
        </div>
        <p className="sv-adopt-desc">{p.desc}</p>
      </div>
    </div>
  );

  const renderPostCard = (p: Post) => (
    <article
      className="sv-card"
      key={getPostId(p)}
      onClick={() => navigate("/community/post?id=" + encodeURIComponent(getPostId(p)))}
      style={{ cursor: "pointer" }}
    >
      <div className="sv-card-body">
        <img className="sv-card-img" src={p.images?.[0] || p.avatar} alt={p.name} />
        <div className="sv-card-info">
          <h3 className="sv-card-name">{p.name}</h3>
          <p className="sv-card-desc">{p.lines[0]}</p>
        </div>
      </div>
    </article>
  );

  return (
    <div className="sv-stage">
      <div className="sv-canvas">
        <header className="sv-head">
          <div className="sv-head-row">
            <div>
              <button
                className="cp-back"
                aria-label="返回"
                onClick={goBack}
                style={{ marginBottom: 8 }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <p className="sv-head-sub">我收藏的所有服务、领养与帖子</p>
              <h1 className="sv-head-title">收藏与关注（{total}）</h1>
            </div>
            <button className="sv-cat-manage" onClick={() => setShowManage(true)}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              管理
            </button>
          </div>
        </header>

        <div className="sv-content mf-content">
          {total === 0 ? (
            <div className="sv-empty">
              <p className="sv-empty-title">还没有收藏任何内容</p>
              <p className="sv-empty-desc">在服务页收藏服务商、门店或领养动物，在社区收藏感兴趣的帖子，都会汇总到这里。</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="sv-empty-btn" onClick={() => navigate("/service")}>去服务页逛逛</button>
                <button className="sv-empty-btn" onClick={() => navigate("/community")}>去社区看看</button>
              </div>
            </div>
          ) : (
            <>
              {/* 我的全部收藏（服务/领养）入口 */}
              <button className="mf-total" onClick={() => navigate("/service/favorites")}>
                <span className="mf-total-left">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>我的全部收藏</span>
                </span>
                <span className="mf-total-right">
                  {favNearby.length + favPlaces.length + favAdopt.length} 项
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
              </button>

              {favNearby.length > 0 && (
                <>
                  <h2 className="sv-section-title">服务者 / 上门照护（{favNearby.length}）</h2>
                  <div className="sv-list">{favNearby.map(renderSvcCard)}</div>
                </>
              )}
              {favPlaces.length > 0 && (
                <>
                  <h2 className="sv-section-title">友宠场所（{favPlaces.length}）</h2>
                  <div className="sv-list">{favPlaces.map(renderSvcCard)}</div>
                </>
              )}
              {favAdopt.length > 0 && (
                <>
                  <h2 className="sv-section-title">领养动物（{favAdopt.length}）</h2>
                  <div className="sv-adopt-list">{favAdopt.map(renderAdoptCard)}</div>
                </>
              )}
              {favPosts.length > 0 && (
                <>
                  <h2 className="sv-section-title">收藏的帖子（{favPosts.length}）</h2>
                  <div className="sv-list">{favPosts.map(renderPostCard)}</div>
                </>
              )}

              {renderGroup("异宠专科", exotic)}
              {renderGroup("通用服务", common)}

              <p className="mf-tip">
                灰色 = 该分类已在服务页桌面隐藏；点右上角"管理"可调整显示。
              </p>
            </>
          )}
        </div>

        {/* 管理抽屉 */}
        {showManage && (
          <div className="sv-cat-mask" onClick={() => setShowManage(false)}>
            <div className="sv-cat-panel" onClick={(e) => e.stopPropagation()}>
              <div className="sv-cat-panel-head">
                <h3>管理服务页桌面分类</h3>
                <button className="sv-cat-panel-close" onClick={() => setShowManage(false)}>完成</button>
              </div>
              <p className="sv-cat-panel-desc">
                勾选「始终显示」的分类会固定出现在服务页桌面（即使没有收藏）；未勾选的分类只在你收藏了该类服务时自动出现。
              </p>
              <div className="sv-cat-panel-list">
                {FAV_CATEGORIES.map((c) => {
                  const pinned = isCategoryPinned(c.name);
                  const cnt = countFavInBucket(c.bucket, favs);
                  return (
                    <label className="sv-cat-row" key={c.name}>
                      <span>
                        {c.name}
                        <span className="sv-cat-row-hint">
                          {cnt > 0 ? `已收藏 ${cnt} 项` : "暂无收藏"}
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={pinned}
                        onChange={(e) => {
                          setCategoryVisible(c.name, e.target.checked);
                          setTick((t) => t + 1);
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}
