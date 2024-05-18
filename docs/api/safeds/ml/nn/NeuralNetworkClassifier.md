# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `NeuralNetworkClassifier` {#safeds.ml.nn.NeuralNetworkClassifier data-toc-label='[class] NeuralNetworkClassifier'}

A NeuralNetworkClassifier is a neural network that is used for classification tasks.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `inputConversion` | [`InputConversion<FitIn, PredictIn>`][safeds.ml.nn.converters.InputConversion] | to convert the input data for the neural network | - |
| `layers` | [`List<Layer>`][safeds.lang.List] | a list of layers for the neural network to learn | - |
| `outputConversion` | [`OutputConversion<PredictIn, PredictOut>`][safeds.ml.nn.converters.OutputConversion] | to convert the output data of the neural network back | - |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `FitIn` | [`Any?`][safeds.lang.Any] | - | - |
| `PredictIn` | [`Any?`][safeds.lang.Any] | - | - |
| `PredictOut` | [`Any?`][safeds.lang.Any] | - | - |

??? quote "Stub code in `NeuralNetworkClassifier.sdsstub`"

    ```sds linenums="15"
    class NeuralNetworkClassifier<FitIn, PredictIn, PredictOut>(
        @PythonName("input_conversion") inputConversion: InputConversion<FitIn, PredictIn>,
        layers: List<Layer>,
        @PythonName("output_conversion") outputConversion: OutputConversion<PredictIn, PredictOut>
    ) {
        /**
         * Whether the classifier is fitted.
         */
        @PythonName("is_fitted") attr isFitted: Boolean

        /**
         * Train the neural network with given training data.
         *
         * The original model is not modified.
         *
         * @param trainData The data the network should be trained on.
         * @param epochSize The number of times the training cycle should be done.
         * @param batchSize The size of data batches that should be loaded at one time.
         * @param learningRate The learning rate of the neural network.
         * @param callbackOnBatchCompletion Function used to view metrics while training. Gets called after a batch is completed with the index of the last batch and the overall loss average.
         * @param callbackOnEpochCompletion Function used to view metrics while training. Gets called after an epoch is completed with the index of the last epoch and the overall loss average.
         *
         * @result fittedClassifier The trained Model
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun fit(
            @PythonName("train_data") trainData: FitIn,
            @PythonName("epoch_size") const epochSize: Int = 25,
            @PythonName("batch_size") const batchSize: Int = 1,
            @PythonName("learning_rate") learningRate: Float = 0.001,
            @PythonName("callback_on_batch_completion") callbackOnBatchCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {},
            @PythonName("callback_on_epoch_completion") callbackOnEpochCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {}
        ) -> fittedClassifier: NeuralNetworkClassifier<FitIn, PredictIn, PredictOut> where {
            epochSize >= 1,
            batchSize >= 1
        }

        /**
         * Make a prediction for the given test data.
         *
         * The original Model is not modified.
         *
         * @param testData The data the network should predict.
         *
         * @result prediction The given test_data with an added "prediction" column at the end
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun predict(
            @PythonName("test_data") testData: PredictIn
        ) -> prediction: PredictOut
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `isFitted` {#safeds.ml.nn.NeuralNetworkClassifier.isFitted data-toc-label='[attribute] isFitted'}

Whether the classifier is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-function"></code> `fit` {#safeds.ml.nn.NeuralNetworkClassifier.fit data-toc-label='[function] fit'}

Train the neural network with given training data.

The original model is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainData` | `#!sds FitIn` | The data the network should be trained on. | - |
| `epochSize` | [`Int`][safeds.lang.Int] | The number of times the training cycle should be done. | `#!sds 25` |
| `batchSize` | [`Int`][safeds.lang.Int] | The size of data batches that should be loaded at one time. | `#!sds 1` |
| `learningRate` | [`Float`][safeds.lang.Float] | The learning rate of the neural network. | `#!sds 0.001` |
| `callbackOnBatchCompletion` | `#!sds (param1: Int, param2: Float) -> ()` | Function used to view metrics while training. Gets called after a batch is completed with the index of the last batch and the overall loss average. | `#!sds (param1, param2) {}` |
| `callbackOnEpochCompletion` | `#!sds (param1: Int, param2: Float) -> ()` | Function used to view metrics while training. Gets called after an epoch is completed with the index of the last epoch and the overall loss average. | `#!sds (param1, param2) {}` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`NeuralNetworkClassifier<FitIn, PredictIn, PredictOut>`][safeds.ml.nn.NeuralNetworkClassifier] | The trained Model |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `NeuralNetworkClassifier.sdsstub`"

    ```sds linenums="44"
    @Pure
    fun fit(
        @PythonName("train_data") trainData: FitIn,
        @PythonName("epoch_size") const epochSize: Int = 25,
        @PythonName("batch_size") const batchSize: Int = 1,
        @PythonName("learning_rate") learningRate: Float = 0.001,
        @PythonName("callback_on_batch_completion") callbackOnBatchCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {},
        @PythonName("callback_on_epoch_completion") callbackOnEpochCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {}
    ) -> fittedClassifier: NeuralNetworkClassifier<FitIn, PredictIn, PredictOut> where {
        epochSize >= 1,
        batchSize >= 1
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `predict` {#safeds.ml.nn.NeuralNetworkClassifier.predict data-toc-label='[function] predict'}

Make a prediction for the given test data.

The original Model is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `testData` | `#!sds PredictIn` | The data the network should predict. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | `#!sds PredictOut` | The given test_data with an added "prediction" column at the end |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `NeuralNetworkClassifier.sdsstub`"

    ```sds linenums="71"
    @Pure
    fun predict(
        @PythonName("test_data") testData: PredictIn
    ) -> prediction: PredictOut
    ```
