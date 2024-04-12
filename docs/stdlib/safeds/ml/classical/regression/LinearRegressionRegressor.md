# `#!sds class` LinearRegressionRegressor {#safeds.ml.classical.regression.LinearRegressionRegressor data-toc-label='LinearRegressionRegressor'}

Linear regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

??? quote "Stub code in `linear_regression.sdsstub`"

    ```sds linenums="9"
    class LinearRegressionRegressor() sub Regressor {
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
        ) -> fittedRegressor: LinearRegressionRegressor
    }
    ```

## `#!sds fun` fit {#safeds.ml.classical.regression.LinearRegressionRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`LinearRegressionRegressor`][safeds.ml.classical.regression.LinearRegressionRegressor] | The fitted regressor. |

??? quote "Stub code in `linear_regression.sdsstub`"

    ```sds linenums="19"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: LinearRegressionRegressor
    ```
