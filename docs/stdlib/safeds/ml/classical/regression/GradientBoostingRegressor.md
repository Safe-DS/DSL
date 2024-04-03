# `#!sds class` GradientBoostingRegressor {#safeds.ml.classical.regression.GradientBoostingRegressor data-toc-label='GradientBoostingRegressor'}

Gradient boosting regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfTrees` | [`Int`][safeds.lang.Int] | The number of boosting stages to perform. Gradient boosting is fairly robust to over-fitting so a large number usually results in better performance. | `#!sds 100` |
| `learningRate` | [`Float`][safeds.lang.Float] | The larger the value, the more the model is influenced by each additional tree. If the learning rate is too low, the model might underfit. If the learning rate is too high, the model might overfit. | `#!sds 0.1` |

??? quote "Source code in `gradient_boosting.sdsstub`"

    ```sds linenums="14"
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
            @PythonName("training_set") trainingSet: TaggedTable
        ) -> fittedRegressor: GradientBoostingRegressor
    }
    ```

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
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`GradientBoostingRegressor`][safeds.ml.classical.regression.GradientBoostingRegressor] | The fitted regressor. |

??? quote "Source code in `gradient_boosting.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: GradientBoostingRegressor
    ```
