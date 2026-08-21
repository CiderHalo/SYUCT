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

## 首屏性能实测记录

### 2026-08-22：已开启 HTTP/2，瓶颈转移到图片体积

EdgeOne 控制台开启 HTTP/2 后（ALPN 已能协商到 `h2`），连接开销大幅下降：

| 指标 | HTTP/1.1 | HTTP/2 |
| --- | --- | --- |
| 新建 TLS 连接 | 12 次，握手合计 2558 ms | **1 次，224 ms** |
| 课表页整页完成 | 约 6.0 s | **约 2.6 s** |

因为所有请求复用一条连接，**请求数量已经不再是瓶颈**。当前剩下的最大问题是首页图片体积：

- `assets/hero-campus.jpg` 实测传输 407 KB，且带 `rel="preload" fetchpriority="high"`，是首页最大的单项开销；
- 仓库里已存在 `assets/optimized/hero-campus-preview.webp`（181 KB）但首页没有使用；
- 相比之下全部 10 个导航图标合计只有 6 KB，属于噪声，不值得为它做内联。

下一步值得做的是首页主视觉改用 WebP（配合 `<picture>` 保留 JPG 兜底），预计再省 200 KB 以上。

### 2026-08-21：HTTP/1.1 时期的测量（已过时，保留结论备查）

当时 ALPN 只能协商到 `http/1.1`，19 个请求要挤 6 条并发连接、每条各做一次 TLS 握手，握手慢会被放大数倍。那个阶段减少请求数比压缩字节更有效；开启 HTTP/2 后这个结论已经不再适用。

同期确认的两件事仍然有效：

- Brotli 一直是开启的，`styles.css` 41 KB 实际只传 9.4 KB，所以**不要**去拆分 `styles.css`；
- 边缘缓存正常（`EO-Cache-Status: Cache Hit`）。

站点图标瘦身带来的实测收益：课表页 FCP 从 3080 ms 降到 2206 ms，总传输 288 KB 降到 157 KB。

> 测量方法上的坑：`python3 -m http.server` 既不做 gzip / brotli、也不是 HTTPS/HTTP2，用它测出来的体积会被显著高估、连接开销会被完全忽略。据此判断瓶颈会得出错误结论——本文档 08-21 版就犯过这个错。要评估真实表现，必须直接测线上域名。
