# `#!sds class` TaggedTable {#safeds.data.tabular.containers.TaggedTable data-toc-label='TaggedTable'}

A tagged table is a table that additionally knows which columns are features and which are the target to predict.

**Parent type:** [`Table`][safeds.data.tabular.containers.Table]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>`][safeds.lang.Map] | The data. | - |
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `featureNames` | [`List<String>?`][safeds.lang.List] | Names of the feature columns. If None, all columns except the target column are used. | `#!sds null` |

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="12"
    class TaggedTable(
        data: Map<String, List<Any>>,
        @PythonName("target_name") targetName: String,
        @PythonName("feature_names") featureNames: List<String>? = null
    ) sub Table {
        /**
         * Get the feature columns of the tagged table.
         */
        attr features: Table
        /**
         * Get the target column of the tagged table.
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
         */
        @Pure
        @PythonName("filter_rows")
        fun filterRows(
            query: (param1: Row) -> param2: Boolean
        ) -> result1: TaggedTable
    
        /**
         * Return a new `TaggedTable` with only the given column(s).
         *
         * The original table is not modified.
         *
         * @param columnNames A list containing only the columns to be kept.
         *
         * @result result1 A table containing only the given column(s).
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
         */
        @Pure
        @PythonName("sort_columns")
        fun sortColumns(
            comparator: (param1: Column, param2: Column) -> param3: Int
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
         */
        @Pure
        @PythonName("sort_rows")
        fun sortRows(
            comparator: (param1: Row, param2: Row) -> param3: Int
        ) -> result1: TaggedTable
    
        /**
         * Return a new `TaggedTable` with the provided column transformed by calling the provided transformer.
         *
         * The original table is not modified.
         *
         * @result result1 The table with the transformed column.
         */
        @Pure
        @PythonName("transform_column")
        fun transformColumn(
            name: String,
            transformer: (param1: Row) -> param2: Any
        ) -> result1: TaggedTable
    }
    ```

## `#!sds attr` features {#safeds.data.tabular.containers.TaggedTable.features data-toc-label='features'}

Get the feature columns of the tagged table.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

## `#!sds attr` target {#safeds.data.tabular.containers.TaggedTable.target data-toc-label='target'}

Get the target column of the tagged table.

**Type:** [`Column<Any?>`][safeds.data.tabular.containers.Column]

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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="65"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="35"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="80"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="50"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="95"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="110"
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
| `query` | `#!sds (param1: Row) -> (param2: Boolean)` | A Callable that is applied to all rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new tagged table containing only the rows to match the query. |

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="125"
    @Pure
    @PythonName("filter_rows")
    fun filterRows(
        query: (param1: Row) -> param2: Boolean
    ) -> result1: TaggedTable
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="140"
    @Pure
    @PythonName("keep_only_columns")
    fun keepOnlyColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: TaggedTable
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="155"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="168"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="179"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="190"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="201"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="216"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="230"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="251"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="265"
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

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="280"
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
| `comparator` | `#!sds (param1: Column<Any?>, param2: Column<Any?>) -> (param3: Int)` | The function used to compare two columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new table with sorted columns. |

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="306"
    @Pure
    @PythonName("sort_columns")
    fun sortColumns(
        comparator: (param1: Column, param2: Column) -> param3: Int
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
| `comparator` | `#!sds (param1: Row, param2: Row) -> (param3: Int)` | The function used to compare two rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new table with sorted rows. |

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="328"
    @Pure
    @PythonName("sort_rows")
    fun sortRows(
        comparator: (param1: Row, param2: Row) -> param3: Int
    ) -> result1: TaggedTable
    ```

## `#!sds fun` transformColumn {#safeds.data.tabular.containers.TaggedTable.transformColumn data-toc-label='transformColumn'}

Return a new `TaggedTable` with the provided column transformed by calling the provided transformer.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | - | - |
| `transformer` | `#!sds (param1: Row) -> (param2: Any)` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | The table with the transformed column. |

??? quote "Stub code in `tagged_table.sdsstub`"

    ```sds linenums="341"
    @Pure
    @PythonName("transform_column")
    fun transformColumn(
        name: String,
        transformer: (param1: Row) -> param2: Any
    ) -> result1: TaggedTable
    ```
