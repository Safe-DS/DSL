# `#!sds class` TimeSeries {#safeds.data.tabular.containers.TimeSeries data-toc-label='TimeSeries'}

**Parent type:** [`Table`][safeds.data.tabular.containers.Table]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>`][safeds.lang.Map] | The data. | - |
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `timeName` | [`String`][safeds.lang.String] | Name of the time column | - |
| `featureNames` | [`List<String>?`][safeds.lang.List] | Names of the feature columns. If None, all columns except the target and time columns are used. | `#!sds null` |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="17"
    class TimeSeries(
        data: Map<String, List<Any>>,
        @PythonName("target_name") targetName: String,
        @PythonName("time_name") timeName: String,
        @PythonName("feature_names") featureNames: List<String>? = null
    ) sub Table {
        /**
         * Get the target column of the tagged table.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr target: Column
        /**
         * Get the feature columns of the tagged table.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr features: Table
        /**
         * Get the time column of the time series.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr time: Column

        /**
         * Return a new `TimeSeries` with the provided column attached at the end, as neither target nor feature column.
         *
         * The original time series is not modified.
         *
         * @param column The column to be added.
         *
         * @result result1 The time series with the column attached as neither target nor feature column.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("add_column")
        fun addColumn(
            column: Column
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with the provided column attached at the end, as a feature column.
         *
         * the original time series is not modified.
         *
         * @param column The column to be added.
         *
         * @result result1 The time series with the attached feature column.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("add_column_as_feature")
        fun addColumnAsFeature(
            column: Column
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with the provided columns attached at the end, as feature columns.
         *
         * The original time series is not modified.
         *
         * @param columns The columns to be added as features.
         *
         * @result result1 The time series with the attached feature columns.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("add_columns_as_features")
        fun addColumnsAsFeatures(
            columns: union<List<Column>, Table>
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with multiple added columns, as neither target nor feature columns.
         *
         * The original time series is not modified.
         *
         * @param columns The columns to be added.
         *
         * @result result1 A new time series combining the original table and the given columns as neither target nor feature columns.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("add_columns")
        fun addColumns(
            columns: union<List<Column>, Table>
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with an extra Row attached.
         *
         * The original time series is not modified.
         *
         * @param row The row to be added.
         *
         * @result result1 A new time series with the added row at the end.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("add_row")
        fun addRow(
            row: Row
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with multiple extra Rows attached.
         *
         * The original time series is not modified.
         *
         * @param rows The rows to be added.
         *
         * @result result1 A new time series which combines the original time series and the given rows.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("add_rows")
        fun addRows(
            rows: union<List<Row>, Table>
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` containing only rows that match the given Callable (e.g. lambda function).
         *
         * The original time series is not modified.
         *
         * @param query A Callable that is applied to all rows.
         *
         * @result result1 A time series containing only the rows to match the query.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("filter_rows")
        fun filterRows(
            query: (row: Row) -> matches: Boolean
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with only the given column(s).
         *
         * The original time series is not modified.
         *
         * @param columnNames A list containing the columns to be kept.
         *
         * @result result1 A time series containing only the given column(s).
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("keep_only_columns")
        fun keepOnlyColumns(
            @PythonName("column_names") columnNames: List<String>
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with the given column(s) removed from the time series.
         *
         * The original time series is not modified.
         *
         * @param columnNames The names of all columns to be dropped.
         *
         * @result result1 A time series without the given columns.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_columns")
        fun removeColumns(
            @PythonName("column_names") columnNames: List<String>
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with every column that misses values removed.
         *
         * The original time series is not modified.
         *
         * @result result1 A time series without the columns that contain missing values.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_columns_with_missing_values")
        fun removeColumnsWithMissingValues() -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with every column that contains non-numerical values removed.
         *
         * The original time series is not modified.
         *
         * @result result1 A time series without the columns that contain non-numerical values.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_columns_with_non_numerical_values")
        fun removeColumnsWithNonNumericalValues() -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with all row duplicates removed.
         *
         * The original time series is not modified.
         *
         * @result result1 The time series with the duplicate rows removed.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_duplicate_rows")
        fun removeDuplicateRows() -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` without the rows that contain missing values.
         *
         * The original time series is not modified.
         *
         * @result result1 A time series without the rows that contain missing values.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_rows_with_missing_values")
        fun removeRowsWithMissingValues() -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with all rows that contain at least one outlier removed.
         *
         * We define an outlier as a value that has a distance of more than 3 standard deviations from the column mean.
         * Missing values are not considered outliers. They are also ignored during the calculation of the standard
         * deviation.
         *
         * The original time series is not modified.
         *
         * @result result1 A new time series without rows containing outliers.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_rows_with_outliers")
        fun removeRowsWithOutliers() -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with a single column renamed.
         *
         * The original time series is not modified.
         *
         * @param oldName The old name of the column.
         * @param newName The new name of the column.
         *
         * @result result1 The time series with the renamed column.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("rename_column")
        fun renameColumn(
            @PythonName("old_name") oldName: String,
            @PythonName("new_name") newName: String
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with the specified old column replaced by a list of new columns.
         *
         * If the column to be replaced is the target or time column, it must be replaced by exactly one column. That column
         * becomes the new target or time column. If the column to be replaced is a feature column, the new columns that replace it
         * all become feature columns.
         *
         * The order of columns is kept. The original time series is not modified.
         *
         * @param oldColumnName The name of the column to be replaced.
         * @param newColumns The new columns replacing the old column.
         *
         * @result result1 A time series with the old column replaced by the new columns.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("replace_column")
        fun replaceColumn(
            @PythonName("old_column_name") oldColumnName: String,
            @PythonName("new_columns") newColumns: List<Column>
        ) -> result1: TimeSeries

        /**
         * Slice a part of the table into a new `TimeSeries`.
         *
         * The original time series is not modified.
         *
         * @param start The first index of the range to be copied into a new time series, None by default.
         * @param end The last index of the range to be copied into a new time series, None by default.
         * @param step The step size used to iterate through the time series, 1 by default.
         *
         * @result result1 The resulting time series.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("slice_rows")
        fun sliceRows(
            start: Int? = null,
            end: Int? = null,
            step: Int = 1
        ) -> result1: TimeSeries

        /**
         * Sort the columns of a `TimeSeries` with the given comparator and return a new `TimeSeries`.
         *
         * The comparator is a function that takes two columns `col1` and `col2` and
         * returns an integer:
         *
         * * If the function returns a negative number, `col1` will be ordered before `col2`.
         * * If the function returns a positive number, `col1` will be ordered after `col2`.
         * * If the function returns 0, the original order of `col1` and `col2` will be kept.
         *
         * If no comparator is given, the columns will be sorted alphabetically by their name.
         *
         * The original time series is not modified.
         *
         * @param comparator The function used to compare two columns.
         *
         * @result result1 A new time series with sorted columns.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("sort_columns")
        fun sortColumns(
            comparator: (param1: Column, param2: Column) -> param3: Int
        ) -> result1: TimeSeries

        /**
         * Return a new `TimeSeries` with the provided column transformed by calling the provided transformer.
         *
         * The original time series is not modified.
         *
         * @param name The name of the column to be transformed.
         * @param transformer The transformer to the given column
         *
         * @result transformedTimeSeries The table with the transformed column.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("transform_column")
        fun transformColumn(
            name: String,
            transformer: (row: Row) -> newColumnValue: Any?
        ) -> transformedTimeSeries: TimeSeries

        /**
         * Plot a lagplot for the target column.
         *
         * @param lag The amount of lag used to plot
         *
         * @result result1 The plot as an image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("plot_lagplot")
        fun plotLagplot(
            lag: Int
        ) -> result1: Image

        /**
         * Plot the time series target or the given column(s) as line plot.
         *
         * The function will take the time column as the default value for y_column_name and the target column as the
         * default value for x_column_name.
         *
         * @param xColumnName The column name of the column to be plotted on the x-Axis, default is the time column.
         * @param yColumnName The column name of the column to be plotted on the y-Axis, default is the target column.
         *
         * @result result1 The plot as an image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("plot_lineplot")
        fun plotLineplot(
            @PythonName("x_column_name") xColumnName: String? = null,
            @PythonName("y_column_name") yColumnName: String? = null
        ) -> result1: Image

        /**
         * Plot the time series target or the given column(s) as scatter plot.
         *
         * The function will take the time column as the default value for x_column_name and the target column as the
         * default value for y_column_name.
         *
         * @param xColumnName The column name of the column to be plotted on the x-Axis.
         * @param yColumnName The column name of the column to be plotted on the y-Axis.
         *
         * @result result1 The plot as an image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("plot_scatterplot")
        fun plotScatterplot(
            @PythonName("x_column_name") xColumnName: String? = null,
            @PythonName("y_column_name") yColumnName: String? = null
        ) -> result1: Image
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.containers.TimeSeries.columnNames data-toc-label='columnNames'}

Return a list of all column names in this table.

**Type:** [`List<String>`][safeds.lang.List]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val columnNames = table.columnNames; // ["a", "b"]
}
```

## `#!sds attr` features {#safeds.data.tabular.containers.TimeSeries.features data-toc-label='features'}

Get the feature columns of the tagged table.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds attr` numberOfColumns {#safeds.data.tabular.containers.TimeSeries.numberOfColumns data-toc-label='numberOfColumns'}

Return the number of columns.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val numberOfColumns = table.numberOfColumns; // 2
}
```

## `#!sds attr` numberOfRows {#safeds.data.tabular.containers.TimeSeries.numberOfRows data-toc-label='numberOfRows'}

Return the number of rows.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val numberOfRows = table.numberOfRows; // 2
}
```

## `#!sds attr` schema {#safeds.data.tabular.containers.TimeSeries.schema data-toc-label='schema'}

Return the schema of the table.

**Type:** [`Schema`][safeds.data.tabular.typing.Schema]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val `schema` = table.`schema`;
}
```

## `#!sds attr` target {#safeds.data.tabular.containers.TimeSeries.target data-toc-label='target'}

Get the target column of the tagged table.

**Type:** [`Column<Any?>`][safeds.data.tabular.containers.Column]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds attr` time {#safeds.data.tabular.containers.TimeSeries.time data-toc-label='time'}

Get the time column of the time series.

**Type:** [`Column<Any?>`][safeds.data.tabular.containers.Column]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds fun` addColumn {#safeds.data.tabular.containers.TimeSeries.addColumn data-toc-label='addColumn'}

Return a new `TimeSeries` with the provided column attached at the end, as neither target nor feature column.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the column attached as neither target nor feature column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="65"
    @Pure
    @PythonName("add_column")
    fun addColumn(
        column: Column
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addColumnAsFeature {#safeds.data.tabular.containers.TimeSeries.addColumnAsFeature data-toc-label='addColumnAsFeature'}

Return a new `TimeSeries` with the provided column attached at the end, as a feature column.

the original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the attached feature column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="85"
    @Pure
    @PythonName("add_column_as_feature")
    fun addColumnAsFeature(
        column: Column
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addColumns {#safeds.data.tabular.containers.TimeSeries.addColumns data-toc-label='addColumns'}

Return a new `TimeSeries` with multiple added columns, as neither target nor feature columns.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<List<Column<Any?>>, Table>` | The columns to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series combining the original table and the given columns as neither target nor feature columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="125"
    @Pure
    @PythonName("add_columns")
    fun addColumns(
        columns: union<List<Column>, Table>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addColumnsAsFeatures {#safeds.data.tabular.containers.TimeSeries.addColumnsAsFeatures data-toc-label='addColumnsAsFeatures'}

Return a new `TimeSeries` with the provided columns attached at the end, as feature columns.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<List<Column<Any?>>, Table>` | The columns to be added as features. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the attached feature columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="105"
    @Pure
    @PythonName("add_columns_as_features")
    fun addColumnsAsFeatures(
        columns: union<List<Column>, Table>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addRow {#safeds.data.tabular.containers.TimeSeries.addRow data-toc-label='addRow'}

Return a new `TimeSeries` with an extra Row attached.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `row` | [`Row`][safeds.data.tabular.containers.Row] | The row to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series with the added row at the end. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="145"
    @Pure
    @PythonName("add_row")
    fun addRow(
        row: Row
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addRows {#safeds.data.tabular.containers.TimeSeries.addRows data-toc-label='addRows'}

Return a new `TimeSeries` with multiple extra Rows attached.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `rows` | `#!sds union<List<Row>, Table>` | The rows to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series which combines the original time series and the given rows. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="165"
    @Pure
    @PythonName("add_rows")
    fun addRows(
        rows: union<List<Row>, Table>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` filterRows {#safeds.data.tabular.containers.TimeSeries.filterRows data-toc-label='filterRows'}

Return a new `TimeSeries` containing only rows that match the given Callable (e.g. lambda function).

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `query` | `#!sds (row: Row) -> (matches: Boolean)` | A Callable that is applied to all rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series containing only the rows to match the query. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="185"
    @Pure
    @PythonName("filter_rows")
    fun filterRows(
        query: (row: Row) -> matches: Boolean
    ) -> result1: TimeSeries
    ```

## `#!sds fun` getColumn {#safeds.data.tabular.containers.TimeSeries.getColumn data-toc-label='getColumn'}

Return a column with the data of the specified column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val column = table.getColumn("a"); // Column("a", [1, 2])
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="201"
    @Pure
    @PythonName("get_column")
    fun getColumn(
        @PythonName("column_name") columnName: String
    ) -> column: Column
    ```

## `#!sds fun` getColumnType {#safeds.data.tabular.containers.TimeSeries.getColumnType data-toc-label='getColumnType'}

Return the type of the given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column to be queried. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `type` | [`ColumnType`][safeds.data.tabular.typing.ColumnType] | The type of the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val type = table.getColumnType("a"); // Integer
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="239"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        @PythonName("column_name") columnName: String
    ) -> type: ColumnType
    ```

## `#!sds fun` getRow {#safeds.data.tabular.containers.TimeSeries.getRow data-toc-label='getRow'}

Return the row at a specified index.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `index` | [`Int`][safeds.lang.Int] | The index. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Row`][safeds.data.tabular.containers.Row] | The row of the table at the index. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val row = table.getRow(0); // Row({"a": 1, "b": 3})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="258"
    @Pure
    @PythonName("get_row")
    fun getRow(
        index: Int
    ) -> result1: Row
    ```

## `#!sds fun` groupRows {#safeds.data.tabular.containers.TimeSeries.groupRows data-toc-label='groupRows'}

Return a map with copies of the output tables as values and the keys from the key_selector.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `keySelector` | `#!sds (row: Row) -> (key: T)` | A Callable that is applied to all rows and returns the key of the group. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `tablesByKey` | [`Map<T, Table>`][safeds.lang.Map] | A map containing the new tables as values and the selected keys as keys. |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `T` | [`Any?`][safeds.lang.Any] | - | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val tablesByKey = table.groupRows((row) ->
        row.getValue("a") as Int <= 2
    );
    // {
    //     true: Table({"a": [1, 2], "b": [4, 5]}),
    //     false: Table({"a": [3], "b": [6]}),
    // }
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="441"
    @Pure
    @PythonName("group_rows_by")
    fun groupRows<T>(
        @PythonName("key_selector") keySelector: (row: Row) -> key: T
    ) -> tablesByKey: Map<T, Table>
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.containers.TimeSeries.hasColumn data-toc-label='hasColumn'}

Return whether the table contains a given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if the column exists. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val hasColumn = table.hasColumn("a"); // true
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="220"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        @PythonName("column_name") columnName: String
    ) -> result1: Boolean
    ```

## `#!sds fun` inverseTransformTable {#safeds.data.tabular.containers.TimeSeries.inverseTransformTable data-toc-label='inverseTransformTable'}

Return a new `Table` with the inverted transformation applied by the given transformer.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformer` | [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer] | A transformer that was fitted with columns, which are all present in the table. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The original table. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="923"
    @Pure
    @PythonName("inverse_transform_table")
    fun inverseTransformTable(
        transformer: InvertibleTableTransformer
    ) -> result1: Table
    ```

## `#!sds fun` keepOnlyColumns {#safeds.data.tabular.containers.TimeSeries.keepOnlyColumns data-toc-label='keepOnlyColumns'}

Return a new `TimeSeries` with only the given column(s).

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>`][safeds.lang.List] | A list containing the columns to be kept. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series containing only the given column(s). |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="205"
    @Pure
    @PythonName("keep_only_columns")
    fun keepOnlyColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` plotBoxplots {#safeds.data.tabular.containers.TimeSeries.plotBoxplots data-toc-label='plotBoxplots'}

Plot a boxplot for every numerical column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="996"
    @Pure
    @PythonName("plot_boxplots")
    fun plotBoxplots() -> result1: Image
    ```

## `#!sds fun` plotCorrelationHeatmap {#safeds.data.tabular.containers.TimeSeries.plotCorrelationHeatmap data-toc-label='plotCorrelationHeatmap'}

Plot a correlation heatmap for all numerical columns of this `Table`.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="939"
    @Pure
    @PythonName("plot_correlation_heatmap")
    fun plotCorrelationHeatmap() -> result1: Image
    ```

## `#!sds fun` plotHistograms {#safeds.data.tabular.containers.TimeSeries.plotHistograms data-toc-label='plotHistograms'}

Plot a histogram for every column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1010"
    @Pure
    @PythonName("plot_histograms")
    fun plotHistograms() -> result1: Image
    ```

## `#!sds fun` plotLagplot {#safeds.data.tabular.containers.TimeSeries.plotLagplot data-toc-label='plotLagplot'}

Plot a lagplot for the target column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `lag` | [`Int`][safeds.lang.Int] | The amount of lag used to plot | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="450"
    @Pure
    @PythonName("plot_lagplot")
    fun plotLagplot(
        lag: Int
    ) -> result1: Image
    ```

## `#!sds fun` plotLineplot {#safeds.data.tabular.containers.TimeSeries.plotLineplot data-toc-label='plotLineplot'}

Plot the time series target or the given column(s) as line plot.

The function will take the time column as the default value for y_column_name and the target column as the
default value for x_column_name.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xColumnName` | [`String?`][safeds.lang.String] | The column name of the column to be plotted on the x-Axis, default is the time column. | `#!sds null` |
| `yColumnName` | [`String?`][safeds.lang.String] | The column name of the column to be plotted on the y-Axis, default is the target column. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="472"
    @Pure
    @PythonName("plot_lineplot")
    fun plotLineplot(
        @PythonName("x_column_name") xColumnName: String? = null,
        @PythonName("y_column_name") yColumnName: String? = null
    ) -> result1: Image
    ```

## `#!sds fun` plotScatterplot {#safeds.data.tabular.containers.TimeSeries.plotScatterplot data-toc-label='plotScatterplot'}

Plot the time series target or the given column(s) as scatter plot.

The function will take the time column as the default value for x_column_name and the target column as the
default value for y_column_name.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xColumnName` | [`String?`][safeds.lang.String] | The column name of the column to be plotted on the x-Axis. | `#!sds null` |
| `yColumnName` | [`String?`][safeds.lang.String] | The column name of the column to be plotted on the y-Axis. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="495"
    @Pure
    @PythonName("plot_scatterplot")
    fun plotScatterplot(
        @PythonName("x_column_name") xColumnName: String? = null,
        @PythonName("y_column_name") yColumnName: String? = null
    ) -> result1: Image
    ```

## `#!sds fun` removeColumns {#safeds.data.tabular.containers.TimeSeries.removeColumns data-toc-label='removeColumns'}

Return a new `TimeSeries` with the given column(s) removed from the time series.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>`][safeds.lang.List] | The names of all columns to be dropped. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series without the given columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="225"
    @Pure
    @PythonName("remove_columns")
    fun removeColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` removeColumnsWithMissingValues {#safeds.data.tabular.containers.TimeSeries.removeColumnsWithMissingValues data-toc-label='removeColumnsWithMissingValues'}

Return a new `TimeSeries` with every column that misses values removed.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series without the columns that contain missing values. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="243"
    @Pure
    @PythonName("remove_columns_with_missing_values")
    fun removeColumnsWithMissingValues() -> result1: TimeSeries
    ```

## `#!sds fun` removeColumnsWithNonNumericalValues {#safeds.data.tabular.containers.TimeSeries.removeColumnsWithNonNumericalValues data-toc-label='removeColumnsWithNonNumericalValues'}

Return a new `TimeSeries` with every column that contains non-numerical values removed.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series without the columns that contain non-numerical values. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="259"
    @Pure
    @PythonName("remove_columns_with_non_numerical_values")
    fun removeColumnsWithNonNumericalValues() -> result1: TimeSeries
    ```

## `#!sds fun` removeDuplicateRows {#safeds.data.tabular.containers.TimeSeries.removeDuplicateRows data-toc-label='removeDuplicateRows'}

Return a new `TimeSeries` with all row duplicates removed.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the duplicate rows removed. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="275"
    @Pure
    @PythonName("remove_duplicate_rows")
    fun removeDuplicateRows() -> result1: TimeSeries
    ```

## `#!sds fun` removeRowsWithMissingValues {#safeds.data.tabular.containers.TimeSeries.removeRowsWithMissingValues data-toc-label='removeRowsWithMissingValues'}

Return a new `TimeSeries` without the rows that contain missing values.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series without the rows that contain missing values. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="291"
    @Pure
    @PythonName("remove_rows_with_missing_values")
    fun removeRowsWithMissingValues() -> result1: TimeSeries
    ```

## `#!sds fun` removeRowsWithOutliers {#safeds.data.tabular.containers.TimeSeries.removeRowsWithOutliers data-toc-label='removeRowsWithOutliers'}

Return a new `TimeSeries` with all rows that contain at least one outlier removed.

We define an outlier as a value that has a distance of more than 3 standard deviations from the column mean.
Missing values are not considered outliers. They are also ignored during the calculation of the standard
deviation.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series without rows containing outliers. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="311"
    @Pure
    @PythonName("remove_rows_with_outliers")
    fun removeRowsWithOutliers() -> result1: TimeSeries
    ```

## `#!sds fun` renameColumn {#safeds.data.tabular.containers.TimeSeries.renameColumn data-toc-label='renameColumn'}

Return a new `TimeSeries` with a single column renamed.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldName` | [`String`][safeds.lang.String] | The old name of the column. | - |
| `newName` | [`String`][safeds.lang.String] | The new name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the renamed column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="330"
    @Pure
    @PythonName("rename_column")
    fun renameColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_name") newName: String
    ) -> result1: TimeSeries
    ```

## `#!sds fun` replaceColumn {#safeds.data.tabular.containers.TimeSeries.replaceColumn data-toc-label='replaceColumn'}

Return a new `TimeSeries` with the specified old column replaced by a list of new columns.

If the column to be replaced is the target or time column, it must be replaced by exactly one column. That column
becomes the new target or time column. If the column to be replaced is a feature column, the new columns that replace it
all become feature columns.

The order of columns is kept. The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldColumnName` | [`String`][safeds.lang.String] | The name of the column to be replaced. | - |
| `newColumns` | [`List<Column<Any?>>`][safeds.lang.List] | The new columns replacing the old column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series with the old column replaced by the new columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="356"
    @Pure
    @PythonName("replace_column")
    fun replaceColumn(
        @PythonName("old_column_name") oldColumnName: String,
        @PythonName("new_columns") newColumns: List<Column>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` shuffleRows {#safeds.data.tabular.containers.TimeSeries.shuffleRows data-toc-label='shuffleRows'}

Return a new `Table` with randomly shuffled rows of this `Table`.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `shuffledTable` | [`Table`][safeds.data.tabular.containers.Table] | The shuffled Table. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val shuffledTable = table.shuffleRows();
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="672"
    @Pure
    @PythonName("shuffle_rows")
    fun shuffleRows() -> shuffledTable: Table
    ```

## `#!sds fun` sliceRows {#safeds.data.tabular.containers.TimeSeries.sliceRows data-toc-label='sliceRows'}

Slice a part of the table into a new `TimeSeries`.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `start` | [`Int?`][safeds.lang.Int] | The first index of the range to be copied into a new time series, None by default. | `#!sds null` |
| `end` | [`Int?`][safeds.lang.Int] | The last index of the range to be copied into a new time series, None by default. | `#!sds null` |
| `step` | [`Int`][safeds.lang.Int] | The step size used to iterate through the time series, 1 by default. | `#!sds 1` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The resulting time series. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="379"
    @Pure
    @PythonName("slice_rows")
    fun sliceRows(
        start: Int? = null,
        end: Int? = null,
        step: Int = 1
    ) -> result1: TimeSeries
    ```

## `#!sds fun` sortColumns {#safeds.data.tabular.containers.TimeSeries.sortColumns data-toc-label='sortColumns'}

Sort the columns of a `TimeSeries` with the given comparator and return a new `TimeSeries`.

The comparator is a function that takes two columns `col1` and `col2` and
returns an integer:

* If the function returns a negative number, `col1` will be ordered before `col2`.
* If the function returns a positive number, `col1` will be ordered after `col2`.
* If the function returns 0, the original order of `col1` and `col2` will be kept.

If no comparator is given, the columns will be sorted alphabetically by their name.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `comparator` | `#!sds (param1: Column<Any?>, param2: Column<Any?>) -> (param3: Int)` | The function used to compare two columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series with sorted columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="410"
    @Pure
    @PythonName("sort_columns")
    fun sortColumns(
        comparator: (param1: Column, param2: Column) -> param3: Int
    ) -> result1: TimeSeries
    ```

## `#!sds fun` sortRows {#safeds.data.tabular.containers.TimeSeries.sortRows data-toc-label='sortRows'}

Sort the rows of a `Table` with the given comparator and return a new `Table`.

The comparator is a function that takes two rows `row1` and `row2` and
returns an integer:

* If `row1` should be ordered before `row2`, the function should return a negative number.
* If `row1` should be ordered after `row2`, the function should return a positive number.
* If the original order of `row1` and `row2` should be kept, the function should return 0.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `comparator` | `#!sds (param1: Row, param2: Row) -> (param3: Int)` | The function used to compare two rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `sortedTable` | [`Table`][safeds.data.tabular.containers.Table] | A new table with sorted rows. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val sortedTable = table.sortRows((row1, row2) -> 1);
    // Table({"a": [1, 2], "b": [3, 4]})
}
```
```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val sortedTable = table.sortRows((row1, row2) -> -1);
    // Table({"a": [2, 1], "b": [4, 3]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="784"
    @Pure
    @PythonName("sort_rows")
    fun sortRows(
        comparator: (param1: Row, param2: Row) -> param3: Int
    ) -> sortedTable: Table
    ```

## `#!sds fun` splitRows {#safeds.data.tabular.containers.TimeSeries.splitRows data-toc-label='splitRows'}

Split the table into two new tables. Consider using [Table.shuffleRows][safeds.data.tabular.containers.Table.shuffleRows] before splitting to ensure a random
distribution of rows in both tables.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `ratioInFirst` | [`Float`][safeds.lang.Float] | How many rows should be in the first table, expressed as a ratio of the total number of rows. Must be between 0 and 1. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `first` | [`Table`][safeds.data.tabular.containers.Table] | The first table with the specified size. |
| `second` | [`Table`][safeds.data.tabular.containers.Table] | The second table with the remaining rows. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3, 4], "b": [5, 6, 7, 8]});
    val first, val second = table.splitRows(0.5);
    // first:  Table({"a": [1, 2], "b": [5, 6]})
    // second: Table({"a": [3, 4], "b": [7, 8]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="811"
    @Pure
    @PythonName("split_rows")
    fun splitRows(
        @PythonName("percentage_in_first") ratioInFirst: Float
    ) -> (first: Table, second: Table)
    ```

## `#!sds fun` summarizeStatistics {#safeds.data.tabular.containers.TimeSeries.summarizeStatistics data-toc-label='summarizeStatistics'}

Return a table with a number of statistical key values.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `statistics` | [`Table`][safeds.data.tabular.containers.Table] | The table with statistics. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val statistics = table.summarizeStatistics();
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="277"
    @Pure
    @PythonName("summarize_statistics")
    fun summarizeStatistics() -> statistics: Table
    ```

## `#!sds fun` tagColumns {#safeds.data.tabular.containers.TimeSeries.tagColumns data-toc-label='tagColumns'}

Return a new `TaggedTable` with columns marked as a target column or feature columns.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `featureNames` | [`List<String>?`][safeds.lang.List] | Names of the feature columns. If None, all columns except the target column are used. Use this to hide columns during training but still keep them in the input, to easily link predictions back to the original data. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `taggedTable` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new tagged table with the given target and feature names. |

**Examples:**

```sds hl_lines="6"
pipeline example {
    val table = Table({
        "age":      [23, 16],
        "survived": [ 0,  1],
    });
    val taggedTable = table.tagColumns("survived");
}
```
```sds hl_lines="7"
pipeline example {
    val table = Table({
        "id":       [ 1,  2],
        "age":      [23, 16],
        "survived": [ 0,  1],
    });
    val taggedTable = table.tagColumns("target", featureNames = ["age"]);
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="850"
    @Pure
    @PythonName("tag_columns")
    fun tagColumns(
        @PythonName("target_name") targetName: String,
        @PythonName("feature_names") featureNames: List<String>? = null
    ) -> taggedTable: TaggedTable
    ```

## `#!sds fun` toColumns {#safeds.data.tabular.containers.TimeSeries.toColumns data-toc-label='toColumns'}

Return a list of the columns.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<Column<Any?>>`][safeds.lang.List] | List of columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1110"
    @Pure
    @PythonName("to_columns")
    fun toColumns() -> result1: List<Column>
    ```

## `#!sds fun` toCsvFile {#safeds.data.tabular.containers.TimeSeries.toCsvFile data-toc-label='toCsvFile'}

Write the data from the table into a CSV file.

If the file and/or the directories do not exist they will be created. If the file already exists it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1027"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_csv_file")
    fun toCsvFile(
        path: String
    )
    ```

## `#!sds fun` toExcelFile {#safeds.data.tabular.containers.TimeSeries.toExcelFile data-toc-label='toExcelFile'}

Write the data from the table into an Excel file.

Valid file extensions are `.xls`, '.xlsx', `.xlsm`, `.xlsb`, `.odf`, `.ods` and `.odt`.
If the file and/or the directories do not exist, they will be created. If the file already exists, it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1047"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_excel_file")
    fun toExcelFile(
        path: String
    )
    ```

## `#!sds fun` toHtml {#safeds.data.tabular.containers.TimeSeries.toHtml data-toc-label='toHtml'}

Return an HTML representation of the table.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`String`][safeds.lang.String] | The generated HTML. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1096"
    @Pure
    @PythonName("to_html")
    fun toHtml() -> result1: String
    ```

## `#!sds fun` toJsonFile {#safeds.data.tabular.containers.TimeSeries.toJsonFile data-toc-label='toJsonFile'}

Write the data from the table into a JSON file.

If the file and/or the directories do not exist, they will be created. If the file already exists it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1066"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_json_file")
    fun toJsonFile(
        path: String
    )
    ```

## `#!sds fun` toMap {#safeds.data.tabular.containers.TimeSeries.toMap data-toc-label='toMap'}

Return a dictionary that maps column names to column values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Map<String, List<Any?>>`][safeds.lang.Map] | Dictionary representation of the table. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1082"
    @Pure
    @PythonName("to_dict")
    fun toMap() -> result1: Map<String, List<Any?>>
    ```

## `#!sds fun` toRows {#safeds.data.tabular.containers.TimeSeries.toRows data-toc-label='toRows'}

Return a list of the rows.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<Row>`][safeds.lang.List] | List of rows. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1124"
    @Pure
    @PythonName("to_rows")
    fun toRows() -> result1: List<Row>
    ```

## `#!sds fun` transformColumn {#safeds.data.tabular.containers.TimeSeries.transformColumn data-toc-label='transformColumn'}

Return a new `TimeSeries` with the provided column transformed by calling the provided transformer.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column to be transformed. | - |
| `transformer` | `#!sds (row: Row) -> (newColumnValue: Any?)` | The transformer to the given column | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedTimeSeries` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The table with the transformed column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `time_series.sdsstub`"

    ```sds linenums="431"
    @Pure
    @PythonName("transform_column")
    fun transformColumn(
        name: String,
        transformer: (row: Row) -> newColumnValue: Any?
    ) -> transformedTimeSeries: TimeSeries
    ```

## `#!sds fun` transformTable {#safeds.data.tabular.containers.TimeSeries.transformTable data-toc-label='transformTable'}

Return a new `Table` with a learned transformation applied to this table.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformer` | [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer] | The transformer which transforms the given table. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

**Examples:**

```sds hl_lines="4"
pipeline example {
   val table = Table({"a": [1, null], "b": [3, 4]});
   val imputer = Imputer(Imputer.Strategy.Mean).fit(table, ["a"]);
   val transformedTable = table.transformTable(imputer);
   // Table({"a": [1, 1], "b": [3, 4]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="903"
    @Pure
    @PythonName("transform_table")
    fun transformTable(
        transformer: TableTransformer
    ) -> transformedTable: Table
    ```
