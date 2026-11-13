import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import "./../styles/messages.css";
import { getSvcChats } from "@/utils/serviceStore";
import { getChats, markChatRead, togglePin, removeChat } from "@/utils/chatStore";

const ACTION_W = 136; // 左滑露出的操作区宽度（置顶 + 删除）

export default function MessagesShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const svcChats = getSvcChats();
  const svcUnread = svcChats.reduce((s, x) => s + (x.unread || 0), 0);
  const lastSvc = svcChats[0];

  const [version, setVersion] = useState(0); // 置顶/删除后刷新列表
  const chats = getChats();
  const list = [...chats].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const [openName, setOpenName] = useState<string | null>(null);
  const startX = useRef<number>(0);
  const suppressClick = useRef(false);

  // 返回兜底：有来源页用来源页，无历史记录时固定回我的页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine");
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent, name: string) => {
    const dx = e.touches[0].clientX - startX.current;
    const el = e.currentTarget as HTMLElement;
    const open = openName === name;
    let tx: number;
    if (open) tx = Math.max(-ACTION_W + dx, -ACTION_W);
    else tx = Math.min(dx, 0);
    if (tx < -6) suppressClick.current = true;
    el.style.transform = `translateX(${tx}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent, name: string) => {
    const el = e.currentTarget as HTMLElement;
    const m = el.style.transform;
    const tx = m ? parseInt(m.replace(/[^\d-]/g, "") || "0", 10) : 0;
    if (tx < -ACTION_W / 2) {
      el.style.transform = `translateX(-${ACTION_W}px)`;
      setOpenName(name);
    } else {
      el.style.transform = "translateX(0px)";
      setOpenName(null);
    }
  };
  const openChat = (name: string) => {
    markChatRead(name); // 打开聊天 = 已读，红点消失
    navigate(`/mine/messages/chat?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="home-stage">
      <div className="home-canvas msg-canvas">
        <div className="msg-head">
          <button className="msg-back" onClick={goBack} aria-label="返回">←</button>
          <h1 className="msg-title">消息</h1>
          <span style={{ width: 40 }}></span>
        </div>

        {/* 服务消息：集中入口（类似抖音「购物消息」）；无服务会话时仍保留，引导去服务页咨询 */}
        <div
          className="msg-item msg-service-entry"
          onClick={() => navigate("/mine/messages/service")}
          style={{ cursor: "pointer" }}
        >
          <div className="msg-avatar-wrap">
            <div className="msg-avatar msg-avatar-service" aria-hidden="true">
              {/* 客服耳机图标：服务消息统一入口 */}
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 13v-1a8 8 0 0 1 16 0v1"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect x="2.6" y="12.2" width="4.4" height="6.4" rx="2.2" fill="#ffffff" />
                <rect x="17" y="12.2" width="4.4" height="6.4" rx="2.2" fill="#ffffff" />
                <path
                  d="M19.2 18.6v.6a2.8 2.8 0 0 1-2.8 2.8h-3.2"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {svcUnread > 0 && <span className="msg-dot" />}
          </div>
          <div className="msg-info">
            <div className="msg-row1">
              <span className="msg-name">服务消息</span>
              {lastSvc?.time && <span className="msg-time">{lastSvc.time}</span>}
            </div>
            <p className="msg-last">
              {svcUnread > 0
                ? `${svcUnread} 条未读服务咨询`
                : (lastSvc?.lastMsg || "暂无服务咨询，去服务页发起咨询")}
            </p>
          </div>
        </div>

        <div className="msg-list">
          {list.length === 0 ? (
            <div className="msg-empty-block">
              <p className="msg-empty-title">还没有好友会话</p>
              <p className="msg-empty-desc">去社区逛逛或在服务页咨询，认识更多宠友吧</p>
              <div className="msg-empty-actions">
                <button className="msg-empty-btn" onClick={() => navigate("/community")}>去社区找好友</button>
                <button className="msg-empty-btn primary" onClick={() => navigate("/service")}>去服务页</button>
              </div>
            </div>
          ) : (
            list.map((m) => {
              const open = openName === m.name;
              return (
                <div key={m.name} className="msg-row">
                  {/* 左滑操作区 */}
                  <div className="msg-actions">
                    <button
                      className="msg-act-pin"
                      onClick={() => { togglePin(m.name); setOpenName(null); setVersion(v => v + 1); }}
                    >
                      {m.pinned ? "取消置顶" : "置顶"}
                    </button>
                    <button
                      className="msg-act-del"
                      onClick={() => { removeChat(m.name); setOpenName(null); setVersion(v => v + 1); }}
                    >
                      删除
                    </button>
                  </div>
                  {/* 会话本体 */}
                  <div
                    className={"msg-item" + (open ? " msg-open" : "")}
                    onTouchStart={onTouchStart}
                    onTouchMove={(e) => onTouchMove(e, m.name)}
                    onTouchEnd={(e) => onTouchEnd(e, m.name)}
                    onClick={() => {
                      if (suppressClick.current) { suppressClick.current = false; return; }
                      if (openName === m.name) { setOpenName(null); return; }
                      openChat(m.name);
                    }}
                  >
                    <div className="msg-avatar-wrap">
                      {m.avatar ? (
                        <img src={m.avatar} alt={m.name} className="msg-avatar" />
                      ) : (
                        <div className="msg-avatar msg-avatar-default">
                          {m.isGroup ? "群" : m.name[0]}
                        </div>
                      )}
                      {m.unread > 0 && <span className="msg-dot" />}
                    </div>
                    <div className="msg-info">
                      <div className="msg-row1">
                        <span className="msg-name">{m.pinned ? "📌 " : ""}{m.name}</span>
                        <span className="msg-time">{m.time}</span>
                      </div>
                      <p className="msg-last">{m.lastMsg}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
