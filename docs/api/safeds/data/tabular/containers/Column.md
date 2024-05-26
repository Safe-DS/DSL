# <code class="doc-symbol doc-symbol-class"></code> `Column` {#safeds.data.tabular.containers.Column data-toc-label='[class] Column'}

A named, one-dimensional collection of homogeneous values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |
| `data` | [`List<T>?`][safeds.lang.List] | The data of the column. If null, an empty column is created. | `#!sds null` |

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
        data: List<T>? = null
    ) {
        /**
         * Whether the column is numeric.
         */
        @PythonName("is_numeric") attr isNumeric: Boolean
        /**
         * Whether the column is temporal.
         */
        @PythonName("is_temporal") attr isTemporal: Boolean
        /**
         * The name of the column.
         */
        attr name: String
        /**
         * The number of rows in the column.
         */
        @PythonName("number_of_rows") attr rowCount: Int
        /**
         * The plotter for the column.
         */
        attr plot: ColumnPlotter
        /**
         * The type of the column.
         */
        attr type: DataType

        /**
         * Return the column value at specified index.
         *
         * Nonnegative indices are counted from the beginning (starting at 0), negative indices from the end (starting at
         * -1).
         *
         * @param index Index of requested value.
         *
         * @result value Value at index.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.getValue(1); // 2
         * }
         */
        @Pure
        @PythonName("get_value")
        fun getValue(
            index: Int
        ) -> value: T

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
         *     val result = column.rename("new_name");
         *     // Column("new_name", [1, 2, 3])
         * }
         */
        @Pure
        fun rename(
            @PythonName("new_name") newName: String
        ) -> renamedColumn: Column<T>

        /**
         * Return a new column with values transformed by the transformer.
         *
         * The original column is not modified.
         *
         * @param transformer The transformer to apply to each value.
         *
         * @result transformedColumn A new column with transformed values.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.transform((cell) -> cell.mul(2));
         *     // Column("test", [2, 4, 6])
         * }
         */
        @Pure
        fun transform<R>(
            transformer: (cell: Cell<T>) -> transformedCell: Cell<R>
        ) -> transformedColumn: Column<R>

        /**
         * Return a table with important statistics about the column.
         *
         * @result statistics The table with statistics.
         *
         * @example
         * pipeline example {
         *     val column = Column("a", [1, 3]);
         *     val result = column.summarizeStatistics();
         * }
         */
        @Pure
        @PythonName("summarize_statistics")
        fun summarizeStatistics() -> statistics: Table

        /**
         * Calculate the Pearson correlation between this column and another column.
         *
         * The Pearson correlation is a value between -1 and 1 that indicates how much the two columns are linearly
         * related:
         *
         * - A correlation of -1 indicates a perfect negative linear relationship.
         * - A correlation of 0 indicates no linear relationship.
         * - A correlation of 1 indicates a perfect positive linear relationship.
         *
         * @param other The other column to calculate the correlation with.
         *
         * @result correlation The Pearson correlation between the two columns.
         *
         * @example
         * pipeline example {
         *     val column1 = Column("test", [1, 2, 3]);
         *     val column2 = Column("test", [2, 4, 6]);
         *     val result = column1.correlationWith(column2);
         * }
         *
         * @example
         * pipeline example {
         *     val column1 = Column("test", [1, 2, 3]);
         *     val column2 = Column("test", [3, 2, 1]);
         *     val result = column1.correlationWith(column2);
         * }
         */
        @Pure
        @PythonName("correlation_with")
        fun correlationWith(
            other: Column<Any>
        ) -> correlation: Float

        /**
         * Return the number of distinct values in the column.
         *
         * @param ignoreMissingValues Whether to ignore missing values when counting distinct values.
         *
         * @result distinctValueCount The number of distinct values in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, 2]);
         *     val result = column.distinctValueCount(); // 3
         * }
         */
        @Pure
        @PythonName("distinct_value_count")
        fun distinctValueCount(
            @PythonName("ignore_missing_values") ignoreMissingValues: Boolean = true
        ) -> distinctValueCount: Int

        /**
         * Calculate the idness of this column.
         *
         * We define the idness as the number of distinct values (including missing values) divided by the number of rows.
         * If the column is empty, the idness is 1.0.
         *
         * A high idness indicates that the column most values in the column are unique. In this case, you must be careful
         * when using the column for analysis, as a model may learn a mapping from this column to the target.
         *
         * @result idness The idness of the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.idness(); // 1.0
         * }
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3, 2]);
         *     val result = column.idness(); // 0.75
         * }
         */
        @Pure
        fun idness() -> idness: Float

        /**
         * Return the maximum value in the column.
         *
         * @result max The maximum value in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.max(); // 3
         * }
         */
        @Pure
        fun max() -> max: T?

        /**
         * Return the mean of the values in the column.
         *
         * The mean is the sum of the values divided by the number of values.
         *
         * @result mean The mean of the values in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.mean(); // 2.0
         * }
         */
        @Pure
        fun mean() -> mean: T

        /**
         * Return the median of the values in the column.
         *
         * The median is the value in the middle of the sorted list of values. If the number of values is even, the median
         * is the mean of the two middle values.
         *
         * @result median The median of the values in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.median(); // 2.0
         * }
         */
        @Pure
        fun median() -> median: T

        /**
         * Return the minimum value in the column.
         *
         * @result min The minimum value in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.min(); // 1
         * }
         */
        @Pure
        fun min() -> min: T?

        /**
         * Return the number of missing values in the column.
         *
         * @result missingValueCount The number of missing values in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, null, 3]);
         *     val result = column.missingValueCount(); // 1
         * }
         */
        @Pure
        @PythonName("missing_value_count")
        fun missingValueCount() -> missingValueCount: Int

        /**
         * Return the missing value ratio.
         *
         * We define the missing value ratio as the number of missing values in the column divided by the number of rows.
         * If the column is empty, the missing value ratio is 1.0.
         *
         * A high missing value ratio indicates that the column is dominated by missing values. In this case, the column
         * may not be useful for analysis.
         *
         * @result missingValueRatio The ratio of missing values in the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, null, 3, null]);
         *     val result = column.missingValueRatio(); // 0.5
         * }
         */
        @Pure
        @PythonName("missing_value_ratio")
        fun missingValueRatio() -> missingValueRatio: Float

        /**
         * Return the stability of the column.
         *
         * We define the stability as the number of occurrences of the most common non-missing value divided by the total
         * number of non-missing values. If the column is empty or all values are missing, the stability is 1.0.
         *
         * A high stability indicates that the column is dominated by a single value. In this case, the column may not be
         * useful for analysis.
         *
         * @result stability The stability of the column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 1, 2, 3, null]);
         *     val result = column.stability(); // 0.5
         * }
         */
        @Pure
        fun stability() -> stability: Float

        /**
         * Return the standard deviation of the values in the column.
         *
         * The standard deviation is the square root of the variance.
         *
         * @result standardDeviation The standard deviation of the values in the column. If no standard deviation can be calculated due to the
         * type of the column, null is returned.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.standardDeviation(); // 1.0
         * }
         */
        @Pure
        @PythonName("standard_deviation")
        fun standardDeviation() -> standardDeviation: Float

        /**
         * Return the variance of the values in the column.
         *
         * The variance is the average of the squared differences from the mean.
         *
         * @result variance The variance of the values in the column. If no variance can be calculated due to the type of the column,
         * null is returned.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.variance(); // 1.0
         * }
         */
        @Pure
        fun variance() -> variance: Float

        /**
         * Return the values of the column in a list.
         *
         * @result values The values of the column in a list.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.toList(); // [1, 2, 3]
         * }
         */
        @Pure
        @PythonName("to_list")
        fun toList() -> values: List<T>

        /**
         * Create a table that contains only this column.
         *
         * @result table The table with this column.
         *
         * @example
         * pipeline example {
         *     val column = Column("test", [1, 2, 3]);
         *     val result = column.toTable();
         *     // Table({"test": [1, 2, 3]})
         * }
         */
        @Pure
        @PythonName("to_table")
        fun toTable() -> table: Table
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `isNumeric` {#safeds.data.tabular.containers.Column.isNumeric data-toc-label='[attribute] isNumeric'}

Whether the column is numeric.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-attribute"></code> `isTemporal` {#safeds.data.tabular.containers.Column.isTemporal data-toc-label='[attribute] isTemporal'}

Whether the column is temporal.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-attribute"></code> `name` {#safeds.data.tabular.containers.Column.name data-toc-label='[attribute] name'}

The name of the column.

**Type:** [`String`][safeds.lang.String]

## <code class="doc-symbol doc-symbol-attribute"></code> `plot` {#safeds.data.tabular.containers.Column.plot data-toc-label='[attribute] plot'}

The plotter for the column.

**Type:** [`ColumnPlotter`][safeds.data.tabular.plotting.ColumnPlotter]

## <code class="doc-symbol doc-symbol-attribute"></code> `rowCount` {#safeds.data.tabular.containers.Column.rowCount data-toc-label='[attribute] rowCount'}

The number of rows in the column.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `type` {#safeds.data.tabular.containers.Column.type data-toc-label='[attribute] type'}

The type of the column.

**Type:** [`DataType`][safeds.data.tabular.typing.DataType]

## <code class="doc-symbol doc-symbol-function"></code> `correlationWith` {#safeds.data.tabular.containers.Column.correlationWith data-toc-label='[function] correlationWith'}

Calculate the Pearson correlation between this column and another column.

The Pearson correlation is a value between -1 and 1 that indicates how much the two columns are linearly
related:

- A correlation of -1 indicates a perfect negative linear relationship.
- A correlation of 0 indicates no linear relationship.
- A correlation of 1 indicates a perfect positive linear relationship.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Column<Any>`][safeds.data.tabular.containers.Column] | The other column to calculate the correlation with. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `correlation` | [`Float`][safeds.lang.Float] | The Pearson correlation between the two columns. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val column1 = Column("test", [1, 2, 3]);
    val column2 = Column("test", [2, 4, 6]);
    val result = column1.correlationWith(column2);
}
```
```sds hl_lines="4"
pipeline example {
    val column1 = Column("test", [1, 2, 3]);
    val column2 = Column("test", [3, 2, 1]);
    val result = column1.correlationWith(column2);
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="154"
    @Pure
    @PythonName("correlation_with")
    fun correlationWith(
        other: Column<Any>
    ) -> correlation: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `distinctValueCount` {#safeds.data.tabular.containers.Column.distinctValueCount data-toc-label='[function] distinctValueCount'}

Return the number of distinct values in the column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `ignoreMissingValues` | [`Boolean`][safeds.lang.Boolean] | Whether to ignore missing values when counting distinct values. | `#!sds true` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `distinctValueCount` | [`Int`][safeds.lang.Int] | The number of distinct values in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, 2]);
    val result = column.distinctValueCount(); // 3
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="173"
    @Pure
    @PythonName("distinct_value_count")
    fun distinctValueCount(
        @PythonName("ignore_missing_values") ignoreMissingValues: Boolean = true
    ) -> distinctValueCount: Int
    ```

## <code class="doc-symbol doc-symbol-function"></code> `getValue` {#safeds.data.tabular.containers.Column.getValue data-toc-label='[function] getValue'}

Return the column value at specified index.

Nonnegative indices are counted from the beginning (starting at 0), negative indices from the end (starting at
-1).

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `index` | [`Int`][safeds.lang.Int] | Index of requested value. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `value` | `#!sds T` | Value at index. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.getValue(1); // 2
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="63"
    @Pure
    @PythonName("get_value")
    fun getValue(
        index: Int
    ) -> value: T
    ```

## <code class="doc-symbol doc-symbol-function"></code> `idness` {#safeds.data.tabular.containers.Column.idness data-toc-label='[function] idness'}

Calculate the idness of this column.

We define the idness as the number of distinct values (including missing values) divided by the number of rows.
If the column is empty, the idness is 1.0.

A high idness indicates that the column most values in the column are unique. In this case, you must be careful
when using the column for analysis, as a model may learn a mapping from this column to the target.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `idness` | [`Float`][safeds.lang.Float] | The idness of the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.idness(); // 1.0
}
```
```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3, 2]);
    val result = column.idness(); // 0.75
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="202"
    @Pure
    fun idness() -> idness: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `max` {#safeds.data.tabular.containers.Column.max data-toc-label='[function] max'}

Return the maximum value in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `max` | `#!sds T?` | The maximum value in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.max(); // 3
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="216"
    @Pure
    fun max() -> max: T?
    ```

## <code class="doc-symbol doc-symbol-function"></code> `mean` {#safeds.data.tabular.containers.Column.mean data-toc-label='[function] mean'}

Return the mean of the values in the column.

The mean is the sum of the values divided by the number of values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `mean` | `#!sds T` | The mean of the values in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.mean(); // 2.0
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="232"
    @Pure
    fun mean() -> mean: T
    ```

## <code class="doc-symbol doc-symbol-function"></code> `median` {#safeds.data.tabular.containers.Column.median data-toc-label='[function] median'}

Return the median of the values in the column.

The median is the value in the middle of the sorted list of values. If the number of values is even, the median
is the mean of the two middle values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `median` | `#!sds T` | The median of the values in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.median(); // 2.0
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="249"
    @Pure
    fun median() -> median: T
    ```

## <code class="doc-symbol doc-symbol-function"></code> `min` {#safeds.data.tabular.containers.Column.min data-toc-label='[function] min'}

Return the minimum value in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `min` | `#!sds T?` | The minimum value in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.min(); // 1
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="263"
    @Pure
    fun min() -> min: T?
    ```

## <code class="doc-symbol doc-symbol-function"></code> `missingValueCount` {#safeds.data.tabular.containers.Column.missingValueCount data-toc-label='[function] missingValueCount'}

Return the number of missing values in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `missingValueCount` | [`Int`][safeds.lang.Int] | The number of missing values in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, null, 3]);
    val result = column.missingValueCount(); // 1
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="277"
    @Pure
    @PythonName("missing_value_count")
    fun missingValueCount() -> missingValueCount: Int
    ```

## <code class="doc-symbol doc-symbol-function"></code> `missingValueRatio` {#safeds.data.tabular.containers.Column.missingValueRatio data-toc-label='[function] missingValueRatio'}

Return the missing value ratio.

We define the missing value ratio as the number of missing values in the column divided by the number of rows.
If the column is empty, the missing value ratio is 1.0.

A high missing value ratio indicates that the column is dominated by missing values. In this case, the column
may not be useful for analysis.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `missingValueRatio` | [`Float`][safeds.lang.Float] | The ratio of missing values in the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, null, 3, null]);
    val result = column.missingValueRatio(); // 0.5
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="298"
    @Pure
    @PythonName("missing_value_ratio")
    fun missingValueRatio() -> missingValueRatio: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `rename` {#safeds.data.tabular.containers.Column.rename data-toc-label='[function] rename'}

Return a new column with a new name.

The original column is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `newName` | [`String`][safeds.lang.String] | The new name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `renamedColumn` | [`Column<T>`][safeds.data.tabular.containers.Column] | A new column with the new name. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.rename("new_name");
    // Column("new_name", [1, 2, 3])
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="85"
    @Pure
    fun rename(
        @PythonName("new_name") newName: String
    ) -> renamedColumn: Column<T>
    ```

## <code class="doc-symbol doc-symbol-function"></code> `stability` {#safeds.data.tabular.containers.Column.stability data-toc-label='[function] stability'}

Return the stability of the column.

We define the stability as the number of occurrences of the most common non-missing value divided by the total
number of non-missing values. If the column is empty or all values are missing, the stability is 1.0.

A high stability indicates that the column is dominated by a single value. In this case, the column may not be
useful for analysis.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `stability` | [`Float`][safeds.lang.Float] | The stability of the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 1, 2, 3, null]);
    val result = column.stability(); // 0.5
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="319"
    @Pure
    fun stability() -> stability: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `standardDeviation` {#safeds.data.tabular.containers.Column.standardDeviation data-toc-label='[function] standardDeviation'}

Return the standard deviation of the values in the column.

The standard deviation is the square root of the variance.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `standardDeviation` | [`Float`][safeds.lang.Float] | The standard deviation of the values in the column. If no standard deviation can be calculated due to the type of the column, null is returned. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.standardDeviation(); // 1.0
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="336"
    @Pure
    @PythonName("standard_deviation")
    fun standardDeviation() -> standardDeviation: Float
    ```

## <code class="doc-symbol doc-symbol-function"></code> `summarizeStatistics` {#safeds.data.tabular.containers.Column.summarizeStatistics data-toc-label='[function] summarizeStatistics'}

Return a table with important statistics about the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `statistics` | [`Table`][safeds.data.tabular.containers.Table] | The table with statistics. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("a", [1, 3]);
    val result = column.summarizeStatistics();
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="122"
    @Pure
    @PythonName("summarize_statistics")
    fun summarizeStatistics() -> statistics: Table
    ```

## <code class="doc-symbol doc-symbol-function"></code> `toList` {#safeds.data.tabular.containers.Column.toList data-toc-label='[function] toList'}

Return the values of the column in a list.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `values` | [`List<T>`][safeds.lang.List] | The values of the column in a list. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.toList(); // [1, 2, 3]
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="368"
    @Pure
    @PythonName("to_list")
    fun toList() -> values: List<T>
    ```

## <code class="doc-symbol doc-symbol-function"></code> `toTable` {#safeds.data.tabular.containers.Column.toTable data-toc-label='[function] toTable'}

Create a table that contains only this column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table with this column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.toTable();
    // Table({"test": [1, 2, 3]})
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="384"
    @Pure
    @PythonName("to_table")
    fun toTable() -> table: Table
    ```

## <code class="doc-symbol doc-symbol-function"></code> `transform` {#safeds.data.tabular.containers.Column.transform data-toc-label='[function] transform'}

Return a new column with values transformed by the transformer.

The original column is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformer` | `#!sds (cell: Cell<T>) -> (transformedCell: Cell<R>)` | The transformer to apply to each value. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedColumn` | [`Column<R>`][safeds.data.tabular.containers.Column] | A new column with transformed values. |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `R` | [`Any?`][safeds.lang.Any] | - | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.transform((cell) -> cell.mul(2));
    // Column("test", [2, 4, 6])
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="106"
    @Pure
    fun transform<R>(
        transformer: (cell: Cell<T>) -> transformedCell: Cell<R>
    ) -> transformedColumn: Column<R>
    ```

## <code class="doc-symbol doc-symbol-function"></code> `variance` {#safeds.data.tabular.containers.Column.variance data-toc-label='[function] variance'}

Return the variance of the values in the column.

The variance is the average of the squared differences from the mean.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `variance` | [`Float`][safeds.lang.Float] | The variance of the values in the column. If no variance can be calculated due to the type of the column, null is returned. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("test", [1, 2, 3]);
    val result = column.variance(); // 1.0
}
```

??? quote "Stub code in `Column.sdsstub`"

    ```sds linenums="354"
    @Pure
    fun variance() -> variance: Float
    ```
