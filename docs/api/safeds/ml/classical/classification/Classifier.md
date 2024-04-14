---
search:
  boost: 0.5
---

# `#!sds abstract class` Classifier {#safeds.ml.classical.classification.Classifier data-toc-label='Classifier'}

Abstract base class for all classifiers.

**Inheritors:**

- [`AdaBoostClassifier`][safeds.ml.classical.classification.AdaBoostClassifier]
- [`DecisionTreeClassifier`][safeds.ml.classical.classification.DecisionTreeClassifier]
- [`GradientBoostingClassifier`][safeds.ml.classical.classification.GradientBoostingClassifier]
- [`KNearestNeighborsClassifier`][safeds.ml.classical.classification.KNearestNeighborsClassifier]
- [`LogisticRegressionClassifier`][safeds.ml.classical.classification.LogisticRegressionClassifier]
- [`RandomForestClassifier`][safeds.ml.classical.classification.RandomForestClassifier]
- [`SupportVectorMachineClassifier`][safeds.ml.classical.classification.SupportVectorMachineClassifier]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="13"
    class Classifier {
        /**
         * Create a copy of this classifier and fit it with the given training data.
         *
         * This classifier is not modified.
         *
         * @param trainingSet The training data containing the feature and target vectors.
         *
         * @result fittedClassifier The fitted classifier.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun fit(
            @PythonName("training_set") trainingSet: TaggedTable
        ) -> fittedClassifier: Classifier

        /**
         * Predict a target vector using a dataset containing feature vectors. The model has to be trained first.
         *
         * @param dataset The dataset containing the feature vectors.
         *
         * @result prediction A dataset containing the given feature vectors and the predicted target vector.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun predict(
            dataset: Table
        ) -> prediction: TaggedTable

        /**
         * Check if the classifier is fitted.
         *
         * @result isFitted Whether the classifier is fitted.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("is_fitted")
        fun isFitted() -> isFitted: Boolean

        /**
         * Compute the accuracy of the classifier on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result accuracy The calculated accuracy score, i.e. the percentage of equal data.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun accuracy(
            @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
        ) -> accuracy: Float

        /**
         * Compute the classifier's precision on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result precision The calculated precision score, i.e. the ratio of correctly predicted positives to all predicted positives.
         * Return 1 if no positive predictions are made.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun precision(
            @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
            @PythonName("positive_class") positiveClass: Any
        ) -> precision: Float

        /**
         * Compute the classifier's recall on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result recall The calculated recall score, i.e. the ratio of correctly predicted positives to all expected positives.
         * Return 1 if there are no positive expectations.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun recall(
            @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
            @PythonName("positive_class") positiveClass: Any
        ) -> recall: Float

        /**
         * Compute the classifier's $F_1$-score on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result f1Score The calculated $F_1$-score, i.e. the harmonic mean between precision and recall.
         * Return 1 if there are no positive expectations and predictions.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("f1_score")
        fun f1Score(
            @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
            @PythonName("positive_class") positiveClass: Any
        ) -> f1Score: Float
    }
    ```

## `#!sds fun` accuracy {#safeds.ml.classical.classification.Classifier.accuracy data-toc-label='accuracy'}

Compute the accuracy of the classifier on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `accuracy` | [`Float`][safeds.lang.Float] | The calculated accuracy score, i.e. the percentage of equal data. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="76"
    @Pure
    fun accuracy(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
    ) -> accuracy: Float
    ```

## `#!sds fun` f1Score {#safeds.ml.classical.classification.Classifier.f1Score data-toc-label='f1Score'}

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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="135"
    @Pure
    @PythonName("f1_score")
    fun f1Score(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
        @PythonName("positive_class") positiveClass: Any
    ) -> f1Score: Float
    ```

## `#!sds fun` fit {#safeds.ml.classical.classification.Classifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`Classifier`][safeds.ml.classical.classification.Classifier] | The fitted classifier. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="28"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: Classifier
    ```

## `#!sds fun` isFitted {#safeds.ml.classical.classification.Classifier.isFitted data-toc-label='isFitted'}

Check if the classifier is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `isFitted` | [`Boolean`][safeds.lang.Boolean] | Whether the classifier is fitted. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="60"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> isFitted: Boolean
    ```

## `#!sds fun` precision {#safeds.ml.classical.classification.Classifier.precision data-toc-label='precision'}

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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="95"
    @Pure
    fun precision(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
        @PythonName("positive_class") positiveClass: Any
    ) -> precision: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.classification.Classifier.predict data-toc-label='predict'}

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

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="45"
    @Pure
    fun predict(
        dataset: Table
    ) -> prediction: TaggedTable
    ```

## `#!sds fun` recall {#safeds.ml.classical.classification.Classifier.recall data-toc-label='recall'}

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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="115"
    @Pure
    fun recall(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable,
        @PythonName("positive_class") positiveClass: Any
    ) -> recall: Float
    ```
