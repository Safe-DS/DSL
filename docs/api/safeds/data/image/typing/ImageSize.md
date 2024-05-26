# <code class="doc-symbol doc-symbol-class"></code> `ImageSize` {#safeds.data.image.typing.ImageSize data-toc-label='[class] ImageSize'}

A container for image size data.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `width` | [`Int`][safeds.lang.Int] | the width of the image | - |
| `height` | [`Int`][safeds.lang.Int] | the height of the image | - |
| `channel` | [`Int`][safeds.lang.Int] | the channel of the image | - |
| `ignoreInvalidChannel` | [`Boolean`][safeds.lang.Boolean] | - | `#!sds false` |

??? quote "Stub code in `ImageSize.sdsstub`"

    ```sds linenums="12"
    class ImageSize(
        width: Int,
        height: Int,
        channel: Int,
        @PythonName("_ignore_invalid_channel") ignoreInvalidChannel: Boolean = false
    ) {
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

        /**
         * Create a `ImageSize` of a given image.
         *
         * @param image the given image for the `ImageSize`
         *
         * @result imageSize the calculated `ImageSize`
         */
        @Pure
        @PythonName("from_image")
        static fun fromImage(
            image: Image
        ) -> imageSize: ImageSize
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `channel` {#safeds.data.image.typing.ImageSize.channel data-toc-label='[attribute] channel'}

Get the channel of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `height` {#safeds.data.image.typing.ImageSize.height data-toc-label='[attribute] height'}

Get the height of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `width` {#safeds.data.image.typing.ImageSize.width data-toc-label='[attribute] width'}

Get the width of this `ImageSize` in pixels.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-static-function"></code> `fromImage` {#safeds.data.image.typing.ImageSize.fromImage data-toc-label='[static-function] fromImage'}

Create a `ImageSize` of a given image.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `image` | [`Image`][safeds.data.image.containers.Image] | the given image for the `ImageSize` | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageSize` | [`ImageSize`][safeds.data.image.typing.ImageSize] | the calculated `ImageSize` |

??? quote "Stub code in `ImageSize.sdsstub`"

    ```sds linenums="38"
    @Pure
    @PythonName("from_image")
    static fun fromImage(
        image: Image
    ) -> imageSize: ImageSize
    ```
