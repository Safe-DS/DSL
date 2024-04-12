# `#!sds class` SupportVectorMachineRegressor {#safeds.ml.classical.regression.SupportVectorMachineRegressor data-toc-label='SupportVectorMachineRegressor'}

Support vector machine.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `c` | [`Float`][safeds.lang.Float] | The strength of regularization. Must be strictly positive. | `#!sds 1.0` |
| `kernel` | [`Kernel`][safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel] | The type of kernel to be used. Defaults to None. | `#!sds SupportVectorMachineRegressor.Kernel.RadialBasisFunction` |

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="12"
    class SupportVectorMachineRegressor(
        const c: Float = 1.0,
        kernel: SupportVectorMachineRegressor.Kernel = SupportVectorMachineRegressor.Kernel.RadialBasisFunction
    ) sub Regressor where {
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
        attr kernel: SupportVectorMachineRegressor.Kernel
    
        /**
         * Create a copy of this regressor and fit it with the given training data.
         *
         * This regressor is not modified.
         *
         * @param trainingSet The training data containing the feature and target vectors.
         *
         * @result fittedRegressor The fitted regressor.
         */
        @Pure
        fun fit(
            @PythonName("training_set") trainingSet: TaggedTable
        ) -> fittedRegressor: SupportVectorMachineRegressor
    }
    ```

## `#!sds attr` c {#safeds.ml.classical.regression.SupportVectorMachineRegressor.c data-toc-label='c'}

Get the regularization strength.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` kernel {#safeds.ml.classical.regression.SupportVectorMachineRegressor.kernel data-toc-label='kernel'}

Get the type of kernel used.

**Type:** [`Kernel`][safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel]

## `#!sds fun` fit {#safeds.ml.classical.regression.SupportVectorMachineRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`SupportVectorMachineRegressor`][safeds.ml.classical.regression.SupportVectorMachineRegressor] | The fitted regressor. |

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="63"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: SupportVectorMachineRegressor
    ```

## `#!sds enum` Kernel {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel data-toc-label='Kernel'}

The kernel functions that can be used in the support vector machine.

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="21"
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

### Linear {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel.Linear data-toc-label='Linear'}

A linear kernel.

### Polynomial {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel.Polynomial data-toc-label='Polynomial'}

A polynomial kernel.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `degree` | [`Int`][safeds.lang.Int] | The degree of the polynomial. | - |

### RadialBasisFunction {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel.RadialBasisFunction data-toc-label='RadialBasisFunction'}

A radial basis function kernel.

### Sigmoid {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel.Sigmoid data-toc-label='Sigmoid'}

A sigmoid kernel.
