# `#!sds class` ElasticNetRegressor {#safeds.ml.classical.regression.ElasticNetRegressor data-toc-label='ElasticNetRegressor'}

Elastic net regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `alpha` | [`Float`][safeds.lang.Float] | Controls the regularization of the model. The higher the value, the more regularized it becomes. | `#!sds 1.0` |
| `lassoRatio` | [`Float`][safeds.lang.Float] | Number between 0 and 1 that controls the ratio between Lasso and Ridge regularization. If 0, only Ridge regularization is used. If 1, only Lasso regularization is used. | `#!sds 0.5` |

??? quote "Stub code in `elastic_net_regression.sdsstub`"

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

??? quote "Stub code in `elastic_net_regression.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: ElasticNetRegressor
    ```

## `#!sds fun` isFitted {#safeds.ml.classical.regression.ElasticNetRegressor.isFitted data-toc-label='isFitted'}

Check if the classifier is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `isFitted` | [`Boolean`][safeds.lang.Boolean] | Whether the regressor is fitted. |

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="40"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> isFitted: Boolean
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.ElasticNetRegressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

Compute the mean absolute error (MAE) of the regressor on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The calculated mean absolute error (the average of the distance of each individual row). |

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="64"
    @Pure
    @PythonName("mean_absolute_error")
    fun meanAbsoluteError(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
    ) -> meanAbsoluteError: Float
    ```

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.ElasticNetRegressor.meanSquaredError data-toc-label='meanSquaredError'}

Compute the mean squared error (MSE) on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The calculated mean squared error (the average of the distance of each individual row squared). |

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="51"
    @Pure
    @PythonName("mean_squared_error")
    fun meanSquaredError(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
    ) -> meanSquaredError: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.ElasticNetRegressor.predict data-toc-label='predict'}

Predict a target vector using a dataset containing feature vectors. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | [`Table`][safeds.data.tabular.containers.Table] | The dataset containing the feature vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A dataset containing the given feature vectors and the predicted target vector. |

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="30"
    @Pure
    fun predict(
        dataset: Table
    ) -> prediction: TaggedTable
    ```
