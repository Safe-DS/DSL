# `#!sds segment` mySegment4 {#tests.generation.markdown.segments.undocumented.mySegment4 data-toc-label='mySegment4'}

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | `#!sds Int` | - |
| `result2` | `#!sds Float` | - |

??? quote "Source code in `main.sdspipe`"

    ```sds linenums="9"
    segment mySegment4() -> (result1: Int, result2: Float) {
        yield result1 = 1;
        yield result2 = 2.0;
    }
    ```
