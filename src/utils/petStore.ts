// 宠物档案数据层：宠物列表 + 当前选中宠物
// 存储按账号隔离（petpal-pets:<账号> / petpal-current-pet:<账号>），
// 同一浏览器切换账号不会再看到上一个账号的宠物；结构贴近后端 pets 表（owner_id），可平滑迁移。
import jiujiu from "@/assets/images/mine/pet-jiujiu.png";
import migao from "@/assets/images/mine/pet-migao.png";
import lulu from "@/assets/images/mine/pet-lulu.png";
import { adoptLegacyKey, currentAccount, scopedKey } from "./accountScoped";

// 首页数据三格：不同宠物展示不同指标
// 鹦鹉：体重 / 笼温 / 光照；犬：体重 / 运动 / 睡眠；兔：体重 / 日进食量 / 睡眠
export type PetMetric = {
  label: string; // 指标名，如 体重 / 笼温 / 光照 / 运动 / 睡眠 / 日进食量
  value: string;
  unit: string;
};

export type Pet = {
  id: string;
  name: string;
  avatar: string; // 宠物照片（原图）
  species: string; // 物种，如 玄凤鹦鹉 / 金毛 / 垂耳兔
  type?: "犬" | "猫" | "异宠"; // 宠物类型（用户保存时记录；用于指标按类型区分）
  gender?: string; // 宠物性别（公 / 母）
  age: string;
  birthday?: string; // 生日（YYYY-MM-DD），生日当天首页「今日提醒」自动出现生日提醒
  status: string; // 状态标题，如 换羽期照护中
  statusSub: string; // 状态副文，如 晨起体重稳定，注意羽管和蛋白质补充
  profile: string; // 档案标签，如 异宠档案正常
  metrics: PetMetric[]; // 首页数据三格
  note: string; // 小习惯、过敏信息等
};

// 全局旧 key（仅用于一次性迁移到账号私有 key）
const PETS_BASE = "petpal-pets";
const CUR_BASE = "petpal-current-pet";

const petsKey = () => scopedKey(PETS_BASE);
const curKey = () => scopedKey(CUR_BASE);

/**
 * 旧数据一次性归属迁移（老版本所有账号共用一份 petpal-pets）。
 * 归属判断：宠物 id 里带有创建时间戳（pet-<时间戳>），取「注册时间不晚于该时间戳的最近一个账号」，
 * 这样 1216 / 1217 这类先后注册、各自导入的宠物能按注册区间自动分回各自的账号。
 * 无法判断归属（id 无时间戳）时归给当前登录账号。迁移完成后删除旧全局 key，避免重复分发。
 */
function migrateLegacyPets(): void {
  try {
    const legacyRaw = localStorage.getItem(PETS_BASE);
    if (legacyRaw === null) return;
    localStorage.removeItem(PETS_BASE);
    let list: Pet[] = [];
    try {
      const parsed = JSON.parse(legacyRaw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      return;
    }
    if (!list.length) return;

    let users: { account: string; createdAt: number }[] = [];
    try {
      const rawU = localStorage.getItem("petpal-users");
      const arr = rawU ? JSON.parse(rawU) : [];
      users = (Array.isArray(arr) ? arr : [])
        .filter((u: any) => u && u.account && typeof u.createdAt === "number")
        .sort((a: any, b: any) => a.createdAt - b.createdAt);
    } catch {
      users = [];
    }

    const current = currentAccount();
    const ownerOf = (pet: Pet): string => {
      const ts = Number(String(pet?.id ?? "").replace(/^pet-/, ""));
      if (!ts || !users.length) return current;
      let owner = users[0].account;
      users.forEach((u) => {
        if (ts >= u.createdAt) owner = u.account;
      });
      return owner || current;
    };

    const groups = new Map<string, Pet[]>();
    list.forEach((p) => {
      if (!p || typeof p.id !== "string") return;
      const owner = ownerOf(p);
      const bucket = groups.get(owner) || [];
      bucket.push(p);
      groups.set(owner, bucket);
    });

    groups.forEach((pets, account) => {
      const k = scopedKey(PETS_BASE, account);
      let exist: Pet[] = [];
      try {
        const raw = localStorage.getItem(k);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) exist = parsed;
      } catch {
        exist = [];
      }
      const merged = exist.slice();
      pets.forEach((p) => {
        if (!merged.some((x) => x.id === p.id)) merged.push(p);
      });
      localStorage.setItem(k, JSON.stringify(merged));
    });
  } catch {
    /* ignore */
  }
}

// 内置演示宠物（petpal-pets 从未写入时兜底展示）
const DEFAULTS: Pet[] = [
  {
    id: "pet-jiujiu",
    name: "啾啾",
    avatar: jiujiu,
    species: "玄凤鹦鹉",
    age: "2岁",
    status: "换羽期照护中",
    statusSub: "晨起体重稳定，注意羽管和蛋白质补充",
    profile: "异宠档案正常",
    metrics: [
      { label: "体重", value: "91", unit: "g" },
      { label: "笼温", value: "25.6", unit: "℃" },
      { label: "光照", value: "10.5", unit: "h" },
    ],
    note: "喜欢咬东西，注意玩具轮换",
  },
  {
    id: "pet-migao",
    name: "米糕",
    avatar: migao,
    species: "金毛",
    age: "1岁",
    status: "今日状态良好",
    statusSub: "食欲旺盛，建议傍晚散步 30 分钟",
    profile: "犬类档案正常",
    metrics: [
      { label: "体重", value: "26.4", unit: "kg" },
      { label: "运动", value: "4,820", unit: "步" },
      { label: "睡眠", value: "8.2", unit: "h" },
    ],
    note: "对花生过敏，投喂需留意",
  },
  {
    id: "pet-lulu",
    name: "露露",
    avatar: lulu,
    species: "垂耳兔",
    age: "3岁",
    status: "肠胃需留意",
    statusSub: "今日投喂减量，观察便便形态",
    profile: "兔类档案正常",
    metrics: [
      { label: "体重", value: "1.8", unit: "kg" },
      { label: "日进食量", value: "75", unit: "g" },
      { label: "睡眠", value: "10", unit: "h" },
    ],
    note: "磨牙期，需备足干草",
  },
];

export type PetType = "犬" | "猫" | "异宠";

// 宠物类型：优先读用户保存的 type；老数据（无 type）按物种关键词推断
export function getPetType(pet?: Pet | null): PetType {
  if (pet?.type === "犬" || pet?.type === "猫") return pet.type;
  if (pet?.type === "异宠") return "异宠";
  const s = pet?.species || "";
  if (/犬|狗|猎狼|柯基|金毛|萨摩|哈士奇|泰迪|边牧|德牧|拉布拉多|比熊/.test(s)) return "犬";
  if (/猫/.test(s)) return "猫";
  return "异宠";
}

// 年龄展示值：有生日就按生日实时计算（跨年后依然准确），否则回落手填的 age
export function petAge(pet?: Pet | null): string {
  if (!pet) return "";
  const b = pet.birthday;
  if (b) {
    const parts = b.split("-").map(Number);
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];
    if (y && m && d) {
      const now = new Date();
      let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
      if (now.getDate() < d) months -= 1;
      if (months >= 0) {
        const yy = Math.floor(months / 12);
        const mm = months % 12;
        if (yy === 0) return mm === 0 ? "刚出生" : `${mm}个月`;
        return mm === 0 ? `${yy}岁` : `${yy}岁${mm}个月`;
      }
    }
  }
  return pet.age || "";
}

export function getPets(): Pet[] {
  migrateLegacyPets();
  try {
    const raw = localStorage.getItem(petsKey());
    if (raw !== null) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr; // 空数组=该账号还没有宠物，走空态引导
    }
  } catch {
    /* ignore */
  }
  // 已登录账号没有宠物数据时不再回落到演示宠物，避免新账号看到别人的/示例的宠物
  if (currentAccount() !== "guest") return [];
  return DEFAULTS;
}

export function savePet(p: Pet): Pet[] {
  const list = getPets();
  const i = list.findIndex((x) => x.id === p.id);
  if (i >= 0) list[i] = p;
  else list.push(p);
  try {
    localStorage.setItem(petsKey(), JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return list;
}

// 映射到提醒存储所用的宠物后缀（reminderStore key 结构：<base>-<pet>）
// 种子宠物 id 为 pet-jiujiu / pet-migao / pet-lulu；用户新建宠物沿用其 id 后缀，
// 无对应提醒数据时自然落到空 key，不会读到其它宠物的提醒。
export function reminderPetKey(pet: Pet | undefined): string {
  if (!pet) return "jijiu";
  const suffix = pet.id.replace(/^pet-/, "");
  return suffix || "jijiu";
}

// 级联清理：删除宠物时一并清除其按后缀隔离的提醒数据；
// 健康/状态记录当前为全局结构（healthStore/statusStore，后续迁移 petId 字段），
// 这里仅过滤已带 petId 归属当前宠物的条目，避免误删其它宠物共享的遗留记录。
function cascadeCleanup(id: string, pet: Pet | undefined): void {
  const suffix = reminderPetKey(pet);
  const reminderBases = [
    "petpal-reminders",
    "petpal-custom-reminders",
    "petpal-reminder-overrides",
  ];
  try {
    reminderBases.forEach((base) => localStorage.removeItem(`${base}-${suffix}`));

    // 健康记录：清理已带 petId 归属当前宠物的条目（未来可平滑迁移到后端表）
    const healthRaw = localStorage.getItem("petpal-health-records");
    if (healthRaw) {
      const records = JSON.parse(healthRaw);
      if (Array.isArray(records)) {
        const kept = records.filter((r: any) => r && r.petId !== id);
        localStorage.setItem("petpal-health-records", JSON.stringify(kept));
      }
    }

    // 清除当前选中态
    if (localStorage.getItem(curKey()) === id) {
      localStorage.removeItem(curKey());
    }
  } catch {
    /* ignore */
  }
}

export function removePet(id: string): Pet[] {
  const target = getPets().find((x) => x.id === id);
  cascadeCleanup(id, target);
  const list = getPets().filter((x) => x.id !== id);
  try {
    localStorage.setItem(petsKey(), JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return list;
}

export function getCurrentPet(): Pet | undefined {
  adoptLegacyKey(CUR_BASE);
  const list = getPets();
  if (!list.length) return undefined;
  try {
    const cur = localStorage.getItem(curKey());
    if (cur) {
      const f = list.find((x) => x.id === cur);
      if (f) return f;
    }
  } catch {
    /* ignore */
  }
  return list[0];
}

export function setCurrentPet(id: string): void {
  try {
    localStorage.setItem(curKey(), id);
  } catch {
    /* ignore */
  }
}

// 首页宠物卡监听该事件刷新
export const PET_SWITCH_EVENT = "pet-switch";
