# SYUCT 校园社区静态镜像

## 目标

`community.html` 是 GitHub Discussions 的只读静态阅读入口。GitHub 仍是唯一讨论源，本站不提供登录、发帖、点赞或回复功能。

数据源：`https://github.com/orgs/SYUCT/discussions`
源仓库：`SYUCT/SYUCT-web`

## 展示规则

- 展示全部 GitHub 置顶 Discussion。
- 其次展示带「精选」标签的 Discussion，位于置顶与最近讨论之间。
- 另外展示最近活跃的 10 条 Discussion，按 GitHub `updatedAt` 从新到旧排列。
- 三个分组互斥：置顶优先，其次精选，剩下的才进入最近讨论，同一条帖子不会重复出现。
- 点击标题后展开完整正文。正文直接使用 GitHub 渲染好的 `bodyHTML`，经白名单过滤后显示。
- 正文里的每个代码块上方带「复制代码」按钮，复制 `pre` 的 `textContent`，因此折叠在 `<details>` 里的代码也能完整复制。
- 分类 emoji 取 GraphQL 的 `category.emojiHTML`；`assets/community-markdown.js` 还会在前端把残留的 `:shortcode:` 兜底转成 Unicode 字符。
- 每条 Discussion 展示最多 5 条热门评论，以及最多 5 条最新评论。
- 热门评论按：`赞同 × 3 + reactions × 2 + 直接回复数` 排序。
- 最新评论如果已进入热门评论，会从“最新评论”中去重。
- GitHub 托管的正文/评论图片会尽量下载到 `assets/community-media/`，避免阅读正文时再次依赖 GitHub 图片域名；下载失败时保留原链接。
- 每条帖子末尾保留“前往 GitHub 查看完整讨论”按钮。

## 精选标签

精选分组按标签名匹配，默认认可 `精选` 和 `featured`（忽略大小写）。在 GitHub 上给 Discussion 打标签即可，无需改代码。

需要换用别的标签名时，给工作流加环境变量：

```yaml
COMMUNITY_FEATURED_LABELS: "精选,featured,置顶推荐"
```

## 自动同步

工作流：`.github/workflows/update-community.yml`
脚本：`scripts/update-community.mjs`
数据：`assets/community.json`（`schemaVersion: 2`，分 `pinned` / `featured` / `recent` 三组）

计划任务：

```yaml
cron: "17 * * * *"
```

即每小时第 17 分钟检查一次，避开整点附近的 GitHub Actions 拥堵。

脚本会比较实际社区内容。没有变化时不会修改 `community.json` 的 `generatedAt`，也不会创建提交或 Pull Request。

## GitHub App 身份

自动发布使用专用 GitHub App：`SYUCT Community Bot`，不依赖仓库内置 `GITHUB_TOKEN` 创建或批准 PR 的全局开关。

仓库 Actions 配置需要存在：

- Repository variable：`COMMUNITY_APP_CLIENT_ID`
- Repository secret：`COMMUNITY_APP_PRIVATE_KEY`

工作流使用官方 `actions/create-github-app-token@v3` 生成有效期约 1 小时的 installation token。App 私钥不会写入仓库或输出日志。

GitHub App 至少需要安装到 `SYUCT-web`，并具有：

- Contents：Read and write
- Pull requests：Read and write
- Discussions：Read-only
- Metadata：Read-only

## main 分支保护与 Bypass

`main` 仍保持“必须通过 Pull Request”规则。自动同步不会直接 push `main`，而是：

1. Actions 使用 `SYUCT Community Bot` installation token 读取 Discussions。
2. 有变化时创建短期 `automation/community-mirror-*` 分支。
3. 以 Community Bot 身份创建 PR。
4. 以 Community Bot 身份 squash merge。
5. 删除短期分支。

为了免除每小时人工批准，需要在保护 `main` 的 Ruleset 中把 `SYUCT Community Bot` 加入 **Bypass list**，模式设为 **For pull requests only**。

这样普通贡献者仍然必须人工审核；机器人仍必须创建 PR，但它可以绕过该 PR 的人工批准要求。工作流不会使用 bypass 直接 push `main`。

## 手动检查

本地仅检查筛选逻辑：

```bash
npm run community:test
```

本地实际拉取数据需要 GitHub token：

```bash
GITHUB_TOKEN=... npm run community:update
```

GitHub 上也可以进入：

`Actions > Update community mirror > Run workflow`

手动运行一次。

## 安全策略

前端不会直接信任 GitHub 返回的 HTML。`assets/community.js` 使用标签和属性白名单二次过滤后再显示正文与评论；链接只允许 http/https/mailto，本地缓存图片限制为 `assets/community-media/`。

社区页只是阅读镜像。任何发帖、回复、投票、编辑、删除等操作始终跳转 GitHub 原始社区完成。
