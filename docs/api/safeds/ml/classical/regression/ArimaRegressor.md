# `#!sds class` ArimaRegressor {#safeds.ml.classical.regression.ArimaRegressor data-toc-label='ArimaRegressor'}

Auto Regressive Integrated Moving Average Model.

??? quote "Stub code in `arima.sdsstub`"

    ```sds linenums="7"
    class ArimaRegressor() {
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
            @PythonName("time_series") timeSeries: TimeSeries
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
            @PythonName("time_series") timeSeries: TimeSeries
        ) -> timeSeries: TimeSeries

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
            @PythonName("test_series") testSeries: TimeSeries
        ) -> image: Image

        /**
         * Check if the classifier is fitted.
         *
         * @result isFitted Whether the regressor is fitted.
         */
        @Pure
        @PythonName("is_fitted")
        fun isFitted() -> isFitted: Boolean
    }
    ```

## `#!sds fun` fit {#safeds.ml.classical.regression.ArimaRegressor.fit data-toc-label='fit'}

Create a copy of this ARIMA Model and fit it with the given training data.

This ARIMA Model is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `timeSeries` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series containing the target column, which will be used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedArima` | [`ArimaRegressor`][safeds.ml.classical.regression.ArimaRegressor] | The fitted ARIMA Model. |

??? quote "Stub code in `arima.sdsstub`"

    ```sds linenums="17"
    @Pure
    fun fit(
        @PythonName("time_series") timeSeries: TimeSeries
    ) -> fittedArima: ArimaRegressor
    ```

## `#!sds fun` isFitted {#safeds.ml.classical.regression.ArimaRegressor.isFitted data-toc-label='isFitted'}

Check if the classifier is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `isFitted` | [`Boolean`][safeds.lang.Boolean] | Whether the regressor is fitted. |

??? quote "Stub code in `arima.sdsstub`"

    ```sds linenums="52"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> isFitted: Boolean
    ```

## `#!sds fun` plotPredictions {#safeds.ml.classical.regression.ArimaRegressor.plotPredictions data-toc-label='plotPredictions'}

Plot the predictions of the trained model to the given target of the time series. So you can see the predictions and the actual values in one plot.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `testSeries` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series containing the target vector. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `image` | [`Image`][safeds.data.image.containers.Image] | Plots predictions of the given time series to the given target Column |

??? quote "Stub code in `arima.sdsstub`"

    ```sds linenums="41"
    @Pure
    @PythonName("plot_predictions")
    fun plotPredictions(
        @PythonName("test_series") testSeries: TimeSeries
    ) -> image: Image
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.ArimaRegressor.predict data-toc-label='predict'}

Predict a target vector using a time series target column. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `timeSeries` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The test dataset of the time series. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `timeSeries` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A timeseries containing the predicted target vector and a time dummy as time column. |

??? quote "Stub code in `arima.sdsstub`"

    ```sds linenums="29"
    @Pure
    fun predict(
        @PythonName("time_series") timeSeries: TimeSeries
    ) -> timeSeries: TimeSeries
    ```
