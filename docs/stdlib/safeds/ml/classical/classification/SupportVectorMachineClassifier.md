# `#!sds class` SupportVectorMachineClassifier {#safeds.ml.classical.classification.SupportVectorMachineClassifier data-toc-label='SupportVectorMachineClassifier'}

Support vector machine.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `c` | [`Float`][safeds.lang.Float] | The strength of regularization. Must be strictly positive. | `#!sds 1.0` |
| `kernel` | [`Kernel`][safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel] | The type of kernel to be used. Defaults to None. | `#!sds SupportVectorMachineClassifier.Kernel.RadialBasisFunction` |

??? quote "Source code in `support_vector_machine.sdsstub`"

    ```sds linenums="13"
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

??? quote "Source code in `support_vector_machine.sdsstub`"

    ```sds linenums="64"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedClassifier: SupportVectorMachineClassifier
    ```

## `#!sds enum` Kernel {#safeds.ml.classical.classification.SupportVectorMachineClassifier.Kernel data-toc-label='Kernel'}

The kernel functions that can be used in the support vector machine.

??? quote "Source code in `support_vector_machine.sdsstub`"

    ```sds linenums="22"
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
