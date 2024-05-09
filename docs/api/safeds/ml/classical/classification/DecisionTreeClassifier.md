# `#!sds class` DecisionTreeClassifier {#safeds.ml.classical.classification.DecisionTreeClassifier data-toc-label='DecisionTreeClassifier'}

Decision tree classification.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `maximumDepth` | [`Int?`][safeds.lang.Int] | The maximum depth of each tree. If null, the depth is not limited. Has to be greater than 0. | `#!sds null` |
| `minimumNumberOfSamplesInLeaves` | [`Int`][safeds.lang.Int] | The minimum number of samples that must remain in the leaves of each tree. Has to be greater than 0. | `#!sds 1` |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val training = Table.fromCsvFile("training.csv").toTabularDataset("target");
    val test = Table.fromCsvFile("test.csv").toTabularDataset("target");
    val classifier = DecisionTreeClassifier().fit(training);
    val accuracy = classifier.accuracy(test);
}
```

??? quote "Stub code in `DecisionTreeClassifier.sdsstub`"

    ```sds linenums="23"
    class DecisionTreeClassifier(
        @PythonName("maximum_depth") maximumDepth: Int? = null,
        @PythonName("minimum_number_of_samples_in_leaves") const minimumNumberOfSamplesInLeaves: Int = 1
    ) sub Classifier where {
        minimumNumberOfSamplesInLeaves > 0
    } {
        /**
         * The maximum depth of the tree.
         */
        @PythonName("maximum_depth") attr maximumDepth: Int?
        /**
         * The minimum number of samples that must remain in the leaves of the tree.
         */
        @PythonName("minimum_number_of_samples_in_leaves") attr minimumNumberOfSamplesInLeaves: Int

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
        ) -> fittedClassifier: DecisionTreeClassifier
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.classification.DecisionTreeClassifier.isFitted data-toc-label='isFitted'}

Whether the classifier is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` maximumDepth {#safeds.ml.classical.classification.DecisionTreeClassifier.maximumDepth data-toc-label='maximumDepth'}

The maximum depth of the tree.

**Type:** [`Int?`][safeds.lang.Int]

## `#!sds attr` minimumNumberOfSamplesInLeaves {#safeds.ml.classical.classification.DecisionTreeClassifier.minimumNumberOfSamplesInLeaves data-toc-label='minimumNumberOfSamplesInLeaves'}

The minimum number of samples that must remain in the leaves of the tree.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` accuracy {#safeds.ml.classical.classification.DecisionTreeClassifier.accuracy data-toc-label='accuracy'}

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

## `#!sds fun` f1Score {#safeds.ml.classical.classification.DecisionTreeClassifier.f1Score data-toc-label='f1Score'}

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

## `#!sds fun` fit {#safeds.ml.classical.classification.DecisionTreeClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`DecisionTreeClassifier`][safeds.ml.classical.classification.DecisionTreeClassifier] | The fitted classifier. |

??? quote "Stub code in `DecisionTreeClassifier.sdsstub`"

    ```sds linenums="47"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> fittedClassifier: DecisionTreeClassifier
    ```

## `#!sds fun` precision {#safeds.ml.classical.classification.DecisionTreeClassifier.precision data-toc-label='precision'}

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

## `#!sds fun` predict {#safeds.ml.classical.classification.DecisionTreeClassifier.predict data-toc-label='predict'}

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

## `#!sds fun` recall {#safeds.ml.classical.classification.DecisionTreeClassifier.recall data-toc-label='recall'}

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

## `#!sds fun` summarizeMetrics {#safeds.ml.classical.classification.DecisionTreeClassifier.summarizeMetrics data-toc-label='summarizeMetrics'}

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
