# v1.26 静态资源重构、校园全景与老校门地标

发布日期：2026-08-06

本版集中整理静态资源命名，并补充校园全景与校园地标内容。页面资料、搜索、PDF 阅读和 Office 本地预览逻辑保持不变。

## 1. 静态资源固定命名

此前仓库会在每次更新时增加新的版本文件，例如：

```text
app-v119.js
app-v122.js
app-v123.js
styles-v121.css
styles-v124.css
```

从本版开始，全站统一使用固定文件名：

```text
assets/app.js
assets/styles.css
```

地标插画同样使用固定语义化名称：

```text
assets/landmark-motto-stone.png
assets/landmark-dragon-gate.png
assets/landmark-library.png
assets/landmark-old-school-gate.png
assets/landmark-chemical-pyramid.png
```

页面使用查询参数刷新浏览器和 CDN 缓存：

```html
<link href="assets/styles.css?rev=20260806" rel="stylesheet">
<script defer src="assets/app.js?rev=20260806"></script>
```

后续更新时覆盖固定文件，并修改 `rev` 参数即可，不再继续创建 `app-v*.js`、`styles-v*.css` 或带版本号的地标图片。

## 2. 清理无引用的旧版资源

- 删除已被当前页面替代的旧版 JavaScript 和 CSS 文件。
- 删除已被最终地标插画替代的历史图片版本。
- 保留 `assets/pdfjs/`、`pdf-viewer.js`、`pdf-viewer.css`、`icons/`、校园地图、校园相册和 Office 预览相关文件。
- 修正所有 HTML 页面及脚本内部引用，避免删除旧文件后出现页面失去样式的问题。

## 3. 校园地图加入官方全景

`map.html` 新增学校官网提供的 720 云校园全景入口，并将页面内容顺序调整为：

1. 官方校园全景
2. 高清校园总图
3. 体育课专用地图
4. 校园实景

全景区域支持：

- 页面内拖动浏览和场景热点跳转
- `iframe` 延迟加载，减少首次打开页面的流量消耗
- 桌面端 16:9、移动端 4:3 的响应式比例
- 新窗口全屏浏览备用入口
- 页面目录锚点导航

全景内容来自外部服务，实际可用性和展示内容以原发布页面为准。

## 4. 办事大厅加入老校门地标

`services.html` 页首加入“校园地标 · 老校门”插画：

- 保留老校门中间通道完全开放的真实结构
- 黑色栅栏仅连接主石柱与两侧小石柱，不跨越中央通道
- 右侧石柱牌匾文字为“沈阳化工学院”
- 使用透明 PNG，并复用全站统一地标页首容器和响应式尺寸
- 点击地标可前往校园相册

完成后，五个主要内容页面拥有统一的校园地标页首：

| 页面 | 校园地标 |
|---|---|
| 新生入学 | 校训石 |
| 校园地图 | 龙门 |
| 学业资料 | 图书馆 |
| 办事大厅 | 老校门 |
| 校园生活 | 化学金字塔 |

## 5. 文档同步

- 根目录 `README.md` 更新至 v1.26。
- 项目结构中的 `app-v117.js`、`styles-v117.css` 改为实际使用的 `app.js`、`styles.css`。
- README 增加校园全景、固定资源命名和地标维护说明。
- `project-docs/updates/README.md` 补充 v1.22 至 v1.26 的索引。
- `package.json` 版本同步为 `1.26.0`。

## 6. 未改变的功能

本版没有改变以下功能的使用方式：

- 全站搜索和资料下载页筛选
- 本地 PDF.js 在线阅读
- Word、Excel 自动转换为本地 PDF 预览
- EdgeOne Pages 主站和 GitHub Pages 备用站部署
- 深浅色模式、移动侧栏和校园相册灯箱

## 发布后检查

部署完成后建议按 `Ctrl + F5` 强制刷新，并重点检查：

- 首页和所有内容页是否正常加载 `styles.css`、`app.js`
- 新生入学、校园地图、学业资料、办事大厅和校园生活页的地标图片
- 校园全景能否加载，以及新窗口入口是否可用
- 搜索、PDF 阅读和 Office 在线预览是否正常
