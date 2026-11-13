// 我的收藏总览页：/service/favorites
// 所有我收藏的服务/场所/领养动物，按分类分组展示。
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import svStarLine from "@/assets/images/service/sv-star-line.png";
import svPin from "@/assets/images/service/sv-pin.png";
import BottomNav from "@/components/BottomNav";
import { NEARBY, PLACES, ADOPT_LIST, type SvcCard, type AdoptPet } from "@/utils/serviceData";
import { getFavs, toggleFav } from "@/utils/serviceStore";
import "@/styles/service.css";

export default function ServiceFavoritesShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [favs, setFavs] = useState<Record<string, boolean>>(() => getFavs());

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/service");
  };

  const onToggleFav = (id: string) => {
    toggleFav(id);
    setFavs(getFavs());
  };

  // 计数直接按当前实际收藏列表重算，保证标题计数与展示条目数一致
  const favNearby = NEARBY.filter((c) => favs[c.name]);
  const favPlaces = PLACES.filter((c) => favs[c.name]);
  const favAdopt = ADOPT_LIST.filter((p) => favs[p.name]);
  const total = favNearby.length + favPlaces.length + favAdopt.length;

  const goSvcDetail = (c: SvcCard) => {
    if (c.person && c.name === "丽丽") navigate("/service/lili");
    else navigate("/service/detail?name=" + encodeURIComponent(c.name));
  };

  const goPetDetail = (p: AdoptPet) =>
    navigate("/service/pet?name=" + encodeURIComponent(p.name));

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
              <p className="sv-head-sub">我收藏的所有内容</p>
              <h1 className="sv-head-title">我的收藏（{total}）</h1>
            </div>
          </div>
        </header>

        <div className="sv-content">
          {total === 0 ? (
            <div className="sv-empty">
              <p className="sv-empty-title">还没有收藏任何内容</p>
              <p className="sv-empty-desc">
                在服务页点卡片右上角的星星，即可把医院、上门服务、友宠场所或领养动物收藏到这里。
              </p>
              <button className="sv-empty-btn" onClick={() => navigate("/service")}>
                去服务页逛逛
              </button>
            </div>
          ) : (
            <>
              {favNearby.length > 0 && (
                <>
                  <h2 className="sv-section-title">服务者 / 医院 / 机构（{favNearby.length}）</h2>
                  <div className="sv-list">
                    {favNearby.map((c) => (
                      <FavSvcCard key={c.name} c={c} onToggleFav={onToggleFav} onOpen={() => goSvcDetail(c)} />
                    ))}
                  </div>
                </>
              )}
              {favPlaces.length > 0 && (
                <>
                  <h2 className="sv-section-title">友宠场所（{favPlaces.length}）</h2>
                  <div className="sv-list">
                    {favPlaces.map((c) => (
                      <FavSvcCard key={c.name} c={c} onToggleFav={onToggleFav} onOpen={() => goSvcDetail(c)} />
                    ))}
                  </div>
                </>
              )}
              {favAdopt.length > 0 && (
                <>
                  <h2 className="sv-section-title">领养动物（{favAdopt.length}）</h2>
                  <div className="sv-adopt-list">
                    {favAdopt.map((p) => (
                      <FavAdoptCard key={p.name} p={p} onToggleFav={onToggleFav} onOpen={() => goPetDetail(p)} />
                    ))}
                  </div>
                </>
              )}
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
  onToggleFav,
  onOpen,
}: {
  c: SvcCard;
  onToggleFav: (id: string) => void;
  onOpen: () => void;
}) {
  return (
    <article
      className={"sv-card" + (c.person ? " person" : "")}
      style={{ cursor: "pointer" }}
      onClick={onOpen}
    >
      <div className="sv-card-title">
        <h3 className="sv-card-name">{c.name}</h3>
        <img
          className="sv-card-star faved"
          src={svStarLine}
          alt="取消收藏"
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
  onOpen,
}: {
  p: AdoptPet;
  onToggleFav: (id: string) => void;
  onOpen: () => void;
}) {
  return (
    <div className="sv-adopt-card" style={{ cursor: "pointer" }} onClick={onOpen}>
      <img className="sv-adopt-img" src={p.img} alt={p.name} />
      <div className="sv-adopt-info">
        <div className="sv-adopt-row sv-adopt-row-top">
          <h3 className="sv-adopt-name">{p.name}</h3>
          <span className="sv-adopt-price">{p.price}</span>
          <img
            className="sv-adopt-star faved"
            src={svStarLine}
            alt="取消收藏"
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
