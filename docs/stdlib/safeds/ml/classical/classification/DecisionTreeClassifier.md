# `#!sds class` DecisionTreeClassifier {#safeds.ml.classical.classification.DecisionTreeClassifier data-toc-label='DecisionTreeClassifier'}

Decision tree classification.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

??? quote "Source code in `decision_tree.sdsstub`"

    ```sds linenums="9"
    class DecisionTreeClassifier() sub Classifier {
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
        ) -> fittedClassifier: DecisionTreeClassifier
    }
    ```

## `#!sds fun` fit {#safeds.ml.classical.classification.DecisionTreeClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`DecisionTreeClassifier`][safeds.ml.classical.classification.DecisionTreeClassifier] | The fitted classifier. |

??? quote "Source code in `decision_tree.sdsstub`"

    ```sds linenums="19"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: DecisionTreeClassifier
    ```
