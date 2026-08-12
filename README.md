# SYUCT 首页 GitHub 项目行内信息（v1.30）

本补丁基于你上一版“GitHub Star / Fork 静态统计”方案继续调整，主要用于首页首屏 Hero 区。

## 本次改动

1. 首页 Hero 元信息改为单行优先展示：
   - 非官方机构-学生共建网站
   - 资料整理至 2026-08
   - GitHub project ★ Star · ⑂ Fork
2. 其中 `GitHub project` 直接链接到：
   - <https://github.com/CiderHalo/SYUCT>
3. GitHub Star / Fork 继续读取本地 `assets/github-stats.json`，不会让每个访客直接请求 GitHub API。
4. 手机端做了响应式优化：
   - 桌面端尽量单行显示
   - 小屏自动压缩间距和字号
   - 必要时仅在移动端换行为两行，避免挤坏布局
5. 修正首页里旧仓库链接，统一改为新仓库地址。

## 需覆盖 / 新增文件

- `index.html`
- `assets/app.js`
- `assets/styles.css`
- `assets/github-stats.json`
- `.github/workflows/update-github-stats.yml`

## 说明

如果你仓库里已经有上一版 GitHub stats 工作流，这次直接覆盖即可。

如果你只想改首页这一行，但不想动工作流，也可以只覆盖：

- `index.html`
- `assets/app.js`
- `assets/styles.css`

## 当前文案

首页这一行显示为：

`非官方机构-学生共建网站    资料整理至 2026-08    GitHub project ★ 9 · ⑂ 1`

其中 Star / Fork 后续会由 GitHub Actions 自动刷新。
