---
search:
  boost: 0.5
---

# `#!sds abstract class` Regressor {#safeds.ml.classical.regression.Regressor data-toc-label='Regressor'}

Abstract base class for all regressors.

**Inheritors:**

- [`AdaBoostRegressor`][safeds.ml.classical.regression.AdaBoostRegressor]
- [`DecisionTreeRegressor`][safeds.ml.classical.regression.DecisionTreeRegressor]
- [`ElasticNetRegressor`][safeds.ml.classical.regression.ElasticNetRegressor]
- [`GradientBoostingRegressor`][safeds.ml.classical.regression.GradientBoostingRegressor]
- [`KNearestNeighborsRegressor`][safeds.ml.classical.regression.KNearestNeighborsRegressor]
- [`LassoRegressor`][safeds.ml.classical.regression.LassoRegressor]
- [`LinearRegressionRegressor`][safeds.ml.classical.regression.LinearRegressionRegressor]
- [`RandomForestRegressor`][safeds.ml.classical.regression.RandomForestRegressor]
- [`RidgeRegressor`][safeds.ml.classical.regression.RidgeRegressor]
- [`SupportVectorMachineRegressor`][safeds.ml.classical.regression.SupportVectorMachineRegressor]

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="9"
    class Regressor {
        /**
         * Whether the regressor is fitted.
         */
        @PythonName("is_fitted") attr isFitted: Boolean

        /**
         * Create a copy of this regressor and fit it with the given training data.
         *
         * This regressor is not modified.
         *
         * @param trainingSet The training data containing the feature and target vectors.
         *
         * @result fittedRegressor The fitted regressor.
         */
        @Pure
        fun fit(
            @PythonName("training_set") trainingSet: TabularDataset
        ) -> fittedRegressor: Regressor

        /**
         * Predict a target vector using a dataset containing feature vectors. The model has to be trained first.
         *
         * @param dataset The dataset containing the feature vectors.
         *
         * @result prediction A dataset containing the given feature vectors and the predicted target vector.
         */
        @Pure
        fun predict(
            dataset: Table
        ) -> prediction: TabularDataset

        /**
         * Compute the mean squared error (MSE) on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result meanSquaredError The calculated mean squared error (the average of the distance of each individual row squared).
         */
        @Pure
        @PythonName("mean_squared_error")
        fun meanSquaredError(
            @PythonName("validation_or_test_set") validationOrTestSet: TabularDataset
        ) -> meanSquaredError: Float

        /**
         * Compute the mean absolute error (MAE) of the regressor on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result meanAbsoluteError The calculated mean absolute error (the average of the distance of each individual row).
         */
        @Pure
        @PythonName("mean_absolute_error")
        fun meanAbsoluteError(
            @PythonName("validation_or_test_set") validationOrTestSet: TabularDataset
        ) -> meanAbsoluteError: Float
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.regression.Regressor.isFitted data-toc-label='isFitted'}

Whether the regressor is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.ml.classical.regression.Regressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`Regressor`][safeds.ml.classical.regression.Regressor] | The fitted regressor. |

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="24"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TabularDataset
    ) -> fittedRegressor: Regressor
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.Regressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

Compute the mean absolute error (MAE) of the regressor on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The calculated mean absolute error (the average of the distance of each individual row). |

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="61"
    @Pure
    @PythonName("mean_absolute_error")
    fun meanAbsoluteError(
        @PythonName("validation_or_test_set") validationOrTestSet: TabularDataset
    ) -> meanAbsoluteError: Float
    ```

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.Regressor.meanSquaredError data-toc-label='meanSquaredError'}

Compute the mean squared error (MSE) on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The calculated mean squared error (the average of the distance of each individual row squared). |

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="48"
    @Pure
    @PythonName("mean_squared_error")
    fun meanSquaredError(
        @PythonName("validation_or_test_set") validationOrTestSet: TabularDataset
    ) -> meanSquaredError: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.Regressor.predict data-toc-label='predict'}

Predict a target vector using a dataset containing feature vectors. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | [`Table`][safeds.data.tabular.containers.Table] | The dataset containing the feature vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | A dataset containing the given feature vectors and the predicted target vector. |

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="36"
    @Pure
    fun predict(
        dataset: Table
    ) -> prediction: TabularDataset
    ```
