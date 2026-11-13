import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import "@/styles/service.css";
import "@/styles/simple.css";
import "@/styles/profile-edit.css";
import { getCurrentUser, updateProfile, DEFAULT_AVATAR } from "@/utils/userStore";

const BIO_MAX = 160;
// 最近用过的头像：按账号隔离（每个账号只能看到自己用过的头像，不会串到别人的）
const RECENT_KEY_PREFIX = "petpal-recent-avatars:";

export default function ProfileEditShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = getCurrentUser();
  const recentKey = RECENT_KEY_PREFIX + (current?.account || "guest");

  const [nickname, setNickname] = useState(current?.nickname ?? "");
  const [phone, setPhone] = useState(current?.phone ?? "");
  const [gender, setGender] = useState(current?.gender || "女");
  const [birthday, setBirthday] = useState(current?.birthday ?? "");
  const [city, setCity] = useState(current?.city ?? "");
  const [bio, setBio] = useState(current?.bio ?? "");
  const initialRecent = (() => {
    try {
      const r = localStorage.getItem(recentKey);
      const a = r ? JSON.parse(r) : [];
      return Array.isArray(a) ? a.filter((x: unknown) => typeof x === "string") : [];
    } catch {
      return [];
    }
  })();
  const [recent, setRecent] = useState<string[]>(initialRecent);
  // 头像只来自「当前账号自己上传过的头像」；新账号默认没有头像（显示灰底人形占位），
  // 不再拿示例图片或别人用过的头像当默认值
  const [avatar, setAvatar] = useState(
    current?.avatar && current.avatar !== DEFAULT_AVATAR
      ? current.avatar
      : initialRecent[0] || ""
  );
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const avatarRef = useRef<HTMLInputElement>(null);
  // 列表展示「当前头像 + 本账号最近用过的头像」，最多 3 张（不含任何示例或他人的头像）
  const thumbs = avatar && !recent.includes(avatar) ? [avatar, ...recent].slice(0, 3) : recent.slice(0, 3);

  const showToast = (text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  };

  // 把一张头像记入"最近用过的头像"：去重、置前、最多保留3张并持久化（仅本账号可见）
  const addRecent = (av: string) => {
    setRecent((prev) => {
      const next = [av, ...(prev || []).filter((x) => x !== av)].slice(0, 3);
      try {
        localStorage.setItem(recentKey, JSON.stringify(next));
      } catch { /* 配额不足则忽略 */ }
      return next;
    });
  };

  // 返回兜底：有来源页用来源页，无历史记录时固定回我的页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine");
  };

  // 上传头像 → 压缩(限长边360px/JPEG 0.82) → base64，避免 localStorage 超配额（与注册页/宠物编辑同一模式）
  const onAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        try {
          const MAX = 360;
          let w = img.width;
          let h = img.height;
          if (w > MAX || h > MAX) {
            const r = Math.min(MAX / w, MAX / h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const out = canvas.toDataURL("image/jpeg", 0.82);
            setAvatar(out);
            addRecent(out);
            return;
          }
        } catch { /* 压缩失败则退回原图 */ }
        setAvatar(src);
        addRecent(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!nickname.trim()) {
      setError("昵称不能为空");
      return;
    }
    const res = updateProfile({
      nickname,
      avatar: avatar || DEFAULT_AVATAR,
      phone,
      gender,
      birthday,
      city,
      bio,
    });
    if (!res.ok) {
      setError(res.error || "保存失败，请重试");
      return;
    }
    setError("");
    showToast("保存成功");
    window.setTimeout(() => navigate("/mine", { replace: true }), 350);
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas pe-canvas">
        <header className="pe-head">
          <button className="pe-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pe-title">编辑个人资料</h1>
          <button className="pe-close" aria-label="关闭" onClick={goBack}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="pe-body">
          {/* 头像选择：预设头像 + 上传压缩 */}
          <div className="pe-card pe-avatar-card">
            <div className="pe-avatar-main">
              <div className="pe-avatar-big">
                {avatar ? (
                  <img src={avatar} alt="头像" />
                ) : (
                  <div className="pe-avatar-empty" aria-label="暂无头像">
                    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#9aa79a" strokeWidth="1.6" strokeLinecap="round">
                      <circle cx="12" cy="8.6" r="3.6" />
                      <path d="M4.8 20c0-3.5 3.2-5.8 7.2-5.8s7.2 2.3 7.2 5.8" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="pe-avatar-info">
                <h3>选择头像</h3>
                <p>头像和昵称会展示在个人中心与社区动态中。</p>
                <div className="pe-avatar-list">
                  {thumbs.map((a, i) => (
                    <div
                      key={i}
                      className={"pe-avatar-sm" + (avatar === a ? " active" : "")}
                      onClick={() => { setAvatar(a); addRecent(a); }}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={a} alt="" />
                      {avatar === a && <span className="pe-check">✓</span>}
                    </div>
                  ))}
                  <div
                    className="pe-avatar-sm"
                    onClick={() => avatarRef.current?.click()}
                    style={{ cursor: "pointer", border: "1px dashed #9bb09b", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a9a86", fontSize: 16 }}
                    title="上传头像"
                  >
                    ＋
                  </div>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarFile}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 表单（受控） */}
          <div className="pe-field">
            <label>昵称 *</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setError(""); }}
              placeholder="给自己起个昵称"
            />
          </div>

          <div className="pe-field">
            <label>手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="选填，用于订单与服务联系"
            />
          </div>

          <div className="pe-row">
            <div className="pe-field">
              <label>性别</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>女</option>
                <option>男</option>
                <option>保密</option>
              </select>
            </div>
            <div className="pe-field">
              <label>生日</label>
              <input
                type="text"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                placeholder="YYYY/MM/DD"
              />
            </div>
          </div>

          <div className="pe-field">
            <label>所在城市</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="选填"
            />
          </div>

          <div className="pe-field">
            <label>个人简介</label>
            <textarea
              rows={4}
              maxLength={BIO_MAX}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下自己和毛孩子吧"
            />
            <span className="pe-counter">{bio.length}/{BIO_MAX}</span>
          </div>

          {error && <p className="pe-error">{error}</p>}

          {/* 安全提示 */}
          <div className="pe-safe">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <strong>资料安全存储</strong>
              <p>保存后同步至本地账号。手机号仅用于订单、预约和紧急服务联系。</p>
            </div>
          </div>

          {/* 保存按钮 */}
          <button className="pe-save" onClick={handleSave}>✓ 保存修改</button>
        </div>
      </div>

      {toast && (
        <div className="pe-toast">{toast}</div>
      )}
    </div>
  );
}
