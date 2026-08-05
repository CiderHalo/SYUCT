# 本地 Word / Excel 预览维护说明

本站不把 Word、Excel 文件发送到第三方在线文档服务，而是使用 LibreOffice 将原文件转换为本地 PDF 预览，再交给站内 PDF.js 阅读器显示。

## 支持格式

- Word：`.doc`、`.docx`
- Excel：`.xls`、`.xlsx`

原始文件保留在 `docs/`，转换后的 PDF 保存在 `docs/previews/`。预览清单为：

```text
assets/office-preview-manifest.json
```

## 新增 Office 文件

1. 将文件上传到 `docs/`。
2. 在对应页面添加指向原文件的普通下载链接。
3. GitHub Actions 的 `Build local Office previews` 会自动转换文件、更新清单并提交预览 PDF。
4. EdgeOne 会检测到自动提交并重新部署。

全站脚本会根据预览清单自动在下载链接旁添加“在线预览”，不需要手动编写预览地址。

## 本地生成

电脑已安装 LibreOffice 与 Python 3 时，在仓库根目录运行：

```bash
python scripts/build-office-previews.py
```

Windows 若无法自动找到 LibreOffice，可设置：

```text
LIBREOFFICE_BIN=C:\Program Files\LibreOffice\program\soffice.exe
```

## 注意事项

- 预览属于转换结果，复杂公式、宏、动画、特殊字体和精细分页可能与 Microsoft Office 有差异。
- 需要填写、修改或完整核对格式时，应下载原文件。
- 大型 Excel 可能转换为较多 PDF 页面，首次打开会比普通文档慢。
