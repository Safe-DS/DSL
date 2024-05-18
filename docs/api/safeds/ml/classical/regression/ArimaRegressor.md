# :test_tube:{ title="Experimental" } `#!sds class` ArimaRegressor {#safeds.ml.classical.regression.ArimaRegressor data-toc-label='[class] ArimaRegressor'}

Auto Regressive Integrated Moving Average Model.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `ArimaRegressor.sdsstub`"

    ```sds linenums="16"
    class ArimaRegressor() {
        /**
         * Whether the regressor is fitted.
         */
        @PythonName("is_fitted") attr isFitted: Boolean

        /**
         * Create a copy of this ARIMA Model and fit it with the given training data.
         *
         * This ARIMA Model is not modified.
         *
         * @param timeSeries The time series containing the target column, which will be used.
         *
         * @result fittedArima The fitted ARIMA Model.
         */
        @Pure
        fun fit(
            @PythonName("time_series") timeSeries: TimeSeriesDataset
        ) -> fittedArima: ArimaRegressor

        /**
         * Predict a target vector using a time series target column. The model has to be trained first.
         *
         * @param timeSeries The test dataset of the time series.
         *
         * @result timeSeries A timeseries containing the predicted target vector and a time dummy as time column.
         */
        @Pure
        fun predict(
            @PythonName("time_series") timeSeries: TimeSeriesDataset
        ) -> timeSeries: TimeSeriesDataset

        /**
         * Plot the predictions of the trained model to the given target of the time series. So you can see the predictions and the actual values in one plot.
         *
         * @param testSeries The time series containing the target vector.
         *
         * @result image Plots predictions of the given time series to the given target Column
         */
        @Pure
        @PythonName("plot_predictions")
        fun plotPredictions(
            @PythonName("test_series") testSeries: TimeSeriesDataset
        ) -> image: Image
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.regression.ArimaRegressor.isFitted data-toc-label='[attr] isFitted'}

Whether the regressor is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.ml.classical.regression.ArimaRegressor.fit data-toc-label='[fun] fit'}

Create a copy of this ARIMA Model and fit it with the given training data.

This ARIMA Model is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `timeSeries` | [`TimeSeriesDataset`][safeds.data.labeled.containers.TimeSeriesDataset] | The time series containing the target column, which will be used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedArima` | [`ArimaRegressor`][safeds.ml.classical.regression.ArimaRegressor] | The fitted ARIMA Model. |

??? quote "Stub code in `ArimaRegressor.sdsstub`"

    ```sds linenums="31"
    @Pure
    fun fit(
        @PythonName("time_series") timeSeries: TimeSeriesDataset
    ) -> fittedArima: ArimaRegressor
    ```

## `#!sds fun` plotPredictions {#safeds.ml.classical.regression.ArimaRegressor.plotPredictions data-toc-label='[fun] plotPredictions'}

Plot the predictions of the trained model to the given target of the time series. So you can see the predictions and the actual values in one plot.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `testSeries` | [`TimeSeriesDataset`][safeds.data.labeled.containers.TimeSeriesDataset] | The time series containing the target vector. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `image` | [`Image`][safeds.data.image.containers.Image] | Plots predictions of the given time series to the given target Column |

??? quote "Stub code in `ArimaRegressor.sdsstub`"

    ```sds linenums="55"
    @Pure
    @PythonName("plot_predictions")
    fun plotPredictions(
        @PythonName("test_series") testSeries: TimeSeriesDataset
    ) -> image: Image
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.ArimaRegressor.predict data-toc-label='[fun] predict'}

Predict a target vector using a time series target column. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `timeSeries` | [`TimeSeriesDataset`][safeds.data.labeled.containers.TimeSeriesDataset] | The test dataset of the time series. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `timeSeries` | [`TimeSeriesDataset`][safeds.data.labeled.containers.TimeSeriesDataset] | A timeseries containing the predicted target vector and a time dummy as time column. |

??? quote "Stub code in `ArimaRegressor.sdsstub`"

    ```sds linenums="43"
    @Pure
    fun predict(
        @PythonName("time_series") timeSeries: TimeSeriesDataset
    ) -> timeSeries: TimeSeriesDataset
    ```
