import { useState, useEffect, useRef, type ChangeEvent, type SyntheticEvent } from "react";
import { useSearchParams, useNavigate } from "react-router";
import Bar from "@/components/Bar";
import CommunityHomeEntry from "@/components/CommunityHomeEntry";
import BottomNav from "@/components/BottomNav";
import icComment from "@/assets/images/community/ic-comment.png";
import favStar from "@/assets/images/community/fav-star.png";
import fabPen from "@/assets/images/community/fab-pen.png";
import cityPin from "@/assets/images/community/city-pin.png";
import exChipBird from "@/assets/images/community/ex-chip-bird.png";
import exGecko3 from "@/assets/images/community/ex-gecko-3.png";
import exChipMammal from "@/assets/images/community/ex-chip-mammal.png";
import lostPin from "@/assets/images/community/lost-pin.png";
import lostTarget from "@/assets/images/community/lost-target.png";
import lostArrow from "@/assets/images/community/lost-arrow.png";
import lostWarn from "@/assets/images/community/lost-warn.png";
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
  setFollow,
  subscribeCommunityChange,
  EMPTY_INTERACTION,
  type Interaction,
} from "@/utils/communityStore";
import { getAllPosts } from "@/utils/publishStore";
import { publishRescueRequest } from "@/utils/rescueStore";
import "@/styles/community.css";

// 频道 Tab：0 推荐 / 1 关注 / 2 同城 / 3 异宠圈 / 4 宠物走失寻找
const CHANNELS = ["推荐", "关注", "同城", "异宠圈", "宠物走失寻找"];

// 顶部主标题随频道变化：推荐/关注为「和热爱…」，同城/异宠圈为「和懂…」
const HEAD_TITLES: Record<number, string> = {
  0: "和热爱每一种宠物的人在一起",
  1: "和热爱每一种宠物的人在一起",
  2: "和懂每一种宠物的人在一起",
  3: "和懂每一种宠物的人在一起",
  4: "和懂每一种宠物的人在一起",
};

// 各频道欢迎头卡（推荐 PETPAL COMMUNITY；关注 FOLLOWING；同城 CITY PET LIFE）
const BANNERS: Record<
  number,
  { en: string; title: string; desc: string; btn?: string; btnAlt?: string; pin?: boolean }
> = {
  0: {
    en: "PETPAL COMMUNITY",
    title: "今天，和热爱宠物的人聊聊",
    desc: "精选招呼经验，真实日常和异宠灵感，打开就能找到有用内容。",
    btn: "参与发帖",
  },
  1: {
    en: "FOLLOWING",
    title: "今天更新了 看看你关注的人",
    desc: "把熟悉的宠物家庭和异宠创作者放在一起，更新不会错过。",
    btn: "发现更多创作者",
  },
  2: {
    en: "CITY PET LIFE",
    title: "上海宠友正在发生什么",
    desc: "同城遛宠，领养活动和附近服务提醒，帮你把线上交流变成线下陪伴。",
    btn: "查看同城活动",
    pin: true,
  },
  3: {
    en: "EXOTIC COMMUNITY",
    title: "每一种陪伴都值得被认真对待",
    desc: "鸟类、爬宠、小型哺乳类和水族爱好者在这里分享环境、饮食与健康经验。",
    btn: "发布异宠动态",
  },
  4: {
    en: "LOST & FOUND",
    title: "一起帮他回家",
    desc: "发布走失位置，发动同城养宠人、友宠场所和救助资源共同寻找。",
  },
};

// 异宠圈「EXOTIC CARE 异宠频道精选」分类入口（Frame3322512 / 332_2555）
const EXOTIC_CATEGORIES = [
  { img: exChipBird, name: "鸟类照护" },
  { img: exGecko3, name: "爬宠环境" },
  { img: exChipMammal, name: "小型哺乳" },
];

export default function CommunityShell() {
  const [params] = useSearchParams();
  const initialTab = Number(params.get("tab")) || 0;
  const [channel, setChannel] = useState(initialTab);
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState<Record<number, Post[]>>(() => {
    const f = getFollows();
    const apply = (ps: Post[]) => ps.map((p) => ({ ...p, followed: p.name in f ? f[p.name] : p.followed }));
    return {
      0: apply([...getAllPosts(), ...RECOMMEND_POSTS]),
      1: apply(FOLLOW_POSTS),
      2: apply(CITY_POSTS),
      3: apply(EXOTIC_POSTS),
      4: apply(LOST_POSTS),
    };
  });
  // 关注集合：跨频道点「+关注」的作品会加入「关注」栏目；取消则移除
  const [followedPosts, setFollowedPosts] = useState<Post[]>(() => {
    const f = getFollows();
    const all = [
      ...getAllPosts(),
      ...RECOMMEND_POSTS,
      ...FOLLOW_POSTS,
      ...CITY_POSTS,
      ...EXOTIC_POSTS,
      ...LOST_POSTS,
    ];
    return all.filter((p) => (p.name in f ? f[p.name] : p.followed));
  });
  // 互动状态：评论 / 收藏 / 点赞（localStorage 持久化）
  const [interactions, setInteractions] = useState<Record<string, Interaction>>(
    () => getInteractions()
  );
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // 订阅关注变更：详情页关注/取消后，同步各频道帖子的关注状态与「关注」栏目
  useEffect(
    () =>
      subscribeCommunityChange(() => {
        const f = getFollows();
        setFeeds((prev) => {
          const next: Record<number, Post[]> = {};
          Object.keys(prev)
            .map(Number)
            .forEach((ch) => {
              next[ch] = prev[ch].map((p) => ({
                ...p,
                followed: p.name in f ? f[p.name] : p.followed,
              }));
            });
          return next;
        });
        setFollowedPosts(() => {
          const all = [
            ...getAllPosts(),
            ...RECOMMEND_POSTS,
            ...FOLLOW_POSTS,
            ...CITY_POSTS,
            ...EXOTIC_POSTS,
            ...LOST_POSTS,
          ];
          return all.filter((p) => (p.name in f ? f[p.name] : p.followed));
        });
      }),
    []
  );

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

  const goUser = (name: string) => {
    // 「我」的帖子点击跳「我的」页，其余进作者个人页
    if (name === "我") return navigate("/mine");
    navigate(`/community/user?name=${encodeURIComponent(name)}`);
  };

  const goDetail = (p: Post) => {
    navigate(`/community/post?id=${encodeURIComponent(getPostId(p))}`);
  };

  const stop = (e: SyntheticEvent) => e.stopPropagation();

  const toggleFollow = (ch: number, idx: number) => {
    const p = feeds[ch][idx];
    if (!p) return;
    const next = !p.followed;
    // 关注关系写入 communityStore 持久化并广播，页面回读 getFollows 回显，刷新不丢
    setFollow(p.name, next);
    setFeeds((prev) => ({
      ...prev,
      [ch]: prev[ch].map((x, i) => (i === idx ? { ...x, followed: next } : x)),
    }));
    setFollowedPosts((prev) => {
      if (next) return prev.some((x) => x.name === p.name) ? prev : [...prev, { ...p, followed: true }];
      return prev.filter((x) => x.name !== p.name);
    });
  };

  // 轻提示（发布成功 / 即将上线等），不使用原生 alert 阻塞
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = (t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  };

  // 走失页子模式：browse 浏览列表 / publish 发布表单
  const [lostMode, setLostMode] = useState<"browse" | "publish">("browse");
  const [petType, setPetType] = useState("犬");
  const [form, setForm] = useState({
    name: "",
    city: "长沙",
    date: "2026年9月13日",
    breed: "",
    place: "",
    phone: "",
    clue: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [lostKw, setLostKw] = useState("");
  const banner = BANNERS[channel];

  // 走失浏览流：按关键词过滤正文（标题 / 线索）
  const lostFiltered = (feeds[4] ?? []).filter((p) => {
    const kw = lostKw.trim();
    if (!kw) return true;
    return [p.name, ...p.lines].some((s) => s.includes(kw));
  });
  const posts = channel === 1 ? followedPosts : channel === 4 ? lostFiltered : feeds[channel] ?? [];
  const setField = (key: keyof typeof form) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFormErrors((err) => {
      if (!err[key]) return err;
      const next = { ...err };
      delete next[key];
      return next;
    });
  };

  // 头卡按钮：可跳转的接入路由，未开放的统一 toast 标注即将上线，杜绝死按钮
  const onBannerBtn = () => {
    if (channel === 0 || channel === 3) navigate("/community/publish");
    else if (channel === 1) setChannel(0);
    else if (channel === 2) showToast("同城活动详情即将上线");
  };

  // 异宠精选入口：跳转科普页异宠分类
  const goScience = () => navigate("/science?cat=异宠");

  const resetLostForm = () => {
    setForm({ name: "", city: "长沙", date: "2026年9月13日", breed: "", place: "", phone: "", clue: "" });
    setPetType("犬");
    setFormErrors({});
  };

  const submitLost = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "请填写宠物名字";
    if (!form.city.trim()) errs.city = "请选择城市";
    if (!form.date.trim()) errs.date = "请填写走失日期";
    if (!form.breed.trim()) errs.breed = "请填写品种 / 外貌特征";
    if (!form.place.trim()) errs.place = "请填写最后出现地点";
    if (!form.phone.trim()) errs.phone = "请填写联系电话";
    else if (!/^[\d\-+]{5,15}$/.test(form.phone.trim())) errs.phone = "联系电话格式不正确";
    if (!form.clue.trim()) errs.clue = "请填写外观和线索";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // 接入 rescueStore 既有导出函数，不修改 rescueStore 文件
    publishRescueRequest({
      species: petType,
      location: `${form.city.trim()} ${form.place.trim()}`,
      desc: `品种/特征：${form.breed.trim()}；走失日期：${form.date.trim()}；外观线索：${form.clue.trim()}`,
      contact: form.phone.trim(),
    });
    resetLostForm();
    setLostMode("browse");
    showToast("走失信息已发布，感谢帮忙扩散");
  };

  const switchChannel = (i: number) => {
    setChannel(i);
    setLostMode("browse");
  };

  return (
    <div className="cm-stage">
      <div className="cm-canvas">
        {/* 顶部标题组（消息入口已移到右侧侧边快捷栏） */}
        <header className="cm-head">
          <div className="cm-head-left">
            <p className="cm-head-tag">和懂每一种宠物的人在一起</p>
            <h1 className="cm-head-title">发现</h1>
          </div>
        </header>

        {/* 频道 Tab */}
        <nav className="cm-tabs">
          {CHANNELS.map((label, i) => (
            <button
              key={label}
              className={"cm-tab" + (i === channel ? " active" : "")}
              onClick={() => switchChannel(i)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="cm-content">
        {/* 频道欢迎头卡 */}
        {banner && (
          <section className="cm-banner">
            <p className="cm-banner-en">{banner.en}</p>
            <h2 className="cm-banner-title">
              {banner.pin && <img className="cm-banner-pin" src={cityPin} alt="" />}
              {banner.title}
            </h2>
            <p className="cm-banner-desc">{banner.desc}</p>
            {channel !== 4 ? (
              <div className="cm-banner-btns">
                {banner.btn && (
                  <button className="cm-banner-btn" onClick={onBannerBtn}>{banner.btn}</button>
                )}
                {banner.btnAlt && (
                  <button className="cm-banner-btn alt">{banner.btnAlt}</button>
                )}
              </div>
            ) : (
              /* 走失页：寻找宠物 / 发布走失信息 分段选择器（Frame3322757 / 332_2764） */
              <div className="cm-lost-seg">
                <button
                  className={"cm-lost-seg-btn" + (lostMode === "browse" ? " active" : "")}
                  onClick={() => setLostMode("browse")}
                >
                  寻找宠物
                </button>
                <button
                  className={"cm-lost-seg-btn" + (lostMode === "publish" ? " active" : "")}
                  onClick={() => setLostMode("publish")}
                >
                  发布走失信息
                </button>
              </div>
            )}
          </section>
        )}

        {/* 走失寻找：城市 + 同城搜索筛选行（仅浏览模式） */}
        {channel === 4 && lostMode === "browse" && (
          <div className="cm-lost-bar">
            <button className="cm-lost-city" onClick={() => showToast("城市筛选即将上线")}>
              <img src={lostPin} alt="" />
              长沙
            </button>
            <div className="cm-lost-search">
              <img src={lostTarget} alt="" />
              <input
                className="cm-lost-search-input"
                placeholder="搜索同城走失信息"
                value={lostKw}
                onChange={(e) => setLostKw(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* 异宠圈：EXOTIC CARE 异宠频道精选分类卡（Frame3322512 / 332_2555） */}
        {channel === 3 && (
          <section className="cm-care">
            <p className="cm-care-en">EXOTIC CARE</p>
            <h3 className="cm-care-title">异宠频道精选</h3>
            <p className="cm-care-desc">按物种查看环境、饮食和健康经验。</p>
            <div className="cm-care-chips">
              {EXOTIC_CATEGORIES.map((c) => (
                <button className="cm-care-chip" key={c.name} onClick={goScience}>
                  <img className="cm-care-chip-img" src={c.img} alt={c.name} />
                  <span className="cm-care-chip-name">{c.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 走失发布表单（Frame3322757 / 332_2769 起） */}
        {channel === 4 && lostMode === "publish" && (
          <div className="cm-lost-form">
            <div className="cm-lost-warn">
              <img src={lostWarn} alt="" />
              <span>请尽量填写准确的最后出现地点及外貌特征，不要公开完整住址等敏感信息。</span>
            </div>

            <label className="cm-field">
              <span className="cm-field-label">宠物名字 *</span>
              <input
                className="cm-field-input"
                placeholder="例如：米糕"
                value={form.name}
                onChange={setField("name")}
              />
              {formErrors.name && <span className="cm-field-error">{formErrors.name}</span>}
            </label>

            <div className="cm-field-row">
              <label className="cm-field">
                <span className="cm-field-label">城市 *</span>
                <div className="cm-field-select">
                  <input value={form.city} onChange={setField("city")} />
                  <img src={lostArrow} alt="" />
                </div>
                {formErrors.city && <span className="cm-field-error">{formErrors.city}</span>}
              </label>
              <label className="cm-field">
                <span className="cm-field-label">走失日期 *</span>
                <div className="cm-field-select">
                  <input value={form.date} onChange={setField("date")} />
                  <img src={lostArrow} alt="" />
                </div>
                {formErrors.date && <span className="cm-field-error">{formErrors.date}</span>}
              </label>
            </div>

            <label className="cm-field">
              <span className="cm-field-label">品种 / 特征 *</span>
              <input
                className="cm-field-input"
                placeholder="例如：金毛，黄色背带"
                value={form.breed}
                onChange={setField("breed")}
              />
              {formErrors.breed && <span className="cm-field-error">{formErrors.breed}</span>}
            </label>

            <label className="cm-field">
              <span className="cm-field-label">最后出现地点 *</span>
              <input
                className="cm-field-input"
                placeholder="例如：时代广场十字路口附近"
                value={form.place}
                onChange={setField("place")}
              />
              {formErrors.place && <span className="cm-field-error">{formErrors.place}</span>}
            </label>

            <label className="cm-field">
              <span className="cm-field-label">联系电话 *</span>
              <input
                className="cm-field-input"
                placeholder="建议填写可接听电话"
                value={form.phone}
                onChange={setField("phone")}
              />
              {formErrors.phone && <span className="cm-field-error">{formErrors.phone}</span>}
            </label>

            <label className="cm-field">
              <span className="cm-field-label">外观和线索 *</span>
              <textarea
                className="cm-field-input cm-field-textarea"
                placeholder="毛色、体型、佩戴物、是否怕人、最后看到的位置等"
                value={form.clue}
                onChange={setField("clue")}
              />
              {formErrors.clue && <span className="cm-field-error">{formErrors.clue}</span>}
            </label>

            <div className="cm-field">
              <span className="cm-field-label">宠物类型 *</span>
              <div className="cm-type-seg">
                {["犬", "猫", "其他"].map((t) => (
                  <button
                    key={t}
                    className={"cm-type-seg-btn" + (petType === t ? " active" : "")}
                    onClick={() => setPetType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button className="cm-pub-submit" onClick={submitLost}>发布走失信息</button>
          </div>
        )}

        {/* 帖子流（发布表单模式下不渲染列表） */}
        {!(channel === 4 && lostMode === "publish") && (
        <div className="cm-feed">
          {posts.map((p, idx) => {
            const id = getPostId(p);
            const it = interactions[id] || EMPTY_INTERACTION;
            const faved = it.favorited;
            const liked = it.liked;
            const comments = it.comments || [];
            const commentOpen = openComment === id;
            const imgs = Array.isArray(p.images) ? p.images : [];
            const lines = Array.isArray(p.lines) ? p.lines : [];
            return (
            <article
              className="cm-post"
              key={idx}
              onClick={() => goDetail(p)}
              style={{ cursor: "pointer" }}
            >
              <div className="cm-post-head" onClick={stop}>
                {p.avatar ? (
                  <img
                    className="cm-avatar"
                    src={p.avatar}
                    alt={p.name}
                    onClick={() => goUser(p.name)}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <span
                    className="cm-avatar cm-avatar-ph"
                    onClick={() => goUser(p.name)}
                    style={{ cursor: "pointer" }}
                  >
                    {p.name?.[0] || "友"}
                  </span>
                )}
                <span className="cm-name" onClick={() => goUser(p.name)} style={{ cursor: "pointer" }}>
                  {p.name}
                </span>
                {p.action === "contact" ? (
                  <span className="cm-contact">联系</span>
                ) : (
                  <span
                    className={
                      "cm-follow" + (p.followed ? " followed" : " unfollowed")
                    }
                    onClick={() => toggleFollow(channel, idx)}
                    style={{ cursor: "pointer" }}
                  >
                    {p.followed ? "已关注" : "+ 关注"}
                  </span>
                )}
              </div>
              <div className="cm-post-text">
                {lines.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
              {imgs.length > 0 && (
                <div className={"cm-imgs" + (imgs.length === 2 ? " n-2" : "")}>
                  {imgs.map((src, j) => (
                    <img className="cm-thumb" src={src} alt="" key={j} />
                  ))}
                </div>
              )}
              <div className="cm-stats" onClick={stop}>
                <span
                  className={"cm-stat" + (commentOpen ? " active" : "")}
                  onClick={() => setOpenComment(commentOpen ? null : id)}
                  style={{ cursor: "pointer" }}
                >
                  <img className="cm-stat-icon" src={icComment} alt="" />
                  {p.stats[0] + comments.length}
                </span>
                <span
                  className={"cm-stat" + (faved ? " faved" : "")}
                  onClick={() => toggleFav(id)}
                  style={{ cursor: "pointer" }}
                >
                  <img className="cm-stat-fav" src={favStar} alt="" />
                  {p.stats[1] + (faved ? 1 : 0)}
                </span>
                <span
                  className={"cm-stat" + (liked ? " liked" : "")}
                  onClick={() => toggleLike(id)}
                  style={{ cursor: "pointer" }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                  {p.stats[2] + (liked ? 1 : 0)}
                </span>
              </div>
              {commentOpen && (
                <div className="cm-comment-panel" onClick={stop}>
                  <div className="cm-comment-row">
                    <input
                      className="cm-comment-input"
                      placeholder="说点什么…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button className="cm-comment-send" onClick={() => addComment(id)}>发表</button>
                  </div>
                  {comments.length > 0 && (
                    <ul className="cm-comment-list">
                      {comments.map((c, j) => (
                        <li key={j}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
            );
          })}

          {/* 同城频道：本周同城活动卡（Frame3322422 / 332_2500） */}
          {channel === 2 && (
            <div className="cm-city-activity">
              <p className="cm-city-act-title">本周同城活动</p>
              <p className="cm-city-act-desc">
                纪念公园遛宠交流、领养日和友宠场所体验报名中。
              </p>
              <button className="cm-city-act-btn" onClick={() => showToast("同城活动详情即将上线")}>查看活动</button>
            </div>
          )}

          {/* 未实现频道空态占位 */}
          {posts.length === 0 && (
            <div className="cm-empty">
              <p className="cm-empty-title">该频道正在建设中</p>
              <p className="cm-empty-desc">稍后再来看看这里的新鲜内容吧～</p>
            </div>
          )}
        </div>
        )}

        {/* 右下悬浮发帖按钮（走失寻找页按导出稿不显示） */}
        {channel !== 4 && (
          <button
            className="cm-fab"
            aria-label="发帖"
            onClick={() => navigate("/community/publish")}
          >
            <img src={fabPen} alt="" />
          </button>
        )}

        {/* 底部导航栏；首页图标/文字点击回到 / */}
        <Bar />
        <CommunityHomeEntry />
        </div>
        <BottomNav />

        {toast && <div className="cm-toast">{toast}</div>}
      </div>
    </div>
  );
}
