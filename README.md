# Engineering Handbook (EH) 🛠️

Lightweight, zero-framework documentation engine used at **testme-io**

## 🚀 Overview
Zero-framework Markdown renderer with support for custom components. Designed for speed, simplicity, and zero-maintenance technical documentation.

- **Fast**: No build step, no compiler — just serve static files
- **Minimal**: Zero dependencies beyond Marked.js and Prism.js
- **Flexible**: Native support for custom shortcodes and Markdown/HTML composition
- **Transparent**: No hidden magic, just clean vanilla JavaScript

## 🧩 Features
- **Custom Shortcodes**: Use `[[card]]`, `[[spoiler]]`, and more for rich layouts
- **Nested Components**: Full support for nesting shortcodes within each other
- **Code Highlighting**: Professional syntax support via Prism.js
- **Deep Linking**: Direct access to articles via URL parameters
- **Dynamic Titles**: Browser tabs automatically sync with the first `##` header

## ✨ Markdown Extensions
```md
[[spoiler: Title § Hidden content /spoiler]]
```
*Renders into a native `<details>` component with custom interactive styling.*

## 📁 Structure
- `/articles` — Technical guides and documentation in `.md`
- `/assets/js` — Rendering engine (`engine.js`) and UI logic
- `/assets/css` — Visual styles and dark-themed patterns
- `/utils` — Maintenance and quality audit scripts (`find_cyrillic.py`)

## ⚙️ Development
No build step required. To preview the handbook locally:
```bash
python -m http.server 8000
# or using uv
uv run python -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000).

## 🤔 Why EH?
Most documentation tools are unnecessarily complex. We built **EH** to keep our knowledge base as simple as the code we write — fast, version-controlled, and completely transparent.

## 📝 Contribution Rules
1. Place new articles in the `/articles` directory
2. Use `##` for the first title in the `.md` file to set the browser tab title
3. Follow the established Markdown formatting for consistency

---
*Maintained by testme-io team*