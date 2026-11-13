// 救助数据层：localStorage 持久化，结构对齐后端 RescueRequest 表。
// 同时承载两类可迁移记录：
//   1) RescueRequest  救助请求（我要救助发布的待处理线索）
//   2) AdoptionRequest 领养申请（从领养动物详情页发起）
// 所有字段保持 JSON 可序列化，后续可直接迁移到后端表结构。
const KEY = "petpal-rescue-requests";

export type RescueRequest = {
  id: string;
  kind?: "rescue";     // 兼容旧数据：缺省视为救助请求
  species: string;      // 物种（猫/犬/异宠/其他）
  location: string;     // 发现地点
  desc: string;         // 现场情况描述
  photo?: string;       // 照片（演示为空）
  contact: string;      // 联系方式
  status: "待处理" | "处理中" | "已完成";
  createdAt: number;
};

// 领养申请：关联被领养动物与主人信息，便于后续后端建 AdoptionApplication 表。
export type AdoptionRequest = {
  id: string;
  kind: "adoption";
  petName: string;      // 申请领养的动物名（对应 ADOPT_LIST.name）
  breed: string;
  age: string;
  location: string;
  ownerName: string;
  ownerPhone: string;
  contact: string;      // 申请人联系方式（演示：取动物主人留资或占位，上线后走申请人填写）
  status: "待审核" | "已通过" | "已驳回";
  createdAt: number;
};

export function getRescueRequests(): RescueRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => x && x.kind !== "adoption") : [];
  } catch {
    return [];
  }
}

/** 我的领养申请列表（独立桶，便于后续后端迁移） */
export function getAdoptionRequests(): AdoptionRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => x && x.kind === "adoption") : [];
  } catch {
    return [];
  }
}

function save(reqs: Array<RescueRequest | AdoptionRequest>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(reqs));
  } catch { /* ignore */ }
}

/** 发布一条救助请求，返回新请求 */
export function publishRescueRequest(
  data: Omit<RescueRequest, "id" | "status" | "createdAt" | "kind">
): RescueRequest {
  const req: RescueRequest = {
    ...data,
    kind: "rescue",
    id: "RESC" + Date.now(),
    status: "待处理",
    createdAt: Date.now(),
  };
  const list = [...getRescueRequests(), ...getAdoptionRequests()];
  list.unshift(req);
  save(list);
  return req;
}

/** 提交一条领养申请，返回新申请；结构可迁移到后端 AdoptionApplication 表 */
export function submitAdoptionRequest(
  data: Omit<AdoptionRequest, "id" | "kind" | "status" | "createdAt">
): AdoptionRequest {
  const req: AdoptionRequest = {
    ...data,
    kind: "adoption",
    id: "ADOPT" + Date.now(),
    status: "待审核",
    createdAt: Date.now(),
  };
  const list = [...getRescueRequests(), ...getAdoptionRequests()];
  list.unshift(req);
  save(list);
  return req;
}
