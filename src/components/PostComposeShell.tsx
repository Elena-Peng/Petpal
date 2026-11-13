import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import pubAddImage from "@/assets/images/community/pub-add-image.png";
import pubVideo from "@/assets/images/community/pub-video.png";
import pubPaw from "@/assets/images/community/pub-paw.png";
import pubTopic from "@/assets/images/community/pub-topic.png";
import pubLoc from "@/assets/images/community/pub-loc.png";
import pubShield from "@/assets/images/community/pub-shield.png";
import pubPlane from "@/assets/images/community/pub-plane.png";
import mineAvatar from "@/assets/images/mine/mine-avatar.jpg";
import { saveMyPost, type ComposePost } from "@/utils/publishStore";
import { getPets, getCurrentPet } from "@/utils/petStore";
import { getCurrentUser } from "@/utils/userStore";
import "@/styles/compose.css";

// 发布动态三种类型（Frame372721 日常分享 / 372889 求助 / 372964 领养公益）
type ComposeType = "daily" | "help" | "adopt";

const TYPES: { key: ComposeType; label: string; ph: string }[] = [
  { key: "daily", label: "日常分享", ph: "分享今天和宠物的小故事..." },
  { key: "help", label: "求助", ph: "描述宠物情况、地点和你需要的帮助..." },
  { key: "adopt", label: "领养公益", ph: "介绍等待领养的动宠物，留下可靠的联系信息..." },
];

const TOPICS = ["#异宠日常", "#晒毛孩子", "#求助互助", "#领养公益", "#萌宠图鉴"];
const LOCS = ["上海市", "北京市", "广州市", "深圳市", "成都市", "杭州市"];

/** 关联宠物候选：读当前账号的宠物库，绝不使用固定演示宠物名 */
function petOptions(): { names: string[]; initial: string } {
  const names = getPets()
    .map((p) => (p.name || "").trim())
    .filter(Boolean);
  const cur = (getCurrentPet()?.name || "").trim();
  const initial = names.includes(cur) ? cur : names[0] || "";
  return { names, initial };
}

/** 把图片文件压缩为 jpeg base64（限制长边≤900，保证可写入 localStorage） */
function fileToDataUrl(file: File, maxEdge = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxEdge / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(reader.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } catch {
          resolve(reader.result as string);
        }
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PostComposeShell() {
  const navigate = useNavigate();
  const [type, setType] = useState<ComposeType>("daily");
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const petChoices = petOptions();
  const [pet, setPet] = useState(petChoices.initial);
  const [topic, setTopic] = useState("#异宠日常");
  const [loc, setLoc] = useState("上海市");
  const [open, setOpen] = useState<"pet" | "topic" | "loc" | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const imgInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const current = TYPES.find((t) => t.key === type) ?? TYPES[0];

  const showToast = (t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  };

  const onPickImages = async (files: FileList | null) => {
    if (!files) return;
    const list: string[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      const url = await fileToDataUrl(f);
      list.push(url);
      if (list.length + images.length >= 9) break; // 上限 9 张
    }
    setImages((prev) => [...prev, ...list].slice(0, 9));
    setErr("");
  };

  const onPickVideo = (files: FileList | null) => {
    const f = files && files[0];
    if (!f) return;
    // objectURL：视频较大，仅会话内有效
    setVideo((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(f);
    });
    setErr("");
  };

  const publish = () => {
    if (publishing) return;
    const trimmed = text.trim();
    if (!trimmed && images.length === 0 && !video) {
      setErr("写点内容或添加图片后再发布吧～");
      return;
    }
    setErr("");
    setPublishing(true);
    const post: ComposePost = {
      avatar: getCurrentUser()?.avatar || mineAvatar,
      name: (getCurrentUser()?.nickname || "").trim() || "我",
      followed: false,
      lines: trimmed
        ? trimmed.split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
      images,
      video: video ?? undefined,
      pet: pet || "未关联",
      topic,
      loc,
      videoDraft: !!video,
      stats: [0, 0, 0],
    };
    saveMyPost(post);
    showToast("发布成功");
    window.setTimeout(() => navigate("/community"), 700);
  };

  return (
    <div className="cp-stage">
      <div className="cp-canvas">
        {/* 顶部导航：返回社区 + 标题/编辑中 */}
        <header className="cp-nav">
          <button
            className="cp-back"
            aria-label="返回"
            onClick={() => navigate("/community")}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="cp-nav-title">
            <h1>发布动态</h1>
            <p>编辑中</p>
          </div>
        </header>

        {/* 三种动态类型胶囊 */}
        <div className="cp-type-row">
          {TYPES.map((t) => (
            <button
              key={t.key}
              className={"cp-type" + (type === t.key ? " active" : "")}
              onClick={() => setType(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 正文编辑区 */}
        <div className="cp-editor">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setErr(""); }}
            placeholder={current.ph}
          />
        </div>

        {/* 已选图片预览（可删除） */}
        {images.length > 0 && (
          <div className="cp-preview-grid">
            {images.map((src, i) => (
              <div className="cp-preview-item" key={i}>
                <img src={src} alt="" />
                <button
                  className="cp-preview-del"
                  aria-label="删除"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 已选视频预览 */}
        {video && (
          <div className="cp-video-preview">
            <video src={video} controls />
            <button className="cp-preview-del" aria-label="删除" onClick={() => { URL.revokeObjectURL(video); setVideo(null); }}>×</button>
            <p className="cp-video-note">演示版视频链接刷新后可能失效，正式版将上传服务器存储</p>
          </div>
        )}

        {/* 添加图片 / 视频 */}
        <div className="cp-media">
          <button className="cp-media-btn" onClick={() => imgInput.current?.click()}>
            <img src={pubAddImage} alt="" />
            <span>添加图片</span>
          </button>
          <button className="cp-media-btn" onClick={() => videoInput.current?.click()}>
            <img src={pubVideo} alt="" />
            <span>视频</span>
          </button>
          <input
            ref={imgInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => { onPickImages(e.target.files); e.target.value = ""; }}
          />
          <input
            ref={videoInput}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => { onPickVideo(e.target.files); e.target.value = ""; }}
          />
        </div>

        {/* 关联宠物 / 选择话题 / 所在位置 */}
        <div className="cp-meta">
          <button className="cp-meta-row" onClick={() => setOpen(open === "pet" ? null : "pet")}>
            <img src={pubPaw} alt="" />
            <span className="cp-meta-label">关联宠物</span>
            <span className="cp-meta-value">{pet || (petChoices.names.length ? "请选择" : "暂无宠物")}</span>
          </button>
          <button className="cp-meta-row" onClick={() => setOpen(open === "topic" ? null : "topic")}>
            <img src={pubTopic} alt="" />
            <span className="cp-meta-label">选择话题</span>
            <span className="cp-meta-value">{topic}</span>
          </button>
          <button className="cp-meta-row" onClick={() => setOpen(open === "loc" ? null : "loc")}>
            <img src={pubLoc} alt="" />
            <span className="cp-meta-label">所在位置</span>
            <span className="cp-meta-value">{loc}</span>
          </button>
        </div>

        {/* 选择面板 */}
        {open === "pet" && (
          <div className="cp-options">
            {petChoices.names.length === 0 ? (
              <p className="cp-option-empty">还没有宠物档案，先到「宠物家庭」建立档案再关联吧</p>
            ) : (
              petChoices.names.map((p) => (
                <button
                  key={p}
                  className={"cp-option" + (pet === p ? " on" : "")}
                  onClick={() => { setPet(p); setOpen(null); }}
                >
                  {p}
                </button>
              ))
            )}
          </div>
        )}
        {open === "topic" && (
          <div className="cp-options">
            {TOPICS.map((t) => (
              <button
                key={t}
                className={"cp-option" + (topic === t ? " on" : "")}
                onClick={() => { setTopic(t); setOpen(null); }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        {open === "loc" && (
          <div className="cp-options">
            {LOCS.map((l) => (
              <button
                key={l}
                className={"cp-option" + (loc === l ? " on" : "")}
                onClick={() => { setLoc(l); setOpen(null); }}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* 安全审核提示 */}
        <div className="cp-audit">
          <img src={pubShield} alt="" />
          <span>发布内容将进行安全审核</span>
        </div>

        {/* 提交按钮 */}
        {err && <p className="cp-form-error">{err}</p>}
        <button className="cp-submit" onClick={publish} disabled={publishing}>
          <img src={pubPlane} alt="" />
          <span>发布动态</span>
        </button>
      </div>
      {toast && <div className="cp-toast">{toast}</div>}
    </div>
  );
}
