---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` InputConversion {#safeds.ml.nn.InputConversion data-toc-label='InputConversion'}

The input conversion for a neural network, defines the input parameters for the neural network.

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `FitIn` | [`Any?`][safeds.lang.Any] | - | - |
| `PredictIn` | [`Any?`][safeds.lang.Any] | - | - |

**Inheritors:**

- [`InputConversionTable`][safeds.ml.nn.InputConversionTable]

??? quote "Stub code in `input_conversion.sdsstub`"

    ```sds linenums="7"
    class InputConversion<FitIn, PredictIn>
    ```