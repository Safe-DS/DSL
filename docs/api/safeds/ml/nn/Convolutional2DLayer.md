# :test_tube:{ title="Experimental" } `#!sds class` Convolutional2DLayer {#safeds.ml.nn.Convolutional2DLayer data-toc-label='Convolutional2DLayer'}

**Parent type:** [`Layer`][safeds.ml.nn.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `outputChannel` | [`Int`][safeds.lang.Int] | the amount of output channels | - |
| `kernelSize` | [`Int`][safeds.lang.Int] | the size of the kernel | - |
| `stride` | [`Int`][safeds.lang.Int] | the stride of the convolution | `#!sds 1` |
| `padding` | [`Int`][safeds.lang.Int] | the padding of the convolution | `#!sds 0` |

**Inheritors:**

- [`ConvolutionalTranspose2DLayer`][safeds.ml.nn.ConvolutionalTranspose2DLayer]

??? quote "Stub code in `Convolutional2DLayer.sdsstub`"

    ```sds linenums="13"
    class Convolutional2DLayer(
        @PythonName("output_channel") outputChannel: Int,
        @PythonName("kernel_size") kernelSize: Int,
        stride: Int = 1,
        padding: Int = 0
    ) sub Layer
    ```

## `#!sds attr` inputSize {#safeds.ml.nn.Convolutional2DLayer.inputSize data-toc-label='inputSize'}

The input_size of this layer.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` outputSize {#safeds.ml.nn.Convolutional2DLayer.outputSize data-toc-label='outputSize'}

The output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
