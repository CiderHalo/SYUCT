# 静态站性能维护规则

本项目继续保持纯静态 HTML / CSS / JavaScript，不为性能目的引入 Vue、React 或额外运行时。

## 图片规则

- `assets/campus-map.jpg`、`assets/sports-map.png`、两张快递地图属于信息型高清原图，必须保留，不能为了体积降低文字清晰度。
- 地图/示意图/二维码/地标图使用 `assets/optimized/*.webp` 作为网页显示版本；这些 WebP 采用无损编码，原图仍保留用于高清查看或后续编辑。
- 校园相册使用 `assets/optimized/*-preview.webp` 作为列表预览，最长边不超过 960px；点击图片后仍由 `data-lightbox` 加载原始 JPG。
- 站点图标按用途分尺寸，不要直接引用 86 KB 的 `assets/syuct-community-icon.png`：
  - `assets/favicon-32.png`（约 3 KB）用于 `rel="icon"`；
  - `assets/apple-touch-icon.png`（180px）用于 iOS 添加到主屏，正常访问不会请求；
  - `assets/optimized/syuct-community-icon.webp` 为 96px、质量 88 的顶栏品牌图（顶栏最大只显示 38px）。
  - 原图 `assets/syuct-community-icon.png` 保留作为以上三者的生成源。
- 新增或替换相关图片后，可运行 `python3 scripts/build-web-images.py` 重新生成显示版本。脚本需要 ImageMagick 7。

## HTML 加载规则

- 顶栏必须在每个页面的 HTML 里内联写好，`assets/app.js` 只在标记缺失时兜底渲染。不要把顶栏改回 `<header id="topbar"></header>` 空壳，否则首屏要等 `app.js` 下载执行后才出现。
- 首屏地标与站点图标不要懒加载。
- 大地图、相册等非首屏图片使用 `loading="lazy"`、`decoding="async"` 和 `fetchpriority="low"`。
- `<img>` 保留 `width` / `height`，让浏览器提前计算比例，减少页面跳动。
- 首页主视觉图片只 preload 一次。

## 缓存

`edgeone.json` 只对 `/assets/*` 和 `/docs/*` 设置较短的浏览器缓存；HTML 沿用 EdgeOne Pages 默认的新鲜度策略。CSS / JS 已通过 `?rev=` 查询参数进行缓存失效。

## 自动检查

Pull Request 或 main 分支相关资源变化时，`Static performance audit` 会运行：

```bash
python3 scripts/audit-static-assets.py
node tests/timetable-converter.test.js
```

检查内容包括图片引用、尺寸属性、重资源懒加载、重复 preload、高清地图原图保留、优化资源是否存在，以及共享 CSS / JS 的体积预算。

## 首屏瓶颈：连接建立，不是资源体积

2026-08-21 用 Chrome DevTools 协议实测线上 `timetable-converter.html`（禁用缓存、模拟 4G），结论是**首屏时间主要花在 TLS 连接建立上，不在 CSS / JS 体积上**：

| 项目 | 实测 |
| --- | --- |
| Brotli | 已开启，`styles.css` 41 KB 实际只传 9.4 KB |
| 边缘缓存 | `EO-Cache-Status: Cache Hit` |
| ALPN 协商结果 | `http/1.1`（TLS 1.3，但没有协商到 h2） |
| TLS 握手 | 780 ms ~ 2040 ms，波动很大 |
| 首字节 | 1285 ms ~ 3021 ms |

因为是 HTTP/1.1，一个页面的 19 个请求要挤 6 条并发连接，**每条连接都要各自做一次 TLS 握手**，握手慢会被放大数倍。

所以优化优先级是：

1. **在 EdgeOne 控制台确认能否开启 HTTP/2 / HTTP/3**，这是收益最大且不用改代码的一项，预计首屏再降 30%~50%。若 EdgeOne Pages 不支持，可考虑把自定义域名接到 EdgeOne CDN。
2. 控制请求数量（合并零散 JS、复用已有 CSS）。在 HTTP/1.1 下减少请求数比压缩字节更有效；一旦开启 HTTP/2，这项的收益就很小了。
3. 继续避免大体积图片进入首屏（见上文站点图标规则）。这类改动已带来实测收益：课表页 FCP 从 3080 ms 降到 2206 ms，总传输 288 KB 降到 157 KB。

不建议做的：拆分 `assets/styles.css`。它压缩后只有 9.4 KB，拆分带来的额外请求在 HTTP/1.1 下反而更亏。

> 注意测量方法：`python3 -m http.server` 不做 gzip / brotli，用它测出来的 CSS、JS 体积会被显著高估，据此判断瓶颈会得出错误结论。要评估真实表现，必须测线上域名，或使用会压缩的本地服务。
