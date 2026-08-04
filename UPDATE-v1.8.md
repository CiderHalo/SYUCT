# SYUCT Guide v1.8 — PDF 阅读器入口修复

## 原因

v1.7 虽然把 PDF.js 核心文件复制成了 `.js`，但页面入口仍然加载 `assets/pdf-viewer.mjs`。当前 EdgeOne 环境没有执行这个入口模块，因此页面一直停留在 HTML 的初始“正在准备本地阅读器”状态，脚本里的超时提示也没有机会运行。

## 修复

- 阅读器入口改为 `assets/pdf-viewer.js`，仍以 ES Module 方式执行。
- 使用全新文件名绕过旧的 `.mjs` MIME/缓存问题。
- 修复脚本引用不存在的 `openOriginalButton` 元素。
- 增加独立于模块的 12 秒启动检测；即使入口脚本加载失败，也会显示明确错误，不再无限转圈。

## 上传

将本包解压后的文件上传到仓库根目录并覆盖：

- `pdf-viewer.html`
- `assets/pdf-viewer.js`

旧的 `assets/pdf-viewer.mjs` 可以保留，它已不再被页面引用。

此次改动不需要重新运行 PDF.js 安装工作流；EdgeOne 自动部署最新提交后，使用 `Ctrl + F5` 刷新即可。
