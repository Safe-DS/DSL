# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `InputConversionTimeSeries` {#safeds.ml.nn.converters.InputConversionTimeSeries data-toc-label='[class] InputConversionTimeSeries'}

The input conversion for a neural network, defines the input parameters for the neural network.

**Parent type:** [`InputConversion<TimeSeriesDataset, TimeSeriesDataset>`][safeds.ml.nn.converters.InputConversion]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predictionName` | [`String`][safeds.lang.String] | The name of the new column where the prediction will be stored. | `#!sds "prediction_nn"` |

??? quote "Stub code in `InputConversionTimeSeries.sdsstub`"

    ```sds linenums="9"
    class InputConversionTimeSeries(
        @PythonName("prediction_name") predictionName: String = "prediction_nn"
    ) sub InputConversion<TimeSeriesDataset, TimeSeriesDataset>
    ```
