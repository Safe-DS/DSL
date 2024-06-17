---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `VariableImageSize` {#safeds.ml.nn.typing.VariableImageSize data-toc-label='[class] VariableImageSize'}

A container for variable image size in neural networks.

With a `VariableImageSize`, all image sizes that are a multiple of `width` and `height` are valid.

**Parent type:** [`ModelImageSize`][safeds.ml.nn.typing.ModelImageSize]

??? quote "Stub code in `VariableImageSize.sdsstub`"

    ```sds linenums="9"
    class VariableImageSize sub ModelImageSize
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `channel` {#safeds.ml.nn.typing.VariableImageSize.channel data-toc-label='[attribute] channel'}

Get the channel of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `height` {#safeds.ml.nn.typing.VariableImageSize.height data-toc-label='[attribute] height'}

Get the height of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `width` {#safeds.ml.nn.typing.VariableImageSize.width data-toc-label='[attribute] width'}

Get the width of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]
