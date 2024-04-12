# `#!sds annotation` PythonName {#safeds.lang.PythonName data-toc-label='PythonName'}

The name of the corresponding API element in Python. By default, this is the name of the declaration in the stubs.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | - | - |

**Targets:**

- `Attribute`
- `Class`
- `Enum`
- `EnumVariant`
- `Function`
- `Parameter`
- `Pipeline`
- `Segment`

??? quote "Stub code in `codeGeneration.sdsstub`"

    ```sds linenums="38"
    annotation PythonName(
        name: String
    )
    ```
