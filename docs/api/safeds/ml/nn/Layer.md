---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` Layer {#safeds.ml.nn.Layer data-toc-label='Layer'}

**Inheritors:**

- [`ForwardLayer`][safeds.ml.nn.ForwardLayer]

??? quote "Stub code in `layer.sdsstub`"

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
