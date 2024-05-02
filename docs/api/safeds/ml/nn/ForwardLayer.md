# :test_tube:{ title="Experimental" } `#!sds class` ForwardLayer {#safeds.ml.nn.ForwardLayer data-toc-label='ForwardLayer'}

**Parent type:** `#!sds Layer`

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `outputSize` | [`Int`][safeds.lang.Int] | The number of neurons in this layer | - |
| `inputSize` | [`Int?`][safeds.lang.Int] | The number of neurons in the previous layer | `#!sds null` |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `forward_layer.sdsstub`"

    ```sds linenums="13"
    class ForwardLayer(
        @PythonName("output_size") outputSize: Int,
        @PythonName("input_size") inputSize: Int? = null
    ) sub Layer
    ```

## `#!sds attr` inputSize {#safeds.ml.nn.ForwardLayer.inputSize data-toc-label='inputSize'}

Get the input_size of this layer.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` outputSize {#safeds.ml.nn.ForwardLayer.outputSize data-toc-label='outputSize'}

Get the output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
