# `#!sds class` DecisionTreeRegressor {#safeds.ml.classical.regression.DecisionTreeRegressor data-toc-label='DecisionTreeRegressor'}

Decision tree regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

??? quote "Source code in `decision_tree.sdsstub`"

    ```sds linenums="10"
    class DecisionTreeRegressor() sub Regressor {
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
        ) -> fittedRegressor: DecisionTreeRegressor
    }
    ```

## `#!sds fun` fit {#safeds.ml.classical.regression.DecisionTreeRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`DecisionTreeRegressor`][safeds.ml.classical.regression.DecisionTreeRegressor] | The fitted regressor. |

??? quote "Source code in `decision_tree.sdsstub`"

    ```sds linenums="20"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: DecisionTreeRegressor
    ```
