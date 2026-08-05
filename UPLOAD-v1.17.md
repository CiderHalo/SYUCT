# SYUCT v1.17 上传说明

1. 解压本增量包。
2. 将解压后的全部内容上传到 GitHub 仓库根目录，并覆盖同名文件。
3. `docs/previews/`、`assets/office-preview-manifest.json`、`assets/app-v117.js` 和 `assets/styles-v117.css` 不能漏传。
4. `.github/workflows/build-office-previews.yml` 用于以后自动生成 Office 预览。如果浏览器拖拽跳过隐藏目录，请在 GitHub 中使用 “Add file → Create new file”，按该完整路径创建。
5. 等待 GitHub Pages 与 EdgeOne 部署最新提交后再测试。

当前 22 份 `.doc`、`.docx`、`.xls`、`.xlsx` 文件均已有本地 PDF 预览；下载按钮仍会下载原始 Office 文件。
