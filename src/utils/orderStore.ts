// 订单数据层：localStorage 持久化，结构对齐后端 Order 表。
// 订单按账号隔离（petpal-orders:<账号>）
import type { AddressSnapshot } from "@/utils/addressStore";
import { adoptLegacyKey, scopedKey } from "./accountScoped";

const KEY_BASE = "petpal-orders";
const key = () => {
  adoptLegacyKey(KEY_BASE);
  return scopedKey(KEY_BASE);
};

export type OrderItem = {
  title: string;
  price: number;
  img: string;
  qty: number;
};

export type Order = {
  id: string;
  shop: string;        // 店铺名（演示用固定 "PetPal 商城"）
  status: "待支付" | "待发货" | "待收货" | "交易完成" | "售后";
  items: OrderItem[];
  total: number;       // 元
  createdAt: number;  // 时间戳（数字，非 Date 实例，JSON 可迁移）
  address: AddressSnapshot | null; // 下单时收货地址快照
};

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(key());
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    // 兼容旧订单：补齐缺失的 address 字段
    return arr.map((o) => ({ address: null, ...o }));
  } catch {
    return [];
  }
}

function save(orders: Order[]) {
  try {
    localStorage.setItem(key(), JSON.stringify(orders));
  } catch { /* ignore */ }
}

/** 从购物车选中商品生成一个新订单（状态=待发货），并写入收货地址快照 */
export function createOrderFromCart(
  items: OrderItem[],
  address: AddressSnapshot | null
): Order | null {
  if (!items.length) return null;
  const total = items.reduce((s, x) => s + x.qty * x.price, 0);
  const order: Order = {
    id: "ORD" + Date.now(),
    shop: "PetPal 商城",
    status: "待发货",
    items,
    total,
    createdAt: Date.now(),
    address,
  };
  const orders = getOrders();
  orders.unshift(order);
  save(orders);
  return order;
}

/** 服务预约生成一笔订单（状态=待发货/待服务处理），在订单页可见 */
export function addServiceOrder(
  shop: string,
  item: { title: string; price: string; img: string }
): Order {
  const n = parseFloat((item.price || "").replace(/[¥起元]/g, "")) || 0;
  const order: Order = {
    id: "SVC" + Date.now(),
    shop,
    status: "待发货",
    items: [{ title: item.title, price: n, img: item.img, qty: 1 }],
    total: n,
    createdAt: Date.now(),
    address: null,
  };
  const orders = getOrders();
  orders.unshift(order);
  save(orders);
  return order;
}

/** 更新订单状态（订单流转：去支付/确认收货/申请售后等） */
export function updateOrderStatus(
  id: string,
  status: Order["status"]
): void {
  const orders = getOrders();
  const target = orders.find((o) => o.id === id);
  if (!target) return;
  target.status = status;
  save(orders);
}

/** 删除订单（取消订单等） */
export function removeOrder(id: string): void {
  save(getOrders().filter((o) => o.id !== id));
}
