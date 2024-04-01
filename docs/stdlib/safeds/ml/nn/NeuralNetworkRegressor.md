# `#!sds class` NeuralNetworkRegressor {#safeds.ml.nn.NeuralNetworkRegressor data-toc-label='NeuralNetworkRegressor'}

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `layers` | [`List<Any>`][safeds.lang.List] | - | - |

??? quote "Source code in `regressor.sdsstub`"

    ```sds linenums="7"
    class NeuralNetworkRegressor(
        layers: List<Any>
    ) {
        /**
         * Check if the model is fitted.
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
         * @param callbackOnBatchCompletion Function used to view metrics while training. Gets called after a batch is completed with the index of the last batch and the overall loss average.
         * @param callbackOnEpochCompletion Function used to view metrics while training. Gets called after an epoch is completed with the index of the last epoch and the overall loss average.
         *
         * @result trainedRegressor The trained Model
         */
        @Pure
        fun fit(
            @PythonName("train_data") trainData: TaggedTable,
            @PythonName("epoch_size") const epochSize: Int = 25,
            @PythonName("batch_size") const batchSize: Int = 1,
            @PythonName("callback_on_batch_completion") callbackOnBatchCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {},
            @PythonName("callback_on_epoch_completion") callbackOnEpochCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {}
        ) -> trainedRegressor: NeuralNetworkRegressor where {
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
         */
        @Pure
        fun predict(
            @PythonName("test_data") testData: Table
        ) -> prediction: TaggedTable
    }
    ```

## `#!sds attr` isFitted {#safeds.ml.nn.NeuralNetworkRegressor.isFitted data-toc-label='isFitted'}

Check if the model is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.ml.nn.NeuralNetworkRegressor.fit data-toc-label='fit'}

Train the neural network with given training data.

The original model is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `trainData` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The data the network should be trained on. | - |
| `epochSize` | [`Int`][safeds.lang.Int] | The number of times the training cycle should be done. | `#!sds 25` |
| `batchSize` | [`Int`][safeds.lang.Int] | The size of data batches that should be loaded at one time. | `#!sds 1` |
| `callbackOnBatchCompletion` | `#!sds (param1: Int, param2: Float) -> ()` | Function used to view metrics while training. Gets called after a batch is completed with the index of the last batch and the overall loss average. | `#!sds (param1, param2) {}` |
| `callbackOnEpochCompletion` | `#!sds (param1: Int, param2: Float) -> ()` | Function used to view metrics while training. Gets called after an epoch is completed with the index of the last epoch and the overall loss average. | `#!sds (param1, param2) {}` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `trainedRegressor` | [`NeuralNetworkRegressor`][safeds.ml.nn.NeuralNetworkRegressor] | The trained Model |

??? quote "Source code in `regressor.sdsstub`"

    ```sds linenums="28"
    @Pure
    fun fit(
        @PythonName("train_data") trainData: TaggedTable,
        @PythonName("epoch_size") const epochSize: Int = 25,
        @PythonName("batch_size") const batchSize: Int = 1,
        @PythonName("callback_on_batch_completion") callbackOnBatchCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {},
        @PythonName("callback_on_epoch_completion") callbackOnEpochCompletion: (param1: Int, param2: Float) -> () = (param1, param2) {}
    ) -> trainedRegressor: NeuralNetworkRegressor where {
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
| `testData` | [`Table`][safeds.data.tabular.containers.Table] | The data the network should predict. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `prediction` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The given test_data with an added "prediction" column at the end |

??? quote "Source code in `regressor.sdsstub`"

    ```sds linenums="49"
    @Pure
    fun predict(
        @PythonName("test_data") testData: Table
    ) -> prediction: TaggedTable
    ```
