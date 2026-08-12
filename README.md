<div align="center">

<img src="assets/syuct-community-icon.png" alt="沈化大校园指南学生共创图标" width="112" />

# 沈阳化工大学校园指南（学生共创版）

**SYUCT Campus Guide**

把分散的新生通知、校园地图、学业资料、办事表格和校园经验，整理成一条更容易查找的路径。

**当前版本：v1.29** · **40+ 份资料** · **22 份 Office 本地预览** · **4 张实用导航地图** · **1 个官方校园全景** · **13 张校园实景照片**

[访问主站](https://www.syuct.top/) · [GitHub Pages 备用入口](https://ciderhalo.github.io/SYUCT/) · [资料下载](https://www.syuct.top/resources.html) · [参与共建](https://www.syuct.top/about.html)

</div>

---

## 项目简介

学校通知、学院表格、培养方案、群文件和同学经验往往散落在不同入口。本项目将常用校园信息重新分类，帮助沈阳化工大学本科新生、硕士新生和在校生更快找到资料，并知道下一步应该去哪里办理、查看或下载。

本站为**非官方学生共建项目**，不隶属于沈阳化工大学。涉及政策、收费、考试、学籍、培养方案和毕业要求的内容，请始终以学校及学院当年正式通知为准。

## 当前入口

| 入口 | 地址 | 用途 |
| --- | --- | --- |
| 主站 | <https://www.syuct.top/> | EdgeOne Pages 自定义域名，日常分享优先使用 |
| 备用站 | <https://ciderhalo.github.io/SYUCT/> | GitHub Pages 备用入口 |
| 源码仓库 | <https://github.com/CiderHalo/SYUCT> | 查看源码、提交 Issue 或 Pull Request |

## v1.29 更新

- **官方校园全景改为主动加载。** `map.html` 初始只显示本地航拍封面，用户点击“开始浏览”后才创建 720 云 `iframe`，避免普通地图访问直接产生第三方全景请求。
- **全景移动端体验重构。** 桌面端继续在地图页卡片内浏览；手机端点击后进入本站控制的全屏查看层，并提供关闭返回，减轻第三方页面在窄卡片中的遮挡感。
- **全景封面改用压缩后的本地 JPG。** 当前使用 `assets/campus-panorama-cover.jpg`，在保留航拍辨识度的同时减少首屏外资源依赖。
- **QQ群入口改为统一站内弹窗。** 首页和“关于共建”页点击群入口后，先显示本站加群弹窗，再由用户选择“复制群号”或“一键加入 QQ 群”。
- **两个群聊定位重新区分。** 2026 新生群用于新生日常交流、经验分享与资料互助；贴吧群明确标注为“沈阳化工大学百度贴吧官方群”。
- **不再使用加群二维码。** `assets/qq-group.png` 已从新版引用中移除，弹窗仅保留群号复制与 QQ 官方加群链接，减少无必要的图片资源和操作步骤。
- **继续沿用 v1.28 的快递导航单一维护原则。** 快递地址、品牌、时间和位置只在 `map.html#delivery` 维护，首页和新生页只负责导流。

完整版本记录见 [`project-docs/updates/README.md`](project-docs/updates/README.md)。

## 主要栏目

| 栏目 | 内容 |
| --- | --- |
| 新生入学 | 关键时间、报到准备、缴费安全、第一周安排与校园导航 |
| 校园地图 | 高清校园总图、快递取件导航、体育课专用地图与官方校园全景 |
| 数字校园 | 统一身份认证、校园网络、WebVPN、CARSI 和电子资源 |
| 学业资料 | 培养方案、选修要求、微专业、创新竞赛、开放实验室和课程资料 |
| 办事大厅 | 学籍修改、缓考、监控调阅、奖学金、毕业和论文相关流程 |
| 校园生活 | 校历、体育保健、假期留校、图书馆、学生管理规定和校园相册 |
| 资料下载 | PDF、Word、Excel 等资料的分类下载与在线预览 |
| 关于共建 | 投稿、纠错、版权说明、QQ 交流群和项目维护信息 |

## 网站特性

- 纯静态 HTML、CSS 和 JavaScript，无数据库和后端服务
- 同时支持 EdgeOne Pages 与 GitHub Pages 部署
- 桌面端和移动端自适应，含移动侧栏、站内搜索和深浅色模式
- 全站使用固定的 `app.js`、`styles.css` 与语义化资源文件名，通过查询参数刷新缓存
- 搜索、Office 预览和部分弹窗按需初始化，降低普通页面进入时的额外工作
- 新生入学、校园地图、数字校园、学业资料、办事大厅和校园生活使用统一校园地标页首
- 校园地图页集中提供校园总图、两张快递取件图、体育课专用地图与学校官网所提供的 720 云校园全景
- 官方全景仅在用户主动点击后连接第三方服务；手机端使用本站全屏承载层
- 快递取件详情以 `map.html#delivery` 为唯一维护入口，首页和新生页只做快捷跳转
- QQ 群入口使用统一站内弹窗：可复制群号，也可通过 QQ 官方网页加群链接一键加入；不再使用二维码
- PDF.js 完全本地托管，不依赖 jsDelivr、unpkg 等外部 CDN
- PDF 支持在线阅读、缩放、翻页和原文件下载
- Word、Excel 支持本站本地转换预览，原文件仍可直接下载
- 首页校园实景预览可一键跳转到完整校园相册
- 首页可显示 GitHub 项目 Star / Fork；网页只读取 `assets/github-stats.json`，统计由 GitHub Actions 定时更新

## 项目结构

```text
SYUCT/
├── .github/
│   └── workflows/
│       ├── vendor-pdfjs.yml           # 自动维护本地 PDF.js
│       ├── build-office-previews.yml  # 自动转换 Word / Excel 预览
│       └── update-github-stats.yml    # 定时更新 Star / Fork 静态统计
├── assets/
│   ├── icons/                         # 全站导航与入口 SVG 图标
│   ├── pdfjs/                         # GitHub Actions 写入的 PDF.js 运行文件
│   ├── office-preview-manifest.json   # Office 原文件与预览 PDF 映射
│   ├── github-stats.json              # GitHub Star / Fork 静态统计
│   ├── app.js                         # 全站交互、搜索与 Office 预览按钮
│   ├── styles.css                     # 全站样式
│   ├── group-community.css            # 交流群双卡片与加群弹窗补充样式
│   ├── pdf-viewer.js                  # PDF 阅读器入口
│   ├── pdf-viewer.css                 # PDF 阅读器样式
│   ├── syuct-community-icon.png       # 学生共创图标与 favicon
│   ├── campus-panorama-cover.jpg      # 官方全景点击加载前的本地航拍封面
│   ├── landmark-motto-stone.png       # 校训石地标插画
│   ├── landmark-dragon-gate.png       # 龙门地标插画
│   ├── landmark-library.png           # 图书馆地标插画
│   ├── landmark-huaide-square.png     # 槐德广场地标插画
│   ├── landmark-old-school-gate.png   # 老校门地标插画
│   ├── landmark-chemical-pyramid.png  # 化学金字塔地标插画
│   ├── campus-map.jpg                 # 高清校园地图
│   ├── sports-map.png                 # 体育课专用地图
│   ├── delivery-pickup-overview.png   # 快递取件位置总览图
│   ├── delivery-haochijie-layout.png  # 化大好吃街内部快递点位图
│   └── gallery-*.jpg                  # 校园相册图片
├── docs/                              # PDF、Word、Excel 等原始资料
│   └── previews/                      # Word、Excel 转换后的本地 PDF 预览
├── project-docs/
│   ├── updates/                       # 各版本更新记录
│   │   ├── README.md                  # 版本索引
│   │   ├── UPDATE-v1.28.md            # 快递取件导航更新报告
│   │   └── UPDATE-v1.29.md            # 全景按需加载与 QQ 加群弹窗更新报告
│   └── maintenance/                   # PDF.js 等维护说明
├── scripts/
│   ├── vendor-pdfjs.mjs               # PDF.js 本地化脚本
│   └── build-office-previews.py       # Word、Excel 转本地 PDF
├── index.html                         # 首页
├── freshman.html                      # 新生入学
├── map.html                           # 校园地图、快递取件、体育课与官方全景
├── digital.html                       # 数字校园
├── academics.html                     # 学业资料
├── services.html                      # 办事大厅
├── campus.html                        # 校园生活与完整相册
├── resources.html                     # 资料下载
├── about.html                         # 关于共建
├── pdf-viewer.html                    # PDF 在线阅读页
├── 404.html
└── package.json                       # 固定 PDF.js 版本与维护命令
```

## 静态资源与缓存

全站 JavaScript、CSS 和图片资源保持固定文件名，更新内容时覆盖原文件；需要刷新浏览器/CDN 缓存时修改查询参数，例如：

```html
<link href="assets/styles.css?rev=20260810" rel="stylesheet">
<script defer src="assets/app.js?rev=20260810"></script>
```

`rev` 只用于缓存失效，不代表必须创建新文件。不要重新增加 `app-v129.js`、`styles-v129.css` 这类历史副本。

## 校园地图维护

### 快递取件

快递品牌和驿站位置属于易变信息，统一以 `map.html#delivery` 为详情来源：

1. 地址、时间、品牌或提示变化时，只修改 `map.html#delivery`。
2. 位置变化较大时覆盖 `assets/delivery-pickup-overview.png` 或 `assets/delivery-haochijie-layout.png`。
3. 首页和新生页只保留跳转入口，不复制详细品牌和位置说明。
4. 长期保留“优先以物流通知、取件短信和现场标识为准”的提示。

### 官方校园全景

- 封面图使用 `assets/campus-panorama-cover.jpg`，由本站直接加载。
- 用户未点击“开始浏览”前，不创建 720 云 iframe。
- 桌面端在页面卡片中加载；手机端在本站全屏查看层中加载。
- 新窗口入口仍可直接前往原 720 云作品页面。
- 全景内容来自学校官网公开提供的入口，实际内容与可用性以原页面为准。

## 本地 PDF.js 与 Office 预览

项目通过 GitHub Actions 固定并维护 `pdfjs-dist`，运行文件保存在 `assets/pdfjs/`。PDF 阅读器与 PDF 原文件均从本站加载。

Word、Excel 原文件上传到 `docs/` 后，`Build local Office previews` 工作流会生成 `docs/previews/*.pdf` 并更新 `assets/office-preview-manifest.json`；全站脚本只在页面确实包含对应文档链接时读取预览清单。

## 参与共建

欢迎通过以下方式参与：

- 指出失效链接、错误日期或过期内容
- 补充培养方案、通知、表格、真题和校园地图
- 分享选课、考试、竞赛、考研、保研和就业经验
- 投稿校园照片并补充拍摄地点说明
- 通过 Issue 或 Pull Request 改进网站
- 通过首页或“关于共建”页打开加群弹窗，复制群号或一键加入新生群 / 贴吧官方群

## 部署说明

### EdgeOne Pages（主站）

```text
框架预设：Other
根目录：/
输出目录：/
构建命令：留空
安装命令：留空
生产分支：main
```

### GitHub Pages（备用站）

```text
分支：main
目录：/ (root)
```

网站不需要执行 `npm run build`。`package.json` 主要用于固定和维护本地 PDF.js；Office 预览由独立 GitHub Actions 工作流生成。

## 资料来源与版权

本站资料主要来自学校和学院公开发布内容，以及同学授权投稿。原文件仅用于学习交流与信息整理；如有侵权、失效内容或不适合公开的资料，请通过仓库 Issue 提出处理请求。

校园全景通过学校官网公开入口链接至第三方 720 云服务。本站默认仅显示本地封面，用户主动点击后才加载第三方全景；内容版权及服务可用性以原发布页面为准。

## 免责声明

本站为非官方学生共建项目，不代表沈阳化工大学官方立场。本站内容仅供参考，不构成任何官方承诺或办事依据。学校政策、课程安排、收费标准、考试要求、学籍管理和毕业要求均以学校及学院最新正式通知为准。

---

<div align="center">

**由学生整理，为学生服务。**

主站：<https://www.syuct.top/>

</div>
