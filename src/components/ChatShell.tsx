import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router";
import "./../styles/messages.css";
import "@/styles/community.css";

import avatarPangbabao from "@/assets/images/community/pangbabao1.jpg";
import avatarXiaohu from "@/assets/images/community/a8-indoor.png";
import avatarXiaobao from "@/assets/images/community/post3-swim.png";
import avatarNiangao from "@/assets/images/community/city-cat-front.png";
import avatarDefault from "@/assets/images/common-avatar.svg";
import { NEARBY, PLACES } from "@/utils/serviceData";
import { markSvcChatRead } from "@/utils/serviceStore";
import { getCurrentUser, USER_UPDATE_EVENT } from "@/utils/userStore";
import {
  markChatRead,
  getChats,
  getChatMessages,
  appendChatMessage,
  upsertChatMeta,
  CHAT_UPDATE_EVENT,
  type ChatMessage,
  type ChatCard,
} from "@/utils/chatStore";
import { familyPets, sendFamilyInvite, usableAvatar } from "@/utils/familyInvite";

// 好友头像映射：只提供头像，聊天内容不预置 —— 新用户进入会话是空的，发消息后才产生记录
const FRIEND_AVATAR: Record<string, string> = {
  胖宝宝: avatarPangbabao,
  小虎: avatarXiaohu,
  小宝: avatarXiaobao,
  年糕: avatarNiangao,
};

// 服务会话种子欢迎语
const SVC_SEED: ChatMessage[] = [
  { from: "them", text: "你好，请问有什么可以帮您？", time: "刚刚" },
  { from: "me", text: "想咨询一下服务项目和价格", time: "刚刚" },
  { from: "them", text: "好的，您可以查看详情页的项目与价格，也可以随时问我～", time: "刚刚" },
];

/** 图片压缩：最长边 720，JPEG 0.82，避免 dataURL 把 localStorage 撑爆 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        const max = 720;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(raw);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(raw);
      img.src = raw;
    };
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1a2b1a" strokeWidth="1.8" strokeLinecap="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
  </svg>
);
const KeyIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1a2b1a" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="7" width="18" height="10" rx="2" />
    <path d="M6.5 10.5h.01M10 10.5h.01M13.5 10.5h.01M17 10.5h.01M7 13.5h10" />
  </svg>
);

/** 邀请卡片：随附宠物档案缩略 + 确认状态 */
function InviteCard({ card }: { card: ChatCard }) {
  const state = card.state ?? "pending";
  const pets = card.pets ?? (card.pet ? [card.pet] : []);
  return (
    <div className="chat-card">
      <span className="chat-card-kind">{card.kind === "invite" ? "家庭邀请" : "已加入家庭"}</span>
      <p className="chat-card-title">{card.title}</p>
      {card.sub && <p className="chat-card-sub">{card.sub}</p>}
      {pets.length > 0 && (
        <div className="chat-card-pets">
          {pets.slice(0, 3).map((p, i) => (
            <div className="chat-card-pet" key={i}>
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} />
              ) : (
                <span className="chat-card-pet-ph">{(p.name || "宠")[0]}</span>
              )}
              <div>
                <h4 className="chat-card-pet-name">{p.name}</h4>
                <p className="chat-card-pet-meta">
                  {p.species}
                  {p.age ? ` · ${p.age}` : ""}
                </p>
              </div>
            </div>
          ))}
          {pets.length > 3 && <p className="chat-card-more">还有 {pets.length - 3} 只宠物档案</p>}
        </div>
      )}
      {card.kind === "invite" && (
        <div className={"chat-card-state is-" + state}>
          {state === "pending" ? "等待对方确认" : state === "accepted" ? "已同意" : "已拒绝"}
        </div>
      )}
    </div>
  );
}

export default function ChatShell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // 统一参数契约：优先 ?name=，兼容旧链路 ?to=；找不到目标会话时不静默回退默认会话
  const name = (params.get("name") || params.get("to") || "").trim();

  // 从服务详情「在线咨询」进入：展示服务者欢迎语与头像
  const svc = [...NEARBY, ...PLACES].find((c) => c.name === name);
  const seedMsgs: ChatMessage[] = svc ? SVC_SEED : [];

  // 进入会话回读历史消息（持久化优先；好友会话没有预置内容，聊过才有）
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getChatMessages(name, seedMsgs)
  );
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [panel, setPanel] = useState<"" | "actions" | "invite">("");
  const [toast, setToast] = useState("");
  const [preview, setPreview] = useState("");
  const [rec, setRec] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  // 邀请面板里勾选「本次共享哪些宠物」的下标集合（默认全选，可逐个取消，至少留 1 只）
  const [pick, setPick] = useState<number[]>([]);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const recorderRef = useRef<{
    recorder: MediaRecorder | null;
    chunks: Blob[];
    stream: MediaStream | null;
    startedAt: number;
    closed: boolean;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 「我」的发言头像跟随当前登录用户（换头像后实时更新），没上传头像则用默认人形占位
  const [meAvatar, setMeAvatar] = useState(() => {
    const u = getCurrentUser();
    return u?.avatar && String(u.avatar).startsWith("data:") ? u.avatar : avatarDefault;
  });
  useEffect(() => {
    const onUser = () => {
      const u = getCurrentUser();
      setMeAvatar(u?.avatar && String(u.avatar).startsWith("data:") ? u.avatar : avatarDefault);
    };
    window.addEventListener(USER_UPDATE_EVENT, onUser);
    return () => window.removeEventListener(USER_UPDATE_EVENT, onUser);
  }, []);

  // 打开聊天 = 已读，红点消失；普通好友会话同样标记已读
  useEffect(() => {
    if (!name) return;
    if (svc) markSvcChatRead(name);
    markChatRead(name);
  }, [svc, name]);

  // 会话内新消息（如家庭邀请被对方接受）实时刷新，不用退出重进
  useEffect(() => {
    if (!name) return;
    const onUpdate = () => setMessages(getChatMessages(name, seedMsgs));
    window.addEventListener(CHAT_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(CHAT_UPDATE_EVENT, onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // 有新消息就滚到底部
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, panel]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const chatEntry = getChats().find((c) => c.name === name);
  const peerAvatar =
    usableAvatar(svc?.img) ||
    usableAvatar(chatEntry?.avatar) ||
    FRIEND_AVATAR[name] ||
    avatarDefault;
  const hasTarget = Boolean(
    name && (svc || chatEntry || FRIEND_AVATAR[name] || messages.length > 0)
  );

  /** 发送任意类型消息：追加到会话线程 + 同步会话列表预览 */
  const pushMessage = (msg: ChatMessage, preview: string) => {
    if (!name) return;
    const next = appendChatMessage(name, msg, seedMsgs);
    setMessages(next);
    upsertChatMeta(name, peerAvatar, preview);
  };

  const send = () => {
    const t = draft.trim();
    if (!t || !name) return;
    pushMessage({ from: "me", text: t, time: "刚刚" }, t);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  // ===== 图片 =====
  const onPickImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !name) return;
    try {
      const data = await compressImage(file);
      pushMessage({ from: "me", text: "", time: "刚刚", kind: "image", image: data }, "[图片]");
      setPanel("");
    } catch {
      setToast("图片读取失败，请重试");
    }
  };

  // ===== 语音（按住说话）=====
  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startHold = async () => {
    if (!name) return;
    setRec(true);
    setRecSec(0);
    const startedAt = Date.now();
    timerRef.current = window.setInterval(() => {
      setRecSec(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    }, 300);
    // 先同步占位：麦克风授权可能一直不返回，松手时也要能按「按住时长」发出语音
    const ctx = {
      recorder: null as MediaRecorder | null,
      chunks: [] as Blob[],
      stream: null as MediaStream | null,
      startedAt,
      closed: false,
    };
    recorderRef.current = ctx;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (ctx.closed) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) ctx.chunks.push(ev.data);
      };
      recorder.start();
      ctx.stream = stream;
      ctx.recorder = recorder;
    } catch {
      // 无麦克风权限：只记录时长，气泡仍可点击播放进度
    }
  };

  const endHold = () => {
    const ctx = recorderRef.current;
    recorderRef.current = null;
    stopTimer();
    setRec(false);
    if (!ctx) return;
    ctx.closed = true;
    const duration = Math.max(1, Math.round((Date.now() - ctx.startedAt) / 1000));

    const finish = (audio?: string) => {
      pushMessage(
        { from: "me", text: "", time: "刚刚", kind: "voice", duration, audio },
        `[语音] ${duration}″`
      );
    };

    if (ctx.recorder && ctx.recorder.state !== "inactive") {
      ctx.recorder.onstop = () => {
        ctx.stream?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(ctx.chunks, { type: ctx.recorder?.mimeType || "audio/webm" });
        const fr = new FileReader();
        fr.onload = () => finish(String(fr.result || ""));
        fr.onerror = () => finish();
        fr.readAsDataURL(blob);
      };
      ctx.recorder.stop();
    } else {
      ctx.stream?.getTracks().forEach((t) => t.stop());
      finish();
    }
  };

  const cancelHold = () => {
    if (recorderRef.current) recorderRef.current.closed = true;
    recorderRef.current?.recorder?.stop();
    recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    stopTimer();
    setRec(false);
  };

  const playVoice = (index: number, msg: ChatMessage) => {
    if (playing === index) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    setPlaying(index);
    const dur = msg.duration || 1;
    if (msg.audio) {
      const audio = new Audio(msg.audio);
      audioRef.current = audio;
      audio.onended = () => setPlaying(null);
      audio.play().catch(() => {
        window.setTimeout(() => setPlaying((p) => (p === index ? null : p)), dur * 1000);
      });
    } else {
      window.setTimeout(() => setPlaying((p) => (p === index ? null : p)), dur * 1000);
    }
  };

  // ===== 家庭邀请（在聊天里直接发卡片，无需从联系人清单挑选）=====
  const invitePets = familyPets();

  const sendInviteCard = () => {
    if (!name) return;
    if (invitePets.length > 0 && pick.length === 0) {
      setToast("至少选择 1 只宠物档案");
      return;
    }
    const shared = pick.map((i) => invitePets[i]).filter(Boolean);
    const res = sendFamilyInvite(name, peerAvatar, shared);
    setPanel("");
    if (!res.ok) {
      setToast(res.reason === "joined" ? "对方已经是家庭成员了" : "昵称不能为空");
      return;
    }
    setToast(shared.length ? `邀请卡片已发送 · 共享 ${shared.length} 只宠物` : "邀请卡片已发送");
    setMessages(getChatMessages(name, seedMsgs));
  };

  const togglePick = (index: number) => {
    setPick((prev) => {
      if (prev.includes(index)) {
        if (prev.length === 1) {
          setToast("至少保留 1 只宠物档案");
          return prev;
        }
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });
  };

  const renderCard = (card: ChatCard) => <InviteCard card={card} />;

  return (
    <div className="home-stage">
      <div className="home-canvas chat-canvas">
        <div className="chat-head">
          <button className="chat-back" onClick={() => navigate("/mine/messages")}>←</button>
          <h1 className="chat-name">{name || "消息"}</h1>
          <span style={{ width: 40 }}></span>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {!hasTarget ? (
            <div className="chat-empty">
              <p className="chat-empty-title">暂无会话</p>
              <p className="chat-empty-desc">
                {name ? `未找到与「${name}」的历史会话，发送消息即可开始聊天` : "从消息列表选择一位好友开始聊天吧"}
              </p>
              <button className="chat-empty-btn" onClick={() => navigate("/mine/messages")}>返回消息列表</button>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={"chat-msg-row " + (m.from === "me" ? "me" : "")}>
                <img
                  src={m.from === "me" ? meAvatar : peerAvatar}
                  alt=""
                  className="chat-avatar"
                />
                {m.kind === "image" && m.image ? (
                  <button className="chat-bubble-img" onClick={() => setPreview(m.image || "")}>
                    <img src={m.image} alt="图片消息" />
                  </button>
                ) : m.kind === "voice" ? (
                  <button
                    className={"chat-bubble chat-voice" + (playing === i ? " is-playing" : "")}
                    style={{ width: Math.min(200, 78 + (m.duration || 1) * 12) }}
                    onClick={() => playVoice(i, m)}
                  >
                    <span className="cv-play">{playing === i ? "Ⅱ" : "▶"}</span>
                    <span className="cv-wave">
                      {Array.from({ length: 12 }).map((_, k) => (
                        <i key={k} style={{ height: 4 + ((k * 5 + (m.duration || 3)) % 11) }} />
                      ))}
                    </span>
                    <span className="cv-sec">{m.duration}″</span>
                  </button>
                ) : m.card ? (
                  renderCard(m.card)
                ) : (
                  <div className="chat-bubble">{m.text}</div>
                )}
              </div>
            ))
          )}
        </div>

        {panel === "" && (
        <div className="chat-input">
          <button className="chat-plus" onClick={() => setPanel("actions")} aria-label="发送更多内容">＋</button>
          {mode === "text" ? (
            <input
              placeholder="输入消息..."
              value={draft}
              disabled={!name}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
            />
          ) : (
            <button
              className={"chat-hold" + (rec ? " is-recording" : "")}
              disabled={!name}
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerCancel={cancelHold}
              onPointerLeave={() => { if (rec) endHold(); }}
            >
              {rec ? `松开 结束（${recSec}″）` : "按住 说话"}
            </button>
          )}
          <button
            className="chat-mic"
            onClick={() => {
              setMode((m) => (m === "text" ? "voice" : "text"));
              setPanel("");
            }}
            aria-label={mode === "text" ? "切换到语音" : "切换到键盘"}
          >
            {mode === "text" ? <MicIcon /> : <KeyIcon />}
          </button>
          {mode === "text" && (
            <button className="chat-send" onClick={send} disabled={!name}>发送</button>
          )}
        </div>
        )}

        {/* 动作面板：图片 / 语音 / 邀请共同照护 */}
        {panel === "actions" && (
          <div className="chat-sheet-mask" onClick={() => setPanel("")}>
            <div className="chat-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="chat-sheet-grab" />
              <h3 className="chat-sheet-title">发送更多内容</h3>
              <div className="chat-action-grid">
                <button className="chat-action" onClick={() => fileRef.current?.click()}>
                  <span className="chat-action-ic">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1f6d2e" strokeWidth="1.7" strokeLinecap="round">
                      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
                      <path d="M3.8 16.2l4.6-4.6 3.4 3.4 3-3 5.2 5.2" />
                      <circle cx="8.2" cy="9.4" r="1.3" />
                    </svg>
                  </span>
                  <span>图片</span>
                </button>
                <button
                  className="chat-action"
                  onClick={() => { setPanel(""); setMode("voice"); }}
                >
                  <span className="chat-action-ic"><MicIcon /></span>
                  <span>语音</span>
                </button>
                <button className="chat-action" onClick={() => { setPick(invitePets.map((_, i) => i)); setPanel("invite"); }}>
                  <span className="chat-action-ic">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1f6d2e" strokeWidth="1.7" strokeLinecap="round">
                      <circle cx="9" cy="8" r="3.2" />
                      <path d="M3.6 19c0-3 2.4-5 5.4-5s5.4 2 5.4 5M16.5 10.5h5M19 8v5" />
                    </svg>
                  </span>
                  <span>邀请共同照护</span>
                </button>
              </div>
              <button className="chat-sheet-cancel" onClick={() => setPanel("")}>取消</button>
            </div>
          </div>
        )}

        {/* 邀请确认面板 */}
        {panel === "invite" && (
          <div className="chat-sheet-mask" onClick={() => setPanel("")}>
            <div className="chat-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="chat-sheet-grab" />
              <h3 className="chat-sheet-title">邀请「{name || "对方"}」共同照护</h3>
              <p className="chat-sheet-desc">
                邀请会以卡片形式发到当前聊天，对方同意后成为家庭成员。下面勾选本次要共享的宠物档案，可随时在家庭页补充。
              </p>
              <div className="chat-invite-pets">
                {invitePets.length === 0 ? (
                  <p className="chat-invite-empty">你还没有宠物档案，对方加入后暂无可共享内容</p>
                ) : (
                  invitePets.map((p, i) => (
                    <button
                      type="button"
                      key={i}
                      className={"chat-invite-chip" + (pick.includes(i) ? " is-on" : " is-off")}
                      onClick={() => togglePick(i)}
                    >
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.name} />
                      ) : (
                        <span className="chat-invite-chip-ph">{(p.name || "宠")[0]}</span>
                      )}
                      <span>{p.name}</span>
                      <span className="chat-invite-chip-check">{pick.includes(i) ? "✓" : "+"}</span>
                    </button>
                  ))
                )}
              </div>
              {invitePets.length > 0 && (
                <p className="chat-invite-count">已选 {pick.length} / {invitePets.length} 只 · 未选中的宠物不会共享</p>
              )}
              <button className="chat-invite-send" onClick={sendInviteCard}>发送邀请卡片</button>
              <button className="chat-sheet-cancel" onClick={() => setPanel("")}>取消</button>
            </div>
          </div>
        )}

        {/* 录音悬浮提示 */}
        {rec && (
          <div className="chat-rec-hud">
            <span className="chat-rec-dot" />
            正在录音 {recSec}″ · 松开发送
          </div>
        )}

        {/* 图片大图预览 */}
        {preview && (
          <div className="chat-preview-mask" onClick={() => setPreview("")}>
            <img src={preview} alt="预览" className="chat-preview-img" />
          </div>
        )}

        {toast && <div className="chat-toast">{toast}</div>}

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
      </div>
    </div>
  );
}
