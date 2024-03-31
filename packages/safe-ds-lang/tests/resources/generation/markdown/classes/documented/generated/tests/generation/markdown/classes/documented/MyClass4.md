# `#!sds class` MyClass4 {#tests.generation.markdown.classes.documented.MyClass4 data-toc-label='MyClass4'}

Description of MyClass4.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `param1` | [`#!sds MyClass1`][tests.generation.markdown.classes.documented.MyClass1] | Description of param1. | - |
| `param2` | `#!sds Float` | Description of param2. | `#!sds 1.0` |

??? quote "Source code in `main.sdsstub`"

    ```sds linenums="28"
    class MyClass4(param1: MyClass1, param2: Float = 1.0)
    ```
