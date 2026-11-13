import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import robotAvatar from "@/assets/images/7f6d5c6166c8caaabd61f0b0d91f72333269d9e0.png";
import userAvatar from "@/assets/images/common-avatar.svg";
import "@/styles/paipai.css";

type Msg = {
  role: "ai" | "user";
  text: string;
  title?: string;
  answer?: string[];
};

const SUGGESTIONS = [
  "🐱 猫咪不吃东西怎么办？",
  "🐕 狗狗多久洗一次澡？",
  "💉 宠物需要打哪些疫苗？",
  "🐛 宠物多久驱虫一次？",
  "🍂 宠物掉毛严重怎么办？",
  "✂ 怎么给宠物剪指甲？",
];

const WELCOME = "你好呀！我是派派，你的宠物专属智能助手～🐾";

// 设计稿预置的一轮问答：用户问“掉毛”，派派给出应对建议
const INITIAL_MESSAGES: Msg[] = [
  { role: "ai", text: WELCOME },
  { role: "user", text: "宠物掉毛严重怎么办？" },
  {
    role: "ai",
    text: "",
    title: "掉毛应对：",
    answer: ["每日梳毛", "补充鱼油", "选择优质主粮", "异常脱毛建议就医"],
  },
];

export default function PaipaiShell() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新消息出现后滚动到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setDraft("");
    // 原型阶段固定回复；接入后端后替换为真实 AI 问答
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "收到～先给你通用建议，后续会结合当前宠物档案回答：",
          title: "参考建议：",
          answer: ["保持规律喂食与清洁饮水", "观察精神、食欲与排便变化", "症状持续或异常时及时就医"],
        },
      ]);
    }, 350);
  };

  const clear = () => setMessages([{ role: "ai", text: WELCOME }]);

  return (
    <div className="paipai-stage">
      <div className="paipai-canvas">
        <header className="pp-topbar">
          <button className="pp-back" onClick={() => navigate("/")} aria-label="返回">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="pp-title">派派</h1>
          <button className="pp-clear" onClick={clear}>清除</button>
        </header>

        <div className="pp-scroll" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={"pp-row " + m.role}>
              {m.role === "ai" && <img className="pp-avatar" src={robotAvatar} alt="派派" />}
              <div className={"pp-bubble " + m.role}>
                {m.text && <p className="pp-bubble-text">{m.text}</p>}
                {m.title && <p className="pp-answer-title">{m.title}</p>}
                {m.answer && (
                  <ul className="pp-answer-list">
                    {m.answer.map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
              {m.role === "user" && <img className="pp-avatar" src={userAvatar} alt="我" />}
            </div>
          ))}

          {/* 常见问题建议胶囊：点击填入输入框 */}
          <div className="pp-suggest">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="pp-chip" onClick={() => setDraft(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <footer className="pp-inputbar">
          <input
            className="pp-input"
            value={draft}
            placeholder="输入你的问题"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(draft);
            }}
          />
          <button className="pp-send" onClick={() => send(draft)}>
            发送
          </button>
        </footer>
      </div>
    </div>
  );
}
