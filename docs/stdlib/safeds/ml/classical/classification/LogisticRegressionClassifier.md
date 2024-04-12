# `#!sds class` LogisticRegressionClassifier {#safeds.ml.classical.classification.LogisticRegressionClassifier data-toc-label='LogisticRegressionClassifier'}

Regularized logistic regression.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

??? quote "Stub code in `logistic_regression.sdsstub`"

    ```sds linenums="9"
    class LogisticRegressionClassifier() sub Classifier {
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
        ) -> fittedClassifier: LogisticRegressionClassifier
    }
    ```

## `#!sds fun` fit {#safeds.ml.classical.classification.LogisticRegressionClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`LogisticRegressionClassifier`][safeds.ml.classical.classification.LogisticRegressionClassifier] | The fitted classifier. |

??? quote "Stub code in `logistic_regression.sdsstub`"

    ```sds linenums="19"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: LogisticRegressionClassifier
    ```
