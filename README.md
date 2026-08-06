<div align="center">

<img src="assets/syuct-community-icon.png" alt="沈化大校园指南学生共创图标" width="112" />

# 沈阳化工大学校园指南（学生共创版）

**SYUCT Campus Guide**

把分散的新生通知、校园地图、学业资料、办事表格和校园经验，整理成一条更容易查找的路径。

**当前版本：v1.26** · **41 份资料** · **22 份 Office 本地预览** · **2 张校园导航地图** · **1 个官方校园全景** · **13 张校园实景照片**

[访问主站](https://www.syuct.top/) · [GitHub Pages 备用入口](https://hanchuang0303.github.io/SYUCT/) · [资料下载](https://www.syuct.top/resources.html) · [参与共建](https://www.syuct.top/about.html)

</div>

---

## 项目简介

学校通知、学院表格、培养方案、群文件和同学经验往往散落在不同入口。本项目将常用校园信息重新分类，帮助沈阳化工大学本科新生、硕士新生和在校生更快找到资料，并知道下一步应该去哪里办理、查看或下载。

本站为**非官方学生共建项目**，不隶属于沈阳化工大学。涉及政策、收费、考试、学籍、培养方案和毕业要求的内容，请始终以学校及学院当年正式通知为准。

## 当前入口

| 入口 | 地址 | 用途 |
| --- | --- | --- |
| 主站 | <https://www.syuct.top/> | EdgeOne Pages 自定义域名，日常分享优先使用 |
| 备用站 | <https://hanchuang0303.github.io/SYUCT/> | GitHub Pages 备用入口 |
| 源码仓库 | <https://github.com/hanchuang0303/SYUCT> | 查看源码、提交 Issue 或 Pull Request |

## v1.26 更新

- 全站静态资源改用固定文件名：`assets/app.js` 与 `assets/styles.css`，不再为每次更新复制新的 `app-v*.js`、`styles-v*.css`。
- 页面通过 `?rev=20260806` 更新浏览器缓存；后续发布只需修改缓存参数，不需要继续增加带版本号的文件。
- 校园地图页加入学校官网提供的 720 云校园全景入口，支持页面内漫游、响应式显示和新窗口全屏浏览。
- 办事大厅页加入“老校门”地标插画，与校训石、龙门、图书馆和化学金字塔使用统一的页首布局。
- 地标图片统一改为不带版本号的固定命名，并清理已无引用的旧版资源文件。
- README、项目结构、版本索引和更新报告同步到 v1.26。

完整版本记录见 [`project-docs/updates/README.md`](project-docs/updates/README.md)。

## 主要栏目

| 栏目 | 内容 |
| --- | --- |
| 新生入学 | 报到准备、入学流程、新生指南、本科与硕士新生常见问题 |
| 校园地图 | 官方校园全景、高清校园总图、体育课专用地图和常用地点导航 |
| 数字校园 | 统一身份认证、校园网络、WebVPN、CARSI 和电子资源 |
| 学业资料 | 培养方案、选修要求、微专业、创新竞赛、开放实验室和课程资料 |
| 办事大厅 | 学籍修改、缓考、监控调阅、奖学金、毕业和论文相关流程 |
| 校园生活 | 校历、体育保健、假期留校、图书馆、学生管理规定和校园相册 |
| 资料下载 | PDF、Word、Excel 等资料的分类下载与在线预览 |
| 关于共建 | 投稿、纠错、版权说明和项目维护信息 |

## 网站特性

- 纯静态 HTML、CSS 和 JavaScript，无数据库和后端服务
- 同时支持 EdgeOne Pages 与 GitHub Pages 部署
- 桌面端和移动端自适应，含移动侧栏、站内搜索和深浅色模式
- 响应式站点标题：桌面端显示完整共创版名称，手机端显示简化名称
- 全站使用固定的 `app.js`、`styles.css` 与地标资源文件名，通过查询参数刷新缓存
- 新生入学、校园地图、学业资料、办事大厅和校园生活使用统一校园地标页首
- 校园地图页内嵌官方 720 云校园全景，并保留新窗口全屏入口
- PDF.js 完全本地托管，不依赖 jsDelivr、unpkg 等外部 CDN
- PDF 支持在线阅读、缩放、翻页和原文件下载
- Word、Excel 支持本站本地转换预览，原文件仍可直接下载
- 首页校园实景预览可一键跳转到完整校园相册
- 原始资料集中存放在 `docs/`，维护说明与版本记录集中存放在 `project-docs/`

## 项目结构

```text
SYUCT/
├── .github/
│   └── workflows/
│       ├── vendor-pdfjs.yml           # 自动维护本地 PDF.js
│       └── build-office-previews.yml  # 自动转换 Word / Excel 预览
├── assets/
│   ├── icons/                         # 全站导航与入口 SVG 图标
│   ├── pdfjs/                         # GitHub Actions 写入的 PDF.js 运行文件
│   ├── office-preview-manifest.json   # Office 原文件与预览 PDF 映射
│   ├── app.js                         # 全站交互、搜索与 Office 预览按钮
│   ├── styles.css                     # 全站样式
│   ├── pdf-viewer.js                  # PDF 阅读器入口
│   ├── pdf-viewer.css                 # PDF 阅读器样式
│   ├── syuct-community-icon.png       # 学生共创图标与 favicon
│   ├── landmark-motto-stone.png       # 校训石地标插画
│   ├── landmark-dragon-gate.png       # 龙门地标插画
│   ├── landmark-library.png           # 图书馆地标插画
│   ├── landmark-old-school-gate.png   # 老校门地标插画
│   ├── landmark-chemical-pyramid.png  # 化学金字塔地标插画
│   ├── campus-map.jpg                 # 高清校园地图
│   ├── sports-map.png                 # 体育课专用地图
│   └── gallery-*.jpg                  # 校园相册图片
├── docs/                              # PDF、Word、Excel 等原始资料
│   └── previews/                      # Word、Excel 转换后的本地 PDF 预览
├── project-docs/
│   ├── updates/                       # 各版本更新记录
│   └── maintenance/                   # PDF.js 等维护说明
├── scripts/
│   ├── vendor-pdfjs.mjs               # PDF.js 本地化脚本
│   └── build-office-previews.py       # Word、Excel 转本地 PDF
├── index.html                         # 首页
├── freshman.html                      # 新生入学
├── map.html                           # 校园全景、地图与体育课导航
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

全站 JavaScript、CSS 和地标插画使用固定文件名，避免仓库长期堆积多个历史副本：

```html
<link href="assets/styles.css?rev=20260806" rel="stylesheet">
<script defer src="assets/app.js?rev=20260806"></script>
```

后续更新资源内容时，只需将所有页面中的 `rev` 参数改为新的发布日期或发布编号，例如：

```text
?rev=20260807
```

不要重新创建 `app-v127.js`、`styles-v127.css` 一类文件。固定文件名便于维护，查询参数负责让浏览器和 CDN 获取新内容。

## 本地 PDF.js

项目通过 GitHub Actions 固定并维护 `pdfjs-dist`。运行文件被保存到 `assets/pdfjs/`，因此阅读器组件与 PDF 原文件都从本站加载，避免外部 CDN 在部分网络环境下连接缓慢或失败。

仓库 **Actions** 页面中应能看到：

```text
Vendor local PDF.js
```

工作流成功后，EdgeOne 会检测到新提交并自动重新部署。

## 新增资料

### 新增 PDF

1. 将 PDF 上传到 `docs/`。
2. 在对应页面中加入在线预览链接：

```html
<a
  href="pdf-viewer.html?file=docs/example.pdf&title=资料名称"
  target="_blank"
  rel="noreferrer"
>
  在线预览
</a>
```

本地 PDF.js 已经安装，后续新增 PDF 不需要生成页面图片或维护预览清单。

### 新增 Word 或 Excel

1. 将 `.doc`、`.docx`、`.xls` 或 `.xlsx` 文件上传到 `docs/`。
2. 在对应页面添加指向原文件的普通下载链接：

```html
<a href="docs/example.docx" download>下载资料</a>
```

3. `Build local Office previews` 工作流会自动生成 `docs/previews/example.pdf` 并更新预览清单。
4. 全站脚本会自动在原下载链接旁加入“在线预览”，不需要手写预览链接。

转换预览适合阅读与查找；需要填写、修改或精确核对格式时，请下载原文件。

### 新增校园照片

1. 将压缩后的图片保存到 `assets/`。
2. 在 `campus.html#photos` 的相册区域添加图片卡片。
3. 需要在首页展示时，再在 `index.html` 的“校园一览”中引用；首页只保留少量精选图，完整图片统一放在校园相册中。

### 新增校园地标插画

1. 将透明 PNG 保存到 `assets/`，使用语义化固定名称，例如 `landmark-example.png`。
2. 在对应内容页的统一页首结构中引用图片。
3. 标签使用“校园地标 · 地标名称”的格式。
4. 更新图片时覆盖原文件，并修改页面中的 `?rev=` 参数，不要新建带版本号的图片副本。

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

自定义域名：

```text
www.syuct.top
```

DNS 解析记录和目标值以 EdgeOne 控制台当前提示为准。网站本身是纯静态项目，不需要额外购买服务器来运行页面。

### GitHub Pages（备用站）

```text
分支：main
目录：/ (root)
```

网站不需要执行 `npm run build`。`package.json` 仅用于固定和维护本地 PDF.js；Office 预览由独立 GitHub Actions 工作流生成。

## 参与共建

欢迎通过以下方式参与：

- 指出失效链接、错误日期或过期内容
- 补充培养方案、通知、表格、真题和校园地图
- 分享选课、考试、竞赛、考研、保研和就业经验
- 投稿校园照片并补充拍摄地点说明
- 通过 Issue 或 Pull Request 改进网站

2026 沈阳化工大学新生交流群：**1170264357**

## 资料来源与版权

本站资料主要来自学校和学院公开发布内容，以及同学授权投稿。原文件仅用于学习交流与信息整理；如有侵权、失效内容或不适合公开的资料，请通过仓库 Issue 提出处理请求。

校园全景通过学校官网公开入口链接至第三方全景服务，内容版权及服务可用性以原发布页面为准。

## 免责声明

本站为非官方学生共建项目，不代表沈阳化工大学官方立场。本站内容仅供参考，不构成任何官方承诺或办事依据。学校政策、课程安排、收费标准、考试要求、学籍管理和毕业要求均以学校及学院最新正式通知为准。

---

<div align="center">

**由学生整理，为学生服务。**

主站：<https://www.syuct.top/>

</div>
