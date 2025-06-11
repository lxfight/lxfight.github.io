// ===========================================
// !!重要配置!! 
const GITHUB_USERNAME = 'lxfight';
const REPO_COUNT = 6; // API获取的项目数, 网格布局设为3或6较好
const REPO_SORT = 'updated';
const MY_SKILLS = ['Python', 'LLM', 'RAG', 'Prompt Eng', 'HTML5', 'CSS3', 'Git', 'MATLAB', 'FastAPI'];
const BG_IMAGE_URL = 'https://t.alcy.cc/bd';
const CORNER_IMAGE_URL = 'https://t.alcy.cc/xhl';
const THEME_LIGHT = 'default';
const THEME_DARK = 'dracula';
// ===========================================

const API_URL_USER = `https://api.github.com/users/${GITHUB_USERNAME}`;
const API_URL_REPOS = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=${REPO_SORT}&per_page=100&direction=desc`;
const STATS_IMG_BASE = `https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&include_all_commits=true&count_private=true`;
const LANGS_IMG_BASE = `https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&langs_count=8`;
const ACTIVITY_GRAPH_BASE = `https://github-readme-activity-graph.vercel.app/graph?username=${GITHUB_USERNAME}&hide_border=true&area=true`;

const LANGUAGE_COLORS = { 'JavaScript': '#f1e05a', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Python': '#3572A5', 'TypeScript': '#3178c6', 'Vue': '#41b883', 'Jupyter Notebook': '#DA5B0B' };

// 新增/调整图标
const ICONS = {
    star: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    starSolid: `<svg viewBox="0 0 24 24" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" style="stroke:none;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    location: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    code: `<svg viewBox="0 0 24 24" fill="none"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    activity: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`
};

const introHTML_zh = `<p>Hi there 👋 我是一名对AI充满热情的全栈开发者和开源贡献者。热衷于探索LLM的可能性，并致力于开发能让 AI 更智能、更有用的工具。</p>
   <p><strong>🚀 我感兴趣的:</strong> RAG与AI记忆 | 聊天机器人(<a href="https://github.com/AstrBotDevs/AstrBot" target="_blank" rel="noopener noreferrer">AstrBot</a>)插件 | 后端开发 & 工具链 | 开源</p>`;
const introHTML_en = `<p>Hi there 👋 I am a full-stack developer and open-source contributor passionate about AI. I love exploring LLMs possibilities and dedicated to developing tools that make AI smarter and more useful.</p>
     <p><strong>🚀 Interested in:</strong> RAG & AI Memory | Chatbot (<a href="https://github.com/AstrBotDevs/AstrBot" target="_blank" rel="noopener noreferrer">AstrBot</a>) Plugins | Backend & Tooling | Open Source</p>`;
// 表格内容同上一个版本
const tableHTML_zh = `<table><thead><tr><th>项目名称</th><th>描述</th></tr></thead><tbody>
      <tr><td>🧠 <a href="https://github.com/lxfight/astrbot_plugin_mnemosyne" target="_blank" rel="noopener noreferrer">astrbot_plugin_mnemosyne</a></td><td>一个为 AstrBot 实现的基于 RAG 技术的长期记忆插件，让机器人能“记住”更久远的对话。</td></tr>
      <tr><td>📚 <a href="https://github.com/lxfight/astrbot_plugin_knowledge_base" target="_blank" rel="noopener noreferrer">astrbot_plugin_knowledge_base</a></td><td>允许 AstrBot 连接到自定义知识源的插件，通过 RAG 技术让机器人能基于专业知识回答问题。</td></tr>
      <tr><td>😂 <a href="https://github.com/lxfight/astrbot_plugin_memeify" target="_blank" rel="noopener noreferrer">astrbot_plugin_memeify</a></td><td>一个有趣的 AstrBot 插件，能让大语言模型（LLM）在回复时带上表情包，增加趣味性。</td></tr>
      <tr><td>🚀 <a href="https://github.com/lxfight/astrbot2github" target="_blank" rel="noopener noreferrer">astrbot2github</a></td><td>一个基于 Deno 的 GitHub 加速访问服务，专为解决 AstrBot 及其他项目在国内访问 GitHub 速度慢的问题。 </td></tr>
      </tbody></table>`;
const tableHTML_en = `<table><thead><tr><th>Project</th><th>Description</th></tr></thead><tbody>
      <tr><td>🧠 <a href="https://github.com/lxfight/astrbot_plugin_mnemosyne" target="_blank" rel="noopener noreferrer">astrbot_plugin_mnemosyne</a></td><td>A long-term memory plugin for AstrBot based on RAG, allowing the bot to "remember" older conversations.</td></tr>
       <tr><td>📚 <a href="https://github.com/lxfight/astrbot_plugin_knowledge_base" target="_blank" rel="noopener noreferrer">astrbot_plugin_knowledge_base</a></td><td> A plugin allowing AstrBot to connect to custom knowledge sources via RAG for expert answers.</td></tr>
       <tr><td>😂 <a href="https://github.com/lxfight/astrbot_plugin_memeify" target="_blank" rel="noopener noreferrer">astrbot_plugin_memeify</a></td><td> A fun AstrBot plugin that enables LLMs to include memes in their replies.</td></tr>
      <tr><td>🚀 <a href="https://github.com/lxfight/astrbot2github" target="_blank" rel="noopener noreferrer">astrbot2github</a></td><td> A Deno-based GitHub acceleration service to solve slow access issues for AstrBot and other projects.</td></tr>
     </tbody></table>`;

const translations = { // 移除了aboutMe
    en: {
        viewOnGithub: "My GitHub", githubStats: "GitHub Statistics", skills: "Tech Stack",
        latestProjects: "Latest Projects", highlightProjects: "Highlighted Projects", activityGraph: "Activity Graph",
        noDescription: "No description provided.", noProjects: "No original projects found 🤔",
        loadProjectsFail: "Failed to load projects", loadUserFail: "Failed to load user data",
        rateLimit: "GitHub API rate limit exceeded, try again after", checkUsername: "Check username/network. 😥",
        welcome: "Welcome to my homepage!", footerAuto: "Some content auto-fetched via GitHub API",
        introHTML: introHTML_en, tableHTML: tableHTML_en,
    },
    zh: { // 移除了aboutMe
        viewOnGithub: "我的 GitHub", githubStats: "GitHub 统计", skills: "技术栈",
        latestProjects: "最新项目", highlightProjects: "我的亮点项目", activityGraph: "GitHub 活动图",
        noDescription: "该项目暂无描述.", noProjects: "没有找到原创项目 🤔",
        loadProjectsFail: "加载项目失败", loadUserFail: "加载用户信息失败",
        rateLimit: "GitHub API 访问频率受限，请在此时刻后重试", checkUsername: "请检查用户名或网络。😥",
        welcome: "欢迎来到我的主页！", footerAuto: "部分内容通过 GitHub API 自动获取",
        introHTML: introHTML_zh, tableHTML: tableHTML_zh,
    }
};

const $ = (id) => document.getElementById(id);
const els = {
    content: $('content'), loader: $('loader'), mainError: $('main-error'), toolbar: $('toolbar'), footer: $('footer'),
    avatar: $('avatar'), name: $('name'), bio: $('bio'), location: $('location'), githubLink: $('github-link'),
    projectsList: $('projects-list'), repoError: $('repo-error'), year: $('year'), footerName: $('footer-name'),
    langToggle: $('lang-toggle'), themeToggle: $('theme-toggle'), skillsList: $('skills-list'), repoTitle: $('repo-title'),
    introSection: $('intro-section'), highlightTable: $('highlight-projects-table'),
    statsImg: $('stats-img'), langsImg: $('langs-img'), activityGraphImg: $('activity-graph-img'),
    cornerImg: $('corner-img'), cornerChar: $('corner-char'), headerName: $('header-name'),
};

let currentLang = 'zh';
let userData = null, reposData = null;

function applyTheme(theme) {
    const effectiveTheme = theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
    const imgTheme = effectiveTheme === 'dark' ? THEME_DARK : THEME_LIGHT;
    document.documentElement.setAttribute('data-theme', theme);
    els.themeToggle.innerHTML = effectiveTheme === 'dark' ? ICONS.sun : ICONS.moon;
    localStorage.setItem('theme', theme);
    els.statsImg.src = `${STATS_IMG_BASE}&theme=${imgTheme}`;
    els.langsImg.src = `${LANGS_IMG_BASE}&theme=${imgTheme}`;
    els.activityGraphImg.src = `${ACTIVITY_GRAPH_BASE}&theme=${imgTheme}`;
    document.body.offsetHeight;
}
function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || (document.documentElement.getAttribute('data-theme') === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(isDark ? 'light' : 'dark');
}
function renderStaticContent() {
    els.introSection.innerHTML = _t('introHTML');
    els.highlightTable.innerHTML = _t('tableHTML');
}
function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    els.langToggle.textContent = lang === 'zh' ? '🌐 EN' : '🌐 中文';
    localStorage.setItem('lang', lang);
    translatePage(); // 翻译文本和图标
    renderStaticContent(); // 渲染HTML块
    if (reposData) renderRepos(reposData);
    if (userData) els.bio.textContent = userData.bio || _t('welcome');
}
const _t = (key) => translations[currentLang]?.[key] || key;

// 修改： 翻译页面时插入图标
function translatePage() {
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        const iconKey = el.dataset.icon; // 获取 data-icon
        let translation = _t(key);
        const iconHTML = iconKey && ICONS[iconKey] ? ICONS[iconKey] : '';

        if (!translation) return;

        let textContent = translation;
        // 特殊处理 Repo Title 数量
        if (el.id === 'repo-title' && reposData) {
            const count = reposData.length;
            textContent = `${translation} (API: ${count})`;
        }

        // 如果有图标且是标题，用 innerHTML
        if (iconKey && el.classList.contains('section-title')) {
            el.innerHTML = `${iconHTML}<span>${textContent}</span>`; // span for flex align
        } else {
            // 其他情况只更新文本
            el.textContent = textContent;
        }
    });
    const displayName = (userData && (userData.name || userData.login)) || GITHUB_USERNAME;
    document.title = `${displayName} | Portfolio`;
    els.headerName.textContent = displayName;
}

function toggleLanguage() { applyLanguage(currentLang === 'zh' ? 'en' : 'zh'); }
function initSettings() {
    document.documentElement.style.setProperty('--bg-image', `url(${BG_IMAGE_URL})`);
    els.cornerImg.src = CORNER_IMAGE_URL;
    const savedTheme = localStorage.getItem('theme') || 'auto'; applyTheme(savedTheme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (document.documentElement.getAttribute('data-theme') === 'auto') applyTheme('auto');
    });
    const savedLang = localStorage.getItem('lang');
    const defaultLang = (navigator.language || navigator.userLanguage).startsWith('zh') ? 'zh' : 'en';
    applyLanguage(savedLang || defaultLang);
    els.themeToggle.addEventListener('click', toggleTheme);
    els.langToggle.addEventListener('click', toggleLanguage);
}

async function safeFetch(url) {
    try {
        const response = await fetch(url);
        if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
            const resetTime = new Date(parseInt(response.headers.get('X-RateLimit-Reset')) * 1000);
            throw new Error(`${_t('rateLimit')} ${resetTime.toLocaleTimeString()}`);
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    } catch (err) {
        if (err.message.includes("HTTP")) throw err;
        throw new Error(`Network Error / ${err.message}`); // Catch fetch errors like network down
    }
}
async function fetchUserData() {
    try {
        userData = await safeFetch(API_URL_USER);
        renderProfile(userData); translatePage();
    } catch (error) {
        console.error("User data error:", error);
        throw new Error(`${_t('loadUserFail')} (${error.message}). ${_t('checkUsername')}`);
    }
}
function renderProfile(data) {
    const displayName = data.name || data.login;
    els.avatar.src = data.avatar_url; els.avatar.alt = `${displayName} avatar`;
    els.name.textContent = displayName; els.footerName.textContent = displayName; els.headerName.textContent = displayName;
    els.bio.textContent = data.bio || _t('welcome'); els.githubLink.href = data.html_url;
    if (data.location) els.location.innerHTML = `${ICONS.location} ${data.location}`;
}
function renderSkills() {
    els.skillsList.innerHTML = MY_SKILLS.map(skill => `<span class="skill-badge">${skill}</span>`).join('');
}
async function fetchRepoData() {
    try {
        const allRepos = await safeFetch(API_URL_REPOS);
        reposData = allRepos.filter(repo => !repo.fork && !repo.archived).slice(0, REPO_COUNT); // 过滤掉fork和归档
        renderRepos(reposData); translatePage(); // re-translate for count
    } catch (error) {
        console.error("Repo data error:", error);
        els.repoError.textContent = `${_t('loadProjectsFail')}: ${error.message}`;
        els.repoError.style.display = 'block';
        els.projectsList.innerHTML = '';
    }
}
function renderRepos(repos) {
    els.projectsList.innerHTML = ''; els.repoError.style.display = 'none';
    if (!repos || repos.length === 0) {
        els.repoError.textContent = _t('noProjects'); els.repoError.style.display = 'block'; return;
    }
    repos.forEach(repo => {
        const card = document.createElement('div');
        // 项目卡片也应用 blur-bg
        card.className = 'project-card card blur-bg';
        const langColor = LANGUAGE_COLORS[repo.language] || 'var(--color-border)';
        card.style.setProperty('--lang-color', langColor);
        const description = repo.description || _t('noDescription');
        const languageSpan = repo.language ? `<span><i class="language-color" ></i>${repo.language}</span>` : '';
        const starsSpan = repo.stargazers_count > 0 ? `<span>${ICONS.star}${repo.stargazers_count}</span>` : '';
        card.innerHTML = `<h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" title="${repo.name}">${repo.name}</a></h3>
              <p class="description" title="${description}">${description}</p>
              <div class="project-meta">${languageSpan}${starsSpan}</div>`;
        els.projectsList.appendChild(card);
    });
}

function showContent() {
    els.loader.style.display = 'none'; els.mainError.style.display = 'none';
    [els.content, els.toolbar, els.footer, els.cornerChar].forEach(el => {
        if (el) { el.style.display = ''; el.classList.add('fade-in'); }
    });
}
function showMainError(message) {
    els.loader.style.display = 'none';
    [els.content, els.toolbar, els.footer, els.cornerChar].forEach(el => { if (el) el.style.display = 'none'; });
    els.mainError.style.display = 'block'; els.mainError.textContent = message;
}

document.addEventListener('DOMContentLoaded', async () => {
    els.year.textContent = new Date().getFullYear();
    initSettings();
    renderSkills();
    renderStaticContent();

    // 使用 Promise.allSettled 即使一个失败，另一个也能加载
    const results = await Promise.allSettled([
        fetchUserData(),
        fetchRepoData()
    ]);

    const userError = results[0].status === 'fulfilled' ? null : results[0].reason;
    const repoError = results[1].status === 'fulfilled' ? null : results[1].reason;

    if (userError) {
        // 用户信息加载失败是致命错误
        console.error("Initialization failed on User Data:", userError);
        showMainError(userError.message);
    } else {
        // 用户信息成功，即使仓库失败也显示内容（仓库区会有自己的错误提示）
        showContent();
        if (repoError) {
            console.error("Repo Data fetch failed but showing content:", repoError);
            // repoError信息已在fetchRepoData内部设置到els.repoError
        }
    }
});

