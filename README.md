<div align="center">

<img src="assets/syuct-community-icon.png" alt="沈化大校园指南学生共创图标" width="112" />

# 沈阳化工大学校园指南（学生共创版）

**SYUCT Campus Guide**

把分散的新生通知、校园地图、学业资料、办事表格和校园经验，整理成一条更容易查找的路径。

**当前版本：v1.19** · **41 份资料** · **22 份 Office 本地预览** · **2 张校园导航地图** · **13 张校园实景照片**

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

## v1.19 更新

- 侧边栏与首页核心入口的 emoji 已全部替换为 9 枚统一的校园导视 SVG 图标。
- 龙门与化学金字塔不再单独占用大卡片，而是融入“新生入学”和“校园生活”的页首介绍区域。
- 新版本使用 `app-v119.js` 与 `styles-v119.css`，避免旧缓存导致图标不生效。
- 更新说明统一放在 `project-docs/updates/`，仓库根目录不再放置 `UPDATE-v*.md`。

完整版本记录见 [`project-docs/updates/README.md`](project-docs/updates/README.md)。

## 主要栏目

| 栏目 | 内容 |
| --- | --- |
| 新生入学 | 报到准备、入学流程、新生指南、本科与硕士新生常见问题 |
| 校园地图 | 高清校园总图、体育课专用地图和常用地点导航 |
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
│       ├── vendor-pdfjs.yml       # 自动维护本地 PDF.js
│       └── build-office-previews.yml # 自动转换 Word / Excel 预览
├── assets/
│   ├── pdfjs/                     # GitHub Actions 写入的 PDF.js 运行文件
│   ├── office-preview-manifest.json # Office 原文件与预览 PDF 映射
│   ├── app-v117.js                # 全站交互与 Office 预览按钮
│   ├── styles-v117.css            # 全站样式
│   ├── pdf-viewer.js              # PDF 阅读器入口
│   ├── pdf-viewer.css             # PDF 阅读器样式
│   ├── syuct-community-icon.png   # 学生共创图标与 favicon
│   ├── campus-map.jpg             # 高清校园地图
│   ├── sports-map.png             # 体育课专用地图
│   └── gallery-*.jpg              # 校园相册图片
├── docs/                          # PDF、Word、Excel 等原始资料
│   └── previews/                  # Word、Excel 转换后的本地 PDF 预览
├── project-docs/
│   ├── updates/                   # 各版本更新记录
│   └── maintenance/               # PDF.js 等维护说明
├── scripts/
│   ├── vendor-pdfjs.mjs           # PDF.js 本地化脚本
│   └── build-office-previews.py   # Word、Excel 转本地 PDF
├── index.html                     # 首页
├── freshman.html                  # 新生入学
├── map.html                       # 校园地图
├── digital.html                   # 数字校园
├── academics.html                 # 学业资料
├── services.html                  # 办事大厅
├── campus.html                    # 校园生活与完整相册
├── resources.html                 # 资料下载
├── about.html                     # 关于共建
├── pdf-viewer.html                # PDF 在线阅读页
├── 404.html
└── package.json                   # 固定 PDF.js 版本与维护命令
```

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

## 免责声明

本站为非官方学生共建项目，不代表沈阳化工大学官方立场。本站内容仅供参考，不构成任何官方承诺或办事依据。学校政策、课程安排、收费标准、考试要求、学籍管理和毕业要求均以学校及学院最新正式通知为准。

---

<div align="center">

**由学生整理，为学生服务。**

主站：<https://www.syuct.top/>

</div>
