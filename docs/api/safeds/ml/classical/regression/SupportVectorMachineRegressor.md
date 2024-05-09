# `#!sds class` SupportVectorMachineRegressor {#safeds.ml.classical.regression.SupportVectorMachineRegressor data-toc-label='SupportVectorMachineRegressor'}

Support vector machine.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `c` | [`Float`][safeds.lang.Float] | The strength of regularization. Must be strictly positive. | `#!sds 1.0` |
| `kernel` | [`Kernel`][safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel] | The type of kernel to be used. Defaults to None. | `#!sds SupportVectorMachineRegressor.Kernel.RadialBasisFunction` |

**Examples:**

```sds hl_lines="4 5"
pipeline example {
    val training = Table.fromCsvFile("training.csv").toTabularDataset("target");
    val test = Table.fromCsvFile("test.csv").toTabularDataset("target");
    val regressor = SupportVectorMachineRegressor(
        kernel = SupportVectorMachineRegressor.Kernel.Linear
    ).fit(training);
    val meanSquaredError = regressor.meanSquaredError(test);
}
```

??? quote "Stub code in `SupportVectorMachineRegressor.sdsstub`"

    ```sds linenums="23"
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
            @PythonName("training_set") trainingSet: union<ExperimentalTabularDataset, TabularDataset>
        ) -> fittedRegressor: SupportVectorMachineRegressor
    }
    ```

## `#!sds attr` c {#safeds.ml.classical.regression.SupportVectorMachineRegressor.c data-toc-label='c'}

Get the regularization strength.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` isFitted {#safeds.ml.classical.regression.SupportVectorMachineRegressor.isFitted data-toc-label='isFitted'}

Whether the regressor is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` kernel {#safeds.ml.classical.regression.SupportVectorMachineRegressor.kernel data-toc-label='kernel'}

Get the type of kernel used.

**Type:** [`Kernel`][safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel]

## `#!sds fun` fit {#safeds.ml.classical.regression.SupportVectorMachineRegressor.fit data-toc-label='fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`SupportVectorMachineRegressor`][safeds.ml.classical.regression.SupportVectorMachineRegressor] | The fitted regressor. |

??? quote "Stub code in `SupportVectorMachineRegressor.sdsstub`"

    ```sds linenums="74"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> fittedRegressor: SupportVectorMachineRegressor
    ```

## `#!sds fun` meanAbsoluteError {#safeds.ml.classical.regression.SupportVectorMachineRegressor.meanAbsoluteError data-toc-label='meanAbsoluteError'}

Compute the mean absolute error (MAE) of the regressor on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The calculated mean absolute error (the average of the distance of each individual row). |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="61"
    @Pure
    @PythonName("mean_absolute_error")
    fun meanAbsoluteError(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> meanAbsoluteError: Float
    ```

## `#!sds fun` meanSquaredError {#safeds.ml.classical.regression.SupportVectorMachineRegressor.meanSquaredError data-toc-label='meanSquaredError'}

Compute the mean squared error (MSE) on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The calculated mean squared error (the average of the distance of each individual row squared). |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="74"
    @Pure
    @PythonName("mean_squared_error")
    fun meanSquaredError(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> meanSquaredError: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.regression.SupportVectorMachineRegressor.predict data-toc-label='predict'}

Predict a target vector using a dataset containing feature vectors. The model has to be trained first.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | `#!sds union<ExperimentalTable, ExperimentalTabularDataset, Table>` | The dataset containing the feature vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | A dataset containing the given feature vectors and the predicted target vector. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="36"
    @Pure
    fun predict(
        dataset: union<ExperimentalTable, ExperimentalTabularDataset, Table>
    ) -> prediction: TabularDataset
    ```

## `#!sds fun` summarizeMetrics {#safeds.ml.classical.regression.SupportVectorMachineRegressor.summarizeMetrics data-toc-label='summarizeMetrics'}

Summarize the regressor's metrics on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<ExperimentalTabularDataset, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `metrics` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the regressor's metrics. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="48"
    @Pure
    @PythonName("summarize_metrics")
    fun summarizeMetrics(
        @PythonName("validation_or_test_set") validationOrTestSet: union<ExperimentalTabularDataset, TabularDataset>
    ) -> metrics: Table
    ```

## `#!sds enum` Kernel {#safeds.ml.classical.regression.SupportVectorMachineRegressor.Kernel data-toc-label='Kernel'}

The kernel functions that can be used in the support vector machine.

??? quote "Stub code in `SupportVectorMachineRegressor.sdsstub`"

    ```sds linenums="32"
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
