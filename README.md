# PetPal 宠伴万象 · 前端原型（登录页 + 首页「啾啾」）

毕设 App 前端原型：登录成功后进入首页「啾啾」。本工程以首页 Pixso/墨刀导出稿（React19 + TS + 原生 CSS）为基座，
迁入已还原的绿色主题登录页（Tailwind），两者通过 react-router 串联。

## 技术栈
- React 19 + TypeScript + Vite 7
- react-router 7（`/login` 登录页、`/` 首页）
- 首页：导出稿原生定位 CSS（`src/styles/Frame332254.css`、`Bar.css`），素材与字体原样使用
- 登录页：Tailwind 3.4（`src/styles/login.css`，配置见 `tailwind.config.js`）

## 运行
```bash
npm install
npm run dev        # 开发调试
npm run build      # 生产构建到 dist
npm run preview    # 预览 dist
```

## 路由与登录流程
| 路径 | 页面 | 说明 |
|---|---|---|
| `/login` | 登录页 `src/pages/LoginPage.tsx` | 公开页；账号+密码校验通过后写入 `localStorage.petpal_auth=1` 并跳转 `/` |
| `/` | 首页外壳 `src/components/HomeShell.tsx` → `Frame332254.tsx`（宠物「啾啾」） | 受守卫保护（`src/router/components/StaticWrapper.tsx`）：未登录访问 `/` 自动重定向 `/login`；HomeShell 负责手机屏容器与 AI 悬浮球挂载 |
| `/migao` | 首页外壳 `src/components/HomeMigaoShell.tsx` → `FrameMigao.tsx`（宠物「米糕·金毛」） | 复用啾啾首页同一套布局/样式/交互标准，仅替换宠物照片、文案与数据；演示路由 |
| `/lulu` | 首页外壳 `src/components/HomeLuluShell.tsx` → `FrameLulu.tsx`（宠物「露露·垂耳兔」） | 同上标准；数据 1.8kg体重 / 75g日进食量 / 10h睡眠；演示路由 |
| `/paipai` | AI 派派聊天页 `src/components/PaipaiShell.tsx`（样式 `styles/paipai.css`） | 绿色主题聊天界面：顶部返回/标题/清除、消息流、6 个建议问题胶囊、底部输入框；原型为固定回复，返回 `navigate(-1)` |
| `/archive` | 宠物档案页 `src/components/ArchiveShell.tsx`（样式 `styles/archive.css`） | 评分卡+圆环；概览 Tab（近30天体重折线、近期记录时间线、添加记录按钮）、记录 Tab（今日快速记录五项网格、全部/体重/护理/医疗筛选、健康明细列表）；报告 Tab（深绿月度报告横幅+亮绿圆环92、三项指标卡、全部报告列表含最新/需关注/良好标签、导出完整报告按钮）；支持 `?tab=0|1|2` 直达；由首页「今日状态·全部记录」(`#332_372`) 进入 |
| `/science` | 宠物知识科普页 `src/components/ScienceShell.tsx`（样式 `styles/science.css`） | 顶部返回+标题、搜索框、11 个分类胶囊分两行排列、每行可左右横滑显示更多（选中项深绿填充白字，右侧渐隐遮罩提示可滑；新手饲养必看/狗狗/宠物训练方法/猫咪/爬行类/鸟类/水族/常见疾病预防/健康护理/异宠环境指南/饮食营养）、3 篇文章卡片（封面+标题+两行摘要+来源/时间）；由三个首页底部导航「科普」Tab（图标 `#4_3` + 文字 `#431_120`，绑定逻辑 `components/ScienceEntry.tsx`）进入；科普页底部复用同一套 Bar，点「首页」图标 `#2_459` / 文字 `#2_431`（`components/ScienceHomeEntry.tsx`，捕获阶段拦截占位事件）回到首页 `/`；页面顶部返回按钮 `navigate(-1)` |
| `/community` | 社区-推荐页 `src/components/CommunityShell.tsx`（样式 `styles/community.css`） | 顶部主标题随频道（推荐/关注「和热爱每一种宠物的人在一起」、同城/异宠圈/走失寻找「和懂每一种宠物的人在一起」）+「发现」、5 个频道 Tab（推荐/关注/同城/异宠圈/宠物走失寻找，当前项绿色高亮带下划线；五个频道均在页内切换各自头卡与帖子流；支持 `?tab=1` 直达关注、`?tab=2` 直达同城、`?tab=3` 直达异宠圈、`?tab=4` 直达走失寻找）；推荐频道头卡（PETPAL COMMUNITY +「参与发帖」按钮）+ 4 张帖子卡；关注频道（导出帧 Frame3322340）头卡（FOLLOWING +「今天更新了 看看你关注的人」+「发现更多创作者」按钮）+ 2 张已关注帖子卡（小虎 50/15/112、胖胖窝 25/16/233）；同城频道（导出帧 Frame3322422）头卡（CITY PET LIFE + 定位 pin +「上海宠友正在发生什么」+「查看同城活动」按钮）+ 2 张未关注帖子卡（年糕·猫 20/50/200、团子·牡丹鹦鹉 30/36/326）+ 帖子后「本周同城活动」卡（「查看活动」描边按钮）；异宠圈频道（导出帧 Frame3322512）头卡（EXOTIC COMMUNITY +「每一种陪伴都值得被认真对待」+「发布异宠动态」按钮）+「EXOTIC CARE 异宠频道精选」分类卡（鸟类照护/爬宠环境/小型哺乳 三个图文分类入口）+ 3 张未关注帖子卡（憨憨·浣熊 52/20/364、露露·安哥拉兔 34/18/238、守宫大王·豹纹守宫 58/26/169）；走失寻找频道（浏览帧 Frame3322632 / 发布帧 Frame3322757）头卡（LOST & FOUND +「一起帮他回家」+ 描述）+「寻找宠物 / 发布走失信息」分段选择器（灰绿底容器，选中项白底浮起，点击在浏览列表与发布表单间切换）；浏览模式：「城市(长沙定位) + 搜索同城」筛选行 + 2 张联系帖（Lily·银渐层猫 39/5/58、馒头·边牧 34/18/238，帖子右侧为「联系」胶囊而非关注）；发布模式（选中「发布走失信息」）：隐私提示条（警告三角 +「请尽量填写准确的最后出现地点及外貌特征，不要公开完整住址等敏感信息」）+ 表单（宠物名字、城市长沙、走失日期 2026年9月13日、品种/特征、最后出现地点、联系电话、外观和线索多行、宠物类型 犬/猫/其他 分段默认选犬）+ 实心绿「发布走失信息」提交按钮；发布模式不渲染筛选行与帖子流、不显示发帖浮钮；帖子卡含头像圆裁、昵称、右侧已关注/+关注（走失帖为联系）胶囊与「…」更多按钮、文案行、并排方形缩略图网格（走失猫帖为两图两列）、互动顺序：评论气泡 / 星标收藏 / 心形点赞；右下悬浮发帖按钮（走失寻找页按导出稿不显示；点击跳转 `/community/publish` 发布动态页）；由三个首页底部导航「社区」Tab（图标 `.Pixso-rectangle-2_460` + 文字 `#431_121`，绑定逻辑 `components/CommunityEntry.tsx`）首先进入；社区页底部复用同一套 Bar 并 fixed 贴底，点「首页」图标 `#2_459` / 文字 `#2_431`（`components/CommunityHomeEntry.tsx`，捕获阶段拦截占位事件）回到首页 `/` |
| `/community/publish` | 社区-发布动态页 `src/components/PostComposeShell.tsx`（样式 `styles/compose.css`；导出帧 Frame372721 日常分享 / Frame372889 求助 / Frame372964 领养公益） | 顶部返回箭头（回 `/community`）+「发布动态」标题 +「编辑中」状态；三种类型胶囊（日常分享/求助/领养公益，选中深绿填充白字，页内 state 切换，对应正文占位分别为「分享今天和宠物的小故事...」「描述宠物情况、地点和你需要的帮助...」「介绍等待领养的动宠物，留下可靠的联系信息...」）；正文多行输入卡；添加图片 / 视频两个虚线入口；关联宠物（爪印·米糕）/ 选择话题（#·#异宠日常）/ 所在位置（pin·上海市）三行元信息；盾牌对勾 +「发布内容将进行安全审核」提示；底部实心绿「发布动态」纸飞机提交按钮；本页不挂底部 Bar、不显示发帖浮钮；由社区页右下悬浮发帖按钮进入 |

> 当前为原型演示：任意非空账号 + 密码即可登录进入首页；接入后端时把 `LoginPage.tsx` 的 `handleSubmit` 替换为真实登录请求即可。

> 三个首页互通：点击任意页顶部宠物名胶囊（如「啾啾 ⌄」）弹出下拉，选择「啾啾 / 米糕 / 露露」即路由切换到对应首页，当前项带 ✓ 高亮，点击菜单外或切换后自动收起。

## 目录结构
```
src/
├─ main.tsx                     # 入口，加载全局CSS/字体/登录页Tailwind样式
├─ router/
│  ├─ index.tsx                 # BrowserRouter
│  ├─ routes.ts                 # 路由表（/login、/ 啾啾、/migao 米糕、/lulu 露露、/paipai 派派、/archive 档案、/science 科普、/community 社区、/community/publish 发布动态）
│  └─ components/StaticWrapper.tsx  # Routes + 登录态守卫
├─ pages/LoginPage.tsx          # 登录页（Tailwind）
├─ components/login/            # 登录页组件：StatusBar / ThirdPartyLogin / Icons
├─ views/Frame332254.tsx        # 首页「啾啾」主视图（导出稿原样）
├─ views/FrameMigao.tsx         # 首页「米糕」视图（复用啾啾结构，替换照片/文案/数据）
├─ views/FrameLulu.tsx          # 首页「露露」视图（复用啾啾结构，替换照片/文案/数据）
├─ components/Bar.tsx           # 首页底部导航（首页/科普/社区/服务/我的）
├─ components/HomeShell.tsx     # 啾啾首页外壳：手机屏容器、整页滚动、挂载悬浮球
├─ components/HomeMigaoShell.tsx# 米糕首页外壳：复用同一容器标准，渲染 FrameMigao
├─ components/HomeLuluShell.tsx # 露露首页外壳：复用同一容器标准，渲染 FrameLulu
├─ components/AiFloatButton.tsx # AI 可拖拽悬浮球（fixed，不随滚动；单击进 /paipai，拖动不跳）
├─ components/PetSwitcher.tsx   # 宠物名胶囊下拉切换：啾啾/米糕/露露互跳
├─ components/PaipaiEntry.tsx   # 首页 AI 小结卡入口绑定（整卡/头像/气泡）→ /paipai
├─ components/PaipaiShell.tsx   # AI 派派聊天页（消息流/建议胶囊/输入栏）
├─ components/ArchiveEntry.tsx  # 首页「今日状态·全部记录」入口绑定 → /archive
├─ components/ArchiveShell.tsx  # 宠物档案-概览页（评分圆环/Tab/体重折线/时间线）
├─ components/ScienceEntry.tsx # 首页底部「科普」Tab 入口绑定（图标#4_3 + 文字#431_120）→ /science
├─ components/ScienceHomeEntry.tsx # 科普页底部「首页」入口绑定（图标#2_459 + 文字#2_431）→ /
├─ components/ScienceShell.tsx  # 宠物知识科普页（搜索框/分类胶囊横滑/文章卡流）
├─ components/CommunityEntry.tsx # 首页底部「社区」Tab 入口绑定（图标 .Pixso-rectangle-2_460 + 文字 #431_121）→ /community
├─ components/CommunityHomeEntry.tsx # 社区页底部「首页」入口绑定（图标 #2_459 + 文字 #2_431）→ /
├─ components/CommunityShell.tsx # 社区页（推荐/关注/同城/异宠圈/走失寻找五频道数据切换；频道Tab/欢迎头卡/异宠精选分类卡/走失浏览筛选行与联系帖/走失发布分段选择器与表单/帖子流/同城活动卡/发帖悬浮钮；?tab=1 关注、?tab=2 同城、?tab=3 异宠圈、?tab=4 走失直达）
├─ components/PostComposeShell.tsx # 社区发布动态页（日常分享/求助/领养公益三类型切换；正文输入/添加图片视频/关联宠物·话题·位置/安全审核提示/发布按钮；由社区发帖浮钮进入）
├─ styles/
│  ├─ Frame332254.css           # 首页定位样式（导出稿，卡片内部保真）
│  ├─ Bar.css                   # 底部导航样式
│  ├─ home-adapt.css            # 首页流式外壳、模块顺序、紧凑化、导航贴底覆盖样式
│  ├─ AiFloatButton.css          # AI 悬浮球样式
│  ├─ PetSwitcher.css            # 宠物切换下拉菜单样式
│  ├─ paipai.css                 # AI 派派聊天页样式（手机列/消息气泡/建议胶囊/输入栏）
│  ├─ archive.css                # 宠物档案页样式（评分卡/圆环/Tab/折线图/时间线）
│  ├─ science.css                # 科普页样式（搜索框/横滑分类胶囊/文章卡封面与摘要）
│  ├─ community.css              # 社区页样式（频道Tab/五频道头卡/同城活动卡/异宠精选分类卡/走失浏览筛选行与联系胶囊/走失分段选择器+发布表单与提交按钮/帖子卡网格/悬浮发帖钮/Bar贴底覆盖）
│  ├─ compose.css                # 发布动态页样式（顶部返回/类型胶囊/正文编辑卡/图片视频入口/关联宠物话题位置三行/审核提示/提交按钮）
│  └─ login.css                 # Tailwind 指令 + 登录页局部样式
└─ assets/
   ├─ images/                   # 首页图片/SVG 素材（导出稿）
   └─ fonts/                    # Noto Sans SC、Alimama 方圆体
public/assets/                  # 登录页素材：logo.png / wordmark.png / wechat.svg / qq.svg
```

## 首页模块（自上而下）
1. 状态栏 9:41
2. 问候区：「晚上好！林沐」「上海·27℃」+ 头像 / 通知入口
3. 宠物卡「啾啾」：异宠档案正常 · 换羽期照护中（玄凤鹦鹉主图）
4. 数据三格：91 g·体重 / 25.6 ℃·笼温 / 10.5 h·光照
5. AI 派派·今日小结卡
6. 今日提醒：狂犬疫苗即将到期、晚间遛狗
7. 今日状态：饮食(已完成)/饮水/排便/睡眠8.2h/运动48min
8. PETPAL 异宠专属推广卡（鸟类·爬宠·小宠）
9. 附近优选：寄养 ¥129 长沙乐乐宠物店 / 食品玩具 ¥58 广州迪迪乐旗舰店 / 南大公园·上海
10. 底部导航 Bar：首页 / 科普 / 社区 / 服务 / 我的

## 配色
- 首页主背景浅绿 `rgba(217,249,111,0.75)`、底部栏浅绿 `#E6FFC8`、AI小结深绿卡；渐变 `#E6FFC8→#FFFFFF`（导出稿 CSS 内联定义）。
- 登录页绿色阶在 `tailwind.config.js` 的 `brand`（主按钮 `#B3EE84`、深绿文字 `#2E7D32`、浅底 `#E8F8D8`）。

## 首页形式（对齐登录页）与 AI 悬浮球
- **居中手机屏**：`HomeShell` 外层舞台在桌面用中性浅灰衬托色，中间固定 iPhone 逻辑宽 406px 的手机列并水平居中；手机列内为浅绿渐变、纵向滚动；桌面宽屏下两侧为衬托色，页面始终保持手机尺寸，不被拉伸。
- **隐藏滚动条**：手机列 `scrollbar-width:none` + `::-webkit-scrollbar{display:none}`，保留滚动能力但不显示灰色滚动条。
- **模块纵向排列**：顶层模块按视觉顺序流式排布（问候 → 宠物卡 → 数据三格 → AI 小结 → 今日提醒 → 今日状态 → 异宠推广 → 附近优选），组间统一间距；卡片内部细节沿用导出稿坐标保真。
- **底部导航固定贴底**：Bar `fixed` 贴住手机列底部、水平居中，不随内容滚动。
- **AI 悬浮球**：`AiFloatButton` 为 `fixed` 视口定位，独立于滚动容器；支持鼠标/手指自由拖动、边界内停留（横向被限制在 406 手机列内，不会拖到桌面侧栏）、松手记忆位置；挂在滚动层之外，拖动坐标准确。4px 阈值区分点击与拖动：未位移的单击跳转 `/paipai` 派派聊天页，拖动松手不跳转。首页「AI 派派·今日小结」卡（整卡、头像、右侧气泡按钮）同样点击进入 `/paipai`。

## 已知占位与待办
- 首页卡片与底部导航点击在导出稿中为 guid 跳转占位，`getPathByGuid` 多数无对应路由，点击暂无页面跳转（后续补各子页面时在 `routes.ts` 注册即可）。
- AI 小结卡内仍保留导出稿原静态头像；另有一个可拖动悬浮球，是否删除卡片内静态头像待确认。
- 紧凑化数值（提醒卡/状态网格/附近优选间距）集中在 `home-adapt.css` 末尾，真机上可再按视觉微调。
- 第三方登录（微信/QQ）、忘记密码、注册均为 toast 占位，待接入。
