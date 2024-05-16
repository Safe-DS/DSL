# :test_tube:{ title="Experimental" } `#!sds class` NeuralNetworkRegressor {#safeds.ml.nn.NeuralNetworkRegressor data-toc-label='NeuralNetworkRegressor'}

A NeuralNetworkRegressor is a neural network that is used for regression tasks.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `inputConversion` | `#!sds InputConversion<FitIn, PredictIn>` | to convert the input data for the neural network | - |
| `layers` | [`List<Layer>`][safeds.lang.List] | a list of layers for the neural network to learn | - |
| `outputConversion` | `#!sds OutputConversion<PredictIn, PredictOut>` | to convert the output data of the neural network back | - |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `FitIn` | [`Any?`][safeds.lang.Any] | - | - |
| `PredictIn` | [`Any?`][safeds.lang.Any] | - | - |
| `PredictOut` | [`Any?`][safeds.lang.Any] | - | - |

??? quote "Stub code in `NeuralNetworkRegressor.sdsstub`"

    ```sds linenums="15"
    class NeuralNetworkRegressor<FitIn, PredictIn, PredictOut>(
        @PythonName("input_conversion") inputConversion: InputConversion<FitIn, PredictIn>,
        layers: List<Layer>,
        @PythonName("output_conversion") outputConversion: OutputConversion<PredictIn, PredictOut>
    ) {
        /**
         * Whether the regressor is fitted.
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
         * @result fittedRegressor The trained Model
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
        ) -> fittedRegressor: NeuralNetworkRegressor<FitIn, PredictIn, PredictOut> where {
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

## `#!sds attr` isFitted {#safeds.ml.nn.NeuralNetworkRegressor.isFitted data-toc-label='isFitted'}

Whether the regressor is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.ml.nn.NeuralNetworkRegressor.fit data-toc-label='fit'}

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
| `fittedRegressor` | [`NeuralNetworkRegressor<FitIn, PredictIn, PredictOut>`][safeds.ml.nn.NeuralNetworkRegressor] | The trained Model |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `NeuralNetworkRegressor.sdsstub`"

    ```sds linenums="44"
    @Pure
    fun fit(
        @PythonName("train_data") trainData: FitIn,
        @PythonName("epoch_size") const epochSize: Int = 25,
        @PythonName("batch_size") const batchSize: Int = 1,
        @PythonName("learning_rate") learningRate: Float = 0.001,
        @PythonName("callback_on_batch_completion") callbackOnBatchCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {},
        @PythonName("callback_on_epoch_completion") callbackOnEpochCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {}
    ) -> fittedRegressor: NeuralNetworkRegressor<FitIn, PredictIn, PredictOut> where {
        epochSize >= 1,
        batchSize >= 1
    }
    ```

## `#!sds fun` predict {#safeds.ml.nn.NeuralNetworkRegressor.predict data-toc-label='predict'}

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

??? quote "Stub code in `NeuralNetworkRegressor.sdsstub`"

    ```sds linenums="71"
    @Pure
    fun predict(
        @PythonName("test_data") testData: PredictIn
    ) -> prediction: PredictOut
    ```
