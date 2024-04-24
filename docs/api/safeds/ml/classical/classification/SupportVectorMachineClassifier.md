# `#!sds class` SupportVectorMachineClassifier {#safeds.ml.classical.classification.SupportVectorMachineClassifier data-toc-label='SupportVectorMachineClassifier'}

Support vector machine.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `c` | [`Float`][safeds.lang.Float] | The strength of regularization. Must be strictly positive. | `#!sds 1.0` |
| `kernel` | [`Kernel`][safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel] | The type of kernel to be used. Defaults to None. | `#!sds SupportVectorMachineClassifier.Kernel.RadialBasisFunction` |

**Examples:**

```sds hl_lines="4 5"
pipeline example {
    val training = Table.fromCsvFile("training.csv").tagColumns("target");
    val test = Table.fromCsvFile("test.csv").tagColumns("target");
    val classifier = SupportVectorMachineClassifier(
        kernel = SupportVectorMachineClassifier.Kernel.Linear
    ).fit(training);
    val accuracy = classifier.accuracy(test);
}
```

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="22"
    class SupportVectorMachineClassifier(
        const c: Float = 1.0,
        kernel: SupportVectorMachineClassifier.Kernel = SupportVectorMachineClassifier.Kernel.RadialBasisFunction
    ) sub Classifier where {
        c > 0.0
    } {
        /**
         * The kernel functions that can be used in the support vector machine.
         */
        enum Kernel {
            /**
             * A linear kernel.
             */
            Linear

            /**
             * A polynomial kernel.
             *
             * @param degree The degree of the polynomial.
             */
            Polynomial(degree: Int)

            /**
             * A sigmoid kernel.
             */
            Sigmoid

            /**
             * A radial basis function kernel.
             */
            RadialBasisFunction
        }

        /**
         * Get the regularization strength.
         */
        attr c: Float
        /**
         * Get the type of kernel used.
         */
        attr kernel: SupportVectorMachineClassifier.Kernel

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
        ) -> fittedClassifier: SupportVectorMachineClassifier
    }
    ```

## `#!sds attr` c {#safeds.ml.classical.classification.SupportVectorMachineClassifier.c data-toc-label='c'}

Get the regularization strength.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` kernel {#safeds.ml.classical.classification.SupportVectorMachineClassifier.kernel data-toc-label='kernel'}

Get the type of kernel used.

**Type:** [`Kernel`][safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel]

## `#!sds fun` accuracy {#safeds.ml.classical.classification.SupportVectorMachineClassifier.accuracy data-toc-label='accuracy'}

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

## `#!sds fun` f1Score {#safeds.ml.classical.classification.SupportVectorMachineClassifier.f1Score data-toc-label='f1Score'}

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

## `#!sds fun` fit {#safeds.ml.classical.classification.SupportVectorMachineClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`SupportVectorMachineClassifier`][safeds.ml.classical.classification.SupportVectorMachineClassifier] | The fitted classifier. |

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="73"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: SupportVectorMachineClassifier
    ```

## `#!sds fun` isFitted {#safeds.ml.classical.classification.SupportVectorMachineClassifier.isFitted data-toc-label='isFitted'}

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

## `#!sds fun` precision {#safeds.ml.classical.classification.SupportVectorMachineClassifier.precision data-toc-label='precision'}

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

## `#!sds fun` predict {#safeds.ml.classical.classification.SupportVectorMachineClassifier.predict data-toc-label='predict'}

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

## `#!sds fun` recall {#safeds.ml.classical.classification.SupportVectorMachineClassifier.recall data-toc-label='recall'}

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

## `#!sds enum` Kernel {#safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel data-toc-label='Kernel'}

The kernel functions that can be used in the support vector machine.

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="31"
    enum Kernel {
        /**
         * A linear kernel.
         */
        Linear

        /**
         * A polynomial kernel.
         *
         * @param degree The degree of the polynomial.
         */
        Polynomial(degree: Int)

        /**
         * A sigmoid kernel.
         */
        Sigmoid

        /**
         * A radial basis function kernel.
         */
        RadialBasisFunction
    }
    ```

### Linear {#safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel.Linear data-toc-label='Linear'}

A linear kernel.

### Polynomial {#safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel.Polynomial data-toc-label='Polynomial'}

A polynomial kernel.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `degree` | [`Int`][safeds.lang.Int] | The degree of the polynomial. | - |

### RadialBasisFunction {#safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel.RadialBasisFunction data-toc-label='RadialBasisFunction'}

A radial basis function kernel.

### Sigmoid {#safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel.Sigmoid data-toc-label='Sigmoid'}

A sigmoid kernel.
