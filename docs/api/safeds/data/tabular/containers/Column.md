# `#!sds class` Column {#safeds.data.tabular.containers.Column data-toc-label='Column'}

A column is a named collection of values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |
| `data` | [`List<T>`][safeds.lang.List] | The data. | `#!sds []` |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `T` | [`Any?`][safeds.lang.Any] | - | [`Any?`][safeds.lang.Any] |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="17"
    class Column<out T = Any?>(
        name: String,
        data: List<T> = []
    ) {
        /**
         * Return the name of the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val name = column.name; // "test"
         * }
         */
        attr name: String
        /**
         * Return the number of elements in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val numberOfRows = column.numberOfRows; // 3
         * }
         */
        @PythonName("number_of_rows") attr numberOfRows: Int
        /**
         * Return the type of the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val type = column.type; // Integer
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", ["a", "b", "c"]);
         *     val type = column.type; // String
         * }
         */
        attr type: ColumnType

        /**
         * Return a list of all unique values in the column.
         *
         * @result result1 List of unique values in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, 2, 4, 3]);
         *     val uniqueValues = column.getUniqueValues(); // [1, 2, 3, 4]
         * }
         */
        @Pure
        @PythonName("get_unique_values")
        fun getUniqueValues() -> result1: List<T>

        /**
         * Return column value at specified index, starting at 0.
         *
         * @param index Index of requested element.
         *
         * @result result1 Value at index in column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val value = column.getValue(1); // 2
         * }
         */
        @Pure
        @PythonName("get_value")
        fun getValue(
            index: Int
        ) -> result1: T

        /**
         * Check if all values have a given property.
         *
         * @param predicate Callable that is used to find matches.
         *
         * @result result1 True if all match.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val allMatch = column.all((value) -> value < 4); // true
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val allMatch = column.all((value) -> value < 2); // false
         * }
         */
        @Pure
        fun all(
            predicate: (param1: T) -> param2: Boolean
        ) -> result1: Boolean

        /**
         * Check if any value has a given property.
         *
         * @param predicate Callable that is used to find matches.
         *
         * @result result1 True if any match.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val anyMatch = column.any((value) -> value < 2); // true
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val anyMatch = column.any((value) -> value < 1); // false
         * }
         */
        @Pure
        fun any(
            predicate: (param1: T) -> param2: Boolean
        ) -> result1: Boolean

        /**
         * Check if no values has a given property.
         *
         * @param predicate Callable that is used to find matches.
         *
         * @result result1 True if none match.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val noneMatch = column.none((value) -> value < 1); // true
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val noneMatch = column.none((value) -> value > 1); // false
         * }
         */
        @Pure
        fun none(
            predicate: (param1: T) -> param2: Boolean
        ) -> result1: Boolean

        /**
         * Return whether the column has missing values.
         *
         * @result result1 True if missing values exist.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, null]);
         *     val hasMissingValues = column.hasMissingValues(); // true
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val hasMissingValues = column.hasMissingValues(); // false
         * }
         */
        @Pure
        @PythonName("has_missing_values")
        fun hasMissingValues() -> result1: Boolean

        /**
         * Return a new column with a new name.
         *
         * The original column is not modified.
         *
         * @param newName The new name of the column.
         *
         * @result result1 A new column with the new name.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val renamedColumn = column.rename("new_name");
         * }
         */
        @Pure
        fun rename(
            @PythonName("new_name") newName: String
        ) -> result1: Column

        /**
         * Apply a transform method to every data point.
         *
         * The original column is not modified.
         *
         * @param transformer Function that will be applied to all data points.
         *
         * @result result1 The transformed column.
         *
         * @example
         * pipeline example {
         *     val price = Column("price", [4.99, 5.99, 2.49]);
         *     val discountedPrice = price.transform((value) -> value * 0.75);
         * }
         */
        @Pure
        fun transform<R>(
            transformer: (param1: T) -> param2: R
        ) -> result1: Column<R>

        /**
         * Calculate Pearson correlation between this and another column. Both columns have to be numerical.
         *
         * @result result1 Correlation between the two columns.
         *
         * @example
         * pipeline example {
         *     val column1 = Column("test1", [1, 2, 3]);
         *     val column2 = Column("test2", [2, 4, 6]);
         *     val correlation = column1.correlationWith(column2); // 1.0
         * }
         *
         * @example
         * pipeline example {
         *     val column1 = Column("test1", [1, 2, 3]);
         *     val column2 = Column("test2", [3, 2, 1]);
         *     val correlation = column1.correlationWith(column2); // -1.0
         */
        @Pure
        @PythonName("correlation_with")
        fun correlationWith(
            @PythonName("other_column") otherColumn: Column
        ) -> result1: Float

        /**
         * Calculate the idness of this column.
         *
         * We define the idness as follows:
         *
         * $$
         * \frac{\text{number of different values}}{\text{number of rows}}
         * $$
         *
         * @result result1 The idness of the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val idness = column.idness(); // 1.0
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 2, 3]);
         *     val idness = column.idness(); // 0.75
         * }
         */
        @Pure
        fun idness() -> result1: Float

        /**
         * Return the maximum value of the column. The column has to be numerical.
         *
         * @result result1 The maximum value.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val maximum = column.maximum(); // 3
         * }
         */
        @Pure
        fun maximum() -> result1: Float

        /**
         * Return the mean value of the column. The column has to be numerical.
         *
         * @result result1 The mean value.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val mean = column.mean(); // 2.0
         * }
         */
        @Pure
        fun mean() -> result1: Float

        /**
         * Return the median value of the column. The column has to be numerical.
         *
         * @result result1 The median value.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val median = column.median(); // 2.0
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, 4]);
         *     val median = column.median(); // 2.5
         * }
         */
        @Pure
        fun median() -> result1: Float

        /**
         * Return the minimum value of the column. The column has to be numerical.
         *
         * @result result1 The minimum value.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val minimum = column.minimum(); // 1
         * }
         */
        @Pure
        fun minimum() -> result1: Float

        /**
         * Return the ratio of missing values to the total number of elements in the column.
         *
         * @result result1 The ratio of missing values to the total number of elements in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, 4]);
         *     val missingValueRatio = column.missingValueRatio(); // 0.0
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, null]);
         *     val missingValueRatio = column.missingValueRatio(); // 0.25
         * }
         */
        @Pure
        @PythonName("missing_value_ratio")
        fun missingValueRatio() -> result1: Float

        /**
         * Return the mode of the column.
         *
         * @result result1 Returns a list with the most common values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 2, 3]);
         *     val mode = column.mode(); // [2]
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 2, 3, 3]);
         *     val mode = column.mode(); // [2, 3]
         * }
         */
        @Pure
        fun mode() -> result1: List<T>

        /**
         * Calculate the stability of this column.
         *
         * We define the stability as follows:
         *
         * $$
         * \frac{\text{number of occurrences of most common non-null value}}{\text{number of non-null values}}
         * $$
         *
         * The stability is not defined for a column with only null values.
         *
         * @result result1 The stability of the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 2, 3]);
         *     val stability = column.stability(); // 0.5
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 2, 3, null]);
         *     val stability = column.stability(); // 0.5
         * }
         */
        @Pure
        fun stability() -> result1: Float

        /**
         * Return the standard deviation of the column. The column has to be numerical.
         *
         * @result result1 The standard deviation of all values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val standardDeviation = column.standardDeviation(); // 1.0
         * }
         */
        @Pure
        @PythonName("standard_deviation")
        fun standardDeviation() -> result1: Float

        /**
         * Return the sum of the column. The column has to be numerical.
         *
         * @result result1 The sum of all values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val sum = column.sum(); // 6
         * }
         */
        @Pure
        fun sum() -> result1: Float

        /**
         * Return the variance of the column. The column has to be numerical.
         *
         * @result result1 The variance of all values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val variance = column.variance(); // 1.0
         * }
         */
        @Pure
        fun variance() -> result1: Float

        /**
         * Plot this column in a boxplot. This function can only plot real numerical data.
         *
         * @result result1 The plot as an image.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val plot = column.plotBoxplot();
         * }
         */
        @Pure
        @PythonName("plot_boxplot")
        fun plotBoxplot() -> result1: Image

        /**
         * Plot a column in a histogram.
         *
         * @result result1 The plot as an image.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val plot = column.plotHistogram();
         * }
         */
        @Pure
        @PythonName("plot_histogram")
        fun plotHistogram() -> result1: Image

        /**
         * Return an HTML representation of the column.
         *
         * @result result1 The generated HTML.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val html = column.toHtml();
         * }
         */
        @Pure
        @PythonName("to_html")
        fun toHtml() -> result1: String
    }
    ```

## `#!sds attr` name {#safeds.data.tabular.containers.Column.name data-toc-label='name'}

Return the name of the column.

**Type:** [`String`][safeds.lang.String]

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val name = column.name; // "test"
}
```

## `#!sds attr` numberOfRows {#safeds.data.tabular.containers.Column.numberOfRows data-toc-label='numberOfRows'}

Return the number of elements in the column.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val numberOfRows = column.numberOfRows; // 3
}
```

## `#!sds attr` type {#safeds.data.tabular.containers.Column.type data-toc-label='type'}

Return the type of the column.

**Type:** [`ColumnType`][safeds.data.tabular.typing.ColumnType]

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val type = column.type; // Integer
}
```
```sds
pipeline example {
    val column = Column("test", ["a", "b", "c"]);
    val type = column.type; // String
}
```

## `#!sds fun` all {#safeds.data.tabular.containers.Column.all data-toc-label='all'}

Check if all values have a given property.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (param1: T) -> (param2: Boolean)` | Callable that is used to find matches. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if all match. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val allMatch = column.all((value) -> value < 4); // true
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val allMatch = column.all((value) -> value < 2); // false
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="111"
    @Pure
    fun all(
        predicate: (param1: T) -> param2: Boolean
    ) -> result1: Boolean
    ```

## `#!sds fun` any {#safeds.data.tabular.containers.Column.any data-toc-label='any'}

Check if any value has a given property.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (param1: T) -> (param2: Boolean)` | Callable that is used to find matches. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if any match. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val anyMatch = column.any((value) -> value < 2); // true
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val anyMatch = column.any((value) -> value < 1); // false
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="135"
    @Pure
    fun any(
        predicate: (param1: T) -> param2: Boolean
    ) -> result1: Boolean
    ```

## `#!sds fun` correlationWith {#safeds.data.tabular.containers.Column.correlationWith data-toc-label='correlationWith'}

Calculate Pearson correlation between this and another column. Both columns have to be numerical.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `otherColumn` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | Correlation between the two columns. |

**Examples:**

```sds
pipeline example {
    val column1 = Column("test1", [1, 2, 3]);
    val column2 = Column("test2", [2, 4, 6]);
    val correlation = column1.correlationWith(column2); // 1.0
}
```
```sds
pipeline example {
    val column1 = Column("test1", [1, 2, 3]);
    val column2 = Column("test2", [3, 2, 1]);
    val correlation = column1.correlationWith(column2); // -1.0
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="243"
    @Pure
    @PythonName("correlation_with")
    fun correlationWith(
        @PythonName("other_column") otherColumn: Column
    ) -> result1: Float
    ```

## `#!sds fun` getUniqueValues {#safeds.data.tabular.containers.Column.getUniqueValues data-toc-label='getUniqueValues'}

Return a list of all unique values in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<T>`][safeds.lang.List] | List of unique values in the column. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3, 2, 4, 3]);
    val uniqueValues = column.getUniqueValues(); // [1, 2, 3, 4]
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="69"
    @Pure
    @PythonName("get_unique_values")
    fun getUniqueValues() -> result1: List<T>
    ```

## `#!sds fun` getValue {#safeds.data.tabular.containers.Column.getValue data-toc-label='getValue'}

Return column value at specified index, starting at 0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `index` | [`Int`][safeds.lang.Int] | Index of requested element. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | `#!sds T` | Value at index in column. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val value = column.getValue(1); // 2
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="86"
    @Pure
    @PythonName("get_value")
    fun getValue(
        index: Int
    ) -> result1: T
    ```

## `#!sds fun` hasMissingValues {#safeds.data.tabular.containers.Column.hasMissingValues data-toc-label='hasMissingValues'}

Return whether the column has missing values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if missing values exist. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3, null]);
    val hasMissingValues = column.hasMissingValues(); // true
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val hasMissingValues = column.hasMissingValues(); // false
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="181"
    @Pure
    @PythonName("has_missing_values")
    fun hasMissingValues() -> result1: Boolean
    ```

## `#!sds fun` idness {#safeds.data.tabular.containers.Column.idness data-toc-label='idness'}

Calculate the idness of this column.

We define the idness as follows:

$$
\frac{\text{number of different values}}{\text{number of rows}}
$$

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The idness of the column. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val idness = column.idness(); // 1.0
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 2, 3]);
    val idness = column.idness(); // 0.75
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="272"
    @Pure
    fun idness() -> result1: Float
    ```

## `#!sds fun` maximum {#safeds.data.tabular.containers.Column.maximum data-toc-label='maximum'}

Return the maximum value of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The maximum value. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val maximum = column.maximum(); // 3
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="286"
    @Pure
    fun maximum() -> result1: Float
    ```

## `#!sds fun` mean {#safeds.data.tabular.containers.Column.mean data-toc-label='mean'}

Return the mean value of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The mean value. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val mean = column.mean(); // 2.0
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="300"
    @Pure
    fun mean() -> result1: Float
    ```

## `#!sds fun` median {#safeds.data.tabular.containers.Column.median data-toc-label='median'}

Return the median value of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The median value. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val median = column.median(); // 2.0
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 3, 4]);
    val median = column.median(); // 2.5
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="320"
    @Pure
    fun median() -> result1: Float
    ```

## `#!sds fun` minimum {#safeds.data.tabular.containers.Column.minimum data-toc-label='minimum'}

Return the minimum value of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The minimum value. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val minimum = column.minimum(); // 1
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="334"
    @Pure
    fun minimum() -> result1: Float
    ```

## `#!sds fun` missingValueRatio {#safeds.data.tabular.containers.Column.missingValueRatio data-toc-label='missingValueRatio'}

Return the ratio of missing values to the total number of elements in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The ratio of missing values to the total number of elements in the column. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3, 4]);
    val missingValueRatio = column.missingValueRatio(); // 0.0
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 3, null]);
    val missingValueRatio = column.missingValueRatio(); // 0.25
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="354"
    @Pure
    @PythonName("missing_value_ratio")
    fun missingValueRatio() -> result1: Float
    ```

## `#!sds fun` mode {#safeds.data.tabular.containers.Column.mode data-toc-label='mode'}

Return the mode of the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<T>`][safeds.lang.List] | Returns a list with the most common values. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 2, 3]);
    val mode = column.mode(); // [2]
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 2, 3, 3]);
    val mode = column.mode(); // [2, 3]
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="375"
    @Pure
    fun mode() -> result1: List<T>
    ```

## `#!sds fun` none {#safeds.data.tabular.containers.Column.none data-toc-label='none'}

Check if no values has a given property.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (param1: T) -> (param2: Boolean)` | Callable that is used to find matches. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if none match. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val noneMatch = column.none((value) -> value < 1); // true
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val noneMatch = column.none((value) -> value > 1); // false
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="159"
    @Pure
    fun none(
        predicate: (param1: T) -> param2: Boolean
    ) -> result1: Boolean
    ```

## `#!sds fun` plotBoxplot {#safeds.data.tabular.containers.Column.plotBoxplot data-toc-label='plotBoxplot'}

Plot this column in a boxplot. This function can only plot real numerical data.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val plot = column.plotBoxplot();
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="460"
    @Pure
    @PythonName("plot_boxplot")
    fun plotBoxplot() -> result1: Image
    ```

## `#!sds fun` plotHistogram {#safeds.data.tabular.containers.Column.plotHistogram data-toc-label='plotHistogram'}

Plot a column in a histogram.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val plot = column.plotHistogram();
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="475"
    @Pure
    @PythonName("plot_histogram")
    fun plotHistogram() -> result1: Image
    ```

## `#!sds fun` rename {#safeds.data.tabular.containers.Column.rename data-toc-label='rename'}

Return a new column with a new name.

The original column is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `newName` | [`String`][safeds.lang.String] | The new name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | A new column with the new name. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val renamedColumn = column.rename("new_name");
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="200"
    @Pure
    fun rename(
        @PythonName("new_name") newName: String
    ) -> result1: Column
    ```

## `#!sds fun` stability {#safeds.data.tabular.containers.Column.stability data-toc-label='stability'}

Calculate the stability of this column.

We define the stability as follows:

$$
\frac{\text{number of occurrences of most common non-null value}}{\text{number of non-null values}}
$$

The stability is not defined for a column with only null values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The stability of the column. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 2, 3]);
    val stability = column.stability(); // 0.5
}
```
```sds
pipeline example {
    val column = Column("test", [1, 2, 2, 3, null]);
    val stability = column.stability(); // 0.5
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="403"
    @Pure
    fun stability() -> result1: Float
    ```

## `#!sds fun` standardDeviation {#safeds.data.tabular.containers.Column.standardDeviation data-toc-label='standardDeviation'}

Return the standard deviation of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The standard deviation of all values. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val standardDeviation = column.standardDeviation(); // 1.0
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="417"
    @Pure
    @PythonName("standard_deviation")
    fun standardDeviation() -> result1: Float
    ```

## `#!sds fun` sum {#safeds.data.tabular.containers.Column.sum data-toc-label='sum'}

Return the sum of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The sum of all values. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val sum = column.sum(); // 6
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="432"
    @Pure
    fun sum() -> result1: Float
    ```

## `#!sds fun` toHtml {#safeds.data.tabular.containers.Column.toHtml data-toc-label='toHtml'}

Return an HTML representation of the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`String`][safeds.lang.String] | The generated HTML. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val html = column.toHtml();
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="490"
    @Pure
    @PythonName("to_html")
    fun toHtml() -> result1: String
    ```

## `#!sds fun` transform {#safeds.data.tabular.containers.Column.transform data-toc-label='transform'}

Apply a transform method to every data point.

The original column is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformer` | `#!sds (param1: T) -> (param2: R)` | Function that will be applied to all data points. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Column<R>`][safeds.data.tabular.containers.Column] | The transformed column. |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `R` | [`Any?`][safeds.lang.Any] | - | - |

**Examples:**

```sds
pipeline example {
    val price = Column("price", [4.99, 5.99, 2.49]);
    val discountedPrice = price.transform((value) -> value * 0.75);
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="220"
    @Pure
    fun transform<R>(
        transformer: (param1: T) -> param2: R
    ) -> result1: Column<R>
    ```

## `#!sds fun` variance {#safeds.data.tabular.containers.Column.variance data-toc-label='variance'}

Return the variance of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Float`][safeds.lang.Float] | The variance of all values. |

**Examples:**

```sds
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val variance = column.variance(); // 1.0
}
```

??? quote "Stub code in `column.sdsstub`"

    ```sds linenums="446"
    @Pure
    fun variance() -> result1: Float
    ```
