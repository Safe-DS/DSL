# <code class="doc-symbol doc-symbol-annotation"></code> `PythonModule` {#safeds.lang.PythonModule data-toc-label='[annotation] PythonModule'}

The qualified name of the corresponding Python module. By default, this is the qualified name of the package in the
stubs.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `qualifiedName` | [`String`][safeds.lang.String] | - | - |

**Targets:**

- `Module`

??? quote "Stub code in `codeGeneration.sdsstub`"

    ```sds linenums="21"
    annotation PythonModule(
        qualifiedName: String
    )
    ```