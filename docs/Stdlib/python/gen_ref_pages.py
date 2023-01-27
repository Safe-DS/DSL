# Inspired by https://mkdocstrings.github.io/recipes/#bind-pages-to-sections-themselves

from importlib import import_module
from inspect import getmembers, isfunction, isclass
from pathlib import Path

import mkdocs_gen_files
import sys

def list_class_and_function_names_in_module(module_name: str) -> list[str]:
    import_module(module_name)
    module = sys.modules[module_name]

    return [
        name
        for name, obj in getmembers(module)
        if isfunction(obj) or isclass(obj)
    ]

nav = mkdocs_gen_files.Nav()

for path in sorted(Path("Runtime/safe-ds").rglob("__init__.py")):
    module_path = path.relative_to("Runtime/safe-ds").with_suffix("")
    doc_path = path.relative_to("Runtime/safe-ds").with_suffix(".md")
    full_doc_path = Path("reference", doc_path)

    # Skip demos, tests, etc.
    parts = tuple(module_path.parts)
    if parts[0] != "safe_ds":
        continue

    # Remove the final "__init__" part
    parts = parts[:-1]

    qualified_name = ".".join(parts)

    import_module(qualified_name)
    module = sys.modules[qualified_name]
    classes = getmembers(module, isclass)
    functions = getmembers(module, isfunction)

    for clazz in classes:
        class_name = clazz[0]
        print(clazz)

        doc_path = doc_path.with_name(f"{class_name}.md")
        full_doc_path = full_doc_path.with_name(f"{class_name}.md")

        nav[parts + (class_name,)] = doc_path.as_posix()

        with mkdocs_gen_files.open(full_doc_path, "w") as fd:
            ident = qualified_name + "." + clazz[0]
            fd.write(f"::: {ident}")

        mkdocs_gen_files.set_edit_path(full_doc_path, path)

    for func in functions:
        func_name = func[0]
        print(func)

        doc_path = doc_path.with_name(f"{func_name}.md")
        full_doc_path = full_doc_path.with_name(f"{func_name}.md")

        nav[parts + (func_name,)] = doc_path.as_posix()

        with mkdocs_gen_files.open(full_doc_path, "w") as fd:
            ident = qualified_name + "." + func[0]
            fd.write(f"::: {ident}")

        mkdocs_gen_files.set_edit_path(full_doc_path, path)

with mkdocs_gen_files.open("reference/SUMMARY.md", "w") as nav_file:
    nav_file.writelines(nav.build_literate_nav())
