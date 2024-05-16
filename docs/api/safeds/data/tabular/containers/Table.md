# `#!sds class` Table {#safeds.data.tabular.containers.Table data-toc-label='Table'}

A two-dimensional collection of data. It can either be seen as a list of rows or as a list of columns.

To create a `Table` call the constructor or use one of the following static methods:

| Method                                                                  | Description                            |
| ----------------------------------------------------------------------- | -------------------------------------- |
| [fromCsvFile][safeds.data.tabular.containers.Table.fromCsvFile]         | Create a table from a CSV file.        |
| [fromJsonFile][safeds.data.tabular.containers.Table.fromJsonFile]       | Create a table from a JSON file.       |
| [fromParquetFile][safeds.data.tabular.containers.Table.fromParquetFile] | Create a table from a Parquet file.    |
| [fromColumns][safeds.data.tabular.containers.Table.fromColumns]         | Create a table from a list of columns. |
| [fromMap][safeds.data.tabular.containers.Table.fromMap]                 | Create a table from a map.      |

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any?>>?`][safeds.lang.Map] | The data of the table. If null, an empty table is created. | `#!sds null` |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="32"
    class Table(
        data: Map<String, List<Any?>>? = null
    ) {
        /**
         * The names of the columns in the table.
         */
        @PythonName("column_names") attr columnNames: List<String>
        /**
         * The number of columns in the table.
         */
        @PythonName("number_of_columns") attr columnCount: Int
        /**
         * The number of rows in the table.
         *
         * **Note:** This operation must fully load the data into memory, which can be expensive.
         */
        @PythonName("number_of_rows") attr rowCount: Int
        /**
         * The plotter for the table.
         */
        attr plot: TablePlotter
        /**
         * The schema of the table.
         */
        attr ^schema: Schema

        /**
         * Create a table from a list of columns.
         *
         * @param columns The columns.
         *
         * @result table The created table.
         *
         * @example
         * pipeline example {
         *     val a = Column("a", [1, 2, 3]);
         *     val b = Column("b", [4, 5, 6]);
         *     val result = Table.fromColumns([a, b]);
         * }
         */
        @Pure
        @PythonName("from_columns")
        static fun fromColumns(
            columns: union<Column, List<Column>>
        ) -> table: Table

        /**
         * Create a table from a CSV file.
         *
         * @param path The path to the CSV file. If the file extension is omitted, it is assumed to be ".csv".
         * @param separator The separator between the values in the CSV file.
         *
         * @result table The created table.
         *
         * @example
         * pipeline example {
         *     val result = Table.fromCsvFile("input.csv");
         * }
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_csv_file")
        static fun fromCsvFile(
            path: String,
            separator: String = ","
        ) -> table: Table

        /**
         * Create a table from a map that maps column names to column values.
         *
         * @param data The data.
         *
         * @result table The generated table.
         *
         * @example
         * pipeline example {
         *     val data = {"a'": [1, 2, 3], "b": [4, 5, 6]};
         *     val result = Table.fromMap(data);
         * }
         */
        @Pure
        @PythonName("from_dict")
        static fun fromMap(
            data: Map<String, List<Any>>
        ) -> table: Table

        /**
         * Create a table from a JSON file.
         *
         * @param path The path to the JSON file. If the file extension is omitted, it is assumed to be ".json".
         *
         * @result table The created table.
         *
         * @example
         * pipeline example {
         *     val result = Table.fromJsonFile("input.json");
         * }
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_json_file")
        static fun fromJsonFile(
            path: String
        ) -> table: Table

        /**
         * Create a table from a Parquet file.
         *
         * @param path The path to the Parquet file. If the file extension is omitted, it is assumed to be ".parquet".
         *
         * @result table The created table.
         *
         * @example
         * pipeline example {
         *     val result = Table.fromParquetFile("input.parquet");
         * }
         */
        @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
        @PythonName("from_parquet_file")
        static fun fromParquetFile(
            path: String
        ) -> table: Table

        /**
         * Return a new table with additional columns.
         *
         * **Notes:**
         *
         * - The original table is not modified.
         * - This operation must fully load the data into memory, which can be expensive.
         *
         * @param columns The columns to add.
         *
         * @result newTable The table with the additional columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3]});
         *     val newColumn = Column("b", [4, 5, 6]);
         *     val result = table.addColumns(newColumn);
         * }
         */
        @Pure
        @PythonName("add_columns")
        fun addColumns(
            columns: union<Column, List<Column>>
        ) -> newTable: Table

        /**
         * Return a new table with an additional computed column.
         *
         * **Note:** The original table is not modified.
         *
         * @param name The name of the new column.
         * @param computer The function that computes the values of the new column.
         *
         * @result newTable The table with the computed column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.addComputedColumn("c", (row) -> row.getValue("a").add(row.getValue("b")));
         * }
         */
        @Pure
        @PythonName("add_computed_column")
        fun addComputedColumn(
            name: String,
            computer: (row: Row) -> computedCell: Cell
        ) -> newTable: Table

        /**
         * Get a column from the table.
         *
         * **Note:** This operation must fully load the data into memory, which can be expensive.
         *
         * @param name The name of the column.
         *
         * @result column The column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.getColumn("a");
         *     // Column("a", [1, 2, 3])
         * }
         */
        @Pure
        @PythonName("get_column")
        fun getColumn(
            name: String
        ) -> column: Column

        /**
         * Get the data type of a column.
         *
         * @param name The name of the column.
         *
         * @result type The data type of the column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.getColumnType("a");
         * }
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            name: String
        ) -> type: DataType

        /**
         * Check if the table has a column with a specific name.
         *
         * @param name The name of the column.
         *
         * @result hasColumn Whether the table has a column with the specified name.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.hasColumn("a"); // true
         * }
         */
        @Pure
        @PythonName("has_column")
        fun hasColumn(
            name: String
        ) -> hasColumn: Boolean

        /**
         * Return a new table without the specified columns.
         *
         * **Notes:**
         *
         * - The original table is not modified.
         * - This method does not raise if a column does not exist. You can use it to ensure that the resulting table does
         *   not contain certain columns.
         *
         * @param names The names of the columns to remove.
         *
         * @result newTable The table with the columns removed.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.removeColumns("a");
         *     // Table({"b": [4, 5, 6]})
         * }
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.removeColumns("c");
         *     // Table({"a": [1, 2, 3], "b": [4, 5, 6]})
         * }
         */
        @Pure
        @PythonName("remove_columns")
        fun removeColumns(
            names: union<List<String>, String>
        ) -> newTable: Table

        /**
         * Return a new table with only the specified columns.
         *
         * @param names The names of the columns to keep.
         *
         * @result newTable The table with only the specified columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.removeColumnsExcept("a");
         *     // Table({"a": [1, 2, 3]})
         * }
         */
        @Pure
        @PythonName("remove_columns_except")
        fun removeColumnsExcept(
            names: union<List<String>, String>
        ) -> newTable: Table

        /**
         * Return a new table without columns that contain missing values.
         *
         * **Notes:**
         *
         * - The original table is not modified.
         * - This operation must fully load the data into memory, which can be expensive.
         *
         * @result newTable The table without columns containing missing values.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, null]});
         *     val result = table.removeColumnsWithMissingValues();
         *     // Table({"a": [1, 2, 3]})
         * }
         */
        @Pure
        @PythonName("remove_columns_with_missing_values")
        fun removeColumnsWithMissingValues() -> newTable: Table

        /**
         * Return a new table without non-numeric columns.
         *
         * **Note:** The original table is not modified.
         *
         * @result newTable The table without non-numeric columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": ["4", "5", "6"]});
         *     val result = table.removeNonNumericColumns();
         *     // Table({"a": [1, 2, 3]})
         * }
         */
        @Pure
        @PythonName("remove_non_numeric_columns")
        fun removeNonNumericColumns() -> newTable: Table

        /**
         * Return a new table with a column renamed.
         *
         * **Note:** The original table is not modified.
         *
         * @param oldName The name of the column to rename.
         * @param newName The new name of the column.
         *
         * @result newTable The table with the column renamed.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.renameColumn("a", "c");
         *     // Table({"c": [1, 2, 3], "b": [4, 5, 6]})
         * }
         */
        @Pure
        @PythonName("rename_column")
        fun renameColumn(
            @PythonName("old_name") oldName: String,
            @PythonName("new_name") newName: String
        ) -> newTable: Table

        /**
         * Return a new table with a column replaced by zero or more columns.
         *
         * **Note:** The original table is not modified.
         *
         * @param oldName The name of the column to replace.
         * @param newColumns The new columns.
         *
         * @result newTable The table with the column replaced.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.replaceColumn("a", []);
         *     // Table({"b": [4, 5, 6]})
         * }
         */
        @Pure
        @PythonName("replace_column")
        fun replaceColumn(
            @PythonName("old_name") oldName: String,
            @PythonName("new_columns") newColumns: union<Column, List<Column>, Table>
        ) -> newTable: Table

        /**
         * Return a new table with a column transformed.
         *
         * **Note:** The original table is not modified.
         *
         * @param name The name of the column to transform.
         * @param transformer The function that transforms the column.
         *
         * @result newTable The table with the transformed column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.transformColumn("a", (cell) -> cell.add(1));
         *     // Table({"a": [2, 3, 4], "b": [4, 5, 6]})
         * }
         */
        @Pure
        @PythonName("transform_column")
        fun transformColumn(
            name: String,
            transformer: (cell: Cell) -> transformedCell: Cell
        ) -> newTable: Table

        /**
         * Return a new table without duplicate rows.
         *
         * **Note:** The original table is not modified.
         *
         * @result newTable The table without duplicate rows.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 2], "b": [4, 5, 5]});
         *     val result = table.removeDuplicateRows();
         *     // Table({"a": [1, 2], "b": [4, 5]})
         * }
         */
        @Pure
        @PythonName("remove_duplicate_rows")
        fun removeDuplicateRows() -> newTable: Table

        /**
         * Return a new table without rows that satisfy a condition.
         *
         * **Note:** The original table is not modified.
         *
         * @param query The function that determines which rows to remove.
         *
         * @result newTable The table without the specified rows.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.removeRows((row) -> row.getValue("a").eq(2));
         *     // Table({"a": [1, 3], "b": [4, 6]})
         * }
         */
        @Pure
        @PythonName("remove_rows")
        fun removeRows(
            query: (row: Row) -> shouldRemoveRow: Cell<Boolean>
        ) -> newTable: Table

        /**
         * Return a new table without rows that satisfy a condition on a specific column.
         *
         * **Note:** The original table is not modified.
         *
         * @param name The name of the column.
         * @param query The function that determines which rows to remove.
         *
         * @result newTable The table without the specified rows.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.removeRowsByColumn("a", (cell) -> cell.eq(2));
         *     // Table({"a": [1, 3], "b": [4, 6]})
         * }
         */
        @Pure
        @PythonName("remove_rows_by_column")
        fun removeRowsByColumn(
            name: String,
            query: (cell: Cell) -> shouldRemoveRow: Cell<Boolean>
        ) -> newTable: Table

        /**
         * Return a new table without rows containing missing values in the specified columns.
         *
         * **Note:** The original table is not modified.
         *
         * @param columnNames Names of the columns to consider. If null, all columns are considered.
         *
         * @result newTable The table without rows containing missing values in the specified columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, null, 3], "b": [4, 5, null]});
         *     val result = table.removeRowsWithMissingValues();
         *     // Table({"a": [1], "b": [4]})
         * }
         */
        @Pure
        @PythonName("remove_rows_with_missing_values")
        fun removeRowsWithMissingValues(
            @PythonName("column_names") columnNames: List<String>? = null
        ) -> newTable: Table

        /**
         * Return a new table without rows containing outliers in the specified columns.
         *
         * Whether a data point is an outlier in a column is determined by its z-score. The z-score the distance of the
         * data point from the mean of the column divided by the standard deviation of the column. If the z-score is
         * greater than the given threshold, the data point is considered an outlier. Missing values are ignored during the
         * calculation of the z-score.
         *
         * The z-score is only defined for numeric columns. Non-numeric columns are ignored, even if they are specified in
         * `column_names`.
         *
         * **Notes:**
         *
         * - The original table is not modified.
         * - This operation must fully load the data into memory, which can be expensive.
         *
         * @param columnNames Names of the columns to consider. If null, all numeric columns are considered.
         * @param zScoreThreshold The z-score threshold for detecting outliers.
         *
         * @result newTable The table without rows containing outliers in the specified columns.
         *
         * @example
         * pipeline example {
         *     val table = Table(
         *         {
         *             "a": [1, 2, 3, 4, 5, 6, 1000, null],
         *             "b": [1, 2, 3, 4, 5, 6,    7,    8],
         *         }
         *     );
         *     val result = table.removeRowsWithOutliers(zScoreThreshold=2.0);
         *     // Table({"a": [1, 2, 3, 4, 5, 6, null], "b": [1, 2, 3, 4, 5, 6]})
         * }
         */
        @Pure
        @PythonName("remove_rows_with_outliers")
        fun removeRowsWithOutliers(
            @PythonName("column_names") columnNames: List<String>? = null,
            @PythonName("z_score_threshold") zScoreThreshold: Float = 3.0
        ) -> newTable: Table

        /**
         * Return a new table with the rows shuffled.
         *
         * **Note:** The original table is not modified.
         *
         * @result newTable The table with the rows shuffled.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.shuffleRows();
         *     // Table({"a": [3, 2, 1], "b": [6, 5, 4]})
         * }
         */
        @Pure
        @PythonName("shuffle_rows")
        fun shuffleRows() -> newTable: Table

        /**
         * Return a new table with a slice of rows.
         *
         * **Note:** The original table is not modified.
         *
         * @param start The start index of the slice.
         * @param length The length of the slice. If null, the slice contains all rows starting from `start`. Must greater than or
         * equal to 0.
         *
         * @result newTable The table with the slice of rows.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.sliceRows(start=1);
         *     // Table({"a": [2, 3], "b": [5, 6]})
         * }
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.sliceRows(start=1, length=1);
         *     // Table({"a": [2], "b": [5]})
         * }
         */
        @Pure
        @PythonName("slice_rows")
        fun sliceRows(
            start: Int = 0,
            length: Int? = null
        ) -> newTable: Table

        /**
         * Return a new table with the rows sorted.
         *
         * **Note:** The original table is not modified.
         *
         * @param keySelector The function that selects the key to sort by.
         * @param descending Whether to sort in descending order.
         *
         * @result newTable The table with the rows sorted.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [2, 1, 3], "b": [1, 1, 2]});
         *     val result = table.sortRows((row) -> row.getValue("a").^sub(row.getValue("b")));
         *     // Table({"a": [1, 2, 3], "b": [1, 1, 2]})
         * }
         */
        @Pure
        @PythonName("sort_rows")
        fun sortRows(
            @PythonName("key_selector") keySelector: (row: Row) -> key: Cell,
            descending: Boolean = false
        ) -> newTable: Table

        /**
         * Return a new table with the rows sorted by a specific column.
         *
         * **Note:** The original table is not modified.
         *
         * @param name The name of the column to sort by.
         * @param descending Whether to sort in descending order.
         *
         * @result newTable The table with the rows sorted by the specified column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [2, 1, 3], "b": [1, 1, 2]});
         *     val result = table.sortRowsByColumn("a");
         *     // Table({"a": [1, 2, 3], "b": [1, 1, 2]})
         * }
         */
        @Pure
        @PythonName("sort_rows_by_column")
        fun sortRowsByColumn(
            name: String,
            descending: Boolean = false
        ) -> newTable: Table

        /**
         * Create two tables by splitting the rows of the current table.
         *
         * The first table contains a percentage of the rows specified by `percentage_in_first`, and the second table
         * contains the remaining rows.
         *
         * **Notes:**
         *
         * - The original table is not modified.
         * - By default, the rows are shuffled before splitting. You can disable this by setting `shuffle` to false.
         *
         * @param percentageInFirst The percentage of rows to include in the first table. Must be between 0 and 1.
         * @param shuffle Whether to shuffle the rows before splitting.
         *
         * @result firstTable The first table.
         * @result secondTable The second table.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3, 4, 5], "b": [6, 7, 8, 9, 10]});
         *     val firstTable, val secondTable = table.splitRows(0.6);
         * }
         */
        @Pure
        @PythonName("split_rows")
        fun splitRows(
            @PythonName("percentage_in_first") percentageInFirst: Float,
            shuffle: Boolean = true
        ) -> (firstTable: Table, secondTable: Table)

        /**
         * Return a new table with the columns of another table added.
         *
         * **Notes:**
         *
         * - The original tables are not modified.
         * - This operation must fully load the data into memory, which can be expensive.
         *
         * @param other The table to add as columns.
         *
         * @result newTable The table with the columns added.
         *
         * @example
         * pipeline example {
         *     val table1 = Table({"a": [1, 2, 3]});
         *     val table2 = Table({"b": [4, 5, 6]});
         *     val result = table1.addTableAsColumns(table2);
         *     // Table({"a": [1, 2, 3], "b": [4, 5, 6]})
         * }
         */
        @Pure
        @PythonName("add_table_as_columns")
        fun addTableAsColumns(
            other: Table
        ) -> newTable: Table

        /**
         * Return a new table with the rows of another table added.
         *
         * **Notes:**
         *
         * - The original tables are not modified.
         * - This operation must fully load the data into memory, which can be expensive.
         *
         * @param other The table to add as rows.
         *
         * @result newTable The table with the rows added.
         *
         * @example
         * pipeline example {
         *     val table1 = Table({"a": [1, 2, 3]});
         *     val table2 = Table({"a": [4, 5, 6]});
         *     val result = table1.addTableAsRows(table2);
         *     // Table({"a": [1, 2, 3, 4, 5, 6]})
         * }
         */
        @Pure
        @PythonName("add_table_as_rows")
        fun addTableAsRows(
            other: Table
        ) -> newTable: Table

        /**
         * Return a new table inverse-transformed by a **fitted, invertible** transformer.
         *
         * **Notes:**
         *
         * - The original table is not modified.
         * - Depending on the transformer, this operation might fully load the data into memory, which can be expensive.
         *
         * @param fittedTransformer The fitted, invertible transformer to apply.
         *
         * @result newTable The inverse-transformed table.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3]});
         *     val transformer, val transformedTable = RangeScaler(min=0.0, max=1.0).fitAndTransform(table, ["a"]);
         *     val result = transformedTable.inverseTransformTable(transformer);
         *     // Table({"a": [1, 2, 3]})
         * }
         */
        @Pure
        @PythonName("inverse_transform_table")
        fun inverseTransformTable(
            @PythonName("fitted_transformer") fittedTransformer: InvertibleTableTransformer
        ) -> newTable: Table

        /**
         * Return a new table transformed by a **fitted** transformer.
         *
         * **Notes:**
         *
         * - The original table is not modified.
         * - Depending on the transformer, this operation might fully load the data into memory, which can be expensive.
         *
         * @param fittedTransformer The fitted transformer to apply.
         *
         * @result newTable The transformed table.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3]});
         *     val transformer = RangeScaler(min=0.0, max=1.0).fit(table, ["a"]);
         *     val result = table.transformTable(transformer);
         *     // Table({"a": [0, 0.5, 1]})
         * }
         */
        @Pure
        @PythonName("transform_table")
        fun transformTable(
            @PythonName("fitted_transformer") fittedTransformer: TableTransformer
        ) -> newTable: Table

        /**
         * Return a table with important statistics about this table.
         *
         * @result statistics The table with statistics.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 3]});
         *     val result = table.summarizeStatistics();
         * }
         */
        @Pure
        @PythonName("summarize_statistics")
        fun summarizeStatistics() -> statistics: Table

        /**
         * Return the data of the table as a list of columns.
         *
         * @result columns List of columns.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val columns = table.toColumns();
         * }
         */
        @Pure
        @PythonName("to_columns")
        fun toColumns() -> columns: List<Column>

        /**
         * Write the table to a CSV file.
         *
         * If the file and/or the parent directories do not exist, they will be created. If the file exists already, it
         * will be overwritten.
         *
         * @param path The path to the CSV file. If the file extension is omitted, it is assumed to be ".csv".
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     table.toCsvFile("output.csv");
         * }
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_csv_file")
        fun toCsvFile(
            path: String
        )

        /**
         * Return a map that maps column names to column values.
         *
         * @result map Map representation of the table.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     val result = table.toMap();
         *     // {"a": [1, 2, 3], "b": [4, 5, 6]}
         * }
         */
        @Pure
        @PythonName("to_dict")
        fun toMap() -> map: Map<String, List<Any>>

        /**
         * Write the table to a JSON file.
         *
         * If the file and/or the parent directories do not exist, they will be created. If the file exists already, it
         * will be overwritten.
         *
         * **Note:** This operation must fully load the data into memory, which can be expensive.
         *
         * @param path The path to the JSON file. If the file extension is omitted, it is assumed to be ".json".
         * @param orientation The orientation of the JSON file. If "column", the JSON file will be structured as a list of columns. If
         * "row", the JSON file will be structured as a list of rows. Row orientation is more human-readable, but
         * slower and less memory-efficient.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     table.toJsonFile("output.json");
         * }
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_json_file")
        fun toJsonFile(
            path: String,
            orientation: literal<"column", "row"> = "column"
        )

        /**
         * Write the table to a Parquet file.
         *
         * If the file and/or the parent directories do not exist, they will be created. If the file exists already, it
         * will be overwritten.
         *
         * @param path The path to the Parquet file. If the file extension is omitted, it is assumed to be ".parquet".
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
         *     table.toParquetFile("output.parquet");
         * }
         */
        @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
        @PythonName("to_parquet_file")
        fun toParquetFile(
            path: String
        )

        /**
         * Return a new `TabularDataset` with columns marked as a target, feature, or extra.
         *
         * - The target column is the column that a model should predict.
         * - Feature columns are columns that a model should use to make predictions.
         * - Extra columns are columns that are neither feature nor target. They can be used to provide additional context,
         *   like an ID column.
         *
         * Feature columns are implicitly defined as all columns except the target and extra columns. If no extra columns
         * are specified, all columns except the target column are used as features.
         *
         * @param targetName Name of the target column.
         * @param extraNames Names of the columns that are neither feature nor target. If null, no extra columns are used, i.e. all but
         * the target column are used as features.
         *
         * @result dataset A new tabular dataset with the given target and feature names.
         *
         * @example
         * pipeline example {
         *     val table = Table(
         *         {
         *             "item": ["apple", "milk", "beer"],
         *             "price": [1.10, 1.19, 1.79],
         *             "amount_bought": [74, 72, 51],
         *         }
         *     );
         *     val dataset = table.toTabularDataset(targetName="amount_bought", extraNames=["item"]);
         * }
         */
        @Pure
        @PythonName("to_tabular_dataset")
        fun toTabularDataset(
            @PythonName("target_name") targetName: String,
            @PythonName("extra_names") extraNames: List<String>? = null
        ) -> dataset: TabularDataset

        /**
         * Return a new `TimeSeriesDataset` with columns marked as a target column, time or feature columns.
         *
         * The original table is not modified.
         *
         * @param targetName Name of the target column.
         * @param timeName Name of the time column.
         * @param extraNames Names of the columns that are neither features nor target. If null, no extra columns are used, i.e. all but
         * the target column are used as features.
         *
         * @result dataset A new time series dataset with the given target and feature names.
         *
         * @example
         * pipeline example {
         *     val table = Table(
         *         {
         *             "day": [0, 1, 2],
         *             "price": [1.10, 1.19, 1.79],
         *             "amount_bought": [74, 72, 51],
         *         }
         *     );
         *     val dataset = table.toTimeSeriesDataset(targetName="amount_bought", timeName= "day");
         * }
         */
        @Pure
        @PythonName("to_time_series_dataset")
        fun toTimeSeriesDataset(
            @PythonName("target_name") targetName: String,
            @PythonName("time_name") timeName: String,
            @PythonName("extra_names") extraNames: List<String>? = null
        ) -> dataset: TimeSeriesDataset
    }
    ```

## `#!sds attr` columnCount {#safeds.data.tabular.containers.Table.columnCount data-toc-label='columnCount'}

The number of columns in the table.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` columnNames {#safeds.data.tabular.containers.Table.columnNames data-toc-label='columnNames'}

The names of the columns in the table.

**Type:** [`List<String>`][safeds.lang.List]

## `#!sds attr` plot {#safeds.data.tabular.containers.Table.plot data-toc-label='plot'}

The plotter for the table.

**Type:** [`TablePlotter`][safeds.data.tabular.plotting.TablePlotter]

## `#!sds attr` rowCount {#safeds.data.tabular.containers.Table.rowCount data-toc-label='rowCount'}

The number of rows in the table.

**Note:** This operation must fully load the data into memory, which can be expensive.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` schema {#safeds.data.tabular.containers.Table.schema data-toc-label='schema'}

The schema of the table.

**Type:** [`Schema`][safeds.data.tabular.typing.Schema]

## `#!sds fun` addColumns {#safeds.data.tabular.containers.Table.addColumns data-toc-label='addColumns'}

Return a new table with additional columns.

**Notes:**

- The original table is not modified.
- This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<Column<Any?>, List<Column<Any?>>>` | The columns to add. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the additional columns. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val table = Table({"a": [1, 2, 3]});
    val newColumn = Column("b", [4, 5, 6]);
    val result = table.addColumns(newColumn);
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="172"
    @Pure
    @PythonName("add_columns")
    fun addColumns(
        columns: union<Column, List<Column>>
    ) -> newTable: Table
    ```

## `#!sds fun` addComputedColumn {#safeds.data.tabular.containers.Table.addComputedColumn data-toc-label='addComputedColumn'}

Return a new table with an additional computed column.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the new column. | - |
| `computer` | `#!sds (row: Row) -> (computedCell: Cell<Any?>)` | The function that computes the values of the new column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the computed column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.addComputedColumn("c", (row) -> row.getValue("a").add(row.getValue("b")));
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="194"
    @Pure
    @PythonName("add_computed_column")
    fun addComputedColumn(
        name: String,
        computer: (row: Row) -> computedCell: Cell
    ) -> newTable: Table
    ```

## `#!sds fun` addTableAsColumns {#safeds.data.tabular.containers.Table.addTableAsColumns data-toc-label='addTableAsColumns'}

Return a new table with the columns of another table added.

**Notes:**

- The original tables are not modified.
- This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Table`][safeds.data.tabular.containers.Table] | The table to add as columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the columns added. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val table1 = Table({"a": [1, 2, 3]});
    val table2 = Table({"b": [4, 5, 6]});
    val result = table1.addTableAsColumns(table2);
    // Table({"a": [1, 2, 3], "b": [4, 5, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="699"
    @Pure
    @PythonName("add_table_as_columns")
    fun addTableAsColumns(
        other: Table
    ) -> newTable: Table
    ```

## `#!sds fun` addTableAsRows {#safeds.data.tabular.containers.Table.addTableAsRows data-toc-label='addTableAsRows'}

Return a new table with the rows of another table added.

**Notes:**

- The original tables are not modified.
- This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Table`][safeds.data.tabular.containers.Table] | The table to add as rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the rows added. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val table1 = Table({"a": [1, 2, 3]});
    val table2 = Table({"a": [4, 5, 6]});
    val result = table1.addTableAsRows(table2);
    // Table({"a": [1, 2, 3, 4, 5, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="725"
    @Pure
    @PythonName("add_table_as_rows")
    fun addTableAsRows(
        other: Table
    ) -> newTable: Table
    ```

## `#!sds fun` getColumn {#safeds.data.tabular.containers.Table.getColumn data-toc-label='getColumn'}

Get a column from the table.

**Note:** This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.getColumn("a");
    // Column("a", [1, 2, 3])
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="217"
    @Pure
    @PythonName("get_column")
    fun getColumn(
        name: String
    ) -> column: Column
    ```

## `#!sds fun` getColumnType {#safeds.data.tabular.containers.Table.getColumnType data-toc-label='getColumnType'}

Get the data type of a column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `type` | [`DataType`][safeds.data.tabular.typing.DataType] | The data type of the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.getColumnType("a");
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="236"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        name: String
    ) -> type: DataType
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.containers.Table.hasColumn data-toc-label='hasColumn'}

Check if the table has a column with a specific name.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `hasColumn` | [`Boolean`][safeds.lang.Boolean] | Whether the table has a column with the specified name. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.hasColumn("a"); // true
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="255"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        name: String
    ) -> hasColumn: Boolean
    ```

## `#!sds fun` inverseTransformTable {#safeds.data.tabular.containers.Table.inverseTransformTable data-toc-label='inverseTransformTable'}

Return a new table inverse-transformed by a **fitted, invertible** transformer.

**Notes:**

- The original table is not modified.
- Depending on the transformer, this operation might fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `fittedTransformer` | [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer] | The fitted, invertible transformer to apply. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The inverse-transformed table. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val table = Table({"a": [1, 2, 3]});
    val transformer, val transformedTable = RangeScaler(min=0.0, max=1.0).fitAndTransform(table, ["a"]);
    val result = transformedTable.inverseTransformTable(transformer);
    // Table({"a": [1, 2, 3]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="751"
    @Pure
    @PythonName("inverse_transform_table")
    fun inverseTransformTable(
        @PythonName("fitted_transformer") fittedTransformer: InvertibleTableTransformer
    ) -> newTable: Table
    ```

## `#!sds fun` removeColumns {#safeds.data.tabular.containers.Table.removeColumns data-toc-label='removeColumns'}

Return a new table without the specified columns.

**Notes:**

- The original table is not modified.
- This method does not raise if a column does not exist. You can use it to ensure that the resulting table does
  not contain certain columns.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `names` | `#!sds union<List<String>, String>` | The names of the columns to remove. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the columns removed. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.removeColumns("a");
    // Table({"b": [4, 5, 6]})
}
```
```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.removeColumns("c");
    // Table({"a": [1, 2, 3], "b": [4, 5, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="288"
    @Pure
    @PythonName("remove_columns")
    fun removeColumns(
        names: union<List<String>, String>
    ) -> newTable: Table
    ```

## `#!sds fun` removeColumnsExcept {#safeds.data.tabular.containers.Table.removeColumnsExcept data-toc-label='removeColumnsExcept'}

Return a new table with only the specified columns.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `names` | `#!sds union<List<String>, String>` | The names of the columns to keep. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with only the specified columns. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.removeColumnsExcept("a");
    // Table({"a": [1, 2, 3]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="308"
    @Pure
    @PythonName("remove_columns_except")
    fun removeColumnsExcept(
        names: union<List<String>, String>
    ) -> newTable: Table
    ```

## `#!sds fun` removeColumnsWithMissingValues {#safeds.data.tabular.containers.Table.removeColumnsWithMissingValues data-toc-label='removeColumnsWithMissingValues'}

Return a new table without columns that contain missing values.

**Notes:**

- The original table is not modified.
- This operation must fully load the data into memory, which can be expensive.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table without columns containing missing values. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, null]});
    val result = table.removeColumnsWithMissingValues();
    // Table({"a": [1, 2, 3]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="331"
    @Pure
    @PythonName("remove_columns_with_missing_values")
    fun removeColumnsWithMissingValues() -> newTable: Table
    ```

## `#!sds fun` removeDuplicateRows {#safeds.data.tabular.containers.Table.removeDuplicateRows data-toc-label='removeDuplicateRows'}

Return a new table without duplicate rows.

**Note:** The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table without duplicate rows. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 2], "b": [4, 5, 5]});
    val result = table.removeDuplicateRows();
    // Table({"a": [1, 2], "b": [4, 5]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="439"
    @Pure
    @PythonName("remove_duplicate_rows")
    fun removeDuplicateRows() -> newTable: Table
    ```

## `#!sds fun` removeNonNumericColumns {#safeds.data.tabular.containers.Table.removeNonNumericColumns data-toc-label='removeNonNumericColumns'}

Return a new table without non-numeric columns.

**Note:** The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table without non-numeric columns. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": ["4", "5", "6"]});
    val result = table.removeNonNumericColumns();
    // Table({"a": [1, 2, 3]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="349"
    @Pure
    @PythonName("remove_non_numeric_columns")
    fun removeNonNumericColumns() -> newTable: Table
    ```

## `#!sds fun` removeRows {#safeds.data.tabular.containers.Table.removeRows data-toc-label='removeRows'}

Return a new table without rows that satisfy a condition.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `query` | `#!sds (row: Row) -> (shouldRemoveRow: Cell<Boolean>)` | The function that determines which rows to remove. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table without the specified rows. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.removeRows((row) -> row.getValue("a").eq(2));
    // Table({"a": [1, 3], "b": [4, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="459"
    @Pure
    @PythonName("remove_rows")
    fun removeRows(
        query: (row: Row) -> shouldRemoveRow: Cell<Boolean>
    ) -> newTable: Table
    ```

## `#!sds fun` removeRowsByColumn {#safeds.data.tabular.containers.Table.removeRowsByColumn data-toc-label='removeRowsByColumn'}

Return a new table without rows that satisfy a condition on a specific column.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |
| `query` | `#!sds (cell: Cell<Any?>) -> (shouldRemoveRow: Cell<Boolean>)` | The function that determines which rows to remove. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table without the specified rows. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.removeRowsByColumn("a", (cell) -> cell.eq(2));
    // Table({"a": [1, 3], "b": [4, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="482"
    @Pure
    @PythonName("remove_rows_by_column")
    fun removeRowsByColumn(
        name: String,
        query: (cell: Cell) -> shouldRemoveRow: Cell<Boolean>
    ) -> newTable: Table
    ```

## `#!sds fun` removeRowsWithMissingValues {#safeds.data.tabular.containers.Table.removeRowsWithMissingValues data-toc-label='removeRowsWithMissingValues'}

Return a new table without rows containing missing values in the specified columns.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>?`][safeds.lang.List] | Names of the columns to consider. If null, all columns are considered. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table without rows containing missing values in the specified columns. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, null, 3], "b": [4, 5, null]});
    val result = table.removeRowsWithMissingValues();
    // Table({"a": [1], "b": [4]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="505"
    @Pure
    @PythonName("remove_rows_with_missing_values")
    fun removeRowsWithMissingValues(
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> newTable: Table
    ```

## `#!sds fun` removeRowsWithOutliers {#safeds.data.tabular.containers.Table.removeRowsWithOutliers data-toc-label='removeRowsWithOutliers'}

Return a new table without rows containing outliers in the specified columns.

Whether a data point is an outlier in a column is determined by its z-score. The z-score the distance of the
data point from the mean of the column divided by the standard deviation of the column. If the z-score is
greater than the given threshold, the data point is considered an outlier. Missing values are ignored during the
calculation of the z-score.

The z-score is only defined for numeric columns. Non-numeric columns are ignored, even if they are specified in
`column_names`.

**Notes:**

- The original table is not modified.
- This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>?`][safeds.lang.List] | Names of the columns to consider. If null, all numeric columns are considered. | `#!sds null` |
| `zScoreThreshold` | [`Float`][safeds.lang.Float] | The z-score threshold for detecting outliers. | `#!sds 3.0` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table without rows containing outliers in the specified columns. |

**Examples:**

```sds hl_lines="8"
pipeline example {
    val table = Table(
        {
            "a": [1, 2, 3, 4, 5, 6, 1000, null],
            "b": [1, 2, 3, 4, 5, 6,    7,    8],
        }
    );
    val result = table.removeRowsWithOutliers(zScoreThreshold=2.0);
    // Table({"a": [1, 2, 3, 4, 5, 6, null], "b": [1, 2, 3, 4, 5, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="544"
    @Pure
    @PythonName("remove_rows_with_outliers")
    fun removeRowsWithOutliers(
        @PythonName("column_names") columnNames: List<String>? = null,
        @PythonName("z_score_threshold") zScoreThreshold: Float = 3.0
    ) -> newTable: Table
    ```

## `#!sds fun` renameColumn {#safeds.data.tabular.containers.Table.renameColumn data-toc-label='renameColumn'}

Return a new table with a column renamed.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldName` | [`String`][safeds.lang.String] | The name of the column to rename. | - |
| `newName` | [`String`][safeds.lang.String] | The new name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the column renamed. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.renameColumn("a", "c");
    // Table({"c": [1, 2, 3], "b": [4, 5, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="370"
    @Pure
    @PythonName("rename_column")
    fun renameColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_name") newName: String
    ) -> newTable: Table
    ```

## `#!sds fun` replaceColumn {#safeds.data.tabular.containers.Table.replaceColumn data-toc-label='replaceColumn'}

Return a new table with a column replaced by zero or more columns.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldName` | [`String`][safeds.lang.String] | The name of the column to replace. | - |
| `newColumns` | `#!sds union<Column<Any?>, List<Column<Any?>>, Table>` | The new columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the column replaced. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.replaceColumn("a", []);
    // Table({"b": [4, 5, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="394"
    @Pure
    @PythonName("replace_column")
    fun replaceColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_columns") newColumns: union<Column, List<Column>, Table>
    ) -> newTable: Table
    ```

## `#!sds fun` shuffleRows {#safeds.data.tabular.containers.Table.shuffleRows data-toc-label='shuffleRows'}

Return a new table with the rows shuffled.

**Note:** The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the rows shuffled. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.shuffleRows();
    // Table({"a": [3, 2, 1], "b": [6, 5, 4]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="565"
    @Pure
    @PythonName("shuffle_rows")
    fun shuffleRows() -> newTable: Table
    ```

## `#!sds fun` sliceRows {#safeds.data.tabular.containers.Table.sliceRows data-toc-label='sliceRows'}

Return a new table with a slice of rows.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `start` | [`Int`][safeds.lang.Int] | The start index of the slice. | `#!sds 0` |
| `length` | [`Int?`][safeds.lang.Int] | The length of the slice. If null, the slice contains all rows starting from `start`. Must greater than or equal to 0. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the slice of rows. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.sliceRows(start=1);
    // Table({"a": [2, 3], "b": [5, 6]})
}
```
```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.sliceRows(start=1, length=1);
    // Table({"a": [2], "b": [5]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="594"
    @Pure
    @PythonName("slice_rows")
    fun sliceRows(
        start: Int = 0,
        length: Int? = null
    ) -> newTable: Table
    ```

## `#!sds fun` sortRows {#safeds.data.tabular.containers.Table.sortRows data-toc-label='sortRows'}

Return a new table with the rows sorted.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `keySelector` | `#!sds (row: Row) -> (key: Cell<Any?>)` | The function that selects the key to sort by. | - |
| `descending` | [`Boolean`][safeds.lang.Boolean] | Whether to sort in descending order. | `#!sds false` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the rows sorted. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [2, 1, 3], "b": [1, 1, 2]});
    val result = table.sortRows((row) -> row.getValue("a").^sub(row.getValue("b")));
    // Table({"a": [1, 2, 3], "b": [1, 1, 2]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="618"
    @Pure
    @PythonName("sort_rows")
    fun sortRows(
        @PythonName("key_selector") keySelector: (row: Row) -> key: Cell,
        descending: Boolean = false
    ) -> newTable: Table
    ```

## `#!sds fun` sortRowsByColumn {#safeds.data.tabular.containers.Table.sortRowsByColumn data-toc-label='sortRowsByColumn'}

Return a new table with the rows sorted by a specific column.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column to sort by. | - |
| `descending` | [`Boolean`][safeds.lang.Boolean] | Whether to sort in descending order. | `#!sds false` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the rows sorted by the specified column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [2, 1, 3], "b": [1, 1, 2]});
    val result = table.sortRowsByColumn("a");
    // Table({"a": [1, 2, 3], "b": [1, 1, 2]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="642"
    @Pure
    @PythonName("sort_rows_by_column")
    fun sortRowsByColumn(
        name: String,
        descending: Boolean = false
    ) -> newTable: Table
    ```

## `#!sds fun` splitRows {#safeds.data.tabular.containers.Table.splitRows data-toc-label='splitRows'}

Create two tables by splitting the rows of the current table.

The first table contains a percentage of the rows specified by `percentage_in_first`, and the second table
contains the remaining rows.

**Notes:**

- The original table is not modified.
- By default, the rows are shuffled before splitting. You can disable this by setting `shuffle` to false.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `percentageInFirst` | [`Float`][safeds.lang.Float] | The percentage of rows to include in the first table. Must be between 0 and 1. | - |
| `shuffle` | [`Boolean`][safeds.lang.Boolean] | Whether to shuffle the rows before splitting. | `#!sds true` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `firstTable` | [`Table`][safeds.data.tabular.containers.Table] | The first table. |
| `secondTable` | [`Table`][safeds.data.tabular.containers.Table] | The second table. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3, 4, 5], "b": [6, 7, 8, 9, 10]});
    val firstTable, val secondTable = table.splitRows(0.6);
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="672"
    @Pure
    @PythonName("split_rows")
    fun splitRows(
        @PythonName("percentage_in_first") percentageInFirst: Float,
        shuffle: Boolean = true
    ) -> (firstTable: Table, secondTable: Table)
    ```

## `#!sds fun` summarizeStatistics {#safeds.data.tabular.containers.Table.summarizeStatistics data-toc-label='summarizeStatistics'}

Return a table with important statistics about this table.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `statistics` | [`Table`][safeds.data.tabular.containers.Table] | The table with statistics. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 3]});
    val result = table.summarizeStatistics();
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="794"
    @Pure
    @PythonName("summarize_statistics")
    fun summarizeStatistics() -> statistics: Table
    ```

## `#!sds fun` toColumns {#safeds.data.tabular.containers.Table.toColumns data-toc-label='toColumns'}

Return the data of the table as a list of columns.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `columns` | [`List<Column<Any?>>`][safeds.lang.List] | List of columns. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val columns = table.toColumns();
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="809"
    @Pure
    @PythonName("to_columns")
    fun toColumns() -> columns: List<Column>
    ```

## `#!sds fun` toCsvFile {#safeds.data.tabular.containers.Table.toCsvFile data-toc-label='toCsvFile'}

Write the table to a CSV file.

If the file and/or the parent directories do not exist, they will be created. If the file exists already, it
will be overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the CSV file. If the file extension is omitted, it is assumed to be ".csv". | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    table.toCsvFile("output.csv");
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="827"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_csv_file")
    fun toCsvFile(
        path: String
    )
    ```

## `#!sds fun` toJsonFile {#safeds.data.tabular.containers.Table.toJsonFile data-toc-label='toJsonFile'}

Write the table to a JSON file.

If the file and/or the parent directories do not exist, they will be created. If the file exists already, it
will be overwritten.

**Note:** This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the JSON file. If the file extension is omitted, it is assumed to be ".json". | - |
| `orientation` | `#!sds literal<"column", "row">` | The orientation of the JSON file. If "column", the JSON file will be structured as a list of columns. If "row", the JSON file will be structured as a list of rows. Row orientation is more human-readable, but slower and less memory-efficient. | `#!sds "column"` |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    table.toJsonFile("output.json");
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="868"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_json_file")
    fun toJsonFile(
        path: String,
        orientation: literal<"column", "row"> = "column"
    )
    ```

## `#!sds fun` toMap {#safeds.data.tabular.containers.Table.toMap data-toc-label='toMap'}

Return a map that maps column names to column values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `map` | [`Map<String, List<Any>>`][safeds.lang.Map] | Map representation of the table. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.toMap();
    // {"a": [1, 2, 3], "b": [4, 5, 6]}
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="845"
    @Pure
    @PythonName("to_dict")
    fun toMap() -> map: Map<String, List<Any>>
    ```

## `#!sds fun` toParquetFile {#safeds.data.tabular.containers.Table.toParquetFile data-toc-label='toParquetFile'}

Write the table to a Parquet file.

If the file and/or the parent directories do not exist, they will be created. If the file exists already, it
will be overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the Parquet file. If the file extension is omitted, it is assumed to be ".parquet". | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    table.toParquetFile("output.parquet");
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="889"
    @Impure([ImpurityReason.FileWriteToParameterizedPath("path")])
    @PythonName("to_parquet_file")
    fun toParquetFile(
        path: String
    )
    ```

## `#!sds fun` toTabularDataset {#safeds.data.tabular.containers.Table.toTabularDataset data-toc-label='toTabularDataset'}

Return a new `TabularDataset` with columns marked as a target, feature, or extra.

- The target column is the column that a model should predict.
- Feature columns are columns that a model should use to make predictions.
- Extra columns are columns that are neither feature nor target. They can be used to provide additional context,
  like an ID column.

Feature columns are implicitly defined as all columns except the target and extra columns. If no extra columns
are specified, all columns except the target column are used as features.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `extraNames` | [`List<String>?`][safeds.lang.List] | Names of the columns that are neither feature nor target. If null, no extra columns are used, i.e. all but the target column are used as features. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `dataset` | [`TabularDataset`][safeds.data.labeled.containers.TabularDataset] | A new tabular dataset with the given target and feature names. |

**Examples:**

```sds hl_lines="9"
pipeline example {
    val table = Table(
        {
            "item": ["apple", "milk", "beer"],
            "price": [1.10, 1.19, 1.79],
            "amount_bought": [74, 72, 51],
        }
    );
    val dataset = table.toTabularDataset(targetName="amount_bought", extraNames=["item"]);
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="924"
    @Pure
    @PythonName("to_tabular_dataset")
    fun toTabularDataset(
        @PythonName("target_name") targetName: String,
        @PythonName("extra_names") extraNames: List<String>? = null
    ) -> dataset: TabularDataset
    ```

## `#!sds fun` toTimeSeriesDataset {#safeds.data.tabular.containers.Table.toTimeSeriesDataset data-toc-label='toTimeSeriesDataset'}

Return a new `TimeSeriesDataset` with columns marked as a target column, time or feature columns.

The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `timeName` | [`String`][safeds.lang.String] | Name of the time column. | - |
| `extraNames` | [`List<String>?`][safeds.lang.List] | Names of the columns that are neither features nor target. If null, no extra columns are used, i.e. all but the target column are used as features. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `dataset` | [`TimeSeriesDataset`][safeds.data.labeled.containers.TimeSeriesDataset] | A new time series dataset with the given target and feature names. |

**Examples:**

```sds hl_lines="9"
pipeline example {
    val table = Table(
        {
            "day": [0, 1, 2],
            "price": [1.10, 1.19, 1.79],
            "amount_bought": [74, 72, 51],
        }
    );
    val dataset = table.toTimeSeriesDataset(targetName="amount_bought", timeName= "day");
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="955"
    @Pure
    @PythonName("to_time_series_dataset")
    fun toTimeSeriesDataset(
        @PythonName("target_name") targetName: String,
        @PythonName("time_name") timeName: String,
        @PythonName("extra_names") extraNames: List<String>? = null
    ) -> dataset: TimeSeriesDataset
    ```

## `#!sds fun` transformColumn {#safeds.data.tabular.containers.Table.transformColumn data-toc-label='transformColumn'}

Return a new table with a column transformed.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column to transform. | - |
| `transformer` | `#!sds (cell: Cell<Any?>) -> (transformedCell: Cell<Any?>)` | The function that transforms the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The table with the transformed column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3], "b": [4, 5, 6]});
    val result = table.transformColumn("a", (cell) -> cell.add(1));
    // Table({"a": [2, 3, 4], "b": [4, 5, 6]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="418"
    @Pure
    @PythonName("transform_column")
    fun transformColumn(
        name: String,
        transformer: (cell: Cell) -> transformedCell: Cell
    ) -> newTable: Table
    ```

## `#!sds fun` transformTable {#safeds.data.tabular.containers.Table.transformTable data-toc-label='transformTable'}

Return a new table transformed by a **fitted** transformer.

**Notes:**

- The original table is not modified.
- Depending on the transformer, this operation might fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `fittedTransformer` | [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer] | The fitted transformer to apply. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val table = Table({"a": [1, 2, 3]});
    val transformer = RangeScaler(min=0.0, max=1.0).fit(table, ["a"]);
    val result = table.transformTable(transformer);
    // Table({"a": [0, 0.5, 1]})
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="777"
    @Pure
    @PythonName("transform_table")
    fun transformTable(
        @PythonName("fitted_transformer") fittedTransformer: TableTransformer
    ) -> newTable: Table
    ```

## `#!sds static fun` fromColumns {#safeds.data.tabular.containers.Table.fromColumns data-toc-label='fromColumns'}

Create a table from a list of columns.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<Column<Any?>, List<Column<Any?>>>` | The columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The created table. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    val a = Column("a", [1, 2, 3]);
    val b = Column("b", [4, 5, 6]);
    val result = Table.fromColumns([a, b]);
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="72"
    @Pure
    @PythonName("from_columns")
    static fun fromColumns(
        columns: union<Column, List<Column>>
    ) -> table: Table
    ```

## `#!sds static fun` fromCsvFile {#safeds.data.tabular.containers.Table.fromCsvFile data-toc-label='fromCsvFile'}

Create a table from a CSV file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the CSV file. If the file extension is omitted, it is assumed to be ".csv". | - |
| `separator` | [`String`][safeds.lang.String] | The separator between the values in the CSV file. | `#!sds ","` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The created table. |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val result = Table.fromCsvFile("input.csv");
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="91"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_csv_file")
    static fun fromCsvFile(
        path: String,
        separator: String = ","
    ) -> table: Table
    ```

## `#!sds static fun` fromJsonFile {#safeds.data.tabular.containers.Table.fromJsonFile data-toc-label='fromJsonFile'}

Create a table from a JSON file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the JSON file. If the file extension is omitted, it is assumed to be ".json". | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The created table. |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val result = Table.fromJsonFile("input.json");
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="129"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_json_file")
    static fun fromJsonFile(
        path: String
    ) -> table: Table
    ```

## `#!sds static fun` fromMap {#safeds.data.tabular.containers.Table.fromMap data-toc-label='fromMap'}

Create a table from a map that maps column names to column values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>`][safeds.lang.Map] | The data. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The generated table. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val data = {"a'": [1, 2, 3], "b": [4, 5, 6]};
    val result = Table.fromMap(data);
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="111"
    @Pure
    @PythonName("from_dict")
    static fun fromMap(
        data: Map<String, List<Any>>
    ) -> table: Table
    ```

## `#!sds static fun` fromParquetFile {#safeds.data.tabular.containers.Table.fromParquetFile data-toc-label='fromParquetFile'}

Create a table from a Parquet file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the Parquet file. If the file extension is omitted, it is assumed to be ".parquet". | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The created table. |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val result = Table.fromParquetFile("input.parquet");
}
```

??? quote "Stub code in `Table.sdsstub`"

    ```sds linenums="147"
    @Impure([ImpurityReason.FileReadFromParameterizedPath("path")])
    @PythonName("from_parquet_file")
    static fun fromParquetFile(
        path: String
    ) -> table: Table
    ```
