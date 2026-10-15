# lxfight 个人博客

部署在 GitHub Pages 上的静态博客，采用 **铅笔手绘风（Sketch Style）**，内容以 Markdown 为唯一来源，支持 **8 套纸色主题** 切换。

- 文章内容写在 `posts-md/*.md`
- 构建脚本自动生成 `posts/*.html`
- 首页 `index.html`、列表页 `blog.html` 与清单 `posts.json` 全部由 Markdown 元数据生成

## 技术栈

- HTML5 / CSS3（手写设计系统，无 CSS 框架、无构建器）
- Node.js + Markdown + Front Matter
- GitHub Pages

## 本地使用

```bash
npm install      # 安装依赖
npm run build    # 生成静态页面
npm run dev      # 监听 Markdown 与模板变化
npm run check    # 设计风格 + 全部调色板对比度自检
```

---

## 纸色主题

每套主题换的是**纸张颜色与墨色**，虚线边框、手绘字体、笔触阴影、倾斜这些手绘语言始终不变。

| `data-palette` | 纸色 | 说明 |
| --- | --- | --- |
| `offwhite` | 米白 `#faf8f3` | **默认**，冷调米白纸 |
| `cream` | 米黄 `#f5f0e8` | 暖调素描本 |
| `sand` | 沙色 `#f7f1e3` | 偏黄的速写纸 |
| `mist` | 冷灰 `#f0f4f7` | 偏蓝的复印纸 |
| `sage` | 鼠尾草 `#eff4ea` | 偏绿的再生纸 |
| `blueprint` | 蓝图纸 `#22384f` | 深色底 + 反白线条 |
| `chalkboard` | 黑板 `#2a2c30` | 深色底 + 粉笔感线条 |
| `ink` | 铅笔黑 `#2b2a27` | 最深，几乎只用线条 |

**切换方式**：把 `<html>` 上的 `data-palette` 改成上表任一值即可，四个模板都在同一行上：

```html
<html lang="zh-CN" data-palette="sand">
```

也可以在浏览器控制台即时预览：

```js
document.documentElement.setAttribute('data-palette', 'blueprint')
```

### 每套主题的 token

每套主题定义同一组变量（在 `styles.css` 的 `[data-palette='…']` 块里）：

```css
--c-canvas       /* 整页底色 */
--c-paper        /* 纸片 / 卡片 */
--c-paper-tint   /* 浅色分区衬底 */
--c-paper-deep   /* 页脚 / 深色分区 */
--c-paper-input  /* 输入框 / 代码块 */
--c-pencil       /* 主文本 */  --c-pencil-2  /* 次要文本 */  --c-pencil-3  /* 弱化文本 */
--c-accent       /* 全站强调色（只用于描边） */
--shadow-ink     /* 笔触阴影的墨色（浅色纸用铅笔灰，深色纸翻成纸色） */
```

**新增一套主题**只需复制一个 `[data-palette='…']` 块改值；`npm run check` 会自动解析新块并校验它的对比度。

### 颜色能出现在哪里

设计系统原生的红/蓝/绿/黄（`#e74c3c` / `#3498db` / `#27ae60` / `#f39c12`）在这套风格里**不能承载文字**：

| 用途 | 对比度 | 结论 |
| --- | --- | --- |
| 作为纸上的文字 | 1.93 – 3.37:1 | 未达 AA，禁止 |
| 作为文字衬底 + 纸色文字 | 1.93 – 3.37:1 | 未达 AA，禁止 |
| 作为虚线边框 / 下划线（不承载文字） | 1.93 – 3.37:1 | 可用，纯装饰 |

所以四色只以**描边与纹理**的形式出现，文字始终是铅笔色。为让描边更清晰，另设了一组同色系低饱和 token：

```css
--c-accent-red: #b03a2e;  --c-accent-blue: #1f6f97;
--c-accent-green: #2f7a4f;  --c-accent-amber: #a0570b;
```

它们在浅色纸上作描边为 **4.61 – 5.86:1**；深色主题下自动切成亮色版本（`#f0a097` / `#9ecfef` / `#a5d9b4` / `#f0cd8f`，在蓝图纸上 5.83 – 7.92:1）。标签、角标、卡片标题下划线、项目卡片依次轮换这四色。

---

## 设计系统：铅笔手绘风

整站只有 `styles.css` 一个样式来源，Token 定义在其顶部的 `:root` 与各 `[data-palette]` 块。**修改风格请只改 Token，不要在组件里硬编码颜色或圆角。**

### 核心约束

| 项目 | 取值 |
| --- | --- |
| 边框 | 一律 `2px dashed`（Token `--bd`） |
| 圆角 | 小半径的**不对称圆角**（`--r-card` / `--r-input` / `--r-tag`），无完美圆弧 |
| 手写体 | `Caveat` / `Patrick Hand` —— 标题、导航、按钮、标签 |
| 衬线体 | `Noto Serif SC` 及系统宋体回退 —— 正文 |
| 等宽 | 代码与技术名词 |
| 正文行宽 | `--read-max: 46rem`（约 68 字符） |
| 内容宽度 | `--page-max: 72rem` |

### 布局：色带结构

页面由交替的色带组成，用同一套纸色的不同明度制造手翻素描本的层次：

| class | 底 | 用在哪 |
| --- | --- | --- |
| `.section-plain` | `--c-canvas` | 英雄区、页头 |
| `.ruled-band` | canvas + 横格线 | 英雄区、文章抬头、关于页名片带 |
| `.section-tint` | `--c-paper-tint` | 最新文章、技术栈 |
| `.section-paper` | `--c-paper` | 文章正文、开源项目 |
| `.section-deep` | `--c-paper-deep` | 关注方向、页脚 |

相邻色带之间自动加一条虚线接缝（`.section + .section-tint` 等选择器）。网格方面：首页首篇卡片横跨两列，开源项目宽屏两列、窄屏一列。

### 交互规则

- **Pencil Shading**：线框元素 hover 时快速填入铅笔墨并反白文字（`--t-ink: 160ms linear`，无缓动曲线）
- **Stroke Jitter**：hover 时元素轻微旋转（`--tilt-*`），保留手绘笔触的不稳定感
- **Paper Press**：`:active` 时阴影收走（`--shade-flat`）并加深倾斜，表现笔尖压纸
- **Scribble Reveal**：强调线一律用波浪/虚线/锯齿 SVG 下划线（`--u-wave*` / `--u-dash` / `--u-zig`），不使用完美直线
- 所有动效均在 `@media (prefers-reduced-motion: reduce)` 下降级

### 关于阴影的两点实现说明

这两个决定都经过浏览器实测，改动前请先读：

1. **外阴影不能承载 SVG 排线。** Chrome 与 Firefox 会静默丢弃 `box-shadow: 2px 2px 0 0 url(...)`，不报错也不渲染。因此阴影用**两段错位叠加的半透明笔触**（`--shade-md` 等）表现铅笔层次，墨色由 `--shadow-ink` 控制，深色主题下自动转向纸色。
2. **负 z-index 的排线背景会被层叠上下文顶到正文之上。** 元素上的 `rotate` / `transform` 会建立层叠上下文，使 `::after { z-index: -1 }` 的排线盖住文本。卡片、按钮都带倾斜，因此不再使用这种画法。SVG 排线纹理（`--hatch`）仍保留给聚焦态等不遮挡文字的场景。

### 自检

```bash
npm run check
```

`sketch-check.js` 会扫描 `styles.css` 与全部生成的 HTML，核对：

- 18 个禁用 class 未出现（`rounded-xl/2xl/3xl/full`、`shadow-lg/xl/2xl`、高饱和霓虹色、`border-4`、`font-black`、`bg-gradient-*`）
- 无渐变、无毛玻璃、无纯白背景、无渐变文字
- 必需 Token 齐备（纸张色、铅笔墨、虚线边框、小圆角、倾斜、手写与衬线字体栈、波浪下划线）
- 按钮 / 卡片 / 输入框的必需 token 组合
- **从 CSS 解析出的每一套主题**，其主 / 次 / 弱三级文本在纸色、浅色带、深色带上都 ≥ 4.5:1，且都不使用纯白背景
- 四色强调色未被用作文本前景色
- 交互元素 ≥ 44px、存在 `:focus-visible` 与 `prefers-reduced-motion` 降级

---

## 内容维护

新增文章时，在 `posts-md/` 下创建 Markdown 并补充 Front Matter：

```markdown
---
title: 文章标题
date: "2026-04-21"
category: 技术分享
excerpt: 文章摘要，用于首页和列表页。
tags:
  - 标签1
  - 标签2
featured: true
badge: 精选
---

这里开始写正文。
```

执行 `npm run build` 后，脚本会自动：

- 生成对应文章页到 `posts/`
- 按日期倒序更新首页文章区块（最多 4 篇，首篇横跨两列）
- 更新博客列表页，并生成上一篇 / 下一篇导航
- 输出文章元数据清单 `posts.json`

> `posts/` 与 `posts.json` 是构建产物。**删除 `posts-md/` 里的源文件后需要同时删除已生成的 HTML**，否则会残留旧样式的页面。

## 目录结构

```text
├── about.html             # 关于页
├── blog.template.html     # 列表页模板
├── build.js               # 构建脚本
├── index.template.html    # 首页模板
├── posts/                 # 生成的文章页
├── posts-md/              # Markdown 内容源
├── posts.json             # 生成的文章元数据
├── sketch-check.js        # 设计风格 + 调色板自检
├── styles.css             # 设计系统与全部样式
└── template.html          # 文章页模板
```

## 部署

推送到 `main` 即触发 GitHub Actions（`.github/workflows/deploy-pages.yml`）：安装依赖 → `npm run build` → 打包静态文件 → 发布 Pages。

首次启用需在仓库 `Settings → Pages` 中把 `Source` 设为 `GitHub Actions`。

访问地址：https://lxfight.github.io
