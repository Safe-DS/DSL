---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `ModelImageSize` {#safeds.ml.nn.typing.ModelImageSize data-toc-label='[class] ModelImageSize'}

A container for image size in neural networks.

**Inheritors:**

- [`ConstantImageSize`][safeds.ml.nn.typing.ConstantImageSize]
- [`VariableImageSize`][safeds.ml.nn.typing.VariableImageSize]

??? quote "Stub code in `ModelImageSize.sdsstub`"

    ```sds linenums="9"
    class ModelImageSize {
        /**
         * Get the width of this `ImageSize` in pixels.
         */
        attr width: Int
        /**
         * Get the height of this `ImageSize` in pixels.
         */
        attr height: Int
        /**
         * Get the channel of this `ImageSize` in pixels.
         */
        attr channel: Int
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `channel` {#safeds.ml.nn.typing.ModelImageSize.channel data-toc-label='[attribute] channel'}

Get the channel of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `height` {#safeds.ml.nn.typing.ModelImageSize.height data-toc-label='[attribute] height'}

Get the height of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `width` {#safeds.ml.nn.typing.ModelImageSize.width data-toc-label='[attribute] width'}

Get the width of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]
