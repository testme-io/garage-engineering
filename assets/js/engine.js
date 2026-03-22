async function initApp() {
    const container = document.getElementById('content');
    const urlParams = new URLSearchParams(window.location.search);
    const articlePath = urlParams.get('article') || 'articles/little-big-things/01-ruff.md';

    try {
        const response = await fetch(articlePath);
        if (!response.ok) throw new Error('File not found');
        const mdText = await response.text();

        // Render Markdown content
        container.innerHTML = marked.parse(mdText);

        // Prism syntax highlighting
        if (window.Prism) {
            Prism.highlightAllUnder(container);
        }
    } catch (err) {
        container.innerHTML = `<div class="item-danger">Error: ${err.message}</div>`;
    }
}

// Initialize application on page load
document.addEventListener('DOMContentLoaded', initApp);