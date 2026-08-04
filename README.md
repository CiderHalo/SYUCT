# 沈阳化工大学校园指南（SYUCT Campus Guide）v1.4

一个可直接部署到 GitHub Pages 和 EdgeOne Pages 的非官方学生共建资料站。

## v1.4 更新：长期维护的本地 PDF.js

- PDF 阅读器、Web Worker、CMap、ICC、标准字体和 WASM 资源均由本站 `assets/pdfjs/` 提供。
- 网页运行时不依赖 jsDelivr、unpkg、cdnjs 等外部 CDN。
- PDF 按需读取并只渲染当前页；支持翻页、页码跳转、缩放、适合宽度、密码文档和下载原文件。
- 固定使用 `pdfjs-dist` 6.2.108，避免外部“最新版”变化导致网站突然失效。
- GitHub Actions 只在安装或升级 PDF.js 时运行一次，并把所需运行文件提交到仓库；EdgeOne 仍按普通静态站点部署。
- v1.3 的 `assets/pdf-previews/` 和 `assets/pdf-preview-manifest.json` 已废弃。

## 第一次部署 v1.4

请阅读 [`LOCAL-PDFJS-INSTALL.md`](LOCAL-PDFJS-INSTALL.md)。首次上传后需要等待 GitHub Actions 生成 `assets/pdfjs/`。

## 以后新增 PDF

将 PDF 上传到 `docs/`，再添加下面的链接即可：

```html
<a href="pdf-viewer.html?file=docs/new-guide.pdf&title=新资料名称" target="_blank" rel="noreferrer">在线预览</a>
```

无需生成预览图，也无需修改清单文件。

## 已包含

- 首页大图、站内搜索、深浅色切换与移动端侧栏
- 新生入学、校园地图与体育课地图
- 统一身份认证、WebVPN、CARSI、图书馆服务
- 培养方案、选修要求、微专业、期末真题
- 重修、查卷、奖学金、毕业资格、论文模板与查重
- 校历、体测、校园跑、学生管理规定
- 资料下载中心与 QQ 群二维码弹窗

## 静态部署设置

GitHub Pages 使用 `main` 分支和 `/ (root)`；EdgeOne 使用仓库根目录 `/`，构建命令、安装命令均留空，输出目录为 `/`。

## 说明

本站为非官方学生共建站。政策、收费、考试、学籍和毕业要求以学校及学院当年正式通知为准。
