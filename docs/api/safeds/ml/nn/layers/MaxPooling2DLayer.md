# :test_tube:{ title="Experimental" } `#!sds class` MaxPooling2DLayer {#safeds.ml.nn.layers.MaxPooling2DLayer data-toc-label='MaxPooling2DLayer'}

**Parent type:** [`Layer`][safeds.ml.nn.layers.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `kernelSize` | [`Int`][safeds.lang.Int] | the size of the kernel | - |
| `stride` | [`Int`][safeds.lang.Int] | the stride of the pooling | `#!sds -1` |
| `padding` | [`Int`][safeds.lang.Int] | the padding of the pooling | `#!sds 0` |

??? quote "Stub code in `MaxPooling2DLayer.sdsstub`"

    ```sds linenums="11"
    class MaxPooling2DLayer(
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

## `#!sds attr` inputSize {#safeds.ml.nn.layers.MaxPooling2DLayer.inputSize data-toc-label='inputSize'}

Get the input_size of this layer.

**Type:** [`ImageSize`][safeds.data.image.typing.ImageSize]

## `#!sds attr` outputSize {#safeds.ml.nn.layers.MaxPooling2DLayer.outputSize data-toc-label='outputSize'}

Get the output_size of this layer.

**Type:** [`ImageSize`][safeds.data.image.typing.ImageSize]
