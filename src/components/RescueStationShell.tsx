// 救助站认证：/mine/rescue-station
// 个人救助 / 救助基地 / 公益组织 三种主体，认证通过后可发布救助线索并展示认证标识。
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "@/styles/service.css";
import "@/styles/provider.css";
import "@/styles/merchant.css";
import {
  RESCUE_ORG_TYPES,
  approveRescue,
  getRescue,
  submitRescue,
  ROLE_UPDATE_EVENT,
  type RescueProfile,
} from "@/utils/roleStore";
import { getRescueRequests } from "@/utils/rescueStore";
import { getCurrentUser } from "@/utils/userStore";

export default function RescueStationShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/mine");
  };

  const user = getCurrentUser();
  const [profile, setProfile] = useState<RescueProfile | null>(getRescue());
  const [panel, setPanel] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    orgName: "",
    orgType: RESCUE_ORG_TYPES[0],
    contact: "",
    phone: "",
    address: "",
    licenseNo: "",
    capacity: "",
    intro: "",
  });

  useEffect(() => {
    const refresh = () => setProfile(getRescue());
    window.addEventListener(ROLE_UPDATE_EVENT, refresh);
    return () => window.removeEventListener(ROLE_UPDATE_EVENT, refresh);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = () => {
    if (!form.orgName.trim()) return setToast("请填写机构名称");
    if (!/^1\d{10}$/.test(form.phone.trim())) return setToast("请填写 11 位手机号");
    if (!form.licenseNo.trim()) return setToast("请填写登记证书编号");
    submitRescue({
      orgName: form.orgName.trim(),
      orgType: form.orgType,
      contact: form.contact.trim() || user?.nickname || "",
      phone: form.phone.trim(),
      address: form.address.trim(),
      licenseNo: form.licenseNo.trim(),
      capacity: form.capacity.trim(),
      intro: form.intro.trim(),
    });
    setPanel(false);
    setToast("资料已提交，等待审核");
  };

  const status = profile?.status ?? "none";
  const myRequests = user ? getRescueRequests().slice(0, 6) : [];

  return (
    <div className="sv-stage">
      <div className="sv-canvas pv-canvas mc-canvas">
        <header className="pv-head pv-head-center">
          <button className="pv-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pv-head-title">救助站认证</h1>
          <span className="pv-head-spacer" />
        </header>

        {!user ? (
          <div className="sv-empty">
            <p className="sv-empty-title">登录后申请救助站认证</p>
            <p className="sv-empty-desc">认证主体可以是个人救助、救助基地或公益组织。</p>
            <button className="sv-empty-btn" onClick={() => navigate("/login?redirect=" + encodeURIComponent("/mine/rescue-station"))}>
              去登录
            </button>
          </div>
        ) : status === "none" ? (
          <>
            <section className="mc-hero is-rescue">
              <div className="mc-hero-badge">R</div>
              <div className="mc-hero-text">
                <h2>成为认证救助站</h2>
                <p>认证后发布救助线索会带「认证救助站」标识，更容易被志愿者与领养人信任。</p>
              </div>
            </section>
            <section className="mc-benefits">
              {[
                ["认证标识", "线索与资料页展示认证徽章"],
                ["发布救助", "随时发布走失/流浪动物救助线索"],
                ["志愿与领养", "接收志愿者报名与领养对接"],
              ].map(([t, d]) => (
                <div className="mc-benefit" key={t}>
                  <span className="mc-benefit-title">{t}</span>
                  <span className="mc-benefit-desc">{d}</span>
                </div>
              ))}
            </section>
            <button className="mc-primary" onClick={() => setPanel(true)}>申请救助站认证</button>
          </>
        ) : status === "pending" && profile ? (
          <>
            <section className="mc-card">
              <div className="mc-card-head">
                <h2>{profile.orgName}</h2>
                <span className="mc-pill is-wait">审核中</span>
              </div>
              <p className="mc-muted">资料已提交，平台将在 1–3 个工作日内完成审核。</p>
              <dl className="mc-kv">
                <div><dt>主体类型</dt><dd>{profile.orgType}</dd></div>
                <div><dt>登记证书</dt><dd>{profile.licenseNo}</dd></div>
                <div><dt>联系电话</dt><dd>{profile.phone}</dd></div>
                <div><dt>所在地</dt><dd>{profile.address || "—"}</dd></div>
              </dl>
            </section>
            <div className="mc-row">
              <button className="mc-ghost" onClick={() => setPanel(true)}>修改资料</button>
              <button className="mc-primary" onClick={() => { approveRescue(); setToast("审核通过"); }}>
                模拟审核通过（演示）
              </button>
            </div>
          </>
        ) : profile ? (
          <>
            <section className="mc-card">
              <div className="mc-card-head">
                <h2>{profile.orgName}</h2>
                <span className="mc-pill is-on">认证救助站</span>
              </div>
              <p className="mc-muted">{profile.intro || "暂无简介"}</p>
              <dl className="mc-kv">
                <div><dt>主体类型</dt><dd>{profile.orgType}</dd></div>
                <div><dt>联系人</dt><dd>{profile.contact || "—"}</dd></div>
                <div><dt>联系电话</dt><dd>{profile.phone}</dd></div>
                <div><dt>所在地</dt><dd>{profile.address || "—"}</dd></div>
                <div><dt>可容纳</dt><dd>{profile.capacity ? profile.capacity + " 只" : "—"}</dd></div>
              </dl>
            </section>
            <div className="mc-row">
              <button className="mc-primary" onClick={() => navigate("/service/rescue-publish")}>
                发布救助请求
              </button>
              <button className="mc-ghost" onClick={() => navigate("/service/rescue")}>查看救助基地</button>
            </div>

            <section className="mc-products">
              <div className="mc-section-head">
                <h3>最近的救助线索</h3>
                <span className="mc-muted">{myRequests.length} 条</span>
              </div>
              {myRequests.length === 0 && (
                <div className="mc-empty">
                  <p>还没有发布过救助线索</p>
                  <button className="mc-link" onClick={() => navigate("/service/rescue-publish")}>发布救助</button>
                </div>
              )}
              {myRequests.map((r) => (
                <article className="mc-prod" key={r.id}>
                  {r.photo ? (
                    <img className="mc-prod-img" src={r.photo} alt={r.species} />
                  ) : (
                    <div className="mc-prod-img mc-prod-img-empty">{r.species.slice(0, 1)}</div>
                  )}
                  <div className="mc-prod-main">
                    <div className="mc-prod-title">
                      <span>{r.species} · {r.location}</span>
                      <span className={"mc-pill" + (r.status === "已完成" ? " is-off" : " is-on")}>{r.status}</span>
                    </div>
                    <p className="mc-prod-meta">{r.desc}</p>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : null}

        {panel && (
          <div className="mc-sheet-mask" onClick={() => setPanel(false)}>
            <div className="mc-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="mc-sheet-bar" />
              <h3 className="mc-sheet-title">救助站认证资料</h3>
              <div className="mc-form">
                <label className="mc-field">
                  <span>机构名称 *</span>
                  <input value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} placeholder="例如：小虎流浪动物救助站" />
                </label>
                <label className="mc-field">
                  <span>主体类型 *</span>
                  <select value={form.orgType} onChange={(e) => setForm({ ...form, orgType: e.target.value })}>
                    {RESCUE_ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="mc-field">
                  <span>联系人</span>
                  <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="负责人姓名" />
                </label>
                <label className="mc-field">
                  <span>手机号 *</span>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="numeric" placeholder="11 位手机号" />
                </label>
                <label className="mc-field">
                  <span>所在地</span>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="城市 / 详细地址" />
                </label>
                <label className="mc-field">
                  <span>登记证书编号 *</span>
                  <input value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} placeholder="登记证书 / 备案编号" />
                </label>
                <label className="mc-field">
                  <span>可容纳数量</span>
                  <input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} inputMode="numeric" placeholder="如 30" />
                </label>
                <label className="mc-field">
                  <span>机构简介</span>
                  <textarea rows={3} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} placeholder="成立时间、救助范围、收容情况" />
                </label>
              </div>
              <button className="mc-primary mc-sheet-submit" onClick={submit}>提交认证</button>
            </div>
          </div>
        )}

        {toast && <div className="mc-toast">{toast}</div>}
      </div>
    </div>
  );
}
