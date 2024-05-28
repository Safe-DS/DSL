# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `ForwardLayer` {#safeds.ml.nn.layers.ForwardLayer data-toc-label='[class] ForwardLayer'}

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `outputSize` | [`Int`][safeds.lang.Int] | The number of neurons in this layer | - |
| `inputSize` | [`Int?`][safeds.lang.Int] | The number of neurons in the previous layer | `#!sds null` |

??? quote "Stub code in `ForwardLayer.sdsstub`"

    ```sds linenums="10"
    class ForwardLayer(
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

## <code class="doc-symbol doc-symbol-attribute"></code> `inputSize` {#safeds.ml.nn.layers.ForwardLayer.inputSize data-toc-label='[attribute] inputSize'}

Get the input_size of this layer.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `outputSize` {#safeds.ml.nn.layers.ForwardLayer.outputSize data-toc-label='[attribute] outputSize'}

Get the output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]