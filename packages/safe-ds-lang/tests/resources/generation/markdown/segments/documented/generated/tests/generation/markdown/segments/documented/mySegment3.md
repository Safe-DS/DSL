# `#!sds segment` mySegment3 {#tests.generation.markdown.segments.documented.mySegment3 data-toc-label='mySegment3'}

Description of mySegment3.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `param1` | [`MyClass1`][tests.generation.markdown.segments.documented.MyClass1] | Description of param1. | - |
| `param2` | `#!sds Float` | Description of param2. | `#!sds 1.0` |

??? quote "Source code in `main.sdspipe`"

    ```sds linenums="19"
    segment mySegment3(param1: MyClass1, param2: Float = 1.0) {}
    ```
