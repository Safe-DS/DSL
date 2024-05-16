# :test_tube:{ title="Experimental" } `#!sds class` OutputConversionTimeSeries {#safeds.ml.nn.converters.OutputConversionTimeSeries data-toc-label='OutputConversionTimeSeries'}

The output conversion for a neural network, defines the output parameters for the neural network.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predictionName` | [`String`][safeds.lang.String] | The name of the new column where the prediction will be stored. | `#!sds "prediction_nn"` |

??? quote "Stub code in `OutputConversionTimeSeries.sdsstub`"

    ```sds linenums="9"
    class OutputConversionTimeSeries(
        @PythonName("prediction_name") predictionName: String = "prediction_nn"
    )
    ```