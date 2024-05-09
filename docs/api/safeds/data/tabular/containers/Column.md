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

```sds hl_lines="2"
pipeline example {
    val column = Column("test", [1, 2, 3]);
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="18"
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
        @Deprecated(
            alternative="Try ExperimentalColumn.getDistinctValues instead.",
            reason="The word 'unique' could imply that only values that occur exactly once are returned.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
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
         * @result allMatch True if all match.
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
            predicate: (value: T) -> matches: Boolean
        ) -> allMatch: Boolean

        /**
         * Check if any value has a given property.
         *
         * @param predicate Callable that is used to find matches.
         *
         * @result anyMatch True if any match.
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
            predicate: (value: T) -> matches: Boolean
        ) -> anyMatch: Boolean

        /**
         * Check if no values has a given property.
         *
         * @param predicate Callable that is used to find matches.
         *
         * @result noneMatch True if none match.
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
            predicate: (value: T) -> matches: Boolean
        ) -> noneMatch: Boolean

        /**
         * Return whether the column has missing values.
         *
         * @result hasMissingValues True if missing values exist.
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
        @Deprecated(
            alternative="Column.missingValueCount() > 0.",
            reason="Barely saves any characters.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        @PythonName("has_missing_values")
        fun hasMissingValues() -> hasMissingValues: Boolean

        /**
         * Return a new column with a new name.
         *
         * The original column is not modified.
         *
         * @param newName The new name of the column.
         *
         * @result renamedColumn A new column with the new name.
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
        ) -> renamedColumn: Column

        /**
         * Apply a transform method to every data point.
         *
         * The original column is not modified.
         *
         * @param transformer Function that will be applied to all data points.
         *
         * @result transformedColumn The transformed column.
         *
         * @example
         * pipeline example {
         *     val price = Column("price", [4.99, 5.99, 2.49]);
         *     val discountedPrice = price.transform((value) -> value * 0.75);
         * }
         */
        @Pure
        fun transform<R>(
            transformer: (value: T) -> transformedValue: R
        ) -> transformedColumn: Column<R>

        /**
         * Return a table with a number of statistical key values.
         *
         * The original Column is not modified.
         *
         * @result statistics The table with statistics.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import Column
         *     // column = Column("a", [1, 3])
         *     // column.summarize_statistics()
         * }
         */
        @Pure
        @PythonName("summarize_statistics")
        fun summarizeStatistics() -> statistics: Table

        /**
         * Calculate Pearson correlation between this and another column. Both columns have to be numerical.
         *
         * @result correlation Correlation between the two columns.
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
         * }
         */
        @Pure
        @PythonName("correlation_with")
        fun correlationWith(
            @PythonName("other_column") otherColumn: Column
        ) -> correlation: Float

        /**
         * Calculate the idness of this column.
         *
         * We define the idness as follows:
         *
         * $$
         * \frac{\text{number of different values}}{\text{number of rows}}
         * $$
         *
         * @result idness The idness of the column.
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
        fun idness() -> idness: Float

        /**
         * Return the maximum value of the column. The column has to be numerical.
         *
         * @result maximum The maximum value.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val maximum = column.maximum(); // 3
         * }
         */
        @Deprecated(
            alternative="Try ExperimentalColumn.max instead.",
            reason="More concise.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        fun maximum() -> maximum: Float

        /**
         * Return the mean value of the column. The column has to be numerical.
         *
         * @result mean The mean value.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val mean = column.mean(); // 2.0
         * }
         */
        @Pure
        fun mean() -> mean: Float

        /**
         * Return the median value of the column. The column has to be numerical.
         *
         * @result median The median value.
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
        fun median() -> median: Float

        /**
         * Return the minimum value of the column. The column has to be numerical.
         *
         * @result minimum The minimum value.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val minimum = column.minimum(); // 1
         * }
         */
        @Deprecated(
            alternative="Try ExperimentalColumn.min instead.",
            reason="More concise.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        fun minimum() -> minimum: Float

        /**
         * Return the number of missing values in the column.
         *
         * @result count The number of missing values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, 4]);
         *     val missingValueCount = column.missingValueCount(); // 0
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, null]);
         *     val missingValueCount = column.missingValueCount(); // 1
         * }
         */
        @Pure
        @PythonName("missing_value_count")
        fun missingValueCount() -> count: Int

        /**
         * Return the ratio of missing values to the total number of elements in the column.
         *
         * @result missinValueRatio The ratio of missing values to the total number of elements in the column.
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
        fun missingValueRatio() -> missinValueRatio: Float

        /**
         * Return the mode of the column.
         *
         * @result mode Returns a list with the most common values.
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
        fun mode() -> mode: List<T>

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
         * @result stability The stability of the column.
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
        fun stability() -> stability: Float

        /**
         * Return the standard deviation of the column. The column has to be numerical.
         *
         * @result standardDeviation The standard deviation of all values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val standardDeviation = column.standardDeviation(); // 1.0
         * }
         */
        @Pure
        @PythonName("standard_deviation")
        fun standardDeviation() -> standardDeviation: Float

        /**
         * Return the sum of the column. The column has to be numerical.
         *
         * @result sum The sum of all values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val sum = column.sum(); // 6
         * }
         */
        @Deprecated(
            alternative="None.",
            reason="No use case.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        fun sum() -> sum: Float

        /**
         * Return the variance of the column. The column has to be numerical.
         *
         * @result variance The variance of all values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val variance = column.variance(); // 1.0
         * }
         */
        @Pure
        fun variance() -> variance: Float

        /**
         * Plot this column in a boxplot. This function can only plot real numerical data.
         *
         * @result boxplot The plot as an image.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val plot = column.plotBoxplot();
         * }
         */
        @Deprecated(
            alternative="Try ExperimentalColumn.plot.boxPlot instead.",
            reason="Groups all plotting methods in one place.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        @PythonName("plot_boxplot")
        fun plotBoxplot() -> boxplot: Image

        /**
         * Plot a column in a histogram.
         *
         * @param numberOfBins The number of bins to use in the histogram. Default is 10.
         *
         * @result histogram The plot as an image.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val plot = column.plotHistogram();
         * }
         */
        @Deprecated(
            alternative="Try ExperimentalColumn.plot.histogram instead.",
            reason="Groups all plotting methods in one place.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        @PythonName("plot_histogram")
        fun plotHistogram(
            @PythonName("number_of_bins") numberOfBins: Int = 10
        ) -> plot: Image

        /**
         * Create a plot comparing the numerical values of columns using IDs as the x-axis.
         *
         * @param columnList A list of time columns to be plotted.
         *
         * @result plot A plot with all the Columns plotted by the ID on the x-axis.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import Column
         *     // col1 =Column("target", [4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
         *     // col2 =Column("target", [42, 51, 63, 71, 83, 91, 10, 11, 12, 13])
         *     // image = col1.plot_compare_columns([col2])
         * }
         */
        @Deprecated(
            alternative="We still decide where to move this.",
            reason="Groups all plotting methods in one place.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        @PythonName("plot_compare_columns")
        fun plotCompareColumns(
            @PythonName("column_list") columnList: List<Column<Any>>
        ) -> plot: Image

        /**
         * Plot a lagplot for the given column.
         *
         * @param lag The amount of lag used to plot
         *
         * @result plot The plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import Table
         *     // table = Column("values", [1,2,3,4,3,2])
         *     // image = table.plot_lagplot(2)
         * }
         */
        @Deprecated(
            alternative="Try ExperimentalColumn.plot.lagPlot instead.",
            reason="Groups all plotting methods in one place.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        @PythonName("plot_lagplot")
        fun plotLagplot(
            lag: Int
        ) -> plot: Image

        /**
         * Create a table that contains only this column.
         *
         * @result table The table with this column.
         */
        @Pure
        @PythonName("to_table")
        fun toTable() -> table: Table

        /**
         * Return an HTML representation of the column.
         *
         * @result html The generated HTML.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val html = column.toHtml();
         * }
         */
        @Pure
        @PythonName("to_html")
        fun toHtml() -> html: String
    }
    ```

## `#!sds attr` name {#safeds.data.tabular.containers.Column.name data-toc-label='name'}

Return the name of the column.

**Type:** [`String`][safeds.lang.String]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val name = column.name; // "test"
}
```

## `#!sds attr` numberOfRows {#safeds.data.tabular.containers.Column.numberOfRows data-toc-label='numberOfRows'}

Return the number of elements in the column.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val numberOfRows = column.numberOfRows; // 3
}
```

## `#!sds attr` type {#safeds.data.tabular.containers.Column.type data-toc-label='type'}

Return the type of the column.

**Type:** [`ColumnType`][safeds.data.tabular.typing.ColumnType]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val type = column.type; // Integer
}
```
```sds hl_lines="3"
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
| `predicate` | `#!sds (value: T) -> (matches: Boolean)` | Callable that is used to find matches. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `allMatch` | [`Boolean`][safeds.lang.Boolean] | True if all match. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val allMatch = column.all((value) -> value < 4); // true
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val allMatch = column.all((value) -> value < 2); // false
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="118"
    @Pure
    fun all(
        predicate: (value: T) -> matches: Boolean
    ) -> allMatch: Boolean
    ```

## `#!sds fun` any {#safeds.data.tabular.containers.Column.any data-toc-label='any'}

Check if any value has a given property.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (value: T) -> (matches: Boolean)` | Callable that is used to find matches. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `anyMatch` | [`Boolean`][safeds.lang.Boolean] | True if any match. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val anyMatch = column.any((value) -> value < 2); // true
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val anyMatch = column.any((value) -> value < 1); // false
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="142"
    @Pure
    fun any(
        predicate: (value: T) -> matches: Boolean
    ) -> anyMatch: Boolean
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
| `correlation` | [`Float`][safeds.lang.Float] | Correlation between the two columns. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val column1 = Column("test1", [1, 2, 3]);
    val column2 = Column("test2", [2, 4, 6]);
    val correlation = column1.correlationWith(column2); // 1.0
}
```
```sds hl_lines="4"
pipeline example {
    val column1 = Column("test1", [1, 2, 3]);
    val column2 = Column("test2", [3, 2, 1]);
    val correlation = column1.correlationWith(column2); // -1.0
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="275"
    @Pure
    @PythonName("correlation_with")
    fun correlationWith(
        @PythonName("other_column") otherColumn: Column
    ) -> correlation: Float
    ```

## :warning:{ title="Deprecated" } `#!sds fun` getUniqueValues {#safeds.data.tabular.containers.Column.getUniqueValues data-toc-label='getUniqueValues'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** Try ExperimentalColumn.getDistinctValues instead.
    - **Reason:** The word 'unique' could imply that only values that occur exactly once are returned.

Return a list of all unique values in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<T>`][safeds.lang.List] | List of unique values in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, 2, 4, 3]);
    val uniqueValues = column.getUniqueValues(); // [1, 2, 3, 4]
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="70"
    @Deprecated(
        alternative="Try ExperimentalColumn.getDistinctValues instead.",
        reason="The word 'unique' could imply that only values that occur exactly once are returned.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
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

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val value = column.getValue(1); // 2
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="93"
    @Pure
    @PythonName("get_value")
    fun getValue(
        index: Int
    ) -> result1: T
    ```

## :warning:{ title="Deprecated" } `#!sds fun` hasMissingValues {#safeds.data.tabular.containers.Column.hasMissingValues data-toc-label='hasMissingValues'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** Column.missingValueCount() > 0.
    - **Reason:** Barely saves any characters.

Return whether the column has missing values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `hasMissingValues` | [`Boolean`][safeds.lang.Boolean] | True if missing values exist. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, null]);
    val hasMissingValues = column.hasMissingValues(); // true
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val hasMissingValues = column.hasMissingValues(); // false
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="188"
    @Deprecated(
        alternative="Column.missingValueCount() > 0.",
        reason="Barely saves any characters.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    @PythonName("has_missing_values")
    fun hasMissingValues() -> hasMissingValues: Boolean
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
| `idness` | [`Float`][safeds.lang.Float] | The idness of the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val idness = column.idness(); // 1.0
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 2, 3]);
    val idness = column.idness(); // 0.75
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="304"
    @Pure
    fun idness() -> idness: Float
    ```

## :warning:{ title="Deprecated" } `#!sds fun` maximum {#safeds.data.tabular.containers.Column.maximum data-toc-label='maximum'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** Try ExperimentalColumn.max instead.
    - **Reason:** More concise.

Return the maximum value of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `maximum` | [`Float`][safeds.lang.Float] | The maximum value. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val maximum = column.maximum(); // 3
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="318"
    @Deprecated(
        alternative="Try ExperimentalColumn.max instead.",
        reason="More concise.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    fun maximum() -> maximum: Float
    ```

## `#!sds fun` mean {#safeds.data.tabular.containers.Column.mean data-toc-label='mean'}

Return the mean value of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `mean` | [`Float`][safeds.lang.Float] | The mean value. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val mean = column.mean(); // 2.0
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="338"
    @Pure
    fun mean() -> mean: Float
    ```

## `#!sds fun` median {#safeds.data.tabular.containers.Column.median data-toc-label='median'}

Return the median value of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `median` | [`Float`][safeds.lang.Float] | The median value. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val median = column.median(); // 2.0
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, 4]);
    val median = column.median(); // 2.5
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="358"
    @Pure
    fun median() -> median: Float
    ```

## :warning:{ title="Deprecated" } `#!sds fun` minimum {#safeds.data.tabular.containers.Column.minimum data-toc-label='minimum'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** Try ExperimentalColumn.min instead.
    - **Reason:** More concise.

Return the minimum value of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `minimum` | [`Float`][safeds.lang.Float] | The minimum value. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val minimum = column.minimum(); // 1
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="372"
    @Deprecated(
        alternative="Try ExperimentalColumn.min instead.",
        reason="More concise.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    fun minimum() -> minimum: Float
    ```

## `#!sds fun` missingValueCount {#safeds.data.tabular.containers.Column.missingValueCount data-toc-label='missingValueCount'}

Return the number of missing values in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `count` | [`Int`][safeds.lang.Int] | The number of missing values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, 4]);
    val missingValueCount = column.missingValueCount(); // 0
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, null]);
    val missingValueCount = column.missingValueCount(); // 1
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="398"
    @Pure
    @PythonName("missing_value_count")
    fun missingValueCount() -> count: Int
    ```

## `#!sds fun` missingValueRatio {#safeds.data.tabular.containers.Column.missingValueRatio data-toc-label='missingValueRatio'}

Return the ratio of missing values to the total number of elements in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `missinValueRatio` | [`Float`][safeds.lang.Float] | The ratio of missing values to the total number of elements in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, 4]);
    val missingValueRatio = column.missingValueRatio(); // 0.0
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, null]);
    val missingValueRatio = column.missingValueRatio(); // 0.25
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="419"
    @Pure
    @PythonName("missing_value_ratio")
    fun missingValueRatio() -> missinValueRatio: Float
    ```

## `#!sds fun` mode {#safeds.data.tabular.containers.Column.mode data-toc-label='mode'}

Return the mode of the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `mode` | [`List<T>`][safeds.lang.List] | Returns a list with the most common values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 2, 3]);
    val mode = column.mode(); // [2]
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 2, 3, 3]);
    val mode = column.mode(); // [2, 3]
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="440"
    @Pure
    fun mode() -> mode: List<T>
    ```

## `#!sds fun` none {#safeds.data.tabular.containers.Column.none data-toc-label='none'}

Check if no values has a given property.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (value: T) -> (matches: Boolean)` | Callable that is used to find matches. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `noneMatch` | [`Boolean`][safeds.lang.Boolean] | True if none match. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val noneMatch = column.none((value) -> value < 1); // true
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val noneMatch = column.none((value) -> value > 1); // false
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="166"
    @Pure
    fun none(
        predicate: (value: T) -> matches: Boolean
    ) -> noneMatch: Boolean
    ```

## :warning:{ title="Deprecated" } `#!sds fun` plotBoxplot {#safeds.data.tabular.containers.Column.plotBoxplot data-toc-label='plotBoxplot'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** Try ExperimentalColumn.plot.boxPlot instead.
    - **Reason:** Groups all plotting methods in one place.

Plot this column in a boxplot. This function can only plot real numerical data.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `boxplot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val plot = column.plotBoxplot();
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="531"
    @Deprecated(
        alternative="Try ExperimentalColumn.plot.boxPlot instead.",
        reason="Groups all plotting methods in one place.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    @PythonName("plot_boxplot")
    fun plotBoxplot() -> boxplot: Image
    ```

## :warning:{ title="Deprecated" } `#!sds fun` plotCompareColumns {#safeds.data.tabular.containers.Column.plotCompareColumns data-toc-label='plotCompareColumns'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** We still decide where to move this.
    - **Reason:** Groups all plotting methods in one place.

Create a plot comparing the numerical values of columns using IDs as the x-axis.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnList` | [`List<Column<Any>>`][safeds.lang.List] | A list of time columns to be plotted. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | A plot with all the Columns plotted by the ID on the x-axis. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import Column
    // col1 =Column("target", [4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    // col2 =Column("target", [42, 51, 63, 71, 83, 91, 10, 11, 12, 13])
    // image = col1.plot_compare_columns([col2])
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="581"
    @Deprecated(
        alternative="We still decide where to move this.",
        reason="Groups all plotting methods in one place.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    @PythonName("plot_compare_columns")
    fun plotCompareColumns(
        @PythonName("column_list") columnList: List<Column<Any>>
    ) -> plot: Image
    ```

## :warning:{ title="Deprecated" } `#!sds fun` plotHistogram {#safeds.data.tabular.containers.Column.plotHistogram data-toc-label='plotHistogram'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** Try ExperimentalColumn.plot.histogram instead.
    - **Reason:** Groups all plotting methods in one place.

Plot a column in a histogram.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfBins` | [`Int`][safeds.lang.Int] | The number of bins to use in the histogram. Default is 10. | `#!sds 10` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val plot = column.plotHistogram();
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="554"
    @Deprecated(
        alternative="Try ExperimentalColumn.plot.histogram instead.",
        reason="Groups all plotting methods in one place.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    @PythonName("plot_histogram")
    fun plotHistogram(
        @PythonName("number_of_bins") numberOfBins: Int = 10
    ) -> plot: Image
    ```

## :warning:{ title="Deprecated" } `#!sds fun` plotLagplot {#safeds.data.tabular.containers.Column.plotLagplot data-toc-label='plotLagplot'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** Try ExperimentalColumn.plot.lagPlot instead.
    - **Reason:** Groups all plotting methods in one place.

Plot a lagplot for the given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `lag` | [`Int`][safeds.lang.Int] | The amount of lag used to plot | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import Table
    // table = Column("values", [1,2,3,4,3,2])
    // image = table.plot_lagplot(2)
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="607"
    @Deprecated(
        alternative="Try ExperimentalColumn.plot.lagPlot instead.",
        reason="Groups all plotting methods in one place.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    @PythonName("plot_lagplot")
    fun plotLagplot(
        lag: Int
    ) -> plot: Image
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
| `renamedColumn` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | A new column with the new name. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val renamedColumn = column.rename("new_name");
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="213"
    @Pure
    fun rename(
        @PythonName("new_name") newName: String
    ) -> renamedColumn: Column
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
| `stability` | [`Float`][safeds.lang.Float] | The stability of the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 2, 3]);
    val stability = column.stability(); // 0.5
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 2, 3, null]);
    val stability = column.stability(); // 0.5
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="468"
    @Pure
    fun stability() -> stability: Float
    ```

## `#!sds fun` standardDeviation {#safeds.data.tabular.containers.Column.standardDeviation data-toc-label='standardDeviation'}

Return the standard deviation of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `standardDeviation` | [`Float`][safeds.lang.Float] | The standard deviation of all values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val standardDeviation = column.standardDeviation(); // 1.0
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="482"
    @Pure
    @PythonName("standard_deviation")
    fun standardDeviation() -> standardDeviation: Float
    ```

## :warning:{ title="Deprecated" } `#!sds fun` sum {#safeds.data.tabular.containers.Column.sum data-toc-label='sum'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** None.
    - **Reason:** No use case.

Return the sum of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `sum` | [`Float`][safeds.lang.Float] | The sum of all values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val sum = column.sum(); // 6
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="497"
    @Deprecated(
        alternative="None.",
        reason="No use case.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    fun sum() -> sum: Float
    ```

## `#!sds fun` summarizeStatistics {#safeds.data.tabular.containers.Column.summarizeStatistics data-toc-label='summarizeStatistics'}

Return a table with a number of statistical key values.

The original Column is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `statistics` | [`Table`][safeds.data.tabular.containers.Table] | The table with statistics. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import Column
    // column = Column("a", [1, 3])
    // column.summarize_statistics()
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="252"
    @Pure
    @PythonName("summarize_statistics")
    fun summarizeStatistics() -> statistics: Table
    ```

## `#!sds fun` toHtml {#safeds.data.tabular.containers.Column.toHtml data-toc-label='toHtml'}

Return an HTML representation of the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `html` | [`String`][safeds.lang.String] | The generated HTML. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val html = column.toHtml();
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="639"
    @Pure
    @PythonName("to_html")
    fun toHtml() -> html: String
    ```

## `#!sds fun` toTable {#safeds.data.tabular.containers.Column.toTable data-toc-label='toTable'}

Create a table that contains only this column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table with this column. |

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="624"
    @Pure
    @PythonName("to_table")
    fun toTable() -> table: Table
    ```

## `#!sds fun` transform {#safeds.data.tabular.containers.Column.transform data-toc-label='transform'}

Apply a transform method to every data point.

The original column is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformer` | `#!sds (value: T) -> (transformedValue: R)` | Function that will be applied to all data points. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedColumn` | [`Column<R>`][safeds.data.tabular.containers.Column] | The transformed column. |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `R` | [`Any?`][safeds.lang.Any] | - | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val price = Column("price", [4.99, 5.99, 2.49]);
    val discountedPrice = price.transform((value) -> value * 0.75);
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="233"
    @Pure
    fun transform<R>(
        transformer: (value: T) -> transformedValue: R
    ) -> transformedColumn: Column<R>
    ```

## `#!sds fun` variance {#safeds.data.tabular.containers.Column.variance data-toc-label='variance'}

Return the variance of the column. The column has to be numerical.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `variance` | [`Float`][safeds.lang.Float] | The variance of all values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val variance = column.variance(); // 1.0
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="517"
    @Pure
    fun variance() -> variance: Float
    ```
