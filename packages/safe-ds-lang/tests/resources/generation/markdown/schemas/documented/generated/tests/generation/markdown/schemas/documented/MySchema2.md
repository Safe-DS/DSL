# `#!sds schema` MySchema2 {#tests.generation.markdown.schemas.documented.MySchema2}

Description of MySchema2.

**Columns:**

| Name | Type |
|------|------|
| `column1` | `#!sds String` |
| `column2` | `#!sds Int` |
| `column3` | [`#!sds MyClass`][#tests.generation.markdown.schemas.documented.MyClass] |

??? quote "Source code in `main.sdsstub`"

    ```sds linenums="13"
    schema MySchema2 {
        "column1": String,
        "column2": Int,
        "column3": MyClass,
    }
    ```
