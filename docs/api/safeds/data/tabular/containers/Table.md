# `#!sds class` Table {#safeds.data.tabular.containers.Table data-toc-label='Table'}

A table is a two-dimensional collection of data. It can either be seen as a list of rows or as a list of columns.

To create a `Table` call the constructor or use one of the following static methods:

| Method                     | Description                            |
| -------------------------- | -------------------------------------- |
| [Table.fromCsvFile][safeds.data.tabular.containers.Table.fromCsvFile]  | Create a table from a CSV file.        |
| [Table.fromJsonFile][safeds.data.tabular.containers.Table.fromJsonFile] | Create a table from a JSON file.       |
| [Table.fromDict][safeds.data.tabular.containers.Table.fromDict]     | Create a table from a dictionary.      |
| [Table.fromColumns][safeds.data.tabular.containers.Table.fromColumns]  | Create a table from a list of columns. |
| [Table.fromRows][safeds.data.tabular.containers.Table.fromRows]     | Create a table from a list of rows.    |

Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>?`][safeds.lang.Map] | The data. If None, an empty table is created. | `#!sds null` |

**Inheritors:**

- [`TaggedTable`][safeds.data.tabular.containers.TaggedTable]
- [`TimeSeries`][safeds.data.tabular.containers.TimeSeries]

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="25"
    class Table(
        data: Map<String, List<Any>>? = null // TODO: update default value to empty map
    ) {
        /**
         * Return a list of all column names in this table.
         *
         * Alias for self.schema.column_names -> list[str].
         */
        @PythonName("column_names") attr columnNames: List<String>
        /**
         * Return the number of columns.
         */
        @PythonName("number_of_columns") attr numberOfColumns: Int
        /**
         * Return the number of rows.
         */
        @PythonName("number_of_rows") attr numberOfRows: Int
        /**
         * Return the schema of the table.
         */
        attr `schema`: Schema
    
        /**
         * Read data from a CSV file into a table.
         *
         * @param path The path to the CSV file.
         *
         * @result result1 The table created from the CSV file.
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_csv_file")
        static fun fromCsvFile(
            path: String
        ) -> result1: Table
    
        /**
         * Read data from an Excel file into a table.
         *
         * Valid file extensions are `.xls`, `.xlsx`, `.xlsm`, `.xlsb`, `.odf`, `.ods` and `.odt`.
         *
         * @param path The path to the Excel file.
         *
         * @result result1 The table created from the Excel file.
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_excel_file")
        static fun fromExcelFile(
            path: String
        ) -> result1: Table
    
        /**
         * Read data from a JSON file into a table.
         *
         * @param path The path to the JSON file.
         *
         * @result result1 The table created from the JSON file.
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_json_file")
        static fun fromJsonFile(
            path: String
        ) -> result1: Table
    
        /**
         * Create a table from a dictionary that maps column names to column values.
         *
         * @param data The data.
         *
         * @result result1 The generated table.
         */
        @Pure
        @PythonName("from_dict")
        static fun fromDict(
            data: Map<String, List<Any>>
        ) -> result1: Table
    
        /**
         * Return a table created from a list of columns.
         *
         * @param columns The columns to be combined. They need to have the same size.
         *
         * @result result1 The generated table.
         */
        @Pure
        @PythonName("from_columns")
        static fun fromColumns(
            columns: List<Column>
        ) -> result1: Table
    
        /**
         * Return a table created from a list of rows.
         *
         * @param rows The rows to be combined. They need to have a matching schema.
         *
         * @result result1 The generated table.
         */
        @Pure
        @PythonName("from_rows")
        static fun fromRows(
            rows: List<Row>
        ) -> result1: Table
    
        /**
         * Return a column with the data of the specified column.
         *
         * @param columnName The name of the column.
         *
         * @result result1 The column.
         */
        @Pure
        @PythonName("get_column")
        fun getColumn(
            @PythonName("column_name") columnName: String
        ) -> result1: Column
    
        /**
         * Return whether the table contains a given column.
         *
         * Alias for self.schema.hasColumn(column_name: str) -> bool.
         *
         * @param columnName The name of the column.
         *
         * @result result1 True if the column exists.
         */
        @Pure
        @PythonName("has_column")
        fun hasColumn(
            @PythonName("column_name") columnName: String
        ) -> result1: Boolean
    
        /**
         * Return the type of the given column.
         *
         * Alias for self.schema.get_type_of_column(column_name: str) -> ColumnType.
         *
         * @param columnName The name of the column to be queried.
         *
         * @result result1 The type of the column.
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            @PythonName("column_name") columnName: String
        ) -> result1: ColumnType
    
        /**
         * Return the row at a specified index.
         *
         * @param index The index.
         *
         * @result result1 The row of the table at the index.
         */
        @Pure
        @PythonName("get_row")
        fun getRow(
            index: Int
        ) -> result1: Row
    
        /**
         * Return a table with a number of statistical key values.
         *
         * The original table is not modified.
         *
         * @result result1 The table with statistics.
         */
        @Pure
        @PythonName("summarize_statistics")
        fun summarizeStatistics() -> result1: Table
    
        /**
         * Return a new table with the provided column attached at the end.
         *
         * The original table is not modified.
         *
         * @result result1 The table with the column attached.
         */
        @Pure
        @PythonName("add_column")
        fun addColumn(
            column: Column
        ) -> result1: Table
    
        /**
         * Return a new `Table` with multiple added columns.
         *
         * The original table is not modified.
         *
         * @param columns The columns to be added.
         *
         * @result result1 A new table combining the original table and the given columns.
         */
        @Pure
        @PythonName("add_columns")
        fun addColumns(
            columns: union<List<Column>, Table>
        ) -> result1: Table
    
        /**
         * Return a new `Table` with an added Row attached.
         *
         * If the table happens to be empty beforehand, respective columns will be added automatically.
         *
         * The order of columns of the new row will be adjusted to the order of columns in the table.
         * The new table will contain the merged schema.
         *
         * The original table is not modified.
         *
         * @param row The row to be added.
         *
         * @result result1 A new table with the added row at the end.
         */
        @Pure
        @PythonName("add_row")
        fun addRow(
            row: Row
        ) -> result1: Table
    
        /**
         * Return a new `Table` with multiple added Rows attached.
         *
         * The order of columns of the new rows will be adjusted to the order of columns in the table.
         * The new table will contain the merged schema.
         *
         * The original table is not modified.
         *
         * @param rows The rows to be added.
         *
         * @result result1 A new table which combines the original table and the given rows.
         */
        @Pure
        @PythonName("add_rows")
        fun addRows(
            rows: union<List<Row>, Table>
        ) -> result1: Table
    
        /**
         * Return a new table with rows filtered by Callable (e.g. lambda function).
         *
         * The original table is not modified.
         *
         * @param query A Callable that is applied to all rows.
         *
         * @result result1 A table containing only the rows filtered by the query.
         */
        @Pure
        @PythonName("filter_rows")
        fun filterRows(
            query: (param1: Row) -> param2: Boolean
        ) -> result1: Table
    
        /**
         * Return a dictionary with copies of the output tables as values and the keys from the key_selector.
         *
         * The original table is not modified.
         *
         * @param keySelector A Callable that is applied to all rows and returns the key of the group.
         *
         * @result result1 A dictionary containing the new tables as values and the selected keys as keys.
         */
        @Pure
        @PythonName("group_rows_by")
        fun groupRowsBy<T>(
            @PythonName("key_selector") keySelector: (param1: Row) -> param2: T
        ) -> result1: Map<T, Table>
    
        /**
         * Return a new table with only the given column(s).
         *
         * The original table is not modified.
         *
         * Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.
         *
         * @param columnNames A list containing only the columns to be kept.
         *
         * @result result1 A table containing only the given column(s).
         */
        @Pure
        @PythonName("keep_only_columns")
        fun keepOnlyColumns(
            @PythonName("column_names") columnNames: List<String>
        ) -> result1: Table
    
        /**
         * Return a new table without the given column(s).
         *
         * The original table is not modified.
         *
         * Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.
         *
         * @param columnNames A list containing all columns to be dropped.
         *
         * @result result1 A table without the given columns.
         */
        @Pure
        @PythonName("remove_columns")
        fun removeColumns(
            @PythonName("column_names") columnNames: List<String>
        ) -> result1: Table
    
        /**
         * Return a new table without the columns that contain missing values.
         *
         * The original table is not modified.
         *
         * Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.
         *
         * @result result1 A table without the columns that contain missing values.
         */
        @Pure
        @PythonName("remove_columns_with_missing_values")
        fun removeColumnsWithMissingValues() -> result1: Table
    
        /**
         * Return a new table without the columns that contain non-numerical values.
         *
         * The original table is not modified.
         *
         * Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.
         *
         * @result result1 A table without the columns that contain non-numerical values.
         */
        @Pure
        @PythonName("remove_columns_with_non_numerical_values")
        fun removeColumnsWithNonNumericalValues() -> result1: Table
    
        /**
         * Return a new table with every duplicate row removed.
         *
         * The original table is not modified.
         *
         * @result result1 The table with the duplicate rows removed.
         */
        @Pure
        @PythonName("remove_duplicate_rows")
        fun removeDuplicateRows() -> result1: Table
    
        /**
         * Return a new table without the rows that contain missing values.
         *
         * The original table is not modified.
         *
         * @result result1 A table without the rows that contain missing values.
         */
        @Pure
        @PythonName("remove_rows_with_missing_values")
        fun removeRowsWithMissingValues() -> result1: Table
    
        /**
         * Return a new table without those rows that contain at least one outlier.
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
        fun removeRowsWithOutliers() -> result1: Table
    
        /**
         * Return a new `Table` with a single column renamed.
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
        ) -> result1: Table
    
        /**
         * Return a new table with the specified old column replaced by a list of new columns.
         *
         * The order of columns is kept.
         *
         * The original table is not modified.
         *
         * @param oldColumnName The name of the column to be replaced.
         * @param newColumns The list of new columns replacing the old column.
         *
         * @result result1 A table with the old column replaced by the new columns.
         */
        @Pure
        @PythonName("replace_column")
        fun replaceColumn(
            @PythonName("old_column_name") oldColumnName: String,
            @PythonName("new_columns") newColumns: List<Column>
        ) -> result1: Table
    
        /**
         * Return a new `Table` with randomly shuffled rows of this `Table`.
         *
         * The original table is not modified.
         *
         * @result result1 The shuffled Table.
         */
        @Pure
        @PythonName("shuffle_rows")
        fun shuffleRows() -> result1: Table
    
        /**
         * Slice a part of the table into a new table.
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
        ) -> result1: Table
    
        /**
         * Sort the columns of a `Table` with the given comparator and return a new `Table`.
         *
         * The comparator is a function that takes two columns `col1` and `col2` and
         * returns an integer:
         *
         * * If `col1` should be ordered before `col2`, the function should return a negative number.
         * * If `col1` should be ordered after `col2`, the function should return a positive number.
         * * If the original order of `col1` and `col2` should be kept, the function should return 0.
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
        ) -> result1: Table
    
        /**
         * Sort the rows of a `Table` with the given comparator and return a new `Table`.
         *
         * The comparator is a function that takes two rows `row1` and `row2` and
         * returns an integer:
         *
         * * If `row1` should be ordered before `row2`, the function should return a negative number.
         * * If `row1` should be ordered after `row2`, the function should return a positive number.
         * * If the original order of `row1` and `row2` should be kept, the function should return 0.
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
        ) -> result1: Table
    
        /**
         * Split the table into two new tables.
         *
         * The original table is not modified.
         *
         * @param percentageInFirst The desired size of the first table in percentage to the given table; must be between 0 and 1.
         *
         * @result result1 A tuple containing the two resulting tables. The first table has the specified size, the second table
         * contains the rest of the data.
         * @result result2 A tuple containing the two resulting tables. The first table has the specified size, the second table
         * contains the rest of the data.
         */
        @Pure
        @PythonName("split_rows")
        fun splitRows(
            @PythonName("percentage_in_first") percentageInFirst: Float
        ) -> (result1: Table, result2: Table)
    
        /**
         * Return a new `TaggedTable` with columns marked as a target column or feature columns.
         *
         * The original table is not modified.
         *
         * @param targetName Name of the target column.
         * @param featureNames Names of the feature columns. If None, all columns except the target column are used.
         *
         * @result result1 A new tagged table with the given target and feature names.
         */
        @Pure
        @PythonName("tag_columns")
        fun tagColumns(
            @PythonName("target_name") targetName: String,
            @PythonName("feature_names") featureNames: List<String>? = null
        ) -> result1: TaggedTable
    
        /**
         * Return a new `TimeSeries` with columns marked as a target and time column or feature columns.
         *
         * The original table is not modified.
         *
         * @param targetName Name of the target column.
         * @param timeName Name of the time column.
         * @param featureNames Names of the feature columns. If None, all columns except the target and time columns are used.
         *
         * @result result1 A new time series with the given target, time and feature names.
         */
        @Pure
        @PythonName("time_columns")
        fun timeColumns(
            @PythonName("target_name") targetName: String,
            @PythonName("time_name") timeName: String,
            @PythonName("feature_names") featureNames: List<String>? = null
        ) -> result1: TimeSeries
    
        /**
         * Return a new `Table` with the provided column transformed by calling the provided transformer.
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
        ) -> result1: Table
    
        /**
         * Return a new `Table` with a learned transformation applied to this table.
         *
         * The original table is not modified.
         *
         * @param transformer The transformer which transforms the given table.
         *
         * @result result1 The transformed table.
         */
        @Pure
        @PythonName("transform_table")
        fun transformTable(
            transformer: TableTransformer
        ) -> result1: Table
    
        /**
         * Return a new `Table` with the inverted transformation applied by the given transformer.
         *
         * The original table is not modified.
         *
         * @param transformer A transformer that was fitted with columns, which are all present in the table.
         *
         * @result result1 The original table.
         */
        @Pure
        @PythonName("inverse_transform_table")
        fun inverseTransformTable(
            transformer: InvertibleTableTransformer
        ) -> result1: Table
    
        /**
         * Plot a correlation heatmap for all numerical columns of this `Table`.
         *
         * @result result1 The plot as an image.
         */
        @Pure
        @PythonName("plot_correlation_heatmap")
        fun plotCorrelationHeatmap() -> result1: Image
    
        /**
         * Plot two columns against each other in a lineplot.
         *
         * If there are multiple x-values for a y-value, the resulting plot will consist of a line representing the mean
         * and the lower-transparency area around the line representing the 95% confidence interval.
         *
         * @param xColumnName The column name of the column to be plotted on the x-Axis.
         * @param yColumnName The column name of the column to be plotted on the y-Axis.
         *
         * @result result1 The plot as an image.
         */
        @Pure
        @PythonName("plot_lineplot")
        fun plotLineplot(
            @PythonName("x_column_name") xColumnName: String,
            @PythonName("y_column_name") yColumnName: String
        ) -> result1: Image
    
        /**
         * Plot two columns against each other in a scatterplot.
         *
         * @param xColumnName The column name of the column to be plotted on the x-Axis.
         * @param yColumnName The column name of the column to be plotted on the y-Axis.
         *
         * @result result1 The plot as an image.
         */
        @Pure
        @PythonName("plot_scatterplot")
        fun plotScatterplot(
            @PythonName("x_column_name") xColumnName: String,
            @PythonName("y_column_name") yColumnName: String
        ) -> result1: Image
    
        /**
         * Plot a boxplot for every numerical column.
         *
         * @result result1 The plot as an image.
         */
        @Pure
        @PythonName("plot_boxplots")
        fun plotBoxplots() -> result1: Image
    
        /**
         * Plot a histogram for every column.
         *
         * @result result1 The plot as an image.
         */
        @Pure
        @PythonName("plot_histograms")
        fun plotHistograms() -> result1: Image
    
        /**
         * Write the data from the table into a CSV file.
         *
         * If the file and/or the directories do not exist they will be created. If the file already exists it will be
         * overwritten.
         *
         * @param path The path to the output file.
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_csv_file")
        fun toCsvFile(
            path: String
        )
    
        /**
         * Write the data from the table into an Excel file.
         *
         * Valid file extensions are `.xls`, '.xlsx', `.xlsm`, `.xlsb`, `.odf`, `.ods` and `.odt`.
         * If the file and/or the directories do not exist, they will be created. If the file already exists, it will be
         * overwritten.
         *
         * @param path The path to the output file.
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_excel_file")
        fun toExcelFile(
            path: String
        )
    
        /**
         * Write the data from the table into a JSON file.
         *
         * If the file and/or the directories do not exist, they will be created. If the file already exists it will be
         * overwritten.
         *
         * @param path The path to the output file.
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_json_file")
        fun toJsonFile(
            path: String
        )
    
        /**
         * Return a dictionary that maps column names to column values.
         *
         * @result result1 Dictionary representation of the table.
         */
        @Pure
        @PythonName("to_dict")
        fun toDict() -> result1: Map<String, List<Any>>
    
        /**
         * Return an HTML representation of the table.
         *
         * @result result1 The generated HTML.
         */
        @Pure
        @PythonName("to_html")
        fun toHtml() -> result1: String
    
        /**
         * Return a list of the columns.
         *
         * @result result1 List of columns.
         */
        @Pure
        @PythonName("to_columns")
        fun toColumns() -> result1: List<Column>
    
        /**
         * Return a list of the rows.
         *
         * @result result1 List of rows.
         */
        @Pure
        @PythonName("to_rows")
        fun toRows() -> result1: List<Row>
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.containers.Table.columnNames data-toc-label='columnNames'}

Return a list of all column names in this table.

Alias for self.schema.column_names -> list[str].

**Type:** [`List<String>`][safeds.lang.List]

## `#!sds attr` numberOfColumns {#safeds.data.tabular.containers.Table.numberOfColumns data-toc-label='numberOfColumns'}

Return the number of columns.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` numberOfRows {#safeds.data.tabular.containers.Table.numberOfRows data-toc-label='numberOfRows'}

Return the number of rows.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` schema {#safeds.data.tabular.containers.Table.schema data-toc-label='schema'}

Return the schema of the table.

**Type:** [`Schema`][safeds.data.tabular.typing.Schema]

## `#!sds fun` addColumn {#safeds.data.tabular.containers.Table.addColumn data-toc-label='addColumn'}

Return a new table with the provided column attached at the end.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The table with the column attached. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="201"
    @Pure
    @PythonName("add_column")
    fun addColumn(
        column: Column
    ) -> result1: Table
    ```

## `#!sds fun` addColumns {#safeds.data.tabular.containers.Table.addColumns data-toc-label='addColumns'}

Return a new `Table` with multiple added columns.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<List<Column<Any?>>, Table>` | The columns to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A new table combining the original table and the given columns. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="216"
    @Pure
    @PythonName("add_columns")
    fun addColumns(
        columns: union<List<Column>, Table>
    ) -> result1: Table
    ```

## `#!sds fun` addRow {#safeds.data.tabular.containers.Table.addRow data-toc-label='addRow'}

Return a new `Table` with an added Row attached.

If the table happens to be empty beforehand, respective columns will be added automatically.

The order of columns of the new row will be adjusted to the order of columns in the table.
The new table will contain the merged schema.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `row` | [`Row`][safeds.data.tabular.containers.Row] | The row to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A new table with the added row at the end. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="236"
    @Pure
    @PythonName("add_row")
    fun addRow(
        row: Row
    ) -> result1: Table
    ```

## `#!sds fun` addRows {#safeds.data.tabular.containers.Table.addRows data-toc-label='addRows'}

Return a new `Table` with multiple added Rows attached.

The order of columns of the new rows will be adjusted to the order of columns in the table.
The new table will contain the merged schema.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `rows` | `#!sds union<List<Row>, Table>` | The rows to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A new table which combines the original table and the given rows. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="254"
    @Pure
    @PythonName("add_rows")
    fun addRows(
        rows: union<List<Row>, Table>
    ) -> result1: Table
    ```

## `#!sds fun` filterRows {#safeds.data.tabular.containers.Table.filterRows data-toc-label='filterRows'}

Return a new table with rows filtered by Callable (e.g. lambda function).

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `query` | `#!sds (param1: Row) -> (param2: Boolean)` | A Callable that is applied to all rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A table containing only the rows filtered by the query. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="269"
    @Pure
    @PythonName("filter_rows")
    fun filterRows(
        query: (param1: Row) -> param2: Boolean
    ) -> result1: Table
    ```

## `#!sds fun` getColumn {#safeds.data.tabular.containers.Table.getColumn data-toc-label='getColumn'}

Return a column with the data of the specified column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="134"
    @Pure
    @PythonName("get_column")
    fun getColumn(
        @PythonName("column_name") columnName: String
    ) -> result1: Column
    ```

## `#!sds fun` getColumnType {#safeds.data.tabular.containers.Table.getColumnType data-toc-label='getColumnType'}

Return the type of the given column.

Alias for self.schema.get_type_of_column(column_name: str) -> ColumnType.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column to be queried. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`ColumnType`][safeds.data.tabular.typing.ColumnType] | The type of the column. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="164"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        @PythonName("column_name") columnName: String
    ) -> result1: ColumnType
    ```

## `#!sds fun` getRow {#safeds.data.tabular.containers.Table.getRow data-toc-label='getRow'}

Return the row at a specified index.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `index` | [`Int`][safeds.lang.Int] | The index. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Row`][safeds.data.tabular.containers.Row] | The row of the table at the index. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="177"
    @Pure
    @PythonName("get_row")
    fun getRow(
        index: Int
    ) -> result1: Row
    ```

## `#!sds fun` groupRowsBy {#safeds.data.tabular.containers.Table.groupRowsBy data-toc-label='groupRowsBy'}

Return a dictionary with copies of the output tables as values and the keys from the key_selector.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `keySelector` | `#!sds (param1: Row) -> (param2: T)` | A Callable that is applied to all rows and returns the key of the group. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Map<T, Table>`][safeds.lang.Map] | A dictionary containing the new tables as values and the selected keys as keys. |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `T` | [`Any?`][safeds.lang.Any] | - | - |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="284"
    @Pure
    @PythonName("group_rows_by")
    fun groupRowsBy<T>(
        @PythonName("key_selector") keySelector: (param1: Row) -> param2: T
    ) -> result1: Map<T, Table>
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.containers.Table.hasColumn data-toc-label='hasColumn'}

Return whether the table contains a given column.

Alias for self.schema.hasColumn(column_name: str) -> bool.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if the column exists. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="149"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        @PythonName("column_name") columnName: String
    ) -> result1: Boolean
    ```

## `#!sds fun` inverseTransformTable {#safeds.data.tabular.containers.Table.inverseTransformTable data-toc-label='inverseTransformTable'}

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

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="591"
    @Pure
    @PythonName("inverse_transform_table")
    fun inverseTransformTable(
        transformer: InvertibleTableTransformer
    ) -> result1: Table
    ```

## `#!sds fun` keepOnlyColumns {#safeds.data.tabular.containers.Table.keepOnlyColumns data-toc-label='keepOnlyColumns'}

Return a new table with only the given column(s).

The original table is not modified.

Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>`][safeds.lang.List] | A list containing only the columns to be kept. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A table containing only the given column(s). |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="301"
    @Pure
    @PythonName("keep_only_columns")
    fun keepOnlyColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: Table
    ```

## `#!sds fun` plotBoxplots {#safeds.data.tabular.containers.Table.plotBoxplots data-toc-label='plotBoxplots'}

Plot a boxplot for every numerical column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="644"
    @Pure
    @PythonName("plot_boxplots")
    fun plotBoxplots() -> result1: Image
    ```

## `#!sds fun` plotCorrelationHeatmap {#safeds.data.tabular.containers.Table.plotCorrelationHeatmap data-toc-label='plotCorrelationHeatmap'}

Plot a correlation heatmap for all numerical columns of this `Table`.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="602"
    @Pure
    @PythonName("plot_correlation_heatmap")
    fun plotCorrelationHeatmap() -> result1: Image
    ```

## `#!sds fun` plotHistograms {#safeds.data.tabular.containers.Table.plotHistograms data-toc-label='plotHistograms'}

Plot a histogram for every column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="653"
    @Pure
    @PythonName("plot_histograms")
    fun plotHistograms() -> result1: Image
    ```

## `#!sds fun` plotLineplot {#safeds.data.tabular.containers.Table.plotLineplot data-toc-label='plotLineplot'}

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
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="617"
    @Pure
    @PythonName("plot_lineplot")
    fun plotLineplot(
        @PythonName("x_column_name") xColumnName: String,
        @PythonName("y_column_name") yColumnName: String
    ) -> result1: Image
    ```

## `#!sds fun` plotScatterplot {#safeds.data.tabular.containers.Table.plotScatterplot data-toc-label='plotScatterplot'}

Plot two columns against each other in a scatterplot.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xColumnName` | [`String`][safeds.lang.String] | The column name of the column to be plotted on the x-Axis. | - |
| `yColumnName` | [`String`][safeds.lang.String] | The column name of the column to be plotted on the y-Axis. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="632"
    @Pure
    @PythonName("plot_scatterplot")
    fun plotScatterplot(
        @PythonName("x_column_name") xColumnName: String,
        @PythonName("y_column_name") yColumnName: String
    ) -> result1: Image
    ```

## `#!sds fun` removeColumns {#safeds.data.tabular.containers.Table.removeColumns data-toc-label='removeColumns'}

Return a new table without the given column(s).

The original table is not modified.

Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>`][safeds.lang.List] | A list containing all columns to be dropped. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A table without the given columns. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="318"
    @Pure
    @PythonName("remove_columns")
    fun removeColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: Table
    ```

## `#!sds fun` removeColumnsWithMissingValues {#safeds.data.tabular.containers.Table.removeColumnsWithMissingValues data-toc-label='removeColumnsWithMissingValues'}

Return a new table without the columns that contain missing values.

The original table is not modified.

Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A table without the columns that contain missing values. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="333"
    @Pure
    @PythonName("remove_columns_with_missing_values")
    fun removeColumnsWithMissingValues() -> result1: Table
    ```

## `#!sds fun` removeColumnsWithNonNumericalValues {#safeds.data.tabular.containers.Table.removeColumnsWithNonNumericalValues data-toc-label='removeColumnsWithNonNumericalValues'}

Return a new table without the columns that contain non-numerical values.

The original table is not modified.

Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A table without the columns that contain non-numerical values. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="346"
    @Pure
    @PythonName("remove_columns_with_non_numerical_values")
    fun removeColumnsWithNonNumericalValues() -> result1: Table
    ```

## `#!sds fun` removeDuplicateRows {#safeds.data.tabular.containers.Table.removeDuplicateRows data-toc-label='removeDuplicateRows'}

Return a new table with every duplicate row removed.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The table with the duplicate rows removed. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="357"
    @Pure
    @PythonName("remove_duplicate_rows")
    fun removeDuplicateRows() -> result1: Table
    ```

## `#!sds fun` removeRowsWithMissingValues {#safeds.data.tabular.containers.Table.removeRowsWithMissingValues data-toc-label='removeRowsWithMissingValues'}

Return a new table without the rows that contain missing values.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A table without the rows that contain missing values. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="368"
    @Pure
    @PythonName("remove_rows_with_missing_values")
    fun removeRowsWithMissingValues() -> result1: Table
    ```

## `#!sds fun` removeRowsWithOutliers {#safeds.data.tabular.containers.Table.removeRowsWithOutliers data-toc-label='removeRowsWithOutliers'}

Return a new table without those rows that contain at least one outlier.

We define an outlier as a value that has a distance of more than 3 standard deviations from the column mean.
Missing values are not considered outliers. They are also ignored during the calculation of the standard
deviation.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A new table without rows containing outliers. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="383"
    @Pure
    @PythonName("remove_rows_with_outliers")
    fun removeRowsWithOutliers() -> result1: Table
    ```

## `#!sds fun` renameColumn {#safeds.data.tabular.containers.Table.renameColumn data-toc-label='renameColumn'}

Return a new `Table` with a single column renamed.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldName` | [`String`][safeds.lang.String] | The old name of the target column. | - |
| `newName` | [`String`][safeds.lang.String] | The new name of the target column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The Table with the renamed column. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="397"
    @Pure
    @PythonName("rename_column")
    fun renameColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_name") newName: String
    ) -> result1: Table
    ```

## `#!sds fun` replaceColumn {#safeds.data.tabular.containers.Table.replaceColumn data-toc-label='replaceColumn'}

Return a new table with the specified old column replaced by a list of new columns.

The order of columns is kept.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldColumnName` | [`String`][safeds.lang.String] | The name of the column to be replaced. | - |
| `newColumns` | [`List<Column<Any?>>`][safeds.lang.List] | The list of new columns replacing the old column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A table with the old column replaced by the new columns. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="416"
    @Pure
    @PythonName("replace_column")
    fun replaceColumn(
        @PythonName("old_column_name") oldColumnName: String,
        @PythonName("new_columns") newColumns: List<Column>
    ) -> result1: Table
    ```

## `#!sds fun` shuffleRows {#safeds.data.tabular.containers.Table.shuffleRows data-toc-label='shuffleRows'}

Return a new `Table` with randomly shuffled rows of this `Table`.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The shuffled Table. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="430"
    @Pure
    @PythonName("shuffle_rows")
    fun shuffleRows() -> result1: Table
    ```

## `#!sds fun` sliceRows {#safeds.data.tabular.containers.Table.sliceRows data-toc-label='sliceRows'}

Slice a part of the table into a new table.

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
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The resulting table. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="445"
    @Pure
    @PythonName("slice_rows")
    fun sliceRows(
        start: Int? = null,
        end: Int? = null,
        step: Int = 1
    ) -> result1: Table
    ```

## `#!sds fun` sortColumns {#safeds.data.tabular.containers.Table.sortColumns data-toc-label='sortColumns'}

Sort the columns of a `Table` with the given comparator and return a new `Table`.

The comparator is a function that takes two columns `col1` and `col2` and
returns an integer:

* If `col1` should be ordered before `col2`, the function should return a negative number.
* If `col1` should be ordered after `col2`, the function should return a positive number.
* If the original order of `col1` and `col2` should be kept, the function should return 0.

If no comparator is given, the columns will be sorted alphabetically by their name.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `comparator` | `#!sds (param1: Column<Any?>, param2: Column<Any?>) -> (param3: Int)` | The function used to compare two columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A new table with sorted columns. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="471"
    @Pure
    @PythonName("sort_columns")
    fun sortColumns(
        comparator: (param1: Column, param2: Column) -> param3: Int
    ) -> result1: Table
    ```

## `#!sds fun` sortRows {#safeds.data.tabular.containers.Table.sortRows data-toc-label='sortRows'}

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
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A new table with sorted rows. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="493"
    @Pure
    @PythonName("sort_rows")
    fun sortRows(
        comparator: (param1: Row, param2: Row) -> param3: Int
    ) -> result1: Table
    ```

## `#!sds fun` splitRows {#safeds.data.tabular.containers.Table.splitRows data-toc-label='splitRows'}

Split the table into two new tables.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `percentageInFirst` | [`Float`][safeds.lang.Float] | The desired size of the first table in percentage to the given table; must be between 0 and 1. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | A tuple containing the two resulting tables. The first table has the specified size, the second table contains the rest of the data. |
| `result2` | [`Table`][safeds.data.tabular.containers.Table] | A tuple containing the two resulting tables. The first table has the specified size, the second table contains the rest of the data. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="511"
    @Pure
    @PythonName("split_rows")
    fun splitRows(
        @PythonName("percentage_in_first") percentageInFirst: Float
    ) -> (result1: Table, result2: Table)
    ```

## `#!sds fun` summarizeStatistics {#safeds.data.tabular.containers.Table.summarizeStatistics data-toc-label='summarizeStatistics'}

Return a table with a number of statistical key values.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The table with statistics. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="190"
    @Pure
    @PythonName("summarize_statistics")
    fun summarizeStatistics() -> result1: Table
    ```

## `#!sds fun` tagColumns {#safeds.data.tabular.containers.Table.tagColumns data-toc-label='tagColumns'}

Return a new `TaggedTable` with columns marked as a target column or feature columns.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `featureNames` | [`List<String>?`][safeds.lang.List] | Names of the feature columns. If None, all columns except the target column are used. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TaggedTable`][safeds.data.tabular.containers.TaggedTable] | A new tagged table with the given target and feature names. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="527"
    @Pure
    @PythonName("tag_columns")
    fun tagColumns(
        @PythonName("target_name") targetName: String,
        @PythonName("feature_names") featureNames: List<String>? = null
    ) -> result1: TaggedTable
    ```

## `#!sds fun` timeColumns {#safeds.data.tabular.containers.Table.timeColumns data-toc-label='timeColumns'}

Return a new `TimeSeries` with columns marked as a target and time column or feature columns.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `timeName` | [`String`][safeds.lang.String] | Name of the time column. | - |
| `featureNames` | [`List<String>?`][safeds.lang.List] | Names of the feature columns. If None, all columns except the target and time columns are used. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series with the given target, time and feature names. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="545"
    @Pure
    @PythonName("time_columns")
    fun timeColumns(
        @PythonName("target_name") targetName: String,
        @PythonName("time_name") timeName: String,
        @PythonName("feature_names") featureNames: List<String>? = null
    ) -> result1: TimeSeries
    ```

## `#!sds fun` toColumns {#safeds.data.tabular.containers.Table.toColumns data-toc-label='toColumns'}

Return a list of the columns.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<Column<Any?>>`][safeds.lang.List] | List of columns. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="723"
    @Pure
    @PythonName("to_columns")
    fun toColumns() -> result1: List<Column>
    ```

## `#!sds fun` toCsvFile {#safeds.data.tabular.containers.Table.toCsvFile data-toc-label='toCsvFile'}

Write the data from the table into a CSV file.

If the file and/or the directories do not exist they will be created. If the file already exists it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="665"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_csv_file")
    fun toCsvFile(
        path: String
    )
    ```

## `#!sds fun` toDict {#safeds.data.tabular.containers.Table.toDict data-toc-label='toDict'}

Return a dictionary that maps column names to column values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Map<String, List<Any>>`][safeds.lang.Map] | Dictionary representation of the table. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="705"
    @Pure
    @PythonName("to_dict")
    fun toDict() -> result1: Map<String, List<Any>>
    ```

## `#!sds fun` toExcelFile {#safeds.data.tabular.containers.Table.toExcelFile data-toc-label='toExcelFile'}

Write the data from the table into an Excel file.

Valid file extensions are `.xls`, '.xlsx', `.xlsm`, `.xlsb`, `.odf`, `.ods` and `.odt`.
If the file and/or the directories do not exist, they will be created. If the file already exists, it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="680"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_excel_file")
    fun toExcelFile(
        path: String
    )
    ```

## `#!sds fun` toHtml {#safeds.data.tabular.containers.Table.toHtml data-toc-label='toHtml'}

Return an HTML representation of the table.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`String`][safeds.lang.String] | The generated HTML. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="714"
    @Pure
    @PythonName("to_html")
    fun toHtml() -> result1: String
    ```

## `#!sds fun` toJsonFile {#safeds.data.tabular.containers.Table.toJsonFile data-toc-label='toJsonFile'}

Write the data from the table into a JSON file.

If the file and/or the directories do not exist, they will be created. If the file already exists it will be
overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the output file. | - |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="694"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_json_file")
    fun toJsonFile(
        path: String
    )
    ```

## `#!sds fun` toRows {#safeds.data.tabular.containers.Table.toRows data-toc-label='toRows'}

Return a list of the rows.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<Row>`][safeds.lang.List] | List of rows. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="732"
    @Pure
    @PythonName("to_rows")
    fun toRows() -> result1: List<Row>
    ```

## `#!sds fun` transformColumn {#safeds.data.tabular.containers.Table.transformColumn data-toc-label='transformColumn'}

Return a new `Table` with the provided column transformed by calling the provided transformer.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | - | - |
| `transformer` | `#!sds (param1: Row) -> (param2: Any)` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The table with the transformed column. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="560"
    @Pure
    @PythonName("transform_column")
    fun transformColumn(
        name: String,
        transformer: (param1: Row) -> param2: Any
    ) -> result1: Table
    ```

## `#!sds fun` transformTable {#safeds.data.tabular.containers.Table.transformTable data-toc-label='transformTable'}

Return a new `Table` with a learned transformation applied to this table.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformer` | [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer] | The transformer which transforms the given table. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="576"
    @Pure
    @PythonName("transform_table")
    fun transformTable(
        transformer: TableTransformer
    ) -> result1: Table
    ```

## `#!sds static fun` fromColumns {#safeds.data.tabular.containers.Table.fromColumns data-toc-label='fromColumns'}

Return a table created from a list of columns.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | [`List<Column<Any?>>`][safeds.lang.List] | The columns to be combined. They need to have the same size. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The generated table. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="108"
    @Pure
    @PythonName("from_columns")
    static fun fromColumns(
        columns: List<Column>
    ) -> result1: Table
    ```

## `#!sds static fun` fromCsvFile {#safeds.data.tabular.containers.Table.fromCsvFile data-toc-label='fromCsvFile'}

Read data from a CSV file into a table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the CSV file. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The table created from the CSV file. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="54"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_csv_file")
    static fun fromCsvFile(
        path: String
    ) -> result1: Table
    ```

## `#!sds static fun` fromDict {#safeds.data.tabular.containers.Table.fromDict data-toc-label='fromDict'}

Create a table from a dictionary that maps column names to column values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>`][safeds.lang.Map] | The data. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The generated table. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="95"
    @Pure
    @PythonName("from_dict")
    static fun fromDict(
        data: Map<String, List<Any>>
    ) -> result1: Table
    ```

## `#!sds static fun` fromExcelFile {#safeds.data.tabular.containers.Table.fromExcelFile data-toc-label='fromExcelFile'}

Read data from an Excel file into a table.

Valid file extensions are `.xls`, `.xlsx`, `.xlsm`, `.xlsb`, `.odf`, `.ods` and `.odt`.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the Excel file. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The table created from the Excel file. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="69"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_excel_file")
    static fun fromExcelFile(
        path: String
    ) -> result1: Table
    ```

## `#!sds static fun` fromJsonFile {#safeds.data.tabular.containers.Table.fromJsonFile data-toc-label='fromJsonFile'}

Read data from a JSON file into a table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the JSON file. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The table created from the JSON file. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="82"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_json_file")
    static fun fromJsonFile(
        path: String
    ) -> result1: Table
    ```

## `#!sds static fun` fromRows {#safeds.data.tabular.containers.Table.fromRows data-toc-label='fromRows'}

Return a table created from a list of rows.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `rows` | [`List<Row>`][safeds.lang.List] | The rows to be combined. They need to have a matching schema. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The generated table. |

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="121"
    @Pure
    @PythonName("from_rows")
    static fun fromRows(
        rows: List<Row>
    ) -> result1: Table
    ```
