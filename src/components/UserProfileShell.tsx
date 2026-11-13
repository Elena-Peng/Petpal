import { useState, type SyntheticEvent } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import "./../styles/my-posts.css";
import "@/styles/community.css";
import { AUTHORS, postsOfAuthor, type Author, type Post } from "@/utils/communityData";
import { getAllPosts } from "@/utils/publishStore";
import { DEFAULT_AVATAR, findUserByNickname, getCurrentUser } from "@/utils/userStore";
import mineAvatar from "@/assets/images/mine/mine-avatar.jpg";
import favStar from "@/assets/images/community/fav-star.png";
import {
  getInteractions,
  saveInteractions,
  getPostId,
  getFollows,
  setFollow,
  EMPTY_INTERACTION,
  type Interaction,
} from "@/utils/communityStore";

/** 该作者账号的宠物信息行（如「小虎 · 德牧」），账号无宠物档案时为空 */
function petLineOf(account?: string): string {
  if (!account) return "";
  try {
    const list = JSON.parse(localStorage.getItem(`petpal-pets:${account}`) || "[]");
    const p = Array.isArray(list) ? list[0] : null;
    if (!p) return "";
    return [p.name, p.species || p.type].filter(Boolean).join(" · ");
  } catch {
    return "";
  }
}

export default function UserProfileShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const name = (params.get("name") || "").trim();

  // 帖子来源：社区共享池（各账号真实发布）+ 种子作者的演示帖子，按内容去重
  const sharedPosts = name ? getAllPosts().filter((p) => (p.name || "").trim() === name) : [];
  const seedPosts = name ? postsOfAuthor(name) : [];
  const posts: Post[] = [];
  const seenSig = new Set<string>();
  [...sharedPosts, ...seedPosts].forEach((p) => {
    const sig = `${(p.lines || []).join("|")}::${(p.images || []).join("|")}`;
    if (seenSig.has(sig)) return;
    seenSig.add(sig);
    posts.push(p);
  });

  // 作者档案：种子作者用完整档案；任何其他昵称（含本机注册账号）也生成一个主页
  const seedAuthor = name ? AUTHORS[name] : undefined;
  const me = getCurrentUser();
  // 昵称可能重复：当前登录者昵称与 name 相同时优先用自己，避免串到别的同昵称账号
  const localUser =
    name && me && (me.nickname || "").trim() === name ? me : name ? findUserByNickname(name) : undefined;
  const avatarOf = (a?: string) => (!a ? "" : a === DEFAULT_AVATAR ? mineAvatar : a);
  const author: Author | undefined =
    seedAuthor ||
    (name
      ? {
          name,
          avatar:
            avatarOf(sharedPosts.find((p) => p.avatar)?.avatar) ||
            avatarOf(localUser?.avatar),
          pet: localUser?.account ? petLineOf(localUser.account) : "",
          pp: localUser?.account ? `账号 ${localUser.account}` : "PetPal 用户",
          bio: (localUser?.bio || "").trim() || "还没有填写简介",
          following: 0,
          fans: 0,
          likes: posts.reduce((s, p) => s + ((p.stats && p.stats[2]) || 0), 0),
        }
      : undefined);
  const [tab, setTab] = useState<"图文" | "视频">("图文");
  // 关注状态从 communityStore 回读；无持久化记录时回退帖子种子关注状态，与社区流一致
  const [followed, setFollowed] = useState(() => {
    if (!author) return false;
    const f = getFollows();
    if (author.name in f) return !!f[author.name];
    return posts.some((p) => p.followed);
  });
  // 互动状态：评论 / 收藏 / 点赞（与社区流共用同一份数据）
  const [interactions, setInteractions] = useState<Record<string, Interaction>>(
    () => getInteractions()
  );
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // 返回：优先来源页 state.from，无历史记录时兜底 /community
  const back = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : "/community");
  };

  // 聊天参数与 ChatShell 统一使用 ?name=
  const goChat = () =>
    navigate(`/mine/messages/chat?name=${encodeURIComponent(name)}`);

  const toggleFollow = () => {
    if (!author) return;
    const next = !followed;
    setFollowed(next);
    setFollow(author.name, next);
  };

  const goDetail = (p: Post) => {
    navigate(`/community/post?id=${encodeURIComponent(getPostId(p))}`);
  };

  const stop = (e: SyntheticEvent) => e.stopPropagation();

  const toggleFav = (id: string) => {
    setInteractions((prev) => {
      const cur = prev[id] || EMPTY_INTERACTION;
      const next = { ...cur, favorited: !cur.favorited };
      const map = { ...prev, [id]: next };
      saveInteractions(map);
      return map;
    });
  };
  const toggleLike = (id: string) => {
    setInteractions((prev) => {
      const cur = prev[id] || EMPTY_INTERACTION;
      const next = { ...cur, liked: !cur.liked };
      const map = { ...prev, [id]: next };
      saveInteractions(map);
      return map;
    });
  };
  const addComment = (id: string) => {
    const t = commentText.trim();
    if (!t) return;
    setInteractions((prev) => {
      const cur = prev[id] || EMPTY_INTERACTION;
      const next = { ...cur, comments: [...cur.comments, t] };
      const map = { ...prev, [id]: next };
      saveInteractions(map);
      return map;
    });
    setCommentText("");
  };

  // 参数无效 / 缺失：内容不存在空态 + 返回列表入口，不回退到首条作者
  if (!author) {
    return (
      <div className="home-stage">
        <div className="home-canvas mp-canvas">
          <div className="mp-head">
            <button className="mp-back" onClick={back} aria-label="返回">←</button>
            <h1 className="mp-title">作者主页</h1>
            <span style={{ width: 76 }}></span>
          </div>
          <div className="up-empty-state">
            <p className="up-empty-title">内容不存在</p>
            <p className="up-empty-desc">该作者可能已注销或链接已失效</p>
            <button className="up-empty-btn" onClick={() => navigate("/community")}>返回社区</button>
          </div>
        </div>
      </div>
    );
  }

  const videoPosts = posts.filter((p) => p.video);
  const shown = tab === "图文" ? posts : videoPosts;
  // 看的是自己的主页：不出现「关注自己」，改为编辑资料入口
  const isSelf = !!me && (me.nickname || "").trim() === author.name;

  return (
    <div className="home-stage">
      <div className="home-canvas mp-canvas">
        <div className="mp-head">
          <button className="mp-back" onClick={back} aria-label="返回">←</button>
          <h1 className="mp-title">{author.name}</h1>
          <span style={{ width: 76 }}></span>
        </div>

        {/* 用户信息卡 */}
        <div className="mp-user-card">
          {author.avatar ? (
            <img src={author.avatar} alt="" className="mp-user-avatar" />
          ) : (
            <span className="mp-user-avatar mp-user-avatar-ph" aria-label="暂无头像">
              {author.name.slice(0, 1)}
            </span>
          )}
          <div className="mp-user-info">
            <h2 className="mp-user-name">{author.name}</h2>
            <p className="mp-user-meta">
              {[author.pet, author.pp].filter(Boolean).join(" · ")}
            </p>
            <p className="mp-user-bio">{author.bio}</p>
            <div className="mp-stats">
              <div className="mp-stat"><strong>{author.following}</strong><span>关注</span></div>
              <div className="mp-stat"><strong>{author.fans}</strong><span>粉丝</span></div>
              <div className="mp-stat"><strong>{author.likes}</strong><span>赞与收藏</span></div>
            </div>
            <div className="up-actions">
              {isSelf ? (
                <button
                  className="up-btn primary"
                  onClick={() => navigate("/mine/profile/edit")}
                >
                  编辑资料
                </button>
              ) : (
                <>
                  <button
                    className={"up-btn" + (followed ? " followed" : "")}
                    onClick={toggleFollow}
                  >
                    {followed ? "已关注" : "+ 关注"}
                  </button>
                  <button className="up-btn primary" onClick={goChat}>发消息</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="mp-tabs">
          <button className={"mp-tab" + (tab === "图文" ? " active" : "")} onClick={() => setTab("图文")}>图文</button>
          <button className={"mp-tab" + (tab === "视频" ? " active" : "")} onClick={() => setTab("视频")}>视频</button>
        </div>

        {/* 帖子列表 */}
        <div className="mp-posts">
          {shown.length === 0 && tab === "图文" && (
            <div className="up-empty">暂无发布内容</div>
          )}
          {shown.length === 0 && tab === "视频" && (
            <div className="up-empty-state">
              <p className="up-empty-title">暂无视频</p>
              <p className="up-empty-desc">TA 还没有发布视频动态</p>
            </div>
          )}
          {shown.map((p, i) => {
            const id = getPostId(p);
            const it = interactions[id] || EMPTY_INTERACTION;
            const faved = it.favorited;
            const liked = it.liked;
            const comments = it.comments || [];
            const commentOpen = openComment === id;
            const imgs = Array.isArray(p.images) ? p.images : [];
            const lines = Array.isArray(p.lines) ? p.lines : [];
            return (
            <div
              className="mp-post-card"
              key={i}
              onClick={() => goDetail(p)}
              style={{ cursor: "pointer" }}
            >
              <div className="mp-post-date">{author.name} 的发布</div>
              <div className="mp-post-body">
                {imgs.length > 0 && (
                  <div className="up-imgs">
                    {imgs.map((src, j) => (
                      <img className="up-thumb" src={src} alt="" key={j} />
                    ))}
                  </div>
                )}
                <div className="mp-post-text">
                  {lines.map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="mp-post-stats" onClick={stop}>
                <span
                  className={"mp-stat-item" + (commentOpen ? " active" : "")}
                  onClick={() => setOpenComment(commentOpen ? null : id)}
                  style={{ cursor: "pointer" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {p.stats[0] + comments.length}
                </span>
                <span
                  className={"mp-stat-item" + (faved ? " faved" : "")}
                  onClick={() => toggleFav(id)}
                  style={{ cursor: "pointer" }}
                >
                  <img className="mp-stat-fav" src={favStar} alt="" /> {p.stats[1] + (faved ? 1 : 0)}
                </span>
                <span
                  className={"mp-stat-item" + (liked ? " liked" : "")}
                  onClick={() => toggleLike(id)}
                  style={{ cursor: "pointer" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> {p.stats[2] + (liked ? 1 : 0)}
                </span>
              </div>
              {commentOpen && (
                <div className="mp-comment-panel" onClick={stop}>
                  <div className="mp-comment-row">
                    <input
                      className="mp-comment-input"
                      placeholder="说点什么…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button className="mp-comment-send" onClick={() => addComment(id)}>发表</button>
                  </div>
                  {comments.length > 0 && (
                    <ul className="mp-comment-list">
                      {comments.map((c, j) => (
                        <li key={j}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
