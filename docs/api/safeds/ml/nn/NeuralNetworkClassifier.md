# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `NeuralNetworkClassifier` {#safeds.ml.nn.NeuralNetworkClassifier data-toc-label='[class] NeuralNetworkClassifier'}

A NeuralNetworkClassifier is a neural network that is used for classification tasks.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `inputConversion` | `#!sds InputConversion<D, F>` | to convert the input data for the neural network | - |
| `layers` | [`List<Layer>`][safeds.lang.List] | a list of layers for the neural network to learn | - |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `D` | [`Any?`][safeds.lang.Any] | The type of the full dataset. It's the input to `fit` and the output of `predict`. | - |
| `F` | [`Any?`][safeds.lang.Any] | The type of the features. It's the input to `predict`. | - |

??? quote "Stub code in `NeuralNetworkClassifier.sdsstub`"

    ```sds linenums="17"
    class NeuralNetworkClassifier<D, in F>(
        @PythonName("input_conversion") inputConversion: InputConversion<D, F>,
        layers: List<Layer>,
    ) {
        /**
         * Whether the classifier is fitted.
         */
        @PythonName("is_fitted") attr isFitted: Boolean

        /**
         * Load a pretrained model from a [Huggingface repository](https://huggingface.co/models/).
         *
         * @param huggingfaceRepo the name of the huggingface repository
         *
         * @result pretrainedModel the pretrained model as a NeuralNetworkClassifier
         */
        @Pure
        @PythonName("load_pretrained_model")
        static fun loadPretrainedModel(
            @PythonName("huggingface_repo") huggingfaceRepo: String
        ) -> pretrainedModel: NeuralNetworkClassifier<Any, Any>

        /**
         * Train the neural network with given training data.
         *
         * The original model is not modified.
         *
         * @param trainData The data the network should be trained on.
         * @param epochSize The number of times the training cycle should be done.
         * @param batchSize The size of data batches that should be loaded at one time.
         * @param learningRate The learning rate of the neural network.
         * @param callbackOnBatchCompletion Function used to view metrics while training. Gets called after a batch is completed with the index of the
         * last batch and the overall loss average.
         * @param callbackOnEpochCompletion Function used to view metrics while training. Gets called after an epoch is completed with the index of the
         * last epoch and the overall loss average.
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
            @PythonName("train_data") trainData: D,
            @PythonName("epoch_size") const epochSize: Int = 25,
            @PythonName("batch_size") const batchSize: Int = 1,
            @PythonName("learning_rate") learningRate: Float = 0.001,
            @PythonName("callback_on_batch_completion") callbackOnBatchCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {},
            @PythonName("callback_on_epoch_completion") callbackOnEpochCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {}
        ) -> fittedClassifier: NeuralNetworkClassifier<D, F> where {
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
            @PythonName("test_data") testData: F
        ) -> prediction: D
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
| `trainData` | `#!sds D` | The data the network should be trained on. | - |
| `epochSize` | [`Int`][safeds.lang.Int] | The number of times the training cycle should be done. | `#!sds 25` |
| `batchSize` | [`Int`][safeds.lang.Int] | The size of data batches that should be loaded at one time. | `#!sds 1` |
| `learningRate` | [`Float`][safeds.lang.Float] | The learning rate of the neural network. | `#!sds 0.001` |
| `callbackOnBatchCompletion` | `#!sds (param1: Int, param2: Float) -> ()` | Function used to view metrics while training. Gets called after a batch is completed with the index of the last batch and the overall loss average. | `#!sds (param1, param2) {}` |
| `callbackOnEpochCompletion` | `#!sds (param1: Int, param2: Float) -> ()` | Function used to view metrics while training. Gets called after an epoch is completed with the index of the last epoch and the overall loss average. | `#!sds (param1, param2) {}` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedClassifier` | [`NeuralNetworkClassifier<D, F>`][safeds.ml.nn.NeuralNetworkClassifier] | The trained Model |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `NeuralNetworkClassifier.sdsstub`"

    ```sds linenums="60"
    @Pure
    fun fit(
        @PythonName("train_data") trainData: D,
        @PythonName("epoch_size") const epochSize: Int = 25,
        @PythonName("batch_size") const batchSize: Int = 1,
        @PythonName("learning_rate") learningRate: Float = 0.001,
        @PythonName("callback_on_batch_completion") callbackOnBatchCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {},
        @PythonName("callback_on_epoch_completion") callbackOnEpochCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {}
    ) -> fittedClassifier: NeuralNetworkClassifier<D, F> where {
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
| `testData` | `#!sds F` | The data the network should predict. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | `#!sds D` | The given test_data with an added "prediction" column at the end |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `NeuralNetworkClassifier.sdsstub`"

    ```sds linenums="87"
    @Pure
    fun predict(
        @PythonName("test_data") testData: F
    ) -> prediction: D
    ```

## <code class="doc-symbol doc-symbol-static-function"></code> `loadPretrainedModel` {#safeds.ml.nn.NeuralNetworkClassifier.loadPretrainedModel data-toc-label='[static-function] loadPretrainedModel'}

Load a pretrained model from a [Huggingface repository](https://huggingface.co/models/).

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `huggingfaceRepo` | [`String`][safeds.lang.String] | the name of the huggingface repository | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `pretrainedModel` | [`NeuralNetworkClassifier<Any, Any>`][safeds.ml.nn.NeuralNetworkClassifier] | the pretrained model as a NeuralNetworkClassifier |

??? quote "Stub code in `NeuralNetworkClassifier.sdsstub`"

    ```sds linenums="33"
    @Pure
    @PythonName("load_pretrained_model")
    static fun loadPretrainedModel(
        @PythonName("huggingface_repo") huggingfaceRepo: String
    ) -> pretrainedModel: NeuralNetworkClassifier<Any, Any>
    ```
