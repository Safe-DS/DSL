# `#!sds class` KNearestNeighborsRegressor {#safeds.ml.classical.regression.KNearestNeighborsRegressor data-toc-label='KNearestNeighborsRegressor'}

K-nearest-neighbors regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfNeighbors` | [`Int`][safeds.lang.Int] | The number of neighbors to use for interpolation. Has to be greater than 0 (validated in the constructor) and less than or equal to the sample size (validated when calling `fit`). | - |

??? quote "Source code in `k_nearest_neighbors.sdsstub`"

    ```sds linenums="12"
    class KNearestNeighborsRegressor(
        @PythonName("number_of_neighbors") const numberOfNeighbors: Int
    ) sub Regressor where {
        numberOfNeighbors >= 1
    } {
        /**
         * Get the number of neighbors used for interpolation.
         */
        @PythonName("number_of_neighbors") attr numberOfNeighbors: Int
    
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
        ) -> fittedRegressor: KNearestNeighborsRegressor
    }
    ```

## `#!sds attr` numberOfNeighbors {#safeds.ml.classical.regression.KNearestNeighborsRegressor.numberOfNeighbors data-toc-label='numberOfNeighbors'}

Get the number of neighbors used for interpolation.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` fit {#safeds.ml.classical.regression.KNearestNeighborsRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`KNearestNeighborsRegressor`][safeds.ml.classical.regression.KNearestNeighborsRegressor] | The fitted regressor. |

??? quote "Source code in `k_nearest_neighbors.sdsstub`"

    ```sds linenums="31"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: KNearestNeighborsRegressor
    ```
