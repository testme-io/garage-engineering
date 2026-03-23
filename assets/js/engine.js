async function initApp() {
    const container = document.getElementById('content');
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    const articlePath = articleParam ? `articles/${articleParam}.md` : 'articles/index.md';

    try {
        const response = await fetch(articlePath);
        if (!response.ok) throw new Error('File not found');
        const mdText = await response.text();

        // 1. Dynamic Tab Title: Extract the first line starting with "## "
        const headerMatch = mdText.match(/^##\s+(.*)$/m);
        if (headerMatch && headerMatch[1]) {
            document.title = `TM | ${headerMatch[1].trim()}`;
        } else {
            // Fallback to formatted filename if ## header is missing
            const fileName = articlePath.split('/').pop().replace('.md', '').replace(/-/g, ' ');
            document.title = `TM | ${fileName.toUpperCase()}`;
        }

        // 2. Render Markdown content
        container.innerHTML = marked.parse(mdText);

        // 3. Prism syntax highlighting
        if (window.Prism) {
            Prism.highlightAllUnder(container);
        }
    } catch (err) {
        container.innerHTML = `<div class="item-danger">Error: ${err.message}</div>`;
        document.title = 'TM | Error';
    }
}

// Initialize application on page load
document.addEventListener('DOMContentLoaded', initApp);