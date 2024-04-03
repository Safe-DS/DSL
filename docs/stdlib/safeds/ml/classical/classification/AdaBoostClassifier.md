# `#!sds class` AdaBoostClassifier {#safeds.ml.classical.classification.AdaBoostClassifier data-toc-label='AdaBoostClassifier'}

Ada Boost classification.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `learner` | [`Classifier`][safeds.ml.classical.classification.Classifier] | The learner from which the boosted ensemble is built. | `#!sds DecisionTreeClassifier()` |
| `maximumNumberOfLearners` | [`Int`][safeds.lang.Int] | The maximum number of learners at which boosting is terminated. In case of perfect fit, the learning procedure is stopped early. Has to be greater than 0. | `#!sds 50` |
| `learningRate` | [`Float`][safeds.lang.Float] | Weight applied to each classifier at each boosting iteration. A higher learning rate increases the contribution of each classifier. Has to be greater than 0. | `#!sds 1.0` |

??? quote "Source code in `ada_boost.sdsstub`"

    ```sds linenums="15"
    class AdaBoostClassifier(
        learner: Classifier = DecisionTreeClassifier(),
        @PythonName("maximum_number_of_learners") const maximumNumberOfLearners: Int = 50,
        @PythonName("learning_rate") const learningRate: Float = 1.0
    ) sub Classifier where {
        maximumNumberOfLearners >= 1,
        learningRate > 0.0
    } {
        /**
         * Get the base learner used for training the ensemble.
         */
        attr learner: Classifier
        /**
         * Get the maximum number of learners in the ensemble.
         */
        @PythonName("maximum_number_of_learners") attr maximumNumberOfLearners: Int
        /**
         * Get the learning rate.
         */
        @PythonName("learning_rate") attr learningRate: Float
    
        /**
         * Create a copy of this classifier and fit it with the given training data.
         *
         * This classifier is not modified.
         *
         * @param trainingSet The training data containing the feature and target vectors.
         *
         * @result fittedClassifier The fitted classifier.
         */
        @Pure
        fun fit(
            @PythonName("training_set") trainingSet: TaggedTable
        ) -> fittedClassifier: AdaBoostClassifier
    }
    ```

## `#!sds attr` learner {#safeds.ml.classical.classification.AdaBoostClassifier.learner data-toc-label='learner'}

Get the base learner used for training the ensemble.

**Type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

## `#!sds attr` learningRate {#safeds.ml.classical.classification.AdaBoostClassifier.learningRate data-toc-label='learningRate'}

Get the learning rate.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` maximumNumberOfLearners {#safeds.ml.classical.classification.AdaBoostClassifier.maximumNumberOfLearners data-toc-label='maximumNumberOfLearners'}

Get the maximum number of learners in the ensemble.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` fit {#safeds.ml.classical.classification.AdaBoostClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`AdaBoostClassifier`][safeds.ml.classical.classification.AdaBoostClassifier] | The fitted classifier. |

??? quote "Source code in `ada_boost.sdsstub`"

    ```sds linenums="45"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: AdaBoostClassifier
    ```
