# `#!sds class` AdaBoostRegressor {#safeds.ml.classical.regression.AdaBoostRegressor data-toc-label='AdaBoostRegressor'}

Ada Boost regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `learner` | [`Regressor`][safeds.ml.classical.regression.Regressor] | The learner from which the boosted ensemble is built. | `#!sds DecisionTreeRegressor()` |
| `maximumNumberOfLearners` | [`Int`][safeds.lang.Int] | The maximum number of learners at which boosting is terminated. In case of perfect fit, the learning procedure is stopped early. Has to be greater than 0. | `#!sds 50` |
| `learningRate` | [`Float`][safeds.lang.Float] | Weight applied to each regressor at each boosting iteration. A higher learning rate increases the contribution of each regressor. Has to be greater than 0. | `#!sds 1.0` |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val training = Table.fromCsvFile("training.csv").toTabularDataset("target");
    val test = Table.fromCsvFile("test.csv").toTabularDataset("target");
    val regressor = AdaBoostRegressor(maximumNumberOfLearners = 100).fit(training);
    val meanSquaredError = regressor.meanSquaredError(test);
}
```

??? quote "Stub code in `AdaBoostRegressor.sdsstub`"

    ```sds linenums="24"
    class AdaBoostRegressor(
        learner: Regressor = DecisionTreeRegressor(),
        @PythonName("maximum_number_of_learners") const maximumNumberOfLearners: Int = 50,
        @PythonName("learning_rate") const learningRate: Float = 1.0
    ) sub Regressor where {
        maximumNumberOfLearners >= 1,
        learningRate > 0.0
    } {
        /**
         * Get the base learner used for training the ensemble.
         */
        attr learner: Regressor
        /**
         * Get the maximum number of learners in the ensemble.
         */
        @PythonName("maximum_number_of_learners") attr maximumNumberOfLearners: Int
        /**
         * Get the learning rate.
         */
        @PythonName("learning_rate") attr learningRate: Float

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
        ) -> fittedRegressor: AdaBoostRegressor
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.regression.AdaBoostRegressor.isFitted data-toc-label='isFitted'}

Whether the regressor is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` learner {#safeds.ml.classical.regression.AdaBoostRegressor.learner data-toc-label='learner'}

Get the base learner used for training the ensemble.

**Type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

## `#!sds attr` learningRate {#safeds.ml.classical.regression.AdaBoostRegressor.learningRate data-toc-label='learningRate'}

Get the learning rate.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` maximumNumberOfLearners {#safeds.ml.classical.regression.AdaBoostRegressor.maximumNumberOfLearners data-toc-label='maximumNumberOfLearners'}

Get the maximum number of learners in the ensemble.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` fit {#safeds.ml.classical.regression.AdaBoostRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`AdaBoostRegressor`][safeds.ml.classical.regression.AdaBoostRegressor] | The fitted regressor. |

??? quote "Stub code in `AdaBoostRegressor.sdsstub`"

    ```sds linenums="54"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> fittedRegressor: AdaBoostRegressor
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.AdaBoostRegressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

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

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.AdaBoostRegressor.meanSquaredError data-toc-label='meanSquaredError'}

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

## `#!sds fun` predict {#safeds.ml.classical.regression.AdaBoostRegressor.predict data-toc-label='predict'}

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

## `#!sds fun` summarizeMetrics {#safeds.ml.classical.regression.AdaBoostRegressor.summarizeMetrics data-toc-label='summarizeMetrics'}

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
