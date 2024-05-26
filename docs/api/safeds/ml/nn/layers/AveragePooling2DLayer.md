# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `AveragePooling2DLayer` {#safeds.ml.nn.layers.AveragePooling2DLayer data-toc-label='[class] AveragePooling2DLayer'}

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `kernelSize` | [`Int`][safeds.lang.Int] | the size of the kernel | - |
| `stride` | [`Int`][safeds.lang.Int] | the stride of the pooling | `#!sds -1` |
| `padding` | [`Int`][safeds.lang.Int] | the padding of the pooling | `#!sds 0` |

??? quote "Stub code in `AveragePooling2DLayer.sdsstub`"

    ```sds linenums="11"
    class AveragePooling2DLayer(
        @PythonName("kernel_size") kernelSize: Int,
        stride: Int = -1,
        padding: Int = 0
    ) sub Layer {
        /**
         * Get the input_size of this layer.
         */
        @PythonName("input_size") attr inputSize: ImageSize
        /**
         * Get the output_size of this layer.
         */
        @PythonName("output_size") attr outputSize: ImageSize
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `inputSize` {#safeds.ml.nn.layers.AveragePooling2DLayer.inputSize data-toc-label='[attribute] inputSize'}

Get the input_size of this layer.

**Type:** [`ImageSize`][safeds.data.image.typing.ImageSize]

## <code class="doc-symbol doc-symbol-attribute"></code> `outputSize` {#safeds.ml.nn.layers.AveragePooling2DLayer.outputSize data-toc-label='[attribute] outputSize'}

Get the output_size of this layer.

**Type:** [`ImageSize`][safeds.data.image.typing.ImageSize]
