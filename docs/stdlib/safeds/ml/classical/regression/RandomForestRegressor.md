# `#!sds class` RandomForestRegressor {#safeds.ml.classical.regression.RandomForestRegressor data-toc-label='RandomForestRegressor'}

Random forest regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfTrees` | [`Int`][safeds.lang.Int] | The number of trees to be used in the random forest. Has to be greater than 0. | `#!sds 100` |

??? quote "Source code in `random_forest.sdsstub`"

    ```sds linenums="12"
    class RandomForestRegressor(
        @PythonName("number_of_trees") const numberOfTrees: Int = 100
    ) sub Regressor where {
        numberOfTrees >= 1
    } {
        /**
         * Get the number of trees used in the random forest.
         */
        @PythonName("number_of_trees") attr numberOfTrees: Int
    
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
        ) -> fittedRegressor: RandomForestRegressor
    }
    ```

## `#!sds attr` numberOfTrees {#safeds.ml.classical.regression.RandomForestRegressor.numberOfTrees data-toc-label='numberOfTrees'}

Get the number of trees used in the random forest.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` fit {#safeds.ml.classical.regression.RandomForestRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`RandomForestRegressor`][safeds.ml.classical.regression.RandomForestRegressor] | The fitted regressor. |

??? quote "Source code in `random_forest.sdsstub`"

    ```sds linenums="31"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: RandomForestRegressor
    ```
