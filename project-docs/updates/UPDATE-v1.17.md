# v1.17 更新说明

## 本地 Word / Excel 在线预览

- 为仓库中的 `.doc`、`.docx`、`.xls`、`.xlsx` 生成本站本地 PDF 预览。
- 22 份现有 Office 文档均已生成预览，原文件继续保留下载入口。
- 全站根据 `assets/office-preview-manifest.json` 自动为 Office 下载链接添加“预览”按钮。
- 预览页面仍使用本地 PDF.js，不连接第三方 Office 在线阅读服务。
- PDF 阅读页新增 `source` 参数，预览 Office 转换文件时，“下载原文件”会下载 Word 或 Excel 源文件，而不是转换后的 PDF。

## 长期维护

- 新增 `scripts/build-office-previews.py`。
- 新增 GitHub Actions 工作流 `Build local Office previews`。
- 后续向 `docs/` 上传 Word 或 Excel 文件后，工作流会自动转换、更新清单并触发重新部署。

## 限制

复杂公式、宏、图表、特殊字体和精确分页可能与 Microsoft Office 有差异，正式填写或核对时请下载原文件。
