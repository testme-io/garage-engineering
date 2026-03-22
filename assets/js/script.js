class BaseComponent extends HTMLElement {
    connectedCallback() {
        // Flag prevents infinite loop when writing to innerHTML
        if (this._rendered) return;

        // Wait one tick to ensure MD content is injected into the tag
        setTimeout(() => {
            this.render();
        }, 0);
    }

    render() {
        if (this._rendered) return;
        const content = this.innerHTML;
        const title = this.getAttribute('title') || 'Details';

        // Get text from attribute
        const extraText = this.getAttribute('text');

        // Generate HTML for subtitle (using a specific class for styling)
        const subtitle = extraText ? ` <span class="label-subtitle">(${extraText})</span>` : '';

        const templates = {
            'my-card': `<section class="card">${content}</section>`,
            'my-features': `<div class="feature-list">${content}</div>`,
            'my-spoiler': `<details class="spoiler"><summary class="spoiler-title">${title}</summary><div class="spoiler-content">${content}</div></details>`,

            'my-before': `<div class="example-block before-style"><span class="example-label label-before">❌ BEFORE${subtitle}</span><div class="example-content">${content}</div></div>`,
            'my-after': `<div class="example-block after-style"><span class="example-label label-after">✅ AFTER${subtitle}</span><div class="example-content">${content}</div></div>`,

            'my-success': `<div class="item-success">${content}</div>`,
            'my-warning': `<div class="item-warning">${content}</div>`,
            'my-info': `<div class="item-info">${content}</div>`,
            'my-error': `<div class="item-danger">${content}</div>`,
            'my-file': `<code class="file-path">${content}</code>`,
            'my-kbd': `<kbd class="kbd-shell">${content}</kbd>`,
            'my-h1': (el) => `<h1>${el.innerHTML}</h1>`,
            'my-h2': (el) => `<h2 style="margin-top:0">${el.innerHTML}</h2>`
        };

        if (templates[this.localName]) {
            this._rendered = true; // Mark rendering as complete
            this.innerHTML = templates[this.localName];
        }
    }
}

// Custom elements registration
const tags = ['my-card', 'my-features', 'my-spoiler', 'my-before', 'my-after', 'my-success', 'my-warning', 'my-info', 'my-error', 'my-file', 'my-kbd'];
tags.forEach(tag => {
    if (!customElements.get(tag)) {
        customElements.define(tag, class extends BaseComponent {});
    }
});

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark-theme');
    const newTheme = isDark ? 'light-theme' : 'dark-theme';
    html.classList.remove('dark-theme', 'light-theme');
    html.classList.add(newTheme);
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', newTheme);
}

// 1. Add copy buttons to code blocks (avoiding duplicates)
const syncCopyButtons = () => {
    document.querySelectorAll('pre:not(.has-copy-button)').forEach((block) => {
        if (block.closest('my-before, my-after')) return;

        block.classList.add('has-copy-button');
        block.style.position = 'relative';

        const button = document.createElement('button');
        button.innerText = 'COPY';
        button.className = 'copy-btn';
        // Force button to the front
        button.style.zIndex = "999";
        block.appendChild(button);
    });
};

// 2. Global click handler (delegation) for copy buttons
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('copy-btn')) {
        const btn = e.target;
        const block = btn.closest('pre');
        const codeTag = block.querySelector('code');
        const textToCopy = codeTag ? codeTag.innerText : block.innerText.replace(/COPY$/g, '').trim();

        // Create temporary textarea for copying
        const el = document.createElement('textarea');
        el.value = textToCopy;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);

        el.select();
        const success = document.execCommand('copy');
        document.body.removeChild(el);

        if (success) {
            btn.classList.add('copied');
            btn.innerText = 'COPIED!';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerText = 'COPY';
            }, 2000);
        }
    }
});

// 3. Observe DOM changes to attach buttons to new elements
new MutationObserver(syncCopyButtons).observe(document.body, { childList: true, subtree: true });
syncCopyButtons();

// Click handler for .cmd elements (inline commands)
document.addEventListener('click', (e) => {
    const cmdElement = e.target.closest('.cmd');
    if (!cmdElement) return;

    const textToCopy = cmdElement.innerText.trim();

    // Clipboard logic
    const el = document.createElement('textarea');
    el.value = textToCopy;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);

    if (success) {
        // Trigger visual feedback (CSS animation)
        cmdElement.classList.add('copied');

        // Remove class after animation timeout
        setTimeout(() => {
            cmdElement.classList.remove('copied');
        }, 5000);
    }
});