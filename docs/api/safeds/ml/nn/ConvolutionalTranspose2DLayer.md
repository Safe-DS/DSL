# :test_tube:{ title="Experimental" } `#!sds class` ConvolutionalTranspose2DLayer {#safeds.ml.nn.ConvolutionalTranspose2DLayer data-toc-label='ConvolutionalTranspose2DLayer'}

**Parent type:** [`Convolutional2DLayer`][safeds.ml.nn.Convolutional2DLayer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `outputChannel` | [`Int`][safeds.lang.Int] | the amount of output channels | - |
| `kernelSize` | [`Int`][safeds.lang.Int] | the size of the kernel | - |
| `stride` | [`Int`][safeds.lang.Int] | the stride of the transposed convolution | `#!sds 1` |
| `padding` | [`Int`][safeds.lang.Int] | the padding of the transposed convolution | `#!sds 0` |
| `outputPadding` | [`Int`][safeds.lang.Int] | the output padding of the transposed convolution | `#!sds 0` |

??? quote "Stub code in `ConvolutionalTranspose2DLayer.sdsstub`"

    ```sds linenums="14"
    class ConvolutionalTranspose2DLayer(
        @PythonName("output_channel") outputChannel: Int,
        @PythonName("kernel_size") kernelSize: Int,
        stride: Int = 1,
        padding: Int = 0,
        @PythonName("output_padding") outputPadding: Int = 0
    ) sub Convolutional2DLayer
    ```

## `#!sds attr` inputSize {#safeds.ml.nn.ConvolutionalTranspose2DLayer.inputSize data-toc-label='inputSize'}

The input_size of this layer.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` outputSize {#safeds.ml.nn.ConvolutionalTranspose2DLayer.outputSize data-toc-label='outputSize'}

The output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
