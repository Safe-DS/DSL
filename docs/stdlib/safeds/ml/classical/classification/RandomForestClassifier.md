# `#!sds class` RandomForestClassifier {#safeds.ml.classical.classification.RandomForestClassifier data-toc-label='RandomForestClassifier'}

Random forest classification.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfTrees` | [`Int`][safeds.lang.Int] | The number of trees to be used in the random forest. Has to be greater than 0. | `#!sds 100` |

??? quote "Source code in `random_forest.sdsstub`"

    ```sds linenums="12"
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
            @PythonName("training_set") trainingSet: TaggedTable
        ) -> fittedClassifier: RandomForestClassifier
    }
    ```

## `#!sds attr` numberOfTrees {#safeds.ml.classical.classification.RandomForestClassifier.numberOfTrees data-toc-label='numberOfTrees'}

Get the number of trees used in the random forest.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` fit {#safeds.ml.classical.classification.RandomForestClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`RandomForestClassifier`][safeds.ml.classical.classification.RandomForestClassifier] | The fitted classifier. |

??? quote "Source code in `random_forest.sdsstub`"

    ```sds linenums="31"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: RandomForestClassifier
    ```
