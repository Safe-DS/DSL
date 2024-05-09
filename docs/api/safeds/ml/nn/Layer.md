---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` Layer {#safeds.ml.nn.Layer data-toc-label='Layer'}

**Inheritors:**

- [`AvgPooling2DLayer`][safeds.ml.nn.AvgPooling2DLayer]
- [`Convolutional2DLayer`][safeds.ml.nn.Convolutional2DLayer]
- [`FlattenLayer`][safeds.ml.nn.FlattenLayer]
- [`ForwardLayer`][safeds.ml.nn.ForwardLayer]
- [`LSTMLayer`][safeds.ml.nn.LSTMLayer]
- [`MaxPooling2DLayer`][safeds.ml.nn.MaxPooling2DLayer]

??? quote "Stub code in `Layer.sdsstub`"

    ```sds linenums="4"
    class Layer {
        /**
         * The input_size of this layer.
         */
        @PythonName("input_size") attr inputSize: Int
        /**
         * The output_size of this layer.
         */
        @PythonName("output_size") attr outputSize: Int
    }
    ```

## `#!sds attr` inputSize {#safeds.ml.nn.Layer.inputSize data-toc-label='inputSize'}

The input_size of this layer.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` outputSize {#safeds.ml.nn.Layer.outputSize data-toc-label='outputSize'}

The output_size of this layer.

**Type:** [`Int`][safeds.lang.Int]
