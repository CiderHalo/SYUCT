# SYUCT 校园指南 v1.6 更新说明

## 本次更新

新增并优化 3 张校园风景照片：

- `assets/gallery-campus-dusk.jpg`：雨后晚霞广场，作为首页校园一览首图。
- `assets/gallery-stadium-reflection.jpg`：体育场倒影，作为校园地图页校园实景首图。
- `assets/gallery-tree-path.jpg`：校园林荫小路，作为校园生活页校园相册首图。

涉及页面：

- `index.html`
- `map.html`
- `campus.html`
- `README.md`

图片已压缩为适合网页加载的渐进式 JPEG，并加入 `loading="lazy"` 与 `decoding="async"`。

## 增量包上传方法

将增量包解压后，把其中所有文件上传到 GitHub 仓库根目录并覆盖同名文件。

增量上传后，下面 3 个旧文件已不再被页面引用，可以在 GitHub 中手动删除以保持仓库整洁：

```text
assets/gallery-campus-night.jpg
assets/gallery-dorm-night.jpg
assets/gallery-study-room.jpg
```

不删除也不会影响网站运行，只会占用少量仓库存储空间。

## 缓存刷新

EdgeOne 或浏览器仍显示旧图时，等待最新部署完成后使用 `Ctrl + F5` 强制刷新。移动端可以清理浏览器缓存，或在网址末尾临时添加 `?v=16`。
