// 服务页搜索页：/service/search?sub=xxx
// 输入关键词实时跨类型过滤：服务分类 / 附近优选 / 商品 / 领养动物 / 救助基地。
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import "@/styles/service.css";
import {
  EXOTIC_GRID,
  QUICK_GRID,
  NEARBY,
  MALL_ITEMS,
  ADOPT_LIST,
  RESCUE_BASES,
} from "@/utils/serviceData";

const HOT_KEYS: Record<string, string[]> = {
  服务: ["异宠专科", "医院", "上门照护", "寄养"],
  商城: ["猫粮", "猫窝", "鹦鹉", "爬虫"],
  领养公益: ["蓝猫", "柴犬", "仓鼠", "救助站"],
};

const PLACEHOLDER: Record<string, string> = {
  服务: "搜索异宠医生、寄养或环境服务",
  商城: "搜索适合米糕或异宠的商品",
  领养公益: "搜索待领养动物或救助基地",
};

function norm(s: string) {
  return s.toLowerCase().trim();
}

export default function SearchShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const sub = params.get("sub") || "服务";
  const [kw, setKw] = useState("");

  // 返回兜底：优先来源页，无历史记录时回到服务主页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/service");
  };

  const q = kw.trim();

  const hot = HOT_KEYS[sub] || HOT_KEYS["服务"];

  const results = useMemo(() => {
    if (!q) return null;
    const match = (...fields: (string | undefined)[]) =>
      fields.some((f) => f && norm(f).includes(norm(q)));

    const cats = [...EXOTIC_GRID, ...QUICK_GRID].filter((c) =>
      match(c.name, c.desc)
    );
    const nearby = NEARBY.filter((c) => match(c.name, ...c.tags, c.desc, c.skill));
    const goods = MALL_ITEMS.filter((p) => match(p.title));
    const pets = ADOPT_LIST.filter((p) => match(p.name, p.breed, p.desc));
    const bases = RESCUE_BASES.filter((b) => match(b.name, b.desc, b.species, b.services));

    return { cats, nearby, goods, pets, bases };
  }, [q]);

  const total =
    results ? results.cats.length + results.nearby.length + results.goods.length + results.pets.length + results.bases.length : 0;

  const goCategory = (name: string) => navigate("/service/category?name=" + encodeURIComponent(name));
  const goNearby = (c: (typeof NEARBY)[number]) => {
    if (c.person && c.name === "丽丽") {
      navigate("/service/lili");
      return;
    }
    navigate("/service/detail?name=" + encodeURIComponent(c.name));
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas svs-canvas">
        {/* 顶部：返回 + 搜索输入框 + 取消 */}
        <header className="svs-head">
          <button className="svs-back" aria-label="返回" onClick={goBack}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="svs-input">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              autoFocus
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder={PLACEHOLDER[sub] || "搜索"}
            />
            {q && (
              <button className="svs-clear" aria-label="清空" onClick={() => setKw("")}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,.25)" />
                  <path d="M8.8 8.8l6.4 6.4M15.2 8.8l-6.4 6.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <button className="svs-cancel" onClick={goBack}>取消</button>
        </header>

        <div className="svs-body">
          {!results ? (
            /* 空输入：热门搜索 */
            <div className="svs-hot">
              <p className="svs-hot-title">热门搜索</p>
              <div className="svs-hot-list">
                {hot.map((k) => (
                  <button key={k} className="svs-hot-item" onClick={() => setKw(k)}>
                    {k}
                  </button>
                ))}
              </div>
            </div>
          ) : total === 0 ? (
            /* 无结果 */
            <div className="svs-empty">
              <p className="svs-empty-title">没有找到“{q}”相关内容</p>
              <p className="svs-empty-desc">换个关键词试试，或浏览热门搜索</p>
            </div>
          ) : (
            <div className="svs-results">
              {/* 服务分类 */}
              {results.cats.length > 0 && (
                <>
                  <p className="svs-group">服务分类（{results.cats.length}）</p>
                  {results.cats.map((c) => (
                    <button key={c.name} className="svs-row" onClick={() => goCategory(c.name)}>
                      <img className="svs-icon" src={c.icon} alt={c.name} />
                      <span className="svs-name">{c.name}</span>
                      <span className="svs-desc">{c.desc}</span>
                      <span className="svs-arrow">›</span>
                    </button>
                  ))}
                </>
              )}

              {/* 附近优选服务 */}
              {results.nearby.length > 0 && (
                <>
                  <p className="svs-group">附近优选（{results.nearby.length}）</p>
                  {results.nearby.map((c) => (
                    <button key={c.name} className="svs-row" onClick={() => goNearby(c)}>
                      <img className="svs-thumb" src={c.img} alt={c.name} />
                      <span className="svs-main">
                        <span className="svs-name">{c.name}</span>
                        <span className="svs-desc">{c.tags.join(" · ")}</span>
                      </span>
                      <span className="svs-arrow">›</span>
                    </button>
                  ))}
                </>
              )}

              {/* 商品 */}
              {results.goods.length > 0 && (
                <>
                  <p className="svs-group">商品（{results.goods.length}）</p>
                  {results.goods.map((p) => (
                    <button key={p.title} className="svs-row" onClick={() => navigate("/mall/product?title=" + encodeURIComponent(p.title))}>
                      <img className="svs-thumb" src={p.img} alt={p.title} />
                      <span className="svs-main">
                        <span className="svs-name">{p.title}</span>
                        <span className="svs-desc">{p.sales} · {p.price}</span>
                      </span>
                      <span className="svs-arrow">›</span>
                    </button>
                  ))}
                </>
              )}

              {/* 领养动物 */}
              {results.pets.length > 0 && (
                <>
                  <p className="svs-group">领养动物（{results.pets.length}）</p>
                  {results.pets.map((p) => (
                    <button key={p.name} className="svs-row" onClick={() => navigate("/service/pet?name=" + encodeURIComponent(p.name))}>
                      <img className="svs-thumb" src={p.img} alt={p.name} />
                      <span className="svs-main">
                        <span className="svs-name">{p.name}</span>
                        <span className="svs-desc">{p.breed} · {p.age} · {p.location}</span>
                      </span>
                      <span className="svs-arrow">›</span>
                    </button>
                  ))}
                </>
              )}

              {/* 救助基地 */}
              {results.bases.length > 0 && (
                <>
                  <p className="svs-group">救助基地（{results.bases.length}）</p>
                  {results.bases.map((b) => (
                    <button key={b.name} className="svs-row" onClick={() => navigate("/service/rescue?name=" + encodeURIComponent(b.name))}>
                      <img className="svs-thumb" src={b.img} alt={b.name} />
                      <span className="svs-main">
                        <span className="svs-name">{b.name}</span>
                        <span className="svs-desc">{b.city} · {b.scope}</span>
                      </span>
                      <span className="svs-arrow">›</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
