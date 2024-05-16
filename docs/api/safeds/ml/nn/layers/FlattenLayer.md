# :test_tube:{ title="Experimental" } `#!sds class` FlattenLayer {#safeds.ml.nn.layers.FlattenLayer data-toc-label='FlattenLayer'}

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

??? quote "Stub code in `FlattenLayer.sdsstub`"

    ```sds linenums="7"
    class FlattenLayer() sub Layer {
        /**
         * Get the input_size of this layer.
         */
        @PythonName("input_size") attr inputSize: ImageSize
        /**
         * Get the output_size of this layer.
         */
        @PythonName("output_size") attr outputSize: Int
    }
    ```

## `#!sds attr` inputSize {#safeds.ml.nn.layers.FlattenLayer.inputSize data-toc-label='inputSize'}

Get the input_size of this layer.

**Type:** [`ImageSize`][safeds.data.image.typing.ImageSize]

## `#!sds attr` outputSize {#safeds.ml.nn.layers.FlattenLayer.outputSize data-toc-label='outputSize'}

Get the output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
