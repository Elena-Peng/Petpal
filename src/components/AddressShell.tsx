import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import "@/styles/service.css";
import "@/styles/simple.css";
import "@/styles/address.css";
import {
  getAddresses,
  removeAddress,
  type Address,
} from "@/utils/addressStore";

function fullDetail(a: Address) {
  return `${a.province}${a.city}${a.district}${a.detail}`;
}

export default function AddressShell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect");
  const editLink = (id?: string) => {
    const q = new URLSearchParams();
    if (id) {
      q.set("mode", "edit");
      q.set("id", id);
    }
    if (redirect) q.set("redirect", redirect);
    const qs = q.toString();
    return `/mine/address/edit${qs ? `?${qs}` : ""}`;
  };
  const [version, setVersion] = useState(0);
  const [toast, setToast] = useState("");
  const addresses = getAddresses();
  void version;
  const refresh = () => setVersion((v) => v + 1);

  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };

  const handleDelete = (a: Address) => {
    if (!window.confirm(`确定删除收货地址「${a.name} ${a.phone}」吗？`)) return;
    removeAddress(a.id);
    refresh();
    notify("地址已删除");
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas ad-canvas">
        <header className="ad-head">
          <button className="ad-back" onClick={() => navigate("/mine")} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="ad-title">地址管理</h1>
          <button className="ad-close" onClick={() => navigate("/mine")} aria-label="关闭">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="ad-body">
          {addresses.length === 0 ? (
            <div className="ad-empty">
              <p className="ad-empty-title">暂无收货地址</p>
              <p className="ad-empty-desc">添加收货地址后，商城下单与上门服务更方便</p>
              <button className="ad-empty-btn" onClick={() => navigate(editLink())}>
                去新增
              </button>
            </div>
          ) : (
            addresses.map((a) => (
              <div className="ad-card" key={a.id}>
                <div className="ad-card-main">
                  <div className="ad-card-tag-row">
                    <h3>{a.tag}</h3>
                    {a.isDefault && <span className="ad-default">默认</span>}
                  </div>
                  <p className="ad-card-contact">{a.name}　{a.phone}</p>
                  <p className="ad-card-detail">{fullDetail(a)}</p>
                  <p className="ad-card-note">{a.isDefault ? "适用于上门喂养、环境调试与商品配送" : "仅商品配送"}</p>
                </div>
                <div className="ad-actions">
                  <button
                    className="ad-edit"
                    aria-label="编辑"
                    onClick={() => navigate(editLink(a.id))}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button className="ad-del" aria-label="删除" onClick={() => handleDelete(a)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}

          {addresses.length > 0 && (
            <button className="ad-add" onClick={() => navigate(editLink())}>＋ 新增服务地址</button>
          )}

          <div className="ad-tip">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <strong>异宠上门服务地址提示</strong>
              <p>预约环境调试或护理时，请确认服务人员可进入宠物所在房间。</p>
            </div>
          </div>
        </div>

        {toast && <div className="ad-toast">{toast}</div>}
      </div>
    </div>
  );
}
