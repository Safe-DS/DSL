# :test_tube:{ title="Experimental" } `#!sds class` `InputConversionTimeSeries` {#safeds.ml.nn.converters.InputConversionTimeSeries data-toc-label='[class] InputConversionTimeSeries'}

The input conversion for a neural network, defines the input parameters for the neural network.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `windowSize` | [`Int`][safeds.lang.Int] | The size of the created windows | - |
| `forecastHorizon` | [`Int`][safeds.lang.Int] | The forecast horizon defines the future lag of the predicted values | - |

??? quote "Stub code in `InputConversionTimeSeries.sdsstub`"

    ```sds linenums="10"
    class InputConversionTimeSeries(
        @PythonName("window_size") windowSize: Int,
        @PythonName("forecast_horizon") forecastHorizon: Int
    )
    ```
