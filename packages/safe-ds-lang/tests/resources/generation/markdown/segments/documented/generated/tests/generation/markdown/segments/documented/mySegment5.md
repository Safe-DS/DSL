[//]: # (DO NOT EDIT THIS FILE DIRECTLY. Instead, edit the corresponding stub file and execute `npm run docs:api`.)

# <code class="doc-symbol doc-symbol-segment"></code> `mySegment5` {#tests.generation.markdown.segments.documented.mySegment5 data-toc-label='[segment] mySegment5'}

Description of mySegment5.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`MyClass1`][tests.generation.markdown.segments.documented.MyClass1] | Description of result1. |
| `result2` | `#!sds Float` | Description of result2. |

??? quote "Implementation code in `main.sds`"

    ```sds linenums="32"
    segment mySegment5() -> (result1: MyClass1, result2: Float) {
        yield result1 = MyClass1();
        yield result2 = 2.0;
    }
    ```
    { data-search-exclude }
