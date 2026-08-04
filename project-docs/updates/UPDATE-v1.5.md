# SYUCT 校园指南 v1.5 更新说明

## 本版内容

- 首页“常用入口”已改为本科新生、硕士新生高频问题。
- 新增 10 份公开资料，文档总数由 31 份增至 41 份。
- 更新学业资料、办事大厅、校园生活、资料下载与站内搜索。
- PDF 仍使用 v1.4 已安装的本地 PDF.js，无需重新安装或重新生成预览。

## 上传方法

将增量包解压后的内容上传到 GitHub 仓库根目录，覆盖同名文件。不要删除现有 `assets/pdfjs/`。

重点确认：

```text
index.html
freshman.html
academics.html
services.html
campus.html
resources.html
assets/app.js
docs/（新增 10 份文件）
README.md
```

提交后，GitHub Pages 与 EdgeOne 会自动重新部署。部署成功后可用 `Ctrl + F5` 强制刷新。

## 未纳入的文件

`体育老师联系方式.pdf` 含多位教师个人手机号，未放入公开仓库。建议通过学校官方渠道、学院通知或内部群获取最新联系方式。
