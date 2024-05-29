# <code class="doc-symbol doc-symbol-class"></code> `InputConversionImageToColumn` {#safeds.ml.nn.converters.InputConversionImageToColumn data-toc-label='[class] InputConversionImageToColumn'}

The input conversion for a neural network, defines the input parameters for the neural network.

**Parent type:** [`InputConversion<ImageDataset<Column<Any?>>, ImageList>`][safeds.ml.nn.converters.InputConversion]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `imageSize` | [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize] | the size of the input images | - |

??? quote "Stub code in `InputConversionImageToColumn.sdsstub`"

    ```sds linenums="10"
    class InputConversionImageToColumn(
        @PythonName("image_size") imageSize: ModelImageSize
    ) sub InputConversion<ImageDataset<Column>, ImageList>
    ```
