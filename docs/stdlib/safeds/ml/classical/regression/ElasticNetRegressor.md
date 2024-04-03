# `#!sds class` ElasticNetRegressor {#safeds.ml.classical.regression.ElasticNetRegressor data-toc-label='ElasticNetRegressor'}

Elastic net regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `alpha` | [`Float`][safeds.lang.Float] | Controls the regularization of the model. The higher the value, the more regularized it becomes. | `#!sds 1.0` |
| `lassoRatio` | [`Float`][safeds.lang.Float] | Number between 0 and 1 that controls the ratio between Lasso and Ridge regularization. If 0, only Ridge regularization is used. If 1, only Lasso regularization is used. | `#!sds 0.5` |

??? quote "Source code in `elastic_net_regression.sdsstub`"

    ```sds linenums="13"
    class ElasticNetRegressor(
        const alpha: Float = 1.0,
        @PythonName("lasso_ratio") const lassoRatio: Float = 0.5
    ) sub Regressor where {
        alpha >= 0.0,
        lassoRatio >= 0.0,
        lassoRatio <= 1.0
    } {
        /**
         * Get the regularization of the model.
         */
        attr alpha: Float
        /**
         * Get the ratio between Lasso and Ridge regularization.
         */
        @PythonName("lasso_ratio") attr lassoRatio: Float
    
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
        ) -> fittedRegressor: ElasticNetRegressor
    }
    ```

## `#!sds attr` alpha {#safeds.ml.classical.regression.ElasticNetRegressor.alpha data-toc-label='alpha'}

Get the regularization of the model.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` lassoRatio {#safeds.ml.classical.regression.ElasticNetRegressor.lassoRatio data-toc-label='lassoRatio'}

Get the ratio between Lasso and Ridge regularization.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds fun` fit {#safeds.ml.classical.regression.ElasticNetRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`ElasticNetRegressor`][safeds.ml.classical.regression.ElasticNetRegressor] | The fitted regressor. |

??? quote "Source code in `elastic_net_regression.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: ElasticNetRegressor
    ```
