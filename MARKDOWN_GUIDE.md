# Markdown 博客使用指南

这个项目现在支持使用 Markdown 编写文章，并自动转换为 HTML 格式。

## 安装依赖

```bash
npm install
```

## 使用方法

### 1. 编写文章

在 `posts-md/` 目录下创建 `.md` 文件，文件需要包含 Front Matter：

```markdown
---
title: 文章标题
date: 2024-01-01
category: 分类
tags:
  - 标签1
  - 标签2
---

这里是文章内容...
```

### 2. 构建文章

运行构建命令将 Markdown 转换为 HTML：

```bash
npm run build
```

生成的 HTML 文件会保存在 `posts/` 目录下。

### 3. 开发模式

如果要实时监听文件变化并自动构建：

```bash
npm run dev
```

## 目录结构

```
├── posts-md/          # Markdown 源文件
├── posts/             # 生成的 HTML 文件
├── template.html      # 文章模板（自动生成）
├── build.js           # 构建脚本
└── package.json       # 项目配置
```

## Front Matter 字段说明

- `title`: 文章标题（必需）
- `date`: 发布日期（可选，默认为当前日期）
- `category`: 文章分类（可选，默认为"技术分享"）
- `tags`: 标签数组（可选）

## 功能特性

- ✅ Markdown 到 HTML 转换
- ✅ 语法高亮支持
- ✅ Front Matter 元数据
- ✅ 文件监听模式
- ✅ 自动生成文章模板
- ✅ 标签和分类支持

## 注意事项

- 确保 Markdown 文件的 Front Matter 格式正确
- 图片路径建议使用相对路径
- 代码块支持语法高亮，请指定语言类型