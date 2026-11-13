// 家庭邀请的发送逻辑：邀请不再从固定联系人清单里挑，而是在任意聊天里以卡片发出
// 卡片承载「家庭名 / 共享宠物档案 / 确认状态」，对方同意后落库为家庭成员
// 接后端后：发送 = 写 invite 记录 + 推送消息；接受 = 对方客户端回调 addMember
import { getPets, petAge, type Pet } from "./petStore";
import { findUserByNickname, getCurrentUser } from "./userStore";
import { addMember, hasMember, type FamPet } from "./familyStore";
import { appendChatMessage, resolveInviteState, upsertChatMeta } from "./chatStore";

/** 把本机宠物转成卡片上展示的档案结构 */
export function toFamPet(p: Pet): FamPet {
  return {
    name: p.name || "宠物",
    species: p.species || p.type || "宠物",
    age: petAge(p),
    avatar: p.avatar || "",
  };
}

/** 当前账号的宠物档案（邀请卡片里「将共享」的那批） */
export function familyPets(): FamPet[] {
  return getPets().map(toFamPet);
}

/** 读取任意账号名下的宠物档案：对方接受邀请后用于同步「TA 的宠物」 */
export function petsOfAccount(account: string): FamPet[] {
  if (!account) return [];
  try {
    const raw = localStorage.getItem(`petpal-pets:${account}`);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((p: Pet) => p && typeof p.name === "string")
      .map((p: Pet) => ({
        name: p.name,
        species: p.species || p.type || "宠物",
        age: p.age || "",
        avatar: p.avatar || "",
      }));
  } catch {
    return [];
  }
}

export type InviteResult = { ok: boolean; reason?: "empty" | "joined" };

/** 头像值兜底：只接受可直接渲染的地址，占位符（如 @mine-default）一律当作空，交给首字圆底 */
export function usableAvatar(value?: string): string {
  const s = (value || "").trim();
  if (!s) return "";
  if (s.startsWith("data:") || s.startsWith("blob:") || s.startsWith("http")) return s;
  if (s.startsWith("/") || s.startsWith("./") || s.startsWith("@/")) return s;
  return "";
}

/**
 * 向某个聊天对象发送家庭邀请卡片。
 * 返回 false 时调用方可提示「已经是家庭成员」或「昵称不能为空」。
 */
export function sendFamilyInvite(
  targetName: string,
  targetAvatar = "",
  sharedPets?: FamPet[]
): InviteResult {
  const name = (targetName || "").trim();
  if (!name) return { ok: false, reason: "empty" };
  if (hasMember(name)) return { ok: false, reason: "joined" };

  const me = getCurrentUser()?.nickname || "我";
  // 只共享调用方勾选的那几只；没传就退回「全部宠物」
  const pets = sharedPets && sharedPets.length ? sharedPets : familyPets();
  const familyName = `${me}的宠物家庭`;
  const avatar = usableAvatar(targetAvatar);

  appendChatMessage(
    name,
    {
      from: "me",
      text: "",
      time: "刚刚",
      kind: "invite",
      card: {
        kind: "invite",
        title: `邀请你加入「${familyName}」`,
        sub: pets.length
          ? `共同照护 ${pets.length} 只宠物 · 等待对方确认`
          : "等待对方确认",
        pets,
        state: "pending",
      },
    },
    []
  );
  upsertChatMeta(name, avatar, "已发送家庭邀请 · 等待确认");

  // 演示用：对方稍后接受。接后端后由对方的真实「同意」动作触发下面这段
  window.setTimeout(() => {
    resolveInviteState(name, "accepted");
    const user = findUserByNickname(name);
    const theirPets = user ? petsOfAccount(user.account) : [];
    appendChatMessage(
      name,
      {
        from: "them",
        text: "",
        time: "刚刚",
        kind: "invite",
        card: {
          kind: "accept",
          title: `${name} 接受了邀请`,
          sub: theirPets.length
            ? `已加入家庭，并共享 ${theirPets.length} 只宠物档案`
            : "已加入家庭，暂无可共享的宠物档案",
          pets: theirPets,
          state: "accepted",
        },
      },
      []
    );
    upsertChatMeta(name, avatar || usableAvatar(user?.avatar), `${name} 已加入宠物家庭`);
    addMember({
      id: "fam-" + Date.now(),
      name,
      avatar: avatar || usableAvatar(user?.avatar),
      role: "共同照护人 · 可记录与预约",
      tag: "共享",
      pets: theirPets,
    });
  }, 1800);

  return { ok: true };
}
