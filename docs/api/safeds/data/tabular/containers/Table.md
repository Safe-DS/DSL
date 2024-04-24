# `#!sds class` Table {#safeds.data.tabular.containers.Table data-toc-label='Table'}

A table is a two-dimensional collection of data. It can either be seen as a list of rows or as a list of columns.

To create a `Table` call the constructor or use one of the following static methods:

| Method                     | Description                            |
| -------------------------- | -------------------------------------- |
| [Table.fromCsvFile][safeds.data.tabular.containers.Table.fromCsvFile]  | Create a table from a CSV file.        |
| [Table.fromJsonFile][safeds.data.tabular.containers.Table.fromJsonFile] | Create a table from a JSON file.       |
| [Table.fromMap][safeds.data.tabular.containers.Table.fromMap]      | Create a table from a map.             |
| [Table.fromColumns][safeds.data.tabular.containers.Table.fromColumns]  | Create a table from a list of columns. |
| [Table.fromRows][safeds.data.tabular.containers.Table.fromRows]     | Create a table from a list of rows.    |

Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any?>>?`][safeds.lang.Map] | The data. If None, an empty table is created. | `#!sds null` |

**Inheritors:**

- [`TaggedTable`][safeds.data.tabular.containers.TaggedTable]
- [`TimeSeries`][safeds.data.tabular.containers.TimeSeries]

**Examples:**

```sds hl_lines="2"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="30"
    class Table(
        data: Map<String, List<Any?>>? = null // TODO: update default value to empty map
    ) {
        /**
         * Return a list of all column names in this table.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val columnNames = table.columnNames; // ["a", "b"]
         * }
         */
        @PythonName("column_names") attr columnNames: List<String>
        /**
         * Return the number of columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val numberOfColumns = table.numberOfColumns; // 2
         * }
         */
        @PythonName("number_of_columns") attr numberOfColumns: Int
        /**
         * Return the number of rows.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val numberOfRows = table.numberOfRows; // 2
         * }
         */
        @PythonName("number_of_rows") attr numberOfRows: Int
        /**
         * Return the schema of the table.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val `schema` = table.`schema`;
         * }
         */
        attr `schema`: Schema

        /**
         * Read data from a CSV file into a table.
         *
         * @param path The path to the CSV file.
         *
         * @result table The table created from the CSV file.
         *
         * @example
         * pipeline example {
         *     val table = Table.fromCsvFile("path/to/file.csv");
         * }
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_csv_file")
        static fun fromCsvFile(
            path: String
        ) -> table: Table

        /**
         * Read data from an Excel file into a table.
         *
         * Valid file extensions are `.xls`, `.xlsx`, `.xlsm`, `.xlsb`, `.odf`, `.ods` and `.odt`.
         *
         * @param path The path to the Excel file.
         *
         * @result table The table created from the Excel file.
         *
         * @example
         * pipeline example {
         *     val table = Table.fromExcelFile("path/to/file.xlsx");
         * }
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_excel_file")
        static fun fromExcelFile(
            path: String
        ) -> table: Table

        /**
         * Read data from a JSON file into a table.
         *
         * @param path The path to the JSON file.
         *
         * @result table The table created from the JSON file.
         *
         * @example
         * pipeline example {
         *     val table = Table.fromJsonFile("path/to/file.json");
         * }
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_json_file")
        static fun fromJsonFile(
            path: String
        ) -> table: Table

        /**
         * Create a table from a map of column names to column values.
         *
         * @param data The data.
         *
         * @result table The generated table.
         *
         * @example
         * pipeline example {
         *     val table = Table.fromMap({"a": [1, 2], "b": [3, 4]});
         * }
         */
        @Pure
        @PythonName("from_dict")
        static fun fromMap(
            data: Map<String, List<Any>>
        ) -> table: Table

        /**
         * Return a table created from a list of columns.
         *
         * @param columns The columns to be combined. They need to have the same size.
         *
         * @result table The generated table.
         *
         * @example
         * pipeline example {
         *     val column1 = Column("a", [1, 2]);
         *     val column2 = Column("b", [3, 4]);
         *     val table = Table.fromColumns([column1, column2]);
         * }
         */
        @Pure
        @PythonName("from_columns")
        static fun fromColumns(
            columns: List<Column>
        ) -> table: Table

        /**
         * Return a table created from a list of rows.
         *
         * @param rows The rows to be combined. They need to have a matching schema.
         *
         * @result table The generated table.
         *
         * @example
         * pipeline example {
         *     val row1 = Row({"a": 1, "b": 3});
         *     val row2 = Row({"a": 2, "b": 4});
         *     val table = Table.fromRows([row1, row2]);
         * }
         */
        @Pure
        @PythonName("from_rows")
        static fun fromRows(
            rows: List<Row>
        ) -> table: Table

        /**
         * Return a column with the data of the specified column.
         *
         * @param columnName The name of the column.
         *
         * @result column The column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val column = table.getColumn("a"); // Column("a", [1, 2])
         * }
         */
        @Pure
        @PythonName("get_column")
        fun getColumn(
            @PythonName("column_name") columnName: String
        ) -> column: Column

        /**
         * Return whether the table contains a given column.
         *
         * @param columnName The name of the column.
         *
         * @result result1 True if the column exists.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val hasColumn = table.hasColumn("a"); // true
         * }
         */
        @Pure
        @PythonName("has_column")
        fun hasColumn(
            @PythonName("column_name") columnName: String
        ) -> result1: Boolean

        /**
         * Return the type of the given column.
         *
         * @param columnName The name of the column to be queried.
         *
         * @result type The type of the column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val type = table.getColumnType("a"); // Integer
         * }
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            @PythonName("column_name") columnName: String
        ) -> type: ColumnType

        /**
         * Return the row at a specified index.
         *
         * @param index The index.
         *
         * @result result1 The row of the table at the index.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val row = table.getRow(0); // Row({"a": 1, "b": 3})
         * }
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
         * @result statistics The table with statistics.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val statistics = table.summarizeStatistics();
         * }
         */
        @Pure
        @PythonName("summarize_statistics")
        fun summarizeStatistics() -> statistics: Table

        /**
         * Return a new table with the provided column attached at the end.
         *
         * The original table is not modified.
         *
         * @result newTable The table with the column attached.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val column = Column("c", [5, 6]);
         *     val newTable = table.addColumn(column);
         *     // Table({
         *     //     "a": [1, 2],
         *     //     "b": [3, 4],
         *     //     "c": [5, 6],
         *     // })
         * }
         */
        @Pure
        @PythonName("add_column")
        fun addColumn(
            column: Column
        ) -> newTable: Table

        /**
         * Return a new `Table` with multiple added columns.
         *
         * The original table is not modified.
         *
         * @param columns The columns to be added.
         *
         * @result newTable A new table combining the original table and the given columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val column1 = Column("c", [5, 6]);
         *     val column2 = Column("d", [7, 8]);
         *     val newTable = table.addColumns([column1, column2]);
         *     // Table({
         *     //     "a": [1, 2],
         *     //     "b": [3, 4],
         *     //     "c": [5, 6],
         *     //     "d": [7, 8],
         *     // })
         * }
         */
        @Pure
        @PythonName("add_columns")
        fun addColumns(
            columns: union<List<Column>, Table>
        ) -> newTable: Table

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
         * @result newTable A new table with the added row at the end.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [4, 5]});
         *     val row = Row({"a": 3, "b": 6});
         *     val newTable = table.addRow(row);
         *     // Table({
         *     //     "a": [1, 2, 3],
         *     //     "b": [4, 5, 6],
         *     // })
         * }
         */
        @Pure
        @PythonName("add_row")
        fun addRow(
            row: Row
        ) -> newTable: Table

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
         * @result newTable A new table which combines the original table and the given rows.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [5, 6]});
         *     val row1 = Row({"a": 3, "b": 7});
         *     val row2 = Row({"a": 4, "b": 8});
         *     val newTable = table.addRows([row1, row2]);
         *     // Table({
         *     //     "a": [1, 2, 3, 4],
         *     //     "b": [5, 6, 7, 8],
         *     // })
         * }
         */
        @Pure
        @PythonName("add_rows")
        fun addRows(
            rows: union<List<Row>, Table>
        ) -> newTable: Table

        /**
         * Return a new table with rows filtered by Callable (e.g. lambda function).
         *
         * The original table is not modified.
         *
         * @param query A Callable that is applied to all rows.
         *
         * @result filteredTable A table containing only the rows filtered by the query.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val filteredTable = table.filterRows((row) ->
         *         row.getValue("a") as Int > 1
         *     );
         *     // Table({"a": [2], "b": [4]})
         * }
         */
        @Pure
        @PythonName("filter_rows")
        fun filterRows(
            query: (row: Row) -> matches: Boolean
        ) -> filteredTable: Table

        /**
         * Return a map with copies of the output tables as values and the keys from the key_selector.
         *
         * The original table is not modified.
         *
         * @param keySelector A Callable that is applied to all rows and returns the key of the group.
         *
         * @result tablesByKey A map containing the new tables as values and the selected keys as keys.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val tablesByKey = table.groupRows((row) ->
         *         row.getValue("a") as Int <= 2
         *     );
         *     // {
         *     //     true: Table({"a": [1, 2], "b": [4, 5]}),
         *     //     false: Table({"a": [3], "b": [6]}),
         *     // }
         * }
         */
        @Pure
        @PythonName("group_rows_by")
        fun groupRows<T>(
            @PythonName("key_selector") keySelector: (row: Row) -> key: T
        ) -> tablesByKey: Map<T, Table>

        /**
         * Return a new table with only the given column(s).
         *
         * The original table is not modified.
         *
         * Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.
         *
         * @param columnNames A list containing only the columns to be kept.
         *
         * @result projectedTable A table containing only the given column(s).
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val projectedTable = table.keepOnlyColumns(["a"]);
         *     // Table({"a": [1, 2]})
         * }
         */
        @Pure
        @PythonName("keep_only_columns")
        fun keepOnlyColumns(
            @PythonName("column_names") columnNames: List<String>
        ) -> projectedTable: Table

        /**
         * Return a new table without the given column(s).
         *
         * The original table is not modified.
         *
         * Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.
         *
         * @param columnNames A list containing all columns to be dropped.
         *
         * @result projectedTable A table without the given columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val projectedTable = table.removeColumns(["a"]);
         *     // Table({"b": [3, 4]})
         * }
         */
        @Pure
        @PythonName("remove_columns")
        fun removeColumns(
            @PythonName("column_names") columnNames: List<String>
        ) -> projectedTable: Table

        /**
         * Return a new table without the columns that contain missing values.
         *
         * The original table is not modified.
         *
         * Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.
         *
         * @result projectedTable A table without the columns that contain missing values.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, null], "b": [3, 4]});
         *     val projectedTable = table.removeColumnsWithMissingValues();
         *     // Table({"b": [3, 4]})
         * }
         */
        @Pure
        @PythonName("remove_columns_with_missing_values")
        fun removeColumnsWithMissingValues() -> projectedTable: Table

        /**
         * Return a new table without the columns that contain non-numerical values.
         *
         * The original table is not modified.
         *
         * Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.
         *
         * @result projectedTable A table without the columns that contain non-numerical values.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": ["z", "y"], "b": [1, 2]});
         *     val projectedTable = table.removeColumnsWithNonNumericalValues();
         *     // Table({"b": [1, 2]})
         * }
         */
        @Pure
        @PythonName("remove_columns_with_non_numerical_values")
        fun removeColumnsWithNonNumericalValues() -> projectedTable: Table

        /**
         * Return a new table with every duplicate row removed.
         *
         * The original table is not modified.
         *
         * @result filteredTable The table with the duplicate rows removed.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 1], "b": [3, 4, 3]});
         *     val filteredTable = table.removeDuplicateRows();
         *     // Table({"a": [1, 2], "b": [3, 4]})
         * }
         */
        @Pure
        @PythonName("remove_duplicate_rows")
        fun removeDuplicateRows() -> filteredTable: Table

        /**
         * Return a new table without the rows that contain missing values.
         *
         * The original table is not modified.
         *
         * @result filteredTable A table without the rows that contain missing values.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, null], "b": [3, 4]});
         *     val filteredTable = table.removeRowsWithMissingValues();
         *     // Table({"a": [1], "b": [3]})
         * }
         */
        @Pure
        @PythonName("remove_rows_with_missing_values")
        fun removeRowsWithMissingValues() -> filteredTable: Table

        /**
         * Return a new table without those rows that contain at least one outlier.
         *
         * We define an outlier as a value that has a distance of more than 3 standard deviations from the column mean.
         * Missing values are not considered outliers. They are also ignored during the calculation of the standard
         * deviation.
         *
         * The original table is not modified.
         *
         * @result filteredTable A new table without rows containing outliers.
         *
         * @example
         * pipeline example {
         *     val table = Table({
         *         "a": [1,   2,    3,   4, 5,   6, 7,    8, 9,  10,    11],
         *         "b": [0, 0.1, -0.1, 0.2, 0, 0.1, 0, -0.3, 0, 0.3,  1000]
         *     });
         *     val filteredTable = table.removeRowsWithOutliers();
         *     // Table({
         *     //     "a": [1,   2,    3,   4, 5,   6, 7,    8, 9,  10],
         *     //     "b": [0, 0.1, -0.1, 0.2, 0, 0.1, 0, -0.3, 0, 0.3]
         *     // })
         * }
         */
        @Pure
        @PythonName("remove_rows_with_outliers")
        fun removeRowsWithOutliers() -> filteredTable: Table

        /**
         * Return a new `Table` with a single column renamed.
         *
         * The original table is not modified.
         *
         * @param oldName The old name of the target column.
         * @param newName The new name of the target column.
         *
         * @result newTable The Table with the renamed column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val newTable = table.renameColumn("a", "c");
         *     // Table({"c": [1, 2], "b": [3, 4]})
         * }
         */
        @Pure
        @PythonName("rename_column")
        fun renameColumn(
            @PythonName("old_name") oldName: String,
            @PythonName("new_name") newName: String
        ) -> newTable: Table

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
         * @result newTable A table with the old column replaced by the new columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val column = Column("c", [5, 6]);
         *     val newTable = table.replaceColumn("a", [column]);
         *     // Table({"c": [5, 6], "b": [3, 4]})
         * }
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val column1 = Column("c", [5, 6]);
         *     val column2 = Column("d", [7, 8]);
         *     val newTable = table.replaceColumn("a", [column1, column2]);
         *     // Table({"c": [5, 6], "d": [7, 8], "b": [3, 4]})
         * }
         */
        @Pure
        @PythonName("replace_column")
        fun replaceColumn(
            @PythonName("old_column_name") oldColumnName: String,
            @PythonName("new_columns") newColumns: List<Column>
        ) -> newTable: Table

        /**
         * Return a new `Table` with randomly shuffled rows of this `Table`.
         *
         * The original table is not modified.
         *
         * @result shuffledTable The shuffled Table.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val shuffledTable = table.shuffleRows();
         * }
         */
        @Pure
        @PythonName("shuffle_rows")
        fun shuffleRows() -> shuffledTable: Table

        /**
         * Slice a part of the table into a new table.
         *
         * The original table is not modified.
         *
         * @param start The first index of the range to be copied into a new table, None by default.
         * @param end The last index of the range to be copied into a new table, None by default.
         * @param step The step size used to iterate through the table, 1 by default.
         *
         * @result slicedTable The resulting table.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val slicedTable = table.sliceRows(start = 1);
         *     // Table({"a": [2, 3], "b": [5, 6]})
         * }
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val slicedTable = table.sliceRows(end = 2);
         *     // Table({"a": [1, 2], "b": [4, 5]})
         * }
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val slicedTable = table.sliceRows(step = 2);
         *     // Table({"a": [1, 3], "b": [4, 6]})
         * }
         */
        @Pure
        @PythonName("slice_rows")
        fun sliceRows(
            start: Int? = null,
            end: Int? = null,
            step: Int = 1
        ) -> slicedTable: Table

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
         * @result sortedTable A new table with sorted columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val sortedTable = table.sortColumns((col1, col2) -> 1);
         *     // Table({"a": [1, 2], "b": [3, 4]})
         * }
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val sortedTable = table.sortColumns((col1, col2) -> -1);
         *     // Table({"b": [3, 4], "a": [1, 2]})
         * }
         */
        @Pure
        @PythonName("sort_columns")
        fun sortColumns(
            comparator: (param1: Column, param2: Column) -> param3: Int
        ) -> sortedTable: Table

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
         * @result sortedTable A new table with sorted rows.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val sortedTable = table.sortRows((row1, row2) -> 1);
         *     // Table({"a": [1, 2], "b": [3, 4]})
         * }
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2], "b": [3, 4]});
         *     val sortedTable = table.sortRows((row1, row2) -> -1);
         *     // Table({"a": [2, 1], "b": [4, 3]})
         * }
         */
        @Pure
        @PythonName("sort_rows")
        fun sortRows(
            comparator: (param1: Row, param2: Row) -> param3: Int
        ) -> sortedTable: Table

        /**
         * Split the table into two new tables. Consider using {@link Table.shuffleRows} before splitting to ensure a random
         * distribution of rows in both tables.
         *
         * The original table is not modified.
         *
         * @param ratioInFirst
         * How many rows should be in the first table, expressed as a ratio of the total number of rows. Must be between 0
         * and 1.
         *
         * @result first The first table with the specified size.
         * @result second The second table with the remaining rows.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3, 4], "b": [5, 6, 7, 8]});
         *     val first, val second = table.splitRows(0.5);
         *     // first:  Table({"a": [1, 2], "b": [5, 6]})
         *     // second: Table({"a": [3, 4], "b": [7, 8]})
         * }
         */
        @Pure
        @PythonName("split_rows")
        fun splitRows(
            @PythonName("percentage_in_first") ratioInFirst: Float
        ) -> (first: Table, second: Table)

        /**
         * Return a new `TaggedTable` with columns marked as a target column or feature columns.
         *
         * The original table is not modified.
         *
         * @param targetName
         * Name of the target column.
         *
         * @param featureNames
         * Names of the feature columns. If None, all columns except the target column are used. Use this to hide columns
         * during training but still keep them in the input, to easily link predictions back to the original data.
         *
         * @result taggedTable A new tagged table with the given target and feature names.
         *
         * @example
         * pipeline example {
         *     val table = Table({
         *         "age":      [23, 16],
         *         "survived": [ 0,  1],
         *     });
         *     val taggedTable = table.tagColumns("survived");
         * }
         *
         * @example
         * pipeline example {
         *     val table = Table({
         *         "id":       [ 1,  2],
         *         "age":      [23, 16],
         *         "survived": [ 0,  1],
         *     });
         *     val taggedTable = table.tagColumns("target", features = ["age"]);
         * }
         */
        @Pure
        @PythonName("tag_columns")
        fun tagColumns(
            @PythonName("target_name") targetName: String,
            @PythonName("feature_names") featureNames: List<String>? = null
        ) -> taggedTable: TaggedTable

        /**
         * Return a new `Table` with the provided column transformed by calling the provided transformer.
         *
         * The original table is not modified.
         *
         * @result transformedTable The table with the transformed column.
         *
         * @example
         * pipeline example {
         *     val prices = Table({
         *         "product": ["apple", "banana", "cherry"],
         *         "price":   [    100,        2,        4],
         *     });
         *     val discountedPrices = price.transformColumn("price", (row) ->
         *         row.getValue("price") as Int * 0.5
         *     );
         *     // Table({
         *     //     "product": ["apple", "banana", "cherry"],
         *     //     "price":   [    50,        1,        2],
         *     // })
         * }
         */
        @Pure
        @PythonName("transform_column")
        fun transformColumn(
            name: String,
            transformer: (row: Row) -> newColumnValue: Any?
        ) -> transformedTable: Table

        /**
         * Return a new `Table` with a learned transformation applied to this table.
         *
         * The original table is not modified.
         *
         * @param transformer The transformer which transforms the given table.
         *
         * @result transformedTable The transformed table.
         *
         * @example
         * pipeline example {
         *    val table = Table({"a": [1, null], "b": [3, 4]});
         *    val imputer = Imputer(Imputer.Strategy.Mean).fit(table, ["a"]);
         *    val transformedTable = table.transformTable(imputer);
         *    // Table({"a": [1, 1], "b": [3, 4]})
         * }
         */
        @Pure
        @PythonName("transform_table")
        fun transformTable(
            transformer: TableTransformer
        ) -> transformedTable: Table

        /**
         * Return a new `Table` with the inverted transformation applied by the given transformer.
         *
         * The original table is not modified.
         *
         * @param transformer A transformer that was fitted with columns, which are all present in the table.
         *
         * @result result1 The original table.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("plot_boxplots")
        fun plotBoxplots() -> result1: Image

        /**
         * Plot a histogram for every column.
         *
         * @result result1 The plot as an image.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
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
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("to_dict")
        fun toDict() -> result1: Map<String, List<Any>>

        /**
         * Return an HTML representation of the table.
         *
         * @result result1 The generated HTML.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("to_html")
        fun toHtml() -> result1: String

        /**
         * Return a list of the columns.
         *
         * @result result1 List of columns.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("to_columns")
        fun toColumns() -> result1: List<Column>

        /**
         * Return a list of the rows.
         *
         * @result result1 List of rows.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("to_rows")
        fun toRows() -> result1: List<Row>
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.containers.Table.columnNames data-toc-label='columnNames'}

Return a list of all column names in this table.

**Type:** [`List<String>`][safeds.lang.List]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val columnNames = table.columnNames; // ["a", "b"]
}
```

## `#!sds attr` numberOfColumns {#safeds.data.tabular.containers.Table.numberOfColumns data-toc-label='numberOfColumns'}

Return the number of columns.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val numberOfColumns = table.numberOfColumns; // 2
}
```

## `#!sds attr` numberOfRows {#safeds.data.tabular.containers.Table.numberOfRows data-toc-label='numberOfRows'}

Return the number of rows.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val numberOfRows = table.numberOfRows; // 2
}
```

## `#!sds attr` schema {#safeds.data.tabular.containers.Table.schema data-toc-label='schema'}

Return the schema of the table.

**Type:** [`Schema`][safeds.data.tabular.typing.Schema]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val `schema` = table.`schema`;
}
```

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
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the column attached. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val column = Column("c", [5, 6]);
    val newTable = table.addColumn(column);
    // Table({
    //     "a": [1, 2],
    //     "b": [3, 4],
    //     "c": [5, 6],
    // })
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="300"
    @Pure
    @PythonName("add_column")
    fun addColumn(
        column: Column
    ) -> newTable: Table
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
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | A new table combining the original table and the given columns. |

**Examples:**

```sds hl_lines="5"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val column1 = Column("c", [5, 6]);
    val column2 = Column("d", [7, 8]);
    val newTable = table.addColumns([column1, column2]);
    // Table({
    //     "a": [1, 2],
    //     "b": [3, 4],
    //     "c": [5, 6],
    //     "d": [7, 8],
    // })
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="329"
    @Pure
    @PythonName("add_columns")
    fun addColumns(
        columns: union<List<Column>, Table>
    ) -> newTable: Table
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
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | A new table with the added row at the end. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val table = Table({"a": [1, 2], "b": [4, 5]});
    val row = Row({"a": 3, "b": 6});
    val newTable = table.addRow(row);
    // Table({
    //     "a": [1, 2, 3],
    //     "b": [4, 5, 6],
    // })
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="360"
    @Pure
    @PythonName("add_row")
    fun addRow(
        row: Row
    ) -> newTable: Table
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
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | A new table which combines the original table and the given rows. |

**Examples:**

```sds hl_lines="5"
pipeline example {
    val table = Table({"a": [1, 2], "b": [5, 6]});
    val row1 = Row({"a": 3, "b": 7});
    val row2 = Row({"a": 4, "b": 8});
    val newTable = table.addRows([row1, row2]);
    // Table({
    //     "a": [1, 2, 3, 4],
    //     "b": [5, 6, 7, 8],
    // })
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="390"
    @Pure
    @PythonName("add_rows")
    fun addRows(
        rows: union<List<Row>, Table>
    ) -> newTable: Table
    ```

## `#!sds fun` filterRows {#safeds.data.tabular.containers.Table.filterRows data-toc-label='filterRows'}

Return a new table with rows filtered by Callable (e.g. lambda function).

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `query` | `#!sds (row: Row) -> (matches: Boolean)` | A Callable that is applied to all rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `filteredTable` | [`Table`][safeds.data.tabular.containers.Table] | A table containing only the rows filtered by the query. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val filteredTable = table.filterRows((row) ->
        row.getValue("a") as Int > 1
    );
    // Table({"a": [2], "b": [4]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="414"
    @Pure
    @PythonName("filter_rows")
    fun filterRows(
        query: (row: Row) -> matches: Boolean
    ) -> filteredTable: Table
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

## `#!sds fun` getColumnType {#safeds.data.tabular.containers.Table.getColumnType data-toc-label='getColumnType'}

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

## `#!sds fun` groupRows {#safeds.data.tabular.containers.Table.groupRows data-toc-label='groupRows'}

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

## `#!sds fun` hasColumn {#safeds.data.tabular.containers.Table.hasColumn data-toc-label='hasColumn'}

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
| `projectedTable` | [`Table`][safeds.data.tabular.containers.Table] | A table containing only the given column(s). |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val projectedTable = table.keepOnlyColumns(["a"]);
    // Table({"a": [1, 2]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="465"
    @Pure
    @PythonName("keep_only_columns")
    fun keepOnlyColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> projectedTable: Table
    ```

## `#!sds fun` plotBoxplots {#safeds.data.tabular.containers.Table.plotBoxplots data-toc-label='plotBoxplots'}

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

## `#!sds fun` plotCorrelationHeatmap {#safeds.data.tabular.containers.Table.plotCorrelationHeatmap data-toc-label='plotCorrelationHeatmap'}

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

## `#!sds fun` plotHistograms {#safeds.data.tabular.containers.Table.plotHistograms data-toc-label='plotHistograms'}

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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="959"
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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="979"
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
| `projectedTable` | [`Table`][safeds.data.tabular.containers.Table] | A table without the given columns. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val projectedTable = table.removeColumns(["a"]);
    // Table({"b": [3, 4]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="489"
    @Pure
    @PythonName("remove_columns")
    fun removeColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> projectedTable: Table
    ```

## `#!sds fun` removeColumnsWithMissingValues {#safeds.data.tabular.containers.Table.removeColumnsWithMissingValues data-toc-label='removeColumnsWithMissingValues'}

Return a new table without the columns that contain missing values.

The original table is not modified.

Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `projectedTable` | [`Table`][safeds.data.tabular.containers.Table] | A table without the columns that contain missing values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, null], "b": [3, 4]});
    val projectedTable = table.removeColumnsWithMissingValues();
    // Table({"b": [3, 4]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="511"
    @Pure
    @PythonName("remove_columns_with_missing_values")
    fun removeColumnsWithMissingValues() -> projectedTable: Table
    ```

## `#!sds fun` removeColumnsWithNonNumericalValues {#safeds.data.tabular.containers.Table.removeColumnsWithNonNumericalValues data-toc-label='removeColumnsWithNonNumericalValues'}

Return a new table without the columns that contain non-numerical values.

The original table is not modified.

Note: When removing the last column of the table, the `number_of_columns` property will be set to 0.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `projectedTable` | [`Table`][safeds.data.tabular.containers.Table] | A table without the columns that contain non-numerical values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": ["z", "y"], "b": [1, 2]});
    val projectedTable = table.removeColumnsWithNonNumericalValues();
    // Table({"b": [1, 2]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="531"
    @Pure
    @PythonName("remove_columns_with_non_numerical_values")
    fun removeColumnsWithNonNumericalValues() -> projectedTable: Table
    ```

## `#!sds fun` removeDuplicateRows {#safeds.data.tabular.containers.Table.removeDuplicateRows data-toc-label='removeDuplicateRows'}

Return a new table with every duplicate row removed.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `filteredTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the duplicate rows removed. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 1], "b": [3, 4, 3]});
    val filteredTable = table.removeDuplicateRows();
    // Table({"a": [1, 2], "b": [3, 4]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="549"
    @Pure
    @PythonName("remove_duplicate_rows")
    fun removeDuplicateRows() -> filteredTable: Table
    ```

## `#!sds fun` removeRowsWithMissingValues {#safeds.data.tabular.containers.Table.removeRowsWithMissingValues data-toc-label='removeRowsWithMissingValues'}

Return a new table without the rows that contain missing values.

The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `filteredTable` | [`Table`][safeds.data.tabular.containers.Table] | A table without the rows that contain missing values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, null], "b": [3, 4]});
    val filteredTable = table.removeRowsWithMissingValues();
    // Table({"a": [1], "b": [3]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="567"
    @Pure
    @PythonName("remove_rows_with_missing_values")
    fun removeRowsWithMissingValues() -> filteredTable: Table
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
| `filteredTable` | [`Table`][safeds.data.tabular.containers.Table] | A new table without rows containing outliers. |

**Examples:**

```sds hl_lines="6"
pipeline example {
    val table = Table({
        "a": [1,   2,    3,   4, 5,   6, 7,    8, 9,  10,    11],
        "b": [0, 0.1, -0.1, 0.2, 0, 0.1, 0, -0.3, 0, 0.3,  1000]
    });
    val filteredTable = table.removeRowsWithOutliers();
    // Table({
    //     "a": [1,   2,    3,   4, 5,   6, 7,    8, 9,  10],
    //     "b": [0, 0.1, -0.1, 0.2, 0, 0.1, 0, -0.3, 0, 0.3]
    // })
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="595"
    @Pure
    @PythonName("remove_rows_with_outliers")
    fun removeRowsWithOutliers() -> filteredTable: Table
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
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The Table with the renamed column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val newTable = table.renameColumn("a", "c");
    // Table({"c": [1, 2], "b": [3, 4]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="616"
    @Pure
    @PythonName("rename_column")
    fun renameColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_name") newName: String
    ) -> newTable: Table
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
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | A table with the old column replaced by the new columns. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val column = Column("c", [5, 6]);
    val newTable = table.replaceColumn("a", [column]);
    // Table({"c": [5, 6], "b": [3, 4]})
}
```
```sds hl_lines="5"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val column1 = Column("c", [5, 6]);
    val column2 = Column("d", [7, 8]);
    val newTable = table.replaceColumn("a", [column1, column2]);
    // Table({"c": [5, 6], "d": [7, 8], "b": [3, 4]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="652"
    @Pure
    @PythonName("replace_column")
    fun replaceColumn(
        @PythonName("old_column_name") oldColumnName: String,
        @PythonName("new_columns") newColumns: List<Column>
    ) -> newTable: Table
    ```

## `#!sds fun` shuffleRows {#safeds.data.tabular.containers.Table.shuffleRows data-toc-label='shuffleRows'}

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
| `slicedTable` | [`Table`][safeds.data.tabular.containers.Table] | The resulting table. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val slicedTable = table.sliceRows(start = 1);
    // Table({"a": [2, 3], "b": [5, 6]})
}
```
```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val slicedTable = table.sliceRows(end = 2);
    // Table({"a": [1, 2], "b": [4, 5]})
}
```
```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val slicedTable = table.sliceRows(step = 2);
    // Table({"a": [1, 3], "b": [4, 6]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="708"
    @Pure
    @PythonName("slice_rows")
    fun sliceRows(
        start: Int? = null,
        end: Int? = null,
        step: Int = 1
    ) -> slicedTable: Table
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
| `sortedTable` | [`Table`][safeds.data.tabular.containers.Table] | A new table with sorted columns. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val sortedTable = table.sortColumns((col1, col2) -> 1);
    // Table({"a": [1, 2], "b": [3, 4]})
}
```
```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2], "b": [3, 4]});
    val sortedTable = table.sortColumns((col1, col2) -> -1);
    // Table({"b": [3, 4], "a": [1, 2]})
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="748"
    @Pure
    @PythonName("sort_columns")
    fun sortColumns(
        comparator: (param1: Column, param2: Column) -> param3: Int
    ) -> sortedTable: Table
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

## `#!sds fun` splitRows {#safeds.data.tabular.containers.Table.splitRows data-toc-label='splitRows'}

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

## `#!sds fun` summarizeStatistics {#safeds.data.tabular.containers.Table.summarizeStatistics data-toc-label='summarizeStatistics'}

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

## `#!sds fun` tagColumns {#safeds.data.tabular.containers.Table.tagColumns data-toc-label='tagColumns'}

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
    val taggedTable = table.tagColumns("target", features = ["age"]);
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

## `#!sds fun` toColumns {#safeds.data.tabular.containers.Table.toColumns data-toc-label='toColumns'}

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

## `#!sds fun` toCsvFile {#safeds.data.tabular.containers.Table.toCsvFile data-toc-label='toCsvFile'}

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

## `#!sds fun` toDict {#safeds.data.tabular.containers.Table.toDict data-toc-label='toDict'}

Return a dictionary that maps column names to column values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Map<String, List<Any>>`][safeds.lang.Map] | Dictionary representation of the table. |

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

## `#!sds fun` toHtml {#safeds.data.tabular.containers.Table.toHtml data-toc-label='toHtml'}

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

## `#!sds fun` toJsonFile {#safeds.data.tabular.containers.Table.toJsonFile data-toc-label='toJsonFile'}

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

## `#!sds fun` toRows {#safeds.data.tabular.containers.Table.toRows data-toc-label='toRows'}

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

## `#!sds fun` transformColumn {#safeds.data.tabular.containers.Table.transformColumn data-toc-label='transformColumn'}

Return a new `Table` with the provided column transformed by calling the provided transformer.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | - | - |
| `transformer` | `#!sds (row: Row) -> (newColumnValue: Any?)` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the transformed column. |

**Examples:**

```sds hl_lines="6"
pipeline example {
    val prices = Table({
        "product": ["apple", "banana", "cherry"],
        "price":   [    100,        2,        4],
    });
    val discountedPrices = price.transformColumn("price", (row) ->
        row.getValue("price") as Int * 0.5
    );
    // Table({
    //     "product": ["apple", "banana", "cherry"],
    //     "price":   [    50,        1,        2],
    // })
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="879"
    @Pure
    @PythonName("transform_column")
    fun transformColumn(
        name: String,
        transformer: (row: Row) -> newColumnValue: Any?
    ) -> transformedTable: Table
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

## `#!sds static fun` fromColumns {#safeds.data.tabular.containers.Table.fromColumns data-toc-label='fromColumns'}

Return a table created from a list of columns.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | [`List<Column<Any?>>`][safeds.lang.List] | The columns to be combined. They need to have the same size. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The generated table. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val column1 = Column("a", [1, 2]);
    val column2 = Column("b", [3, 4]);
    val table = Table.fromColumns([column1, column2]);
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="162"
    @Pure
    @PythonName("from_columns")
    static fun fromColumns(
        columns: List<Column>
    ) -> table: Table
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
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table created from the CSV file. |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val table = Table.fromCsvFile("path/to/file.csv");
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="86"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_csv_file")
    static fun fromCsvFile(
        path: String
    ) -> table: Table
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
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table created from the Excel file. |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val table = Table.fromExcelFile("path/to/file.xlsx");
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="106"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_excel_file")
    static fun fromExcelFile(
        path: String
    ) -> table: Table
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
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table created from the JSON file. |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val table = Table.fromJsonFile("path/to/file.json");
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="124"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_json_file")
    static fun fromJsonFile(
        path: String
    ) -> table: Table
    ```

## `#!sds static fun` fromMap {#safeds.data.tabular.containers.Table.fromMap data-toc-label='fromMap'}

Create a table from a map of column names to column values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>`][safeds.lang.Map] | The data. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The generated table. |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val table = Table.fromMap({"a": [1, 2], "b": [3, 4]});
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="142"
    @Pure
    @PythonName("from_dict")
    static fun fromMap(
        data: Map<String, List<Any>>
    ) -> table: Table
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
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The generated table. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val row1 = Row({"a": 1, "b": 3});
    val row2 = Row({"a": 2, "b": 4});
    val table = Table.fromRows([row1, row2]);
}
```

??? quote "Stub code in `table.sdsstub`"

    ```sds linenums="182"
    @Pure
    @PythonName("from_rows")
    static fun fromRows(
        rows: List<Row>
    ) -> table: Table
    ```
