# :test_tube:{ title="Experimental" } `#!sds class` ImageDataset {#safeds.data.labeled.containers.ImageDataset data-toc-label='ImageDataset'}

A Dataset for ImageLists as input and ImageLists, Tables or Columns as output.

**Parent type:** [`Dataset`][safeds.data.labeled.containers.Dataset]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `inputData` | [`ImageList`][safeds.data.image.containers.ImageList] | the input ImageList | - |
| `outputData` | `#!sds T` | the output data | - |
| `batchSize` | [`Int`][safeds.lang.Int] | the batch size used for training | `#!sds 1` |
| `shuffle` | [`Boolean`][safeds.lang.Boolean] | weather the data should be shuffled after each epoch of training | `#!sds false` |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `T` | [`Any?`][safeds.lang.Any] | - | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val image = Image.fromFile("testimage.png");;
    val imageList = ImageList.fromImages([image]);
    val dataset = ImageDataset(imageList, "exampleOutput", 20, true);
}
```

??? quote "Stub code in `ImageDataset.sdsstub`"

    ```sds linenums="24"
    class ImageDataset<T>(
        @PythonName("input_data") inputData: ImageList,
        @PythonName("output_data") outputData: T,
        @PythonName("batch_size") batchSize: Int = 1,
        shuffle: Boolean = false
    ) sub Dataset {
        /**
         * Get the input `ImageSize` of this dataset.
         */
        @PythonName("input_size") attr inputSize: ImageSize
        /**
         * Get the output size of this dataset.
         */
        @PythonName("output_size") attr outputSize: ImageSize

        /**
         * Get the input data of this dataset.
         *
         * @result input the input data of this dataset
         * @example
         * pipeline example {
         *     val image = Image.fromFile("testimage.png");;
         *     val imageList = ImageList.fromImages([image]);
         *     val dataset = ImageDataset(imageList, "exampleOutput", 20, true);
         *     // The next line is an example for the Method "getInput()"
         *     val input = dataset.getInput();
         * }
         */
        @Pure
        @PythonName("get_input")
        fun getInput() -> input: ImageList

        /**
         * Get the output data of this dataset.
         *
         * @result output the output data of this dataset
         * @example
         * pipeline example {
         *     val image = Image.fromFile("testimage.png");;
         *     val imageList = ImageList.fromImages([image]);
         *     val dataset = ImageDataset(imageList, "exampleOutput", 20, true);
         *     // The next line is an example for the Method "getOutput()"
         *     val output = dataset.getOutput();
         * }
         */
        @Pure
        @PythonName("get_output")
        fun getOutput() -> output: T

        /**
         * Return a new `ImageDataset` with shuffled data.
         *
         * The original dataset list is not modified.
         *
         * @result imageDataset the shuffled `ImageDataset`
         * @example
         * pipeline example {
         *     val image = Image.fromFile("testimage.png");;
         *     val imageList = ImageList.fromImages([image]);
         *     // In the next line we don't shuffle the ImageDataset
         *     val dataset = ImageDataset(imageList, "exampleOutput", 20, false);
         *     // The next line shuffles the dataset
         *     val shuffledDataset = dataset.shuffle();
         * }
         */
        @Pure
        fun shuffle() -> imageDataset: ImageDataset<T>
    }
    ```

## `#!sds attr` inputSize {#safeds.data.labeled.containers.ImageDataset.inputSize data-toc-label='inputSize'}

Get the input `ImageSize` of this dataset.

**Type:** [`ImageSize`][safeds.data.image.typing.ImageSize]

## `#!sds attr` outputSize {#safeds.data.labeled.containers.ImageDataset.outputSize data-toc-label='outputSize'}

Get the output size of this dataset.

**Type:** [`ImageSize`][safeds.data.image.typing.ImageSize]

## `#!sds fun` getInput {#safeds.data.labeled.containers.ImageDataset.getInput data-toc-label='getInput'}

Get the input data of this dataset.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `input` | [`ImageList`][safeds.data.image.containers.ImageList] | the input data of this dataset |

**Examples:**

```sds hl_lines="5 6"
pipeline example {
    val image = Image.fromFile("testimage.png");;
    val imageList = ImageList.fromImages([image]);
    val dataset = ImageDataset(imageList, "exampleOutput", 20, true);
    // The next line is an example for the Method "getInput()"
    val input = dataset.getInput();
}
```

??? quote "Stub code in `ImageDataset.sdsstub`"

    ```sds linenums="52"
    @Pure
    @PythonName("get_input")
    fun getInput() -> input: ImageList
    ```

## `#!sds fun` getOutput {#safeds.data.labeled.containers.ImageDataset.getOutput data-toc-label='getOutput'}

Get the output data of this dataset.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `output` | `#!sds T` | the output data of this dataset |

**Examples:**

```sds hl_lines="5 6"
pipeline example {
    val image = Image.fromFile("testimage.png");;
    val imageList = ImageList.fromImages([image]);
    val dataset = ImageDataset(imageList, "exampleOutput", 20, true);
    // The next line is an example for the Method "getOutput()"
    val output = dataset.getOutput();
}
```

??? quote "Stub code in `ImageDataset.sdsstub`"

    ```sds linenums="69"
    @Pure
    @PythonName("get_output")
    fun getOutput() -> output: T
    ```

## `#!sds fun` shuffle {#safeds.data.labeled.containers.ImageDataset.shuffle data-toc-label='shuffle'}

Return a new `ImageDataset` with shuffled data.

The original dataset list is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `imageDataset` | [`ImageDataset<T>`][safeds.data.labeled.containers.ImageDataset] | the shuffled `ImageDataset` |

**Examples:**

```sds hl_lines="4 7"
pipeline example {
    val image = Image.fromFile("testimage.png");;
    val imageList = ImageList.fromImages([image]);
    // In the next line we don't shuffle the ImageDataset
    val dataset = ImageDataset(imageList, "exampleOutput", 20, false);
    // The next line shuffles the dataset
    val shuffledDataset = dataset.shuffle();
}
```

??? quote "Stub code in `ImageDataset.sdsstub`"

    ```sds linenums="89"
    @Pure
    fun shuffle() -> imageDataset: ImageDataset<T>
    ```
