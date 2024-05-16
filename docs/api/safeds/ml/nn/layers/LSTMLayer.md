# :test_tube:{ title="Experimental" } `#!sds class` LSTMLayer {#safeds.ml.nn.layers.LSTMLayer data-toc-label='LSTMLayer'}

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `outputSize` | [`Int`][safeds.lang.Int] | The number of neurons in this layer | - |
| `inputSize` | [`Int?`][safeds.lang.Int] | The number of neurons in the previous layer | `#!sds null` |

??? quote "Stub code in `LSTMLayer.sdsstub`"

    ```sds linenums="10"
    class LSTMLayer(
        @PythonName("output_size") outputSize: Int,
        @PythonName("input_size") inputSize: Int? = null
    ) sub Layer {
        /**
         * Get the input_size of this layer.
         */
        @PythonName("input_size") attr inputSize: Int
        /**
         * Get the output_size of this layer.
         */
        @PythonName("output_size") attr outputSize: Int
    }
    ```

## `#!sds attr` inputSize {#safeds.ml.nn.layers.LSTMLayer.inputSize data-toc-label='inputSize'}

Get the input_size of this layer.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` outputSize {#safeds.ml.nn.layers.LSTMLayer.outputSize data-toc-label='outputSize'}

Get the output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
