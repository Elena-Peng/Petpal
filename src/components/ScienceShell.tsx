import { useState } from "react";
import { useNavigate } from "react-router";
import searchIcon from "@/assets/images/science/search.png";
import Bar from "@/components/Bar";
import ScienceHomeEntry from "@/components/ScienceHomeEntry";
import BottomNav from "@/components/BottomNav";
import { CATEGORIES, ARTICLES } from "@/utils/scienceData";
import "@/styles/science.css";

// 文章与分类标签的对应关系（scienceData 不维护分类字段，这里按文章内容映射，
// 后续迁移到后端时可改为文章自带 categoryIds 字段）
const ARTICLE_CATS: string[][] = [
  ["新手饲养必看", "狗狗", "宠物训练方法", "饮食营养", "健康护理"],
  ["狗狗"],
  ["爬行类", "鸟类", "异宠环境指南"],
];

export default function ScienceShell() {
  const navigate = useNavigate();
  // cat=-1 表示「全部分类」；点击胶囊后按分类过滤
  const [cat, setCat] = useState(-1);
  const [kw, setKw] = useState("");

  const kwNorm = kw.trim().toLowerCase();

  const filtered = ARTICLES.map((a, i) => ({ article: a, index: i })).filter(({ article, index }) => {
    const catOk = cat < 0 || (ARTICLE_CATS[index] || []).includes(CATEGORIES[cat]);
    const text = `${article.title} ${article.excerpt} ${article.content.join(" ")}`.toLowerCase();
    const kwOk = !kwNorm || text.includes(kwNorm);
    return catOk && kwOk;
  });

  const clearFilters = () => {
    setKw("");
    setCat(-1);
  };

  return (
    <div className="ss-stage">
      <div className="ss-canvas">
        <header className="ss-topbar">
          <button className="ss-back" onClick={() => navigate(-1)} aria-label="返回">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="ss-title">宠物知识科普</h1>
        </header>

        <div className="ss-search">
          <img className="ss-search-icon" src={searchIcon} alt="" />
          <input
            className="ss-search-input"
            value={kw}
            placeholder="搜索养宠知识、品种、疾病"
            onChange={(e) => setKw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
        </div>

        {/* 分类一行横滑胶囊 */}
        <div className="ss-cats">
          {CATEGORIES.map((label, i) => (
            <button
              key={label}
              className={"ss-cat" + (i === cat ? " active" : "")}
              onClick={() => setCat(i === cat ? -1 : i)}
            >
              <span className="ss-cat-label">{label}</span>
            </button>
          ))}
        </div>

        {/* 文章流 */}
        <div className="ss-feed">
          {filtered.length === 0 ? (
            <div className="ss-empty">
              <p className="ss-empty-title">未找到相关科普</p>
              <p className="ss-empty-sub">换个关键词或分类试试吧</p>
              <button className="ss-empty-btn" onClick={clearFilters}>清除筛选条件</button>
            </div>
          ) : (
            filtered.map(({ article: a, index }) => (
              <article
                className="ss-article"
                key={a.title}
                onClick={() => navigate(`/science/detail?i=${index}`)}
                style={{ cursor: "pointer" }}
              >
                <h3 className="ss-article-title">{a.title}</h3>
                <div className="ss-article-mid">
                  <p className="ss-article-excerpt">{a.excerpt}</p>
                  <img className="ss-thumb" src={a.cover} alt={a.title} />
                </div>
                <div className="ss-article-meta">
                  <span className="ss-article-source">{a.source}</span>
                  <span className="ss-article-time">{a.time}</span>
                </div>
              </article>
            ))
          )}
        </div>

        {/* 底部导航栏（复用首页 Bar）；首页图标/文字点击回到 / */}
        <Bar />
        <ScienceHomeEntry />
        <BottomNav />
      </div>
    </div>
  );
}
