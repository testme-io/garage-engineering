(function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    document.documentElement.className = savedTheme;
})();