import { useNavigate, useLocation } from "react-router";
import "./../styles/messages.css";
import { getSvcChats } from "@/utils/serviceStore";

// 服务消息：服务在线咨询的集中管理页（类似抖音「购物消息」）
// 从消息页「服务消息」入口进入，列出所有咨询会话，点击进入对应聊天
export default function ServiceMessagesShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const svcChats = getSvcChats();

  // 返回兜底：有来源页用来源页，无历史记录时固定回消息页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine/messages");
  };

  return (
    <div className="home-stage">
      <div className="home-canvas msg-canvas">
        <div className="msg-head">
          <button className="msg-back" onClick={goBack} aria-label="返回">←</button>
          <h1 className="msg-title">服务消息</h1>
          <span style={{ width: 40 }}></span>
        </div>

        {svcChats.length === 0 ? (
          <div className="msg-empty-block">
            <p className="msg-empty-title">暂无服务咨询</p>
            <p className="msg-empty-desc">去服务页浏览服务商或门店，发起咨询后在这里查看回复</p>
            <div className="msg-empty-actions">
              <button className="msg-empty-btn primary" onClick={() => navigate("/service")}>去服务页发起咨询</button>
            </div>
          </div>
        ) : (
          <div className="msg-list">
            {svcChats.map((m) => (
              <div
                key={m.name}
                className="msg-item"
                onClick={() => navigate(`/mine/messages/chat?name=${encodeURIComponent(m.name)}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="msg-avatar-wrap">
                  <img src={m.avatar} alt={m.name} className="msg-avatar" />
                  {m.unread > 0 && <span className="msg-dot" />}
                </div>
                <div className="msg-info">
                  <div className="msg-row1">
                    <span className="msg-name">{m.name}</span>
                    <span className="msg-time">{m.time}</span>
                  </div>
                  <p className="msg-last">{m.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
