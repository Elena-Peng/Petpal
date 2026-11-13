import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import "./../styles/pet-family.css";
import {
  getPets,
  savePet,
  removePet,
  type Pet,
} from "@/utils/petStore";

const SPECIES_MAP: Record<string, string> = {
  犬: "金毛",
  猫: "英短",
  异宠: "玄凤鹦鹉",
};

// 健康指标按宠物类型预设：犬/猫不需要笼温、光照（那是异宠的控温控光指标）
// 用户可在此基础上增删/改指标，保存后首页宠物卡数据三格即时关联
const METRIC_PRESETS: Record<string, { label: string; unit: string }[]> = {
  犬: [
    { label: "体重", unit: "kg" },
    { label: "体温", unit: "℃" },
  ],
  猫: [
    { label: "体重", unit: "kg" },
    { label: "体温", unit: "℃" },
  ],
  异宠: [
    { label: "体重", unit: "kg" },
    { label: "笼温", unit: "℃" },
    { label: "光照", unit: "h" },
    { label: "湿度", unit: "%" },
  ],
};

// 生日相关：默认值不超过今天；给出「距下次生日还有 N 天」的辅助提示
const todayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

// 由生日推算年龄：差整月计算，不足 1 岁显示「N个月」，满岁显示「N岁」或「N岁M个月」
const calcAge = (bday: string): string => {
  if (!bday) return "";
  const parts = bday.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return "";
  const now = new Date();
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (now.getDate() < d) months -= 1;
  if (months < 0) return "";
  const yy = Math.floor(months / 12);
  const mm = months % 12;
  if (yy === 0) return mm === 0 ? "刚出生" : `${mm}个月`;
  return mm === 0 ? `${yy}岁` : `${yy}岁${mm}个月`;
};

const daysToBirthday = (bday: string): number | null => {
  if (!bday) return null;
  const parts = bday.split("-").map(Number);
  const m = parts[1];
  const d = parts[2];
  if (!m || !d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let next = new Date(now.getFullYear(), m - 1, d);
  if (next.getTime() < now.getTime()) next = new Date(now.getFullYear() + 1, m - 1, d);
  return Math.round((next.getTime() - now.getTime()) / 86400000);
};

// 宠物编辑：编辑(带 ?id=) 预填；新增(无 id) 空表单。保存写入 petStore，首页宠物卡即时刷新。
export default function PetEditShell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("id") ?? "";
  // 带 id 但在宠物库中查不到（非法/已删除）时，明确走新增流程，标题与保存行为按"新增宠物"处理
  const editing = editId ? (getPets().find((p) => p.id === editId) ?? undefined) : undefined;
  const isNew = !editing;

  const [type, setType] = useState<"犬" | "猫" | "异宠">(
    editing?.species?.includes("犬") ? "犬"
      : editing?.species?.includes("猫") ? "猫"
      : "异宠"
  );
  const [name, setName] = useState(editing?.name ?? "");
  const [avatar, setAvatar] = useState(editing?.avatar ?? "");
  const [breed, setBreed] = useState(editing?.species ?? "");
  const [gender, setGender] = useState(editing?.gender ?? "");
  const [age, setAge] = useState(
    calcAge(editing?.birthday ?? "") || editing?.age || ""
  );
  const [birthday, setBirthday] = useState(editing?.birthday ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const changeType = (t: "犬" | "猫" | "异宠") => {
    setType(t);
  };

  const notify = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(""), 1800);
  };

  // 上传宠物照片 → 压缩(限长边360px/JPEG 0.82) → base64，避免 localStorage 超配额导致保存失败
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        try {
          const MAX = 360;
          let w = img.width;
          let h = img.height;
          if (w > MAX || h > MAX) {
            const r = Math.min(MAX / w, MAX / h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff"; // 白底，避免透明 PNG 转 JPEG 出黑边
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            setAvatar(canvas.toDataURL("image/jpeg", 0.82));
            return;
          }
        } catch { /* 压缩失败则退回原图 */ }
        setAvatar(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!name.trim()) {
      notify("请填写宠物名字");
      return;
    }
    const p: Pet = {
      id: editing?.id ?? "pet-" + Date.now(),
      name: name.trim(),
      avatar: avatar || editing?.avatar || "",
      species: breed.trim() || SPECIES_MAP[type],
      type, // 记录用户选择的宠物类型（健康指标按类型区分）
      gender: gender || undefined, // 宠物性别（公 / 母），未选则不写
      age: (birthday ? calcAge(birthday) : age.trim()) || "1岁",
      birthday: birthday || undefined,
      status: editing?.status ?? "档案待完善",
      statusSub: editing?.statusSub ?? "完善档案后，这里会展示它的健康状态",
      profile: editing?.profile ?? "宠物档案正常",
      // 健康指标在健康档案页管理：新增宠物按类型预设默认指标，编辑已有宠物保留原指标
      metrics: isNew
        ? (METRIC_PRESETS[type] || METRIC_PRESETS["犬"]).map((p) => ({
            label: p.label,
            value: "--",
            unit: p.unit,
          }))
        : (editing?.metrics || []),
      note: note.trim(),
    };
    savePet(p);
    notify("已保存宠物信息");
    window.setTimeout(() => navigate("/mine/health"), 500);
  };

  // 删除宠物：仅编辑已有宠物时显示，二次确认后移除并清除其 current 选中态
  const handleDelete = () => {
    if (isNew) return;
    if (!window.confirm(`确定删除「${editing?.name ?? "该宠物"}」的宠物档案吗？删除后不可恢复。`)) return;
    removePet(editId); // 级联清理已包含「当前选中态」的清除（按账号私有 key）
    notify("已删除宠物档案");
    window.setTimeout(() => navigate("/mine/health"), 500);
  };

  const pets = getPets();

  return (
    <div className="home-stage">
      <div className="home-canvas pf-canvas">
        <div className="pf-head">
          <button className="pf-back" onClick={() => navigate('/mine/health')}>←</button>
          <h1 className="pf-title">{isNew ? "添加宠物" : "编辑宠物"}</h1>
          <span style={{ width: 40 }}></span>
        </div>

        <div className="pf-body">
          {/* 宠物切换 + 新增 */}
          <div className="pf-pet-switch">
            {pets.map((p) => (
              <div
                key={p.id}
                className={"pf-switch-item" + (p.id === editId ? " active" : "")}
                onClick={() => navigate(`/mine/health/edit?id=${p.id}`)}
              >
                <img src={p.avatar} alt={p.name} className="pf-switch-avatar" />
                <span className="pf-switch-name">{p.name}</span>
              </div>
            ))}
            <div
              className={"pf-switch-item" + (!editId ? " active" : "")}
              onClick={() => navigate("/mine/health/edit")}
            >
              <div className="pf-switch-add">＋</div>
              <span className="pf-switch-name">新增</span>
            </div>
          </div>

          {/* 表单 */}
          <div className="pf-form-group">
            <label className="pf-form-label">上传宠物照片</label>
            <div className="pf-upload-row">
              <div className="pf-upload-box" onClick={() => fileRef.current?.click()}>
                {avatar ? (
                  <img src={avatar} alt="" className="pf-upload-img" />
                ) : (
                  <span style={{ color: "#9bb09b", fontSize: 12 }}>未上传</span>
                )}
              </div>
              <div className="pf-upload-box pf-upload-add" onClick={() => fileRef.current?.click()}>
                <span>＋</span>
                <span style={{ fontSize: 12 }}>上传照片</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
            </div>
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label">宠物名字 *</label>
            <input className="pf-form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="如：啾啾" />
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label">宠物类型</label>
            <div className="pf-type-row">
              {(["犬", "猫", "异宠"] as const).map((t) => (
                <button
                  key={t}
                  className={"pf-type-btn" + (type === t ? " active" : "")}
                  onClick={() => changeType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label">性别</label>
            <div className="pf-type-row">
              {["公", "母"].map((g) => (
                <button
                  key={g}
                  className={"pf-type-btn" + (gender === g ? " active" : "")}
                  onClick={() => setGender(gender === g ? "" : g)}
                >
                  {g}
                </button>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8a9a86", lineHeight: 1.6 }}>
              选填，会和品种、年龄一起展示在档案里
            </p>
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label">品种</label>
            <input className="pf-form-input" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder={SPECIES_MAP[type]} />
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label">年龄</label>
            <input
              className="pf-form-input"
              value={age}
              readOnly={!!birthday}
              onChange={(e) => setAge(e.target.value)}
              placeholder="如：1岁 / 3个月"
              style={
                birthday
                  ? { background: "#f3f7f2", color: "#5d6f5d", cursor: "default" }
                  : undefined
              }
            />
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8a9a86", lineHeight: 1.6 }}>
              {birthday ? "已根据生日自动计算，改生日会同步更新年龄" : "填写下方生日可自动计算年龄，也可手动填写"}
            </p>
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label">生日</label>
            <input
              className="pf-form-input"
              type="date"
              value={birthday}
              max={todayStr()}
              onChange={(e) => {
                const v = e.target.value;
                setBirthday(v);
                // 填了生日就按生日算年龄；清空生日则保留原手填年龄
                if (v) setAge(calcAge(v));
              }}
            />
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8a9a86", lineHeight: 1.6 }}>
              {birthday
                ? `年龄自动算为 ${calcAge(birthday)}；${
                    daysToBirthday(birthday) === 0
                      ? "今天是它的生日 🎂 首页「今日提醒」会显示生日提醒"
                      : `距下次生日还有 ${daysToBirthday(birthday)} 天，生日当天首页「今日提醒」会自动出现提醒`
                  }`
                : "填写后会自动计算年龄，生日当天首页「今日提醒」也会出现生日提醒"}
            </p>
          </div>

          <div className="pf-form-group">
            <label className="pf-form-label">备注</label>
            <textarea className="pf-form-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="宠物的小习惯、过敏信息等" rows={3} />
          </div>

          {/* 健康指标统一在健康档案页管理（按宠物类型预设 + 可自定义 + 随每日记录更新） */}
          <div className="pf-form-group">
            <p style={{ margin: 0, fontSize: 12, color: "#8a9a86", lineHeight: 1.6 }}>
              健康指标（体重/体温/笼温等）请到 <b style={{ color: "#1f6d2e" }}>健康档案</b> 中查看与编辑——系统已按宠物类型预设（犬/猫：体重、体温；异宠：体重、笼温、光照、湿度），也可在健康档案里自定义增删，并随每日记录更新。
            </p>
          </div>

          <button className="pf-save-btn" onClick={handleSave}>保存宠物信息</button>

          {editing && (
            <button
              className="pf-delete-btn"
              onClick={handleDelete}
              style={{
                marginTop: 12,
                width: "100%",
                height: 48,
                borderRadius: 24,
                background: "#fff",
                color: "#d64545",
                border: "1px solid rgba(214, 69, 69, 0.35)",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              删除宠物档案
            </button>
          )}
        </div>

        {toast && (
          <div style={{ position: "fixed", left: "50%", bottom: 120, transform: "translateX(-50%)", background: "rgba(26,43,26,0.9)", color: "#fff", padding: "10px 22px", borderRadius: 22, fontSize: 13, zIndex: 99 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
