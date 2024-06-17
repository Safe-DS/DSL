# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `MaxPooling2DLayer` {#safeds.ml.nn.layers.MaxPooling2DLayer data-toc-label='[class] MaxPooling2DLayer'}

A maximum Pooling 2D Layer.

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `kernelSize` | [`Int`][safeds.lang.Int] | the size of the kernel | - |
| `stride` | [`Int`][safeds.lang.Int] | the stride of the pooling | `#!sds -1` |
| `padding` | [`Int`][safeds.lang.Int] | the padding of the pooling | `#!sds 0` |

??? quote "Stub code in `MaxPooling2DLayer.sdsstub`"

    ```sds linenums="14"
    class MaxPooling2DLayer(
        @PythonName("kernel_size") kernelSize: Int,
        stride: Int = -1,
        padding: Int = 0
    ) sub Layer {
        /**
         * Get the input_size of this layer.
         */
        @PythonName("input_size") attr inputSize: ModelImageSize
        /**
         * Get the output_size of this layer.
         */
        @PythonName("output_size") attr outputSize: ModelImageSize
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `inputSize` {#safeds.ml.nn.layers.MaxPooling2DLayer.inputSize data-toc-label='[attribute] inputSize'}

Get the input_size of this layer.

**Type:** [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize]

## <code class="doc-symbol doc-symbol-attribute"></code> `outputSize` {#safeds.ml.nn.layers.MaxPooling2DLayer.outputSize data-toc-label='[attribute] outputSize'}

Get the output_size of this layer.

**Type:** [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize]
