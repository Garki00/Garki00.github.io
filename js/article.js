const MANIFEST_URL = './json/articles.json';
const DOC_DIR = './doc/';

document.addEventListener('DOMContentLoaded', function () {
    createBubbles();
    loadArticle();
});

async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const titleEl = document.getElementById('articleTitle');
    const metaEl = document.getElementById('articleMeta');
    const contentEl = document.getElementById('articleContent');
    const card = document.querySelector('.article-card');

    if (!id) {
        titleEl.textContent = '未指定文章';
        contentEl.innerHTML = '<p class="error-msg">缺少文章 id，请从目录页点击文章条目进入。</p>';
        card.classList.add('is-visible');
        return;
    }

    try {
        const manifestRes = await fetch(MANIFEST_URL, { cache: 'no-cache' });
        if (!manifestRes.ok) throw new Error('manifest fetch failed');
        const articles = await manifestRes.json();
        const article = (Array.isArray(articles) ? articles : []).find(a => String(a.id) === String(id));

        if (!article) {
            titleEl.textContent = '未找到文章';
            contentEl.innerHTML = '<p class="error-msg">在 articles.json 中找不到对应的文章条目。</p>';
            card.classList.add('is-visible');
            return;
        }

        titleEl.textContent = article.title || '无标题';
        metaEl.innerHTML = '';
        if (article.date) {
            metaEl.appendChild(buildMetaSpan('fa-regular fa-calendar', article.date));
        }
        if (article.tag) {
            metaEl.appendChild(buildMetaSpan('fa-solid fa-tag', article.tag));
        }

        const mdRes = await fetch(DOC_DIR + article.file, { cache: 'no-cache' });
        if (!mdRes.ok) throw new Error('markdown fetch failed: ' + mdRes.status);
        const mdText = await mdRes.text();

        if (window.marked) {
            contentEl.innerHTML = window.marked.parse(mdText);
        } else {
            // marked 加载失败时的兜底：按纯文本换行显示
            contentEl.textContent = mdText;
        }

        card.classList.add('is-visible');
        document.title = (article.title || '文章阅览') + ' · Garki Page';
    } catch (err) {
        console.error(err);
        titleEl.textContent = '加载失败';
        contentEl.innerHTML = '<p class="error-msg">文章内容加载失败，请确认 doc/ 目录下对应的 md 文件存在，且页面通过本地服务器打开（而非直接双击 html 文件，否则浏览器会拦截本地文件读取）。</p>';
        card.classList.add('is-visible');
    }
}

function buildMetaSpan(iconClass, text) {
    const span = document.createElement('span');
    const icon = document.createElement('i');
    icon.className = iconClass;
    span.appendChild(icon);
    span.appendChild(document.createTextNode(text));
    return span;
}

/* ---- 背景气泡效果（与主页保持一致） ---- */
function createBubbles() {
    const bubblesContainer = document.getElementById('bubbles');
    const bubbleCount = 15;

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        const size = Math.random() * 40 + 20;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;

        const opacity = Math.random() * 0.2 + 0.1;
        bubble.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;

        const floatDuration = Math.random() * 10 + 10;
        bubble.style.animation = `float ${floatDuration}s ease-in-out infinite alternate`;

        bubblesContainer.appendChild(bubble);
    }

    addFloatAnimation();
}

function addFloatAnimation() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes float {
            0% { transform: translateY(0) translateX(0); }
            100% { transform: translateY(-20px) translateX(10px); }
        }
    `;
    document.head.appendChild(styleSheet);
}
