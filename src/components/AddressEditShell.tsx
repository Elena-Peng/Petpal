import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import "@/styles/service.css";
import "@/styles/simple.css";
import "@/styles/profile-edit.css";
import "@/styles/address.css";
import {
  getAddressById,
  saveAddress,
  removeAddress,
} from "@/utils/addressStore";

type FormState = {
  tag: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
};

export default function AddressEditShell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isEdit = params.get("mode") === "edit";
  const editId = params.get("id") ?? "";

  // 编辑时按 id 读取；id 非法/缺失时静默退化为新增（标题与行为均为“新增地址”）
  const editing = isEdit ? getAddressById(editId) : undefined;

  const [form, setForm] = useState<FormState>({
    tag: editing?.tag ?? "",
    name: editing?.name ?? "",
    phone: editing?.phone ?? "",
    province: editing?.province ?? "",
    city: editing?.city ?? "",
    district: editing?.district ?? "",
    detail: editing?.detail ?? "",
    isDefault: editing?.isDefault ?? false,
  });
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "region" | "detail", string>>>({});
  const [toast, setToast] = useState("");
  // 从结算链路跳入时，保存后按 redirect 返回继续结算
  const redirect = params.get("redirect");
  const backTarget = redirect || "/mine/address";

  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "请输入收货人姓名";
    if (!form.phone.trim()) e.phone = "请输入手机号";
    else if (!/^1\d{10}$/.test(form.phone.trim())) e.phone = "手机号格式不正确（11 位数字）";
    if (!form.province.trim() || !form.city.trim() || !form.district.trim())
      e.region = "请填写省 / 市 / 区";
    if (!form.detail.trim()) e.detail = "请输入详细地址";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveAddress({
      id: editing?.id ?? "addr-" + Date.now(),
      tag: form.tag || "其他",
      name: form.name.trim(),
      phone: form.phone.trim(),
      province: form.province.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      detail: form.detail.trim(),
      isDefault: form.isDefault,
    });
    notify("地址已保存");
    window.setTimeout(() => navigate(backTarget), 300);
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!window.confirm("确定删除该收货地址吗？")) return;
    removeAddress(editing.id);
    notify("地址已删除");
    window.setTimeout(() => navigate("/mine/address"), 300);
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas pe-canvas">
        <header className="pe-head">
          <button className="pe-back" onClick={() => navigate("/mine/address")} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pe-title">{editing ? "编辑地址" : "新增地址"}</h1>
          <button className="pe-close" onClick={() => navigate("/mine/address")} aria-label="关闭">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="pe-body">
          <div className="pe-field">
            <label>标签</label>
            <div className="ad-tag-row">
              {["家", "公司", "父母家", "其他"].map((t) => (
                <button
                  key={t}
                  className={"ad-tag-btn" + (form.tag === t ? " active" : "")}
                  onClick={() => set({ tag: t })}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pe-field">
            <label>收货人 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="请输入收货人姓名"
            />
            {errors.name && <p className="pe-error">{errors.name}</p>}
          </div>

          <div className="pe-field">
            <label>手机号 *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="请输入 11 位手机号"
            />
            {errors.phone && <p className="pe-error">{errors.phone}</p>}
          </div>

          <div className="pe-row">
            <div className="pe-field">
              <label>省份 *</label>
              <input type="text" value={form.province} onChange={(e) => set({ province: e.target.value })} placeholder="省" />
            </div>
            <div className="pe-field">
              <label>城市 *</label>
              <input type="text" value={form.city} onChange={(e) => set({ city: e.target.value })} placeholder="市" />
            </div>
          </div>

          <div className="pe-field">
            <label>所在地区 *</label>
            <input type="text" value={form.district} onChange={(e) => set({ district: e.target.value })} placeholder="区/县" />
            {errors.region && <p className="pe-error">{errors.region}</p>}
          </div>

          <div className="pe-field">
            <label>详细地址 *</label>
            <textarea rows={3} value={form.detail} onChange={(e) => set({ detail: e.target.value })} placeholder="街道、楼牌号、门牌号等" />
            {errors.detail && <p className="pe-error">{errors.detail}</p>}
          </div>

          <label className="ad-default-row">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => set({ isDefault: e.target.checked })}
            />
            <span>设为默认地址</span>
          </label>

          <button className="pe-save" onClick={handleSave}>✓ 保存地址</button>

          {editing && (
            <button className="pe-delete" onClick={handleDelete}>删除此地址</button>
          )}
        </div>

        {toast && <div className="pe-toast">{toast}</div>}
      </div>
    </div>
  );
}
