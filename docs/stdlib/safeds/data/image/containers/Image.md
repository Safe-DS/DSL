# `#!sds abstract class` Image {#safeds.data.image.containers.Image data-toc-label='Image'}

A container for image data.

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="6"
    class Image {
        /**
         * Get the width of the image in pixels.
         */
        attr width: Int
        /**
         * Get the height of the image in pixels.
         */
        attr height: Int
        /**
         * Get the number of channels of the image.
         */
        attr channel: Int
    
        /**
         * Create an image from a file.
         *
         * @param path The path to the image file.
         * @param device The device where the tensor will be saved on. Defaults to the default device
         *
         * @result result1 The image.
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_file")
        static fun fromFile(
            path: String
        ) -> result1: Image
    
        /**
         * Save the image as a JPEG file.
         *
         * @param path The path to the JPEG file.
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
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_png_file")
        fun toPngFile(
            path: String
        )
    
        /**
         * Return a new `Image` that has been resized to a given size.
         *
         * The original image is not modified.
         *
         * @result result1 The image with the given width and height.
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
         */
        @Pure
        @PythonName("convert_to_grayscale")
        fun convertToGrayscale() -> result1: Image
    
        /**
         * Return a new `Image` that has been cropped to a given bounding rectangle.
         *
         * The original image is not modified.
         *
         * @result result1 The cropped image.
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
         */
        @Pure
        @PythonName("find_edges")
        fun findEdges() -> result1: Image
    }
    ```

## `#!sds attr` width {#safeds.data.image.containers.Image.width data-toc-label='width'}

Get the width of the image in pixels.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` height {#safeds.data.image.containers.Image.height data-toc-label='height'}

Get the height of the image in pixels.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` channel {#safeds.data.image.containers.Image.channel data-toc-label='channel'}

Get the number of channels of the image.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds static fun` fromFile {#safeds.data.image.containers.Image.fromFile data-toc-label='fromFile'}

Create an image from a file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the image file. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="28"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_file")
    static fun fromFile(
        path: String
    ) -> result1: Image
    ```

## `#!sds fun` toJpegFile {#safeds.data.image.containers.Image.toJpegFile data-toc-label='toJpegFile'}

Save the image as a JPEG file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the JPEG file. | - |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="39"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_jpeg_file")
    fun toJpegFile(
        path: String
    )
    ```

## `#!sds fun` toPngFile {#safeds.data.image.containers.Image.toPngFile data-toc-label='toPngFile'}

Save the image as a PNG file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the PNG file. | - |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="50"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_png_file")
    fun toPngFile(
        path: String
    )
    ```

## `#!sds fun` resize {#safeds.data.image.containers.Image.resize data-toc-label='resize'}

Return a new `Image` that has been resized to a given size.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `newWidth` | [`Int`][safeds.lang.Int] | - | - |
| `newHeight` | [`Int`][safeds.lang.Int] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image with the given width and height. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="63"
    @Pure
    fun resize(
        @PythonName("new_width") const newWidth: Int,
        @PythonName("new_height") const newHeight: Int
    ) -> result1: Image where {
        newWidth >= 0,
        newHeight >= 0
    }
    ```

## `#!sds fun` convertToGrayscale {#safeds.data.image.containers.Image.convertToGrayscale data-toc-label='convertToGrayscale'}

Return a new `Image` that is converted to grayscale.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The grayscale image. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="79"
    @Pure
    @PythonName("convert_to_grayscale")
    fun convertToGrayscale() -> result1: Image
    ```

## `#!sds fun` crop {#safeds.data.image.containers.Image.crop data-toc-label='crop'}

Return a new `Image` that has been cropped to a given bounding rectangle.

The original image is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `x` | [`Int`][safeds.lang.Int] | - | - |
| `y` | [`Int`][safeds.lang.Int] | - | - |
| `width` | [`Int`][safeds.lang.Int] | - | - |
| `height` | [`Int`][safeds.lang.Int] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The cropped image. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="90"
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

## `#!sds fun` flipVertically {#safeds.data.image.containers.Image.flipVertically data-toc-label='flipVertically'}

Return a new `Image` that is flipped vertically (horizontal axis, flips up-down and vice versa).

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The flipped image. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="110"
    @Pure
    @PythonName("flip_vertically")
    fun flipVertically() -> result1: Image
    ```

## `#!sds fun` flipHorizontally {#safeds.data.image.containers.Image.flipHorizontally data-toc-label='flipHorizontally'}

Return a new `Image` that is flipped horizontally (vertical axis, flips left-right and vice versa).

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The flipped image. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="121"
    @Pure
    @PythonName("flip_horizontally")
    fun flipHorizontally() -> result1: Image
    ```

## `#!sds fun` adjustBrightness {#safeds.data.image.containers.Image.adjustBrightness data-toc-label='adjustBrightness'}

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

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="138"
    @Pure
    @PythonName("adjust_brightness")
    fun adjustBrightness(
        const factor: Float
    ) -> result1: Image where {
        factor >= 0.0
    }
    ```

## `#!sds fun` addNoise {#safeds.data.image.containers.Image.addNoise data-toc-label='addNoise'}

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

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="155"
    @Pure
    @PythonName("add_noise")
    fun addNoise(
        @PythonName("standard_deviation") const standardDeviation: Float
    ) -> result1: Image where {
        standardDeviation >= 0.0
    }
    ```

## `#!sds fun` adjustContrast {#safeds.data.image.containers.Image.adjustContrast data-toc-label='adjustContrast'}

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

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="175"
    @Pure
    @PythonName("adjust_contrast")
    fun adjustContrast(
        const factor: Float
    ) -> result1: Image where {
        factor >= 0.0
    }
    ```

## `#!sds fun` adjustColorBalance {#safeds.data.image.containers.Image.adjustColorBalance data-toc-label='adjustColorBalance'}

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

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="195"
    @Pure
    @PythonName("adjust_color_balance")
    fun adjustColorBalance(
        const factor: Float
    ) -> result1: Image where {
        factor >= 0.0
    }
    ```

## `#!sds fun` blur {#safeds.data.image.containers.Image.blur data-toc-label='blur'}

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

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="213"
    @Pure
    fun blur(
        const radius: Int
    ) -> result1: Image where {
        radius >= 0
    }
    ```

## `#!sds fun` sharpen {#safeds.data.image.containers.Image.sharpen data-toc-label='sharpen'}

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

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="232"
    @Pure
    fun sharpen(
        const factor: Float
    ) -> result1: Image where {
        factor >= 0.0
    }
    ```

## `#!sds fun` invertColors {#safeds.data.image.containers.Image.invertColors data-toc-label='invertColors'}

Return a new `Image` with colors inverted.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image with inverted colors. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="246"
    @Pure
    @PythonName("invert_colors")
    fun invertColors() -> result1: Image
    ```

## `#!sds fun` rotateRight {#safeds.data.image.containers.Image.rotateRight data-toc-label='rotateRight'}

Return a new `Image` that is rotated 90 degrees clockwise.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image rotated 90 degrees clockwise. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="257"
    @Pure
    @PythonName("rotate_right")
    fun rotateRight() -> result1: Image
    ```

## `#!sds fun` rotateLeft {#safeds.data.image.containers.Image.rotateLeft data-toc-label='rotateLeft'}

Return a new `Image` that is rotated 90 degrees counter-clockwise.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image rotated 90 degrees counter-clockwise. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="268"
    @Pure
    @PythonName("rotate_left")
    fun rotateLeft() -> result1: Image
    ```

## `#!sds fun` findEdges {#safeds.data.image.containers.Image.findEdges data-toc-label='findEdges'}

Return a grayscale version of the image with the edges highlighted.

The original image is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The image with edges found. |

??? quote "Source code in `image.sdsstub`"

    ```sds linenums="279"
    @Pure
    @PythonName("find_edges")
    fun findEdges() -> result1: Image
    ```
