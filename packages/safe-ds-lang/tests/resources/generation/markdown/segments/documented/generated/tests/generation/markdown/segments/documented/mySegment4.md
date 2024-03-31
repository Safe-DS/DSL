# `#!sds segment` mySegment4 {#tests.generation.markdown.segments.documented.mySegment4 data-toc-label='mySegment4'}

Description of mySegment4.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`#!sds MyClass1`][tests.generation.markdown.segments.documented.MyClass1] | Description of result1. |
| `result2` | `#!sds Float` | Description of result2. |

??? quote "Source code in `main.sdspipe`"

    ```sds linenums="27"
    segment mySegment4() -> (result1: MyClass1, result2: Float) {
        yield result1 = MyClass1();
        yield result2 = 2.0;
    }
    ```
