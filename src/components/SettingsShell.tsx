import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import "@/styles/service.css";
import "@/styles/settings.css";

import person from "@/assets/images/mine/set-person.png";
import lock from "@/assets/images/mine/set-lock.png";
import friends from "@/assets/images/mine/set-friends.png";
import heartbeat from "@/assets/images/mine/set-heartbeat.png";
import temp from "@/assets/images/mine/set-temp.png";
import chat from "@/assets/images/mine/set-chat.png";
import book from "@/assets/images/mine/set-book.png";
import help from "@/assets/images/mine/set-help.png";
import shield from "@/assets/images/mine/set-shield.png";
import cube from "@/assets/images/mine/set-cube.png";

type ToggleKey = "healthReminder" | "exoticAlert" | "communityInteract";

type Row = {
  icon: string;
  label: string;
  arrow?: boolean;
  extra?: string;
  path?: string;
  disabled?: boolean; // 暂未开放：置灰并标注「即将上线」
  toggleKey?: ToggleKey;
};
type Group = { title: string; rows: Row[] };

// 通知偏好：localStorage 纯 JSON 布尔值，结构可迁移到后端用户偏好表
const PREFS_KEY = "petpal-notification-prefs";

function readPrefs(): Record<ToggleKey, boolean> {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return {
      healthReminder: !!obj.healthReminder,
      exoticAlert: !!obj.exoticAlert,
      communityInteract: !!obj.communityInteract,
    };
  } catch {
    return { healthReminder: false, exoticAlert: false, communityInteract: false };
  }
}

const GROUPS: Group[] = [
  {
    title: "账号与安全",
    rows: [
      { icon: person, label: "个人资料", arrow: true, path: "/settings/profile" },
      { icon: lock, label: "账号与安全", arrow: true, path: "/settings/account" },
      { icon: friends, label: "数据授权管理", disabled: true, extra: "即将上线" },
    ],
  },
  {
    title: "通知设置",
    rows: [
      { icon: heartbeat, label: "健康与用药提醒", toggleKey: "healthReminder" },
      { icon: temp, label: "异宠环境异常提醒", toggleKey: "exoticAlert" },
      { icon: chat, label: "社区互动通知", toggleKey: "communityInteract" },
    ],
  },
  {
    title: "帮助与关于",
    rows: [
      { icon: book, label: "异宠新手指南", disabled: true, extra: "即将上线" },
      { icon: help, label: "帮助与在线客服", arrow: true, path: "/settings/help" },
      { icon: shield, label: "隐私与数据说明", disabled: true, extra: "即将上线" },
      { icon: cube, label: "关于PetPal", extra: "V1.1.0", arrow: true, path: "/settings/about" },
    ],
  },
];

export default function SettingsShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [prefs, setPrefs] = useState<Record<ToggleKey, boolean>>(readPrefs);

  // 返回兜底：有来源页用来源页，无历史记录时固定回我的页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine");
  };

  const togglePref = (key: ToggleKey) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const onRowClick = (r: Row) => {
    if (r.disabled) return;
    if (r.toggleKey) {
      togglePref(r.toggleKey);
      return;
    }
    if (r.path) navigate(r.path);
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas set-canvas">
        <header className="set-head">
          <button className="set-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="set-title">设置</h1>
        </header>

        {GROUPS.map((g) => (
          <section className="set-group" key={g.title}>
            <h2 className="set-group-title">{g.title}</h2>
            <div className="set-card">
              {g.rows.map((r, i) => (
                <div
                  className={
                    "set-row" +
                    (i < g.rows.length - 1 ? " set-row-border" : "") +
                    (r.disabled ? " set-row-disabled" : "")
                  }
                  key={r.label}
                  onClick={() => onRowClick(r)}
                  style={{ cursor: r.disabled ? "default" : r.toggleKey ? "pointer" : r.path ? "pointer" : "default" }}
                >
                  <img className="set-icon" src={r.icon} alt="" />
                  <span className="set-label">{r.label}</span>
                  {r.extra && <span className="set-extra">{r.extra}</span>}
                  {r.toggleKey !== undefined && (
                    <span className={"set-switch" + (prefs[r.toggleKey] ? " on" : "")}>
                      <span className="set-switch-dot" />
                    </span>
                  )}
                  {r.arrow && (
                    <svg className="set-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
