// 我要救助：发布救助请求页 /service/rescue-publish
// 表单：物种 / 地点 / 现场情况 / 照片（演示）/ 联系方式；提交写入 rescueStore。
// 校验全部内联展示，不使用原生 alert 阻塞流程。
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "@/styles/service.css";
import "@/styles/provider.css";
import { publishRescueRequest, getRescueRequests } from "@/utils/rescueStore";

import svHelpQuestion from "@/assets/images/service/sv-help-question.png";
import svShield from "@/assets/images/service/sv-shield.png";

const SPECIES = ["猫", "犬", "异宠", "其他"];

// 手机号 / 微信号的宽松格式校验：11 位手机号，或 6-20 位字母数字（含 _-）微信号
const PHONE_RE = /^1[3-9]\d{9}$/;
const WECHAT_RE = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/;

export default function RescuePublishShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [species, setSpecies] = useState("猫");
  const [locationText, setLocationText] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ location?: string; desc?: string; contact?: string }>({});
  const [done, setDone] = useState(false);
  const requests = getRescueRequests();

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/service/rescue");
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!locationText.trim()) next.location = "请填写发现地点";
    if (!desc.trim()) next.desc = "请描述现场情况";
    const c = contact.trim();
    if (!c) next.contact = "请填写联系方式，便于志愿者回访";
    else if (!PHONE_RE.test(c) && !WECHAT_RE.test(c))
      next.contact = "请填写正确的手机号（11 位）或微信号";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    publishRescueRequest({
      species,
      location: locationText.trim(),
      desc: desc.trim(),
      contact: contact.trim(),
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="sv-stage">
        <div className="sv-canvas pv-canvas rsb-canvas">
          <header className="pv-head pv-head-center">
            <button className="pv-back" onClick={() => navigate("/service/rescue")} aria-label="返回">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="pv-head-title">提交成功</h1>
            <span className="pv-head-spacer" />
          </header>
          <div className="rsb-success">
            <div className="rsb-success-icon">
              <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <h2 className="rsb-success-title">救助请求已提交</h2>
            <p className="rsb-success-desc">
              已写入救助队列，基地与志愿者会尽快匹配处理。<br />请保持联系方式畅通，方便回访确认。
            </p>
            {/* 我的救助请求：回读 rescueStore 最近提交的条目 */}
            {requests.length > 0 && (
              <div className="rsb-my-reqs">
                <p className="rsb-my-reqs-title">我的救助请求（{requests.length}）</p>
                {requests.slice(0, 3).map((r) => (
                  <div className="rsb-my-req" key={r.id}>
                    <span className="rsb-my-req-species">{r.species}</span>
                    <span className="rsb-my-req-loc">{r.location}</span>
                    <span className="rsb-my-req-status">{r.status}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="pet-apply-btn rsb-success-btn" onClick={() => navigate("/service/rescue")}>
              返回救助基地
            </button>
            <button className="rsb-success-ghost" onClick={() => navigate("/service/rescue")}>
              查看我的救助请求
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-stage">
      <div className="sv-canvas pv-canvas rsb-canvas">
        <header className="pv-head pv-head-center">
          <button className="pv-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pv-head-title">发布救助请求</h1>
          <span className="pv-head-spacer" />
        </header>

        <div className="rsb-form">
          {/* 顶部提示 */}
          <div className="rsb-form-tip">
            <img src={svShield} alt="" />
            <span>请如实描述现场情况，勿擅自抓捕受伤动物</span>
          </div>

          {/* 物种选择 */}
          <label className="rsb-field">
            <span className="rsb-label">动物种类</span>
            <div className="rsb-species">
              {SPECIES.map((s) => (
                <button
                  key={s}
                  className={"rsb-species-item" + (species === s ? " active" : "")}
                  onClick={() => setSpecies(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </label>

          {/* 发现地点 */}
          <label className="rsb-field">
            <span className="rsb-label">发现地点 *</span>
            <input
              className={"rsb-input" + (errors.location ? " invalid" : "")}
              placeholder="如：长沙市天心区XX小区门口"
              value={locationText}
              onChange={(e) => {
                setLocationText(e.target.value);
                if (errors.location) setErrors((p) => ({ ...p, location: undefined }));
              }}
            />
            {errors.location && <span className="rsb-field-error">{errors.location}</span>}
          </label>

          {/* 现场情况 */}
          <label className="rsb-field">
            <span className="rsb-label">现场情况 *</span>
            <textarea
              className={"rsb-input rsb-textarea" + (errors.desc ? " invalid" : "")}
              placeholder="描述动物的状况、伤情或环境，如：疑似骨折、幼猫被遗弃、无法自行进食……"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                if (errors.desc) setErrors((p) => ({ ...p, desc: undefined }));
              }}
            />
            {errors.desc && <span className="rsb-field-error">{errors.desc}</span>}
          </label>

          {/* 照片（演示占位，说明性文案，不弹原生 alert） */}
          <label className="rsb-field">
            <span className="rsb-label">现场照片（选填）</span>
            <button className="rsb-photo" type="button" onClick={() => { /* 演示版：照片上传待接后端 */ }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#9bb09b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="9" cy="10" r="2" />
                <path d="M5 19l5-5 3 3 4-4 3 3" />
              </svg>
              <span>上传照片</span>
            </button>
            <span className="rsb-field-hint">演示版：照片上传待接后端，提交前可先填写文字情况。</span>
          </label>

          {/* 联系方式 */}
          <label className="rsb-field">
            <span className="rsb-label">联系方式 *</span>
            <input
              className={"rsb-input" + (errors.contact ? " invalid" : "")}
              placeholder="手机号 / 微信号"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (errors.contact) setErrors((p) => ({ ...p, contact: undefined }));
              }}
            />
            {errors.contact && <span className="rsb-field-error">{errors.contact}</span>}
          </label>

          {/* 说明 */}
          <div className="rsb-form-note">
            <img src={svHelpQuestion} alt="" />
            <span>已有 {requests.length} 条待处理请求，提交后基地会尽快联系你</span>
          </div>

          <button className="pet-apply-btn rsb-submit" onClick={submit}>
            提交救助请求
          </button>
        </div>
      </div>
    </div>
  );
}
