# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-annotation"></code> `PythonMacro` {#safeds.lang.PythonMacro data-toc-label='[annotation] PythonMacro'}

The specification of the corresponding Python code. By default, the function is called as specified in the stubs.

The specification can contain template expressions, which are replaced by the corresponding arguments of the function
call. `$this` is replaced by the receiver of the call. `$param` is replaced by the value of the parameter called
`param`. Otherwise, the string is used as-is.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `template` | [`String`][safeds.lang.String] | - | - |

**Targets:**

- `Function`

??? quote "Stub code in `codeGeneration.sdsstub`"

    ```sds linenums="12"
    annotation PythonMacro(
        template: String
    )
    ```