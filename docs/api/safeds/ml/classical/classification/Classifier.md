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

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="9"
    class Classifier {
        /**
         * Whether the classifier is fitted.
         */
        @PythonName("is_fitted") attr isFitted: Boolean

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
            @PythonName("training_set") trainingSet: union<ExperimentalTabularDataset, TabularDataset>
        ) -> fittedClassifier: Classifier

        /**
         * Predict a target vector using a dataset containing feature vectors. The model has to be trained first.
         *
         * @param dataset The dataset containing the feature vectors.
         *
         * @result prediction A dataset containing the given feature vectors and the predicted target vector.
         */
        @Pure
        fun predict(
            dataset: union<ExperimentalTable, ExperimentalTabularDataset, Table>
        ) -> prediction: TabularDataset

        /**
         * Summarize the classifier's metrics on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result metrics A table containing the classifier's metrics.
         */
        @Pure
        @PythonName("summarize_metrics")
        fun summarizeMetrics(
            @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>,
            @PythonName("positive_class") positiveClass: Any
        ) -> metrics: Table

        /**
         * Compute the accuracy of the classifier on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         *
         * @result accuracy The calculated accuracy score, i.e. the percentage of equal data.
         */
        @Pure
        fun accuracy(
            @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>
        ) -> accuracy: Float

        /**
         * Compute the classifier's precision on the given data.
         *
         * @param validationOrTestSet The validation or test set.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result precision The calculated precision score, i.e. the ratio of correctly predicted positives to all predicted positives.
         * Return 1 if no positive predictions are made.
         */
        @Pure
        fun precision(
            @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>,
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
         */
        @Pure
        fun recall(
            @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>,
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
         */
        @Pure
        @PythonName("f1_score")
        fun f1Score(
            @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>,
            @PythonName("positive_class") positiveClass: Any
        ) -> f1Score: Float
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.classification.Classifier.isFitted data-toc-label='isFitted'}

Whether the classifier is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` accuracy {#safeds.ml.classical.classification.Classifier.accuracy data-toc-label='accuracy'}

Compute the accuracy of the classifier on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `accuracy` | [`Float`][safeds.lang.Float] | The calculated accuracy score, i.e. the percentage of equal data. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="63"
    @Pure
    fun accuracy(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> accuracy: Float
    ```

## `#!sds fun` f1Score {#safeds.ml.classical.classification.Classifier.f1Score data-toc-label='f1Score'}

Compute the classifier's $F_1$-score on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `f1Score` | [`Float`][safeds.lang.Float] | The calculated $F_1$-score, i.e. the harmonic mean between precision and recall. Return 1 if there are no positive expectations and predictions. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="107"
    @Pure
    @PythonName("f1_score")
    fun f1Score(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> f1Score: Float
    ```

## `#!sds fun` fit {#safeds.ml.classical.classification.Classifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`Classifier`][safeds.ml.classical.classification.Classifier] | The fitted classifier. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="24"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> fittedClassifier: Classifier
    ```

## `#!sds fun` precision {#safeds.ml.classical.classification.Classifier.precision data-toc-label='precision'}

Compute the classifier's precision on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `precision` | [`Float`][safeds.lang.Float] | The calculated precision score, i.e. the ratio of correctly predicted positives to all predicted positives. Return 1 if no positive predictions are made. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="77"
    @Pure
    fun precision(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> precision: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.classification.Classifier.predict data-toc-label='predict'}

Predict a target vector using a dataset containing feature vectors. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | `#!sds union<ExperimentalTable, ExperimentalTabularDataset, Table>` | The dataset containing the feature vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | A dataset containing the given feature vectors and the predicted target vector. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="36"
    @Pure
    fun predict(
        dataset: union<ExperimentalTable, ExperimentalTabularDataset, Table>
    ) -> prediction: TabularDataset
    ```

## `#!sds fun` recall {#safeds.ml.classical.classification.Classifier.recall data-toc-label='recall'}

Compute the classifier's recall on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `recall` | [`Float`][safeds.lang.Float] | The calculated recall score, i.e. the ratio of correctly predicted positives to all expected positives. Return 1 if there are no positive expectations. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="92"
    @Pure
    fun recall(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> recall: Float
    ```

## `#!sds fun` summarizeMetrics {#safeds.ml.classical.classification.Classifier.summarizeMetrics data-toc-label='summarizeMetrics'}

Summarize the classifier's metrics on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `metrics` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the classifier's metrics. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="49"
    @Pure
    @PythonName("summarize_metrics")
    fun summarizeMetrics(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> metrics: Table
    ```
