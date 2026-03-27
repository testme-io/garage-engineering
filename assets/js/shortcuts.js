const shortcuts = {
    // 1. Card container

    // 1. Card container - убираем лишний <section>, оставляем только контент
    'my-card': (content) => `${content}`,

    'my-card-pink': (content) => `${content}`,
    // ... остальные шорткаты

    // 2. Feature list with mint accents
    'my-features': (content) => `
        <div class="feature-list">${content}</div>`,

    // 3. Spoiler (title from attribute)
    'my-spoiler': (content, title) => `
        <details class="spoiler">
            <summary class="spoiler-title">${title || 'Details'}</summary>
            <div class="spoiler-content">${content}</div>
        </details>`,

    // 4. "BEFORE" block with optional text (e.g., <my-before text="Old logic">)
    'my-before': (content, text) => {
        const subtitle = text ? ` (${text})` : '';
        return `
        <div class="example-block before-style">
            <span class="example-label label-before">❌ BEFORE${subtitle}</span>
            <div class="example-content">${content}</div>
        </div>`;
    },

    // 5. "AFTER" block with optional text
    'my-after': (content, text) => {
        const subtitle = text ? ` (${text})` : '';
        return `
        <div class="example-block after-style">
            <span class="example-label label-after">✅ AFTER${subtitle}</span>
            <div class="example-content">${content}</div>
        </div>`;
    },

    // 6. Information blocks (Success, Warning, Info, Error)
    'my-success': (content) => `<div class="item-success">${content}</div>`,
    'my-warning': (content) => `<div class="item-warning">${content}</div>`,
    'my-info': (content) => `<div class="item-info">${content}</div>`,
    'my-error': (content) => `<div class="item-danger">${content}</div>`,

    // 7. Inline elements (File path and Keyboards)
    'my-file': (content) => `<code class="file-path">${content}</code>`,
    'my-kbd': (content) => `<kbd class="kbd-shell">${content}</kbd>`,

    // 8. Headers (Custom styling)
    'my-h1': (content) => `<h1>${content}</h1>`,
    'my-h2': (content) => `<h2 style="margin-top:0">${content}</h2>`
};