# `#!sds class` RandomForestClassifier {#safeds.ml.classical.classification.RandomForestClassifier data-toc-label='RandomForestClassifier'}

Random forest classification.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfTrees` | [`Int`][safeds.lang.Int] | The number of trees to be used in the random forest. Has to be greater than 0. | `#!sds 100` |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val training = Table.fromCsvFile("training.csv").toTabularDataset("target");
    val test = Table.fromCsvFile("test.csv").toTabularDataset("target");
    val classifier = RandomForestClassifier(numberOfTrees = 10).fit(training);
    val accuracy = classifier.accuracy(test);
}
```

??? quote "Stub code in `random_forest.sdsstub`"

    ```sds linenums="20"
    class RandomForestClassifier(
        @PythonName("number_of_trees") const numberOfTrees: Int = 100
    ) sub Classifier where {
        numberOfTrees >= 1
    } {
        /**
         * Get the number of trees used in the random forest.
         */
        @PythonName("number_of_trees") attr numberOfTrees: Int

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
            @PythonName("training_set") trainingSet: TabularDataset
        ) -> fittedClassifier: RandomForestClassifier
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.classical.classification.RandomForestClassifier.isFitted data-toc-label='isFitted'}

Whether the classifier is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` numberOfTrees {#safeds.ml.classical.classification.RandomForestClassifier.numberOfTrees data-toc-label='numberOfTrees'}

Get the number of trees used in the random forest.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` accuracy {#safeds.ml.classical.classification.RandomForestClassifier.accuracy data-toc-label='accuracy'}

Compute the accuracy of the classifier on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `accuracy` | [`Float`][safeds.lang.Float] | The calculated accuracy score, i.e. the percentage of equal data. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="48"
    @Pure
    fun accuracy(
        @PythonName("validation_or_test_set") validationOrTestSet: TabularDataset
    ) -> accuracy: Float
    ```

## `#!sds fun` f1Score {#safeds.ml.classical.classification.RandomForestClassifier.f1Score data-toc-label='f1Score'}

Compute the classifier's $F_1$-score on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `f1Score` | [`Float`][safeds.lang.Float] | The calculated $F_1$-score, i.e. the harmonic mean between precision and recall. Return 1 if there are no positive expectations and predictions. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="92"
    @Pure
    @PythonName("f1_score")
    fun f1Score(
        @PythonName("validation_or_test_set") validationOrTestSet: TabularDataset,
        @PythonName("positive_class") positiveClass: Any
    ) -> f1Score: Float
    ```

## `#!sds fun` fit {#safeds.ml.classical.classification.RandomForestClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`RandomForestClassifier`][safeds.ml.classical.classification.RandomForestClassifier] | The fitted classifier. |

??? quote "Stub code in `random_forest.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TabularDataset
    ) -> fittedClassifier: RandomForestClassifier
    ```

## `#!sds fun` precision {#safeds.ml.classical.classification.RandomForestClassifier.precision data-toc-label='precision'}

Compute the classifier's precision on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `precision` | [`Float`][safeds.lang.Float] | The calculated precision score, i.e. the ratio of correctly predicted positives to all predicted positives. Return 1 if no positive predictions are made. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="62"
    @Pure
    fun precision(
        @PythonName("validation_or_test_set") validationOrTestSet: TabularDataset,
        @PythonName("positive_class") positiveClass: Any
    ) -> precision: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.classification.RandomForestClassifier.predict data-toc-label='predict'}

Predict a target vector using a dataset containing feature vectors. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | [`Table`][safeds.data.tabular.containers.Table] | The dataset containing the feature vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | A dataset containing the given feature vectors and the predicted target vector. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="36"
    @Pure
    fun predict(
        dataset: Table
    ) -> prediction: TabularDataset
    ```

## `#!sds fun` recall {#safeds.ml.classical.classification.RandomForestClassifier.recall data-toc-label='recall'}

Compute the classifier's recall on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `recall` | [`Float`][safeds.lang.Float] | The calculated recall score, i.e. the ratio of correctly predicted positives to all expected positives. Return 1 if there are no positive expectations. |

??? quote "Stub code in `classifier.sdsstub`"

    ```sds linenums="77"
    @Pure
    fun recall(
        @PythonName("validation_or_test_set") validationOrTestSet: TabularDataset,
        @PythonName("positive_class") positiveClass: Any
    ) -> recall: Float
    ```
