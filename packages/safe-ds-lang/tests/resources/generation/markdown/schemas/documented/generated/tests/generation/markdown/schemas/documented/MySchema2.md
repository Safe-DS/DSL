# <code class="doc-symbol doc-symbol-schema"></code> `MySchema2` {#tests.generation.markdown.schemas.documented.MySchema2 data-toc-label='[schema] MySchema2'}

Description of MySchema2.

**Columns:**

| Name | Type |
|------|------|
| `column1` | [`MyClass`][tests.generation.markdown.schemas.documented.MyClass] |
| `column2` | `#!sds Int` |

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="13"
    schema MySchema2 {
        "column1": MyClass,
        "column2": Int,
    }
    ```
