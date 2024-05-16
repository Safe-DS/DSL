# `#!sds class` SupportVectorClassifier {#safeds.ml.classical.classification.SupportVectorClassifier data-toc-label='SupportVectorClassifier'}

Support vector machine for classification.

**Parent type:** [`Classifier`][safeds.ml.classical.classification.Classifier]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `c` | [`Float`][safeds.lang.Float] | The strength of regularization. Must be greater than 0. | `#!sds 1.0` |
| `kernel` | [`Kernel`][safeds.ml.classical.classification.SupportVectorClassifier.Kernel] | The type of kernel to be used. Defaults to a radial basis function kernel. | `#!sds SupportVectorClassifier.Kernel.RadialBasisFunction` |

**Examples:**

```sds hl_lines="4 5"
pipeline example {
    val training = Table.fromCsvFile("training.csv").toTabularDataset("target");
    val test = Table.fromCsvFile("test.csv").toTabularDataset("target");
    val classifier = SupportVectorClassifier(
        kernel = SupportVectorClassifier.Kernel.Linear
    ).fit(training);
    val accuracy = classifier.accuracy(test);
}
```

??? quote "Stub code in `SupportVectorClassifier.sdsstub`"

    ```sds linenums="23"
    class SupportVectorClassifier(
        const c: Float = 1.0,
        kernel: SupportVectorClassifier.Kernel = SupportVectorClassifier.Kernel.RadialBasisFunction
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
        attr kernel: SupportVectorClassifier.Kernel

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
        ) -> fittedClassifier: SupportVectorClassifier
    }
    ```

## `#!sds attr` c {#safeds.ml.classical.classification.SupportVectorClassifier.c data-toc-label='c'}

Get the regularization strength.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` isFitted {#safeds.ml.classical.classification.SupportVectorClassifier.isFitted data-toc-label='isFitted'}

Whether the model is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` kernel {#safeds.ml.classical.classification.SupportVectorClassifier.kernel data-toc-label='kernel'}

Get the type of kernel used.

**Type:** [`Kernel`][safeds.ml.classical.classification.SupportVectorClassifier.Kernel]

## `#!sds fun` accuracy {#safeds.ml.classical.classification.SupportVectorClassifier.accuracy data-toc-label='accuracy'}

Compute the accuracy of the classifier on the given data.

The accuracy is the proportion of predicted target values that were correct. The **higher** the accuracy, the
better. Results range from 0.0 to 1.0.

**Note:** The model must be fitted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `accuracy` | [`Float`][safeds.lang.Float] | The classifier's accuracy. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="40"
    @Pure
    fun accuracy(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>
    ) -> accuracy: Float
    ```

## `#!sds fun` f1Score {#safeds.ml.classical.classification.SupportVectorClassifier.f1Score data-toc-label='f1Score'}

Compute the classifier's F₁ score on the given data.

The F₁ score is the harmonic mean of precision and recall. The **higher** the F₁ score, the better the
classifier. Results range from 0.0 to 1.0.

**Note:** The model must be fitted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `f1Score` | [`Float`][safeds.lang.Float] | The classifier's F₁ score. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="58"
    @Pure
    @PythonName("f1_score")
    fun f1Score(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> f1Score: Float
    ```

## `#!sds fun` fit {#safeds.ml.classical.classification.SupportVectorClassifier.fit data-toc-label='fit'}

Create a copy of this classifier and fit it with the given training data.

This classifier is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainingSet` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | The training data containing the feature and target vectors. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`SupportVectorClassifier`][safeds.ml.classical.classification.SupportVectorClassifier] | The fitted classifier. |

??? quote "Stub code in `SupportVectorClassifier.sdsstub`"

    ```sds linenums="80"
    @Pure
    fun fit(
        @PythonName("training_set") trainingSet: TabularDataset
    ) -> fittedClassifier: SupportVectorClassifier
    ```

## `#!sds fun` getFeatureNames {#safeds.ml.classical.classification.SupportVectorClassifier.getFeatureNames data-toc-label='getFeatureNames'}

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

## `#!sds fun` getFeaturesSchema {#safeds.ml.classical.classification.SupportVectorClassifier.getFeaturesSchema data-toc-label='getFeaturesSchema'}

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

## `#!sds fun` getTargetName {#safeds.ml.classical.classification.SupportVectorClassifier.getTargetName data-toc-label='getTargetName'}

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

## `#!sds fun` getTargetType {#safeds.ml.classical.classification.SupportVectorClassifier.getTargetType data-toc-label='getTargetType'}

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

## `#!sds fun` precision {#safeds.ml.classical.classification.SupportVectorClassifier.precision data-toc-label='precision'}

Compute the classifier's precision on the given data.

The precision is the proportion of positive predictions that were correct. The **higher** the precision, the
better the classifier. Results range from 0.0 to 1.0.

**Note:** The model must be fitted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `precision` | [`Float`][safeds.lang.Float] | The classifier's precision. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="78"
    @Pure
    fun precision(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> precision: Float
    ```

## `#!sds fun` predict {#safeds.ml.classical.classification.SupportVectorClassifier.predict data-toc-label='predict'}

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

## `#!sds fun` recall {#safeds.ml.classical.classification.SupportVectorClassifier.recall data-toc-label='recall'}

Compute the classifier's recall on the given data.

The recall is the proportion of actual positives that were predicted correctly. The **higher** the recall, the
better the classifier. Results range from 0.0 to 1.0.

**Note:** The model must be fitted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `recall` | [`Float`][safeds.lang.Float] | The classifier's recall. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="97"
    @Pure
    fun recall(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> recall: Float
    ```

## `#!sds fun` summarizeMetrics {#safeds.ml.classical.classification.SupportVectorClassifier.summarizeMetrics data-toc-label='summarizeMetrics'}

Summarize the classifier's metrics on the given data.

**Note:** The model must be fitted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `validationOrTestSet` | `#!sds union<Table, TabularDataset>` | The validation or test set. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `metrics` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the classifier's metrics. |

??? quote "Stub code in `Classifier.sdsstub`"

    ```sds linenums="21"
    @Pure
    @PythonName("summarize_metrics")
    fun summarizeMetrics(
        @PythonName("validation_or_test_set") validationOrTestSet: union<Table, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> metrics: Table
    ```

## `#!sds enum` Kernel {#safeds.ml.classical.classification.SupportVectorClassifier.Kernel data-toc-label='Kernel'}

The kernel functions that can be used in the support vector machine.

??? quote "Stub code in `SupportVectorClassifier.sdsstub`"

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

### Linear {#safeds.ml.classical.classification.SupportVectorClassifier.Kernel.Linear data-toc-label='Linear'}

A linear kernel.

### Polynomial {#safeds.ml.classical.classification.SupportVectorClassifier.Kernel.Polynomial data-toc-label='Polynomial'}

A polynomial kernel.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `degree` | [`Int`][safeds.lang.Int] | The degree of the polynomial. | - |

### RadialBasisFunction {#safeds.ml.classical.classification.SupportVectorClassifier.Kernel.RadialBasisFunction data-toc-label='RadialBasisFunction'}

A radial basis function kernel.

### Sigmoid {#safeds.ml.classical.classification.SupportVectorClassifier.Kernel.Sigmoid data-toc-label='Sigmoid'}

A sigmoid kernel.
