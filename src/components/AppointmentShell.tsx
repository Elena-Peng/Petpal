import { useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { NEARBY, PLACES, type SvcCard } from "@/utils/serviceData";
import { getPets, getCurrentPet } from "@/utils/petStore";
import { addServiceOrder } from "@/utils/orderStore";
import "@/styles/service.css";

// 预约服务三步流程：宠物与套餐 → 时间与医生 → 确认订单
// 入口：服务详情页"立即预约" → /service/appointment?name=<机构>&project=<项目>
const ALL_CARDS: SvcCard[] = [...NEARBY, ...PLACES];

const SLOTS = ["09:30", "10:20", "13:30", "15:10", "16:40", "19:00"];

const DOCS = [
  { name: "陈简医生", title: "执业兽医 · 从业8年" },
  { name: "李晓医生", title: "执业兽医 · 从业5年" },
  { name: "王医生", title: "动物营养师 · 从业6年" },
];

function dayList() {
  const wd = ["日", "一", "二", "三", "四", "五", "六"];
  const now = new Date();
  const out: { key: string; day: string; mon: string; wd: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({
      key: i === 0 ? "今天" : i === 1 ? "明天" : `周${wd[d.getDay()]}`,
      day: String(d.getDate()),
      mon: `${d.getMonth() + 1}月`,
      wd: wd[d.getDay()],
    });
  }
  return out;
}

export default function AppointmentShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const svcName = params.get("name") || "";
  const project = params.get("project") || "";
  const svc = ALL_CARDS.find((x) => x.name === svcName);
  const p =
    svc?.projects?.find((x) => x.title === project) ||
    svc?.projects?.[0];
  const price = p ? p.price : svc?.price || "¥0";

  const pets = getPets();
  const [step, setStep] = useState(1);
  const [petId, setPetId] = useState(() => getCurrentPet()?.id || pets[0]?.id || "");
  const [dayIdx, setDayIdx] = useState(1); // 默认明天
  const [slot, setSlot] = useState("10:20");
  const [docIdx, setDocIdx] = useState(0);
  const [note, setNote] = useState("");

  const days = useMemo(dayList, []);
  const pet = pets.find((x) => x.id === petId);

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from || "/service");
  };
  const close = () => navigate("/service");

  // 参数缺失或匹配不到：空态 + 返回入口
  if (!svc || !p) {
    return (
      <div className="sv-stage">
        <div className="sv-canvas pv-canvas">
          <header className="pv-head pv-head-center">
            <button className="pv-back" onClick={goBack} aria-label="返回">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <h1 className="pv-head-title">预约服务</h1>
            <span className="pv-head-spacer" />
          </header>
          <div className="sv-empty">
            <p className="sv-empty-title">服务不存在或已下架</p>
            <button className="sv-empty-btn" onClick={() => navigate("/service")}>
              返回服务页
            </button>
          </div>
        </div>
      </div>
    );
  }

  const amt = parseFloat((price || "").replace(/[¥起元]/g, "")) || 0;
  const dateLabel = `${days[dayIdx].mon}${days[dayIdx].day}日 ${slot}`;

  const pay = () => {
    addServiceOrder(svc.name, { title: p.title, price, img: svc.img });
    navigate("/orders");
  };

  return (
    <div className="sv-stage">
      <div className="sv-canvas pv-canvas">
        {/* 顶部返回 + 标题 + 关闭 */}
        <header className="pv-head pv-head-center">
          <button className="pv-back" onClick={goBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <h1 className="pv-head-title">预约服务</h1>
          <button className="pv-close" onClick={close} aria-label="关闭">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {/* 三步进度 */}
        <div className="ap-steps">
          {[
            { n: 1, t: "宠物与套餐" },
            { n: 2, t: "时间与医生" },
            { n: 3, t: "确认订单" },
          ].map((s) => (
            <div
              className={"ap-step" + (step >= s.n ? " on" : "") + (step > s.n ? " done" : "")}
              key={s.n}
            >
              <span className="ap-step-num">{step > s.n ? "✓" : s.n}</span>
              <span className="ap-step-txt">{s.t}</span>
            </div>
          ))}
        </div>

        {/* 第一步：宠物与套餐 */}
        {step === 1 && (
          <>
            <section className="ap-card">
              <h2 className="ap-card-title">本次服务宠物</h2>
              {pets.length === 0 ? (
                <p className="ap-empty-pet">暂无可服务宠物，请先在「我的-宠物」添加。</p>
              ) : (
                pets.map((x) => (
                  <div
                    className={"ap-pet" + (x.id === petId ? " on" : "")}
                    key={x.id}
                    onClick={() => setPetId(x.id)}
                  >
                    <img className="ap-pet-av" src={x.avatar} alt="" />
                    <div className="ap-pet-text">
                      <p className="ap-pet-name">{x.name}</p>
                      <p className="ap-pet-sub">
                        {x.species}
                        {x.note ? ` · ${x.note}` : ""}
                      </p>
                    </div>
                    <span className="ap-check">{x.id === petId ? "✓" : ""}</span>
                  </div>
                ))
              )}
            </section>
            <section className="ap-card">
              <h2 className="ap-card-title">选择服务套餐</h2>
              <div className="ap-pack">
                <div>
                  <p className="ap-pack-title">{p.title}</p>
                  <p className="ap-pack-sub">约45分钟 · 档案自动同步</p>
                </div>
                <span className="ap-pack-price">{price}</span>
              </div>
            </section>
          </>
        )}

        {/* 第二步：时间与医生 */}
        {step === 2 && (
          <>
            <section className="ap-card">
              <h2 className="ap-card-title">选择日期</h2>
              <div className="ap-days">
                {days.map((d, i) => (
                  <div
                    className={"ap-day" + (i === dayIdx ? " on" : "")}
                    key={d.key}
                    onClick={() => setDayIdx(i)}
                  >
                    <p className="ap-day-key">{d.key}</p>
                    <p className="ap-day-num">{d.day}</p>
                    <p className="ap-day-mon">{d.mon}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="ap-card">
              <h2 className="ap-card-title">选择时间</h2>
              <div className="ap-slots">
                {SLOTS.map((s) => (
                  <div
                    className={"ap-slot" + (s === slot ? " on" : "")}
                    key={s}
                    onClick={() => setSlot(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </section>
            <section className="ap-card">
              <h2 className="ap-card-title">选择医生</h2>
              {DOCS.map((d, i) => (
                <div
                  className={"ap-doc" + (i === docIdx ? " on" : "")}
                  key={d.name}
                  onClick={() => setDocIdx(i)}
                >
                  <div>
                    <p className="ap-doc-name">{d.name}</p>
                    <p className="ap-doc-title">{d.title}</p>
                  </div>
                  <span className="ap-check">{i === docIdx ? "✓" : ""}</span>
                </div>
              ))}
            </section>
          </>
        )}

        {/* 第三步：确认订单 */}
        {step === 3 && (
          <section className="ap-card">
            <h2 className="ap-card-title ap-sum-title">{p.title}</h2>
            <div className="ap-sum-row">
              <span>服务宠物</span>
              <b>{pet?.name || "--"}</b>
            </div>
            <div className="ap-sum-row">
              <span>预约时间</span>
              <b>{dateLabel}</b>
            </div>
            <div className="ap-sum-row">
              <span>服务医生</span>
              <b>{DOCS[docIdx].name}</b>
            </div>
            <div className="ap-sum-row">
              <span>服务地点</span>
              <b>{svc.name}</b>
            </div>
            <div className="ap-sum-row ap-sum-price">
              <span>订单金额</span>
              <b className="ap-red">{price}</b>
            </div>
            <div className="ap-note">
              <p className="ap-note-label">服务备注</p>
              <textarea
                className="ap-note-input"
                placeholder="可填写宠物近期状态或其他需求"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </section>
        )}

        {/* 底部操作条 */}
        <div className="ap-bar">
          <div className="ap-total">
            <span>合计</span>
            <b className="ap-total-num">{price}</b>
          </div>
          <button className="ap-next" onClick={() => (step < 3 ? setStep(step + 1) : pay())}>
            {step === 3 ? "确认并支付" : "下一步"}
          </button>
        </div>
      </div>
    </div>
  );
}
