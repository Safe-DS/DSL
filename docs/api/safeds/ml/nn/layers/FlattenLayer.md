# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `FlattenLayer` {#safeds.ml.nn.layers.FlattenLayer data-toc-label='[class] FlattenLayer'}

A flatten layer.

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

??? quote "Stub code in `FlattenLayer.sdsstub`"

    ```sds linenums="10"
    class FlattenLayer() sub Layer {
        /**
         * Get the input_size of this layer.
         */
        @PythonName("input_size") attr inputSize: ModelImageSize
        /**
         * Get the output_size of this layer.
         */
        @PythonName("output_size") attr outputSize: Int
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `inputSize` {#safeds.ml.nn.layers.FlattenLayer.inputSize data-toc-label='[attribute] inputSize'}

Get the input_size of this layer.

**Type:** [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize]

## <code class="doc-symbol doc-symbol-attribute"></code> `outputSize` {#safeds.ml.nn.layers.FlattenLayer.outputSize data-toc-label='[attribute] outputSize'}

Get the output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
