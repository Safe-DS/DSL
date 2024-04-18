# `#!sds annotation` PythonModule {#safeds.lang.PythonModule data-toc-label='PythonModule'}

The qualified name of the corresponding Python module. By default, this is the qualified name of the package.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `qualifiedName` | [`String`][safeds.lang.String] | - | - |

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
- `Segment`
- `TypeParameter`

??? quote "Stub code in `codeGeneration.sdsstub`"

    ```sds linenums="21"
    annotation PythonModule(
        qualifiedName: String
    )
    ```
