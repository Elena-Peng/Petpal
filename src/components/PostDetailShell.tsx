import { useState, useRef, type SyntheticEvent } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import {
  type Post,
  RECOMMEND_POSTS,
  FOLLOW_POSTS,
  CITY_POSTS,
  EXOTIC_POSTS,
  LOST_POSTS,
} from "@/utils/communityData";
import {
  getInteractions,
  saveInteractions,
  getPostId,
  getFollows,
  saveFollows,
  emitCommunityChange,
  EMPTY_INTERACTION,
} from "@/utils/communityStore";
import { getAllPosts } from "@/utils/publishStore";
import icComment from "@/assets/images/community/ic-comment.png";
import favStar from "@/assets/images/community/fav-star.png";
import "@/styles/community.css";

// 社区帖子详情页（参考小红书布局：顶部图片一次一张左右滑动轮播，下方作者、正文与互动）
export default function PostDetailShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const id = params.get("id") || "";
  // 每次进入都重新取一遍（含刚发布的帖子 + 其他账号发布的共享帖子）
  const allSources: Post[] = [
    ...getAllPosts(),
    ...RECOMMEND_POSTS,
    ...FOLLOW_POSTS,
    ...CITY_POSTS,
    ...EXOTIC_POSTS,
    ...LOST_POSTS,
  ];
  const post = allSources.find((p) => getPostId(p) === id);

  const [interactions, setInteractions] = useState(() => getInteractions());
  const it = interactions[id] || EMPTY_INTERACTION;

  // 关注状态（作者名持久化，与社区流联动）
  const [followed, setFollowed] = useState(() => {
    if (!post) return false;
    const f = getFollows();
    return post.name in f ? f[post.name] : post.followed;
  });
  const toggleFollow = () => {
    if (!post) return;
    const next = !followed;
    setFollowed(next);
    saveFollows({ ...getFollows(), [post.name]: next });
    emitCommunityChange();
  };

  const [cur, setCur] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  const showToast = (t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  };

  // 返回：优先来源页 state.from，无历史记录时兜底 /community
  const back = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : "/community");
  };

  const images = post && Array.isArray(post.images) ? post.images : [];
  const lines = post && Array.isArray(post.lines) ? post.lines : [];

  const onScroll = (e: SyntheticEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx >= 0 && idx < images.length) setCur(idx);
  };

  const patch = (next: Partial<typeof EMPTY_INTERACTION>) => {
    const map = { ...interactions, [id]: { ...it, ...next } };
    setInteractions(map);
    saveInteractions(map);
  };

  const addComment = () => {
    const t = commentText.trim();
    if (!t) return;
    patch({ comments: [...(it.comments || []), t] });
    setCommentText("");
  };

  // 参数无效 / 缺失：内容不存在空态 + 返回列表入口，不回退到列表首条
  if (!post) {
    return (
      <div className="pd-stage">
        <div className="pd-canvas">
          <header className="pd-head">
            <button className="pd-back" onClick={back} aria-label="返回">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          </header>
          <div className="pd-empty-state">
            <p className="up-empty-title">内容不存在或已删除</p>
            <p className="up-empty-desc">该帖子可能已被作者删除</p>
            <button className="up-empty-btn" onClick={() => navigate("/community")}>返回社区</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-stage">
      <div className="pd-canvas">
        {/* 顶部：返回 + 作者信息 + 关注 + 转发（参考小红书） */}
        <header className="pd-head">
          <button className="pd-back" onClick={back} aria-label="返回">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="pd-head-author">
            <img className="pd-avatar" src={post.avatar} alt={post.name} />
            <div className="pd-head-author-info">
              <span className="pd-name">{post.name}</span>
              <span className="pd-time">今天 · 宠物社区</span>
            </div>
          </div>
          <span
            className={"pd-follow" + (followed ? " followed" : "")}
            onClick={toggleFollow}
            style={{ cursor: "pointer" }}
          >
            {followed ? "已关注" : "+ 关注"}
          </span>
          <button
            className="pd-share"
            onClick={() => showToast("已转发给消息里的朋友")}
            aria-label="转发"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
              <path d="M12 3v13" />
              <path d="M7 8l5-5 5 5" />
            </svg>
          </button>
        </header>

        {/* 图片轮播：一次一张，手势左右滑动切换；缺图给默认占位 */}
        <div className="pd-gallery">
          {images.length > 0 ? (
            <>
              <div className="pd-track" ref={ref} onScroll={onScroll}>
                {images.map((src, j) => (
                  <img className="pd-gallery-img" src={src} alt="" key={j} />
                ))}
              </div>
              {images.length > 1 && (
                <div className="pd-dots">
                  {images.map((_, j) => (
                    <span
                      key={j}
                      className={"pd-dot" + (j === cur ? " active" : "")}
                      onClick={() => {
                        const el = ref.current;
                        if (el) el.scrollTo({ left: j * el.clientWidth, behavior: "smooth" });
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="pd-img-placeholder">暂无图片</div>
          )}
        </div>

        {/* 正文 */}
        <div className="pd-text">
          {lines.map((line, j) => (
            <p key={j}>{line}</p>
          ))}
        </div>

        {/* 互动 */}
        <div className="pd-actions">
          <button
            className={"pd-act" + (commentOpen ? " active" : "")}
            onClick={() => setCommentOpen((v) => !v)}
          >
            <img src={icComment} alt="" />
            {post.stats[0] + (it.comments?.length || 0)}
          </button>
          <button
            className={"pd-act" + (it.favorited ? " faved" : "")}
            onClick={() => patch({ favorited: !it.favorited })}
          >
            <img src={favStar} alt="" />
            {post.stats[1] + (it.favorited ? 1 : 0)}
          </button>
          <button
            className={"pd-act" + (it.liked ? " liked" : "")}
            onClick={() => patch({ liked: !it.liked })}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill={it.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            {post.stats[2] + (it.liked ? 1 : 0)}
          </button>
        </div>

        {/* 评论 */}
        <div className="pd-comment-block">
          <h3 className="pd-comment-title">评论 {post.stats[0] + (it.comments?.length || 0)}</h3>
          <div className="pd-comment-row">
            <input
              className="pd-comment-input"
              placeholder="说点什么…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="pd-comment-send" onClick={addComment}>发表</button>
          </div>
          {(it.comments?.length || 0) > 0 ? (
            <ul className="pd-comment-list">
              {it.comments!.map((c, j) => (
                <li key={j}><b>我：</b>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="pd-comment-empty">还没有评论，快来抢沙发～</p>
          )}
        </div>

        {/* 轻提示（转发等） */}
        {toast && (
          <div className="pd-toast">{toast}</div>
        )}
      </div>
    </div>
  );
}
