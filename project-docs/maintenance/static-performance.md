# 静态站性能维护规则

本项目继续保持纯静态 HTML / CSS / JavaScript，不为性能目的引入 Vue、React 或额外运行时。

## 图片规则

- `assets/campus-map.jpg`、`assets/sports-map.png`、两张快递地图属于信息型高清原图，必须保留，不能为了体积降低文字清晰度。
- 地图/示意图/二维码/地标图使用 `assets/optimized/*.webp` 作为网页显示版本；这些 WebP 采用无损编码，原图仍保留用于高清查看或后续编辑。
- 校园相册使用 `assets/optimized/*-preview.webp` 作为列表预览，最长边不超过 960px；点击图片后仍由 `data-lightbox` 加载原始 JPG。
- 新增或替换相关图片后，可运行 `python3 scripts/build-web-images.py` 重新生成显示版本。脚本需要 ImageMagick 7。

## HTML 加载规则

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
