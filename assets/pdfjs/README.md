# 本地 PDF.js 尚待生成

上传 v1.4 后，GitHub Actions 工作流 `Vendor local PDF.js` 会用固定版本 pdfjs-dist 6.2.108 自动替换本文件夹，并提交真正的运行文件。

阅读器正常部署后，本文件会被删除，目录中会出现 `pdf.min.mjs`、`pdf.worker.min.mjs`、`cmaps/`、`iccs/`、`standard_fonts/` 和 `wasm/`。
