// ===========================================
// !!重要配置!! 
const GITHUB_USERNAME = 'lxfight';
const REPO_COUNT = 4; // API获取的项目数
const REPO_SORT = 'updated';
const MY_SKILLS = ['JavaScript', 'Vue', 'TypeScript', 'Python', 'LLM', 'RAG', 'HTML5', 'CSS3', 'Node.js', 'Git', 'Deno'];
const BG_IMAGE_URL = 'https://t.alcy.cc/bd';
const CORNER_IMAGE_URL = 'https://t.alcy.cc/xhl';
const THEME_LIGHT = 'default'; // 统计图片浅色主题 default, classic, light etc.
const THEME_DARK = 'dracula'; // 统计图片深色主题 dracula, dark, synthwave etc.
// ===========================================

const API_URL_USER = `https://api.github.com/users/${GITHUB_USERNAME}`;
const API_URL_REPOS = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=${REPO_SORT}&per_page=100&direction=desc`;
const STATS_IMG_URL = `https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&include_all_commits=true&count_private=true`;
const LANGS_IMG_URL = `https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&langs_count=8`;
const ACTIVITY_GRAPH_URL = `https://github-readme-activity-graph.vercel.app/graph?username=${GITHUB_USERNAME}&hide_border=true&area=true`;

const LANGUAGE_COLORS = { 'JavaScript': '#f1e05a', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Python': '#3572A5', 'TypeScript': '#3178c6', 'Vue': '#41b883', 'Jupyter Notebook': '#DA5B0B' };
const ICONS = {
    star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    location: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
};

// 翻译文本 (包含 README 的 HTML)
const introHTML_zh = `<p>我是一名对人工智能充满热情的全栈开发者和开源贡献者。我热衷于探索和实践大型语言模型（LLM）的各种可能性，并致力于开发能让 AI 更智能、更有用的工具。</p>
   <p><strong>🚀 我在做什么 & 我感兴趣的:</strong></p>
    <ul>
    <li>🧠 <strong>RAG 与 AI 记忆:</strong> 深入研究检索增强生成（RAG）技术。</li>
    <li>🤖 <strong>聊天机器人插件开发:</strong> <a href="https://github.com/AstrBotDevs/AstrBot" target="_blank" rel="noopener noreferrer">AstrBot</a> 的积极贡献者。</li>
     <li>🔧 <strong>后端开发 & 工具链:</strong> 构建稳健的后端服务和开发工具。</li>
     <li>🌐 <strong>开源：</strong> 坚信开源的力量。</li>
    </ul>`;
const introHTML_en = `<p>I am a full-stack developer and open-source contributor passionate about Artificial Intelligence. I love exploring the possibilities of Large Language Models (LLMs) and am dedicated to developing tools that make AI smarter and more useful.</p>
     <p><strong>🚀 What I'm doing & Interested in:</strong></p>
      <ul>
      <li>🧠 <strong>RAG & AI Memory:</strong> Deep diving into Retrieval-Augmented Generation (RAG).</li>
      <li>🤖 <strong>Chatbot Plugin Dev:</strong> Active contributor to <a href="https://github.com/AstrBotDevs/AstrBot" target="_blank" rel="noopener noreferrer">AstrBot</a>.</li>
       <li>🔧 <strong>Backend & Tooling:</strong> Building robust backend services and dev tools.</li>
       <li>🌐 <strong>Open Source:</strong> Believe in the power of open source.</li>
     </ul>`;

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

const translations = {
    en: {
        viewOnGithub: "View on GitHub", githubStats: "GitHub Stats", aboutMe: "About Me",
        skills: "Tech Stack", latestProjects: "Latest Projects (API)",
        highlightProjects: "Highlighted Projects", activityGraph: "GitHub Activity Graph",
        noDescription: "No description provided.", noProjects: "No original projects found 🤔",
        loadProjectsFail: "Failed to load projects", loadUserFail: "Failed to load user data",
        rateLimit: "GitHub API rate limit exceeded, try again after", checkUsername: "Check username/network. 😥",
        welcome: "Welcome to my homepage!", footerAuto: "Some content auto-fetched via GitHub API",
        introHTML: introHTML_en, tableHTML: tableHTML_en,
    },
    zh: {
        viewOnGithub: "查看 GitHub", githubStats: "GitHub 统计", aboutMe: "关于我",
        skills: "技术栈 / 技能", latestProjects: "最新项目 (API)",
        highlightProjects: "我的亮点项目", activityGraph: "我的 GitHub 活动图",
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

// --- Theme & Language ---
function applyTheme(theme) {
    const effectiveTheme = theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
    const imgTheme = effectiveTheme === 'dark' ? THEME_DARK : THEME_LIGHT;

    document.documentElement.setAttribute('data-theme', theme);
    els.themeToggle.innerHTML = effectiveTheme === 'dark' ? ICONS.sun : ICONS.moon;
    els.themeToggle.setAttribute('aria-label', effectiveTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    localStorage.setItem('theme', theme);
    // Update Image SRCs with theme
    els.statsImg.src = `${STATS_IMG_URL}&theme=${imgTheme}`;
    els.langsImg.src = `${LANGS_IMG_URL}&theme=${imgTheme}`;
    els.activityGraphImg.src = `${ACTIVITY_GRAPH_URL}&theme=${imgTheme}`;
    document.body.offsetHeight; // trigger reflow
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
    translatePage();
    renderStaticContent(); // Re-render HTML blocks
    if (reposData) renderRepos(reposData); // Re-render to translate descriptions
    if (userData) els.bio.textContent = userData.bio || _t('welcome');
}
const _t = (key) => translations[currentLang]?.[key] || key;
function translatePage() {
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        const translation = _t(key);
        if (el.id === 'repo-title' && reposData) {
            const count = reposData.length;
            el.textContent = `${translation} (${count})`;
        } else if (translation) {
            el.textContent = translation;
        }
    });
    const displayName = (userData && (userData.name || userData.login)) || GITHUB_USERNAME;
    document.title = `${displayName} | ${_t('aboutMe')}`;
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

// --- Data Fetching & Rendering ---
async function safeFetch(url) {
    const response = await fetch(url);
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
        const resetTime = new Date(parseInt(response.headers.get('X-RateLimit-Reset')) * 1000);
        throw new Error(`${_t('rateLimit')} ${resetTime.toLocaleTimeString()}`);
    }
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
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
        reposData = allRepos.filter(repo => !repo.fork).slice(0, REPO_COUNT);
        renderRepos(reposData); translatePage();
    } catch (error) {
        console.error("Repo data error:", error);
        els.repoError.textContent = `${_t('loadProjectsFail')}: ${error.message}`;
        els.repoError.style.display = 'block';
    }
}
function renderRepos(repos) {
    els.projectsList.innerHTML = ''; els.repoError.style.display = 'none';
    if (!repos || repos.length === 0) {
        els.repoError.textContent = _t('noProjects'); els.repoError.style.display = 'block'; return;
    }
    repos.forEach(repo => {
        const card = document.createElement('div');
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

// --- Initialization ---
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
    renderStaticContent(); // Render Intro/Table

    try {
        await fetchUserData();
        await fetchRepoData(); // fetch latest repos
        showContent();
    } catch (error) {
        console.error("Initialization failed:", error);
        showMainError(error.message);
    }
});
