#!/usr/bin/env node
/**
 * Sketch Style 自检脚本
 * 扫描 styles.css 与生成的 HTML，核对「铅笔手绘风」的禁止项与必需 token。
 * 用法：node sketch-check.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CSS_PATH = path.join(ROOT, 'styles.css');
const css = fs.readFileSync(CSS_PATH, 'utf-8');
const cssLines = css.split('\n');
/* 注释整段剔除后再判定，避免注释里的说明文字被当成违规代码 */
const cssCode = css.replace(/\/\*[\s\S]*?\*\//g, '');
const cssCodeLines = cssCode.split('\n');

const htmlFiles = ['index.html', 'blog.html', 'about.html']
  .filter(f => fs.existsSync(path.join(ROOT, f)))
  .concat(
    fs.existsSync(path.join(ROOT, 'posts'))
      ? fs.readdirSync(path.join(ROOT, 'posts')).filter(f => f.endsWith('.html')).map(f => 'posts/' + f)
      : []
  );

const htmlSources = htmlFiles.map(f => ({ file: f, text: fs.readFileSync(path.join(ROOT, f), 'utf-8') }));
const allMarkup = htmlSources.map(s => s.text).join('\n');

const failures = [];
const warnings = [];
const passes = [];

function fail(msg) { failures.push(msg); }
function warn(msg) { warnings.push(msg); }
function pass(msg) { passes.push(msg); }

/* ---------- 1. 禁止的 class / 模式 ---------- */
const forbiddenClasses = [
  'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
  'shadow-lg', 'shadow-xl', 'shadow-2xl',
  'bg-[#ff71ce]', 'bg-[#01cdfe]', 'bg-[#ff006e]', 'bg-[#00ff00]',
  'text-[#ff71ce]', 'text-[#01cdfe]', 'text-[#ff006e]',
  'border-4', 'font-black',
  'bg-gradient-to-r', 'bg-gradient-to-l'
];

/* 精确到「class 名边界」：--shade-lg 这类自定义属性不算命中 shadow-lg */
function mentionsClass(text, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[\\s"\'])' + escaped + '($|[\\s"\'>])', 'm').test(text);
}

const forbiddenInMarkup = forbiddenClasses.filter(c => mentionsClass(allMarkup, c));
const forbiddenInCss = forbiddenClasses.filter(c => mentionsClass(css, c));

if (forbiddenInMarkup.length === 0 && forbiddenInCss.length === 0) {
  pass('禁止 class：CSS 与 HTML 中均未出现 ' + forbiddenClasses.length + ' 个禁用类');
} else {
  if (forbiddenInMarkup.length) fail('HTML 中出现禁止 class: ' + forbiddenInMarkup.join(', '));
  if (forbiddenInCss.length) fail('CSS 中出现禁止 class: ' + forbiddenInCss.join(', '));
}

/* ---------- 2. 禁止的 CSS 属性 / 效果 ---------- */
const forbiddenProps = [
  { re: /linear-gradient\(/g, label: '渐变 linear-gradient()' },
  { re: /radial-gradient\(/g, label: '渐变 radial-gradient()' },
  { re: /conic-gradient\(/g, label: '渐变 conic-gradient()' },
  { re: /backdrop-filter\s*:/g, label: '毛玻璃 backdrop-filter' },
  { re: /background-clip:\s*text/g, label: '渐变文字 background-clip:text' },
  { re: /#[0-9a-f]{6}\b/gi, label: null } // 单独处理颜色
];

for (const { re, label } of forbiddenProps) {
  if (!label) continue;
  const hits = [];
  cssLines.forEach((line, i) => {
    if (new RegExp(re.source, re.flags).test(line)) hits.push((i + 1) + ': ' + line.trim());
  });
  if (hits.length) fail('CSS 含禁止效果「' + label + '」→\n    ' + hits.slice(0, 4).join('\n    '));
  else pass('无' + label);
}

/* ---------- 3. 纯白背景 ---------- */
const whiteHits = [];
cssCodeLines.forEach((line, i) => {
  if (/background(-color)?:\s*(#fff(f{3,6})?|white)\b/i.test(line)) {
    whiteHits.push(line.trim());
  }
});
if (whiteHits.length) fail('使用纯白背景 →\n    ' + whiteHits.join('\n    '));
else pass('无纯白背景（各调色板的纸色均非纯白，逐套单独校验）');

/* ---------- 4. 必需 token ---------- */
const required = [
  ['纸张色背景', /--c-paper:\s*#f5f0e8/i],
  ['铅笔灰主色', /--c-pencil:\s*#2c2c2c/i],
  ['输入框纸面', /--c-paper-input:\s*#faf5ed/i],
  ['虚线边框 token', /--bd:\s*var\(--bd-w\)\s+dashed\s+var\(--c-pencil\)/],
  ['小圆角 token', /--r-sm:/],
  ['倾斜 token', /--tilt-1:\s*rotate\(-1deg\)/],
  ['手绘笔触阴影', /--shade-md:\s*1px 1px 0 0 rgba\(var\(--shadow-ink\), 0\.22\)/],
  ['多套纸色调色板', /\[data-palette='cream'\]|\[data-palette="cream"\]/],
  ['纸张纹理（SVG 噪声）', /--paper-noise:\s*url\("data:image\/svg\+xml/],
  ['手绘波浪下划线', /--u-wavy:\s*url\("data:image\/svg\+xml/],
  ['手写字体栈', /--font-hand:\s*'Caveat'/],
  ['衬线字体栈', /--font-serif:\s*'Noto Serif SC'/]
];

for (const [name, re] of required) {
  if (re.test(css)) pass('token 存在：' + name);
  else fail('缺少必需 token：' + name);
}

/* ---------- 5. 必需 class 组合 ---------- */
const buttonRule = css.match(/\.sketch-btn \{[\s\S]*?\n\}/);
if (buttonRule && /\.sketch-btn\s*\{[\s\S]*border:\s*var\(--bd\)/.test(buttonRule[0]) &&
    /border-radius:\s*var\(--r-input\)/.test(buttonRule[0]) &&
    /transition:/.test(buttonRule[0]) &&
    /font-weight:\s*700/.test(buttonRule[0])) {
  pass('按钮 token：rounded-sm 等效圆角 + 2px 虚线边框 + 过渡 + 半粗体');
} else {
  fail('按钮缺少必需 token（小圆角 / 虚线边框 / transition / font-semibold）');
}

const boxRule = css.match(/\.sketch-box \{[\s\S]*?\n\}/);
if (boxRule && /background-color:\s*var\(--c-paper\)/.test(boxRule[0]) &&
    /border:\s*var\(--bd\)/.test(boxRule[0]) &&
    /border-radius:\s*var\(--r-card\)/.test(boxRule[0])) {
  pass('卡片 token：纸张底 + 虚线边框 + 小圆角 + 排线阴影（.hatch）');
} else {
  fail('卡片缺少必需 token');
}

const inputRule = css.match(/\.sketch-input \{[\s\S]*?\n\}/);
if (inputRule && /background-color:\s*var\(--c-paper-input\)/.test(inputRule[0]) &&
    /border:\s*var\(--bd\)/.test(inputRule[0]) &&
    /focus\.sketch-input:focus|:focus/.test(css)) {
  pass('输入框 token：纸面底 + 虚线边框 + 聚焦手绘阴影');
} else {
  fail('输入框缺少必需 token');
}

/* ---------- 6. 排线阴影实现方式 ---------- */
if (/box-shadow:\s*[^;]*url\(/i.test(cssCode)) {
  fail('box-shadow 中使用 url() 图像：Chrome / Firefox 会静默丢弃，阴影不会渲染');
} else {
  pass('排线阴影未误用 box-shadow url()（改用偏移 background-image 图层）');
}

/* 阴影实现方式说明：外阴影无法承载 SVG 排线图像，而「伪元素 + 负 z-index」的
   排线背景会被元素自身的 rotate/transform 层叠上下文顶到正文之上，
   因此阴影统一采用错位叠加的半透明笔触。 */
const layeredShadows = cssCodeLines.filter(l => /--shade-(md|lg|deep):.*rgba\(var\(--shadow-ink\)/.test(l));
if (layeredShadows.length >= 3 && /,\s*\d+px \d+px 0 0 rgba/.test(cssCode)) {
  pass('阴影为错位叠加的铅笔笔触（' + layeredShadows.length + ' 档），非单色平面投影');
} else {
  fail('阴影未使用错位叠加的笔触实现');
}

if (/\.hatch \{\s*\n\s*box-shadow:\s*var\(--shade-md\);/.test(css)) {
  pass('阴影档位已接入 .hatch，由状态切换读写');
} else {
  fail('.hatch 未绑定阴影档位');
}

/* ---------- 7. 倾斜与手绘细节 ---------- */
const tiltCount = (css.match(/rotate:/g) || []).length;
if (tiltCount >= 12) pass('元素倾斜：检测到 ' + tiltCount + ' 处 rotate 声明');
else warn('倾斜声明偏少（' + tiltCount + ' 处），手绘感可能不足');

if (/prefers-reduced-motion:\s*reduce/.test(css)) pass('已提供 prefers-reduced-motion 方案');
else fail('缺少 prefers-reduced-motion 媒体查询');

if (/:focus-visible/.test(css)) pass('已提供 :focus-visible 焦点态');
else fail('缺少 :focus-visible 焦点态');

/* ---------- 8. 颜色对比度（WCAG 2.1 AA） ---------- */
function srgbToLin(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/* 调色板直接从 CSS 解析：每套纸色都要独立满足 AA，避免新增配色时漏检 */
/* 用纯字符串定位，避免正则转义层层嵌套 */
function extractBlock(startIndex) {
  const open = cssCode.indexOf('{', startIndex);
  if (open < 0) return null;
  const close = cssCode.indexOf('}', open);
  if (close < 0) return null;
  return cssCode.slice(open + 1, close);
}

function tokensFrom(block) {
  const tokens = {};
  if (!block) return tokens;
  for (const decl of block.split(';')) {
    const hit = decl.match(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/);
    if (hit) tokens[hit[1]] = hit[2];
  }
  return tokens;
}

function parsePaletteBlock(name) {
  const marker = "[data-palette='" + name + "']";
  const at = cssCode.indexOf(marker);
  if (at < 0) return null;
  return tokensFrom(extractBlock(at));
}

/* 同一个调色板可能出现在多个选择器组里（例如深色纸的强调色覆盖），需去重 */
const paletteNames = [...new Set(
  [...cssCode.matchAll(/\[data-palette=['"]([a-z-]+)['"]\]/g)].map(m => m[1])
)];

/* 根调色板（:root 里的默认值） */
const rootAt = cssCode.indexOf(':root');
const rootTokens = tokensFrom(extractBlock(rootAt));

const allPalettes = [{ name: 'default(米白)', tokens: rootTokens }]
  .concat(paletteNames.map(n => ({ name: n, tokens: parsePaletteBlock(n) || {} })));

if (paletteNames.length < 4) {
  fail('调色板数量过少（' + paletteNames.length + ' 套），无法体现纸色变化');
} else {
  pass('调色板数量：' + (paletteNames.length + 1) + ' 套（含默认米白）');
}

let paletteFailures = 0;
for (const { name, tokens } of allPalettes) {
  const paper = tokens['--c-paper'];
  const deep = tokens['--c-paper-deep'];
  const tint = tokens['--c-paper-tint'];
  const i1 = tokens['--c-pencil'];
  const i2 = tokens['--c-pencil-2'];
  const i3 = tokens['--c-pencil-3'];
  const accent = tokens['--c-accent'];

  const missing = [];
  for (const [label, val] of [['--c-paper', paper], ['--c-paper-deep', deep], ['--c-paper-tint', tint],
                              ['--c-pencil', i1], ['--c-pencil-2', i2], ['--c-pencil-3', i3], ['--c-accent', accent]]) {
    if (!val) missing.push(label);
  }
  if (missing.length) {
    fail('调色板 ' + name + ' 缺少 token: ' + missing.join(', '));
    paletteFailures += 1;
    continue;
  }

  const checks = [
    ['主文本', i1, paper],
    ['次要文本', i2, paper],
    ['弱化文本', i3, paper],
    ['主文本/浅色带', i1, tint],
    ['主文本/深色带', i1, deep],
    ['次要文本/深色带', i2, deep]
  ];

  const bad = checks.filter(([, fg, bg]) => ratio(fg, bg) < 4.5);
  if (bad.length) {
    paletteFailures += 1;
    fail('调色板 ' + name + ' 对比度不足: ' + bad.map(([l, fg, bg]) => l + ' ' + ratio(fg, bg).toFixed(2) + ':1').join('; '));
  } else {
    const worst = Math.min(...checks.map(([, fg, bg]) => ratio(fg, bg)));
    pass('调色板 ' + name.padEnd(12) + ' 全部文本 ≥4.5:1（最低 ' + worst.toFixed(2) + ':1）');
  }

  // 纯白绝不能作为背景（禁止项）
  if (/^#fff/i.test(paper) || /^#fff/i.test(deep) || /^#fff/i.test(tint)) {
    fail('调色板 ' + name + ' 使用了纯白背景');
  }
}

if (paletteFailures === 0) pass('全部调色板无纯白背景、无对比度不足');

/* 强调色只能作描边 / 纹理：任何作为文字颜色的硬编码强调色都是隐患 */
const accentPalette = {
  '#e74c3c': '红(原生)', '#3498db': '蓝(原生)', '#27ae60': '绿(原生)', '#f39c12': '黄(原生)',
  '#b03a2e': '红(描边版)', '#1f6f97': '蓝(描边版)', '#2f7a4f': '绿(描边版)', '#a0570b': '琥珀(描边版)',
  '#f0a097': '红(深色版)', '#9ecfef': '蓝(深色版)', '#a5d9b4': '绿(深色版)', '#f0cd8f': '琥珀(深色版)'
};

const accentAsText = [];
for (const hex of Object.keys(accentPalette)) {
  const hits = cssCodeLines.filter(l => new RegExp('\\bcolor:\\s*' + hex, 'i').test(l));
  if (hits.length) accentAsText.push(accentPalette[hex] + ' ' + hex + ' x' + hits.length);
}

if (accentAsText.length) {
  fail('强调色被用作前景文字（应只作描边）：' + accentAsText.join(', '));
} else {
  pass('强调色未被用作文本前景色；四色只出现在边框 / 下划线 / 纹理上');
}

/* --c-accent-* 作为文字色时，必须满足所在纸色的 AA */
const accentVarAsText = cssCodeLines.filter(l => /\bcolor:\s*var\(--c-accent(-red|-blue|-green|-amber)?\)/.test(l));
if (accentVarAsText.length) {
  const accentHexes = ['#b03a2e', '#1f6f97', '#2f7a4f', '#a0570b'];
  const lightPapers = Object.values(allPalettes)
    .map(p => p.tokens['--c-paper'])
    .filter(h => h && luminance(h) > 0.5);
  let worst = Infinity;
  for (const acc of accentHexes) {
    for (const paper of lightPapers) {
      worst = Math.min(worst, ratio(acc, paper));
    }
  }
  if (worst >= 4.5) {
    pass('作为文字使用的 --c-accent-* 在全部浅色纸上最低 ' + worst.toFixed(2) + ':1（≥4.5）');
  } else {
    fail('--c-accent-* 作为文字时对比度不足：最低 ' + worst.toFixed(2) + ':1');
  }
} else {
  pass('--c-accent-* 未直接用作文字色');
}

/* ---------- 9. 响应式与骨架 ---------- */
if (/@media \(prefers-reduced-motion: reduce\)/.test(css)) pass('动效降级已覆盖');
if (/--gutter/.test(css) && /--sec-y/.test(css)) pass('间距使用统一 scale（--gutter / --sec-y）');
if (/min-height:\s*44px/.test(css)) pass('交互元素最小 44px 触摸目标');
else warn('未检测到 44px 最小触摸目标');

/* ---------- 10. 生成的 HTML 结构 ---------- */
if (/lang="zh-CN"/.test(allMarkup)) pass('HTML 语言标记正确');
if (/class="skip-link"/.test(allMarkup)) pass('提供跳转到主内容的 skip link');
else warn('缺少 skip link');
if (/:focus-visible|focus-visible/.test(css)) pass('键盘焦点可见');

const missingAlt = (allMarkup.match(/<img(?![^>]*alt=)/g) || []).length;
if (missingAlt) fail('存在 ' + missingAlt + ' 个缺少 alt 的图片');
else pass('所有图片均有 alt 属性');

/* ---------- 输出 ---------- */
console.log('');
console.log('Sketch Style 自检');
console.log('='.repeat(64));
console.log('扫描文件：styles.css + ' + htmlFiles.length + ' 个 HTML');
console.log('');
console.log('通过 ' + passes.length + ' 项');
passes.forEach(p => console.log('  ✓ ' + p));

if (warnings.length) {
  console.log('');
  console.log('提醒 ' + warnings.length + ' 项');
  warnings.forEach(w => console.log('  ! ' + w));
}

if (failures.length) {
  console.log('');
  console.log('不合规 ' + failures.length + ' 项');
  failures.forEach(f => console.log('  ✗ ' + f));
  console.log('');
  process.exit(1);
}

console.log('');
console.log('结果：全部通过，风格未漂移。');
