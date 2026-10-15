# Markdown 内容指南

站点采用「Markdown 作为内容源，HTML 作为构建产物」的静态博客流程。
设计规范与部署说明见 [README.md](README.md)，本文件只讲内容维护。

## 工作方式

只需要维护两类文件：

- `posts-md/*.md`
- 页面模板（`template.html` / `index.template.html` / `blog.template.html`）

运行 `npm run build` 后，构建脚本生成：

- `posts/*.html`
- `index.html`
- `blog.html`
- `posts.json`

## 命令

```bash
npm install      # 安装依赖
npm run build    # 构建静态页面
npm run dev      # 监听 Markdown 与模板变化
npm run check    # 设计风格自检
```

## 编写文章

在 `posts-md/` 下创建 `.md` 文件并写入 Front Matter：

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

## Front Matter 字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 建议 | 文章标题 |
| `date` | 建议 | 发布日期，`YYYY-MM-DD`，用于排序与展示 |
| `category` | 否 | 分类，显示在文章页元信息中 |
| `excerpt` | 否 | 摘要；缺省时由正文自动截取前 120 字 |
| `tags` | 否 | 标签数组，首页卡片与列表页均会展示 |
| `featured` | 否 | 配合 `badge` 显示手绘角标 |
| `badge` | 否 | 角标文案，例如「精选」「热门」 |

## 正文写作约定

正文由 Markdown 转成 HTML 后套用设计系统，写作时注意：

- **标题层级从 `##` 开始**（`#` 留给页面标题）。`##` 自带虚线手绘下划线，`###` 为次级标题。
- **代码块请标注语言**（如 ````ts`），构建脚本会用 highlight.js 生成高亮。
  高亮配色由 `styles.css` 的 `.hljs-*` 规则控制，并复用调色板的强调色，
  因此切换纸色主题时代码颜色会一并跟随（深色主题自动换成亮色版本）。
- **行内强调**：`**加粗**` 会带虚线底纹，适合标注关键结论。
- **引用块**用虚线边框呈现，适合放结论性内容。
- Markdown 里**不要写内联样式或自造 class**，样式统一由 `styles.css` 控制，避免风格漂移。

## 模板占位符

模板中的占位符由构建脚本替换，不要手改生成后的 `index.html`、`blog.html` 和 `posts/*.html`：

| 模板 | 占位符 |
| --- | --- |
| `template.html` | `{{title}}` `{{meta}}` `{{tags}}` `{{content}}` `{{postNav}}` `{{currentYear}}` |
| `index.template.html` | `{{articleCount}}` `{{recentPosts}}` `{{currentYear}}` |
| `blog.template.html` | `{{allPosts}}` `{{currentYear}}` |

## 删除文章

`posts/` 与 `posts.json` 是构建产物，构建脚本**只会新增和覆盖，不会清理孤儿文件**。
删除 `posts-md/xxx.md` 后，请同时删除 `posts/xxx.html`，否则旧的静态页面会留在仓库里，
继续使用旧样式并被搜索引擎收录。

## 卸载 / 部署

构建产物都是纯静态文件，可直接部署到 GitHub Pages 或任意静态托管。
推送到 `main` 会触发 `.github/workflows/deploy-pages.yml`：安装依赖 → 构建 → 打包 → 发布。
首次启用需要在仓库 `Settings → Pages` 把发布来源设为 `GitHub Actions`。
