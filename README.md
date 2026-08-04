<div align="center">

# 沈阳化工大学校园指南

**SYUCT Campus Guide**

一个由学生整理、服务学生的非官方校园信息与资料导航站。

[在线访问](https://hanchuang0303.github.io/SYUCT/) · [资料下载](https://hanchuang0303.github.io/SYUCT/resources.html) · [关于共建](https://hanchuang0303.github.io/SYUCT/about.html)

</div>

---

## 项目简介

学校通知、学院表格、培养方案、群文件和老生经验往往分散在不同入口。这个项目将常用校园信息重新分类，帮助沈阳化工大学新生和在校生更快找到需要的资料，以及明确“下一步该做什么”。

本站不替代学校官网，也不代表学校官方立场。涉及政策、收费、考试、学籍和毕业要求的内容，请以学校及学院当年正式通知为准。

## 主要内容

| 栏目 | 内容 |
| --- | --- |
| 新生入学 | 报到准备、入学流程、新生指南和常见问题 |
| 校园地图 | 校园地图、体育课地图和地点导航 |
| 数字校园 | 统一身份认证、校园网络、WebVPN、CARSI 和电子资源 |
| 学业资料 | 培养方案、选修要求、微专业、课程资料和期末真题 |
| 办事大厅 | 常用表格、重修、查卷、奖学金、毕业和论文相关流程 |
| 校园生活 | 校历、体测、校园跑、图书馆和学生管理规定 |
| 资料下载 | PDF、Word、Excel 等资料的分类下载与在线预览 |

## 网站特性

- 纯静态 HTML、CSS 和 JavaScript，无需服务器数据库
- 支持 GitHub Pages 与 EdgeOne Pages 部署
- 支持桌面端和移动端自适应
- 支持站内搜索、深浅色模式和移动端侧栏
- PDF.js 完全本地托管，不依赖 jsDelivr、unpkg 等外部 CDN
- PDF 支持在线阅读、缩放、翻页、页码跳转和原文件下载
- 原始资料统一存放在 `docs/`，便于长期维护和更新

## 在线地址

- GitHub Pages：<https://hanchuang0303.github.io/SYUCT/>
- GitHub 仓库：<https://github.com/hanchuang0303/SYUCT>

EdgeOne 入口可在完成长期域名配置后补充到这里。

## 项目结构

```text
SYUCT/
├── .github/
│   └── workflows/
│       └── vendor-pdfjs.yml      # 自动安装并保存本地 PDF.js
├── assets/
│   ├── pdfjs/                    # 本地 PDF.js 运行文件
│   ├── app.js                    # 网站交互逻辑
│   ├── styles.css                # 全站样式
│   ├── pdf-viewer.mjs            # PDF 阅读器逻辑
│   └── pdf-viewer.css            # PDF 阅读器样式
├── docs/                         # PDF、Word、Excel 等资料原文件
├── scripts/
│   └── vendor-pdfjs.mjs          # PDF.js 本地化脚本
├── index.html                    # 首页
├── freshman.html                 # 新生入学
├── map.html                      # 校园地图
├── digital.html                  # 数字校园
├── academics.html                # 学业资料
├── services.html                 # 办事大厅
├── campus.html                   # 校园生活
├── resources.html                # 资料下载
├── about.html                    # 关于共建
├── pdf-viewer.html               # PDF 在线阅读页
└── package.json                  # 固定 PDF.js 版本与维护命令
```

## 本地 PDF.js

项目使用固定版本的 `pdfjs-dist`，并通过 GitHub Actions 将浏览器运行文件复制到：

```text
assets/pdfjs/
├── pdf.min.mjs
├── pdf.worker.min.mjs
├── cmaps/
├── iccs/
├── standard_fonts/
└── wasm/
```

因此用户打开 PDF 时，阅读器组件与 PDF 文件均由本站提供，不会因外部 CDN 访问不稳定而卡住。

在仓库的 **Actions** 页面中，应当能够看到名为：

```text
Vendor local PDF.js
```

的工作流。首次运行完成后，仓库中应出现由 `github-actions[bot]` 提交的本地 PDF.js 文件。

## 新增资料

### 新增 PDF

1. 将文件上传到 `docs/`。
2. 在对应页面中添加阅读链接：

```html
<a
  href="pdf-viewer.html?file=docs/example.pdf&title=资料名称"
  target="_blank"
  rel="noreferrer"
>
  在线预览
</a>
```

PDF.js 已经本地安装，后续新增 PDF 不需要重新生成预览图片，也不需要修改预览清单。

### 新增 Word、Excel 或其他文件

将文件上传到 `docs/`，然后在页面中直接添加下载链接：

```html
<a href="docs/example.docx" download>下载资料</a>
```

## 部署说明

### GitHub Pages

仓库设置建议为：

```text
分支：main
目录：/ (root)
```

### EdgeOne Pages

```text
框架预设：Other
根目录：/
输出目录：/
构建命令：留空
安装命令：留空
```

网站本身为纯静态项目，不需要执行 `npm run build`。`package.json` 仅用于固定和维护本地 PDF.js。

## 参与共建

欢迎通过以下方式参与：

- 指出失效链接、错误日期或过期内容
- 补充培养方案、通知、表格、真题和校园地图
- 分享选课、考试、竞赛、考研、保研和就业经验
- 提交 Issue 或 Pull Request 改进网站

2026 沈阳化工大学新生交流群：**1170264357**

## 资料来源与版权

本站资料主要来自学校与学院公开发布内容，以及同学授权投稿。原文件仅用于学习交流与信息整理；如有侵权、失效内容或不适合公开的资料，请通过仓库 Issue 提出处理请求。

## 免责声明

本站为非官方学生共建项目，不隶属于沈阳化工大学。本站内容仅供参考，不构成任何官方承诺或办事依据。学校政策、课程安排、收费标准、考试要求、学籍管理和毕业要求均以学校及学院最新正式通知为准。

---

<div align="center">

由学生整理，为学生服务。

</div>
