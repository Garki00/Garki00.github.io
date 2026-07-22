const PAGE_SIZE = 20;
const MANIFEST_URL = './json/articles.json';

let allArticles = [];
let currentPage = 1;

document.addEventListener('DOMContentLoaded', function () {
    createBubbles();
    loadArticles();
});

async function loadArticles() {
    const listEl = document.getElementById('articleList');
    try {
        const res = await fetch(MANIFEST_URL, { cache: 'no-cache' });
        if (!res.ok) throw new Error('manifest fetch failed: ' + res.status);
        const data = await res.json();

        allArticles = (Array.isArray(data) ? data : []).slice().sort((a, b) => {
            // 按日期倒序，日期缺失的排在最后
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });

        if (allArticles.length === 0) {
            listEl.innerHTML = '<p class="state-msg">暂时还没有文章</p>';
            document.querySelector('.catalog-card').classList.add('is-visible');
            return;
        }

        currentPage = getPageFromUrl();
        renderPage(currentPage);
        document.querySelector('.catalog-card').classList.add('is-visible');
    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<p class="state-msg">文章目录加载失败，请确认 articles.json 是否存在，且页面通过本地服务器打开（而非直接双击 html 文件）。</p>';
        document.querySelector('.catalog-card').classList.add('is-visible');
    }
}

function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get('page'), 10);
    const totalPages = Math.max(1, Math.ceil(allArticles.length / PAGE_SIZE));
    if (!p || p < 1) return 1;
    if (p > totalPages) return totalPages;
    return p;
}

function renderPage(page) {
    const listEl = document.getElementById('articleList');
    const totalPages = Math.max(1, Math.ceil(allArticles.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, page), totalPages);

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allArticles.slice(start, start + PAGE_SIZE);

    listEl.innerHTML = '';
    pageItems.forEach((article, i) => {
        listEl.appendChild(buildArticleItem(article, start + i + 1));
    });

    renderPagination(totalPages);

    const url = new URL(window.location.href);
    if (currentPage === 1) {
        url.searchParams.delete('page');
    } else {
        url.searchParams.set('page', currentPage);
    }
    window.history.replaceState({}, '', url);
}

function buildArticleItem(article, indexNumber) {
    const a = document.createElement('a');
    a.className = 'article-item';
    a.href = `article.html?id=${encodeURIComponent(article.id)}`;

    const indexEl = document.createElement('div');
    indexEl.className = 'item-index';
    indexEl.textContent = String(indexNumber).padStart(2, '0');

    const body = document.createElement('div');
    body.className = 'item-body';

    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = article.title || '无标题';

    const excerpt = document.createElement('div');
    excerpt.className = 'item-excerpt';
    excerpt.textContent = article.excerpt || '';

    body.appendChild(title);
    body.appendChild(excerpt);

    const date = document.createElement('div');
    date.className = 'item-date';
    date.textContent = article.date || '';

    const arrow = document.createElement('i');
    arrow.className = 'fa-solid fa-chevron-right item-arrow';

    a.appendChild(indexEl);
    a.appendChild(body);
    a.appendChild(date);
    a.appendChild(arrow);

    // 触摸反馈（移动端 touch 无 hover 效果，手动补上）
    a.addEventListener('touchstart', function () {
        a.classList.add('is-touched');
    }, { passive: true });
    a.addEventListener('touchend', function () {
        setTimeout(() => a.classList.remove('is-touched'), 150);
    });
    a.addEventListener('touchcancel', function () {
        a.classList.remove('is-touched');
    });

    return a;
}

function renderPagination(totalPages) {
    const paginationEl = document.getElementById('pagination');
    paginationEl.innerHTML = '';

    if (totalPages <= 1) return;

    paginationEl.appendChild(makePageButton('<i class="fa-solid fa-angle-left"></i>', currentPage - 1, currentPage === 1));

    const pages = getPageNumbersToShow(currentPage, totalPages);
    pages.forEach(p => {
        if (p === '...') {
            const span = document.createElement('span');
            span.className = 'page-ellipsis';
            span.textContent = '...';
            paginationEl.appendChild(span);
        } else {
            const btn = makePageButton(String(p), p, false, p === currentPage);
            paginationEl.appendChild(btn);
        }
    });

    paginationEl.appendChild(makePageButton('<i class="fa-solid fa-angle-right"></i>', currentPage + 1, currentPage === totalPages));
}

function makePageButton(innerHtml, targetPage, disabled, isActive) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (isActive ? ' is-active' : '');
    btn.innerHTML = innerHtml;
    btn.disabled = !!disabled;
    btn.addEventListener('click', () => {
        renderPage(targetPage);
        document.querySelector('.catalog-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return btn;
}

function getPageNumbersToShow(current, total) {
    const delta = 1;
    const range = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        } else if (range[range.length - 1] !== '...') {
            range.push('...');
        }
    }
    return range;
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
