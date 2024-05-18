# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `Image` {#safeds.data.image.containers.Image data-toc-label='[class] Image'}

A container for image data.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="14"
    class Image {
        /**
         * Get the width of the image in pixels.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr width: Int
        /**
         * Get the height of the image in pixels.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr height: Int
        /**
         * Get the number of channels of the image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr channel: Int
        /**
         * Get the `ImageSize` of the image.
         */
        attr size: ImageSize

        /**
         * Create an image from a file.
         *
         * @param path The path to the image file.
         *
         * @result image The image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_file")
        static fun fromFile(
            path: String
        ) -> image: Image

        /**
         * Save the image as a JPEG file.
         *
         * @param path The path to the JPEG file.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_jpeg_file")
        fun toJpegFile(
            path: String
        )

        /**
         * Save the image as a PNG file.
         *
         * @param path The path to the PNG file.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_png_file")
        fun toPngFile(
            path: String
        )

        /**
         * Return a new `Image` that has the given number of channels.
         *
         * The original image is not modified.
         *
         * @param channel The new number of channels. 1 will result in a grayscale image.
         *
         * @result result1 The image with the given number of channels.
         */
        @Pure
        @PythonName("change_channel")
        fun changeChannel(
            channel: Int
        ) -> result1: Image

        /**
         * Return a new `Image` that has been resized to a given size.
         *
         * The original image is not modified.
         *
         * @param newWidth The new width of the image.
         * @param newHeight The new height of the image.
         *
         * @result result1 The image with the given width and height.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun resize(
            @PythonName("new_width") const newWidth: Int,
            @PythonName("new_height") const newHeight: Int
        ) -> result1: Image where {
            newWidth >= 0,
            newHeight >= 0
        }

        /**
         * Return a new `Image` that is converted to grayscale.
         *
         * The original image is not modified.
         *
         * @result result1 The grayscale image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("convert_to_grayscale")
        fun convertToGrayscale() -> result1: Image

        /**
         * Return a new `Image` that has been cropped to a given bounding rectangle.
         *
         * The original image is not modified.
         *
         * @param x The x coordinate of the top-left corner of the bounding rectangle.
         * @param y The y coordinate of the top-left corner of the bounding rectangle.
         * @param width The width of the bounding rectangle.
         * @param height The height of the bounding rectangle.
         *
         * @result result1 The cropped image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun crop(
            const x: Int,
            const y: Int,
            const width: Int,
            const height: Int
        ) -> result1: Image where {
            x >= 0,
            y >= 0,
            width >= 0,
            height >= 0
        }

        /**
         * Return a new `Image` that is flipped vertically (horizontal axis, flips up-down and vice versa).
         *
         * The original image is not modified.
         *
         * @result result1 The flipped image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("flip_vertically")
        fun flipVertically() -> result1: Image

        /**
         * Return a new `Image` that is flipped horizontally (vertical axis, flips left-right and vice versa).
         *
         * The original image is not modified.
         *
         * @result result1 The flipped image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("flip_horizontally")
        fun flipHorizontally() -> result1: Image

        /**
         * Return a new `Image` with an adjusted brightness.
         *
         * The original image is not modified.
         *
         * @param factor The brightness factor.
         * 1.0 will not change the brightness.
         * Below 1.0 will result in a darker image.
         * Above 1.0 will resolut in a brighter image.
         * Has to be bigger than or equal to 0 (black).
         *
         * @result result1 The Image with adjusted brightness.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("adjust_brightness")
        fun adjustBrightness(
            const factor: Float
        ) -> result1: Image where {
            factor >= 0.0
        }

        /**
         * Return a new `Image` with noise added to the image.
         *
         * The original image is not modified.
         *
         * @param standardDeviation The standard deviation of the normal distribution. Has to be bigger than or equal to 0.
         *
         * @result result1 The image with added noise.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("add_noise")
        fun addNoise(
            @PythonName("standard_deviation") const standardDeviation: Float
        ) -> result1: Image where {
            standardDeviation >= 0.0
        }

        /**
         * Return a new `Image` with adjusted contrast.
         *
         * The original image is not modified.
         *
         * @param factor If factor > 1, increase contrast of image.
         * If factor = 1, no changes will be made.
         * If factor < 1, make image greyer.
         * Has to be bigger than or equal to 0 (gray).
         *
         * @result result1 New image with adjusted contrast.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("adjust_contrast")
        fun adjustContrast(
            const factor: Float
        ) -> result1: Image where {
            factor >= 0.0
        }

        /**
         * Return a new `Image` with adjusted color balance.
         *
         * The original image is not modified.
         *
         * @param factor Has to be bigger than or equal to 0.
         * If 0 <= factor < 1, make image greyer.
         * If factor = 1, no changes will be made.
         * If factor > 1, increase color balance of image.
         *
         * @result result1 The new, adjusted image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("adjust_color_balance")
        fun adjustColorBalance(
            const factor: Float
        ) -> result1: Image where {
            factor >= 0.0
        }

        /**
         * Return a blurred version of the image.
         *
         * The original image is not modified.
         *
         * @param radius Radius is directly proportional to the blur value. The radius is equal to the amount of pixels united in
         * each direction. A radius of 1 will result in a united box of 9 pixels.
         *
         * @result result1 The blurred image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun blur(
            const radius: Int
        ) -> result1: Image where {
            radius >= 0
        }

        /**
         * Return a sharpened version of the image.
         *
         * The original image is not modified.
         *
         * @param factor If factor > 1, increase the sharpness of the image.
         * If factor = 1, no changes will be made.
         * If factor < 1, blur the image.
         * Has to be bigger than or equal to 0 (blurred).
         *
         * @result result1 The image sharpened by the given factor.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun sharpen(
            const factor: Float
        ) -> result1: Image where {
            factor >= 0.0
        }

        /**
         * Return a new `Image` with colors inverted.
         *
         * The original image is not modified.
         *
         * @result result1 The image with inverted colors.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("invert_colors")
        fun invertColors() -> result1: Image

        /**
         * Return a new `Image` that is rotated 90 degrees clockwise.
         *
         * The original image is not modified.
         *
         * @result result1 The image rotated 90 degrees clockwise.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("rotate_right")
        fun rotateRight() -> result1: Image

        /**
         * Return a new `Image` that is rotated 90 degrees counter-clockwise.
         *
         * The original image is not modified.
         *
         * @result result1 The image rotated 90 degrees counter-clockwise.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("rotate_left")
        fun rotateLeft() -> result1: Image

        /**
         * Return a grayscale version of the image with the edges highlighted.
         *
         * The original image is not modified.
         *
         * @result result1 The image with edges found.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("find_edges")
        fun findEdges() -> result1: Image
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `channel` {#safeds.data.image.containers.Image.channel data-toc-label='[attribute] channel'}

Get the number of channels of the image.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## <code class="doc-symbol doc-symbol-attribute"></code> `height` {#safeds.data.image.containers.Image.height data-toc-label='[attribute] height'}

Get the height of the image in pixels.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## <code class="doc-symbol doc-symbol-attribute"></code> `size` {#safeds.data.image.containers.Image.size data-toc-label='[attribute] size'}

Get the `ImageSize` of the image.

**Type:** [`ImageSize`][safeds.data.image.typing.ImageSize]

## <code class="doc-symbol doc-symbol-attribute"></code> `width` {#safeds.data.image.containers.Image.width data-toc-label='[attribute] width'}

Get the width of the image in pixels.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## <code class="doc-symbol doc-symbol-function"></code> `addNoise` {#safeds.data.image.containers.Image.addNoise data-toc-label='[function] addNoise'}

Return a new `Image` with noise added to the image.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `standardDeviation` | [`Float`][safeds.lang.Float] | The standard deviation of the normal distribution. Has to be bigger than or equal to 0. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image with added noise. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="254"
    @Pure
    @PythonName("add_noise")
    fun addNoise(
        @PythonName("standard_deviation") const standardDeviation: Float
    ) -> result1: Image where {
        standardDeviation >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `adjustBrightness` {#safeds.data.image.containers.Image.adjustBrightness data-toc-label='[function] adjustBrightness'}

Return a new `Image` with an adjusted brightness.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `factor` | [`Float`][safeds.lang.Float] | The brightness factor. 1.0 will not change the brightness. Below 1.0 will result in a darker image. Above 1.0 will resolut in a brighter image. Has to be bigger than or equal to 0 (black). | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The Image with adjusted brightness. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="232"
    @Pure
    @PythonName("adjust_brightness")
    fun adjustBrightness(
        const factor: Float
    ) -> result1: Image where {
        factor >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `adjustColorBalance` {#safeds.data.image.containers.Image.adjustColorBalance data-toc-label='[function] adjustColorBalance'}

Return a new `Image` with adjusted color balance.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `factor` | [`Float`][safeds.lang.Float] | Has to be bigger than or equal to 0. If 0 <= factor < 1, make image greyer. If factor = 1, no changes will be made. If factor > 1, increase color balance of image. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The new, adjusted image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="304"
    @Pure
    @PythonName("adjust_color_balance")
    fun adjustColorBalance(
        const factor: Float
    ) -> result1: Image where {
        factor >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `adjustContrast` {#safeds.data.image.containers.Image.adjustContrast data-toc-label='[function] adjustContrast'}

Return a new `Image` with adjusted contrast.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `factor` | [`Float`][safeds.lang.Float] | If factor > 1, increase contrast of image. If factor = 1, no changes will be made. If factor < 1, make image greyer. Has to be bigger than or equal to 0 (gray). | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | New image with adjusted contrast. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="279"
    @Pure
    @PythonName("adjust_contrast")
    fun adjustContrast(
        const factor: Float
    ) -> result1: Image where {
        factor >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `blur` {#safeds.data.image.containers.Image.blur data-toc-label='[function] blur'}

Return a blurred version of the image.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `radius` | [`Int`][safeds.lang.Int] | Radius is directly proportional to the blur value. The radius is equal to the amount of pixels united in each direction. A radius of 1 will result in a united box of 9 pixels. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The blurred image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="327"
    @Pure
    fun blur(
        const radius: Int
    ) -> result1: Image where {
        radius >= 0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `changeChannel` {#safeds.data.image.containers.Image.changeChannel data-toc-label='[function] changeChannel'}

Return a new `Image` that has the given number of channels.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `channel` | [`Int`][safeds.lang.Int] | The new number of channels. 1 will result in a grayscale image. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image with the given number of channels. |

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="106"
    @Pure
    @PythonName("change_channel")
    fun changeChannel(
        channel: Int
    ) -> result1: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `convertToGrayscale` {#safeds.data.image.containers.Image.convertToGrayscale data-toc-label='[function] convertToGrayscale'}

Return a new `Image` that is converted to grayscale.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The grayscale image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="148"
    @Pure
    @PythonName("convert_to_grayscale")
    fun convertToGrayscale() -> result1: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `crop` {#safeds.data.image.containers.Image.crop data-toc-label='[function] crop'}

Return a new `Image` that has been cropped to a given bounding rectangle.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `x` | [`Int`][safeds.lang.Int] | The x coordinate of the top-left corner of the bounding rectangle. | - |
| `y` | [`Int`][safeds.lang.Int] | The y coordinate of the top-left corner of the bounding rectangle. | - |
| `width` | [`Int`][safeds.lang.Int] | The width of the bounding rectangle. | - |
| `height` | [`Int`][safeds.lang.Int] | The height of the bounding rectangle. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The cropped image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="169"
    @Pure
    fun crop(
        const x: Int,
        const y: Int,
        const width: Int,
        const height: Int
    ) -> result1: Image where {
        x >= 0,
        y >= 0,
        width >= 0,
        height >= 0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `findEdges` {#safeds.data.image.containers.Image.findEdges data-toc-label='[function] findEdges'}

Return a grayscale version of the image with the edges highlighted.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image with edges found. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="418"
    @Pure
    @PythonName("find_edges")
    fun findEdges() -> result1: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `flipHorizontally` {#safeds.data.image.containers.Image.flipHorizontally data-toc-label='[function] flipHorizontally'}

Return a new `Image` that is flipped horizontally (vertical axis, flips left-right and vice versa).

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The flipped image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="210"
    @Pure
    @PythonName("flip_horizontally")
    fun flipHorizontally() -> result1: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `flipVertically` {#safeds.data.image.containers.Image.flipVertically data-toc-label='[function] flipVertically'}

Return a new `Image` that is flipped vertically (horizontal axis, flips up-down and vice versa).

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The flipped image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="194"
    @Pure
    @PythonName("flip_vertically")
    fun flipVertically() -> result1: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `invertColors` {#safeds.data.image.containers.Image.invertColors data-toc-label='[function] invertColors'}

Return a new `Image` with colors inverted.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image with inverted colors. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="370"
    @Pure
    @PythonName("invert_colors")
    fun invertColors() -> result1: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `resize` {#safeds.data.image.containers.Image.resize data-toc-label='[function] resize'}

Return a new `Image` that has been resized to a given size.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `newWidth` | [`Int`][safeds.lang.Int] | The new width of the image. | - |
| `newHeight` | [`Int`][safeds.lang.Int] | The new height of the image. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image with the given width and height. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="127"
    @Pure
    fun resize(
        @PythonName("new_width") const newWidth: Int,
        @PythonName("new_height") const newHeight: Int
    ) -> result1: Image where {
        newWidth >= 0,
        newHeight >= 0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `rotateLeft` {#safeds.data.image.containers.Image.rotateLeft data-toc-label='[function] rotateLeft'}

Return a new `Image` that is rotated 90 degrees counter-clockwise.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image rotated 90 degrees counter-clockwise. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="402"
    @Pure
    @PythonName("rotate_left")
    fun rotateLeft() -> result1: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `rotateRight` {#safeds.data.image.containers.Image.rotateRight data-toc-label='[function] rotateRight'}

Return a new `Image` that is rotated 90 degrees clockwise.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image rotated 90 degrees clockwise. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="386"
    @Pure
    @PythonName("rotate_right")
    fun rotateRight() -> result1: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `sharpen` {#safeds.data.image.containers.Image.sharpen data-toc-label='[function] sharpen'}

Return a sharpened version of the image.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `factor` | [`Float`][safeds.lang.Float] | If factor > 1, increase the sharpness of the image. If factor = 1, no changes will be made. If factor < 1, blur the image. Has to be bigger than or equal to 0 (blurred). | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image sharpened by the given factor. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="351"
    @Pure
    fun sharpen(
        const factor: Float
    ) -> result1: Image where {
        factor >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `toJpegFile` {#safeds.data.image.containers.Image.toJpegFile data-toc-label='[function] toJpegFile'}

Save the image as a JPEG file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the JPEG file. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="75"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_jpeg_file")
    fun toJpegFile(
        path: String
    )
    ```

## <code class="doc-symbol doc-symbol-function"></code> `toPngFile` {#safeds.data.image.containers.Image.toPngFile data-toc-label='[function] toPngFile'}

Save the image as a PNG file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the PNG file. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="91"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_png_file")
    fun toPngFile(
        path: String
    )
    ```

## <code class="doc-symbol doc-symbol-static-function"></code> `fromFile` {#safeds.data.image.containers.Image.fromFile data-toc-label='[static-function] fromFile'}

Create an image from a file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the image file. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `image` | [`Image`][safeds.data.image.containers.Image] | The image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `Image.sdsstub`"

    ```sds linenums="59"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_file")
    static fun fromFile(
        path: String
    ) -> image: Image
    ```
