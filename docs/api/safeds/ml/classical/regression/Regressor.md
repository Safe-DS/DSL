---
search:
  boost: 0.5
---

# `#!sds abstract class` Regressor {#safeds.ml.classical.regression.Regressor data-toc-label='Regressor'}

A model for regression tasks.

**Parent type:** [`SupervisedModel`][safeds.ml.classical.SupervisedModel]

**Inheritors:**

- [`AdaBoostRegressor`][safeds.ml.classical.regression.AdaBoostRegressor]
- [`DecisionTreeRegressor`][safeds.ml.classical.regression.DecisionTreeRegressor]
- [`ElasticNetRegressor`][safeds.ml.classical.regression.ElasticNetRegressor]
- [`GradientBoostingRegressor`][safeds.ml.classical.regression.GradientBoostingRegressor]
- [`KNearestNeighborsRegressor`][safeds.ml.classical.regression.KNearestNeighborsRegressor]
- [`LassoRegressor`][safeds.ml.classical.regression.LassoRegressor]
- `#!sds LinearRegressionRegressor`
- [`LinearRegressor`][safeds.ml.classical.regression.LinearRegressor]
- [`RandomForestRegressor`][safeds.ml.classical.regression.RandomForestRegressor]
- [`RidgeRegressor`][safeds.ml.classical.regression.RidgeRegressor]
- `#!sds SupportVectorMachineRegressor`
- [`SupportVectorRegressor`][safeds.ml.classical.regression.SupportVectorRegressor]

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="10"
    class Regressor sub SupervisedModel {
        /**
         * Summarize the regressor's metrics on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result metrics A table containing the regressor's metrics.
         */
        @Pure
        @PythonName("summarize_metrics")
        fun summarizeMetrics(
            @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
        ) -> metrics: Table

        /**
         * Compute the coefficient of determination (R²) of the regressor on the given data.
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
         * @param validationOrTestSet The validation or test set.
         *
         * @result coefficientOfDetermination The coefficient of determination of the regressor.
         */
        @Pure
        @PythonName("coefficient_of_determination")
        fun coefficientOfDetermination(
            @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
        ) -> coefficientOfDetermination: Float

        /**
         * Compute the mean absolute error (MAE) of the regressor on the given data.
         *
         * The mean absolute error is the average of the absolute differences between the predicted and expected target
         * values. The **lower** the mean absolute error, the better the regressor. Results range from 0.0 to positive
         * infinity.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result meanAbsoluteError The mean absolute error of the regressor.
         */
        @Pure
        @PythonName("mean_absolute_error")
        fun meanAbsoluteError(
            @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
        ) -> meanAbsoluteError: Float

        /**
         * Compute the mean directional accuracy (MDA) of the regressor on the given data.
         *
         * This metric compares two consecutive target values and checks if the predicted direction (down/unchanged/up)
         * matches the expected direction. The mean directional accuracy is the proportion of correctly predicted
         * directions. The **higher** the mean directional accuracy, the better the regressor. Results range from 0.0 to
         * 1.0.
         *
         * This metric is useful for time series data, where the order of the target values has a meaning. It is not useful
         * for other types of data. Because of this, it is not included in the `summarize_metrics` method.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result meanDirectionalAccuracy The mean directional accuracy of the regressor.
         */
        @Pure
        @PythonName("mean_directional_accuracy")
        fun meanDirectionalAccuracy(
            @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
        ) -> meanDirectionalAccuracy: Float

        /**
         * Compute the mean squared error (MSE) of the regressor on the given data.
         *
         * The mean squared error is the average of the squared differences between the predicted and expected target
         * values. The **lower** the mean squared error, the better the regressor. Results range from 0.0 to positive
         * infinity.
         *
         * **Note:** To get the root mean squared error (RMSE), take the square root of the result.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result meanSquaredError The mean squared error of the regressor.
         */
        @Pure
        @PythonName("mean_squared_error")
        fun meanSquaredError(
            @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
        ) -> meanSquaredError: Float

        /**
         * Compute the median absolute deviation (MAD) of the regressor on the given data.
         *
         * The median absolute deviation is the median of the absolute differences between the predicted and expected
         * target values. The **lower** the median absolute deviation, the better the regressor. Results range from 0.0 to
         * positive infinity.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result medianAbsoluteDeviation The median absolute deviation of the regressor.
         */
        @Pure
        @PythonName("median_absolute_deviation")
        fun medianAbsoluteDeviation(
            @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
        ) -> medianAbsoluteDeviation: Float
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.regression.Regressor.isFitted data-toc-label='isFitted'}

Whether the model is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` coefficientOfDetermination {#safeds.ml.classical.regression.Regressor.coefficientOfDetermination data-toc-label='coefficientOfDetermination'}

Compute the coefficient of determination (R²) of the regressor on the given data.

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
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `coefficientOfDetermination` | [`Float`][safeds.lang.Float] | The coefficient of determination of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="46"
    @Pure
    @PythonName("coefficient_of_determination")
    fun coefficientOfDetermination(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> coefficientOfDetermination: Float
    ```

## `#!sds fun` fit {#safeds.ml.classical.regression.Regressor.fit data-toc-label='fit'}

Create a copy of this model and fit it with the given training data.

**Note:** This model is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The training data containing the features and target. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedModel` | [`SupervisedModel`][safeds.ml.classical.SupervisedModel] | The fitted model. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="26"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TabularDataset
    ) -> fittedModel: SupervisedModel
    ```

## `#!sds fun` getFeatureNames {#safeds.ml.classical.regression.Regressor.getFeatureNames data-toc-label='getFeatureNames'}

Return the names of the feature columns.

**Note:** The model must be fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `featureNames` | [`List<String>`][safeds.lang.List] | The names of the feature columns. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="52"
    @Pure
    @PythonName("get_feature_names")
    fun getFeatureNames() -> featureNames: List<String>
    ```

## `#!sds fun` getFeaturesSchema {#safeds.ml.classical.regression.Regressor.getFeaturesSchema data-toc-label='getFeaturesSchema'}

Return the schema of the feature columns.

**Note:** The model must be fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `featureSchema` | [`Schema`][safeds.data.tabular.typing.Schema] | The schema of the feature columns. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="63"
    @Pure
    @PythonName("get_features_schema")
    fun getFeaturesSchema() -> featureSchema: Schema
    ```

## `#!sds fun` getTargetName {#safeds.ml.classical.regression.Regressor.getTargetName data-toc-label='getTargetName'}

Return the name of the target column.

**Note:** The model must be fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `targetName` | [`String`][safeds.lang.String] | The name of the target column. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="74"
    @Pure
    @PythonName("get_target_name")
    fun getTargetName() -> targetName: String
    ```

## `#!sds fun` getTargetType {#safeds.ml.classical.regression.Regressor.getTargetType data-toc-label='getTargetType'}

Return the type of the target column.

**Note:** The model must be fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `targetType` | [`DataType`][safeds.data.tabular.typing.DataType] | The type of the target column. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="85"
    @Pure
    @PythonName("get_target_type")
    fun getTargetType() -> targetType: DataType
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.Regressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

Compute the mean absolute error (MAE) of the regressor on the given data.

The mean absolute error is the average of the absolute differences between the predicted and expected target
values. The **lower** the mean absolute error, the better the regressor. Results range from 0.0 to positive
infinity.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The mean absolute error of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="63"
    @Pure
    @PythonName("mean_absolute_error")
    fun meanAbsoluteError(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> meanAbsoluteError: Float
    ```

## `#!sds fun` meanDirectionalAccuracy {#safeds.ml.classical.regression.Regressor.meanDirectionalAccuracy data-toc-label='meanDirectionalAccuracy'}

Compute the mean directional accuracy (MDA) of the regressor on the given data.

This metric compares two consecutive target values and checks if the predicted direction (down/unchanged/up)
matches the expected direction. The mean directional accuracy is the proportion of correctly predicted
directions. The **higher** the mean directional accuracy, the better the regressor. Results range from 0.0 to
1.0.

This metric is useful for time series data, where the order of the target values has a meaning. It is not useful
for other types of data. Because of this, it is not included in the `summarize_metrics` method.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanDirectionalAccuracy` | [`Float`][safeds.lang.Float] | The mean directional accuracy of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="84"
    @Pure
    @PythonName("mean_directional_accuracy")
    fun meanDirectionalAccuracy(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> meanDirectionalAccuracy: Float
    ```

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.Regressor.meanSquaredError data-toc-label='meanSquaredError'}

Compute the mean squared error (MSE) of the regressor on the given data.

The mean squared error is the average of the squared differences between the predicted and expected target
values. The **lower** the mean squared error, the better the regressor. Results range from 0.0 to positive
infinity.

**Note:** To get the root mean squared error (RMSE), take the square root of the result.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The mean squared error of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="103"
    @Pure
    @PythonName("mean_squared_error")
    fun meanSquaredError(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> meanSquaredError: Float
    ```

## `#!sds fun` medianAbsoluteDeviation {#safeds.ml.classical.regression.Regressor.medianAbsoluteDeviation data-toc-label='medianAbsoluteDeviation'}

Compute the median absolute deviation (MAD) of the regressor on the given data.

The median absolute deviation is the median of the absolute differences between the predicted and expected
target values. The **lower** the median absolute deviation, the better the regressor. Results range from 0.0 to
positive infinity.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `medianAbsoluteDeviation` | [`Float`][safeds.lang.Float] | The median absolute deviation of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="120"
    @Pure
    @PythonName("median_absolute_deviation")
    fun medianAbsoluteDeviation(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> medianAbsoluteDeviation: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.Regressor.predict data-toc-label='predict'}

Predict the target values on the given dataset.

**Note:** The model must be fitted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | `#!sds union<Table, TabularDataset>` | The dataset containing at least the features. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The given dataset with an additional column for the predicted target values. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="40"
    @Pure
    fun predict(
        dataset: union<Table, TabularDataset>
    ) -> prediction: TabularDataset
    ```

## `#!sds fun` summarizeMetrics {#safeds.ml.classical.regression.Regressor.summarizeMetrics data-toc-label='summarizeMetrics'}

Summarize the regressor's metrics on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `metrics` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the regressor's metrics. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="18"
    @Pure
    @PythonName("summarize_metrics")
    fun summarizeMetrics(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> metrics: Table
    ```
