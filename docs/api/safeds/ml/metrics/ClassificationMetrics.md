# `#!sds abstract class` `ClassificationMetrics` {#safeds.ml.metrics.ClassificationMetrics data-toc-label='[abstract class] ClassificationMetrics'}

A collection of classification metrics.

??? quote "Stub code in `ClassificationMetrics.sdsstub`"

    ```sds linenums="9"
    class ClassificationMetrics {
        /**
         * Summarize classification metrics on the given data.
         *
         * @param predicted The predicted target values produced by the classifier.
         * @param expected The expected target values.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result metrics A table containing the classification metrics.
         */
        @Pure
        static fun summarize(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>,
            @PythonName("positive_class") positiveClass: Any
        ) -> metrics: Table

        /**
         * Compute the accuracy on the given data.
         *
         * The accuracy is the proportion of predicted target values that were correct. The **higher** the accuracy, the
         * better. Results range from 0.0 to 1.0.
         *
         * @param predicted The predicted target values produced by the classifier.
         * @param expected The expected target values.
         *
         * @result accuracy The calculated accuracy.
         */
        @Pure
        static fun accuracy(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>
        ) -> accuracy: Float

        /**
         * Compute the F₁ score on the given data.
         *
         * The F₁ score is the harmonic mean of precision and recall. The **higher** the F₁ score, the better the
         * classifier. Results range from 0.0 to 1.0.
         *
         * @param predicted The predicted target values produced by the classifier.
         * @param expected The expected target values.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result f1Score The calculated F₁ score.
         */
        @Pure
        @PythonName("f1_score")
        static fun f1Score(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>,
            @PythonName("positive_class") positiveClass: Any
        ) -> f1Score: Float

        /**
         * Compute the precision on the given data.
         *
         * The precision is the proportion of positive predictions that were correct. The **higher** the precision, the
         * better the classifier. Results range from 0.0 to 1.0.
         *
         * @param predicted The predicted target values produced by the classifier.
         * @param expected The expected target values.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result precision The calculated precision.
         */
        @Pure
        static fun precision(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>,
            @PythonName("positive_class") positiveClass: Any
        ) -> precision: Float

        /**
         * Compute the recall on the given data.
         *
         * The recall is the proportion of actual positives that were predicted correctly. The **higher** the recall, the
         * better the classifier. Results range from 0.0 to 1.0.
         *
         * @param predicted The predicted target values produced by the classifier.
         * @param expected The expected target values.
         * @param positiveClass The class to be considered positive. All other classes are considered negative.
         *
         * @result recall The calculated recall.
         */
        @Pure
        static fun recall(
            predicted: union<Column<Any>, TabularDataset>,
            expected: union<Column<Any>, TabularDataset>,
            @PythonName("positive_class") positiveClass: Any
        ) -> recall: Float
    }
    ```

## `#!sds static fun` `accuracy` {#safeds.ml.metrics.ClassificationMetrics.accuracy data-toc-label='[static fun] accuracy'}

Compute the accuracy on the given data.

The accuracy is the proportion of predicted target values that were correct. The **higher** the accuracy, the
better. Results range from 0.0 to 1.0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the classifier. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `accuracy` | [`Float`][safeds.lang.Float] | The calculated accuracy. |

??? quote "Stub code in `ClassificationMetrics.sdsstub`"

    ```sds linenums="37"
    @Pure
    static fun accuracy(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>
    ) -> accuracy: Float
    ```

## `#!sds static fun` `f1Score` {#safeds.ml.metrics.ClassificationMetrics.f1Score data-toc-label='[static fun] f1Score'}

Compute the F₁ score on the given data.

The F₁ score is the harmonic mean of precision and recall. The **higher** the F₁ score, the better the
classifier. Results range from 0.0 to 1.0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the classifier. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `f1Score` | [`Float`][safeds.lang.Float] | The calculated F₁ score. |

??? quote "Stub code in `ClassificationMetrics.sdsstub`"

    ```sds linenums="55"
    @Pure
    @PythonName("f1_score")
    static fun f1Score(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> f1Score: Float
    ```

## `#!sds static fun` `precision` {#safeds.ml.metrics.ClassificationMetrics.precision data-toc-label='[static fun] precision'}

Compute the precision on the given data.

The precision is the proportion of positive predictions that were correct. The **higher** the precision, the
better the classifier. Results range from 0.0 to 1.0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the classifier. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `precision` | [`Float`][safeds.lang.Float] | The calculated precision. |

??? quote "Stub code in `ClassificationMetrics.sdsstub`"

    ```sds linenums="75"
    @Pure
    static fun precision(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> precision: Float
    ```

## `#!sds static fun` `recall` {#safeds.ml.metrics.ClassificationMetrics.recall data-toc-label='[static fun] recall'}

Compute the recall on the given data.

The recall is the proportion of actual positives that were predicted correctly. The **higher** the recall, the
better the classifier. Results range from 0.0 to 1.0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the classifier. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `recall` | [`Float`][safeds.lang.Float] | The calculated recall. |

??? quote "Stub code in `ClassificationMetrics.sdsstub`"

    ```sds linenums="94"
    @Pure
    static fun recall(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> recall: Float
    ```

## `#!sds static fun` `summarize` {#safeds.ml.metrics.ClassificationMetrics.summarize data-toc-label='[static fun] summarize'}

Summarize classification metrics on the given data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicted` | `#!sds union<Column<Any>, TabularDataset>` | The predicted target values produced by the classifier. | - |
| `expected` | `#!sds union<Column<Any>, TabularDataset>` | The expected target values. | - |
| `positiveClass` | [`Any`][safeds.lang.Any] | The class to be considered positive. All other classes are considered negative. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `metrics` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the classification metrics. |

??? quote "Stub code in `ClassificationMetrics.sdsstub`"

    ```sds linenums="19"
    @Pure
    static fun summarize(
        predicted: union<Column<Any>, TabularDataset>,
        expected: union<Column<Any>, TabularDataset>,
        @PythonName("positive_class") positiveClass: Any
    ) -> metrics: Table
    ```
