# `#!sds class` LassoRegressor {#safeds.ml.classical.regression.LassoRegressor data-toc-label='LassoRegressor'}

Lasso regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `alpha` | [`Float`][safeds.lang.Float] | Controls the regularization of the model. The higher the value, the more regularized it becomes. | `#!sds 1.0` |

??? quote "Stub code in `lasso_regression.sdsstub`"

    ```sds linenums="11"
    class LassoRegressor(
        const alpha: Float = 1.0
    ) sub Regressor where {
        alpha >= 0.0
    } {
        /**
         * Get the regularization of the model.
         */
        attr alpha: Float
    
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
        ) -> fittedRegressor: LassoRegressor
    }
    ```

## `#!sds attr` alpha {#safeds.ml.classical.regression.LassoRegressor.alpha data-toc-label='alpha'}

Get the regularization of the model.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds fun` fit {#safeds.ml.classical.regression.LassoRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`LassoRegressor`][safeds.ml.classical.regression.LassoRegressor] | The fitted regressor. |

??? quote "Stub code in `lasso_regression.sdsstub`"

    ```sds linenums="30"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: LassoRegressor
    ```
