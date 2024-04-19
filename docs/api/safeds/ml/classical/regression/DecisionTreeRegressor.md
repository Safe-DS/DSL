# `#!sds class` DecisionTreeRegressor {#safeds.ml.classical.regression.DecisionTreeRegressor data-toc-label='DecisionTreeRegressor'}

Decision tree regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `decision_tree.sdsstub`"

    ```sds linenums="14"
    class DecisionTreeRegressor() sub Regressor {
        /**
         * Create a copy of this regressor and fit it with the given training data.
         *
         * This regressor is not modified.
         *
         * @param trainingSet The training data containing the feature and target vectors.
         *
         * @result fittedRegressor The fitted regressor.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `decision_tree.sdsstub`"

    ```sds linenums="29"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: DecisionTreeRegressor
    ```

## `#!sds fun` isFitted {#safeds.ml.classical.regression.DecisionTreeRegressor.isFitted data-toc-label='isFitted'}

Check if the classifier is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `isFitted` | [`Boolean`][safeds.lang.Boolean] | Whether the regressor is fitted. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="60"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> isFitted: Boolean
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.DecisionTreeRegressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

Compute the mean absolute error (MAE) of the regressor on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The calculated mean absolute error (the average of the distance of each individual row). |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="94"
    @Pure
    @PythonName("mean_absolute_error")
    fun meanAbsoluteError(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
    ) -> meanAbsoluteError: Float
    ```

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.DecisionTreeRegressor.meanSquaredError data-toc-label='meanSquaredError'}

Compute the mean squared error (MSE) on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The calculated mean squared error (the average of the distance of each individual row squared). |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="76"
    @Pure
    @PythonName("mean_squared_error")
    fun meanSquaredError(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
    ) -> meanSquaredError: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.DecisionTreeRegressor.predict data-toc-label='predict'}

Predict a target vector using a dataset containing feature vectors. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | [`Table`][safeds.data.tabular.containers.Table] | The dataset containing the feature vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A dataset containing the given feature vectors and the predicted target vector. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="45"
    @Pure
    fun predict(
        dataset: Table
    ) -> prediction: TaggedTable
    ```