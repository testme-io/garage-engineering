import jsbeautifier
import os


def beautify_file(file_path):
    if not os.path.exists(file_path):
        print(f"❌ File {file_path} not found")
        return

    opts = jsbeautifier.default_options()
    opts.indent_size = 4

    # 'expand' mode separates }, {
    opts.brace_style = "expand"

    opts.keep_array_indentation = True
    opts.end_with_newline = True

    # Ensure final brackets don't collapse
    opts.break_chained_methods = True
    opts.max_preserve_newlines = 2

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        res = jsbeautifier.beautify(content, opts)

        # Final check for "}]" formatting
        if res.endswith("}\n]"):
            pass
        else:
            res = res.replace("}]", "}\n]")

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(res)

        print(f"✨ {file_path} is now beautiful (and un-stuck)!")
    except Exception as e:
        print(f"🚨 Error: {e}")


if __name__ == "__main__":
    beautify_file("library.json")