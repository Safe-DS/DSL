# <code class="doc-symbol doc-symbol-segment"></code> `mySegment4` {#tests.generation.markdown.segments.documented.mySegment4 data-toc-label='[segment] mySegment4'}

Description of mySegment4.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `param1` | [`MyClass1`][tests.generation.markdown.segments.documented.MyClass1] | Description of param1. | - |
| `param2` | `#!sds Float` | Description of param2. | `#!sds 1.0` |

??? quote "Implementation code in `main.sds`"

    ```sds linenums="24"
    segment mySegment4(param1: MyClass1, param2: Float = 1.0) {}
    ```
