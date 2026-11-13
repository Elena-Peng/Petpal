// 购物车数据层：localStorage 持久化，结构对齐后端 CartItem 表。
// 字段：id(商品名)、title、price(单位 元)、img、qty。按账号隔离（petpal-mall-cart:<账号>）。
import { adoptLegacyKey, scopedKey } from "./accountScoped";

const KEY_BASE = "petpal-mall-cart";
const key = () => {
  adoptLegacyKey(KEY_BASE);
  return scopedKey(KEY_BASE);
};

export type CartItem = {
  id: string;      // 商品唯一 id（用 title 做 id）
  title: string;
  price: number;  // 元
  img: string;
  qty: number;
};

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(key());
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  try {
    localStorage.setItem(key(), JSON.stringify(items));
  } catch {
    /* ignore */
  }
  // 同页签内广播购物车变更（storage 事件只在跨页签触发）；订阅方据此刷新角标。
  try {
    window.dispatchEvent(new CustomEvent("petpal:cart-change"));
  } catch {
    /* ignore */
  }
}

/** 加购一件；如果已存在则 qty+1 */
export function addToCart(item: Omit<CartItem, "qty">): CartItem[] {
  const items = getCart();
  const exist = items.find((x) => x.id === item.id);
  if (exist) exist.qty += 1;
  else items.push({ ...item, qty: 1 });
  save(items);
  return items;
}

/** 设置某商品数量（<=0 时移除） */
export function setQty(id: string, qty: number): CartItem[] {
  let items = getCart();
  if (qty <= 0) items = items.filter((x) => x.id !== id);
  else {
    const it = items.find((x) => x.id === id);
    if (it) it.qty = qty;
  }
  save(items);
  return items;
}

export function removeItem(id: string): CartItem[] {
  return setQty(id, 0);
}

export function clearCart(): void {
  save([]);
}

/** 总件数（角标用） */
export function cartCount(): number {
  return getCart().reduce((s, x) => s + x.qty, 0);
}

/** 合计金额（元） */
export function cartTotal(): number {
  return getCart().reduce((s, x) => s + x.qty * x.price, 0);
}
