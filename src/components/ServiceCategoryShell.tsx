// 服务分类专属页：/service/category?name=xxx
// 只展示「我收藏的」该分类下的服务/场所/领养动物。
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import svStarLine from "@/assets/images/service/sv-star-line.png";
import svPin from "@/assets/images/service/sv-pin.png";
import BottomNav from "@/components/BottomNav";
import {
  NEARBY,
  PLACES,
  ADOPT_LIST,
  EXOTIC_GRID,
  QUICK_GRID,
  type SvcCard,
  type AdoptPet,
} from "@/utils/serviceData";
import { getFavs, toggleFav } from "@/utils/serviceStore";
import "@/styles/service.css";

// 返回兜底：优先返回来源页，无历史记录时回到服务主页（不回退到首条数据）
function useGoBack(navigate: ReturnType<typeof useNavigate>, fallback: string) {
  const location = useLocation();
  return () => {
    const from = (location.state as { from?: string } | null)?.from;
    if (from) navigate(from);
    else navigate(fallback);
  };
}

// 分类名 → 过滤标签（与 NEARBY.cats 对应）
const CAT_TO_FILTER: Record<string, string> = {
  异宠专科中心: "异宠专科",
  环境调试: "异宠专科",
  鸟类护理: "异宠专科",
  异宠寄养: "寄养",
  医疗问诊: "医院",
  洗护美容: "洗护",
  寄养托管: "寄养",
  上门照护: "上门",
};

export default function ServiceCategoryShell() {
  const navigate = useNavigate();
  const goBack = useGoBack(navigate, "/service");
  const [params] = useSearchParams();
  const catName = params.get("name") ?? "";
  const filter = CAT_TO_FILTER[catName] ?? catName;
  const [favs, setFavs] = useState<Record<string, boolean>>(() => getFavs());

  const onToggleFav = (id: string) => {
    toggleFav(id);
    setFavs(getFavs());
  };

  // 该分类下我收藏的附近优选
  const favNearby = NEARBY.filter(
    (c) => (c.cats ?? []).includes(filter) && favs[c.name]
  );
  // 我收藏的友宠场所（无 cats，按名字收藏算"我的场所"）
  const favPlaces = PLACES.filter((c) => favs[c.name]);
  // 我收藏的领养动物（跨分类，统一展示在"我的收藏"列表）
  const favAdopt = ADOPT_LIST.filter((p) => favs[p.name]);

  // 该分类下可收藏（未收藏）的卡，用于"去发现"引导
  const allNearby = NEARBY.filter((c) => (c.cats ?? []).includes(filter));
  const empty = favNearby.length === 0 && favPlaces.length === 0;

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
              <p className="sv-head-sub">我的收藏 · 分类</p>
              <h1 className="sv-head-title">{catName || filter}</h1>
            </div>
          </div>
        </header>

        <div className="sv-content">
          {empty ? (
            <div className="sv-empty">
              <p className="sv-empty-title">这个分类还没有收藏</p>
              <p className="sv-empty-desc">
                去「附近优选」里发现{catName}相关的服务，点右上角的星星即可收藏到这里。
              </p>
              <button
                className="sv-empty-btn"
                onClick={() => navigate("/service?jump=" + encodeURIComponent(filter))}
              >
                去看看{allNearby.length}家{catName || filter}服务
              </button>
            </div>
          ) : (
            <>
              {favNearby.length > 0 && (
                <>
                  <h2 className="sv-section-title">我收藏的{catName || filter}</h2>
                  <div className="sv-list">
                    {favNearby.map((c) => (
                      <FavSvcCard key={c.name} c={c} fav onToggleFav={onToggleFav} />
                    ))}
                  </div>
                </>
              )}
              {catName && favPlaces.length > 0 && (
                <>
                  <h2 className="sv-section-title">我收藏的友宠场所</h2>
                  <div className="sv-list">
                    {favPlaces.map((c) => (
                      <FavSvcCard key={c.name} c={c} fav onToggleFav={onToggleFav} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* 我收藏的领养动物（独立一段，因为不属于服务分类） */}
          {favAdopt.length > 0 && (
            <>
              <h2 className="sv-section-title">我收藏的领养动物</h2>
              <div className="sv-adopt-list">
                {favAdopt.map((p) => (
                  <FavAdoptCard key={p.name} p={p} onToggleFav={onToggleFav} />
                ))}
              </div>
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

function FavSvcCard({
  c,
  fav,
  onToggleFav,
}: {
  c: SvcCard;
  fav: boolean;
  onToggleFav: (id: string) => void;
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
            onToggleFav(c.name);
          }}
        />
      </div>
      <div className="sv-card-body">
        <img className="sv-card-img" src={c.img} alt={c.name} />
        <div className="sv-card-info">
          <div className="sv-card-tags">
            {c.tags.map((t) => (
              <span className="sv-card-tag" key={t}>
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

function FavAdoptCard({
  p,
  onToggleFav,
}: {
  p: AdoptPet;
  onToggleFav: (id: string) => void;
}) {
  return (
    <div className="sv-adopt-card">
      <img className="sv-adopt-img" src={p.img} alt={p.name} />
      <div className="sv-adopt-info">
        <div className="sv-adopt-row sv-adopt-row-top">
          <h3 className="sv-adopt-name">{p.name}</h3>
          <span className="sv-adopt-price">{p.price}</span>
          <img
            className="sv-adopt-star faved"
            src={svStarLine}
            alt="收藏"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav(p.name);
            }}
          />
        </div>
        <div className="sv-adopt-row sv-adopt-row-meta">
          <span className="sv-adopt-breed">{p.breed}</span>
          <span className="sv-adopt-age">{p.age}</span>
        </div>
        <p className="sv-adopt-desc">{p.desc}</p>
        <div className="sv-adopt-tags">
          {p.tags.map((t) => (
            <span key={t.label} className={"sv-adopt-tag tone-" + t.tone}>
              {t.label}
            </span>
          ))}
        </div>
        <div className="sv-adopt-row sv-adopt-row-loc">
          <img className="sv-adopt-pin" src={svPin} alt="" />
          <span>{p.location}</span>
        </div>
      </div>
    </div>
  );
}
