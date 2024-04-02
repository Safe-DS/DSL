# :test_tube:{ title="Experimental" } `#!sds annotation` PythonCall {#safeds.lang.PythonCall data-toc-label='PythonCall'}

The specification of a corresponding function call in Python. By default, the function is called as specified in the
stub.

The specification can contain template expressions, which are replaced by the corresponding arguments of the function
call. `$this` is replaced by the receiver of the call. `$param` is replaced by the value of the parameter called
`param`. Otherwise, the string is used as-is.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `callSpecification` | [`String`][safeds.lang.String] | - | - |

**Targets:**

- `Function`

??? quote "Source code in `codeGeneration.sdsstub`"

    ```sds linenums="13"
    annotation PythonCall(
        callSpecification: String
    )
    ```
