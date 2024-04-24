# `#!sds class` AdaBoostClassifier {#safeds.ml.classical.classification.AdaBoostClassifier data-toc-label='AdaBoostClassifier'}

Ada Boost classification.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `learner` | [`Classifier`][safeds.ml.classical.classification.Classifier] | The learner from which the boosted ensemble is built. | `#!sds DecisionTreeClassifier()` |
| `maximumNumberOfLearners` | [`Int`][safeds.lang.Int] | The maximum number of learners at which boosting is terminated. In case of perfect fit, the learning procedure is stopped early. Has to be greater than 0. | `#!sds 50` |
| `learningRate` | [`Float`][safeds.lang.Float] | Weight applied to each classifier at each boosting iteration. A higher learning rate increases the contribution of each classifier. Has to be greater than 0. | `#!sds 1.0` |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val training = Table.fromCsvFile("training.csv").tagColumns("target");
    val test = Table.fromCsvFile("test.csv").tagColumns("target");
    val classifier = AdaBoostClassifier(maximumNumberOfLearners = 100).fit(training);
    val accuracy = classifier.accuracy(test);
}
```

??? quote "Stub code in `ada_boost.sdsstub`"

    ```sds linenums="23"
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

## `#!sds fun` accuracy {#safeds.ml.classical.classification.AdaBoostClassifier.accuracy data-toc-label='accuracy'}

Compute the accuracy of the classifier on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `accuracy` | [`Float`][safeds.lang.Float] | The calculated accuracy score, i.e. the percentage of equal data. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="51"
    @Pure
    fun accuracy(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
    ) -> accuracy: Float
    ```

## `#!sds fun` f1Score {#safeds.ml.classical.classification.AdaBoostClassifier.f1Score data-toc-label='f1Score'}

Compute the classifier's $F_1$-score on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `f1Score` | [`Float`][safeds.lang.Float] | The calculated $F_1$-score, i.e. the harmonic mean between precision and recall. Return 1 if there are no positive expectations and predictions. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="95"
    @Pure
    @PythonName("f1_score")
    fun f1Score(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
        @PythonName("positive_class") positiveClass: Any
    ) -> f1Score: Float
    ```

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

??? quote "Stub code in `ada_boost.sdsstub`"

    ```sds linenums="53"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: AdaBoostClassifier
    ```

## `#!sds fun` isFitted {#safeds.ml.classical.classification.AdaBoostClassifier.isFitted data-toc-label='isFitted'}

Check if the classifier is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `isFitted` | [`Boolean`][safeds.lang.Boolean] | Whether the classifier is fitted. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="40"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> isFitted: Boolean
    ```

## `#!sds fun` precision {#safeds.ml.classical.classification.AdaBoostClassifier.precision data-toc-label='precision'}

Compute the classifier's precision on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `precision` | [`Float`][safeds.lang.Float] | The calculated precision score, i.e. the ratio of correctly predicted positives to all predicted positives. Return 1 if no positive predictions are made. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="65"
    @Pure
    fun precision(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
        @PythonName("positive_class") positiveClass: Any
    ) -> precision: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.classification.AdaBoostClassifier.predict data-toc-label='predict'}

Predict a target vector using a dataset containing feature vectors. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | [`Table`][safeds.data.tabular.containers.Table] | The dataset containing the feature vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A dataset containing the given feature vectors and the predicted target vector. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="30"
    @Pure
    fun predict(
        dataset: Table
    ) -> prediction: TaggedTable
    ```

## `#!sds fun` recall {#safeds.ml.classical.classification.AdaBoostClassifier.recall data-toc-label='recall'}

Compute the classifier's recall on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `recall` | [`Float`][safeds.lang.Float] | The calculated recall score, i.e. the ratio of correctly predicted positives to all expected positives. Return 1 if there are no positive expectations. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="80"
    @Pure
    fun recall(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
        @PythonName("positive_class") positiveClass: Any
    ) -> recall: Float
    ```
