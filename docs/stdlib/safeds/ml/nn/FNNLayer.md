# `#!sds class` FNNLayer {#safeds.ml.nn.FNNLayer data-toc-label='FNNLayer'}

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `outputSize` | [`Int`][safeds.lang.Int] | The number of neurons in this layer | - |
| `inputSize` | [`Int?`][safeds.lang.Int] | The number of neurons in the previous layer | `#!sds null` |

??? quote "Source code in `layer.sdsstub`"

    ```sds linenums="7"
    class FNNLayer(
        @PythonName("output_size") outputSize: Int,
        @PythonName("input_size") inputSize: Int? = null
    ) {
        /**
         * Get the output_size of this layer.
         */
        @PythonName("output_size") attr outputSize: Int
    }
    ```

## `#!sds attr` outputSize {#safeds.ml.nn.FNNLayer.outputSize data-toc-label='outputSize'}

Get the output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
