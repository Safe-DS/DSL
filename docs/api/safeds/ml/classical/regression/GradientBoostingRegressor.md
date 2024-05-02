# `#!sds class` GradientBoostingRegressor {#safeds.ml.classical.regression.GradientBoostingRegressor data-toc-label='GradientBoostingRegressor'}

Gradient boosting regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfTrees` | [`Int`][safeds.lang.Int] | The number of boosting stages to perform. Gradient boosting is fairly robust to over-fitting so a large number usually results in better performance. | `#!sds 100` |
| `learningRate` | [`Float`][safeds.lang.Float] | The larger the value, the more the model is influenced by each additional tree. If the learning rate is too low, the model might underfit. If the learning rate is too high, the model might overfit. | `#!sds 0.1` |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val training = Table.fromCsvFile("training.csv").toTabularDataset("target");
    val test = Table.fromCsvFile("test.csv").toTabularDataset("target");
    val regressor = GradientBoostingRegressor(numberOfTrees = 50).fit(training);
    val meanSquaredError = regressor.meanSquaredError(test);
}
```

??? quote "Stub code in `gradient_boosting.sdsstub`"

    ```sds linenums="23"
    class GradientBoostingRegressor(
        @PythonName("number_of_trees") const numberOfTrees: Int = 100,
        @PythonName("learning_rate") const learningRate: Float = 0.1
    ) sub Regressor where {
        numberOfTrees >= 1,
        learningRate > 0.0
    } {
        /**
         * Get the number of trees (estimators) in the ensemble.
         */
        @PythonName("number_of_trees") attr numberOfTrees: Int
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
            @PythonName("training_set") trainingSet: TabularDataset
        ) -> fittedRegressor: GradientBoostingRegressor
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.regression.GradientBoostingRegressor.isFitted data-toc-label='isFitted'}

Whether the regressor is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` learningRate {#safeds.ml.classical.regression.GradientBoostingRegressor.learningRate data-toc-label='learningRate'}

Get the learning rate.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` numberOfTrees {#safeds.ml.classical.regression.GradientBoostingRegressor.numberOfTrees data-toc-label='numberOfTrees'}

Get the number of trees (estimators) in the ensemble.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` fit {#safeds.ml.classical.regression.GradientBoostingRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`GradientBoostingRegressor`][safeds.ml.classical.regression.GradientBoostingRegressor] | The fitted regressor. |

??? quote "Stub code in `gradient_boosting.sdsstub`"

    ```sds linenums="48"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TabularDataset
    ) -> fittedRegressor: GradientBoostingRegressor
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.GradientBoostingRegressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

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

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.GradientBoostingRegressor.meanSquaredError data-toc-label='meanSquaredError'}

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

## `#!sds fun` predict {#safeds.ml.classical.regression.GradientBoostingRegressor.predict data-toc-label='predict'}

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
