# `#!sds class` AdaBoostRegressor {#safeds.ml.classical.regression.AdaBoostRegressor data-toc-label='AdaBoostRegressor'}

Ada Boost regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `learner` | [`Regressor`][safeds.ml.classical.regression.Regressor] | The learner from which the boosted ensemble is built. | `#!sds DecisionTreeRegressor()` |
| `maximumNumberOfLearners` | [`Int`][safeds.lang.Int] | The maximum number of learners at which boosting is terminated. In case of perfect fit, the learning procedure is stopped early. Has to be greater than 0. | `#!sds 50` |
| `learningRate` | [`Float`][safeds.lang.Float] | Weight applied to each regressor at each boosting iteration. A higher learning rate increases the contribution of each regressor. Has to be greater than 0. | `#!sds 1.0` |

??? quote "Source code in `ada_boost.sdsstub`"

    ```sds linenums="16"
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
         */
        attr learner: Regressor
        /**
         * Get the maximum number of learners in the ensemble.
         */
        @PythonName("maximum_number_of_learners") attr maximumNumberOfLearners: Int
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
        ) -> fittedRegressor: AdaBoostRegressor
    }
    ```

## `#!sds attr` learner {#safeds.ml.classical.regression.AdaBoostRegressor.learner data-toc-label='learner'}

Get the base learner used for training the ensemble.

**Type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

## `#!sds attr` maximumNumberOfLearners {#safeds.ml.classical.regression.AdaBoostRegressor.maximumNumberOfLearners data-toc-label='maximumNumberOfLearners'}

Get the maximum number of learners in the ensemble.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` learningRate {#safeds.ml.classical.regression.AdaBoostRegressor.learningRate data-toc-label='learningRate'}

Get the learning rate.

**Type:** [`Float`][safeds.lang.Float]

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

??? quote "Source code in `ada_boost.sdsstub`"

    ```sds linenums="46"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: AdaBoostRegressor
    ```
