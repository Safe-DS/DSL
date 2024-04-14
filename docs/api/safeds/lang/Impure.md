# :test_tube:{ title="Experimental" } `#!sds annotation` Impure {#safeds.lang.Impure data-toc-label='Impure'}

Indicates that the function has side effects and/or does not always return the same results given the same arguments.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `allReasons` | [`List<ImpurityReason>`][safeds.lang.List] | A list of **all** reasons why the function is impure. If no specific [ImpurityReason][safeds.lang.ImpurityReason] applies, include `ImpurityReason.Other`. | - |

**Targets:**

- `Function`

??? quote "Stub code in `purity.sdsstub`"

    ```sds linenums="22"
    annotation Impure(allReasons: List<ImpurityReason>)
    ```
