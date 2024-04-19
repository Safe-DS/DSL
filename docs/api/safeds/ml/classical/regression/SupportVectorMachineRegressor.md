# `#!sds class` SupportVectorMachineRegressor {#safeds.ml.classical.regression.SupportVectorMachineRegressor data-toc-label='SupportVectorMachineRegressor'}

Support vector machine.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `c` | [`Float`][safeds.lang.Float] | The strength of regularization. Must be strictly positive. | `#!sds 1.0` |
| `kernel` | [`Kernel`][safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel] | The type of kernel to be used. Defaults to None. | `#!sds SupportVectorMachineRegressor.Kernel.RadialBasisFunction` |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="17"
    class SupportVectorMachineRegressor(
        const c: Float = 1.0,
        kernel: SupportVectorMachineRegressor.Kernel = SupportVectorMachineRegressor.Kernel.RadialBasisFunction
    ) sub Regressor where {
        c > 0.0
    } {
        /**
         * The kernel functions that can be used in the support vector machine.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        enum Kernel {
            /**
             * A linear kernel.
             *
             * @example
             * pipeline example {
             *     // TODO
             * }
             */
            Linear

            /**
             * A polynomial kernel.
             *
             * @param degree The degree of the polynomial.
             *
             * @example
             * pipeline example {
             *     // TODO
             * }
             */
            Polynomial(degree: Int)

            /**
             * A sigmoid kernel.
             *
             * @example
             * pipeline example {
             *     // TODO
             * }
             */
            Sigmoid

            /**
             * A radial basis function kernel.
             *
             * @example
             * pipeline example {
             *     // TODO
             * }
             */
            RadialBasisFunction
        }

        /**
         * Get the regularization strength.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr c: Float
        /**
         * Get the type of kernel used.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds attr` kernel {#safeds.ml.classical.regression.SupportVectorMachineRegressor.kernel data-toc-label='kernel'}

Get the type of kernel used.

**Type:** [`Kernel`][safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="108"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TaggedTable
    ) -> fittedRegressor: SupportVectorMachineRegressor
    ```

## `#!sds fun` isFitted {#safeds.ml.classical.regression.SupportVectorMachineRegressor.isFitted data-toc-label='isFitted'}

Check if the classifier is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `isFitted` | [`Boolean`][safeds.lang.Boolean] | Whether the regressor is fitted. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="60"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> isFitted: Boolean
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.SupportVectorMachineRegressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

Compute the mean absolute error (MAE) of the regressor on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The calculated mean absolute error (the average of the distance of each individual row). |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="94"
    @Pure
    @PythonName("mean_absolute_error")
    fun meanAbsoluteError(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
    ) -> meanAbsoluteError: Float
    ```

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.SupportVectorMachineRegressor.meanSquaredError data-toc-label='meanSquaredError'}

Compute the mean squared error (MSE) on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The calculated mean squared error (the average of the distance of each individual row squared). |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="76"
    @Pure
    @PythonName("mean_squared_error")
    fun meanSquaredError(
        @PythonName("validation_or_test_set") validationOrTestSet: TaggedTable
    ) -> meanSquaredError: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.SupportVectorMachineRegressor.predict data-toc-label='predict'}

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

??? quote "Stub code in `regressor.sdsstub`"

    ```sds linenums="45"
    @Pure
    fun predict(
        dataset: Table
    ) -> prediction: TaggedTable
    ```

## `#!sds enum` Kernel {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel data-toc-label='Kernel'}

The kernel functions that can be used in the support vector machine.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `support_vector_machine.sdsstub`"

    ```sds linenums="31"
    enum Kernel {
        /**
         * A linear kernel.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        Linear

        /**
         * A polynomial kernel.
         *
         * @param degree The degree of the polynomial.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        Polynomial(degree: Int)

        /**
         * A sigmoid kernel.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        Sigmoid

        /**
         * A radial basis function kernel.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        RadialBasisFunction
    }
    ```

### Linear {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel.Linear data-toc-label='Linear'}

A linear kernel.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

### Polynomial {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel.Polynomial data-toc-label='Polynomial'}

A polynomial kernel.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `degree` | [`Int`][safeds.lang.Int] | The degree of the polynomial. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

### RadialBasisFunction {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel.RadialBasisFunction data-toc-label='RadialBasisFunction'}

A radial basis function kernel.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

### Sigmoid {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel.Sigmoid data-toc-label='Sigmoid'}

A sigmoid kernel.

**Examples:**

```sds
pipeline example {
    // TODO
}
```
