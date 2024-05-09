# :test_tube:{ title="Experimental" } `#!sds class` MaxPooling2DLayer {#safeds.ml.nn.MaxPooling2DLayer data-toc-label='MaxPooling2DLayer'}

**Parent type:** [`Layer`][safeds.ml.nn.Layer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `kernelSize` | [`Int`][safeds.lang.Int] | - | - |
| `stride` | [`Int`][safeds.lang.Int] | - | - |
| `padding` | [`Int`][safeds.lang.Int] | - | `#!sds 0` |

??? quote "Stub code in `MaxPooling2DLayer.sdsstub`"

    ```sds linenums="10"
    class MaxPooling2DLayer(
        @PythonName("kernel_size") kernelSize: Int,
        stride: Int,
        padding: Int = 0
    ) sub Layer
    ```

## `#!sds attr` inputSize {#safeds.ml.nn.MaxPooling2DLayer.inputSize data-toc-label='inputSize'}

The input_size of this layer.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` outputSize {#safeds.ml.nn.MaxPooling2DLayer.outputSize data-toc-label='outputSize'}

The output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
