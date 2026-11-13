import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import "./../styles/pet-family.css";
import { getPets, petAge } from "@/utils/petStore";
import { getCurrentUser } from "@/utils/userStore";
import { getChats } from "@/utils/chatStore";
import { sendFamilyInvite, toFamPet, usableAvatar } from "@/utils/familyInvite";
import {
  FAMILY_UPDATE_EVENT,
  getMembers,
  removeMember,
  type FamMember,
} from "@/utils/familyStore";

// 左滑露出的操作区宽度
const DEL_W = 64;

type MemberRow = FamMember & { isSelf?: boolean };

export default function PetFamilyShell() {
  const navigate = useNavigate();
  const me = getCurrentUser();
  const pets = getPets();

  const [members, setMembers] = useState<FamMember[]>(() => getMembers());
  const [openId, setOpenId] = useState<string | null>(null); // 当前左滑露出删除按钮的成员
  const [dragDx, setDragDx] = useState<{ id: string; dx: number } | null>(null);
  const [detail, setDetail] = useState<MemberRow | null>(null); // 成员详情抽屉
  const [inviteOpen, setInviteOpen] = useState(false); // 邀请抽屉
  const [toast, setToast] = useState("");
  const drag = useRef<{ id: string; x0: number; dx: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  // 成员数据变化（接受邀请 / 移除）后实时刷新
  useEffect(() => {
    const onFam = () => setMembers(getMembers());
    window.addEventListener(FAMILY_UPDATE_EVENT, onFam);
    return () => window.removeEventListener(FAMILY_UPDATE_EVENT, onFam);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  // 当前登录用户始终作为管理员展示；其余成员来自持久化数据
  const selfRow: MemberRow = {
    id: "self",
    name: me?.nickname || "我",
    avatar: me?.avatar && String(me.avatar).startsWith("data:") ? me.avatar : "",
    role: "管理员 · 可管理全部宠物",
    tag: "自己",
    pets: pets.map((p) => ({ name: p.name, species: p.species, age: petAge(p), avatar: p.avatar })),
    addedAt: 0,
    isSelf: true,
  };
  const members2: MemberRow[] = [selfRow, ...members];

  // ===== 左滑删除 =====
  const startDrag = (e: React.PointerEvent, id: string) => {
    drag.current = { id, x0: e.clientX, dx: 0, moved: false };
  };

  const moveDrag = (e: React.PointerEvent, id: string) => {
    const d = drag.current;
    if (!d || d.id !== id) return;
    const raw = e.clientX - d.x0;
    if (Math.abs(raw) > 5) d.moved = true;
    d.dx = Math.max(-DEL_W - 12, Math.min(0, raw));
    setDragDx({ id, dx: d.dx });
  };

  const endDrag = (_e: React.PointerEvent, id: string) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== id) return;
    if (d.moved) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 120);
      const open = d.dx <= -DEL_W / 2;
      setOpenId(open ? id : null);
    }
    setDragDx(null);
  };

  const doRemove = (m: MemberRow) => {
    if (m.isSelf) return;
    setMembers(removeMember(m.id));
    setOpenId(null);
    setDetail(null);
    setToast(`已移除「${m.name}」，对方将不再看到家庭宠物档案`);
  };

  const openDetail = (m: MemberRow) => {
    if (suppressClick.current) return;
    if (openId === m.id) { setOpenId(null); return; } // 滑开状态点击先收起
    setDetail(m);
  };

  // ===== 邀请：不再从固定名单里挑人，输入昵称即把邀请卡片发到对应聊天 =====
  const [inviteName, setInviteName] = useState("");
  // 本次邀请要共享的宠物（按下标勾选，默认全选，至少保留 1 只）
  const [invitePick, setInvitePick] = useState<number[]>([]);
  const recentTargets = getChats()
    .slice(0, 6)
    .map((c) => ({ name: c.name, avatar: c.avatar }));

  const openInvite = () => {
    setInvitePick(pets.map((_, i) => i));
    setInviteOpen(true);
  };

  const toggleInvitePick = (index: number) => {
    setInvitePick((prev) => {
      if (prev.includes(index)) {
        if (prev.length === 1) {
          setToast("至少保留 1 只宠物档案");
          return prev;
        }
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });
  };

  const submitInvite = () => {
    const target = inviteName.trim();
    if (!target) {
      setToast("请输入对方昵称");
      return;
    }
    if (pets.length > 0 && invitePick.length === 0) {
      setToast("至少选择 1 只宠物档案");
      return;
    }
    const shared = invitePick.map((i) => pets[i]).filter(Boolean).map(toFamPet);
    const res = sendFamilyInvite(
      target,
      recentTargets.find((t) => t.name === target)?.avatar || "",
      shared
    );
    if (!res.ok) {
      setToast(res.reason === "joined" ? `「${target}」已经是家庭成员了` : "请输入对方昵称");
      return;
    }
    setInviteOpen(false);
    setInviteName("");
    navigate(`/mine/messages/chat?name=${encodeURIComponent(target)}`);
  };

  return (
    <div className="home-stage">
      <div className="home-canvas pf-canvas">
        <div className="pf-head">
          <button className="pf-back" onClick={() => navigate('/mine')}>←</button>
          <h1 className="pf-title">宠物家庭</h1>
          <span style={{ width: 40 }}></span>
        </div>

        <div className="pf-body">
          {/* 家庭概览卡片 */}
          <div className="pf-family-card">
            <div className="pf-family-avatars">
              {pets.map((p, i) => (
                p.avatar ? (
                  <img key={p.id} src={p.avatar} alt={p.name} className="pf-family-avatar" style={{ zIndex: pets.length - i }} />
                ) : (
                  <span key={p.id} className="pf-family-avatar" style={{ zIndex: pets.length - i, background: "#1f6d2e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>{(p.name || "宠")[0]}</span>
                )
              ))}
            </div>
            <div className="pf-family-info">
              <h2 className="pf-family-title">{me?.nickname || "我的"}的宠物家庭</h2>
              <p className="pf-family-sub">{pets.length}只宠物 · {members2.length}位成员 · 数据安全共享</p>
            </div>
          </div>

          {/* 宠物列表 */}
          <div className="pf-section-head">
            <h2 className="pf-section-title">我的宠物</h2>
          </div>

          <div className="pf-pet-list">
            {pets.map((p) => (
              <div key={p.id} className="pf-pet-item">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="pf-pet-avatar" />
                ) : (
                  <span className="pf-pet-avatar" style={{ background: "#1f6d2e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>{(p.name || "宠")[0]}</span>
                )}
                <div className="pf-pet-info">
                  <h3 className="pf-pet-name">{p.name}</h3>
                  <p className="pf-pet-meta">{p.species}{p.gender ? ` · ${p.gender}` : ""} · {petAge(p)}</p>
                </div>
                <button className="pf-pet-edit" onClick={() => navigate(`/mine/health/edit?id=${p.id}`)}>编辑</button>
              </div>
            ))}
            <button className="pf-add-pet" onClick={() => navigate('/mine/health/edit')}>＋ 添加宠物</button>
          </div>

          {/* 家庭成员 */}
          <div className="pf-section-head">
            <h2 className="pf-section-title">家庭成员</h2>
            <span className="pf-section-more" onClick={openInvite}>邀请成员 ›</span>
          </div>

          <div className="pf-member-list">
            {members2.map((m) => {
              const dx = dragDx?.id === m.id ? dragDx.dx : (openId === m.id ? -DEL_W : 0);
              return (
                <div key={m.id} className="pf-member-swipe">
                  {!m.isSelf && (
                    <button className={"pf-member-del" + (dx < 0 ? " show" : "")} onClick={() => doRemove(m)}>移除</button>
                  )}
                  <div
                    className="pf-member-item"
                    style={{
                      transform: `translateX(${dx}px)`,
                      // 左移多少就在左侧补回多少内边距：行内容保持原位不被裁切，只露出右侧操作区
                      paddingLeft: 14 - dx,
                      transition: dragDx?.id === m.id ? "none" : undefined,
                    }}
                    onPointerDown={m.isSelf ? undefined : (e) => startDrag(e, m.id)}
                    onPointerMove={m.isSelf ? undefined : (e) => moveDrag(e, m.id)}
                    onPointerUp={m.isSelf ? undefined : (e) => endDrag(e, m.id)}
                    onPointerCancel={m.isSelf ? undefined : (e) => endDrag(e, m.id)}
                    onClick={() => openDetail(m)}
                  >
                    {usableAvatar(m.avatar) ? (
                      <img src={usableAvatar(m.avatar)} alt={m.name} className="pf-member-avatar pf-member-avatar-img" />
                    ) : (
                      <div className="pf-member-avatar pf-member-avatar-empty">{(m.name || "成")[0]}</div>
                    )}
                    <div className="pf-member-info">
                      <h3 className="pf-member-name">{m.name}</h3>
                      <p className="pf-member-role">
                        {dx < 0 ? (m.role || "").split(" · ")[0] : m.role}
                        {!m.isSelf && (m.pets?.length ?? 0) > 0 ? ` · ${m.pets.length} 只宠物` : ""}
                      </p>
                    </div>
                    <span className="pf-member-tag" style={dx < 0 ? { opacity: 0 } : undefined}>{m.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="pf-invite" onClick={openInvite}>＋ 邀请共同照护人</button>

          <p className="pf-note">🔒 健康敏感信息由管理员单独授权，服务商无法查看家庭数据。</p>
        </div>

        {/* 成员详情抽屉 */}
        {detail && (
          <div className="pf-sheet-mask" onClick={() => setDetail(null)}>
            <div className="pf-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="pf-sheet-grab" />
              <div className="pf-sheet-member">
                {usableAvatar(detail.avatar) ? (
                  <img src={usableAvatar(detail.avatar)} alt={detail.name} className="pf-sheet-avatar" />
                ) : (
                  <div className="pf-sheet-avatar pf-sheet-avatar-empty">{(detail.name || "成")[0]}</div>
                )}
                <div>
                  <h3 className="pf-sheet-name">{detail.name}</h3>
                  <p className="pf-sheet-sub">{detail.role}</p>
                </div>
                <span className="pf-member-tag">{detail.tag}</span>
              </div>

              <h4 className="pf-sheet-label">TA 的宠物（{detail.pets?.length ?? 0}）</h4>
              {(detail.pets?.length ?? 0) === 0 ? (
                <p className="pf-sheet-empty">暂无可共享的宠物档案</p>
              ) : (
                <div className="pf-sheet-pets">
                  {(detail.pets || []).map((p, i) => (
                    <div key={i} className="pf-sheet-pet">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.name} className="pf-sheet-pet-img" />
                      ) : (
                        <div className="pf-sheet-pet-img pf-sheet-pet-empty">{(p.name || "宠")[0]}</div>
                      )}
                      <div>
                        <h5 className="pf-sheet-pet-name">{p.name}</h5>
                        <p className="pf-sheet-pet-meta">{p.species} · {p.age}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!detail.isSelf && (
                <button className="pf-sheet-danger" onClick={() => doRemove(detail)}>移除家庭成员</button>
              )}
              <button className="pf-sheet-cancel" onClick={() => setDetail(null)}>关闭</button>
            </div>
          </div>
        )}

        {/* 邀请抽屉：输入昵称，邀请卡片直接发到聊天 */}
        {inviteOpen && (
          <div className="pf-sheet-mask" onClick={() => setInviteOpen(false)}>
            <div className="pf-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="pf-sheet-grab" />
              <h3 className="pf-sheet-name">邀请共同照护人</h3>
              <p className="pf-sheet-sub">
                不用从名单里挑人：输入对方昵称，邀请会以卡片发到与 TA 的聊天里，对方同意后成为家庭成员，并互相看到宠物档案。
              </p>
              <div className="pf-invite-input">
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="输入对方昵称"
                  onKeyDown={(e) => { if (e.key === "Enter") submitInvite(); }}
                />
              </div>
              {recentTargets.length > 0 && (
                <>
                  <p className="pf-invite-hint">最近联系人</p>
                  <div className="pf-invite-chips">
                    {recentTargets.map((t) => (
                      <button
                        key={t.name}
                        className={"pf-invite-chip" + (inviteName === t.name ? " is-on" : "")}
                        onClick={() => setInviteName(t.name)}
                      >
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.name} />
                        ) : (
                          <span className="pf-invite-chip-ph">{t.name[0]}</span>
                        )}
                        {t.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="pf-invite-tip">也可以在任意聊天的「＋」里选择「邀请共同照护」</p>
              {pets.length > 0 && (
                <>
                  <div className="pf-share-head">
                    <span>本次共享的宠物</span>
                    <span className="pf-share-count">{invitePick.length}/{pets.length}</span>
                  </div>
                  <div className="pf-share-chips">
                    {pets.map((p, i) => (
                      <button
                        type="button"
                        key={p.id || i}
                        className={"pf-share-chip" + (invitePick.includes(i) ? " is-on" : " is-off")}
                        onClick={() => toggleInvitePick(i)}
                      >
                        {invitePick.includes(i) ? "✓" : "+"} {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button className="pf-sheet-primary" onClick={submitInvite}>发送邀请</button>
              <button className="pf-sheet-cancel" onClick={() => setInviteOpen(false)}>取消</button>
            </div>
          </div>
        )}

        {toast && <div className="pf-toast">{toast}</div>}
      </div>
    </div>
  );
}
