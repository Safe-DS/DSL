# `#!sds class` KNearestNeighborsClassifier {#safeds.ml.classical.classification.KNearestNeighborsClassifier data-toc-label='KNearestNeighborsClassifier'}

K-nearest-neighbors classification.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfNeighbors` | [`Int`][safeds.lang.Int] | The number of neighbors to use for interpolation. Has to be greater than 0 (validated in the constructor) and less than or equal to the sample size (validated when calling `fit`). | - |

??? quote "Stub code in `k_nearest_neighbors.sdsstub`"

    ```sds linenums="12"
    class KNearestNeighborsClassifier(
        @PythonName("number_of_neighbors") const numberOfNeighbors: Int
    ) sub Classifier where {
        numberOfNeighbors >= 1
    } {
        /**
         * Get the number of neighbors used for interpolation.
         */
        @PythonName("number_of_neighbors") attr numberOfNeighbors: Int
    
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
        ) -> fittedClassifier: KNearestNeighborsClassifier
    }
    ```

## `#!sds attr` numberOfNeighbors {#safeds.ml.classical.classification.KNearestNeighborsClassifier.numberOfNeighbors data-toc-label='numberOfNeighbors'}

Get the number of neighbors used for interpolation.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds fun` fit {#safeds.ml.classical.classification.KNearestNeighborsClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`KNearestNeighborsClassifier`][safeds.ml.classical.classification.KNearestNeighborsClassifier] | The fitted classifier. |

??? quote "Stub code in `k_nearest_neighbors.sdsstub`"

    ```sds linenums="31"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: KNearestNeighborsClassifier
    ```
