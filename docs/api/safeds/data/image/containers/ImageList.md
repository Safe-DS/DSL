# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `ImageList` {#safeds.data.image.containers.ImageList data-toc-label='[class] ImageList'}

An ImageList is a list of different images. It can hold different sizes of Images. The channel of all images is the same.

To create an `ImageList` call one of the following static methods:

| Method                       | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| [ImageList.fromImages][safeds.data.image.containers.ImageList.fromImages] | Create an ImageList from a list of Images.               |
| [ImageList.fromFiles][safeds.data.image.containers.ImageList.fromFiles]  | Create an ImageList from a directory or a list of files. |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="17"
    class ImageList {
        /**
         * Return the number of images in this image list.
         */
        @PythonName("number_of_images") attr imageCount: Int
        /**
         * Return a list of all widths in this image list.
         */
        attr widths: List<Int>
        /**
         * Return a list of all heights in this image list.
         */
        attr heights: List<Int>
        /**
         * Return the channel of all images.
         */
        attr channel: Int
        /**
         * Return the sizes of all images.
         */
        attr sizes: List<ImageSize>
        /**
         * Return the number of different sizes of images in this image list.
         */
        @PythonName("number_of_sizes") attr sizeCount: Int

        /**
         * Create an ImageList from a list of images.
         *
         * @param images the list of images
         *
         * @result imageList the image list
         */
        @Pure
        @PythonName("from_images")
        static fun fromImages(
            images: List<Image>
        ) -> imageList: ImageList

        /**
         * Create an ImageList from a directory or a list of files.
         *
         * If you provide a path to a directory the images will be sorted alphabetically while inner directories will be sorted after image files.
         *
         * @param path the path to the directory or a list of files
         *
         * @result imageList the image list
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_files")
        static fun fromFiles(
            path: union<List<String>, String>
        ) -> imageList: ImageList

        /**
         * Return the image at the given index.
         *
         * @param index the index for the image to return
         *
         * @result image the image at the given index
         */
        @Pure
        @PythonName("get_image")
        fun getImage(
            index: Int
        ) -> image: Image

        /**
         * Return a list of indexes of the given image.
         *
         * If the image has multiple occurrences, all indices will be returned
         *
         * @param image the image to search for occurrences
         *
         * @result indices all occurrences of the image
         */
        @Pure
        fun index(
            image: Image
        ) -> indices: List<Int>

        /**
         * Return whether the given image is in this image list.
         *
         * @param image the image to check
         *
         * @result hasImage Weather the given image is in this image list
         */
        @Pure
        @PythonName("has_image")
        fun hasImage(
            image: Image
        ) -> hasImage: Boolean

        /**
         * Save all images as jpeg files.
         *
         * @param path Either the path to a directory or a list of directories which has directories for either all different sizes or all different images. Any non-existant path will be created
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_jpeg_files")
        fun toJpegFiles(
            path: union<List<String>, String>
        )

        /**
         * Save all images as png files.
         *
         * @param path Either the path to a directory or a list of directories which has directories for either all different sizes or all different images. Any non-existant path will be created
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_png_files")
        fun toPngFiles(
            path: union<List<String>, String>
        )

        /**
         * Return a list of all images in this image list.
         *
         * @param indices a list of all indices to include in the output. If null, all indices will be included
         *
         * @result images the list of all images
         */
        @Pure
        @PythonName("to_images")
        fun toImages(
            indices: List<Int>? = null
        ) -> images: List<Image>

        /**
         * Return a new `ImageList` that has the given number of channels.
         *
         * The original image list is not modified.
         *
         * @param channel The new number of channels. 1 will result in grayscale images
         *
         * @result imageList the image list with the given number of channels
         */
        @Pure
        @PythonName("change_channel")
        fun changeChannel(
            channel: Int
        ) -> imageList: ImageList

        /**
         * Return a new `ImageList` with the given image added to the image list.
         *
         * The original image list is not modified.
         *
         * @param image The image to be added to the image list
         *
         * @result imageList the image list with the new image added
         */
        @Pure
        @PythonName("add_image")
        fun addImage(
            image: Image
        ) -> imageList: ImageList

        /**
         * Return a new `ImageList` with the given images added to the image list.
         *
         * The original image list is not modified.
         *
         * @param images The images to be added to the image list
         *
         * @result imageList the image list with the new images added
         */
        @Pure
        @PythonName("add_images")
        fun addImages(
            images: union<ImageList, List<Image>>
        ) -> imageList: ImageList

        /**
         * Return a new `ImageList` with the given image removed from the image list.
         *
         * If the image has multiple occurrences, all occurrences will be removed.
         *
         * The original image list is not modified.
         *
         * @param image The image to be removed from the image list
         *
         * @result imageList the image list with the given image removed
         */
        @Pure
        @PythonName("remove_image")
        fun removeImage(
            image: Image
        ) -> imageList: ImageList

        /**
         * Return a new `ImageList` with the given images removed from the image list.
         *
         * If one image has multiple occurrences, all occurrences will be removed.
         *
         * The original image list is not modified.
         *
         * @param images The images to be removed from the image list
         *
         * @result imageList the image list with the given images removed
         */
        @Pure
        @PythonName("remove_images")
        fun removeImages(
            images: List<Image>
        ) -> imageList: ImageList

        /**
         * Return a new `ImageList` with the given indices removed from the image list.
         *
         * The original image list is not modified.
         *
         * @param index The index of the image to be removed from the image list
         *
         * @result imageList the image list with the without the removed image
         */
        @Pure
        @PythonName("remove_image_by_index")
        fun removeImageByIndex(
            index: union<Int, List<Int>>
        ) -> imageList: ImageList

        /**
         * Return a new `ImageList` with the all images of the given size removed.
         *
         * The original image list is not modified.
         *
         * @param width The width of the images to be removed from the image list
         * @param height The height of the images to be removed from the image list
         *
         * @result imageList the image list with the given images removed
         */
        @Pure
        @PythonName("remove_images_with_size")
        fun removeImagesWithSize(
            width: Int,
            height: Int
        ) -> imageList: ImageList

        /**
         * Return a new `ImageList` with all duplicate images removed.
         *
         * One occurrence of each image will stay in the image list.
         *
         * The original image list is not modified.
         *
         * @result imageList the image list with only unique images
         */
        @Pure
        @PythonName("remove_duplicate_images")
        fun removeDuplicateImages() -> imageList: ImageList

        /**
         * Return a new `ImageList` with all images shuffled.
         *
         * The original image list is not modified.
         *
         * @result imageList the image list with shuffled images
         */
        @Pure
        @PythonName("shuffle_images")
        fun shuffleImages() -> imageList: ImageList

        /**
         * Return a new `ImageList` with all images resized to a given size.
         *
         * The original image list is not modified.
         *
         * @param newWidth the new width of the images
         * @param newHeight the new height of the images
         *
         * @result imageList The image list with all images resized to the given width and height.
         */
        @Pure
        fun resize(
            @PythonName("new_width") const newWidth: Int,
            @PythonName("new_height") const newHeight: Int
        ) -> imageList: ImageList where {
            newWidth >= 0,
            newHeight >= 0
        }

        /**
         * Return a new `ImageList` with all images converted to grayscale.
         *
         * The original image list is not modified.
         *
         * @result imageList The image list with all images converted to grayscale.
         */
        @Pure
        @PythonName("convert_to_grayscale")
        fun convertToGrayscale() -> imageList: ImageList

        /**
         * Return a new `ImageList` with all images cropped to a given bounding rectangle.
         *
         * The original image list is not modified.
         *
         * @param x the x coordinate of the top-left corner of the bounding rectangle
         * @param y the y coordinate of the top-left corner of the bounding rectangle
         * @param width the width of the bounding rectangle
         * @param height the height of the bounding rectangle
         *
         * @result imageList The image list with all images cropped
         */
        @Pure
        fun crop(
            const x: Int,
            const y: Int,
            const width: Int,
            const height: Int
        ) -> imageList: ImageList where {
            x >= 0,
            y >= 0,
            width >= 0,
            height >= 0
        }

        /**
         * Return a new `ImageList` with all images flipped vertically (horizontal axis, flips up-down and vice versa).
         *
         * The original image list is not modified.
         *
         * @result imageList The image list with all images flipped vertically
         */
        @Pure
        @PythonName("flip_vertically")
        fun flipVertically() -> imageList: ImageList

        /**
         * Return a new `ImageList` with all images flipped horizontally (vertical axis, flips left-right and vice versa).
         *
         * The original image list is not modified.
         *
         * @result imageList The image list with all images flipped horizontally
         */
        @Pure
        @PythonName("flip_horizontally")
        fun flipHorizontally() -> imageList: ImageList

        /**
         * Return a new `ImageList` where all images have the adjusted brightness.
         *
         * The original image list is not modified.
         *
         * @param factor The brightness factor.
         * 1.0 will not change the brightness.
         * Below 1.0 will result in a darker images.
         * Above 1.0 will resolut in a brighter images.
         * Has to be bigger than or equal to 0 (black).
         *
         * @result imageList The image list with adjusted brightness
         */
        @Pure
        @PythonName("adjust_brightness")
        fun adjustBrightness(
            const factor: Float
        ) -> imageList: ImageList where {
            factor >= 0.0
        }

        /**
         * Return a new `ImageList` with noise added to all images.
         *
         * The original image list is not modified.
         *
         * @param standardDeviation The standard deviation of the normal distribution. Has to be bigger than or equal to 0.
         *
         * @result imageList The image list with added noise
         */
        @Pure
        @PythonName("add_noise")
        fun addNoise(
            @PythonName("standard_deviation") const standardDeviation: Float
        ) -> imageList: ImageList where {
            standardDeviation >= 0.0
        }

        /**
         * Return a new `ImageList` where all images have the adjusted contrast.
         *
         * The original image list is not modified.
         *
         * @param factor If factor > 1, increase contrast of images.
         * If factor = 1, no changes will be made.
         * If factor < 1, make images greyer.
         * Has to be bigger than or equal to 0 (gray).
         *
         * @result imageList The image list with adjusted contrast
         */
        @Pure
        @PythonName("adjust_contrast")
        fun adjustContrast(
            const factor: Float
        ) -> imageList: ImageList where {
            factor >= 0.0
        }

        /**
         * Return a new `ImageList` where all images have the adjusted color balance.
         *
         * The original image list is not modified.
         *
         * @param factor Has to be bigger than or equal to 0.
         * If 0 <= factor < 1, make images greyer.
         * If factor = 1, no changes will be made.
         * If factor > 1, increase color balance of images.
         *
         * @result imageList The image list with adjusted color balance
         */
        @Pure
        @PythonName("adjust_color_balance")
        fun adjustColorBalance(
            const factor: Float
        ) -> imageList: ImageList where {
            factor >= 0.0
        }

        /**
         * Return a new `ImageList` where all images have been blurred.
         *
         * The original image list is not modified.
         *
         * @param radius  Radius is directly proportional to the blur value. The radius is equal to the amount of pixels united in
         *  each direction. A radius of 1 will result in a united box of 9 pixels.
         *
         * @result imageList The image list with blurred images
         */
        @Pure
        fun blur(
            const radius: Int
        ) -> imageList: ImageList where {
            radius >= 0
        }

        /**
         * Return a new `ImageList` where all images have been sharpened.
         *
         * The original image list is not modified.
         *
         * @param factor If factor > 1, increase the sharpness of the images.
         * If factor = 1, no changes will be made.
         * If factor < 1, blur the images.
         * Has to be bigger than or equal to 0 (blurred).
         *
         * @result imageList The image list with sharpened images
         */
        @Pure
        fun sharpen(
            const factor: Float
        ) -> imageList: ImageList where {
            factor >= 0.0
        }

        /**
         * Return a new `ImageList` where all images have their colors inverted.
         *
         * The original image list is not modified.
         *
         * @result imageList The image list with inverted colors
         */
        @Pure
        @PythonName("invert_colors")
        fun invertColors() -> imageList: ImageList

        /**
         * Return a new `ImageList` where all images have been rotated 90 degrees clockwise.
         *
         * The original image list is not modified.
         *
         * @result imageList The image list with all images rotated
         */
        @Pure
        @PythonName("rotate_right")
        fun rotateRight() -> imageList: ImageList

        /**
         * Return a new `ImageList` where all images have been rotated 90 degrees counter-clockwise.
         *
         * The original image list is not modified.
         *
         * @result imageList The image list with all images rotated
         */
        @Pure
        @PythonName("rotate_left")
        fun rotateLeft() -> imageList: ImageList

        /**
         * Return a new `ImageList` with grayscale versions of the images with the edges highlighted.
         *
         * The original image list is not modified.
         *
         * @result imageList The image list with highlighted edges
         */
        @Pure
        @PythonName("find_edges")
        fun findEdges() -> imageList: ImageList
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `channel` {#safeds.data.image.containers.ImageList.channel data-toc-label='[attribute] channel'}

Return the channel of all images.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `heights` {#safeds.data.image.containers.ImageList.heights data-toc-label='[attribute] heights'}

Return a list of all heights in this image list.

**Type:** [`List<Int>`][safeds.lang.List]

## <code class="doc-symbol doc-symbol-attribute"></code> `imageCount` {#safeds.data.image.containers.ImageList.imageCount data-toc-label='[attribute] imageCount'}

Return the number of images in this image list.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `sizeCount` {#safeds.data.image.containers.ImageList.sizeCount data-toc-label='[attribute] sizeCount'}

Return the number of different sizes of images in this image list.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `sizes` {#safeds.data.image.containers.ImageList.sizes data-toc-label='[attribute] sizes'}

Return the sizes of all images.

**Type:** [`List<ImageSize>`][safeds.lang.List]

## <code class="doc-symbol doc-symbol-attribute"></code> `widths` {#safeds.data.image.containers.ImageList.widths data-toc-label='[attribute] widths'}

Return a list of all widths in this image list.

**Type:** [`List<Int>`][safeds.lang.List]

## <code class="doc-symbol doc-symbol-function"></code> `addImage` {#safeds.data.image.containers.ImageList.addImage data-toc-label='[function] addImage'}

Return a new `ImageList` with the given image added to the image list.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `image` | [`Image`][safeds.data.image.containers.Image] | The image to be added to the image list | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with the new image added |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="170"
    @Pure
    @PythonName("add_image")
    fun addImage(
        image: Image
    ) -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `addImages` {#safeds.data.image.containers.ImageList.addImages data-toc-label='[function] addImages'}

Return a new `ImageList` with the given images added to the image list.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `images` | `#!sds union<ImageList, List<Image>>` | The images to be added to the image list | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with the new images added |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="185"
    @Pure
    @PythonName("add_images")
    fun addImages(
        images: union<ImageList, List<Image>>
    ) -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `addNoise` {#safeds.data.image.containers.ImageList.addNoise data-toc-label='[function] addNoise'}

Return a new `ImageList` with noise added to all images.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `standardDeviation` | [`Float`][safeds.lang.Float] | The standard deviation of the normal distribution. Has to be bigger than or equal to 0. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with added noise |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="388"
    @Pure
    @PythonName("add_noise")
    fun addNoise(
        @PythonName("standard_deviation") const standardDeviation: Float
    ) -> imageList: ImageList where {
        standardDeviation >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `adjustBrightness` {#safeds.data.image.containers.ImageList.adjustBrightness data-toc-label='[function] adjustBrightness'}

Return a new `ImageList` where all images have the adjusted brightness.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `factor` | [`Float`][safeds.lang.Float] | The brightness factor. 1.0 will not change the brightness. Below 1.0 will result in a darker images. Above 1.0 will resolut in a brighter images. Has to be bigger than or equal to 0 (black). | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with adjusted brightness |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="371"
    @Pure
    @PythonName("adjust_brightness")
    fun adjustBrightness(
        const factor: Float
    ) -> imageList: ImageList where {
        factor >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `adjustColorBalance` {#safeds.data.image.containers.ImageList.adjustColorBalance data-toc-label='[function] adjustColorBalance'}

Return a new `ImageList` where all images have the adjusted color balance.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `factor` | [`Float`][safeds.lang.Float] | Has to be bigger than or equal to 0. If 0 <= factor < 1, make images greyer. If factor = 1, no changes will be made. If factor > 1, increase color balance of images. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with adjusted color balance |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="428"
    @Pure
    @PythonName("adjust_color_balance")
    fun adjustColorBalance(
        const factor: Float
    ) -> imageList: ImageList where {
        factor >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `adjustContrast` {#safeds.data.image.containers.ImageList.adjustContrast data-toc-label='[function] adjustContrast'}

Return a new `ImageList` where all images have the adjusted contrast.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `factor` | [`Float`][safeds.lang.Float] | If factor > 1, increase contrast of images. If factor = 1, no changes will be made. If factor < 1, make images greyer. Has to be bigger than or equal to 0 (gray). | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with adjusted contrast |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="408"
    @Pure
    @PythonName("adjust_contrast")
    fun adjustContrast(
        const factor: Float
    ) -> imageList: ImageList where {
        factor >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `blur` {#safeds.data.image.containers.ImageList.blur data-toc-label='[function] blur'}

Return a new `ImageList` where all images have been blurred.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `radius` | [`Int`][safeds.lang.Int] | Radius is directly proportional to the blur value. The radius is equal to the amount of pixels united in each direction. A radius of 1 will result in a united box of 9 pixels. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with blurred images |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="446"
    @Pure
    fun blur(
        const radius: Int
    ) -> imageList: ImageList where {
        radius >= 0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `changeChannel` {#safeds.data.image.containers.ImageList.changeChannel data-toc-label='[function] changeChannel'}

Return a new `ImageList` that has the given number of channels.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `channel` | [`Int`][safeds.lang.Int] | The new number of channels. 1 will result in grayscale images | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with the given number of channels |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="155"
    @Pure
    @PythonName("change_channel")
    fun changeChannel(
        channel: Int
    ) -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `convertToGrayscale` {#safeds.data.image.containers.ImageList.convertToGrayscale data-toc-label='[function] convertToGrayscale'}

Return a new `ImageList` with all images converted to grayscale.

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with all images converted to grayscale. |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="307"
    @Pure
    @PythonName("convert_to_grayscale")
    fun convertToGrayscale() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `crop` {#safeds.data.image.containers.ImageList.crop data-toc-label='[function] crop'}

Return a new `ImageList` with all images cropped to a given bounding rectangle.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `x` | [`Int`][safeds.lang.Int] | the x coordinate of the top-left corner of the bounding rectangle | - |
| `y` | [`Int`][safeds.lang.Int] | the y coordinate of the top-left corner of the bounding rectangle | - |
| `width` | [`Int`][safeds.lang.Int] | the width of the bounding rectangle | - |
| `height` | [`Int`][safeds.lang.Int] | the height of the bounding rectangle | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with all images cropped |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="323"
    @Pure
    fun crop(
        const x: Int,
        const y: Int,
        const width: Int,
        const height: Int
    ) -> imageList: ImageList where {
        x >= 0,
        y >= 0,
        width >= 0,
        height >= 0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `findEdges` {#safeds.data.image.containers.ImageList.findEdges data-toc-label='[function] findEdges'}

Return a new `ImageList` with grayscale versions of the images with the edges highlighted.

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with highlighted edges |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="512"
    @Pure
    @PythonName("find_edges")
    fun findEdges() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `flipHorizontally` {#safeds.data.image.containers.ImageList.flipHorizontally data-toc-label='[function] flipHorizontally'}

Return a new `ImageList` with all images flipped horizontally (vertical axis, flips left-right and vice versa).

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with all images flipped horizontally |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="354"
    @Pure
    @PythonName("flip_horizontally")
    fun flipHorizontally() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `flipVertically` {#safeds.data.image.containers.ImageList.flipVertically data-toc-label='[function] flipVertically'}

Return a new `ImageList` with all images flipped vertically (horizontal axis, flips up-down and vice versa).

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with all images flipped vertically |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="343"
    @Pure
    @PythonName("flip_vertically")
    fun flipVertically() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `getImage` {#safeds.data.image.containers.ImageList.getImage data-toc-label='[function] getImage'}

Return the image at the given index.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `index` | [`Int`][safeds.lang.Int] | the index for the image to return | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `image` | [`Image`][safeds.data.image.containers.Image] | the image at the given index |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="78"
    @Pure
    @PythonName("get_image")
    fun getImage(
        index: Int
    ) -> image: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `hasImage` {#safeds.data.image.containers.ImageList.hasImage data-toc-label='[function] hasImage'}

Return whether the given image is in this image list.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `image` | [`Image`][safeds.data.image.containers.Image] | the image to check | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `hasImage` | [`Boolean`][safeds.lang.Boolean] | Weather the given image is in this image list |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="105"
    @Pure
    @PythonName("has_image")
    fun hasImage(
        image: Image
    ) -> hasImage: Boolean
    ```

## <code class="doc-symbol doc-symbol-function"></code> `index` {#safeds.data.image.containers.ImageList.index data-toc-label='[function] index'}

Return a list of indexes of the given image.

If the image has multiple occurrences, all indices will be returned

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `image` | [`Image`][safeds.data.image.containers.Image] | the image to search for occurrences | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `indices` | [`List<Int>`][safeds.lang.List] | all occurrences of the image |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="93"
    @Pure
    fun index(
        image: Image
    ) -> indices: List<Int>
    ```

## <code class="doc-symbol doc-symbol-function"></code> `invertColors` {#safeds.data.image.containers.ImageList.invertColors data-toc-label='[function] invertColors'}

Return a new `ImageList` where all images have their colors inverted.

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with inverted colors |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="479"
    @Pure
    @PythonName("invert_colors")
    fun invertColors() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `removeDuplicateImages` {#safeds.data.image.containers.ImageList.removeDuplicateImages data-toc-label='[function] removeDuplicateImages'}

Return a new `ImageList` with all duplicate images removed.

One occurrence of each image will stay in the image list.

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with only unique images |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="266"
    @Pure
    @PythonName("remove_duplicate_images")
    fun removeDuplicateImages() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `removeImage` {#safeds.data.image.containers.ImageList.removeImage data-toc-label='[function] removeImage'}

Return a new `ImageList` with the given image removed from the image list.

If the image has multiple occurrences, all occurrences will be removed.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `image` | [`Image`][safeds.data.image.containers.Image] | The image to be removed from the image list | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with the given image removed |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="202"
    @Pure
    @PythonName("remove_image")
    fun removeImage(
        image: Image
    ) -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `removeImageByIndex` {#safeds.data.image.containers.ImageList.removeImageByIndex data-toc-label='[function] removeImageByIndex'}

Return a new `ImageList` with the given indices removed from the image list.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `index` | `#!sds union<Int, List<Int>>` | The index of the image to be removed from the image list | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with the without the removed image |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="234"
    @Pure
    @PythonName("remove_image_by_index")
    fun removeImageByIndex(
        index: union<Int, List<Int>>
    ) -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `removeImages` {#safeds.data.image.containers.ImageList.removeImages data-toc-label='[function] removeImages'}

Return a new `ImageList` with the given images removed from the image list.

If one image has multiple occurrences, all occurrences will be removed.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `images` | [`List<Image>`][safeds.lang.List] | The images to be removed from the image list | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with the given images removed |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="219"
    @Pure
    @PythonName("remove_images")
    fun removeImages(
        images: List<Image>
    ) -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `removeImagesWithSize` {#safeds.data.image.containers.ImageList.removeImagesWithSize data-toc-label='[function] removeImagesWithSize'}

Return a new `ImageList` with the all images of the given size removed.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `width` | [`Int`][safeds.lang.Int] | The width of the images to be removed from the image list | - |
| `height` | [`Int`][safeds.lang.Int] | The height of the images to be removed from the image list | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with the given images removed |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="250"
    @Pure
    @PythonName("remove_images_with_size")
    fun removeImagesWithSize(
        width: Int,
        height: Int
    ) -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `resize` {#safeds.data.image.containers.ImageList.resize data-toc-label='[function] resize'}

Return a new `ImageList` with all images resized to a given size.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `newWidth` | [`Int`][safeds.lang.Int] | the new width of the images | - |
| `newHeight` | [`Int`][safeds.lang.Int] | the new height of the images | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with all images resized to the given width and height. |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="291"
    @Pure
    fun resize(
        @PythonName("new_width") const newWidth: Int,
        @PythonName("new_height") const newHeight: Int
    ) -> imageList: ImageList where {
        newWidth >= 0,
        newHeight >= 0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `rotateLeft` {#safeds.data.image.containers.ImageList.rotateLeft data-toc-label='[function] rotateLeft'}

Return a new `ImageList` where all images have been rotated 90 degrees counter-clockwise.

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with all images rotated |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="501"
    @Pure
    @PythonName("rotate_left")
    fun rotateLeft() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `rotateRight` {#safeds.data.image.containers.ImageList.rotateRight data-toc-label='[function] rotateRight'}

Return a new `ImageList` where all images have been rotated 90 degrees clockwise.

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with all images rotated |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="490"
    @Pure
    @PythonName("rotate_right")
    fun rotateRight() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `sharpen` {#safeds.data.image.containers.ImageList.sharpen data-toc-label='[function] sharpen'}

Return a new `ImageList` where all images have been sharpened.

The original image list is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `factor` | [`Float`][safeds.lang.Float] | If factor > 1, increase the sharpness of the images. If factor = 1, no changes will be made. If factor < 1, blur the images. Has to be bigger than or equal to 0 (blurred). | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | The image list with sharpened images |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="465"
    @Pure
    fun sharpen(
        const factor: Float
    ) -> imageList: ImageList where {
        factor >= 0.0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `shuffleImages` {#safeds.data.image.containers.ImageList.shuffleImages data-toc-label='[function] shuffleImages'}

Return a new `ImageList` with all images shuffled.

The original image list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list with shuffled images |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="277"
    @Pure
    @PythonName("shuffle_images")
    fun shuffleImages() -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-function"></code> `toImages` {#safeds.data.image.containers.ImageList.toImages data-toc-label='[function] toImages'}

Return a list of all images in this image list.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `indices` | [`List<Int>?`][safeds.lang.List] | a list of all indices to include in the output. If null, all indices will be included | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `images` | [`List<Image>`][safeds.lang.List] | the list of all images |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="140"
    @Pure
    @PythonName("to_images")
    fun toImages(
        indices: List<Int>? = null
    ) -> images: List<Image>
    ```

## <code class="doc-symbol doc-symbol-function"></code> `toJpegFiles` {#safeds.data.image.containers.ImageList.toJpegFiles data-toc-label='[function] toJpegFiles'}

Save all images as jpeg files.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | `#!sds union<List<String>, String>` | Either the path to a directory or a list of directories which has directories for either all different sizes or all different images. Any non-existant path will be created | - |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="116"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_jpeg_files")
    fun toJpegFiles(
        path: union<List<String>, String>
    )
    ```

## <code class="doc-symbol doc-symbol-function"></code> `toPngFiles` {#safeds.data.image.containers.ImageList.toPngFiles data-toc-label='[function] toPngFiles'}

Save all images as png files.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | `#!sds union<List<String>, String>` | Either the path to a directory or a list of directories which has directories for either all different sizes or all different images. Any non-existant path will be created | - |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="127"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_png_files")
    fun toPngFiles(
        path: union<List<String>, String>
    )
    ```

## <code class="doc-symbol doc-symbol-static-function"></code> `fromFiles` {#safeds.data.image.containers.ImageList.fromFiles data-toc-label='[static-function] fromFiles'}

Create an ImageList from a directory or a list of files.

If you provide a path to a directory the images will be sorted alphabetically while inner directories will be sorted after image files.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | `#!sds union<List<String>, String>` | the path to the directory or a list of files | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="65"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_files")
    static fun fromFiles(
        path: union<List<String>, String>
    ) -> imageList: ImageList
    ```

## <code class="doc-symbol doc-symbol-static-function"></code> `fromImages` {#safeds.data.image.containers.ImageList.fromImages data-toc-label='[static-function] fromImages'}

Create an ImageList from a list of images.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `images` | [`List<Image>`][safeds.lang.List] | the list of images | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageList` | [`ImageList`][safeds.data.image.containers.ImageList] | the image list |

??? quote "Stub code in `ImageList.sdsstub`"

    ```sds linenums="50"
    @Pure
    @PythonName("from_images")
    static fun fromImages(
        images: List<Image>
    ) -> imageList: ImageList
    ```
