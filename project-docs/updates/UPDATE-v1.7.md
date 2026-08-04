# SYUCT Guide v1.7 — EdgeOne PDF 阅读器修复

## 修复内容

1. 修复 `pdf-viewer.html` 与阅读器脚本的元素不一致：旧页面仍使用 `pageSprite` 图片元素，而新脚本需要 `pdfCanvas` 画布。
2. PDF.js 核心模块和 Worker 同时发布为 `.js`，阅读器改用 `pdf.min.js` 与 `pdf.worker.min.js`。
3. 增加 20 秒加载超时。部署未包含 PDF.js 时不再无限转圈，而会显示明确错误。
4. 增加阅读器缓存版本号，避免浏览器继续使用旧脚本。

## 上传步骤

将增量包解压后的全部内容上传到仓库根目录并覆盖同名文件。

上传后，GitHub Actions 中的 `Vendor local PDF.js` 会再次运行。等待绿色成功，并确认：

- `assets/pdfjs/pdf.min.js`
- `assets/pdfjs/pdf.worker.min.js`

已经出现。随后在 EdgeOne 的“构建部署”中重新部署 `main` 最新提交。若 EdgeOne 没有自动部署机器人提交，可在 GitHub 网页随便编辑 `README.md` 增加一个空格并提交，以触发一次普通 push。

部署后用 `Ctrl + F5` 强制刷新。
