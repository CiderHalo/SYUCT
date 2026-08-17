<div align="center">

# 沈阳化工大学校园指南

**SYUCT Campus Guide · 学生共创版**

把分散的新生通知、校园地图、学业资料、办事表格和校园经验，整理成一个更容易查找和使用的校园信息站。

**当前版本：v260817**

[访问主站](https://www.syuct.top/) · [资料下载](https://www.syuct.top/resources.html) · [参与共建](https://www.syuct.top/about.html) · [SYUCT 组织](https://github.com/SYUCT)

</div>

---

## 项目简介

**沈阳化工大学校园指南（SYUCT Campus Guide）** 是一个由学生维护的非官方校园信息整理项目。

学校通知、学院文件、培养方案、办事表格、校园地图和同学经验往往分散在不同网站、群聊和文件中。本项目希望将常用信息重新整理、分类和汇总，让新生和在校生能够更方便地找到需要的内容。

本站主要面向：

- 本科新生
- 研究生新生
- 在校学生
- 希望参与校园资料整理和共建的同学

> 本站为非官方学生共建项目，不隶属于沈阳化工大学。涉及学校政策、收费、考试、学籍、培养方案、毕业要求等内容，请始终以学校及学院当年正式通知为准。

## 当前版本

**v260817**

自本版本起，网页版本号统一采用日期格式：

```text
vYYMMDD
```

例如：

```text
v260817 = 2026-08-17
```

不再使用 `v1.32`、`v1.33` 一类连续小版本号。

### v260817 更新

- 网站代码仓库迁移至 `SYUCT/SYUCT-web`
- 修正网页中的 GitHub 仓库与 SYUCT 组织入口
- 资料下载页移动端分类栏改为单行横向滑动，减少筛选区占用高度
- 持续优化移动端筛选按钮的触摸体验
- 根目录 README 同步更新仓库地址、组织入口和版本号规则

## 网站入口

| 入口 | 地址 |
| --- | --- |
| 校园指南主站 | <https://www.syuct.top/> |
| 资料下载 | <https://www.syuct.top/resources.html> |
| 关于共建 | <https://www.syuct.top/about.html> |
| GitHub 仓库 | <https://github.com/SYUCT/SYUCT-web> |
| GitHub Pages | <https://syuct.github.io/SYUCT-web/> |
| SYUCT 学生团队 | <https://github.com/SYUCT> |
| 致谢名单 | <https://www.syuct.top/docs/syuct-acknowledgements.pdf> |

## 主要内容

### 新生入学

整理新生报到前后常见信息，包括入学准备、校园生活、常用入口和相关注意事项。

### 校园地图

提供校园地图、快递取件位置、体育课相关地图以及校园全景等导航内容。

### 数字校园

整理统一身份认证、校园网络、WebVPN、CARSI 和学校常用数字服务入口。

### 学业资料

收集和整理培养方案、课程资料、选修要求、创新竞赛、实验室及其他学习相关内容。

### 办事大厅

整理学籍、考试、奖助、毕业、论文等常见校园办事资料与表格。

### 校园生活

包含校历、图书馆、体育健康、学生管理规定、校园相册等内容。

### 资料下载

集中整理 PDF、Word、Excel 等校园常用资料，并提供分类检索、在线预览和原文件下载。

## 网站特性

- 纯静态 HTML、CSS 和 JavaScript
- 无数据库和后端服务
- 支持桌面端与移动端
- 支持深色与浅色模式
- 提供站内搜索
- 资料分类筛选与移动端横向滑动
- PDF 在线阅读
- Word、Excel 本地转换预览
- 校园地图与校园全景
- GitHub Pages 与 EdgeOne Pages 部署
- GitHub Actions 自动维护部分资料预览文件

## 项目结构

```text
SYUCT-web/
├── .github/
│   └── workflows/          GitHub Actions
├── assets/
│   ├── icons/              网站图标
│   ├── pdfjs/              本地 PDF.js
│   ├── app.js              全站交互
│   └── styles.css          全站样式
├── docs/                   校园资料文件
│   └── previews/           Office 文件预览
├── project-docs/           项目维护与更新记录
├── scripts/                自动化维护脚本
├── index.html              首页
├── freshman.html           新生入学
├── map.html                校园地图
├── digital.html            数字校园
├── academics.html          学业资料
├── services.html           办事大厅
├── campus.html             校园生活
├── resources.html          资料下载
├── about.html              关于共建
├── pdf-viewer.html         PDF 阅读器
└── 404.html
```

## 资料维护原则

校园信息具有时效性。

对于以下内容：

- 学校政策
- 学费及其他收费
- 考试安排
- 学籍管理
- 培养方案
- 奖助政策
- 毕业要求
- 校园服务时间
- 快递点位及营业信息

本站仅进行整理和索引，不替代学校正式通知。

如果本站内容与学校、学院最新通知存在差异，请以官方信息为准，并欢迎提交纠错。

## 参与共建

欢迎任何对网站有实际帮助的贡献。

你可以：

- 指出失效链接
- 反馈错误日期或过期信息
- 补充学校和学院公开资料
- 提供培养方案、表格和课程资料
- 分享选课、考试、竞赛、考研、保研和就业经验
- 完善校园地图和办事流程
- 投稿校园照片
- 提交 Issue
- 提交 Pull Request
- 参与网站功能和界面改进

GitHub Issues：

<https://github.com/SYUCT/SYUCT-web/issues>

## 致谢

SYUCT 是一个持续维护的学生共建项目。

感谢所有为网站提供功能建议、Issue 反馈、内容完善、资料补充、测试反馈和社区支持的同学。

实际被采纳或对项目建设产生帮助的贡献，将根据实际情况记录在致谢名单中。

查看完整致谢名单：

<https://www.syuct.top/docs/syuct-acknowledgements.pdf>

致谢名单将持续更新。

## 本地运行

项目没有复杂的构建流程。

克隆仓库：

```bash
git clone https://github.com/SYUCT/SYUCT-web.git
cd SYUCT-web
```

然后使用任意本地 HTTP Server 打开项目即可。

例如使用 Python：

```bash
python -m http.server 8000
```

浏览器访问：

```text
http://localhost:8000/
```

部分 PDF 和 Office 预览功能建议通过 HTTP Server 测试，不建议直接使用 `file://` 打开页面。

## 部署

本站目前为纯静态网站，可部署至 GitHub Pages、EdgeOne Pages 或其他静态网站托管服务。

生产站点：

<https://www.syuct.top/>

主分支：

```text
main
```

## 资料来源与版权

本站资料主要来自：

- 沈阳化工大学及各学院公开发布的信息
- 学校公开网站及服务入口
- 学生整理的公开资料
- 获得授权的同学投稿内容

原始资料仅用于校园信息整理、学习交流和信息索引。

如发现内容侵权、不适合公开、已失效、存在错误，或需要删除、更正，请通过 GitHub Issue 联系项目维护者。

## 免责声明

本站为非官方学生共建项目，不代表沈阳化工大学官方立场，也不构成任何官方承诺或办事依据。

学校政策、课程安排、收费标准、考试要求、学籍管理、奖助政策、培养方案和毕业要求等信息，请以沈阳化工大学及相关学院发布的最新正式通知为准。

---

<div align="center">

**由学生整理，为学生服务。**

SYUCT Campus Guide

<https://www.syuct.top/>

</div>
