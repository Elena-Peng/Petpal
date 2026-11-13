// 服务页数据：附近优选 / 友宠场所 / 领养动物 / 商品 / 救助基地 / 分类入口
// 独立数据层，便于 ServiceShell、分类页、我的收藏页共享；后续可迁移到后端接口。

import svStetho from "@/assets/images/service/sv-stetho.png";
import svHouseGreen from "@/assets/images/service/sv-house-green.png";
import svHouseBlue from "@/assets/images/service/sv-house-blue.png";
import svBath from "@/assets/images/service/sv-bath.png";
import svTemp from "@/assets/images/service/sv-temp.png";
import svBird from "@/assets/images/service/sv-bird.png";
import svBone from "@/assets/images/service/sv-bone.png";
import svCorgi from "@/assets/images/service/sv-corgi.jpg";
import svShiba from "@/assets/images/service/sv-shiba.jpg";
import svHamster from "@/assets/images/service/sv-hamster.jpg";
import svCemetery from "@/assets/images/service/sv-cemetery.jpg";
import svMemorial from "@/assets/images/service/sv-memorial.jpg";
import svOwner from "@/assets/images/service/sv-owner.jpg";
import svKitten from "@/assets/images/service/sv-kitten.jpg";
import svCafe from "@/assets/images/service/sv-cafe.jpg";
import svFeeder from "@/assets/images/service/sv-feeder.jpg";
import svTerrarium from "@/assets/images/service/sv-terrarium.jpg";
import svReptileBox from "@/assets/images/service/sv-reptile-box.jpg";
import svCans from "@/assets/images/service/sv-cans.jpg";
import svParrot from "@/assets/images/service/sv-parrot.jpg";
import svCatbed from "@/assets/images/service/sv-catbed.jpg";
import svWoodHouse from "@/assets/images/service/sv-wood-house.jpg";
import svKibble from "@/assets/images/service/sv-kibble.jpg";
import svVip from "@/assets/images/service/sv-vip.png";
import svAdoptShiba from "@/assets/images/service/sv-adopt-shiba.jpg";
import svAdoptBluecat from "@/assets/images/service/sv-adopt-bluecat.jpg";
import svAdoptHamster from "@/assets/images/service/sv-adopt-hamster.jpg";
import svMale from "@/assets/images/service/sv-male.png";
import svFemale from "@/assets/images/service/sv-female.png";
import svHeart from "@/assets/images/service/sv-heart.png";
import svPin from "@/assets/images/service/sv-pin.png";
import svRescuePark from "@/assets/images/service/sv-rescue-park.jpg";
import svRescueBase from "@/assets/images/service/sv-rescue-base.jpg";
import svRescueThanks from "@/assets/images/service/sv-rescue-thanks.jpg";
import svClock from "@/assets/images/service/sv-clock.png";
import svHelpQuestion from "@/assets/images/service/sv-help-question.png";
import svShield from "@/assets/images/service/sv-shield.png";
import svBirdLine from "@/assets/images/service/sv-bird.png";
import svCamera from "@/assets/images/service/sv-camera.png";

// 二级 Tab：服务 / 商城 / 领养公益
export const SUB_TABS = ["服务", "商城", "领养公益"];

// 异宠专科 2×2 大卡
export const EXOTIC_GRID = [
  { icon: svStetho, name: "异宠专科中心", desc: "鸟类·爬宠·小宠", cat: "异宠专科" },
  { icon: svTemp, name: "环境调试", desc: "温湿度·光照·水质", cat: "异宠专科" },
  { icon: svBird, name: "鸟类护理", desc: "剪羽·指甲·喙部", cat: "异宠专科" },
  { icon: svHouseGreen, name: "异宠寄养", desc: "独立环境·视频巡查", cat: "寄养" },
];

// 通用服务一行四宫格
export const QUICK_GRID = [
  { icon: svStetho, name: "医疗问诊", desc: "在线问诊·线下医院", tint: "green", cat: "医院" },
  { icon: svBath, name: "洗护美容", desc: "洗澡·修剪·护理", tint: "pink", cat: "洗护" },
  { icon: svHouseBlue, name: "寄养托管", desc: "日托·短期寄养", tint: "blue", cat: "寄养" },
  { icon: svBone, name: "上门照护", desc: "喂养·遛狗·陪护", tint: "orange", cat: "上门" },
];

// 分类胶囊
export const FILTERS = ["全部", "洗护", "医院", "寄养", "上门", "异宠专科"];

export type SvcCard = {
  img: string;
  name: string;
  tags: string[];
  skill?: string;
  desc: string;
  meta?: string;
  person?: boolean;
  stat?: string;
  price?: string;
  cats?: string[];
  /** 服务项目与价格（详情页展示，可预约） */
  projects?: { title: string; price: string }[];
};

// 附近优选：服务者 / 医院 / 诊所 / 善终机构
export const NEARBY: SvcCard[] = [
  {
    img: svOwner,
    name: "汉斯",
    tags: ["上门喂养", "猫咪铲屎"],
    person: true,
    price: "¥35",
    desc: "猫咪铲屎...",
    stat: "养宠年限：5年　服务记录：121次　服务评价：★★★★★",
    cats: ["上门"],
    projects: [
      { title: "上门喂养（单次）", price: "¥35" },
      { title: "遛狗 1小时 1-5KM", price: "¥30" },
    ],
  },
  {
    img: svKitten,
    name: "安心宠物医院",
    tags: ["犬猫专科", "24 小时急诊"],
    skill: "最擅长：犬猫内科、骨科手术、疫...",
    desc: "专注犬猫全科诊疗，设备齐全，医师经验丰富，提供住院护理服务",
    meta: "距离 3.2km | 评分 4.7 | 可接诊",
    cats: ["医院"],
    projects: [
      { title: "犬猫基础体检", price: "¥99" },
      { title: "疫苗接种（单针）", price: "¥120" },
      { title: "内科门诊", price: "¥80" },
    ],
  },
  {
    img: svHamster,
    name: "安馨宠物医疗中心",
    tags: ["免费体检", "异宠可接诊"],
    skill: "最擅长：仓鼠、龙猫、小型异宠护理",
    desc: "主打小型异宠日常护理与体检，医师经验丰富，看诊温和无应激。",
    meta: "距离 2.9km | 评分 4.8 | 支持医保",
    cats: ["医院", "异宠专科"],
    projects: [
      { title: "异宠基础体检", price: "¥80" },
      { title: "小型异宠日常护理", price: "¥60" },
    ],
  },
  {
    img: svCorgi,
    name: "萌愈异宠专科诊所",
    tags: ["24小时急诊", "异宠可接诊"],
    skill: "最擅长：爬宠、龟类、蜥蜴诊疗",
    desc: "专注爬宠专科诊疗，配备异宠专用检查设备，急症接诊响应迅速。",
    meta: "距离 1.2km | 评分 4.9 | 可预约",
    cats: ["异宠专科"],
    projects: [
      { title: "爬宠专科门诊", price: "¥90" },
      { title: "异宠急症接诊", price: "¥150" },
    ],
  },
  {
    img: svCorgi,
    name: "丽丽",
    tags: ["异宠照料", "狗狗遛弯"],
    person: true,
    desc: "狗狗遛弯...",
    stat: "养宠年限：3年　服务记录：71次　服务评价：★★★★★",
    cats: ["上门"],
    projects: [
      { title: "猫狗上门喂养 1-2KM", price: "¥25" },
      { title: "遛狗 1小时 1-5KM", price: "¥30" },
    ],
  },
  {
    img: svCemetery,
    name: "星途宠物善终服务中心",
    tags: ["专业合规", "全程私密"],
    skill: "服务亮点：善终安置｜骨灰处...",
    desc: "提供专业宠物善后与无害化处理，用尊重与温柔陪伴最后一程。",
    meta: "距离 5.0km | 评分 4.8 | 可接待",
    projects: [
      { title: "善终安置", price: "¥500起" },
      { title: "骨灰纪念处理", price: "¥300起" },
    ],
  },
  {
    img: svMemorial,
    name: "暖忆宠物纪念工作室",
    tags: ["温馨纪念", "隐私守护"],
    skill: "服务亮点：爪印相框｜毛发饰...",
    desc: "专注宠物温柔善终与纪念定制，用仪式感留住每一份温暖陪伴。",
    meta: "距离 1.2km | 评分 4.9 | 可预约",
    projects: [
      { title: "爪印相框纪念", price: "¥199" },
      { title: "毛发饰品定制", price: "¥120" },
    ],
  },
  {
    img: svHouseGreen,
    name: "乐乐宠物店",
    tags: ["宠物寄养", "运输分离"],
    desc: "提供宠物寄养与运输分离服务，独立隔间、每日消毒，寄养期间有专人陪护。",
    meta: "距离 0.8km | 评分 4.8 | 可预约",
    cats: ["寄养"],
    projects: [
      { title: "宠物寄养 运输分离", price: "¥129" },
    ],
  },
  {
    img: svCans,
    name: "迪迪乐旗舰店",
    tags: ["宠物食品", "日用玩具"],
    desc: "宠物食品、日用品与玩具一站选购，支持预约到店自提。",
    meta: "距离 2.1km | 评分 4.6 | 可预约",
    cats: ["商城"],
    projects: [
      { title: "宠物食品日用玩具", price: "¥58" },
    ],
  },
];

// 友宠场所推荐：公园 / 咖啡等线下场所
export const PLACES: SvcCard[] = [
  {
    img: svShiba,
    name: "大泽湖近自然湿地公园...",
    tags: ["户外草坪", "宠物乐园"],
    skill: "地点：望城区大泽湖湿地",
    desc: "专业萌宠活动区，设有跑道与游乐设施，适合狗狗社交奔跑，氛围轻松。",
    meta: "距离 1.2km | 评分 4.7 | 导航",
  },
  {
    img: svCafe,
    name: "Cojoy 共悦空间",
    tags: ["友宠咖啡店", "宠物社交"],
    skill: "地点：开福区文昌阁附近",
    desc: "温馨宠物友好咖啡馆，提供宠物饮品与座位，适合带宠下午茶、拍照打卡。",
    meta: "距离 4km | 评分 4.5 | 导航",
  },
  {
    img: svShiba,
    name: "南大公园",
    tags: ["宠物外出地点", "开放草坪"],
    skill: "地点：上海市宝山区南大路",
    desc: "城市宠物友好公园，全天开放，草坪宽阔，适合遛狗与宠物社交，周边配套齐全。",
    meta: "距离 3.5km | 评分 4.7 | 导航",
  },
];

// 商城商品
export const MALL_ITEMS = [
  { img: svFeeder, title: "狗碗狗盆猫碗猫食盆狗狗防打翻双碗猫", sales: "全网销售1万+", price: "¥11.50" },
  { img: svTerrarium, title: "爬虫箱全透生态箱饲养箱雨林箱鱼缸", sales: "20+人好评", price: "¥24.90" },
  { img: svReptileBox, title: "爬虫饲养盒乌龟箱带晒台躲避蜘蛛蝎子", sales: "成交量20万+", price: "¥1.50" },
  { img: svCans, title: "LUSI跨境英文猫零食猫罐头成幼猫补", sales: "成交700件+", price: "¥8.70" },
  { img: svParrot, title: "鹦鹉玩具松塔玉米皮鸟啃玩具鹦鹉解闷", sales: "回头率50%", price: "¥2.50" },
  { img: svCatbed, title: "猫窝狗窝长毛绒猫耳大四季宠物窝", sales: "商品复购率37%", price: "¥30.00" },
  { img: svKibble, title: "纯皓小型犬幼犬粮三文鱼鸡肉配方", sales: "全网热销", price: "¥89.00" },
  { img: svWoodHouse, title: "WEEWALLY 实木猫狗别墅窝带双碗架", sales: "精品推荐", price: "¥199.00" },
];

// 领养公益
export const ADOPT_TABS = ["领养动物", "救助基地", "我要救助"];
export const ADOPT_FILTERS = ["全部", "猫", "犬", "异宠"];

export type AdoptPet = {
  img: string;
  name: string;
  price: string;
  gender: "m" | "f";
  breed: string;
  age: string;
  desc: string;
  tags: { label: string; tone: "green" | "pink" | "yellow" }[];
  location: string;
  kind: "猫" | "犬" | "异宠";
  owner?: { name: string; phone: string }; // 主人信息（演示；上线后走后端）
};

export const ADOPT_LIST: AdoptPet[] = [
  {
    img: svAdoptShiba,
    name: "小七",
    price: "¥ 0",
    gender: "m",
    breed: "柴犬",
    age: "1岁",
    desc: "非常可爱的狗狗",
    tags: [
      { label: "已打疫苗", tone: "green" },
      { label: "已绝育", tone: "pink" },
      { label: "已驱虫", tone: "yellow" },
    ],
    location: "湖南省长沙市岳麓区",
    kind: "犬",
    owner: { name: "陈航", phone: "13876543210" },
  },
  {
    img: svAdoptBluecat,
    name: "坨坨",
    price: "¥ 100",
    gender: "f",
    breed: "蓝猫",
    age: "5个月",
    desc: "自己家猫猫的宝宝",
    tags: [
      { label: "已打疫苗", tone: "green" },
      { label: "未绝育", tone: "pink" },
      { label: "已驱虫", tone: "yellow" },
    ],
    location: "湖南省长沙市雨花区",
    kind: "猫",
    owner: { name: "吴倩倩", phone: "15632598563" },
  },
  {
    img: svAdoptHamster,
    name: "小米",
    price: "¥ 0",
    gender: "f",
    breed: "仓鼠",
    age: "3个月",
    desc: "亲人好上手，异宠新手友好",
    tags: [
      { label: "已打疫苗", tone: "green" },
      { label: "未绝育", tone: "pink" },
      { label: "已驱虫", tone: "yellow" },
    ],
    location: "湖南省长沙市天心区",
    kind: "异宠",
    owner: { name: "林小满", phone: "13900001111" },
  },
];

// 救助基地
export type RescueBase = {
  img: string;
  city: string;
  scope: string;
  name: string;
  desc: string;
  open: string;
  location: string;
  species: string;
  services: string;
};

export const RESCUE_BASES: RescueBase[] = [
  {
    img: svRescuePark,
    city: "长沙",
    scope: "猫犬及伴侣动物",
    name: "长沙领养日公益领养平台",
    desc: "以线下领养活动为核心的公益资源入口，适合先认识动物、了解领养审核，再进入家庭匹配。",
    open: "活动期开放",
    location: "线下活动地点以当期公告为准",
    species: "猫、犬及其他伴侣动物",
    services: "领养活动、救助信息推广、公益义卖",
  },
  {
    img: svRescueBase,
    city: "长沙",
    scope: "犬只救助",
    name: "湘江流浪动物救助站",
    desc: "民间志愿者团队长期救助流浪犬只，提供医疗、绝育与寄养等待领养的稳定基地。",
    open: "周末开放探访",
    location: "岳麓区含浦街道（提前预约）",
    species: "犬为主",
    services: "救助安置、领养对接、志愿者招募",
  },
  {
    img: svRescueThanks,
    city: "长沙",
    scope: "猫只救助",
    name: "橘洲猫咪救助小屋",
    desc: "专注流浪猫咪 TNR 与领养，所有待领养猫只均已完成疫苗驱虫，可视频看猫。",
    open: "预约制开放",
    location: "天心区湘江畔小屋（私信预约）",
    species: "猫",
    services: "TNR 救助、领养对接、猫咪护理咨询",
  },
];

export const ADOPT_GENDER = { male: svMale, female: svFemale };
export const ADOPT_HEART = svHeart;
export const PIN = svPin;
export const CLOCK = svClock;
export const HELP_Q = svHelpQuestion;
export const SHIELD = svShield;
export const BIRD_LINE = svBirdLine;
export const CAMERA = svCamera;
export const VIP_ICON = svVip;

// ===== 我的收藏与关注：分类元数据（服务页桌面 + 我的页总览共用） =====
// cat → 映射到 NEARBY.cats 中的过滤标签，用于计算该分类下的收藏数。
export type FavCategory = {
  name: string;       // 分类名（与 EXOTIC_GRID/QUICK_GRID.name 对齐）
  icon: string;       // 图标
  desc: string;       // 副标题
  bucket: string;    // 计入哪个收藏桶（与 NEARBY.cats 对应）
  group: "异宠专科" | "通用服务";
};

export const FAV_CATEGORIES: FavCategory[] = [
  { name: "异宠专科中心", icon: svStetho,  desc: "鸟类·爬宠·小宠",     bucket: "异宠专科", group: "异宠专科" },
  { name: "环境调试",     icon: svTemp,    desc: "温湿度·光照·水质",   bucket: "异宠专科", group: "异宠专科" },
  { name: "鸟类护理",     icon: svBird,    desc: "剪羽·指甲·喙部",     bucket: "异宠专科", group: "异宠专科" },
  { name: "异宠寄养",     icon: svHouseGreen, desc: "独立环境·视频巡查", bucket: "寄养",     group: "异宠专科" },
  { name: "医疗问诊",     icon: svStetho,  desc: "在线问诊·线下医院",   bucket: "医院",     group: "通用服务" },
  { name: "洗护美容",     icon: svBath,    desc: "洗澡·修剪·护理",     bucket: "洗护",     group: "通用服务" },
  { name: "寄养托管",     icon: svHouseBlue, desc: "日托·短期寄养",    bucket: "寄养",     group: "通用服务" },
  { name: "上门照护",     icon: svBone,    desc: "喂养·遛狗·陪护",     bucket: "上门",     group: "通用服务" },
];

// 便捷查询：分类名 → bucket
export const CAT_TO_BUCKET: Record<string, string> = Object.fromEntries(
  FAV_CATEGORIES.map((c) => [c.name, c.bucket])
);

// 计算某个 bucket 下收藏的数量（NEARBY + PLACES；领养动物不计入服务分类，只在"我的收藏"总览出现）
export function countFavInBucket(bucket: string, favs: Record<string, boolean>): number {
  let n = 0;
  for (const c of NEARBY) {
    if ((c.cats ?? []).includes(bucket) && favs[c.name]) n++;
  }
  return n;
}
