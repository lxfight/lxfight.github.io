const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const fm = require('front-matter');
const hljs = require('highlight.js');

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (__) {}
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true
});

const POSTS_DIR = './posts-md';
const OUTPUT_DIR = './posts';
const TEMPLATE_PATH = './template.html';

function readTemplate() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    const template = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - lxfight 个人博客</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
</head>
<body>
    <header>
        <nav>
            <div class="nav-container">
                <h1><a href="../index.html">lxfight</a></h1>
                <ul>
                    <li><a href="../index.html">首页</a></li>
                    <li><a href="../about.html">关于我</a></li>
                    <li><a href="../blog.html">博客</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <main>
        <article class="post-content">
            <div class="container">
                <header class="post-header">
                    <h1>{{title}}</h1>
                    <p class="post-meta">发布于 {{date}} | {{category}}</p>
                    {{tags}}
                </header>
                
                <div class="post-body">
                    {{content}}
                </div>
                
                <footer class="post-footer">
                    <p><a href="../blog.html">← 返回博客列表</a></p>
                </footer>
            </div>
        </article>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 lxfight 个人博客. 所有权利保留.</p>
        </div>
    </footer>
</body>
</html>`;
    fs.writeFileSync(TEMPLATE_PATH, template);
  }
  return fs.readFileSync(TEMPLATE_PATH, 'utf-8');
}

function generateTagsHTML(tags) {
  if (!tags || tags.length === 0) return '';
  const tagElements = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
  return `<div class="post-tags">${tagElements}</div>`;
}

function processMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = fm(content);
  const { attributes: frontMatter, body } = parsed;
  
  const htmlContent = marked(body);
  const template = readTemplate();
  
  const html = template
    .replace('{{title}}', frontMatter.title || 'Untitled')
    .replace('{{title}}', frontMatter.title || 'Untitled') // Replace both occurrences
    .replace('{{date}}', frontMatter.date || new Date().toISOString().split('T')[0])
    .replace('{{category}}', frontMatter.category || '技术分享')
    .replace('{{tags}}', generateTagsHTML(frontMatter.tags))
    .replace('{{content}}', htmlContent);
  
  const fileName = path.basename(filePath, '.md') + '.html';
  const outputPath = path.join(OUTPUT_DIR, fileName);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, html);
  console.log(`Generated: ${outputPath}`);
  
  return {
    fileName,
    frontMatter,
    path: outputPath
  };
}

function buildAll() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    console.log(`Created ${POSTS_DIR} directory. Please add your .md files there.`);
    return;
  }
  
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
  
  if (files.length === 0) {
    console.log('No markdown files found in posts-md directory.');
    return;
  }
  
  const posts = [];
  
  files.forEach(file => {
    const filePath = path.join(POSTS_DIR, file);
    const post = processMarkdownFile(filePath);
    posts.push(post);
  });
  
  console.log(`\nBuilt ${posts.length} posts successfully!`);
}

if (process.argv.includes('--watch')) {
  const chokidar = require('chokidar');
  console.log('Watching for changes...');
  
  buildAll();
  
  chokidar.watch(POSTS_DIR + '/*.md').on('change', (filePath) => {
    console.log(`File changed: ${filePath}`);
    processMarkdownFile(filePath);
  });
  
  chokidar.watch(TEMPLATE_PATH).on('change', () => {
    console.log('Template changed, rebuilding all...');
    buildAll();
  });
} else {
  buildAll();
}