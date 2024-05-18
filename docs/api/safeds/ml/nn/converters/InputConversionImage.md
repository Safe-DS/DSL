# :test_tube:{ title="Experimental" } `#!sds class` InputConversionImage {#safeds.ml.nn.converters.InputConversionImage data-toc-label='[class] InputConversionImage'}

The input conversion for a neural network, defines the input parameters for the neural network.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `imageSize` | [`ImageSize`][safeds.data.image.typing.ImageSize] | the size of the input images | - |

??? quote "Stub code in `InputConversionImage.sdsstub`"

    ```sds linenums="11"
    class InputConversionImage(
        @PythonName("image_size") imageSize: ImageSize
    )
    ```
