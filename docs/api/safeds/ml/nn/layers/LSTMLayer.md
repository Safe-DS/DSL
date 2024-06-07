# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `LSTMLayer` {#safeds.ml.nn.layers.LSTMLayer data-toc-label='[class] LSTMLayer'}

A long short-term memory (LSTM) layer.

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `neuronCount` | [`Int`][safeds.lang.Int] | The number of neurons in this layer | - |

??? quote "Stub code in `LSTMLayer.sdsstub`"

    ```sds linenums="11"
    class LSTMLayer(
        @PythonName("neuron_count") neuronCount: Int
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

## <code class="doc-symbol doc-symbol-attribute"></code> `inputSize` {#safeds.ml.nn.layers.LSTMLayer.inputSize data-toc-label='[attribute] inputSize'}

Get the input_size of this layer.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `outputSize` {#safeds.ml.nn.layers.LSTMLayer.outputSize data-toc-label='[attribute] outputSize'}

Get the output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
