# <code class="doc-symbol doc-symbol-class"></code> `InputConversionImageToImage` {#safeds.ml.nn.converters.InputConversionImageToImage data-toc-label='[class] InputConversionImageToImage'}

The input conversion for a neural network, defines the input parameters for the neural network.

**Parent type:** [`InputConversion<ImageDataset<ImageList>, ImageList>`][safeds.ml.nn.converters.InputConversion]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `imageSize` | [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize] | the size of the input images | - |

??? quote "Stub code in `InputConversionImageToImage.sdsstub`"

    ```sds linenums="10"
    class InputConversionImageToImage(
        @PythonName("image_size") imageSize: ModelImageSize
    ) sub InputConversion<ImageDataset<ImageList>, ImageList>
    ```
