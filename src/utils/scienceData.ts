// 科普共享数据源：分类 + 文章流
// 供 ScienceShell（列表）与 ScienceDetailShell（详情）共用，
// images 为详情页轮播图（首图为列表封面），content 为详情正文段落；
// 后续可迁移到后端接口。

import coverGuide from "@/assets/images/science/cover-dog-guide.png";
import coverLeash from "@/assets/images/science/cover-leash-rule.png";
import coverExotic from "@/assets/images/science/cover-exotic.png";
import dog2 from "@/assets/images/community/a2-two-dogs.png";
import dogGrass from "@/assets/images/community/a6-pup-grass.png";
import dogBlack from "@/assets/images/community/a3-black-front.png";
import raccoon1 from "@/assets/images/community/ex-raccoon-1.png";
import gecko1 from "@/assets/images/community/ex-gecko-1.png";

// 科普分类（横向滑动胶囊）
export const CATEGORIES = [
  "新手饲养必看",
  "狗狗",
  "宠物训练方法",
  "猫咪",
  "爬行类",
  "鸟类",
  "水族",
  "常见疾病预防",
  "健康护理",
  "异宠环境指南",
  "饮食营养",
];

export type ScienceArticle = {
  cover: string;
  title: string;
  excerpt: string;
  source: string;
  time: string;
  images: string[];
  content: string[];
};

export const ARTICLES: ScienceArticle[] = [
  {
    cover: coverGuide,
    title: "精选内容集 | 养狗入门指南，带你从小白变身养宠达人！",
    excerpt:
      "狗是人类最忠诚的朋友，其活泼可爱的特性成为许多人养宠物的首选。然而从一个新手养狗小白到养宠达人，需要了解和准备的内容非常丰富，本文将从狗狗的初期准备、日常护理、科学喂养、日常训练等方面展开……",
    source: "一个爱狗人士",
    time: "一天前",
    images: [coverGuide, dog2, dogGrass],
    content: [
      "带一只狗狗回家之前，请先确认家庭成员都能接受、空间与时间足够，并提前准备食盆、水盆、狗窝、牵引绳和常用的清洁用品。幼犬到家前两周应尽量减少陌生刺激，让它慢慢熟悉新环境与气味。",
      "喂养上建议选择符合生命阶段的优质犬粮，定时定量，避免喂食人的餐桌食物。幼犬每日可分三到四餐，成年犬一到两餐即可；始终提供干净的饮用水，并保持餐具清洁。",
      "日常护理包括定期梳理毛发、修剪指甲、清洁耳朵与牙齿，并按免疫计划完成疫苗接种和体内外驱虫。每天保证一定的运动与游戏时间，对狗狗的身心健康和性格养成都很重要。",
      "训练从基础指令开始：坐、等、来、随行。用零食正向强化，保持口令一致和耐心，避免惩罚式训练。定点大小便训练要固定时间带它去固定地点，成功后再给予奖励。",
    ],
  },
  {
    cover: coverLeash,
    title: "2026养犬新规正式实施！这些行为必罚，拘留+罚款双重震慑！",
    excerpt:
      "新修订的《治安管理处罚法》第八十九条规定：饲养动物干扰他人正常生活的，处警告；警告后不改正的，或者放任动物恐吓他人的，处一千元以下罚款。违反有关法律、法规、规章规定，出售、饲养烈性犬等危险动物……",
    source: "长沙市铲屎官手册",
    time: "1个月前",
    images: [coverLeash, dogBlack],
    content: [
      "养犬新规实施后，各地普遍要求为犬只登记办证、出门牵绳并及时清理粪便。不拴绳、放任犬只在公共区域乱跑，不仅影响他人，还可能被处以警告或罚款。",
      "对于烈性犬、危险犬的饲养与销售，法规有严格限制。未经许可饲养或在禁养区域内饲养，会被要求限期处理，情节严重的可能面临拘留和罚款。",
      "作为养宠人，文明养犬不仅是遵守法律，也是对他人的尊重。建议出门随身携带牵引绳、拾便袋，主动避开人群密集场所，并在公共场合看管好自家宠物。",
      "如果你正在考虑养犬，请先了解所在地的养犬登记、禁养名录和免疫要求，做一个合法、负责任的养宠人。",
    ],
  },
  {
    cover: coverExotic,
    title: "分享28种不同异宠，你最想养哪些呢？#异宠科普 #昆虫 #大自然 #动物的迷惑行为",
    excerpt:
      "对昆虫和爬宠感到好奇？这份内容系统梳理了28种异宠的饲养可能性，明确区分了哪些可以作为宠物饲养、哪些属于保护物种，并提供了关键注意事项，为潜在的异宠爱好者提供了宝贵参考。",
    source: "源自抖音：七喜百科",
    time: "2026年3月10日",
    images: [coverExotic, raccoon1, gecko1],
    content: [
      "异宠的范围很广，包括爬行类、两栖类、节肢动物和小型哺乳类等。养异宠前务必确认该物种是否允许饲养，很多野生动物和部分外来物种属于保护或管控对象，不能随意购买。",
      "不同物种对环境温湿度、光照和食物的需求差异很大。例如爬宠需要适宜的加热与晒点，节肢动物对湿度敏感，小型哺乳类需要充足的活动空间和磨牙设施。",
      "喂食应贴近其自然食性，避免随意投喂人食。部分异宠是夜行性或胆小型，应提供隐蔽处所，减少惊扰，观察和上手要有耐心并注意防护。",
      "异宠医疗资源相对有限，建议养宠前就了解附近可接诊的异宠医院。做好长期投入的打算，不因一时好奇而草率入手。",
    ],
  },
];
