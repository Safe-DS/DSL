# :test_tube:{ title="Experimental" } `#!sds class` ExperimentalColumn {#safeds.data.tabular.containers.ExperimentalColumn data-toc-label='ExperimentalColumn'}

A named, one-dimensional collection of homogeneous values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |
| `data` | [`List<T>?`][safeds.lang.List] | The data of the column. If None, an empty column is created. | `#!sds null` |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `T` | [`Any?`][safeds.lang.Any] | - | - |

**Examples:**

```sds hl_lines="2 3"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // ExperimentalColumn("test", [1, 2, 3])
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="20"
    class ExperimentalColumn<T>(
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
        @PythonName("number_of_rows") attr numberOfRows: Int
        /**
         * The plotter for the column.
         */
        attr plot: ExperimentalColumnPlotter
        /**
         * The type of the column.
         */
        attr type: ExperimentalDataType

        /**
         * Return the distinct values in the column.
         *
         * @result distinctValues The distinct values in the column.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3, 2])
         *     // column.get_distinct_values()
         * }
         */
        @Pure
        @PythonName("get_distinct_values")
        fun getDistinctValues() -> distinctValues: List<T>

        /**
         * Return the column value at specified index. Indexing starts at 0.
         *
         * @param index Index of requested value.
         *
         * @result value Value at index.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.get_value(1)
         * }
         */
        @Pure
        @PythonName("get_value")
        fun getValue(
            index: Int
        ) -> value: T

        /**
         * Return whether all values in the column satisfy the predicate.
         *
         * @param predicate The predicate to apply to each value.
         *
         * @result allSatisfyPredicate Whether all values in the column satisfy the predicate.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.all(lambda cell: cell > 0)
         * }
         */
        @Pure
        fun all(
            predicate: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<Boolean>
        ) -> allSatisfyPredicate: Boolean

        /**
         * Return whether any value in the column satisfies the predicate.
         *
         * @param predicate The predicate to apply to each value.
         *
         * @result anySatisfyPredicate Whether any value in the column satisfies the predicate.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.any(lambda cell: cell > 2)
         * }
         */
        @Pure
        fun any(
            predicate: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<Boolean>
        ) -> anySatisfyPredicate: Boolean

        /**
         * Return how many values in the column satisfy the predicate.
         *
         * @param predicate The predicate to apply to each value.
         *
         * @result count The number of values in the column that satisfy the predicate.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.count(lambda cell: cell > 1)
         * }
         */
        @Pure
        fun count(
            predicate: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<Boolean>
        ) -> count: Int

        /**
         * Return whether no value in the column satisfies the predicate.
         *
         * @param predicate The predicate to apply to each value.
         *
         * @result noneSatisfyPredicate Whether no value in the column satisfies the predicate.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.none(lambda cell: cell < 0)
         * }
         */
        @Pure
        fun none(
            predicate: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<Boolean>
        ) -> noneSatisfyPredicate: Boolean

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
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.rename("new_name")
         * }
         */
        @Pure
        fun rename(
            @PythonName("new_name") newName: String
        ) -> renamedColumn: ExperimentalColumn<T>

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
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.transform(lambda cell: 2 * cell)
         * }
         */
        @Pure
        fun transform<R>(
            transformer: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<R>
        ) -> transformedColumn: ExperimentalColumn<R>

        /**
         * Return a table with important statistics about the column.
         *
         * @result statistics The table with statistics.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("a", [1, 3])
         *     // column.summarize_statistics()
         * }
         */
        @Pure
        @PythonName("summarize_statistics")
        fun summarizeStatistics() -> statistics: ExperimentalTable

        /**
         * Calculate the Pearson correlation between this column and another column.
         *
         * The Pearson correlation is a value between -1 and 1 that indicates how much the two columns are linearly related:
         * * A correlation of -1 indicates a perfect negative linear relationship.
         * * A correlation of 0 indicates no linear relationship.
         * * A correlation of 1 indicates a perfect positive linear relationship.
         *
         * @param other The other column to calculate the correlation with.
         *
         * @result correlation The Pearson correlation between the two columns.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column1 = ExperimentalColumn("test", [1, 2, 3])
         *     // column2 = ExperimentalColumn("test", [2, 4, 6])
         *     // column1.correlation_with(column2)
         * }
         */
        @Pure
        @PythonName("correlation_with")
        fun correlationWith(
            other: ExperimentalColumn<Any>
        ) -> correlation: Float

        /**
         * Return the number of distinct values in the column.
         *
         * @result distinctValueCount The number of distinct values in the column.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3, 2])
         *     // column.distinct_value_count()
         * }
         */
        @Pure
        @PythonName("distinct_value_count")
        fun distinctValueCount() -> distinctValueCount: Int

        /**
         * Calculate the idness of this column.
         *
         * We define the idness as the number of distinct values divided by the number of rows. If the column is empty,
         * the idness is 1.0.
         *
         * A high idness indicates that the column most values in the column are unique. In this case, you must be careful
         * when using the column for analysis, as a model may learn a mapping from this column to the target.
         *
         * @result idness The idness of the column.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column1 = ExperimentalColumn("test", [1, 2, 3])
         *     // column1.idness()
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
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.max()
         * }
         */
        @Pure
        fun max() -> max: T

        /**
         * Return the mean of the values in the column.
         *
         * The mean is the sum of the values divided by the number of values.
         *
         * @result mean The mean of the values in the column.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.mean()
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
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.median()
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
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.min()
         * }
         */
        @Pure
        fun min() -> min: T

        /**
         * Return the number of missing values in the column.
         *
         * @result missingValueCount The number of missing values in the column.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, None, 3])
         *     // column.missing_value_count()
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
         */
        @Pure
        @PythonName("missing_value_ratio")
        fun missingValueRatio() -> missingValueRatio: Float

        /**
         * Return the mode of the values in the column.
         *
         * The mode is the value that appears most frequently in the column. If multiple values occur equally often, all
         * of them are returned. The values are sorted in ascending order.
         *
         * @result mode The mode of the values in the column.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [3, 1, 2, 1, 3])
         *     // column.mode()
         * }
         */
        @Pure
        fun mode() -> mode: ExperimentalColumn<T>

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
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 1, 2, 3, None])
         *     // column.stability()
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
         * type of the column, None is returned.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.standard_deviation()
         * }
         */
        @Pure
        @PythonName("standard_deviation")
        fun standardDeviation() -> standardDeviation: Float?

        /**
         * Return the variance of the values in the column.
         *
         * The variance is the average of the squared differences from the mean.
         *
         * @result variance The variance of the values in the column. If no variance can be calculated due to the type of the column,
         * None is returned.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.variance()
         * }
         */
        @Pure
        fun variance() -> variance: Float?

        /**
         * Return the values of the column in a list.
         *
         * @result values The values of the column in a list.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.to_list()
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
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // column.to_table()
         * }
         */
        @Pure
        @PythonName("to_table")
        fun toTable() -> table: ExperimentalTable

        /**
         * Convert the column to the old column format. This method is temporary and will be removed in a later version.
         *
         * @result oldColumn The column in the old format.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("a", [1, 2, 3])
         *     // old_column = column.temporary_to_old_column()
         * }
         */
        @Deprecated(
            alternative="None.",
            reason="Only a temporary solution until this implementation is stable.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        @PythonName("temporary_to_old_column")
        fun temporaryToOldColumn() -> oldColumn: Column<Any>
    }
    ```

## `#!sds attr` isNumeric {#safeds.data.tabular.containers.ExperimentalColumn.isNumeric data-toc-label='isNumeric'}

Whether the column is numeric.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` isTemporal {#safeds.data.tabular.containers.ExperimentalColumn.isTemporal data-toc-label='isTemporal'}

Whether the column is temporal.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` name {#safeds.data.tabular.containers.ExperimentalColumn.name data-toc-label='name'}

The name of the column.

**Type:** [`String`][safeds.lang.String]

## `#!sds attr` numberOfRows {#safeds.data.tabular.containers.ExperimentalColumn.numberOfRows data-toc-label='numberOfRows'}

The number of rows in the column.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` plot {#safeds.data.tabular.containers.ExperimentalColumn.plot data-toc-label='plot'}

The plotter for the column.

**Type:** [`ExperimentalColumnPlotter`][safeds.data.tabular.plotting.ExperimentalColumnPlotter]

## `#!sds attr` type {#safeds.data.tabular.containers.ExperimentalColumn.type data-toc-label='type'}

The type of the column.

**Type:** [`ExperimentalDataType`][safeds.data.tabular.typing.ExperimentalDataType]

## `#!sds fun` all {#safeds.data.tabular.containers.ExperimentalColumn.all data-toc-label='all'}

Return whether all values in the column satisfy the predicate.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (param1: ExperimentalCell<T>) -> (result1: ExperimentalCell<Boolean>)` | The predicate to apply to each value. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `allSatisfyPredicate` | [`Boolean`][safeds.lang.Boolean] | Whether all values in the column satisfy the predicate. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.all(lambda cell: cell > 0)
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="99"
    @Pure
    fun all(
        predicate: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<Boolean>
    ) -> allSatisfyPredicate: Boolean
    ```

## `#!sds fun` any {#safeds.data.tabular.containers.ExperimentalColumn.any data-toc-label='any'}

Return whether any value in the column satisfies the predicate.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (param1: ExperimentalCell<T>) -> (result1: ExperimentalCell<Boolean>)` | The predicate to apply to each value. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `anySatisfyPredicate` | [`Boolean`][safeds.lang.Boolean] | Whether any value in the column satisfies the predicate. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.any(lambda cell: cell > 2)
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="118"
    @Pure
    fun any(
        predicate: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<Boolean>
    ) -> anySatisfyPredicate: Boolean
    ```

## `#!sds fun` correlationWith {#safeds.data.tabular.containers.ExperimentalColumn.correlationWith data-toc-label='correlationWith'}

Calculate the Pearson correlation between this column and another column.

The Pearson correlation is a value between -1 and 1 that indicates how much the two columns are linearly related:
* A correlation of -1 indicates a perfect negative linear relationship.
* A correlation of 0 indicates no linear relationship.
* A correlation of 1 indicates a perfect positive linear relationship.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`ExperimentalColumn<Any>`][safeds.data.tabular.containers.ExperimentalColumn] | The other column to calculate the correlation with. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `correlation` | [`Float`][safeds.lang.Float] | The Pearson correlation between the two columns. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column1 = ExperimentalColumn("test", [1, 2, 3])
    // column2 = ExperimentalColumn("test", [2, 4, 6])
    // column1.correlation_with(column2)
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="239"
    @Pure
    @PythonName("correlation_with")
    fun correlationWith(
        other: ExperimentalColumn<Any>
    ) -> correlation: Float
    ```

## `#!sds fun` count {#safeds.data.tabular.containers.ExperimentalColumn.count data-toc-label='count'}

Return how many values in the column satisfy the predicate.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (param1: ExperimentalCell<T>) -> (result1: ExperimentalCell<Boolean>)` | The predicate to apply to each value. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `count` | [`Int`][safeds.lang.Int] | The number of values in the column that satisfy the predicate. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.count(lambda cell: cell > 1)
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="137"
    @Pure
    fun count(
        predicate: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<Boolean>
    ) -> count: Int
    ```

## `#!sds fun` distinctValueCount {#safeds.data.tabular.containers.ExperimentalColumn.distinctValueCount data-toc-label='distinctValueCount'}

Return the number of distinct values in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `distinctValueCount` | [`Int`][safeds.lang.Int] | The number of distinct values in the column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3, 2])
    // column.distinct_value_count()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="257"
    @Pure
    @PythonName("distinct_value_count")
    fun distinctValueCount() -> distinctValueCount: Int
    ```

## `#!sds fun` getDistinctValues {#safeds.data.tabular.containers.ExperimentalColumn.getDistinctValues data-toc-label='getDistinctValues'}

Return the distinct values in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `distinctValues` | [`List<T>`][safeds.lang.List] | The distinct values in the column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3, 2])
    // column.get_distinct_values()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="61"
    @Pure
    @PythonName("get_distinct_values")
    fun getDistinctValues() -> distinctValues: List<T>
    ```

## `#!sds fun` getValue {#safeds.data.tabular.containers.ExperimentalColumn.getValue data-toc-label='getValue'}

Return the column value at specified index. Indexing starts at 0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `index` | [`Int`][safeds.lang.Int] | Index of requested value. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `value` | `#!sds T` | Value at index. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.get_value(1)
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="79"
    @Pure
    @PythonName("get_value")
    fun getValue(
        index: Int
    ) -> value: T
    ```

## `#!sds fun` idness {#safeds.data.tabular.containers.ExperimentalColumn.idness data-toc-label='idness'}

Calculate the idness of this column.

We define the idness as the number of distinct values divided by the number of rows. If the column is empty,
the idness is 1.0.

A high idness indicates that the column most values in the column are unique. In this case, you must be careful
when using the column for analysis, as a model may learn a mapping from this column to the target.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `idness` | [`Float`][safeds.lang.Float] | The idness of the column. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column1 = ExperimentalColumn("test", [1, 2, 3])
    // column1.idness()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="279"
    @Pure
    fun idness() -> idness: Float
    ```

## `#!sds fun` max {#safeds.data.tabular.containers.ExperimentalColumn.max data-toc-label='max'}

Return the maximum value in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `max` | `#!sds T` | The maximum value in the column. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.max()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="294"
    @Pure
    fun max() -> max: T
    ```

## `#!sds fun` mean {#safeds.data.tabular.containers.ExperimentalColumn.mean data-toc-label='mean'}

Return the mean of the values in the column.

The mean is the sum of the values divided by the number of values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `mean` | `#!sds T` | The mean of the values in the column. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.mean()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="311"
    @Pure
    fun mean() -> mean: T
    ```

## `#!sds fun` median {#safeds.data.tabular.containers.ExperimentalColumn.median data-toc-label='median'}

Return the median of the values in the column.

The median is the value in the middle of the sorted list of values. If the number of values is even, the median
is the mean of the two middle values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `median` | `#!sds T` | The median of the values in the column. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.median()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="329"
    @Pure
    fun median() -> median: T
    ```

## `#!sds fun` min {#safeds.data.tabular.containers.ExperimentalColumn.min data-toc-label='min'}

Return the minimum value in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `min` | `#!sds T` | The minimum value in the column. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.min()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="344"
    @Pure
    fun min() -> min: T
    ```

## `#!sds fun` missingValueCount {#safeds.data.tabular.containers.ExperimentalColumn.missingValueCount data-toc-label='missingValueCount'}

Return the number of missing values in the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `missingValueCount` | [`Int`][safeds.lang.Int] | The number of missing values in the column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, None, 3])
    // column.missing_value_count()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="359"
    @Pure
    @PythonName("missing_value_count")
    fun missingValueCount() -> missingValueCount: Int
    ```

## `#!sds fun` missingValueRatio {#safeds.data.tabular.containers.ExperimentalColumn.missingValueRatio data-toc-label='missingValueRatio'}

Return the missing value ratio.

We define the missing value ratio as the number of missing values in the column divided by the number of rows.
If the column is empty, the missing value ratio is 1.0.

A high missing value ratio indicates that the column is dominated by missing values. In this case, the column
may not be useful for analysis.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `missingValueRatio` | [`Float`][safeds.lang.Float] | The ratio of missing values in the column. |

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="374"
    @Pure
    @PythonName("missing_value_ratio")
    fun missingValueRatio() -> missingValueRatio: Float
    ```

## `#!sds fun` mode {#safeds.data.tabular.containers.ExperimentalColumn.mode data-toc-label='mode'}

Return the mode of the values in the column.

The mode is the value that appears most frequently in the column. If multiple values occur equally often, all
of them are returned. The values are sorted in ascending order.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `mode` | [`ExperimentalColumn<T>`][safeds.data.tabular.containers.ExperimentalColumn] | The mode of the values in the column. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [3, 1, 2, 1, 3])
    // column.mode()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="393"
    @Pure
    fun mode() -> mode: ExperimentalColumn<T>
    ```

## `#!sds fun` none {#safeds.data.tabular.containers.ExperimentalColumn.none data-toc-label='none'}

Return whether no value in the column satisfies the predicate.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predicate` | `#!sds (param1: ExperimentalCell<T>) -> (result1: ExperimentalCell<Boolean>)` | The predicate to apply to each value. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `noneSatisfyPredicate` | [`Boolean`][safeds.lang.Boolean] | Whether no value in the column satisfies the predicate. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.none(lambda cell: cell < 0)
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="156"
    @Pure
    fun none(
        predicate: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<Boolean>
    ) -> noneSatisfyPredicate: Boolean
    ```

## `#!sds fun` rename {#safeds.data.tabular.containers.ExperimentalColumn.rename data-toc-label='rename'}

Return a new column with a new name.

The original column is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `newName` | [`String`][safeds.lang.String] | The new name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `renamedColumn` | [`ExperimentalColumn<T>`][safeds.data.tabular.containers.ExperimentalColumn] | A new column with the new name. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.rename("new_name")
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="177"
    @Pure
    fun rename(
        @PythonName("new_name") newName: String
    ) -> renamedColumn: ExperimentalColumn<T>
    ```

## `#!sds fun` stability {#safeds.data.tabular.containers.ExperimentalColumn.stability data-toc-label='stability'}

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

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 1, 2, 3, None])
    // column.stability()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="414"
    @Pure
    fun stability() -> stability: Float
    ```

## `#!sds fun` standardDeviation {#safeds.data.tabular.containers.ExperimentalColumn.standardDeviation data-toc-label='standardDeviation'}

Return the standard deviation of the values in the column.

The standard deviation is the square root of the variance.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `standardDeviation` | [`Float?`][safeds.lang.Float] | The standard deviation of the values in the column. If no standard deviation can be calculated due to the type of the column, None is returned. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.standard_deviation()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="432"
    @Pure
    @PythonName("standard_deviation")
    fun standardDeviation() -> standardDeviation: Float?
    ```

## `#!sds fun` summarizeStatistics {#safeds.data.tabular.containers.ExperimentalColumn.summarizeStatistics data-toc-label='summarizeStatistics'}

Return a table with important statistics about the column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `statistics` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with statistics. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("a", [1, 3])
    // column.summarize_statistics()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="215"
    @Pure
    @PythonName("summarize_statistics")
    fun summarizeStatistics() -> statistics: ExperimentalTable
    ```

## :warning:{ title="Deprecated" } `#!sds fun` temporaryToOldColumn {#safeds.data.tabular.containers.ExperimentalColumn.temporaryToOldColumn data-toc-label='temporaryToOldColumn'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** None.
    - **Reason:** Only a temporary solution until this implementation is stable.

Convert the column to the old column format. This method is temporary and will be removed in a later version.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `oldColumn` | [`Column<Any>`][safeds.data.tabular.containers.Column] | The column in the old format. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("a", [1, 2, 3])
    // old_column = column.temporary_to_old_column()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="498"
    @Deprecated(
        alternative="None.",
        reason="Only a temporary solution until this implementation is stable.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    @PythonName("temporary_to_old_column")
    fun temporaryToOldColumn() -> oldColumn: Column<Any>
    ```

## `#!sds fun` toList {#safeds.data.tabular.containers.ExperimentalColumn.toList data-toc-label='toList'}

Return the values of the column in a list.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `values` | [`List<T>`][safeds.lang.List] | The values of the column in a list. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.to_list()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="466"
    @Pure
    @PythonName("to_list")
    fun toList() -> values: List<T>
    ```

## `#!sds fun` toTable {#safeds.data.tabular.containers.ExperimentalColumn.toTable data-toc-label='toTable'}

Create a table that contains only this column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with this column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.to_table()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="482"
    @Pure
    @PythonName("to_table")
    fun toTable() -> table: ExperimentalTable
    ```

## `#!sds fun` transform {#safeds.data.tabular.containers.ExperimentalColumn.transform data-toc-label='transform'}

Return a new column with values transformed by the transformer.

The original column is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformer` | `#!sds (param1: ExperimentalCell<T>) -> (result1: ExperimentalCell<R>)` | The transformer to apply to each value. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedColumn` | [`ExperimentalColumn<R>`][safeds.data.tabular.containers.ExperimentalColumn] | A new column with transformed values. |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `R` | [`Any?`][safeds.lang.Any] | - | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.transform(lambda cell: 2 * cell)
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="198"
    @Pure
    fun transform<R>(
        transformer: (param1: ExperimentalCell<T>) -> result1: ExperimentalCell<R>
    ) -> transformedColumn: ExperimentalColumn<R>
    ```

## `#!sds fun` variance {#safeds.data.tabular.containers.ExperimentalColumn.variance data-toc-label='variance'}

Return the variance of the values in the column.

The variance is the average of the squared differences from the mean.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `variance` | [`Float?`][safeds.lang.Float] | The variance of the values in the column. If no variance can be calculated due to the type of the column, None is returned. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // column.variance()
}
```

??? quote "Stub code in `ExperimentalColumn.sdsstub`"

    ```sds linenums="451"
    @Pure
    fun variance() -> variance: Float?
    ```
