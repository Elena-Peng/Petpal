import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import "@/styles/reminder-manage.css";
import { getStatusDefs, setStatus } from "@/utils/statusStore";
import { getCurrentPet } from "@/utils/petStore";

export default function StatusLogShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type } = useParams();
  const petId = getCurrentPet()?.id ?? "";

  // type 白名单校验：对照 statusStore 现有记录项（默认项 + 自定义项）
  const defs = getStatusDefs();
  const def = defs.find((d) => d.key === type);

  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // 返回：优先来源页 state.from，无历史/深链进入时兜底健康档案
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(typeof from === "string" && from ? from : "/archive");
  };

  // 非法 type：不写入任意 key，展示兜底空态 + 返回入口
  if (!def) {
    return (
      <div className="sv-stage">
        <div className="sv-canvas rm-canvas">
          <header className="rm-head">
            <button className="rm-back" onClick={goBack} aria-label="返回">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="rm-title">记录</h1>
            <span className="rm-head-ghost" />
          </header>
          <div className="rm-empty-state">
            <p className="rm-empty-title">记录项不存在或已被移除</p>
            <button className="rm-add" onClick={goBack}>返回健康档案</button>
          </div>
        </div>
      </div>
    );
  }

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("请填写记录数值");
      return;
    }
    // 统一走 statusStore：只存原始数值字符串，单位由展示层追加；
    // setStatus 内部触发既有广播机制，首页状态卡随之刷新
    setStatus(petId, def.key, trimmed);
    goBack();
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas rm-canvas">
        {/* 顶部 */}
        <header className="rm-head">
          <button className="rm-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="rm-title">记录{def.title}</h1>
          <button className="rm-add" onClick={save}>保存</button>
        </header>

        {/* 表单 */}
        <div className="rm-form">
          <div className="rm-form-field">
            <label className="rm-form-label">{def.title}</label>
            <input
              type="number"
              className="rm-form-input"
              placeholder={def.placeholder}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
            <p className="rm-form-unit">{def.unit}</p>
            {error && <p className="rm-form-error">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
