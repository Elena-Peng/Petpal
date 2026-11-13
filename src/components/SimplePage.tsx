import { useNavigate, useLocation } from "react-router";
import "@/styles/service.css";
import "@/styles/simple.css";
import { logoutUser, getCurrentUser } from "@/utils/userStore";

type Type =
  | "messages"
  | "publishes"
  | "health"
  | "favorites"
  | "address"
  | "medals"
  | "history"
  | "profile"
  | "account"
  | "help"
  | "about";

const META: Record<Type, { title: string; desc: string }> = {
  messages: { title: "消息管理", desc: "暂无新消息" },
  publishes: { title: "我的发布", desc: "你还没有发布过动态" },
  health: { title: "健康报告", desc: "暂无健康报告" },
  favorites: { title: "收藏与关注", desc: "你还没有收藏内容" },
  address: { title: "地址管理", desc: "暂无收货地址" },
  medals: { title: "我的勋章", desc: "还没有获得勋章" },
  history: { title: "浏览足迹", desc: "暂无浏览记录" },
  profile: { title: "个人资料", desc: "" },
  account: { title: "账号与安全", desc: "" },
  help: { title: "帮助与在线客服", desc: "" },
  about: { title: "关于 PetPal", desc: "" },
};

type Row = {
  label: string;
  value?: string;
  disabled?: boolean; // 暂未开放：置灰并标注「即将上线」
  onClick?: () => void;
};

export default function SimplePage({ type }: { type: Type }) {
  const navigate = useNavigate();
  const location = useLocation();
  const meta = META[type];
  const current = getCurrentUser();

  // 设置页二级页（个人资料/账号与安全/帮助/关于）返回设置页，其余返回我的页
  const isSettingsSub = ["profile", "account", "help", "about"].includes(type);
  const backPath = isSettingsSub ? "/settings" : "/mine";

  // 返回兜底：有来源页用来源页，无历史记录时固定上级页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || backPath);
  };

  const rows: Row[] = (() => {
    switch (type) {
      case "profile":
        return [
          { label: "头像", value: "点击修改", onClick: () => navigate("/mine/profile/edit") },
          { label: "昵称", value: current?.nickname || "未设置" },
          { label: "性别", value: current?.gender || "未设置" },
          { label: "生日", value: current?.birthday || "未设置" },
          { label: "地区", value: current?.city || "未设置" },
          { label: "个人简介", value: current?.bio || "未设置" },
        ];
      case "account":
        return [
          { label: "手机号", value: current?.phone || "未绑定" },
          { label: "邮箱", value: "未绑定" },
          { label: "修改密码", value: "即将上线", disabled: true },
          { label: "实名认证", value: "已认证" },
          { label: "注销账号", value: "即将上线", disabled: true },
        ];
      case "help":
        return [
          { label: "常见问题", value: "即将上线", disabled: true },
          { label: "意见反馈", value: "即将上线", disabled: true },
          { label: "联系客服", value: "在线" },
          { label: "用户协议", value: "即将上线", disabled: true },
          { label: "隐私政策", value: "即将上线", disabled: true },
        ];
      case "about":
        return [
          { label: "版本", value: "V1.1.0" },
          { label: "用户协议", value: "即将上线", disabled: true },
          { label: "隐私政策", value: "即将上线", disabled: true },
          { label: "开源许可", value: "即将上线", disabled: true },
        ];
      default:
        return [];
    }
  })();

  return (
    <div className="sv-stage">
      <div className="sv-canvas simple-canvas">
        <header className="simple-head">
          <button className="simple-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="simple-title">{meta.title}</h1>
        </header>
        <div className="simple-body">
          {rows.length > 0 ? (
            <div className="simple-card">
              {rows.map((r) => (
                <div
                  className={"simple-row" + (r.disabled ? " simple-row-disabled" : "")}
                  key={r.label}
                  onClick={r.disabled ? undefined : r.onClick}
                  style={{ cursor: r.onClick && !r.disabled ? "pointer" : "default" }}
                >
                  <span className="simple-row-label">{r.label}</span>
                  <span className="simple-row-value">{r.value ?? "›"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="simple-card">
              <div className="simple-empty">{meta.desc}</div>
            </div>
          )}

          {/* 账号与安全：退出登录 */}
          {type === "account" && (
            <button
              className="simple-logout"
              onClick={() => {
                logoutUser();
                navigate("/settings", { replace: true });
              }}
            >
              退出登录
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
