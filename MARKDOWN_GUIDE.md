# Markdown 博客使用指南

现在这个站点已经完整支持“Markdown 作为内容源，HTML 作为构建产物”的静态博客流程。

## 工作方式

你只需要维护两类文件：

- `posts-md/*.md`
- 页面模板文件

运行 `npm run build` 之后，构建脚本会自动生成：

- `posts/*.html`
- `index.html`
- `blog.html`
- `posts.json`

## 安装依赖

```bash
npm install
```

## 编写文章

在 `posts-md/` 目录下创建 `.md` 文件，并写入 Front Matter。

```markdown
---
title: 文章标题
date: "2026-04-21"
category: 技术分享
excerpt: 文章摘要，会用于首页和博客列表。
tags:
  - 标签1
  - 标签2
featured: true
badge: 精选
---

这里是正文内容。
```

## 构建

```bash
npm run build
```

## 开发模式

```bash
npm run dev
```

监听模式会在以下文件变化时自动重建：

- `posts-md/*.md`
- `template.html`
- `index.template.html`
- `blog.template.html`

## Front Matter 字段

- `title`: 文章标题，建议必填。
- `date`: 发布日期，建议使用 `YYYY-MM-DD`。
- `category`: 文章分类，会显示在文章页。
- `excerpt`: 摘要，会显示在首页和博客列表。
- `tags`: 标签数组。
- `featured`: 是否高亮显示在博客列表中。
- `badge`: 徽标文案，例如“精选”或“热门”。

## 模板文件

- `template.html`: 文章详情页模板。
- `index.template.html`: 首页模板。
- `blog.template.html`: 博客列表页模板。

模板中的占位符由构建脚本替换，所以不要直接去手改生成后的 `index.html` 和 `blog.html`。

## 结果文件

构建后输出的页面仍然是纯静态网页，可以直接部署到 GitHub Pages 或任意静态托管平台。

如果你只是浏览站点，打开生成后的 HTML 即可。
如果你修改了 Markdown 内容，记得重新执行一次 `npm run build`。

## GitHub 自动发布

仓库内已经提供 GitHub Pages 工作流：`.github/workflows/deploy-pages.yml`。

它会在推送到 `main` 后自动：

- 安装依赖
- 执行 `npm run build`
- 打包最终静态站点
- 部署到 GitHub Pages

首次启用需要在仓库设置里把 Pages 的发布来源切换为 `GitHub Actions`。
