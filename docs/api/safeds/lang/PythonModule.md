# `#!sds annotation` PythonModule {#safeds.lang.PythonModule data-toc-label='PythonModule'}

The qualified name of the corresponding Python module. By default, this is the qualified name of the package in the
stubs.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `qualifiedName` | [`String`][safeds.lang.String] | - | - |

**Targets:**

- `Module`

??? quote "Stub code in `codeGeneration.sdsstub`"

    ```sds linenums="22"
    annotation PythonModule(
        qualifiedName: String
    )
    ```
