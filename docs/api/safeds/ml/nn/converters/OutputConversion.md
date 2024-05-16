---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` OutputConversion {#safeds.ml.nn.converters.OutputConversion data-toc-label='OutputConversion'}

The output conversion for a neural network, defines the output parameters for the neural network.

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `PredictIn` | [`Any?`][safeds.lang.Any] | - | - |
| `PredictOut` | [`Any?`][safeds.lang.Any] | - | - |

**Inheritors:**

- [`OutputConversionImageToColumn`][safeds.ml.nn.converters.OutputConversionImageToColumn]
- [`OutputConversionImageToImage`][safeds.ml.nn.converters.OutputConversionImageToImage]
- [`OutputConversionImageToTable`][safeds.ml.nn.converters.OutputConversionImageToTable]
- [`OutputConversionTable`][safeds.ml.nn.converters.OutputConversionTable]

??? quote "Stub code in `OutputConversion.sdsstub`"

    ```sds linenums="7"
    class OutputConversion<PredictIn, PredictOut>
    ```
