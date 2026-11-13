import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import "./../styles/my-posts.css";
import defaultAvatar from "@/assets/images/mine/mine-avatar.jpg";
import { getMyPosts } from "@/utils/publishStore";
import { getCurrentUser } from "@/utils/userStore";
import { getFollows, getInteractions } from "@/utils/communityStore";
import type { Post } from "@/utils/communityData";

// 聚合"我发过的评论"：读取当前账号的社区互动数据（petpal-community-interactions:<账号>）
// 每条帖子下的 comments 汇聚成列表，关联到原帖作者。
function collectMyComments() {
  try {
    const map = getInteractions();
    const out: { key: string; name: string; text: string }[] = [];
    for (const [postId, v] of Object.entries(map)) {
      const name = String(postId).split("::")[0] || "动态";
      const comments = (v as { comments?: string[] })?.comments || [];
      comments.forEach((c, i) =>
        out.push({ key: postId + "-" + i, name, text: c })
      );
    }
    return out;
  } catch {
    return [];
  }
}

function PostCard({ p }: { p: Post }) {
  const isVideo = !!p.video;
  return (
    <div className="mp-post-card">
      <div className="mp-post-date">今天</div>
      <div className="mp-post-body">
        {isVideo ? (
          <video
            src={p.video}
            controls
            className="mp-single-img"
            poster={p.images && p.images[0]}
          />
        ) : (
          p.images && p.images.length > 0 && (
            <div className="mp-post-imgs">
              {p.images.length === 1 ? (
                <img className="mp-single-img" src={p.images[0]} alt="" />
              ) : p.images.length >= 3 ? (
                <>
                  <img className="mp-big-img" src={p.images[0]} alt="" />
                  <div className="mp-small-imgs">
                    {p.images.slice(1, 3).map((img, j) => (
                      <img key={j} src={img} alt="" />
                    ))}
                  </div>
                </>
              ) : (
                p.images.slice(0, 2).map((img, j) => <img key={j} src={img} alt="" />)
              )}
            </div>
          )
        )}
        <div className="mp-post-text">
          {p.lines.map((l, j) => (
            <p key={j}>{l}</p>
          ))}
        </div>
      </div>
      <div className="mp-post-stats">
        <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {p.stats?.[0] ?? 0}</span>
        <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {p.stats?.[1] ?? 0}</span>
        <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> {p.stats?.[2] ?? 0}</span>
      </div>
    </div>
  );
}

export default function MyPostsShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<"图文" | "视频" | "评论">("图文");

  const current = getCurrentUser();
  const myPosts = getMyPosts();
  const imagePosts = myPosts.filter((p) => !p.video);
  const videoPosts = myPosts.filter((p) => !!p.video);
  const myComments = collectMyComments();

  const follows = Object.values(getFollows()).filter(Boolean).length;
  const hasAvatar = current?.avatar && String(current.avatar).startsWith("data:");
  const avatarSrc = hasAvatar ? current.avatar : defaultAvatar;

  // 返回兜底：有来源页用来源页，无历史记录时固定回我的页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine");
  };

  const emptyPosts = (
    <div className="mp-empty-block">
      <p className="mp-empty-title">暂无动态</p>
      <p className="mp-empty-desc">发布第一条动态，记录和毛孩子的日常吧</p>
      <button className="mp-empty-btn" onClick={() => navigate("/community/publish")}>去发布</button>
    </div>
  );

  return (
    <div className="home-stage">
      <div className="home-canvas mp-canvas">
        <div className="mp-head">
          <button className="mp-back" onClick={goBack} aria-label="返回">←</button>
          <h1 className="mp-title">我的动态</h1>
          <span style={{ width: 40 }}></span>
        </div>

        {/* 用户信息卡：读取当前登录用户 */}
        <div className="mp-user-card">
          {hasAvatar ? (
            <img src={avatarSrc} alt="" className="mp-user-avatar" />
          ) : (
            <div className="mp-user-avatar mp-user-avatar-empty" aria-label="暂无头像">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
          )}
          <div className="mp-user-info">
            <h2 className="mp-user-name">{current?.nickname || "未登录"}</h2>
            <p className="mp-user-meta">账号：{current?.account || "—"}</p>
            <p className="mp-user-bio">{current?.bio || "这里是简介"}</p>
            <div className="mp-stats">
              <div className="mp-stat"><strong>{follows}</strong><span>关注</span></div>
              <div className="mp-stat"><strong>0</strong><span>粉丝</span></div>
              <div className="mp-stat"><strong>0</strong><span>赞与收藏</span></div>
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="mp-tabs">
          <button className={"mp-tab" + (tab === "图文" ? " active" : "")} onClick={() => setTab("图文")}>图文</button>
          <button className={"mp-tab" + (tab === "视频" ? " active" : "")} onClick={() => setTab("视频")}>视频</button>
          <button className={"mp-tab" + (tab === "评论" ? " active" : "")} onClick={() => setTab("评论")}>评论</button>
        </div>

        {/* 帖子列表 */}
        <div className="mp-posts">
          {tab === "图文" && (imagePosts.length ? imagePosts.map((p, i) => <PostCard key={"img-" + i} p={p} />) : emptyPosts)}

          {tab === "视频" && (videoPosts.length ? videoPosts.map((p, i) => <PostCard key={"vid-" + i} p={p} />) : emptyPosts)}

          {tab === "评论" && (
            myComments.length ? (
              myComments.map((c) => (
                <div className="mp-post-card" key={c.key}>
                  <div className="mp-post-date">我在「{c.name}」下的评论</div>
                  <div className="mp-post-body">
                    <div className="mp-post-text">
                      <p>{c.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="mp-empty-block">
                <p className="mp-empty-title">还没有发过评论</p>
                <p className="mp-empty-desc">去社区留言，和宠友互动吧</p>
                <button className="mp-empty-btn" onClick={() => navigate("/community")}>去社区</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
