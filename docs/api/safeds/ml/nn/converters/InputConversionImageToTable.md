# <code class="doc-symbol doc-symbol-class"></code> `InputConversionImageToTable` {#safeds.ml.nn.converters.InputConversionImageToTable data-toc-label='[class] InputConversionImageToTable'}

The input conversion for a neural network, defines the input parameters for the neural network.

**Parent type:** [`InputConversion<ImageDataset<Table>, ImageList>`][safeds.ml.nn.converters.InputConversion]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `imageSize` | [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize] | the size of the input images | - |

??? quote "Stub code in `InputConversionImageToTable.sdsstub`"

    ```sds linenums="10"
    class InputConversionImageToTable(
        @PythonName("image_size") imageSize: ModelImageSize
    )  sub InputConversion<ImageDataset<Table>, ImageList>
    ```
