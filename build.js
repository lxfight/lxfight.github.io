const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const fm = require('front-matter');

marked.setOptions({
  breaks: true,
  gfm: true
});

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

function renderTags(tags, className = 'post-tags') {
  if (!tags.length) {
    return '';
  }

  const tagHtml = tags
    .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join('\n        ');

  return `<div class="${className}">
        ${tagHtml}
      </div>`;
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
    htmlContent: marked.parse(body),
    sortTime: parseSortTime(date)
  };
}

function renderPostPage(post, template) {
  const meta = post.category ? `${post.date} · ${post.category}` : post.date;

  return replaceTokens(template, {
    title: escapeHtml(post.title),
    meta: escapeHtml(meta),
    tags: renderTags(post.tags),
    content: post.htmlContent,
    currentYear: new Date().getFullYear()
  });
}

function renderHomePostCard(post) {
  const badgeHtml = post.badge
    ? `          <span class="post-badge">${escapeHtml(post.badge)}</span>\n`
    : '';

  return `<article class="post-card">
        <div class="post-card-header">
${badgeHtml}          <span class="post-date">${escapeHtml(post.date)}</span>
        </div>
        <h3><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
${renderTags(post.tags)}
        <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
        <a href="${post.url}" class="read-more">阅读全文 →</a>
      </article>`;
}

function renderBlogPostItem(post) {
  const featuredClass = post.featured ? ' featured' : '';
  const meta = post.badge ? `${post.date} · ${post.badge}` : post.date;

  return `<article class="post-item${featuredClass}">
      <h2><a href="${post.url}">${escapeHtml(post.title)}</a></h2>
      <p class="meta">${escapeHtml(meta)}</p>
${renderTags(post.tags)}
      <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
      <a href="${post.url}" class="read-more">阅读全文 →</a>
    </article>`;
}

function renderEmptyState(title, text, cardClass) {
  return `<article class="${cardClass}">
      <h3>${escapeHtml(title)}</h3>
      <p class="post-excerpt">${escapeHtml(text)}</p>
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
      : renderEmptyState('暂无文章', '在 posts-md 目录中添加 Markdown 文件后，这里会自动生成。', 'post-card'),
    currentYear: new Date().getFullYear()
  });

  const blogHtml = replaceTokens(blogTemplate, {
    allPosts: posts.length
      ? posts.map(renderBlogPostItem).join('\n\n')
      : renderEmptyState('暂无文章', '在 posts-md 目录中添加 Markdown 文件后，这里会自动生成。', 'post-item'),
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
