# `#!sds segment` mySegment5 {#tests.generation.markdown.segments.undocumented.mySegment5 data-toc-label='mySegment5'}

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | `#!sds Int` | - |
| `result2` | `#!sds Float` | - |

??? quote "Source code in `main.sdspipe`"

    ```sds linenums="11"
    segment mySegment5() -> (result1: Int, result2: Float) {
        yield result1 = 1;
        yield result2 = 2.0;
    }
    ```
