// 宠物家庭数据层：家庭成员 + 成员可见的宠物档案
// localStorage 持久化，结构对齐后端「family_members / member_pets」两张表，可平滑迁移。
// 家庭成员按账号隔离（petpal-family-members:<账号>）：不同账号的家庭互不可见。
import pangbabao from "@/assets/images/community/pangbabao1.jpg";
import xiaobao from "@/assets/images/community/post3-swim.png";
import niangao from "@/assets/images/community/city-cat-front.png";
import { adoptLegacyKey, scopedKey } from "./accountScoped";

const KEY_BASE = "petpal-family-members";
const key = () => {
  adoptLegacyKey(KEY_BASE);
  return scopedKey(KEY_BASE);
};
export const FAMILY_UPDATE_EVENT = "petpal-family-update";

export type FamPet = {
  name: string;
  species: string;
  age: string;
  avatar: string; // 宠物照片
};

export type FamMember = {
  id: string;
  name: string;
  avatar: string; // 成员头像；空字符串时用首字兜底
  role: string; // 角色文案，如「共同照护人 · 可记录与预约」
  tag: string; // 右上角标签，如「管理」
  pets: FamPet[]; // 对方的宠物（接受邀请后对家庭成员可见）
  addedAt: number;
};

/** 可邀请的好友（演示用好友关系；接入后端后替换为 friends 表查询结果） */
export type InviteCandidate = {
  name: string;
  avatar: string;
  pets: FamPet[];
};

export const INVITE_CANDIDATES: InviteCandidate[] = [
  {
    name: "胖宝宝",
    avatar: pangbabao,
    pets: [{ name: "糖糖", species: "橘猫", age: "3岁", avatar: pangbabao }],
  },
  {
    name: "小宝",
    avatar: xiaobao,
    pets: [{ name: "毛豆", species: "柯基", age: "2岁", avatar: xiaobao }],
  },
  {
    name: "年糕",
    avatar: niangao,
    pets: [{ name: "团子", species: "布偶猫", age: "1岁3个月", avatar: niangao }],
  },
];

export function getMembers(): FamMember[] {
  try {
    const raw = localStorage.getItem(key());
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        // 逐条做结构兜底：历史数据/手工写入可能缺 pets、role、tag 字段，
        // 直接渲染会在成员行读 m.pets.length 时抛 TypeError 导致整页崩到兜底页
        return arr
          .filter((x: FamMember) => x && typeof x.name === "string")
          .map<FamMember>((x, i) => ({
            id: x.id || `fam-legacy-${i}`,
            name: x.name || "家庭成员",
            avatar: typeof x.avatar === "string" ? x.avatar : "",
            role: typeof x.role === "string" ? x.role : "共同照护人",
            tag: typeof x.tag === "string" ? x.tag : "共享",
            pets: Array.isArray(x.pets)
              ? x.pets
                  .filter((p) => p && typeof p.name === "string")
                  .map((p) => ({
                    name: p.name,
                    species: p.species || "宠物",
                    age: p.age || "",
                    avatar: p.avatar || "",
                  }))
              : [],
            addedAt: typeof x.addedAt === "number" ? x.addedAt : 0,
          }));
      }
    }
  } catch {
    /* 数据损坏时回退空列表 */
  }
  return [];
}

function save(list: FamMember[]): void {
  try {
    localStorage.setItem(key(), JSON.stringify(list));
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event(FAMILY_UPDATE_EVENT));
  } catch {
    /* ignore */
  }
}

export function hasMember(name: string): boolean {
  return getMembers().some((m) => m.name === name);
}

export function addMember(member: Omit<FamMember, "addedAt">): FamMember[] {
  const list = getMembers();
  if (list.some((m) => m.name === member.name)) return list;
  const next = [...list, { ...member, addedAt: Date.now() }];
  save(next);
  return next;
}

export function removeMember(id: string): FamMember[] {
  const next = getMembers().filter((m) => m.id !== id);
  save(next);
  return next;
}
