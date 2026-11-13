// 身份认证数据层：商家认证 / 救助站认证 + 商家店铺与商品。
// 认证信息属于个人账号（petpal-roles:<账号>）；
// 店铺与商品是公开资产，放全局池（petpal-shop-products），其它账号可见，
// 与后端「shops / shop_products 表 + 账号外键」一一对应，迁后端时按 owner 排序即可。
import { adoptLegacyKey, currentAccount, scopedKey } from "./accountScoped";

const ROLE_BASE = "petpal-roles";
const PRODUCT_KEY = "petpal-shop-products";

export const ROLE_UPDATE_EVENT = "petpal-role-update";
export const SHOP_UPDATE_EVENT = "petpal-shop-update";

export type VerifyStatus = "none" | "pending" | "approved";

export type MerchantProfile = {
  shopName: string;
  /** 经营类目 */
  category: string;
  contact: string;
  phone: string;
  address: string;
  /** 营业执照 / 统一社会信用代码 */
  licenseNo: string;
  intro: string;
  /** 店铺 Logo（dataURL；接后端换 uploadUrl） */
  logo?: string;
  status: VerifyStatus;
  submittedAt: number;
  verifiedAt?: number;
};

export type RescueProfile = {
  orgName: string;
  /** 个人救助 / 救助基地 / 公益组织 */
  orgType: string;
  contact: string;
  phone: string;
  address: string;
  /** 登记证书编号 / 备案号 */
  licenseNo: string;
  intro: string;
  /** 可容纳动物数量 */
  capacity: string;
  status: VerifyStatus;
  submittedAt: number;
  verifiedAt?: number;
};

export type RoleMap = {
  merchant?: MerchantProfile;
  rescue?: RescueProfile;
};

export type ShopProduct = {
  id: string;
  /** 所属商家账号（外键） */
  owner: string;
  ownerName: string;
  shopName: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  desc: string;
  image?: string;
  status: "on" | "off";
  createdAt: number;
};

export const MERCHANT_CATEGORIES = [
  "宠物食品",
  "宠物用品",
  "宠物医疗",
  "宠物美容",
  "宠物寄养",
  "异宠专营",
];

export const RESCUE_ORG_TYPES = ["个人救助", "救助基地", "公益组织"];

function roleKey(account?: string): string {
  adoptLegacyKey(ROLE_BASE);
  return scopedKey(ROLE_BASE, account);
}

function notify(event: string): void {
  try {
    window.dispatchEvent(new Event(event));
  } catch {
    /* ignore */
  }
}

export function getRoles(account?: string): RoleMap {
  try {
    const raw = localStorage.getItem(roleKey(account));
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? (obj as RoleMap) : {};
  } catch {
    return {};
  }
}

function saveRoles(map: RoleMap, account?: string): void {
  try {
    localStorage.setItem(roleKey(account), JSON.stringify(map));
  } catch {
    /* ignore */
  }
  notify(ROLE_UPDATE_EVENT);
}

export function getMerchant(account?: string): MerchantProfile | null {
  return getRoles(account).merchant ?? null;
}

export function getRescue(account?: string): RescueProfile | null {
  return getRoles(account).rescue ?? null;
}

/** 提交商家认证：资料进「审核中」，演示环境由 approveMerchant 模拟后台通过 */
export function submitMerchant(
  data: Omit<MerchantProfile, "status" | "submittedAt" | "verifiedAt">
): MerchantProfile {
  const profile: MerchantProfile = { ...data, status: "pending", submittedAt: Date.now() };
  saveRoles({ ...getRoles(), merchant: profile });
  return profile;
}

export function approveMerchant(account?: string): MerchantProfile | null {
  const map = getRoles(account);
  if (!map.merchant) return null;
  map.merchant.status = "approved";
  map.merchant.verifiedAt = Date.now();
  saveRoles(map, account);
  return map.merchant;
}

/** 修改已认证店铺资料（名称/类目/简介/联系方式等） */
export function updateMerchant(
  patch: Partial<Omit<MerchantProfile, "status" | "submittedAt" | "verifiedAt">>
): MerchantProfile | null {
  const map = getRoles();
  if (!map.merchant) return null;
  map.merchant = { ...map.merchant, ...patch };
  saveRoles(map);
  return map.merchant;
}

export function submitRescue(
  data: Omit<RescueProfile, "status" | "submittedAt" | "verifiedAt">
): RescueProfile {
  const profile: RescueProfile = { ...data, status: "pending", submittedAt: Date.now() };
  saveRoles({ ...getRoles(), rescue: profile });
  return profile;
}

export function approveRescue(account?: string): RescueProfile | null {
  const map = getRoles(account);
  if (!map.rescue) return null;
  map.rescue.status = "approved";
  map.rescue.verifiedAt = Date.now();
  saveRoles(map, account);
  return map.rescue;
}

// ===== 店铺商品（公开池，跨账号可见） =====
export function getProducts(): ShopProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveProducts(list: ShopProduct[]): void {
  try {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  notify(SHOP_UPDATE_EVENT);
}

/** 我的商品 */
export function getMyProducts(account?: string): ShopProduct[] {
  const owner = account ?? currentAccount();
  return getProducts().filter((p) => p.owner === owner);
}

/** 某个商家在售商品（公开店铺页用） */
export function getShopProducts(account: string): ShopProduct[] {
  return getProducts().filter((p) => p.owner === account && p.status === "on");
}

/**
 * 已认证商家列表（服务页「认证商家」分类用）。
 * 现阶段枚举 localStorage 里的 petpal-roles:<账号>；接后端后换成 shops 列表查询。
 */
export function getVerifiedMerchants(): Array<{
  account: string;
  profile: MerchantProfile;
  productCount: number;
  cover: string;
}> {
  const out: Array<{ account: string; profile: MerchantProfile; productCount: number; cover: string }> = [];
  try {
    const prefix = ROLE_BASE + ":";
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i) || "";
      if (!key.startsWith(prefix)) continue;
      const account = key.slice(prefix.length);
      const raw = localStorage.getItem(key);
      const roles = raw ? (JSON.parse(raw) as RoleMap) : {};
      const m = roles?.merchant;
      if (m && m.status === "approved" && m.shopName) {
        const prods = getShopProducts(account);
        // 封面：优先店铺 Logo，没有就用第一件带图商品
        const cover = m.logo || prods.find((p) => !!p.image)?.image || "";
        out.push({ account, profile: m, productCount: prods.length, cover });
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}

export function addProduct(
  data: Omit<ShopProduct, "id" | "owner" | "ownerName" | "shopName" | "status" | "createdAt">
): ShopProduct | null {
  const me = currentAccount();
  const merchant = getMerchant();
  if (!merchant || merchant.status !== "approved") return null;
  const product: ShopProduct = {
    ...data,
    id: "SKU" + Date.now(),
    owner: me,
    ownerName: getCurrentAccountName(),
    shopName: merchant.shopName,
    status: "on",
    createdAt: Date.now(),
  };
  saveProducts([product, ...getProducts()]);
  return product;
}

function getCurrentAccountName(): string {
  const roles = getRoles();
  const m = roles.merchant;
  return m?.shopName || "商家";
}

export function toggleProduct(id: string): void {
  const list = getProducts();
  const p = list.find((x) => x.id === id);
  if (!p) return;
  p.status = p.status === "on" ? "off" : "on";
  saveProducts(list);
}

export function removeProduct(id: string): void {
  saveProducts(getProducts().filter((x) => x.id !== id));
}
