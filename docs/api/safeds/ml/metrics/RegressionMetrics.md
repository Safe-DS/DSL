# `#!sds abstract class` `RegressionMetrics` {#safeds.ml.metrics.RegressionMetrics data-toc-label='[abstract class] RegressionMetrics'}

A collection of regression metrics.

??? quote "Stub code in `RegressionMetrics.sdsstub`"

    ```sds linenums="9"
    class RegressionMetrics {
        /**
         * Summarize regression metrics on the given data.
         *
         * @param predicted The predicted target values produced by the regressor.
         * @param expected The expected target values.
         *
         * @result metrics A table containing the regression metrics.
         */
        @Pure
        static fun summarize(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>
        ) -> metrics: Table

        /**
         * Compute the coefficient of determination (R²) on the given data.
         *
         * The coefficient of determination compares the regressor's predictions to another model that always predicts the
         * mean of the target values. It is a measure of how well the regressor explains the variance in the target values.
         *
         * The **higher** the coefficient of determination, the better the regressor. Results range from negative infinity
         * to 1.0. You can interpret the coefficient of determination as follows:
         *
         * | R²         | Interpretation                                                                             |
         * | ---------- | ------------------------------------------------------------------------------------------ |
         * | 1.0        | The model perfectly predicts the target values. Did you overfit?                           |
         * | (0.0, 1.0) | The model is better than predicting the mean of the target values. You should be here.     |
         * | 0.0        | The model is as good as predicting the mean of the target values. Try something else.      |
         * | (-∞, 0.0)  | The model is worse than predicting the mean of the target values. Something is very wrong. |
         *
         * **Note:** Some other libraries call this metric `r2_score`.
         *
         * @param predicted The predicted target values produced by the regressor.
         * @param expected The expected target values.
         *
         * @result coefficientOfDetermination The calculated coefficient of determination.
         */
        @Pure
        @PythonName("coefficient_of_determination")
        static fun coefficientOfDetermination(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>
        ) -> coefficientOfDetermination: Float

        /**
         * Compute the mean absolute error (MAE) on the given data.
         *
         * The mean absolute error is the average of the absolute differences between the predicted and expected target
         * values. The **lower** the mean absolute error, the better the regressor. Results range from 0.0 to positive
         * infinity.
         *
         * @param predicted The predicted target values produced by the regressor.
         * @param expected The expected target values.
         *
         * @result meanAbsoluteError The calculated mean absolute error.
         */
        @Pure
        @PythonName("mean_absolute_error")
        static fun meanAbsoluteError(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>
        ) -> meanAbsoluteError: Float

        /**
         * Compute the mean directional accuracy (MDA) on the given data.
         *
         * This metric compares two consecutive target values and checks if the predicted direction (down/unchanged/up)
         * matches the expected direction. The mean directional accuracy is the proportion of correctly predicted
         * directions. The **higher** the mean directional accuracy, the better the regressor. Results range from 0.0 to
         * 1.0.
         *
         * This metric is useful for time series data, where the order of the target values has a meaning. It is not useful
         * for other types of data. Because of this, it is not included in the `summarize` method.
         *
         * @param predicted The predicted target values produced by the regressor.
         * @param expected The expected target values.
         *
         * @result meanDirectionalAccuracy The calculated mean directional accuracy.
         */
        @Pure
        @PythonName("mean_directional_accuracy")
        static fun meanDirectionalAccuracy(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>
        ) -> meanDirectionalAccuracy: Float

        /**
         * Compute the mean squared error (MSE) on the given data.
         *
         * The mean squared error is the average of the squared differences between the predicted and expected target
         * values. The **lower** the mean squared error, the better the regressor. Results range from 0.0 to positive
         * infinity.
         *
         * **Note:** To get the root mean squared error (RMSE), take the square root of the result.
         *
         * @param predicted The predicted target values produced by the regressor.
         * @param expected The expected target values.
         *
         * @result meanSquaredError The calculated mean squared error.
         */
        @Pure
        @PythonName("mean_squared_error")
        static fun meanSquaredError(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>
        ) -> meanSquaredError: Float

        /**
         * Compute the median absolute deviation (MAD) on the given data.
         *
         * The median absolute deviation is the median of the absolute differences between the predicted and expected
         * target values. The **lower** the median absolute deviation, the better the regressor. Results range from 0.0 to
         * positive infinity.
         *
         * @param predicted The predicted target values produced by the regressor.
         * @param expected The expected target values.
         *
         * @result medianAbsoluteDeviation The calculated median absolute deviation.
         */
        @Pure
        @PythonName("median_absolute_deviation")
        static fun medianAbsoluteDeviation(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>
        ) -> medianAbsoluteDeviation: Float
    }
    ```

## `#!sds static fun` `coefficientOfDetermination` {#safeds.ml.metrics.RegressionMetrics.coefficientOfDetermination data-toc-label='[static fun] coefficientOfDetermination'}

Compute the coefficient of determination (R²) on the given data.

The coefficient of determination compares the regressor's predictions to another model that always predicts the
mean of the target values. It is a measure of how well the regressor explains the variance in the target values.

The **higher** the coefficient of determination, the better the regressor. Results range from negative infinity
to 1.0. You can interpret the coefficient of determination as follows:

| R²         | Interpretation                                                                             |
| ---------- | ------------------------------------------------------------------------------------------ |
| 1.0        | The model perfectly predicts the target values. Did you overfit?                           |
| (0.0, 1.0) | The model is better than predicting the mean of the target values. You should be here.     |
| 0.0        | The model is as good as predicting the mean of the target values. Try something else.      |
| (-∞, 0.0)  | The model is worse than predicting the mean of the target values. Something is very wrong. |

**Note:** Some other libraries call this metric `r2_score`.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the regressor. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `coefficientOfDetermination` | [`Float`][safeds.lang.Float] | The calculated coefficient of determination. |

??? quote "Stub code in `RegressionMetrics.sdsstub`"

    ```sds linenums="47"
    @Pure
    @PythonName("coefficient_of_determination")
    static fun coefficientOfDetermination(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>
    ) -> coefficientOfDetermination: Float
    ```

## `#!sds static fun` `meanAbsoluteError` {#safeds.ml.metrics.RegressionMetrics.meanAbsoluteError data-toc-label='[static fun] meanAbsoluteError'}

Compute the mean absolute error (MAE) on the given data.

The mean absolute error is the average of the absolute differences between the predicted and expected target
values. The **lower** the mean absolute error, the better the regressor. Results range from 0.0 to positive
infinity.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the regressor. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The calculated mean absolute error. |

??? quote "Stub code in `RegressionMetrics.sdsstub`"

    ```sds linenums="66"
    @Pure
    @PythonName("mean_absolute_error")
    static fun meanAbsoluteError(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>
    ) -> meanAbsoluteError: Float
    ```

## `#!sds static fun` `meanDirectionalAccuracy` {#safeds.ml.metrics.RegressionMetrics.meanDirectionalAccuracy data-toc-label='[static fun] meanDirectionalAccuracy'}

Compute the mean directional accuracy (MDA) on the given data.

This metric compares two consecutive target values and checks if the predicted direction (down/unchanged/up)
matches the expected direction. The mean directional accuracy is the proportion of correctly predicted
directions. The **higher** the mean directional accuracy, the better the regressor. Results range from 0.0 to
1.0.

This metric is useful for time series data, where the order of the target values has a meaning. It is not useful
for other types of data. Because of this, it is not included in the `summarize` method.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the regressor. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanDirectionalAccuracy` | [`Float`][safeds.lang.Float] | The calculated mean directional accuracy. |

??? quote "Stub code in `RegressionMetrics.sdsstub`"

    ```sds linenums="89"
    @Pure
    @PythonName("mean_directional_accuracy")
    static fun meanDirectionalAccuracy(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>
    ) -> meanDirectionalAccuracy: Float
    ```

## `#!sds static fun` `meanSquaredError` {#safeds.ml.metrics.RegressionMetrics.meanSquaredError data-toc-label='[static fun] meanSquaredError'}

Compute the mean squared error (MSE) on the given data.

The mean squared error is the average of the squared differences between the predicted and expected target
values. The **lower** the mean squared error, the better the regressor. Results range from 0.0 to positive
infinity.

**Note:** To get the root mean squared error (RMSE), take the square root of the result.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the regressor. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The calculated mean squared error. |

??? quote "Stub code in `RegressionMetrics.sdsstub`"

    ```sds linenums="110"
    @Pure
    @PythonName("mean_squared_error")
    static fun meanSquaredError(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>
    ) -> meanSquaredError: Float
    ```

## `#!sds static fun` `medianAbsoluteDeviation` {#safeds.ml.metrics.RegressionMetrics.medianAbsoluteDeviation data-toc-label='[static fun] medianAbsoluteDeviation'}

Compute the median absolute deviation (MAD) on the given data.

The median absolute deviation is the median of the absolute differences between the predicted and expected
target values. The **lower** the median absolute deviation, the better the regressor. Results range from 0.0 to
positive infinity.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the regressor. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `medianAbsoluteDeviation` | [`Float`][safeds.lang.Float] | The calculated median absolute deviation. |

??? quote "Stub code in `RegressionMetrics.sdsstub`"

    ```sds linenums="129"
    @Pure
    @PythonName("median_absolute_deviation")
    static fun medianAbsoluteDeviation(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>
    ) -> medianAbsoluteDeviation: Float
    ```

## `#!sds static fun` `summarize` {#safeds.ml.metrics.RegressionMetrics.summarize data-toc-label='[static fun] summarize'}

Summarize regression metrics on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the regressor. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `metrics` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the regression metrics. |

??? quote "Stub code in `RegressionMetrics.sdsstub`"

    ```sds linenums="18"
    @Pure
    static fun summarize(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>
    ) -> metrics: Table
    ```
