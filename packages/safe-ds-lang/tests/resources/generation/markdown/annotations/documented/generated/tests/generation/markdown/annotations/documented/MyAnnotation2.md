# <code class="doc-symbol doc-symbol-annotation"></code> `MyAnnotation2` {#tests.generation.markdown.annotations.documented.MyAnnotation2 data-toc-label='[annotation] MyAnnotation2'}

Description of MyAnnotation2.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `param1` | [`MyEnum1`][tests.generation.markdown.annotations.documented.MyEnum1] | Description of param1. | - |
| `param2` | `#!sds Float` | Description of param2. | `#!sds 1.0` |

**Targets:**

- `Annotation`
- `Attribute`
- `Class`
- `Enum`
- `EnumVariant`
- `Function`
- `Module`
- `Parameter`
- `Pipeline`
- `Result`
- `Schema`
- `Segment`
- `TypeParameter`

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="14"
    annotation MyAnnotation2(param1: MyEnum1, param2: Float = 1.0)
    ```
