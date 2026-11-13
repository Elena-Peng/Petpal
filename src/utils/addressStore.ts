// 地址管理数据层：localStorage 持久化（key=petpal-addresses:<账号>）
// 结构可与后端 addresses 表平滑迁移：扁平 JSON，default 标记为布尔。
import { adoptLegacyKey, scopedKey } from "./accountScoped";

export type Address = {
  id: string;
  tag: string; // 家/公司/父母家/其他
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string; // 街道/楼牌/门牌等详细地址
  isDefault: boolean;
};

// 订单快照使用的扁平地址结构（可直接映射后端 address 字段）
export type AddressSnapshot = {
  name: string;
  phone: string;
  region: string; // 省市区拼接
  detail: string;
};

const KEY_BASE = "petpal-addresses";
const key = () => {
  adoptLegacyKey(KEY_BASE);
  return scopedKey(KEY_BASE);
};

function persist(list: Address[]) {
  try {
    localStorage.setItem(key(), JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/** 读取全部地址；未写入过 / 用户已清空时返回空数组（不再回退内置演示地址） */
export function getAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(key());
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function getAddressById(id: string): Address | undefined {
  return getAddresses().find((a) => a.id === id);
}

/** 默认收货地址：优先 isDefault 标记，无标记时取第一条 */
export function getDefaultAddress(): Address | undefined {
  const list = getAddresses();
  return list.find((a) => a.isDefault) ?? list[0];
}

/** 组装订单快照（扁平 JSON，不含 Date 实例，便于迁移到 API/数据库） */
export function toSnapshot(a: Address): AddressSnapshot {
  return {
    name: a.name.trim(),
    phone: a.phone.trim(),
    region: `${a.province.trim()}${a.city.trim()}${a.district.trim()}`,
    detail: a.detail.trim(),
  };
}

/**
 * 保存地址（新增/编辑）。
 * 默认地址互斥：本条勾选默认时，自动清除其它地址的默认标记。
 */
export function saveAddress(a: Address): Address[] {
  let list = getAddresses();
  const i = list.findIndex((x) => x.id === a.id);
  if (a.isDefault) {
    list = list.map((x) => ({ ...x, isDefault: x.id === a.id }));
  }
  if (i >= 0) list[i] = a;
  else list.unshift(a);
  persist(list);
  return list;
}

export function removeAddress(id: string): Address[] {
  const list = getAddresses().filter((x) => x.id !== id);
  persist(list);
  return list;
}
