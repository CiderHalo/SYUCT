# v1.4 本地 PDF.js：一次性安装说明

这一版把 PDF 阅读器改为真正的本地 PDF.js。网页运行时只访问本仓库中的 `assets/pdfjs/`，不再连接 jsDelivr、unpkg 或其他外部 CDN。

## 第一次安装

1. 解压 `SYUCT-Guide-v1.4-local-pdfjs-patch.zip`。
2. 将解压后的全部内容上传到 GitHub 仓库根目录并覆盖同名文件。
3. 确认仓库中能看到以下文件：

```text
.github/workflows/vendor-pdfjs.yml
scripts/vendor-pdfjs.mjs
package.json
pdf-viewer.html
assets/pdf-viewer.mjs
assets/pdf-viewer.css
```

4. 打开 GitHub 仓库顶部的 **Actions**。
5. 等待 **Vendor local PDF.js** 变成绿色。它会自动安装固定版本 `6.2.108`，把浏览器运行文件复制到 `assets/pdfjs/`，然后提交回 `main` 分支。
6. 回到仓库确认出现：

```text
assets/pdfjs/
  pdf.min.mjs
  pdf.worker.min.mjs
  cmaps/
  iccs/
  standard_fonts/
  wasm/
  VERSION.txt
```

7. 等 EdgeOne 检测到这次自动提交并完成第二次部署，再测试 PDF 在线预览。工作流也会尝试主动请求 GitHub Pages 重新构建。浏览器可强制刷新，或在预览地址末尾临时加 `&v=14`。

## Actions 无法提交时

进入：

```text
仓库 Settings
→ Actions
→ General
→ Workflow permissions
→ Read and write permissions
→ Save
```

然后回到 Actions，打开 **Vendor local PDF.js**，点击 **Run workflow** 重新运行。

如果主分支开启了保护规则、不允许机器人直接推送，也需要暂时允许 GitHub Actions 写入，或在 Actions 生成后手动合并相应提交。若 GitHub Pages 仍显示旧版，手动在 README 末尾加一个空格并提交一次，即可触发分支发布。

## 以后新增 PDF

只需要两步：

1. 上传原文件，例如 `docs/new-guide.pdf`。
2. 在资料页面加入：

```html
<a href="pdf-viewer.html?file=docs/new-guide.pdf&title=新资料名称" target="_blank" rel="noreferrer">在线预览</a>
```

不再制作图片预览，不再修改 manifest，也不需要再次运行 PDF.js 安装流程。

## 更新 PDF.js

需要升级时，仅修改 `package.json` 中 `pdfjs-dist` 的固定版本号，并同步修改 `assets/pdf-viewer.mjs` 顶部的 `PDFJS_VERSION`。提交后工作流会重新生成本地运行文件。

## EdgeOne 设置

仍然是纯静态站点：构建命令和安装命令继续留空，输出目录使用 `/`。`node_modules` 不会部署到网站，只有工作流复制出的 `assets/pdfjs/` 会进入站点。
