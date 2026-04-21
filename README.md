# lxfight 个人博客

这是一个部署在 GitHub Pages 上的静态博客站点，现在改成了 Markdown-first 工作流：

- 文章内容写在 `posts-md/*.md`
- 构建脚本自动生成 `posts/*.html`
- 首页 `index.html` 和博客列表页 `blog.html` 也会根据 Markdown 元数据自动更新

## 技术栈

- HTML5
- CSS3
- Node.js
- Markdown + Front Matter
- GitHub Pages

## 本地使用

1. 安装依赖

```bash
npm install
```

2. 构建静态页面

```bash
npm run build
```

3. 开发时监听 Markdown 和模板变化

```bash
npm run dev
```

构建完成后，下面这些文件都会保持为纯静态资源，可直接部署到 GitHub Pages：

- `index.html`
- `blog.html`
- `posts/*.html`
- `styles.css`
- `posts.json`

## 内容维护方式

新增文章时，只需要在 `posts-md/` 目录下创建 Markdown 文件并补充 Front Matter，例如：

```markdown
---
title: 文章标题
date: "2026-04-21"
category: 技术分享
excerpt: 文章摘要，会用于首页和博客列表展示。
tags:
  - 标签1
  - 标签2
featured: true
badge: 精选
---

这里开始写正文。
```

执行 `npm run build` 后，构建脚本会自动：

- 生成对应文章页到 `posts/`
- 按日期排序更新首页文章区块
- 更新博客列表页
- 输出文章元数据清单 `posts.json`

## 目录结构

```text
├── about.html             # 关于页面
├── blog.template.html     # 博客列表模板
├── build.js               # 构建脚本
├── index.template.html    # 首页模板
├── posts/                 # 生成后的文章页
├── posts-md/              # Markdown 内容源
├── posts.json             # 构建生成的文章元数据
├── styles.css             # 样式文件
└── template.html          # 文章详情页模板
```

## 部署说明

这个项目仍然是纯静态站点，不需要服务端。只要把仓库推到 GitHub Pages，对外提供的仍然是预生成好的 HTML、CSS 和 JSON 文件。

## 自动发布

仓库已经加入 GitHub Actions 工作流：

- 工作流文件：`.github/workflows/deploy-pages.yml`
- 触发条件：推送到 `main`，或在 Actions 页面手动执行
- 执行动作：安装依赖、运行 `npm run build`、打包站点静态文件、发布到 GitHub Pages

第一次启用时，还需要在 GitHub 仓库页面做一次设置：

1. 打开仓库 `Settings`
2. 进入 `Pages`
3. 在 `Build and deployment` 的 `Source` 里选择 `GitHub Actions`

之后每次 `git push origin main`，GitHub 就会自动构建并发布。

## 访问地址

https://lxfight.github.io
