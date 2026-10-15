const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const fm = require('front-matter');
const hljs = require('highlight.js');

marked.setOptions({
  breaks: true,
  gfm: true
});

// 代码高亮：输出 hljs 的 class，配色由 styles.css 的 .hljs-* 规则接管，
// 因此深浅主题切换时高亮颜色会一并跟随。
function highlightCode(code, language) {
  if (language && hljs.getLanguage(language)) {
    try {
      return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    } catch (error) {
      // 高亮失败时退回自动检测，不影响构建
    }
  }

  return hljs.highlightAuto(code).value;
}

// 自定义代码块渲染：标注语言并内联 hljs 产物
function createCodeRenderer() {
  const renderer = new marked.Renderer();

  renderer.code = (code, language) => {
    const lang = String(language || '').trim().split(/\s+/)[0];
    const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : '';
    return `<pre><code${langClass}>${highlightCode(code, lang)}</code></pre>\n`;
  };

  return renderer;
}

// 生成的 HTML 统一缩进到模板占位符所在层级
function indentBlock(html, spaces) {
  const pad = ' '.repeat(spaces);
  return String(html)
    .split('\n')
    .map(line => (line.trim() ? pad + line : line))
    .join('\n');
}

const ROOT_DIR = __dirname;
const POSTS_DIR = path.join(ROOT_DIR, 'posts-md');
const OUTPUT_DIR = path.join(ROOT_DIR, 'posts');
const POST_TEMPLATE_PATH = path.join(ROOT_DIR, 'template.html');
const INDEX_TEMPLATE_PATH = path.join(ROOT_DIR, 'index.template.html');
const BLOG_TEMPLATE_PATH = path.join(ROOT_DIR, 'blog.template.html');
const POSTS_MANIFEST_PATH = path.join(ROOT_DIR, 'posts.json');
const INDEX_OUTPUT_PATH = path.join(ROOT_DIR, 'index.html');
const BLOG_OUTPUT_PATH = path.join(ROOT_DIR, 'blog.html');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function readTemplate(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template not found: ${filePath}`);
  }

  return readUtf8(filePath);
}

function replaceTokens(template, values) {
  return Object.entries(values).reduce((html, [key, value]) => {
    return html.split(`{{${key}}}`).join(String(value ?? ''));
  }, template);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map(tag => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeText(value, fallback = '') {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim() || fallback;
}

function normalizeDate(value) {
  if (!value) {
    return new Date().toISOString().split('T')[0];
  }

  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  return String(value).trim();
}

function parseSortTime(dateValue) {
  const parsed = new Date(dateValue);
  const timestamp = parsed.getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createExcerpt(frontMatter, body) {
  if (frontMatter.excerpt) {
    return normalizeText(frontMatter.excerpt);
  }

  const plainText = stripMarkdown(body);
  if (plainText.length <= 120) {
    return plainText;
  }

  return `${plainText.slice(0, 120).trim()}...`;
}

function renderTags(tags, className = 'tag-row') {
  if (!tags.length) {
    return '';
  }

  // 首个标签用强调色描边，形成手绘圈注的轮换感
  const tagHtml = tags
    .map((tag, index) => {
      const accentClass = index === 0 ? ' tag-accent' : '';
      return `<li class="tag${accentClass}">${escapeHtml(tag)}</li>`;
    })
    .join('\n');

  return `<ul class="${className}">
${tagHtml}
</ul>`;
}

function loadPost(fileName) {
  const filePath = path.join(POSTS_DIR, fileName);
  const content = readUtf8(filePath);
  const parsed = fm(content);
  const frontMatter = parsed.attributes || {};
  const body = parsed.body.trim();
  const slug = path.basename(fileName, '.md');
  const title = normalizeText(frontMatter.title, slug);
  const date = normalizeDate(frontMatter.date);
  const category = normalizeText(frontMatter.category, '技术分享');
  const tags = normalizeTags(frontMatter.tags);
  const excerpt = createExcerpt(frontMatter, body);
  const badge = normalizeText(frontMatter.badge);
  const featured = Boolean(frontMatter.featured || badge);

  return {
    slug,
    title,
    date,
    category,
    tags,
    excerpt,
    badge,
    featured,
    url: `posts/${slug}.html`,
    body,
    htmlContent: marked.parse(body, { renderer: createCodeRenderer() }),
    sortTime: parseSortTime(date)
  };
}

function renderPostNav(post) {
  const entries = [];

  if (post.prev) {
    entries.push({ label: '← 上一篇', item: post.prev });
  }

  if (post.next) {
    entries.push({ label: '下一篇 →', item: post.next });
  }

  if (!entries.length) {
    return '';
  }

  const items = entries
    .map(
      entry => `          <li>
            <a href="${entry.item.slug}.html">
              <span class="post-nav-label">${entry.label}</span>
              <span class="post-nav-title">${escapeHtml(entry.item.title)}</span>
            </a>
          </li>`
    )
    .join('\n');

  return `      <nav class="post-nav-wrap" aria-label="相邻文章">
        <ul class="post-nav">
${items}
        </ul>
      </nav>`;
}

function renderPostPage(post, template) {
  const meta = post.category
    ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time><span class="meta-sep" aria-hidden="true">✎</span><span>${escapeHtml(post.category)}</span>`
    : `<time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>`;

  return replaceTokens(template, {
    title: escapeHtml(post.title),
    meta,
    tags: indentBlock(renderTags(post.tags), 8),
    content: indentBlock(post.htmlContent, 8),
    postNav: renderPostNav(post),
    currentYear: new Date().getFullYear()
  });
}

function renderHomePostCard(post) {
  const badgeHtml = post.badge
    ? `              <span class="post-badge">${escapeHtml(post.badge)}</span>\n`
    : '';

  return `          <article class="post-card hatch">
            <div class="post-card-header">
${badgeHtml}              <span class="post-date">${escapeHtml(post.date)}</span>
            </div>
            <h3><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
${renderTags(post.tags)}
            <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
            <a href="${post.url}" class="read-more hatch">
              阅读全文
              <span aria-hidden="true">→</span>
            </a>
          </article>`;
}

function renderBlogPostItem(post) {
  const flagHtml = post.badge
    ? `
        <span class="item-flag">${escapeHtml(post.badge)}</span>`
    : '';

  return `          <article class="post-item hatch">
            <h2><a href="${post.url}">${escapeHtml(post.title)}</a></h2>
            <p class="meta">
              <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>${flagHtml}
            </p>
${renderTags(post.tags)}
            <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
            <a href="${post.url}" class="read-more hatch">
              阅读全文
              <span aria-hidden="true">→</span>
            </a>
          </article>`;
}

function renderEmptyState(title, text) {
  // 空状态统一用虚线纸张便签，不再复用卡片样式（避免卡片套卡片）
  return `          <article class="empty-note hatch">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(text)}</p>
          </article>`;
}

function buildListingPages(posts) {
  const indexTemplate = readTemplate(INDEX_TEMPLATE_PATH);
  const blogTemplate = readTemplate(BLOG_TEMPLATE_PATH);
  const recentPosts = posts.slice(0, 4);

  const indexHtml = replaceTokens(indexTemplate, {
    articleCount: posts.length,
    recentPosts: recentPosts.length
      ? recentPosts.map(renderHomePostCard).join('\n\n')
      : renderEmptyState('暂无文章', '在 posts-md 目录中添加 Markdown 文件后，这里会自动生成。'),
    currentYear: new Date().getFullYear()
  });

  const blogHtml = replaceTokens(blogTemplate, {
    allPosts: posts.length
      ? posts.map(renderBlogPostItem).join('\n\n')
      : renderEmptyState('暂无文章', '在 posts-md 目录中添加 Markdown 文件后，这里会自动生成。'),
    currentYear: new Date().getFullYear()
  });

  writeUtf8(INDEX_OUTPUT_PATH, indexHtml);
  writeUtf8(BLOG_OUTPUT_PATH, blogHtml);
}

function buildPostsManifest(posts) {
  const manifest = posts.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    tags: post.tags,
    excerpt: post.excerpt,
    badge: post.badge,
    featured: post.featured,
    url: post.url
  }));

  writeUtf8(POSTS_MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function buildAll() {
  ensureDir(POSTS_DIR);
  ensureDir(OUTPUT_DIR);

  const markdownFiles = fs
    .readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'));

  const posts = markdownFiles
    .map(loadPost)
    .sort((left, right) => right.sortTime - left.sortTime);

  const postTemplate = readTemplate(POST_TEMPLATE_PATH);

  // 相邻文章导航：posts 已按时间倒序，prev 为更新的一篇，next 为更旧的一篇
  posts.forEach((post, index) => {
    post.prev = posts[index - 1] || null;
    post.next = posts[index + 1] || null;
  });

  posts.forEach(post => {
    const outputPath = path.join(OUTPUT_DIR, `${post.slug}.html`);
    writeUtf8(outputPath, renderPostPage(post, postTemplate));
    console.log(`Generated post: ${outputPath}`);
  });

  buildListingPages(posts);
  buildPostsManifest(posts);

  console.log(`Generated index: ${INDEX_OUTPUT_PATH}`);
  console.log(`Generated blog: ${BLOG_OUTPUT_PATH}`);
  console.log(`Generated manifest: ${POSTS_MANIFEST_PATH}`);
  console.log(`Built ${posts.length} post(s).`);
}

if (process.argv.includes('--watch')) {
  const chokidar = require('chokidar');
  const watchTargets = [
    path.join(POSTS_DIR, '*.md'),
    POST_TEMPLATE_PATH,
    INDEX_TEMPLATE_PATH,
    BLOG_TEMPLATE_PATH
  ];

  console.log('Watching Markdown and template files...');
  buildAll();

  chokidar.watch(watchTargets).on('all', (eventName, changedPath) => {
    if (!['add', 'change', 'unlink'].includes(eventName)) {
      return;
    }

    console.log(`[${eventName}] ${changedPath}`);
    buildAll();
  });
} else {
  buildAll();
}
