// 社区共享数据源：帖子流 + 作者信息
// 供 CommunityShell（频道流）与 UserProfileShell（作者个人页）共用，
// 保持关注联动与作者页数据一致；后续可迁移到后端接口。

import post2 from "@/assets/images/community/pangbabao1.jpg";
import pangbabao2 from "@/assets/images/community/pangbabao2.jpg";
import pangbabao3 from "@/assets/images/community/pangbabao3.jpg";
import post3 from "@/assets/images/community/post3-swim.png";
import post4 from "@/assets/images/community/post4-man.png";
import a2TwoDogs from "@/assets/images/community/a2-two-dogs.png";
import a3BlackFront from "@/assets/images/community/a3-black-front.png";
import a4Pompom from "@/assets/images/community/a4-pompom.png";
import a6PupGrass from "@/assets/images/community/a6-pup-grass.png";
import a7Tired from "@/assets/images/community/a7-tired.png";
import a8Indoor from "@/assets/images/community/a8-indoor.png";
import cityCatFront from "@/assets/images/community/city-cat-front.png";
import cityCatSide from "@/assets/images/community/city-cat-side.png";
import cityCatBread from "@/assets/images/community/city-cat-bread.png";
import cityBirdHand from "@/assets/images/community/city-bird-hand.png";
import cityBirdLie from "@/assets/images/community/city-bird-lie.png";
import cityBirdFood from "@/assets/images/community/city-bird-food.png";
import exRaccoon1 from "@/assets/images/community/ex-raccoon-1.png";
import exRaccoon2 from "@/assets/images/community/ex-raccoon-2.png";
import exRaccoon3 from "@/assets/images/community/ex-raccoon-3.png";
import exRaccoon4 from "@/assets/images/community/ex-raccoon-4.png";
import exRabbit1 from "@/assets/images/community/ex-rabbit-1.png";
import exRabbit2 from "@/assets/images/community/ex-rabbit-2.png";
import exRabbit3 from "@/assets/images/community/ex-rabbit-3.png";
import exRabbit4 from "@/assets/images/community/ex-rabbit-4.png";
import exGecko1 from "@/assets/images/community/ex-gecko-1.png";
import exGecko2 from "@/assets/images/community/ex-gecko-2.png";
import exGecko3 from "@/assets/images/community/ex-gecko-3.png";
import exGecko4 from "@/assets/images/community/ex-gecko-4.png";
import lostCat1 from "@/assets/images/community/lost-cat-1.png";
import lostCat2 from "@/assets/images/community/lost-cat-2.png";
import lostDog1 from "@/assets/images/community/lost-dog-1.png";
import lostDog2 from "@/assets/images/community/lost-dog-2.png";
import lostDog3 from "@/assets/images/community/lost-dog-3.png";
import lostAvatarLily from "@/assets/images/community/lost-avatar-lily.png";

export type Post = {
  avatar: string;
  name: string;
  followed: boolean;
  action?: "follow" | "contact"; // 默认 follow；走失帖为 contact「联系」
  lines: string[];
  images: string[];
  video?: string; // 可选：发布时附加的视频（objectURL，会话内有效）
  stats: [number, number, number]; // [评论, 收藏星, 点赞心]
};

export const RECOMMEND_POSTS: Post[] = [
  {
    avatar: a8Indoor,
    name: "小虎",
    followed: true,
    lines: ["依旧是帅狗一只。", "蒜皮别抢我瓶子!!!"],
    images: [a2TwoDogs, a6PupGrass, a3BlackFront],
    stats: [50, 15, 112],
  },
  {
    avatar: post2,
    name: "胖宝宝",
    followed: false,
    lines: ["胖宝宝成长日记！！", "和小霸王拍了汉堡和厨师照？？。"],
    images: [post2, pangbabao2, pangbabao3],
    stats: [69, 21, 666],
  },
  {
    avatar: post3,
    name: "小宝",
    followed: true,
    lines: ["今天和军粮去游泳了。。", "推荐推荐~~~"],
    images: [post3, post4],
    stats: [25, 16, 233],
  },
];

export const FOLLOW_POSTS: Post[] = [
  {
    avatar: a8Indoor,
    name: "小虎",
    followed: true,
    lines: ["依旧是蠢狗一只。", "蒜皮别抢我瓶子!!!"],
    images: [a2TwoDogs, a3BlackFront, a6PupGrass],
    stats: [50, 15, 112],
  },
  {
    avatar: post3,
    name: "小宝",
    followed: true,
    lines: ["今天和军粒去游泳了。。", "推荐推荐~~~"],
    images: [post3, post4, a2TwoDogs],
    stats: [25, 16, 233],
  },
];

export const CITY_POSTS: Post[] = [
  {
    avatar: cityCatFront,
    name: "年糕",
    followed: false,
    lines: ["第一次带年糕去了一家甜品，年糕玩的很开心，我也吃得很开心。", "#宠物友好店铺"],
    images: [cityCatFront, cityCatSide, cityCatBread],
    stats: [20, 50, 200],
  },
  {
    avatar: cityBirdHand,
    name: "团子",
    followed: false,
    lines: ["今天和我的非洲男孩一起逛街~", "#牡丹鹦鹉#带鹦鹉出门"],
    images: [cityBirdHand, cityBirdLie, cityBirdFood],
    stats: [30, 36, 326],
  },
];

export const EXOTIC_POSTS: Post[] = [
  {
    avatar: exRaccoon1,
    name: "憨憨",
    followed: false,
    lines: ["自家一手养的小浣熊宝宝，一个半月大，", "性格软乎乎，会主动伸手贴贴了❤"],
    images: [exRaccoon2, exRaccoon3, exRaccoon4],
    stats: [52, 20, 364],
  },
  {
    avatar: exRabbit1,
    name: "露露",
    followed: false,
    lines: ["我们家的小可爱🐰麻麻的小宝。", "淡紫金吉拉色、安哥拉兔。"],
    images: [exRabbit2, exRabbit3, exRabbit4],
    stats: [34, 18, 238],
  },
  {
    avatar: exGecko1,
    name: "守宫大王",
    followed: false,
    lines: ["摇头晃脑的样子真的是太可爱啦", "#肥尾守宫 #守宫豹纹 #守宫"],
    images: [exGecko2, exGecko3, exGecko4],
    stats: [58, 26, 169],
  },
];

export const LOST_POSTS: Post[] = [
  {
    avatar: lostAvatarLily,
    name: "Lily",
    followed: false,
    action: "contact",
    lines: ["坐标松元厦地铁站附近，有只小胖咪，", "银渐层走丢了，看看是哪个粗心家长走失的咪"],
    images: [lostCat1, lostCat2],
    stats: [39, 5, 58],
  },
  {
    avatar: lostDog1,
    name: "馒头",
    followed: false,
    action: "contact",
    lines: [
      "本人于9月10号晚上19:00左右在杭州市富阳区",
      "银湖街道银湖村金子垄不慎走失一只爱犬，",
      "万分焦急，恳请各位好心人与目击者提供线索！！！",
    ],
    images: [lostDog1, lostDog2, lostDog3],
    stats: [34, 18, 238],
  },
];

// 全部帖子（推荐 + 同城 + 异宠 + 走失，用于作者页聚合该作者的发布）
export const ALL_POSTS: Post[] = [
  ...RECOMMEND_POSTS,
  ...CITY_POSTS,
  ...EXOTIC_POSTS,
  ...LOST_POSTS,
];

// 作者信息（作者个人页数据；元信息/简介/统计为可迁移字段）
export type Author = {
  name: string;
  avatar: string;
  pet: string;      // 宠物信息，如「金毛 · 2岁」
  pp: string;       // PP号
  bio: string;      // 简介
  following: number;
  fans: number;
  likes: number;
};

export const AUTHORS: Record<string, Author> = {
  小虎: { name: "小虎", avatar: a8Indoor, pet: "金毛 · 3岁", pp: "PP号：20261001", bio: "蒜皮的忠实搭档，天天追着瓶子跑。", following: 18, fans: 356, likes: 1120 },
  胖宝宝: { name: "胖宝宝", avatar: post2, pet: "柯基 · 1岁", pp: "PP号：20261002", bio: "成长日记持续更新中，欢迎云养。", following: 12, fans: 890, likes: 2666 },
  小宝: { name: "小宝", avatar: post3, pet: "拉布拉多 · 2岁", pp: "PP号：20261003", bio: "最爱游泳和干饭，快乐小狗。", following: 9, fans: 421, likes: 998 },
  年糕: { name: "年糕", avatar: cityCatFront, pet: "美短 · 1岁", pp: "PP号：20261004", bio: "喜欢甜品店和一切软乎乎的地方。", following: 15, fans: 232, likes: 640 },
  团子: { name: "团子", avatar: cityBirdHand, pet: "牡丹鹦鹉 · 半年", pp: "PP号：20261005", bio: "跟非洲男孩到处逛街的小鹦鹉。", following: 7, fans: 188, likes: 520 },
  憨憨: { name: "憨憨", avatar: exRaccoon1, pet: "小浣熊 · 1个月", pp: "PP号：20261006", bio: "一手养大的软乎乎小浣熊。", following: 20, fans: 1500, likes: 4200 },
  露露: { name: "露露", avatar: exRabbit1, pet: "安哥拉兔 · 8个月", pp: "PP号：20261007", bio: "淡紫金吉拉色小可爱。", following: 11, fans: 345, likes: 980 },
  守宫大王: { name: "守宫大王", avatar: exGecko1, pet: "肥尾守宫 · 2岁", pp: "PP号：20261008", bio: "摇头晃脑的守宫爱好者。", following: 5, fans: 220, likes: 610 },
  Lily: { name: "Lily", avatar: lostAvatarLily, pet: "银渐层 · 1岁", pp: "PP号：20261009", bio: "找猫路上，感谢大家帮忙。", following: 3, fans: 90, likes: 158 },
  馒头: { name: "馒头", avatar: lostDog1, pet: "边牧 · 2岁", pp: "PP号：20261010", bio: "万分焦急寻找走失爱犬。", following: 2, fans: 76, likes: 238 },
};

// 该作者的帖子（按 name 聚合，去重：同名帖保留首个）
export function postsOfAuthor(name: string): Post[] {
  const seen = new Set<string>();
  const out: Post[] = [];
  for (const p of ALL_POSTS) {
    if (p.name !== name) continue;
    const sig = p.lines.join("|") + "|" + p.images.join("|");
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push({ ...p, followed: true });
  }
  return out;
}
