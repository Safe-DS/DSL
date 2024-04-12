# `#!sds segment` mySegment5 {#tests.generation.markdown.segments.documented.mySegment5 data-toc-label='mySegment5'}

Description of mySegment4.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`MyClass1`][tests.generation.markdown.segments.documented.MyClass1] | Description of result1. |
| `result2` | `#!sds Float` | Description of result2. |

??? quote "Implementation code in `main.sdspipe`"

    ```sds linenums="32"
    segment mySegment5() -> (result1: MyClass1, result2: Float) {
        yield result1 = MyClass1();
        yield result2 = 2.0;
    }
    ```
