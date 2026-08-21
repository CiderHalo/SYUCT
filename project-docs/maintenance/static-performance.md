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

## 待改进：HTTP/1.1 下的关键路径

线上（EdgeOne Pages）目前以 HTTP/1.1 提供资源，浏览器的请求优先级不生效，所有并发请求近似平分带宽。用 Chrome 模拟 400 kbps / RTT 300ms 实测课表页时，渲染阻塞的 `assets/styles.css`（41 KB）要到约 3.2 秒才下载完，排在几个 `defer` 脚本之后——首屏其实只需要 HTML 加两个 CSS，约 56 KB。

后续想进一步降低首屏时间，可以考虑（尚未实施）：

- 确认 EdgeOne Pages 能否开启 HTTP/2 或 HTTP/3，这样优先级才会真正起作用；
- 把 `styles.css` 拆成首屏关键样式与其余样式；
- 把仅在用户粘贴课表后才需要的识别脚本改为按需加载（注意 `paste` 事件绑定要在脚本加载前就存在，否则会漏掉首次粘贴）。
