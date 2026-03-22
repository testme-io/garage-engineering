# The "Little Big" Toolbox: Ruff 🚀

> One lightning-fast tool to replace your entire linting stack and keep your Python code clean


<my-card text="1">

## 01. Ruff — The Lightning-Fast Linter (Python ONLY)

Let’s start with the `linter`, your code’s first line of defense. Think of it as an automatic auditor that scans your text and catches issues before you even hit  <my-kbd>Run</my-kbd>


<div class="list-title">📁 Key Capabilities:</div>

<my-features>

* **Bug Detections:** Instantly identifies unused variables, broken logic, or forgotten library imports
* **Monitors Style:** Ensures the team sticks to a consistent style. For instance, making sure everyone uses double quotes instead of single quotes or maintaining a proper import order
* **Prevents Mistakes:** The linter can suggest that your code is too complex and should be broken into simpler parts

</my-features>



💊 `Little:` Zero Friction. Installation takes seconds and requires no configuration to start catching bugs immediately. Auto-fix most issues instantly with one command: <span class="cmd">ruff check --fix</span>

🦾 `Big:` Complete Control. One tool replaces a whole stack (Flake8, isort, Black, pyupgrade, and pydocstyle), consolidating your entire workflow into a single, clean config. Fewer dependencies mean a cleaner project and zero maintenance headaches.

🛡️ `Safe & Reliable:` Ruff distinguishes between "safe" fixes (like removing extra whitespace) and "dangerous" ones that might affect logic. By default, auto-fix only applies guaranteed safe changes. Backed by Astral, it is built for enterprise-grade stability.

📥 `Installation:` Just run <span class="cmd">pip install ruff</span> once in your environment to get started.

⚙️ `Zero Config:` It works out of the box with sensible defaults. No complex setup required.



🔄 `Example:` Refactoring Configuration. Consolidating scattered flags into a structured, modern format.

<my-before text="Messy imports & PEP8 violations">

```python
import os, sys  # Multiple imports on one line
from datetime import * # Wildcard imports
import pandas as pd

def calc(x,y):
    res=x+y  # No spaces, poor readability
    return res

unused_var = "I'm just wasting memory"
    my_list = ['apple', "banana"] # Mixed quotes
```
</my-before>



<my-after text="Ruff's 10ms Magic">

```python 
import os
import sys
from datetime import date

import pandas as pd

def calc(x, y):
    """Calculates result with proper spacing."""
    return x + y

my_list = ["apple", "banana"] # Standardized & cleaned
```  
</my-after>



<my-spoiler title="💡 Inside the Box (Default Behavior)">

**Error Detection (Pyflakes):** Activates core rules to catch critical mistakes:

* Unused imports (e.g., importing `s` but never using it)
* Unused variables (e.g., defining `x = 10` and never referencing it)
* Syntax errors and typos in variable or function names

**Style Compliance (pycodestyle):** Ensures your code aligns with PEP 8 standards:

* Line length limits
* Extra spaces at the end of lines
* Missing blank lines between functions

**Smart Suggestions:** Identifies redundant logic, such as duplicate imports or inefficient constructs (e.g., suggesting `if x == 10:` instead of the technically incorrect `if x is 10:`).

</my-spoiler>



<my-spoiler title="📁 Want to customize?">

Create a `pyproject.toml` in your project's root and add the `[tool.ruff]` section. This allows you to fine-tune the linter to your preferences:

<my-features>

* **Rule Selection:** Specify exactly what to check — from basic errors to `isort` (import sorting) and `flake8` rules.
* **Python Version:** Lock the version to prevent Ruff from suggesting features your environment doesn't support yet.
* **Line Length:** Stick to the classic 88 characters (Black style) or expand to 120 for wide monitors.

</my-features>

**⚡ My Recommended Config:** Here is a balanced setup I use to keep projects clean and consistent:

<pre>

[tool.ruff]
# Target Python version
target-version = "py310"
# Match Black's default line length
line-length = 88

# F: Pyflakes (errors)
# E/W: Pycodestyle (style)
# I: Isort (import sorting)
# B: Flake8-bugbear (common design issues)
select = ["F", "E", "W", "I", "B"]

# Keep this to avoid conflicts with the formatter
ignore = ["E501"]

[tool.ruff.format]
# Use double quotes (standard Black behavior)
quote-style = "double"
# Indent with spaces
indent-style = "space"

[tool.ruff.isort]
# Best practice for clean import blocks
lines-after-imports = 2
known-first-party = ["my_project"] # Replace with your app name

</pre>

</my-spoiler>



<my-spoiler title="🛠️ How to Run: Commands & Results">

Ruff provides different modes depending on whether you want to just peek at the errors or let the tool handle the cleanup:

<my-features>

* **Check only:** <span class="cmd">ruff check .</span>  
  Scans your project and lists issues without changing files. It acts as a report card for your code.

* **Preview changes (Diff):** <span class="cmd">ruff check --diff .</span>  
  Shows a Git-like "diff" highlighting exactly what will be changed. Great for staying in control.

* **Apply fixes:** <span class="cmd">ruff check --fix .</span>  
  Automatically repairs everything it can (unused imports, spacing, etc.). Files are updated instantly.

* **Format code:** <span class="cmd">ruff format .</span>  
  Re-aligns code structure (indents, quotes) to match the professional "Black" style.

* **Watch mode:** <span class="cmd">ruff check --watch .</span>  
  Stays active in the background and re-scans files every time you save. Perfect for hot-fixing.

</my-features>

</my-spoiler>

</my-card>