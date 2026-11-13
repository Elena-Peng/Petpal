import { useState, useRef, type SyntheticEvent } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { ARTICLES } from "@/utils/scienceData";
import "@/styles/science.css";

// 科普文章详情页（参考小红书布局：顶部大图一次一张、手势滑动轮播，下方标题与正文）
export default function ScienceDetailShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const rawIndex = params.get("i");
  const idx = rawIndex === null ? NaN : Number(rawIndex);
  const valid = Number.isInteger(idx) && idx >= 0 && idx < ARTICLES.length;
  const a = valid ? ARTICLES[idx] : null;

  const [cur, setCur] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // 返回：优先来源页 state.from，无历史/深链进入时兜底科普列表
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : "/science");
  };

  // 参数无效：展示「内容不存在」空态 + 返回列表入口，不回退首条
  if (!a) {
    return (
      <div className="sci-stage">
        <div className="sci-canvas">
          <header className="sci-head">
            <button className="sci-back" onClick={goBack} aria-label="返回">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <span className="sci-head-title">文章详情</span>
            <span className="sci-head-ghost" />
          </header>
          <div className="sci-empty">
            <p className="sci-empty-title">内容不存在或已下架</p>
            <button className="sci-empty-btn" onClick={goBack}>返回科普列表</button>
          </div>
        </div>
      </div>
    );
  }

  const images = Array.isArray(a.images) ? a.images : [];
  const content = Array.isArray(a.content) ? a.content : [];

  const onScroll = (e: SyntheticEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const idxImg = Math.round(el.scrollLeft / el.clientWidth);
    if (idxImg >= 0 && idxImg < images.length) setCur(idxImg);
  };

  return (
    <div className="sci-stage">
      <div className="sci-canvas">
        {/* 顶部返回 */}
        <header className="sci-head">
          <button className="sci-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <span className="sci-head-title">文章详情</span>
          <span className="sci-head-ghost" />
        </header>

        {/* 图片轮播：一次一张，手势左右滑动切换 */}
        <div className="sci-gallery">
          <div className="sci-track" ref={ref} onScroll={onScroll}>
            {images.map((src, j) => (
              <img className="sci-gallery-img" src={src} alt="" key={j} />
            ))}
          </div>
          {/* 指示点 */}
          {images.length > 1 && (
            <div className="sci-dots">
              {images.map((_, j) => (
                <span
                  key={j}
                  className={"sci-dot" + (j === cur ? " active" : "")}
                  onClick={() => {
                    const el = ref.current;
                    if (el) el.scrollTo({ left: j * el.clientWidth, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 标题与来源 */}
        <div className="sci-body">
          <h1 className="sci-title">{a.title}</h1>
          <div className="sci-meta">
            <span className="sci-source">{a.source}</span>
            <span className="sci-time">{a.time}</span>
          </div>
          {content.map((para, j) => (
            <p className="sci-para" key={j}>
              {para}
            </p>
          ))}
          <div className="sci-foot">— PetPal 宠物知识科普 · 仅供参考 —</div>
        </div>
      </div>
    </div>
  );
}
