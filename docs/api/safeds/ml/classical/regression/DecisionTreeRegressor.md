# `#!sds class` DecisionTreeRegressor {#safeds.ml.classical.regression.DecisionTreeRegressor data-toc-label='DecisionTreeRegressor'}

Decision tree regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `maximumDepth` | [`Int?`][safeds.lang.Int] | The maximum depth of each tree. If null, the depth is not limited. Has to be greater than 0. | `#!sds null` |
| `minimumNumberOfSamplesInLeaves` | [`Int`][safeds.lang.Int] | The minimum number of samples that must remain in the leaves of each tree. Has to be greater than 0. | `#!sds 1` |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val training = Table.fromCsvFile("training.csv").toTabularDataset("target");
    val test = Table.fromCsvFile("test.csv").toTabularDataset("target");
    val regressor = DecisionTreeRegressor().fit(training);
    val meanSquaredError = regressor.meanSquaredError(test);
}
```

??? quote "Stub code in `DecisionTreeRegressor.sdsstub`"

    ```sds linenums="21"
    class DecisionTreeRegressor(
        @PythonName("maximum_depth") maximumDepth: Int? = null,
        @PythonName("minimum_number_of_samples_in_leaves") const minimumNumberOfSamplesInLeaves: Int = 1
    ) sub Regressor where {
        minimumNumberOfSamplesInLeaves > 0
    } {
        /**
         * The maximum depth of the tree.
         */
        @PythonName("maximum_depth") attr maximumDepth: Int?
        /**
         * The minimum number of samples that must remain in the leaves of the tree.
         */
        @PythonName("minimum_number_of_samples_in_leaves") attr minimumNumberOfSamplesInLeaves: Int

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
            @PythonName("training_set") trainingSet: union<ExperimentalTabularDataset, TabularDataset>
        ) -> fittedRegressor: DecisionTreeRegressor
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.regression.DecisionTreeRegressor.isFitted data-toc-label='isFitted'}

Whether the regressor is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` maximumDepth {#safeds.ml.classical.regression.DecisionTreeRegressor.maximumDepth data-toc-label='maximumDepth'}

The maximum depth of the tree.

**Type:** [`Int?`][safeds.lang.Int]

## `#!sds attr` minimumNumberOfSamplesInLeaves {#safeds.ml.classical.regression.DecisionTreeRegressor.minimumNumberOfSamplesInLeaves data-toc-label='minimumNumberOfSamplesInLeaves'}

The minimum number of samples that must remain in the leaves of the tree.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` fit {#safeds.ml.classical.regression.DecisionTreeRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`DecisionTreeRegressor`][safeds.ml.classical.regression.DecisionTreeRegressor] | The fitted regressor. |

??? quote "Stub code in `DecisionTreeRegressor.sdsstub`"

    ```sds linenums="45"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> fittedRegressor: DecisionTreeRegressor
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.DecisionTreeRegressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

Compute the mean absolute error (MAE) of the regressor on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The calculated mean absolute error (the average of the distance of each individual row). |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="61"
    @Pure
    @PythonName("mean_absolute_error")
    fun meanAbsoluteError(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> meanAbsoluteError: Float
    ```

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.DecisionTreeRegressor.meanSquaredError data-toc-label='meanSquaredError'}

Compute the mean squared error (MSE) on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The calculated mean squared error (the average of the distance of each individual row squared). |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="74"
    @Pure
    @PythonName("mean_squared_error")
    fun meanSquaredError(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> meanSquaredError: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.DecisionTreeRegressor.predict data-toc-label='predict'}

Predict a target vector using a dataset containing feature vectors. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | `#!sds union<ExperimentalTable, ExperimentalTabularDataset, Table>` | The dataset containing the feature vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | A dataset containing the given feature vectors and the predicted target vector. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="36"
    @Pure
    fun predict(
        dataset: union<ExperimentalTable, ExperimentalTabularDataset, Table>
    ) -> prediction: TabularDataset
    ```

## `#!sds fun` summarizeMetrics {#safeds.ml.classical.regression.DecisionTreeRegressor.summarizeMetrics data-toc-label='summarizeMetrics'}

Summarize the regressor's metrics on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `metrics` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the regressor's metrics. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="48"
    @Pure
    @PythonName("summarize_metrics")
    fun summarizeMetrics(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> metrics: Table
    ```
