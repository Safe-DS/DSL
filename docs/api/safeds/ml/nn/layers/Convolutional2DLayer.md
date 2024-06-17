# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `Convolutional2DLayer` {#safeds.ml.nn.layers.Convolutional2DLayer data-toc-label='[class] Convolutional2DLayer'}

A convolutional 2D Layer.

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `outputChannel` | [`Int`][safeds.lang.Int] | the amount of output channels | - |
| `kernelSize` | [`Int`][safeds.lang.Int] | the size of the kernel | - |
| `stride` | [`Int`][safeds.lang.Int] | the stride of the convolution | `#!sds 1` |
| `padding` | [`Int`][safeds.lang.Int] | the padding of the convolution | `#!sds 0` |

**Inheritors:**

- [`ConvolutionalTranspose2DLayer`][safeds.ml.nn.layers.ConvolutionalTranspose2DLayer]

??? quote "Stub code in `Convolutional2DLayer.sdsstub`"

    ```sds linenums="15"
    class Convolutional2DLayer(
        @PythonName("output_channel") outputChannel: Int,
        @PythonName("kernel_size") kernelSize: Int,
        stride: Int = 1,
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

## <code class="doc-symbol doc-symbol-attribute"></code> `inputSize` {#safeds.ml.nn.layers.Convolutional2DLayer.inputSize data-toc-label='[attribute] inputSize'}

Get the input_size of this layer.

**Type:** [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize]

## <code class="doc-symbol doc-symbol-attribute"></code> `outputSize` {#safeds.ml.nn.layers.Convolutional2DLayer.outputSize data-toc-label='[attribute] outputSize'}

Get the output_size of this layer.

**Type:** [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize]
