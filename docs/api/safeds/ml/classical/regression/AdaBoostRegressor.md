# `#!sds class` AdaBoostRegressor {#safeds.ml.classical.regression.AdaBoostRegressor data-toc-label='AdaBoostRegressor'}

Ada Boost regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `learner` | [`Regressor`][safeds.ml.classical.regression.Regressor] | The learner from which the boosted ensemble is built. | `#!sds DecisionTreeRegressor()` |
| `maximumNumberOfLearners` | [`Int`][safeds.lang.Int] | The maximum number of learners at which boosting is terminated. In case of perfect fit, the learning procedure is stopped early. Has to be greater than 0. | `#!sds 50` |
| `learningRate` | [`Float`][safeds.lang.Float] | Weight applied to each regressor at each boosting iteration. A higher learning rate increases the contribution of each regressor. Has to be greater than 0. | `#!sds 1.0` |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `ada_boost.sdsstub`"

    ```sds linenums="20"
    class AdaBoostRegressor(
        learner: Regressor = DecisionTreeRegressor(),
        @PythonName("maximum_number_of_learners") const maximumNumberOfLearners: Int = 50,
        @PythonName("learning_rate") const learningRate: Float = 1.0
    ) sub Regressor where {
        maximumNumberOfLearners >= 1,
        learningRate > 0.0
    } {
        /**
         * Get the base learner used for training the ensemble.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr learner: Regressor
        /**
         * Get the maximum number of learners in the ensemble.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @PythonName("maximum_number_of_learners") attr maximumNumberOfLearners: Int
        /**
         * Get the learning rate.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun fit(
            @PythonName("training_set") trainingSet: TaggedTable
        ) -> fittedRegressor: AdaBoostRegressor
    }
    ```

## `#!sds attr` learner {#safeds.ml.classical.regression.AdaBoostRegressor.learner data-toc-label='learner'}

Get the base learner used for training the ensemble.

**Type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds attr` learningRate {#safeds.ml.classical.regression.AdaBoostRegressor.learningRate data-toc-label='learningRate'}

Get the learning rate.

**Type:** [`Float`][safeds.lang.Float]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds attr` maximumNumberOfLearners {#safeds.ml.classical.regression.AdaBoostRegressor.maximumNumberOfLearners data-toc-label='maximumNumberOfLearners'}

Get the maximum number of learners in the ensemble.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds fun` fit {#safeds.ml.classical.regression.AdaBoostRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`AdaBoostRegressor`][safeds.ml.classical.regression.AdaBoostRegressor] | The fitted regressor. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `ada_boost.sdsstub`"

    ```sds linenums="70"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: AdaBoostRegressor
    ```

## `#!sds fun` isFitted {#safeds.ml.classical.regression.AdaBoostRegressor.isFitted data-toc-label='isFitted'}

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

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.AdaBoostRegressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

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

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.AdaBoostRegressor.meanSquaredError data-toc-label='meanSquaredError'}

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

## `#!sds fun` predict {#safeds.ml.classical.regression.AdaBoostRegressor.predict data-toc-label='predict'}

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
