# <code class="doc-symbol doc-symbol-class"></code> `SupportVectorRegressor` {#safeds.ml.classical.regression.SupportVectorRegressor data-toc-label='[class] SupportVectorRegressor'}

Support vector machine for regression.

**Parent type:** [`Regressor`][safeds.ml.classical.regression.Regressor]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `c` | [`Float`][safeds.lang.Float] | The strength of regularization. Must be greater than 0. | `#!sds 1.0` |
| `kernel` | [`Kernel`][safeds.ml.classical.regression.SupportVectorRegressor.Kernel] | The type of kernel to be used. Defaults to a radial basis function kernel. | `#!sds SupportVectorRegressor.Kernel.RadialBasisFunction` |

**Examples:**

```sds hl_lines="4 5"
pipeline example {
    val training = Table.fromCsvFile("training.csv").toTabularDataset("target");
    val test = Table.fromCsvFile("test.csv").toTabularDataset("target");
    val regressor = SupportVectorRegressor(
        kernel = SupportVectorRegressor.Kernel.Linear
    ).fit(training);
    val meanSquaredError = regressor.meanSquaredError(test);
}
```

??? quote "Stub code in `SupportVectorRegressor.sdsstub`"

    ```sds linenums="23"
    class SupportVectorRegressor(
        const c: Float = 1.0,
        kernel: SupportVectorRegressor.Kernel = SupportVectorRegressor.Kernel.RadialBasisFunction
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
            @PythonName("linear")
            Linear

            /**
             * A polynomial kernel.
             *
             * @param degree The degree of the polynomial.
             */
            @PythonName("polynomial")
            Polynomial(const degree: Int) where {
                degree > 0
            }

            /**
             * A sigmoid kernel.
             */
            @PythonName("sigmoid")
            Sigmoid

            /**
             * A radial basis function kernel.
             */
            @PythonName("radial_basis_function")
            RadialBasisFunction
        }

        /**
         * Get the regularization strength.
         */
        attr c: Float
        /**
         * Get the type of kernel used.
         */
        attr kernel: SupportVectorRegressor.Kernel

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
            @PythonName("training_set") trainingSet: TabularDataset
        ) -> fittedRegressor: SupportVectorRegressor
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `c` {#safeds.ml.classical.regression.SupportVectorRegressor.c data-toc-label='[attribute] c'}

Get the regularization strength.

**Type:** [`Float`][safeds.lang.Float]

## <code class="doc-symbol doc-symbol-attribute"></code> `isFitted` {#safeds.ml.classical.regression.SupportVectorRegressor.isFitted data-toc-label='[attribute] isFitted'}

Whether the model is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-attribute"></code> `kernel` {#safeds.ml.classical.regression.SupportVectorRegressor.kernel data-toc-label='[attribute] kernel'}

Get the type of kernel used.

**Type:** [`Kernel`][safeds.ml.classical.regression.SupportVectorRegressor.Kernel]

## <code class="doc-symbol doc-symbol-function"></code> `coefficientOfDetermination` {#safeds.ml.classical.regression.SupportVectorRegressor.coefficientOfDetermination data-toc-label='[function] coefficientOfDetermination'}

Compute the coefficient of determination (R²) of the regressor on the given data.

The coefficient of determination compares the regressor's predictions to another model that always predicts the
mean of the target values. It is a measure of how well the regressor explains the variance in the target values.

The **higher** the coefficient of determination, the better the regressor. Results range from negative infinity
to 1.0. You can interpret the coefficient of determination as follows:

| R²         | Interpretation                                                                             |
| ---------- | ------------------------------------------------------------------------------------------ |
| 1.0        | The model perfectly predicts the target values. Did you overfit?                           |
| (0.0, 1.0) | The model is better than predicting the mean of the target values. You should be here.     |
| 0.0        | The model is as good as predicting the mean of the target values. Try something else.      |
| (-∞, 0.0)  | The model is worse than predicting the mean of the target values. Something is very wrong. |

**Note:** Some other libraries call this metric `r2_score`.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `coefficientOfDetermination` | [`Float`][safeds.lang.Float] | The coefficient of determination of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="60"
    @Pure
    @PythonName("coefficient_of_determination")
    fun coefficientOfDetermination(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> coefficientOfDetermination: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `fit` {#safeds.ml.classical.regression.SupportVectorRegressor.fit data-toc-label='[function] fit'}

Create a copy of this regressor and fit it with the given training data.

This regressor is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedRegressor` | [`SupportVectorRegressor`][safeds.ml.classical.regression.SupportVectorRegressor] | The fitted regressor. |

??? quote "Stub code in `SupportVectorRegressor.sdsstub`"

    ```sds linenums="80"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TabularDataset
    ) -> fittedRegressor: SupportVectorRegressor
    ```

## <code class="doc-symbol doc-symbol-function"></code> `getFeatureNames` {#safeds.ml.classical.regression.SupportVectorRegressor.getFeatureNames data-toc-label='[function] getFeatureNames'}

Return the names of the feature columns.

**Note:** The model must be fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `featureNames` | [`List<String>`][safeds.lang.List] | The names of the feature columns. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="52"
    @Pure
    @PythonName("get_feature_names")
    fun getFeatureNames() -> featureNames: List<String>
    ```

## <code class="doc-symbol doc-symbol-function"></code> `getFeaturesSchema` {#safeds.ml.classical.regression.SupportVectorRegressor.getFeaturesSchema data-toc-label='[function] getFeaturesSchema'}

Return the schema of the feature columns.

**Note:** The model must be fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `featureSchema` | [`Schema`][safeds.data.tabular.typing.Schema] | The schema of the feature columns. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="63"
    @Pure
    @PythonName("get_features_schema")
    fun getFeaturesSchema() -> featureSchema: Schema
    ```

## <code class="doc-symbol doc-symbol-function"></code> `getTargetName` {#safeds.ml.classical.regression.SupportVectorRegressor.getTargetName data-toc-label='[function] getTargetName'}

Return the name of the target column.

**Note:** The model must be fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `targetName` | [`String`][safeds.lang.String] | The name of the target column. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="74"
    @Pure
    @PythonName("get_target_name")
    fun getTargetName() -> targetName: String
    ```

## <code class="doc-symbol doc-symbol-function"></code> `getTargetType` {#safeds.ml.classical.regression.SupportVectorRegressor.getTargetType data-toc-label='[function] getTargetType'}

Return the type of the target column.

**Note:** The model must be fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `targetType` | [`DataType`][safeds.data.tabular.typing.DataType] | The type of the target column. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="85"
    @Pure
    @PythonName("get_target_type")
    fun getTargetType() -> targetType: DataType
    ```

## <code class="doc-symbol doc-symbol-function"></code> `meanAbsoluteError` {#safeds.ml.classical.regression.SupportVectorRegressor.meanAbsoluteError data-toc-label='[function] meanAbsoluteError'}

Compute the mean absolute error (MAE) of the regressor on the given data.

The mean absolute error is the average of the absolute differences between the predicted and expected target
values. The **lower** the mean absolute error, the better the regressor. Results range from 0.0 to positive
infinity.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanAbsoluteError` | [`Float`][safeds.lang.Float] | The mean absolute error of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="77"
    @Pure
    @PythonName("mean_absolute_error")
    fun meanAbsoluteError(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> meanAbsoluteError: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `meanDirectionalAccuracy` {#safeds.ml.classical.regression.SupportVectorRegressor.meanDirectionalAccuracy data-toc-label='[function] meanDirectionalAccuracy'}

Compute the mean directional accuracy (MDA) of the regressor on the given data.

This metric compares two consecutive target values and checks if the predicted direction (down/unchanged/up)
matches the expected direction. The mean directional accuracy is the proportion of correctly predicted
directions. The **higher** the mean directional accuracy, the better the regressor. Results range from 0.0 to
1.0.

This metric is useful for time series data, where the order of the target values has a meaning. It is not useful
for other types of data. Because of this, it is not included in the `summarize_metrics` method.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanDirectionalAccuracy` | [`Float`][safeds.lang.Float] | The mean directional accuracy of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="98"
    @Pure
    @PythonName("mean_directional_accuracy")
    fun meanDirectionalAccuracy(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> meanDirectionalAccuracy: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `meanSquaredError` {#safeds.ml.classical.regression.SupportVectorRegressor.meanSquaredError data-toc-label='[function] meanSquaredError'}

Compute the mean squared error (MSE) of the regressor on the given data.

The mean squared error is the average of the squared differences between the predicted and expected target
values. The **lower** the mean squared error, the better the regressor. Results range from 0.0 to positive
infinity.

**Note:** To get the root mean squared error (RMSE), take the square root of the result.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `meanSquaredError` | [`Float`][safeds.lang.Float] | The mean squared error of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="117"
    @Pure
    @PythonName("mean_squared_error")
    fun meanSquaredError(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> meanSquaredError: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `medianAbsoluteDeviation` {#safeds.ml.classical.regression.SupportVectorRegressor.medianAbsoluteDeviation data-toc-label='[function] medianAbsoluteDeviation'}

Compute the median absolute deviation (MAD) of the regressor on the given data.

The median absolute deviation is the median of the absolute differences between the predicted and expected
target values. The **lower** the median absolute deviation, the better the regressor. Results range from 0.0 to
positive infinity.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `medianAbsoluteDeviation` | [`Float`][safeds.lang.Float] | The median absolute deviation of the regressor. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="134"
    @Pure
    @PythonName("median_absolute_deviation")
    fun medianAbsoluteDeviation(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> medianAbsoluteDeviation: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `predict` {#safeds.ml.classical.regression.SupportVectorRegressor.predict data-toc-label='[function] predict'}

Predict the target values on the given dataset.

**Note:** The model must be fitted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `dataset` | `#!sds union<Table, TabularDataset>` | The dataset containing at least the features. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The given dataset with an additional column for the predicted target values. |

??? quote "Stub code in `SupervisedModel.sdsstub`"

    ```sds linenums="40"
    @Pure
    fun predict(
        dataset: union<Table, TabularDataset>
    ) -> prediction: TabularDataset
    ```

## <code class="doc-symbol doc-symbol-function"></code> `summarizeMetrics` {#safeds.ml.classical.regression.SupportVectorRegressor.summarizeMetrics data-toc-label='[function] summarizeMetrics'}

Summarize the regressor's metrics on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `metrics` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the regressor's metrics. |

??? quote "Stub code in `Regressor.sdsstub`"

    ```sds linenums="32"
    @Pure
    @PythonName("summarize_metrics")
    fun summarizeMetrics(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> metrics: Table
    ```

## <code class="doc-symbol doc-symbol-enum"></code> `Kernel` {#safeds.ml.classical.regression.SupportVectorRegressor.Kernel data-toc-label='[enum] Kernel'}

The kernel functions that can be used in the support vector machine.

??? quote "Stub code in `SupportVectorRegressor.sdsstub`"

    ```sds linenums="32"
    enum Kernel {
        /**
         * A linear kernel.
         */
        @PythonName("linear")
        Linear

        /**
         * A polynomial kernel.
         *
         * @param degree The degree of the polynomial.
         */
        @PythonName("polynomial")
        Polynomial(const degree: Int) where {
            degree > 0
        }

        /**
         * A sigmoid kernel.
         */
        @PythonName("sigmoid")
        Sigmoid

        /**
         * A radial basis function kernel.
         */
        @PythonName("radial_basis_function")
        RadialBasisFunction
    }
    ```

### <code class="doc-symbol doc-symbol-variant"></code> `Linear` {#safeds.ml.classical.regression.SupportVectorRegressor.Kernel.Linear data-toc-label='[variant] Linear'}

A linear kernel.

### <code class="doc-symbol doc-symbol-variant"></code> `Polynomial` {#safeds.ml.classical.regression.SupportVectorRegressor.Kernel.Polynomial data-toc-label='[variant] Polynomial'}

A polynomial kernel.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `degree` | [`Int`][safeds.lang.Int] | The degree of the polynomial. | - |

### <code class="doc-symbol doc-symbol-variant"></code> `RadialBasisFunction` {#safeds.ml.classical.regression.SupportVectorRegressor.Kernel.RadialBasisFunction data-toc-label='[variant] RadialBasisFunction'}

A radial basis function kernel.

### <code class="doc-symbol doc-symbol-variant"></code> `Sigmoid` {#safeds.ml.classical.regression.SupportVectorRegressor.Kernel.Sigmoid data-toc-label='[variant] Sigmoid'}

A sigmoid kernel.
