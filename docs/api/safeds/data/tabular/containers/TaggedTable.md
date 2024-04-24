# :test_tube:{ title="Experimental" } `#!sds class` TaggedTable {#safeds.data.tabular.containers.TaggedTable data-toc-label='TaggedTable'}

A tagged table is a table that additionally knows which columns are features and which are the target to predict.

**Parent type:** [`Table`][safeds.data.tabular.containers.Table]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>`][safeds.lang.Map] | The data. | - |
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `featureNames` | [`List<String>?`][safeds.lang.List] | Names of the feature columns. If None, all columns except the target column are used. | `#!sds null` |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="18"
    class TaggedTable(
        data: Map<String, List<Any>>,
        @PythonName("target_name") targetName: String,
        @PythonName("feature_names") featureNames: List<String>? = null
    ) sub Table {
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
         * Get the target column of the tagged table.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        attr target: Column

        /**
         * Return a new table with the provided column attached at the end, as a feature column.
         *
         * the original table is not modified.
         *
         * @param column The column to be added.
         *
         * @result result1 The table with the attached feature column.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with the provided columns attached at the end, as feature columns.
         *
         * The original table is not modified.
         *
         * @param columns The columns to be added as features.
         *
         * @result result1 The table with the attached feature columns.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with the provided column attached at the end, as neither target nor feature column.
         *
         * The original table is not modified.
         *
         * @param column The column to be added.
         *
         * @result result1 The table with the column attached as neither target nor feature column.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with multiple added columns, as neither target nor feature columns.
         *
         * The original table is not modified.
         *
         * @param columns The columns to be added.
         *
         * @result result1 A new table combining the original table and the given columns as neither target nor feature columns.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with an added Row attached.
         *
         * The original table is not modified.
         *
         * @param row The row to be added.
         *
         * @result result1 A new tagged table with the added row at the end.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with multiple added Rows attached.
         *
         * The original table is not modified.
         *
         * @param rows The rows to be added.
         *
         * @result result1 A new tagged table which combines the original table and the given rows.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` containing only rows that match the given Callable (e.g. lambda function).
         *
         * The original tagged table is not modified.
         *
         * @param query A Callable that is applied to all rows.
         *
         * @result result1 A new tagged table containing only the rows to match the query.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with only the given column(s).
         *
         * The original table is not modified.
         *
         * @param columnNames A list containing only the columns to be kept.
         *
         * @result result1 A table containing only the given column(s).
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with the given column(s) removed from the table.
         *
         * The original table is not modified.
         *
         * @param columnNames The names of all columns to be dropped.
         *
         * @result result1 A table without the given columns.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with every column that misses values removed.
         *
         * The original table is not modified.
         *
         * @result result1 A table without the columns that contain missing values.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_columns_with_missing_values")
        fun removeColumnsWithMissingValues() -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with every column that contains non-numerical values removed.
         *
         * The original table is not modified.
         *
         * @result result1 A table without the columns that contain non-numerical values.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_columns_with_non_numerical_values")
        fun removeColumnsWithNonNumericalValues() -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with all row duplicates removed.
         *
         * The original table is not modified.
         *
         * @result result1 The table with the duplicate rows removed.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_duplicate_rows")
        fun removeDuplicateRows() -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` without the rows that contain missing values.
         *
         * The original table is not modified.
         *
         * @result result1 A table without the rows that contain missing values.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_rows_with_missing_values")
        fun removeRowsWithMissingValues() -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with all rows that contain at least one outlier removed.
         *
         * We define an outlier as a value that has a distance of more than 3 standard deviations from the column mean.
         * Missing values are not considered outliers. They are also ignored during the calculation of the standard
         * deviation.
         *
         * The original table is not modified.
         *
         * @result result1 A new table without rows containing outliers.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("remove_rows_with_outliers")
        fun removeRowsWithOutliers() -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with a single column renamed.
         *
         * The original table is not modified.
         *
         * @param oldName The old name of the target column.
         * @param newName The new name of the target column.
         *
         * @result result1 The Table with the renamed column.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with the specified old column replaced by a list of new columns.
         *
         * If the column to be replaced is the target column, it must be replaced by exactly one column. That column
         * becomes the new target column. If the column to be replaced is a feature column, the new columns that replace it
         * all become feature columns.
         *
         * The order of columns is kept. The original table is not modified.
         *
         * @param oldColumnName The name of the column to be replaced.
         * @param newColumns The new columns replacing the old column.
         *
         * @result result1 A table with the old column replaced by the new column.
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
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with randomly shuffled rows of this table.
         *
         * The original table is not modified.
         *
         * @result result1 The shuffled Table.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("shuffle_rows")
        fun shuffleRows() -> result1: TaggedTable

        /**
         * Slice a part of the table into a new `TaggedTable`.
         *
         * The original table is not modified.
         *
         * @param start The first index of the range to be copied into a new table, None by default.
         * @param end The last index of the range to be copied into a new table, None by default.
         * @param step The step size used to iterate through the table, 1 by default.
         *
         * @result result1 The resulting table.
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
        ) -> result1: TaggedTable

        /**
         * Sort the columns of a `TaggedTable` with the given comparator and return a new `TaggedTable`.
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
         * The original table is not modified.
         *
         * @param comparator The function used to compare two columns.
         *
         * @result result1 A new table with sorted columns.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("sort_columns")
        fun sortColumns(
            comparator: (column1: Column, column2: Column) -> comparison: Int
        ) -> result1: TaggedTable

        /**
         * Sort the rows of a `TaggedTable` with the given comparator and return a new `TaggedTable`.
         *
         * The comparator is a function that takes two rows `row1` and `row2` and
         * returns an integer:
         *
         * * If the function returns a negative number, `row1` will be ordered before `row2`.
         * * If the function returns a positive number, `row1` will be ordered after `row2`.
         * * If the function returns 0, the original order of `row1` and `row2` will be kept.
         *
         * The original table is not modified.
         *
         * @param comparator The function used to compare two rows.
         *
         * @result result1 A new table with sorted rows.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("sort_rows")
        fun sortRows(
            comparator: (row1: Row, row2: Row) -> comparison: Int
        ) -> result1: TaggedTable

        /**
         * Return a new `TaggedTable` with the provided column transformed by calling the provided transformer.
         *
         * The original table is not modified.
         *
         * @result transformedTable The table with the transformed column.
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
        ) -> transformedTable: TaggedTable
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.containers.TaggedTable.columnNames data-toc-label='columnNames'}

Return a list of all column names in this table.

**Type:** [`List<String>`][safeds.lang.List]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val columnNames = table.columnNames; // ["a", "b"]
}
```

## `#!sds attr` features {#safeds.data.tabular.containers.TaggedTable.features data-toc-label='features'}

Get the feature columns of the tagged table.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds attr` numberOfColumns {#safeds.data.tabular.containers.TaggedTable.numberOfColumns data-toc-label='numberOfColumns'}

Return the number of columns.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val numberOfColumns = table.numberOfColumns; // 2
}
```

## `#!sds attr` numberOfRows {#safeds.data.tabular.containers.TaggedTable.numberOfRows data-toc-label='numberOfRows'}

Return the number of rows.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val numberOfRows = table.numberOfRows; // 2
}
```

## `#!sds attr` schema {#safeds.data.tabular.containers.TaggedTable.schema data-toc-label='schema'}

Return the schema of the table.

**Type:** [`Schema`][safeds.data.tabular.typing.Schema]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val `schema` = table.`schema`;
}
```

## `#!sds attr` target {#safeds.data.tabular.containers.TaggedTable.target data-toc-label='target'}

Get the target column of the tagged table.

**Type:** [`Column<Any?>`][safeds.data.tabular.containers.Column]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds fun` addColumn {#safeds.data.tabular.containers.TaggedTable.addColumn data-toc-label='addColumn'}

Return a new `TaggedTable` with the provided column attached at the end, as neither target nor feature column.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The table with the column attached as neither target nor feature column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="96"
    @Pure
    @PythonName("add_column")
    fun addColumn(
        column: Column
    ) -> result1: TaggedTable
    ```

## `#!sds fun` addColumnAsFeature {#safeds.data.tabular.containers.TaggedTable.addColumnAsFeature data-toc-label='addColumnAsFeature'}

Return a new table with the provided column attached at the end, as a feature column.

the original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The table with the attached feature column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="56"
    @Pure
    @PythonName("add_column_as_feature")
    fun addColumnAsFeature(
        column: Column
    ) -> result1: TaggedTable
    ```

## `#!sds fun` addColumns {#safeds.data.tabular.containers.TaggedTable.addColumns data-toc-label='addColumns'}

Return a new `TaggedTable` with multiple added columns, as neither target nor feature columns.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<List<Column<Any?>>, Table>` | The columns to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new table combining the original table and the given columns as neither target nor feature columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="116"
    @Pure
    @PythonName("add_columns")
    fun addColumns(
        columns: union<List<Column>, Table>
    ) -> result1: TaggedTable
    ```

## `#!sds fun` addColumnsAsFeatures {#safeds.data.tabular.containers.TaggedTable.addColumnsAsFeatures data-toc-label='addColumnsAsFeatures'}

Return a new `TaggedTable` with the provided columns attached at the end, as feature columns.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<List<Column<Any?>>, Table>` | The columns to be added as features. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The table with the attached feature columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="76"
    @Pure
    @PythonName("add_columns_as_features")
    fun addColumnsAsFeatures(
        columns: union<List<Column>, Table>
    ) -> result1: TaggedTable
    ```

## `#!sds fun` addRow {#safeds.data.tabular.containers.TaggedTable.addRow data-toc-label='addRow'}

Return a new `TaggedTable` with an added Row attached.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `row` | [`Row`][safeds.data.tabular.containers.Row] | The row to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new tagged table with the added row at the end. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="136"
    @Pure
    @PythonName("add_row")
    fun addRow(
        row: Row
    ) -> result1: TaggedTable
    ```

## `#!sds fun` addRows {#safeds.data.tabular.containers.TaggedTable.addRows data-toc-label='addRows'}

Return a new `TaggedTable` with multiple added Rows attached.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `rows` | `#!sds union<List<Row>, Table>` | The rows to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new tagged table which combines the original table and the given rows. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="156"
    @Pure
    @PythonName("add_rows")
    fun addRows(
        rows: union<List<Row>, Table>
    ) -> result1: TaggedTable
    ```

## `#!sds fun` filterRows {#safeds.data.tabular.containers.TaggedTable.filterRows data-toc-label='filterRows'}

Return a new `TaggedTable` containing only rows that match the given Callable (e.g. lambda function).

The original tagged table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `query` | `#!sds (row: Row) -> (matches: Boolean)` | A Callable that is applied to all rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new tagged table containing only the rows to match the query. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="176"
    @Pure
    @PythonName("filter_rows")
    fun filterRows(
        query: (row: Row) -> matches: Boolean
    ) -> result1: TaggedTable
    ```

## `#!sds fun` getColumn {#safeds.data.tabular.containers.TaggedTable.getColumn data-toc-label='getColumn'}

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

    ```sds linenums="202"
    @Pure
    @PythonName("get_column")
    fun getColumn(
        @PythonName("column_name") columnName: String
    ) -> column: Column
    ```

## `#!sds fun` getColumnType {#safeds.data.tabular.containers.TaggedTable.getColumnType data-toc-label='getColumnType'}

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

    ```sds linenums="240"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        @PythonName("column_name") columnName: String
    ) -> type: ColumnType
    ```

## `#!sds fun` getRow {#safeds.data.tabular.containers.TaggedTable.getRow data-toc-label='getRow'}

Return the row at a specified index.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `index` | [`Int`][safeds.lang.Int] | The index. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `row` | [`Row`][safeds.data.tabular.containers.Row] | The row of the table at the index. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val row = table.getRow(0); // Row({"a": 1, "b": 3})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="259"
    @Pure
    @PythonName("get_row")
    fun getRow(
        index: Int
    ) -> row: Row
    ```

## `#!sds fun` groupRows {#safeds.data.tabular.containers.TaggedTable.groupRows data-toc-label='groupRows'}

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

    ```sds linenums="442"
    @Pure
    @PythonName("group_rows_by")
    fun groupRows<T>(
        @PythonName("key_selector") keySelector: (row: Row) -> key: T
    ) -> tablesByKey: Map<T, Table>
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.containers.TaggedTable.hasColumn data-toc-label='hasColumn'}

Return whether the table contains a given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `hasColumn` | [`Boolean`][safeds.lang.Boolean] | True if the column exists. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val hasColumn = table.hasColumn("a"); // true
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="221"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        @PythonName("column_name") columnName: String
    ) -> hasColumn: Boolean
    ```

## `#!sds fun` inverseTransformTable {#safeds.data.tabular.containers.TaggedTable.inverseTransformTable data-toc-label='inverseTransformTable'}

Return a new `Table` with the inverted transformation applied by the given transformer.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformer` | [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer] | A transformer that was fitted with columns, which are all present in the table. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `originalTable` | [`Table`][safeds.data.tabular.containers.Table] | The original table. |

**Examples:**

```sds hl_lines="5"
pipeline example {
    val table = Table({"a": ["z", "y"], "b": [3, 4]});
    val encoder = LabelEncoder().fit(table, ["a"]);
    val transformedTable = table.transformTable(encoder);
    val originalTable = transformedTable.inverseTransformTable(encoder);
    // Table({"a": ["z", "y"], "b": [3, 4]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="928"
    @Pure
    @PythonName("inverse_transform_table")
    fun inverseTransformTable(
        transformer: InvertibleTableTransformer
    ) -> originalTable: Table
    ```

## `#!sds fun` keepOnlyColumns {#safeds.data.tabular.containers.TaggedTable.keepOnlyColumns data-toc-label='keepOnlyColumns'}

Return a new `TaggedTable` with only the given column(s).

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>`][safeds.lang.List] | A list containing only the columns to be kept. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A table containing only the given column(s). |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="196"
    @Pure
    @PythonName("keep_only_columns")
    fun keepOnlyColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: TaggedTable
    ```

## `#!sds fun` plotBoxplots {#safeds.data.tabular.containers.TaggedTable.plotBoxplots data-toc-label='plotBoxplots'}

Plot a boxplot for every numerical column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `boxplots` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val boxplots = table.plotBoxplots();
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1005"
    @Pure
    @PythonName("plot_boxplots")
    fun plotBoxplots() -> boxplots: Image
    ```

## `#!sds fun` plotCorrelationHeatmap {#safeds.data.tabular.containers.TaggedTable.plotCorrelationHeatmap data-toc-label='plotCorrelationHeatmap'}

Plot a correlation heatmap for all numerical columns of this `Table`.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `correlationHeatmap` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val correlationHeatmap = table.plotCorrelationHeatmap();
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="945"
    @Pure
    @PythonName("plot_correlation_heatmap")
    fun plotCorrelationHeatmap() -> correlationHeatmap: Image
    ```

## `#!sds fun` plotHistograms {#safeds.data.tabular.containers.TaggedTable.plotHistograms data-toc-label='plotHistograms'}

Plot a histogram for every column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `histograms` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val histograms = table.plotHistograms();
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1020"
    @Pure
    @PythonName("plot_histograms")
    fun plotHistograms() -> histograms: Image
    ```

## `#!sds fun` plotLineplot {#safeds.data.tabular.containers.TaggedTable.plotLineplot data-toc-label='plotLineplot'}

Plot two columns against each other in a lineplot.

If there are multiple x-values for a y-value, the resulting plot will consist of a line representing the mean
and the lower-transparency area around the line representing the 95% confidence interval.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xColumnName` | [`String`][safeds.lang.String] | The column name of the column to be plotted on the x-Axis. | - |
| `yColumnName` | [`String`][safeds.lang.String] | The column name of the column to be plotted on the y-Axis. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `lineplot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val lineplot = table.plotLineplot("a", "b");
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="966"
    @Pure
    @PythonName("plot_lineplot")
    fun plotLineplot(
        @PythonName("x_column_name") xColumnName: String,
        @PythonName("y_column_name") yColumnName: String
    ) -> lineplot: Image
    ```

## `#!sds fun` plotScatterplot {#safeds.data.tabular.containers.TaggedTable.plotScatterplot data-toc-label='plotScatterplot'}

Plot two columns against each other in a scatterplot.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xColumnName` | [`String`][safeds.lang.String] | The column name of the column to be plotted on the x-Axis. | - |
| `yColumnName` | [`String`][safeds.lang.String] | The column name of the column to be plotted on the y-Axis. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `scatterplot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val scatterplot = table.plotScatterplot("a", "b");
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="987"
    @Pure
    @PythonName("plot_scatterplot")
    fun plotScatterplot(
        @PythonName("x_column_name") xColumnName: String,
        @PythonName("y_column_name") yColumnName: String
    ) -> scatterplot: Image
    ```

## `#!sds fun` removeColumns {#safeds.data.tabular.containers.TaggedTable.removeColumns data-toc-label='removeColumns'}

Return a new `TaggedTable` with the given column(s) removed from the table.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>`][safeds.lang.List] | The names of all columns to be dropped. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A table without the given columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="216"
    @Pure
    @PythonName("remove_columns")
    fun removeColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: TaggedTable
    ```

## `#!sds fun` removeColumnsWithMissingValues {#safeds.data.tabular.containers.TaggedTable.removeColumnsWithMissingValues data-toc-label='removeColumnsWithMissingValues'}

Return a new `TaggedTable` with every column that misses values removed.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A table without the columns that contain missing values. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="234"
    @Pure
    @PythonName("remove_columns_with_missing_values")
    fun removeColumnsWithMissingValues() -> result1: TaggedTable
    ```

## `#!sds fun` removeColumnsWithNonNumericalValues {#safeds.data.tabular.containers.TaggedTable.removeColumnsWithNonNumericalValues data-toc-label='removeColumnsWithNonNumericalValues'}

Return a new `TaggedTable` with every column that contains non-numerical values removed.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A table without the columns that contain non-numerical values. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="250"
    @Pure
    @PythonName("remove_columns_with_non_numerical_values")
    fun removeColumnsWithNonNumericalValues() -> result1: TaggedTable
    ```

## `#!sds fun` removeDuplicateRows {#safeds.data.tabular.containers.TaggedTable.removeDuplicateRows data-toc-label='removeDuplicateRows'}

Return a new `TaggedTable` with all row duplicates removed.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The table with the duplicate rows removed. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="266"
    @Pure
    @PythonName("remove_duplicate_rows")
    fun removeDuplicateRows() -> result1: TaggedTable
    ```

## `#!sds fun` removeRowsWithMissingValues {#safeds.data.tabular.containers.TaggedTable.removeRowsWithMissingValues data-toc-label='removeRowsWithMissingValues'}

Return a new `TaggedTable` without the rows that contain missing values.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A table without the rows that contain missing values. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="282"
    @Pure
    @PythonName("remove_rows_with_missing_values")
    fun removeRowsWithMissingValues() -> result1: TaggedTable
    ```

## `#!sds fun` removeRowsWithOutliers {#safeds.data.tabular.containers.TaggedTable.removeRowsWithOutliers data-toc-label='removeRowsWithOutliers'}

Return a new `TaggedTable` with all rows that contain at least one outlier removed.

We define an outlier as a value that has a distance of more than 3 standard deviations from the column mean.
Missing values are not considered outliers. They are also ignored during the calculation of the standard
deviation.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new table without rows containing outliers. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="302"
    @Pure
    @PythonName("remove_rows_with_outliers")
    fun removeRowsWithOutliers() -> result1: TaggedTable
    ```

## `#!sds fun` renameColumn {#safeds.data.tabular.containers.TaggedTable.renameColumn data-toc-label='renameColumn'}

Return a new `TaggedTable` with a single column renamed.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldName` | [`String`][safeds.lang.String] | The old name of the target column. | - |
| `newName` | [`String`][safeds.lang.String] | The new name of the target column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The Table with the renamed column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="321"
    @Pure
    @PythonName("rename_column")
    fun renameColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_name") newName: String
    ) -> result1: TaggedTable
    ```

## `#!sds fun` replaceColumn {#safeds.data.tabular.containers.TaggedTable.replaceColumn data-toc-label='replaceColumn'}

Return a new `TaggedTable` with the specified old column replaced by a list of new columns.

If the column to be replaced is the target column, it must be replaced by exactly one column. That column
becomes the new target column. If the column to be replaced is a feature column, the new columns that replace it
all become feature columns.

The order of columns is kept. The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldColumnName` | [`String`][safeds.lang.String] | The name of the column to be replaced. | - |
| `newColumns` | [`List<Column<Any?>>`][safeds.lang.List] | The new columns replacing the old column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A table with the old column replaced by the new column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="347"
    @Pure
    @PythonName("replace_column")
    fun replaceColumn(
        @PythonName("old_column_name") oldColumnName: String,
        @PythonName("new_columns") newColumns: List<Column>
    ) -> result1: TaggedTable
    ```

## `#!sds fun` shuffleRows {#safeds.data.tabular.containers.TaggedTable.shuffleRows data-toc-label='shuffleRows'}

Return a new `TaggedTable` with randomly shuffled rows of this table.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The shuffled Table. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="366"
    @Pure
    @PythonName("shuffle_rows")
    fun shuffleRows() -> result1: TaggedTable
    ```

## `#!sds fun` sliceRows {#safeds.data.tabular.containers.TaggedTable.sliceRows data-toc-label='sliceRows'}

Slice a part of the table into a new `TaggedTable`.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `start` | [`Int?`][safeds.lang.Int] | The first index of the range to be copied into a new table, None by default. | `#!sds null` |
| `end` | [`Int?`][safeds.lang.Int] | The last index of the range to be copied into a new table, None by default. | `#!sds null` |
| `step` | [`Int`][safeds.lang.Int] | The step size used to iterate through the table, 1 by default. | `#!sds 1` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The resulting table. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="386"
    @Pure
    @PythonName("slice_rows")
    fun sliceRows(
        start: Int? = null,
        end: Int? = null,
        step: Int = 1
    ) -> result1: TaggedTable
    ```

## `#!sds fun` sortColumns {#safeds.data.tabular.containers.TaggedTable.sortColumns data-toc-label='sortColumns'}

Sort the columns of a `TaggedTable` with the given comparator and return a new `TaggedTable`.

The comparator is a function that takes two columns `col1` and `col2` and
returns an integer:

* If the function returns a negative number, `col1` will be ordered before `col2`.
* If the function returns a positive number, `col1` will be ordered after `col2`.
* If the function returns 0, the original order of `col1` and `col2` will be kept.

If no comparator is given, the columns will be sorted alphabetically by their name.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `comparator` | `#!sds (column1: Column<Any?>, column2: Column<Any?>) -> (comparison: Int)` | The function used to compare two columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new table with sorted columns. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="417"
    @Pure
    @PythonName("sort_columns")
    fun sortColumns(
        comparator: (column1: Column, column2: Column) -> comparison: Int
    ) -> result1: TaggedTable
    ```

## `#!sds fun` sortRows {#safeds.data.tabular.containers.TaggedTable.sortRows data-toc-label='sortRows'}

Sort the rows of a `TaggedTable` with the given comparator and return a new `TaggedTable`.

The comparator is a function that takes two rows `row1` and `row2` and
returns an integer:

* If the function returns a negative number, `row1` will be ordered before `row2`.
* If the function returns a positive number, `row1` will be ordered after `row2`.
* If the function returns 0, the original order of `row1` and `row2` will be kept.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `comparator` | `#!sds (row1: Row, row2: Row) -> (comparison: Int)` | The function used to compare two rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new table with sorted rows. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="444"
    @Pure
    @PythonName("sort_rows")
    fun sortRows(
        comparator: (row1: Row, row2: Row) -> comparison: Int
    ) -> result1: TaggedTable
    ```

## `#!sds fun` splitRows {#safeds.data.tabular.containers.TaggedTable.splitRows data-toc-label='splitRows'}

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

    ```sds linenums="812"
    @Pure
    @PythonName("split_rows")
    fun splitRows(
        @PythonName("percentage_in_first") ratioInFirst: Float
    ) -> (first: Table, second: Table)
    ```

## `#!sds fun` summarizeStatistics {#safeds.data.tabular.containers.TaggedTable.summarizeStatistics data-toc-label='summarizeStatistics'}

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

    ```sds linenums="278"
    @Pure
    @PythonName("summarize_statistics")
    fun summarizeStatistics() -> statistics: Table
    ```

## `#!sds fun` tagColumns {#safeds.data.tabular.containers.TaggedTable.tagColumns data-toc-label='tagColumns'}

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

    ```sds linenums="851"
    @Pure
    @PythonName("tag_columns")
    fun tagColumns(
        @PythonName("target_name") targetName: String,
        @PythonName("feature_names") featureNames: List<String>? = null
    ) -> taggedTable: TaggedTable
    ```

## `#!sds fun` toColumns {#safeds.data.tabular.containers.TaggedTable.toColumns data-toc-label='toColumns'}

Return a list of the columns.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `columns` | [`List<Column<Any?>>`][safeds.lang.List] | List of columns. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val columns = table.toColumns();
    // [Column("a", [1, 2]), Column("b", [3, 4])]
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1128"
    @Pure
    @PythonName("to_columns")
    fun toColumns() -> columns: List<Column>
    ```

## `#!sds fun` toCsvFile {#safeds.data.tabular.containers.TaggedTable.toCsvFile data-toc-label='toCsvFile'}

Write the data from the table into a CSV file.

If the file and/or the directories do not exist they will be created. If the file already exists it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    table.toCsvFile("path/to/file.csv");
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1038"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_csv_file")
    fun toCsvFile(
        path: String
    )
    ```

## `#!sds fun` toExcelFile {#safeds.data.tabular.containers.TaggedTable.toExcelFile data-toc-label='toExcelFile'}

Write the data from the table into an Excel file.

Valid file extensions are `.xls`, '.xlsx', `.xlsm`, `.xlsb`, `.odf`, `.ods` and `.odt`.
If the file and/or the directories do not exist, they will be created. If the file already exists, it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    table.toExcelFile("path/to/file.xlsx");
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1059"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_excel_file")
    fun toExcelFile(
        path: String
    )
    ```

## `#!sds fun` toHtml {#safeds.data.tabular.containers.TaggedTable.toHtml data-toc-label='toHtml'}

Return an HTML representation of the table.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `html` | [`String`][safeds.lang.String] | The generated HTML. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val html = table.toHtml();
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1112"
    @Pure
    @PythonName("to_html")
    fun toHtml() -> html: String
    ```

## `#!sds fun` toJsonFile {#safeds.data.tabular.containers.TaggedTable.toJsonFile data-toc-label='toJsonFile'}

Write the data from the table into a JSON file.

If the file and/or the directories do not exist, they will be created. If the file already exists it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    table.toJsonFile("path/to/file.json");
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1079"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_json_file")
    fun toJsonFile(
        path: String
    )
    ```

## `#!sds fun` toMap {#safeds.data.tabular.containers.TaggedTable.toMap data-toc-label='toMap'}

Return a map of column names to column values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `map` | [`Map<String, List<Any?>>`][safeds.lang.Map] | Map representation of the table. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val map = table.toMap();
    // {"a": [1, 2], "b": [3, 4]}
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1097"
    @Pure
    @PythonName("to_dict")
    fun toMap() -> map: Map<String, List<Any?>>
    ```

## :test_tube:{ title="Experimental" } `#!sds fun` toRows {#safeds.data.tabular.containers.TaggedTable.toRows data-toc-label='toRows'}

Return a list of the rows.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `rows` | [`List<Row>`][safeds.lang.List] | List of rows. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val rows = table.toRows();
    // [Row({"a": 1, "b": 3}), Row({"a": 2, "b": 4})]
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="1144"
    @Experimental
    @Pure
    @PythonName("to_rows")
    fun toRows() -> rows: List<Row>
    ```

## `#!sds fun` transformColumn {#safeds.data.tabular.containers.TaggedTable.transformColumn data-toc-label='transformColumn'}

Return a new `TaggedTable` with the provided column transformed by calling the provided transformer.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | - | - |
| `transformer` | `#!sds (row: Row) -> (newColumnValue: Any?)` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedTable` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The table with the transformed column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="462"
    @Pure
    @PythonName("transform_column")
    fun transformColumn(
        name: String,
        transformer: (row: Row) -> newColumnValue: Any?
    ) -> transformedTable: TaggedTable
    ```

## `#!sds fun` transformTable {#safeds.data.tabular.containers.TaggedTable.transformTable data-toc-label='transformTable'}

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

    ```sds linenums="904"
    @Pure
    @PythonName("transform_table")
    fun transformTable(
        transformer: TableTransformer
    ) -> transformedTable: Table
    ```