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

## `#!sds fun` accuracy {#safeds.ml.classical.classification.LogisticRegressionClassifier.accuracy data-toc-label='accuracy'}

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

## `#!sds fun` f1Score {#safeds.ml.classical.classification.LogisticRegressionClassifier.f1Score data-toc-label='f1Score'}

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

## `#!sds fun` isFitted {#safeds.ml.classical.classification.LogisticRegressionClassifier.isFitted data-toc-label='isFitted'}

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

## `#!sds fun` precision {#safeds.ml.classical.classification.LogisticRegressionClassifier.precision data-toc-label='precision'}

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

## `#!sds fun` predict {#safeds.ml.classical.classification.LogisticRegressionClassifier.predict data-toc-label='predict'}

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

## `#!sds fun` recall {#safeds.ml.classical.classification.LogisticRegressionClassifier.recall data-toc-label='recall'}

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
