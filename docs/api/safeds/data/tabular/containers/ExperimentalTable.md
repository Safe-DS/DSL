# :test_tube:{ title="Experimental" } `#!sds class` ExperimentalTable {#safeds.data.tabular.containers.ExperimentalTable data-toc-label='ExperimentalTable'}

A two-dimensional collection of data. It can either be seen as a list of rows or as a list of columns.

To create a `Table` call the constructor or use one of the following static methods:

| Method                                                                              | Description                            |
| ------------------------------------------------------------------------------------| -------------------------------------- |
| [fromCsvFile][safeds.data.tabular.containers.ExperimentalTable.fromCsvFile]         | Create a table from a CSV file.        |
| [fromJsonFile][safeds.data.tabular.containers.ExperimentalTable.fromJsonFile]       | Create a table from a JSON file.       |
| [fromParquetFile][safeds.data.tabular.containers.ExperimentalTable.fromParquetFile] | Create a table from a Parquet file.    |
| [fromColumns][safeds.data.tabular.containers.ExperimentalTable.fromColumns]         | Create a table from a list of columns. |
| [fromMap][safeds.data.tabular.containers.ExperimentalTable.fromMap]                 | Create a table from a dictionary.      |

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>?`][safeds.lang.Map] | The data of the table. If None, an empty table is created. | `#!sds null` |

**Examples:**

```sds hl_lines="2 3"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="34"
    class ExperimentalTable(
        data: Map<String, List<Any>>? = null
    ) {
        /**
         * The names of the columns in the table.
         */
        @PythonName("column_names") attr columnNames: List<String>
        /**
         * The number of columns in the table.
         */
        @PythonName("number_of_columns") attr numberOfColumns: Int
        /**
         * The number of rows in the table.
         *
         * **Note:** This operation must fully load the data into memory, which can be expensive.
         */
        @PythonName("number_of_rows") attr numberOfRows: Int
        /**
         * The plotter for the table.
         */
        attr plot: ExperimentalTablePlotter
        /**
         * The schema of the table.
         */
        attr `schema`: ExperimentalSchema

        /**
         * Create a table from a list of columns.
         *
         * @param columns The columns.
         *
         * @result table The created table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn, ExperimentalTable
         *     // a = ExperimentalColumn("a", [1, 2, 3])
         *     // b = ExperimentalColumn("b", [4, 5, 6])
         *     // ExperimentalTable.from_columns([a, b])
         * }
         */
        @Pure
        @PythonName("from_columns")
        static fun fromColumns(
            columns: union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>
        ) -> table: ExperimentalTable

        /**
         * Create a table from a CSV file.
         *
         * @param path The path to the CSV file. If the file extension is omitted, it is assumed to be ".csv".
         *
         * @result table The created table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // ExperimentalTable.from_csv_file("./src/resources/from_csv_file.csv")
         * }
         */
        @Pure
        @PythonName("from_csv_file")
        static fun fromCsvFile(
            path: String
        ) -> table: ExperimentalTable

        /**
         * Create a table from a map of column names to column values.
         *
         * @param data The data.
         *
         * @result table The generated table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // data = {'a': [1, 2, 3], 'b': [4, 5, 6]}
         *     // ExperimentalTable.from_dict(data)
         * }
         */
        @Pure
        @PythonName("from_dict")
        static fun fromMap(
            data: Map<String, List<Any>>
        ) -> table: ExperimentalTable

        /**
         * Create a table from a JSON file.
         *
         * @param path The path to the JSON file. If the file extension is omitted, it is assumed to be ".json".
         *
         * @result table The created table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // ExperimentalTable.from_json_file("./src/resources/from_json_file_2.json")
         * }
         */
        @Pure
        @PythonName("from_json_file")
        static fun fromJsonFile(
            path: String
        ) -> table: ExperimentalTable

        /**
         * Create a table from a Parquet file.
         *
         * @param path The path to the Parquet file. If the file extension is omitted, it is assumed to be ".parquet".
         *
         * @result table The created table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // ExperimentalTable.from_parquet_file("./src/resources/from_parquet_file.parquet")
         * }
         */
        @Pure
        @PythonName("from_parquet_file")
        static fun fromParquetFile(
            path: String
        ) -> table: ExperimentalTable

        /**
         * Return a new table with additional columns.
         *
         * **Notes:**
         *
         * * The original table is not modified.
         * * This operation must fully load the data into memory, which can be expensive.
         *
         * @param columns The columns to add.
         *
         * @result newTable The table with the additional columns.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn, ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3]})
         *     // new_column = ExperimentalColumn("b", [4, 5, 6])
         *     // table.add_columns(new_column)
         * }
         */
        @Pure
        @PythonName("add_columns")
        fun addColumns(
            columns: union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>
        ) -> newTable: ExperimentalTable

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.add_computed_column("c", lambda row: row.get_value("a") + row.get_value("b"))
         * }
         */
        @Pure
        @PythonName("add_computed_column")
        fun addComputedColumn(
            name: String,
            computer: (param1: ExperimentalRow) -> result1: ExperimentalCell<Any>
        ) -> newTable: ExperimentalTable

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.get_column("a")
         * }
         */
        @Pure
        @PythonName("get_column")
        fun getColumn(
            name: String
        ) -> column: ExperimentalColumn<Any>

        /**
         * Get the data type of a column.
         *
         * @param name The name of the column.
         *
         * @result type The data type of the column.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.get_column_type("a")
         * }
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            name: String
        ) -> type: ExperimentalDataType

        /**
         * Check if the table has a column with a specific name.
         *
         * @param name The name of the column.
         *
         * @result hasColumn Whether the table has a column with the specified name.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.has_column("a")
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
         * **Note:** The original table is not modified.
         *
         * @param names The names of the columns to remove.
         *
         * @result newTable The table with the columns removed.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.remove_columns("a")
         * }
         */
        @Pure
        @PythonName("remove_columns")
        fun removeColumns(
            names: union<List<String>, String>
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table with only the specified columns.
         *
         * @param names The names of the columns to keep.
         *
         * @result newTable The table with only the specified columns.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.remove_columns_except("a")
         * }
         */
        @Pure
        @PythonName("remove_columns_except")
        fun removeColumnsExcept(
            names: union<List<String>, String>
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table without columns that contain missing values.
         *
         * **Notes:**
         *
         * * The original table is not modified.
         * * This operation must fully load the data into memory, which can be expensive.
         *
         * @result newTable The table without columns containing missing values.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, None]})
         *     // table.remove_columns_with_missing_values()
         * }
         */
        @Pure
        @PythonName("remove_columns_with_missing_values")
        fun removeColumnsWithMissingValues() -> newTable: ExperimentalTable

        /**
         * Return a new table without non-numeric columns.
         *
         * **Note:** The original table is not modified.
         *
         * @result newTable The table without non-numeric columns.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": ["4", "5", "6"]})
         *     // table.remove_non_numeric_columns()
         * }
         */
        @Pure
        @PythonName("remove_non_numeric_columns")
        fun removeNonNumericColumns() -> newTable: ExperimentalTable

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.rename_column("a", "c")
         * }
         */
        @Pure
        @PythonName("rename_column")
        fun renameColumn(
            @PythonName("old_name") oldName: String,
            @PythonName("new_name") newName: String
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table with a column replaced by zero or more columns.
         *
         * **Note:** The original table is not modified.
         *
         * @param oldName The name of the column to replace.
         * @param newColumns The new column or columns.
         *
         * @result newTable The table with the column replaced.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn, ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.replace_column("a", [])
         * }
         */
        @Pure
        @PythonName("replace_column")
        fun replaceColumn(
            @PythonName("old_name") oldName: String,
            @PythonName("new_columns") newColumns: union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>
        ) -> newTable: ExperimentalTable

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.transform_column("a", lambda cell: cell + 1)
         * }
         */
        @Pure
        @PythonName("transform_column")
        fun transformColumn(
            name: String,
            transformer: (param1: ExperimentalCell<Any>) -> result1: ExperimentalCell<Any>
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table without duplicate rows.
         *
         * **Note:** The original table is not modified.
         *
         * @result newTable The table without duplicate rows.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 2], "b": [4, 5, 5]})
         *     // table.remove_duplicate_rows()
         * }
         */
        @Pure
        @PythonName("remove_duplicate_rows")
        fun removeDuplicateRows() -> newTable: ExperimentalTable

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.remove_rows(lambda row: row.get_value("a") == 2)
         * }
         */
        @Pure
        @PythonName("remove_rows")
        fun removeRows(
            query: (param1: ExperimentalRow) -> result1: ExperimentalCell<Boolean>
        ) -> newTable: ExperimentalTable

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.remove_rows_by_column("a", lambda cell: cell == 2)
         * }
         */
        @Pure
        @PythonName("remove_rows_by_column")
        fun removeRowsByColumn(
            name: String,
            query: (param1: ExperimentalCell<Any>) -> result1: ExperimentalCell<Boolean>
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table without rows containing missing values in the specified columns.
         *
         * **Note:** The original table is not modified.
         *
         * @param columnNames Names of the columns to consider. If None, all columns are considered.
         *
         * @result newTable The table without rows containing missing values in the specified columns.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, None, 3], "b": [4, 5, None]})
         *     // table.remove_rows_with_missing_values()
         * }
         */
        @Pure
        @PythonName("remove_rows_with_missing_values")
        fun removeRowsWithMissingValues(
            @PythonName("column_names") columnNames: List<String>? = null
        ) -> newTable: ExperimentalTable

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
         * * The original table is not modified.
         * * This operation must fully load the data into memory, which can be expensive.
         *
         * @param columnNames Names of the columns to consider. If None, all numeric columns are considered.
         * @param zScoreThreshold The z-score threshold for detecting outliers.
         *
         * @result newTable The table without rows containing outliers in the specified columns.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable(
         *     //     {
         *     //         "a": [1, 2, 3, 4, 5, 6, 1000, None],
         *     //         "b": [1, 2, 3, 4, 5, 6,    7,    8],
         *     //     }
         *     // )
         *     // table.remove_rows_with_outliers(z_score_threshold=2)
         * }
         */
        @Pure
        @PythonName("remove_rows_with_outliers")
        fun removeRowsWithOutliers(
            @PythonName("column_names") columnNames: List<String>? = null,
            @PythonName("z_score_threshold") zScoreThreshold: Float = 3.0
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table with the rows shuffled.
         *
         * **Note:** The original table is not modified.
         *
         * @result newTable The table with the rows shuffled.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.shuffle_rows()
         * }
         */
        @Pure
        @PythonName("shuffle_rows")
        fun shuffleRows() -> newTable: ExperimentalTable

        /**
         * Return a new table with a slice of rows.
         *
         * **Note:** The original table is not modified.
         *
         * @param start The start index of the slice.
         * @param length The length of the slice. If None, the slice contains all rows starting from `start`.
         *
         * @result newTable The table with the slice of rows.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.slice_rows(start=1)
         * }
         */
        @Pure
        @PythonName("slice_rows")
        fun sliceRows(
            start: Int = 0,
            length: Int? = null
        ) -> newTable: ExperimentalTable

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [2, 1, 3], "b": [1, 1, 2]})
         *     // table.sort_rows(lambda row: row.get_value("a") - row.get_value("b"))
         * }
         */
        @Pure
        @PythonName("sort_rows")
        fun sortRows(
            @PythonName("key_selector") keySelector: (param1: ExperimentalRow) -> result1: ExperimentalCell<Any>,
            descending: Boolean = false
        ) -> newTable: ExperimentalTable

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [2, 1, 3], "b": [1, 1, 2]})
         *     // table.sort_rows_by_column("a")
         * }
         */
        @Pure
        @PythonName("sort_rows_by_column")
        fun sortRowsByColumn(
            name: String,
            descending: Boolean = false
        ) -> newTable: ExperimentalTable

        /**
         * Create two tables by splitting the rows of the current table.
         *
         * The first table contains a percentage of the rows specified by `percentage_in_first`, and the second table
         * contains the remaining rows.
         *
         * **Note:** The original table is not modified.
         *
         * @param percentageInFirst The percentage of rows to include in the first table. Must be between 0 and 1.
         * @param shuffle Whether to shuffle the rows before splitting.
         *
         * @result firstTable The first table.
         * @result secondTable The second table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3, 4, 5], "b": [6, 7, 8, 9, 10]})
         *     // first_table, second_table = table.split_rows(0.6)
         *     // first_table
         *     // second_table
         * }
         */
        @Pure
        @PythonName("split_rows")
        fun splitRows(
            @PythonName("percentage_in_first") percentageInFirst: Float,
            shuffle: Boolean = true
        ) -> (firstTable: ExperimentalTable, secondTable: ExperimentalTable)

        /**
         * Return a new table with the columns of another table added.
         *
         * **Notes:**
         *
         * * The original tables are not modified.
         * * This operation must fully load the data into memory, which can be expensive.
         *
         * @param other The table to add as columns.
         *
         * @result newTable The table with the columns added.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table1 = ExperimentalTable({"a": [1, 2, 3]})
         *     // table2 = ExperimentalTable({"b": [4, 5, 6]})
         *     // table1.add_table_as_columns(table2)
         * }
         */
        @Pure
        @PythonName("add_table_as_columns")
        fun addTableAsColumns(
            other: ExperimentalTable
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table with the rows of another table added.
         *
         * **Notes:**
         *
         * * The original tables are not modified.
         * * This operation must fully load the data into memory, which can be expensive.
         *
         * @param other The table to add as rows.
         *
         * @result newTable The table with the rows added.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table1 = ExperimentalTable({"a": [1, 2, 3]})
         *     // table2 = ExperimentalTable({"a": [4, 5, 6]})
         *     // table1.add_table_as_rows(table2)
         * }
         */
        @Pure
        @PythonName("add_table_as_rows")
        fun addTableAsRows(
            other: ExperimentalTable
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table inverse-transformed by a **fitted, invertible** transformer.
         *
         * **Notes:**
         *
         * * The original table is not modified.
         * * Depending on the transformer, this operation might fully load the data into memory, which can be expensive.
         *
         * @param fittedTransformer The fitted, invertible transformer to apply.
         *
         * @result newTable The inverse-transformed table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // from safeds.data.tabular.transformation import ExperimentalRangeScaler
         *     // table = ExperimentalTable({"a": [1, 2, 3]})
         *     // transformer, transformed_table = ExperimentalRangeScaler(min_=0, max_=1).fit_and_transform(table, ["a"])
         *     // transformed_table.inverse_transform_table(transformer)
         * }
         */
        @Pure
        @PythonName("inverse_transform_table")
        fun inverseTransformTable(
            @PythonName("fitted_transformer") fittedTransformer: ExperimentalInvertibleTableTransformer
        ) -> newTable: ExperimentalTable

        /**
         * Return a new table transformed by a **fitted** transformer.
         *
         * **Notes:**
         *
         * * The original table is not modified.
         * * Depending on the transformer, this operation might fully load the data into memory, which can be expensive.
         *
         * @param fittedTransformer The fitted transformer to apply.
         *
         * @result newTable The transformed table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // from safeds.data.tabular.transformation import ExperimentalRangeScaler
         *     // table = ExperimentalTable({"a": [1, 2, 3]})
         *     // transformer = ExperimentalRangeScaler(min_=0, max_=1).fit(table, ["a"])
         *     // table.transform_table(transformer)
         * }
         */
        @Pure
        @PythonName("transform_table")
        fun transformTable(
            @PythonName("fitted_transformer") fittedTransformer: ExperimentalTableTransformer
        ) -> newTable: ExperimentalTable

        /**
         * Return a table with important statistics about this table.
         *
         * @result statistics The table with statistics.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 3]})
         *     // table.summarize_statistics()
         * }
         */
        @Pure
        @PythonName("summarize_statistics")
        fun summarizeStatistics() -> statistics: ExperimentalTable

        /**
         * Return the data of the table as a list of columns.
         *
         * @result columns List of columns.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // columns = table.to_columns()
         * }
         */
        @Pure
        @PythonName("to_columns")
        fun toColumns() -> columns: List<ExperimentalColumn<Any>>

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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.to_csv_file("./src/resources/to_csv_file.csv")
         * }
         */
        @Pure
        @PythonName("to_csv_file")
        fun toCsvFile(
            path: String
        )

        /**
         * Return a map of column names to column values.
         *
         * @result map Dictionary representation of the table.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.to_dict()
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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.to_json_file("./src/resources/to_json_file_2.json")
         * }
         */
        @Pure
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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // table.to_parquet_file("./src/resources/to_parquet_file.parquet")
         * }
         */
        @Pure
        @PythonName("to_parquet_file")
        fun toParquetFile(
            path: String
        )

        /**
         * Return a new `TabularDataset` with columns marked as a target, feature, or extra.
         *
         * * The target column is the column that a model should predict.
         * * Feature columns are columns that a model should use to make predictions.
         * * Extra columns are columns that are neither feature nor target. They can be used to provide additional context,
         *   like an ID column.
         *
         * Feature columns are implicitly defined as all columns except the target and extra columns. If no extra columns
         * are specified, all columns except the target column are used as features.
         *
         * @param targetName Name of the target column.
         * @param extraNames Names of the columns that are neither feature nor target. If None, no extra columns are used, i.e. all but
         * the target column are used as features.
         *
         * @result dataset A new tabular dataset with the given target and feature names.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable(
         *     //     {
         *     //         "item": ["apple", "milk", "beer"],
         *     //         "price": [1.10, 1.19, 1.79],
         *     //         "amount_bought": [74, 72, 51],
         *     //     }
         *     // )
         *     // dataset = table.to_tabular_dataset(target_name="amount_bought", extra_names=["item"])
         * }
         */
        @Pure
        @PythonName("to_tabular_dataset")
        fun toTabularDataset(
            @PythonName("target_name") targetName: String,
            @PythonName("extra_names") extraNames: List<String>? = null
        ) -> dataset: ExperimentalTabularDataset

        /**
         * Convert the table to the old table format. This method is temporary and will be removed in a later version.
         *
         * @result oldTable The table in the old format.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
         *     // old_table = table.temporary_to_old_table()
         * }
         */
        @Deprecated(
            alternative="None.",
            reason="Only a temporary solution until this implementation is stable.",
            sinceVersion="0.15.0",
            removalVersion="0.16.0"
        )
        @Pure
        @PythonName("temporary_to_old_table")
        fun temporaryToOldTable() -> oldTable: Table
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.containers.ExperimentalTable.columnNames data-toc-label='columnNames'}

The names of the columns in the table.

**Type:** [`List<String>`][safeds.lang.List]

## `#!sds attr` numberOfColumns {#safeds.data.tabular.containers.ExperimentalTable.numberOfColumns data-toc-label='numberOfColumns'}

The number of columns in the table.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` numberOfRows {#safeds.data.tabular.containers.ExperimentalTable.numberOfRows data-toc-label='numberOfRows'}

The number of rows in the table.

**Note:** This operation must fully load the data into memory, which can be expensive.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` plot {#safeds.data.tabular.containers.ExperimentalTable.plot data-toc-label='plot'}

The plotter for the table.

**Type:** [`ExperimentalTablePlotter`][safeds.data.tabular.plotting.ExperimentalTablePlotter]

## `#!sds attr` schema {#safeds.data.tabular.containers.ExperimentalTable.schema data-toc-label='schema'}

The schema of the table.

**Type:** [`ExperimentalSchema`][safeds.data.tabular.typing.ExperimentalSchema]

## `#!sds fun` addColumns {#safeds.data.tabular.containers.ExperimentalTable.addColumns data-toc-label='addColumns'}

Return a new table with additional columns.

**Notes:**

* The original table is not modified.
* This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>` | The columns to add. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the additional columns. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn, ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3]})
    // new_column = ExperimentalColumn("b", [4, 5, 6])
    // table.add_columns(new_column)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="178"
    @Pure
    @PythonName("add_columns")
    fun addColumns(
        columns: union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` addComputedColumn {#safeds.data.tabular.containers.ExperimentalTable.addComputedColumn data-toc-label='addComputedColumn'}

Return a new table with an additional computed column.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the new column. | - |
| `computer` | `#!sds (param1: ExperimentalRow) -> (result1: ExperimentalCell<Any>)` | The function that computes the values of the new column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the computed column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.add_computed_column("c", lambda row: row.get_value("a") + row.get_value("b"))
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="201"
    @Pure
    @PythonName("add_computed_column")
    fun addComputedColumn(
        name: String,
        computer: (param1: ExperimentalRow) -> result1: ExperimentalCell<Any>
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` addTableAsColumns {#safeds.data.tabular.containers.ExperimentalTable.addTableAsColumns data-toc-label='addTableAsColumns'}

Return a new table with the columns of another table added.

**Notes:**

* The original tables are not modified.
* This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table to add as columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the columns added. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table1 = ExperimentalTable({"a": [1, 2, 3]})
    // table2 = ExperimentalTable({"b": [4, 5, 6]})
    // table1.add_table_as_columns(table2)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="689"
    @Pure
    @PythonName("add_table_as_columns")
    fun addTableAsColumns(
        other: ExperimentalTable
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` addTableAsRows {#safeds.data.tabular.containers.ExperimentalTable.addTableAsRows data-toc-label='addTableAsRows'}

Return a new table with the rows of another table added.

**Notes:**

* The original tables are not modified.
* This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table to add as rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the rows added. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table1 = ExperimentalTable({"a": [1, 2, 3]})
    // table2 = ExperimentalTable({"a": [4, 5, 6]})
    // table1.add_table_as_rows(table2)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="715"
    @Pure
    @PythonName("add_table_as_rows")
    fun addTableAsRows(
        other: ExperimentalTable
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` getColumn {#safeds.data.tabular.containers.ExperimentalTable.getColumn data-toc-label='getColumn'}

Get a column from the table.

**Note:** This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `column` | [`ExperimentalColumn<Any>`][safeds.data.tabular.containers.ExperimentalColumn] | The column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.get_column("a")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="224"
    @Pure
    @PythonName("get_column")
    fun getColumn(
        name: String
    ) -> column: ExperimentalColumn<Any>
    ```

## `#!sds fun` getColumnType {#safeds.data.tabular.containers.ExperimentalTable.getColumnType data-toc-label='getColumnType'}

Get the data type of a column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `type` | [`ExperimentalDataType`][safeds.data.tabular.typing.ExperimentalDataType] | The data type of the column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.get_column_type("a")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="244"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        name: String
    ) -> type: ExperimentalDataType
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.containers.ExperimentalTable.hasColumn data-toc-label='hasColumn'}

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

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.has_column("a")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="264"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        name: String
    ) -> hasColumn: Boolean
    ```

## `#!sds fun` inverseTransformTable {#safeds.data.tabular.containers.ExperimentalTable.inverseTransformTable data-toc-label='inverseTransformTable'}

Return a new table inverse-transformed by a **fitted, invertible** transformer.

**Notes:**

* The original table is not modified.
* Depending on the transformer, this operation might fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `fittedTransformer` | [`ExperimentalInvertibleTableTransformer`][safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer] | The fitted, invertible transformer to apply. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The inverse-transformed table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // from safeds.data.tabular.transformation import ExperimentalRangeScaler
    // table = ExperimentalTable({"a": [1, 2, 3]})
    // transformer, transformed_table = ExperimentalRangeScaler(min_=0, max_=1).fit_and_transform(table, ["a"])
    // transformed_table.inverse_transform_table(transformer)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="742"
    @Pure
    @PythonName("inverse_transform_table")
    fun inverseTransformTable(
        @PythonName("fitted_transformer") fittedTransformer: ExperimentalInvertibleTableTransformer
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeColumns {#safeds.data.tabular.containers.ExperimentalTable.removeColumns data-toc-label='removeColumns'}

Return a new table without the specified columns.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `names` | `#!sds union<List<String>, String>` | The names of the columns to remove. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the columns removed. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.remove_columns("a")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="286"
    @Pure
    @PythonName("remove_columns")
    fun removeColumns(
        names: union<List<String>, String>
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeColumnsExcept {#safeds.data.tabular.containers.ExperimentalTable.removeColumnsExcept data-toc-label='removeColumnsExcept'}

Return a new table with only the specified columns.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `names` | `#!sds union<List<String>, String>` | The names of the columns to keep. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with only the specified columns. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.remove_columns_except("a")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="306"
    @Pure
    @PythonName("remove_columns_except")
    fun removeColumnsExcept(
        names: union<List<String>, String>
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeColumnsWithMissingValues {#safeds.data.tabular.containers.ExperimentalTable.removeColumnsWithMissingValues data-toc-label='removeColumnsWithMissingValues'}

Return a new table without columns that contain missing values.

**Notes:**

* The original table is not modified.
* This operation must fully load the data into memory, which can be expensive.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table without columns containing missing values. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, None]})
    // table.remove_columns_with_missing_values()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="329"
    @Pure
    @PythonName("remove_columns_with_missing_values")
    fun removeColumnsWithMissingValues() -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeDuplicateRows {#safeds.data.tabular.containers.ExperimentalTable.removeDuplicateRows data-toc-label='removeDuplicateRows'}

Return a new table without duplicate rows.

**Note:** The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table without duplicate rows. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 2], "b": [4, 5, 5]})
    // table.remove_duplicate_rows()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="437"
    @Pure
    @PythonName("remove_duplicate_rows")
    fun removeDuplicateRows() -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeNonNumericColumns {#safeds.data.tabular.containers.ExperimentalTable.removeNonNumericColumns data-toc-label='removeNonNumericColumns'}

Return a new table without non-numeric columns.

**Note:** The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table without non-numeric columns. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": ["4", "5", "6"]})
    // table.remove_non_numeric_columns()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="347"
    @Pure
    @PythonName("remove_non_numeric_columns")
    fun removeNonNumericColumns() -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeRows {#safeds.data.tabular.containers.ExperimentalTable.removeRows data-toc-label='removeRows'}

Return a new table without rows that satisfy a condition.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `query` | `#!sds (param1: ExperimentalRow) -> (result1: ExperimentalCell<Boolean>)` | The function that determines which rows to remove. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table without the specified rows. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.remove_rows(lambda row: row.get_value("a") == 2)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="457"
    @Pure
    @PythonName("remove_rows")
    fun removeRows(
        query: (param1: ExperimentalRow) -> result1: ExperimentalCell<Boolean>
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeRowsByColumn {#safeds.data.tabular.containers.ExperimentalTable.removeRowsByColumn data-toc-label='removeRowsByColumn'}

Return a new table without rows that satisfy a condition on a specific column.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |
| `query` | `#!sds (param1: ExperimentalCell<Any>) -> (result1: ExperimentalCell<Boolean>)` | The function that determines which rows to remove. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table without the specified rows. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.remove_rows_by_column("a", lambda cell: cell == 2)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="480"
    @Pure
    @PythonName("remove_rows_by_column")
    fun removeRowsByColumn(
        name: String,
        query: (param1: ExperimentalCell<Any>) -> result1: ExperimentalCell<Boolean>
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeRowsWithMissingValues {#safeds.data.tabular.containers.ExperimentalTable.removeRowsWithMissingValues data-toc-label='removeRowsWithMissingValues'}

Return a new table without rows containing missing values in the specified columns.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>?`][safeds.lang.List] | Names of the columns to consider. If None, all columns are considered. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table without rows containing missing values in the specified columns. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, None, 3], "b": [4, 5, None]})
    // table.remove_rows_with_missing_values()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="503"
    @Pure
    @PythonName("remove_rows_with_missing_values")
    fun removeRowsWithMissingValues(
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` removeRowsWithOutliers {#safeds.data.tabular.containers.ExperimentalTable.removeRowsWithOutliers data-toc-label='removeRowsWithOutliers'}

Return a new table without rows containing outliers in the specified columns.

Whether a data point is an outlier in a column is determined by its z-score. The z-score the distance of the
data point from the mean of the column divided by the standard deviation of the column. If the z-score is
greater than the given threshold, the data point is considered an outlier. Missing values are ignored during the
calculation of the z-score.

The z-score is only defined for numeric columns. Non-numeric columns are ignored, even if they are specified in
`column_names`.

**Notes:**

* The original table is not modified.
* This operation must fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>?`][safeds.lang.List] | Names of the columns to consider. If None, all numeric columns are considered. | `#!sds null` |
| `zScoreThreshold` | [`Float`][safeds.lang.Float] | The z-score threshold for detecting outliers. | `#!sds 3.0` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table without rows containing outliers in the specified columns. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable(
    //     {
    //         "a": [1, 2, 3, 4, 5, 6, 1000, None],
    //         "b": [1, 2, 3, 4, 5, 6,    7,    8],
    //     }
    // )
    // table.remove_rows_with_outliers(z_score_threshold=2)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="542"
    @Pure
    @PythonName("remove_rows_with_outliers")
    fun removeRowsWithOutliers(
        @PythonName("column_names") columnNames: List<String>? = null,
        @PythonName("z_score_threshold") zScoreThreshold: Float = 3.0
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` renameColumn {#safeds.data.tabular.containers.ExperimentalTable.renameColumn data-toc-label='renameColumn'}

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
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the column renamed. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.rename_column("a", "c")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="368"
    @Pure
    @PythonName("rename_column")
    fun renameColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_name") newName: String
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` replaceColumn {#safeds.data.tabular.containers.ExperimentalTable.replaceColumn data-toc-label='replaceColumn'}

Return a new table with a column replaced by zero or more columns.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldName` | [`String`][safeds.lang.String] | The name of the column to replace. | - |
| `newColumns` | `#!sds union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>` | The new column or columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the column replaced. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn, ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.replace_column("a", [])
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="392"
    @Pure
    @PythonName("replace_column")
    fun replaceColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_columns") newColumns: union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` shuffleRows {#safeds.data.tabular.containers.ExperimentalTable.shuffleRows data-toc-label='shuffleRows'}

Return a new table with the rows shuffled.

**Note:** The original table is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the rows shuffled. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.shuffle_rows()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="563"
    @Pure
    @PythonName("shuffle_rows")
    fun shuffleRows() -> newTable: ExperimentalTable
    ```

## `#!sds fun` sliceRows {#safeds.data.tabular.containers.ExperimentalTable.sliceRows data-toc-label='sliceRows'}

Return a new table with a slice of rows.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `start` | [`Int`][safeds.lang.Int] | The start index of the slice. | `#!sds 0` |
| `length` | [`Int?`][safeds.lang.Int] | The length of the slice. If None, the slice contains all rows starting from `start`. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the slice of rows. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.slice_rows(start=1)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="584"
    @Pure
    @PythonName("slice_rows")
    fun sliceRows(
        start: Int = 0,
        length: Int? = null
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` sortRows {#safeds.data.tabular.containers.ExperimentalTable.sortRows data-toc-label='sortRows'}

Return a new table with the rows sorted.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `keySelector` | `#!sds (param1: ExperimentalRow) -> (result1: ExperimentalCell<Any>)` | The function that selects the key to sort by. | - |
| `descending` | [`Boolean`][safeds.lang.Boolean] | Whether to sort in descending order. | `#!sds false` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the rows sorted. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [2, 1, 3], "b": [1, 1, 2]})
    // table.sort_rows(lambda row: row.get_value("a") - row.get_value("b"))
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="608"
    @Pure
    @PythonName("sort_rows")
    fun sortRows(
        @PythonName("key_selector") keySelector: (param1: ExperimentalRow) -> result1: ExperimentalCell<Any>,
        descending: Boolean = false
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` sortRowsByColumn {#safeds.data.tabular.containers.ExperimentalTable.sortRowsByColumn data-toc-label='sortRowsByColumn'}

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
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the rows sorted by the specified column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [2, 1, 3], "b": [1, 1, 2]})
    // table.sort_rows_by_column("a")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="632"
    @Pure
    @PythonName("sort_rows_by_column")
    fun sortRowsByColumn(
        name: String,
        descending: Boolean = false
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` splitRows {#safeds.data.tabular.containers.ExperimentalTable.splitRows data-toc-label='splitRows'}

Create two tables by splitting the rows of the current table.

The first table contains a percentage of the rows specified by `percentage_in_first`, and the second table
contains the remaining rows.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `percentageInFirst` | [`Float`][safeds.lang.Float] | The percentage of rows to include in the first table. Must be between 0 and 1. | - |
| `shuffle` | [`Boolean`][safeds.lang.Boolean] | Whether to shuffle the rows before splitting. | `#!sds true` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `firstTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The first table. |
| `secondTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The second table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3, 4, 5], "b": [6, 7, 8, 9, 10]})
    // first_table, second_table = table.split_rows(0.6)
    // first_table
    // second_table
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="662"
    @Pure
    @PythonName("split_rows")
    fun splitRows(
        @PythonName("percentage_in_first") percentageInFirst: Float,
        shuffle: Boolean = true
    ) -> (firstTable: ExperimentalTable, secondTable: ExperimentalTable)
    ```

## `#!sds fun` summarizeStatistics {#safeds.data.tabular.containers.ExperimentalTable.summarizeStatistics data-toc-label='summarizeStatistics'}

Return a table with important statistics about this table.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `statistics` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with statistics. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 3]})
    // table.summarize_statistics()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="787"
    @Pure
    @PythonName("summarize_statistics")
    fun summarizeStatistics() -> statistics: ExperimentalTable
    ```

## :warning:{ title="Deprecated" } `#!sds fun` temporaryToOldTable {#safeds.data.tabular.containers.ExperimentalTable.temporaryToOldTable data-toc-label='temporaryToOldTable'}

!!! warning "Deprecated"

    This function is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** None.
    - **Reason:** Only a temporary solution until this implementation is stable.

Convert the table to the old table format. This method is temporary and will be removed in a later version.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `oldTable` | [`Table`][safeds.data.tabular.containers.Table] | The table in the old format. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // old_table = table.temporary_to_old_table()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="941"
    @Deprecated(
        alternative="None.",
        reason="Only a temporary solution until this implementation is stable.",
        sinceVersion="0.15.0",
        removalVersion="0.16.0"
    )
    @Pure
    @PythonName("temporary_to_old_table")
    fun temporaryToOldTable() -> oldTable: Table
    ```

## `#!sds fun` toColumns {#safeds.data.tabular.containers.ExperimentalTable.toColumns data-toc-label='toColumns'}

Return the data of the table as a list of columns.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `columns` | [`List<ExperimentalColumn<Any>>`][safeds.lang.List] | List of columns. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // columns = table.to_columns()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="803"
    @Pure
    @PythonName("to_columns")
    fun toColumns() -> columns: List<ExperimentalColumn<Any>>
    ```

## `#!sds fun` toCsvFile {#safeds.data.tabular.containers.ExperimentalTable.toCsvFile data-toc-label='toCsvFile'}

Write the table to a CSV file.

If the file and/or the parent directories do not exist, they will be created. If the file exists already, it
will be overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the CSV file. If the file extension is omitted, it is assumed to be ".csv". | - |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.to_csv_file("./src/resources/to_csv_file.csv")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="822"
    @Pure
    @PythonName("to_csv_file")
    fun toCsvFile(
        path: String
    )
    ```

## `#!sds fun` toJsonFile {#safeds.data.tabular.containers.ExperimentalTable.toJsonFile data-toc-label='toJsonFile'}

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

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.to_json_file("./src/resources/to_json_file_2.json")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="864"
    @Pure
    @PythonName("to_json_file")
    fun toJsonFile(
        path: String,
        orientation: literal<"column", "row"> = "column"
    )
    ```

## `#!sds fun` toMap {#safeds.data.tabular.containers.ExperimentalTable.toMap data-toc-label='toMap'}

Return a map of column names to column values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `map` | [`Map<String, List<Any>>`][safeds.lang.Map] | Dictionary representation of the table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.to_dict()
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="840"
    @Pure
    @PythonName("to_dict")
    fun toMap() -> map: Map<String, List<Any>>
    ```

## `#!sds fun` toParquetFile {#safeds.data.tabular.containers.ExperimentalTable.toParquetFile data-toc-label='toParquetFile'}

Write the table to a Parquet file.

If the file and/or the parent directories do not exist, they will be created. If the file exists already, it
will be overwritten.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the Parquet file. If the file extension is omitted, it is assumed to be ".parquet". | - |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.to_parquet_file("./src/resources/to_parquet_file.parquet")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="886"
    @Pure
    @PythonName("to_parquet_file")
    fun toParquetFile(
        path: String
    )
    ```

## `#!sds fun` toTabularDataset {#safeds.data.tabular.containers.ExperimentalTable.toTabularDataset data-toc-label='toTabularDataset'}

Return a new `TabularDataset` with columns marked as a target, feature, or extra.

* The target column is the column that a model should predict.
* Feature columns are columns that a model should use to make predictions.
* Extra columns are columns that are neither feature nor target. They can be used to provide additional context,
  like an ID column.

Feature columns are implicitly defined as all columns except the target and extra columns. If no extra columns
are specified, all columns except the target column are used as features.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `extraNames` | [`List<String>?`][safeds.lang.List] | Names of the columns that are neither feature nor target. If None, no extra columns are used, i.e. all but the target column are used as features. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `dataset` | [`ExperimentalTabularDataset`][safeds.data.labeled.containers.ExperimentalTabularDataset] | A new tabular dataset with the given target and feature names. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable(
    //     {
    //         "item": ["apple", "milk", "beer"],
    //         "price": [1.10, 1.19, 1.79],
    //         "amount_bought": [74, 72, 51],
    //     }
    // )
    // dataset = table.to_tabular_dataset(target_name="amount_bought", extra_names=["item"])
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="922"
    @Pure
    @PythonName("to_tabular_dataset")
    fun toTabularDataset(
        @PythonName("target_name") targetName: String,
        @PythonName("extra_names") extraNames: List<String>? = null
    ) -> dataset: ExperimentalTabularDataset
    ```

## `#!sds fun` transformColumn {#safeds.data.tabular.containers.ExperimentalTable.transformColumn data-toc-label='transformColumn'}

Return a new table with a column transformed.

**Note:** The original table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column to transform. | - |
| `transformer` | `#!sds (param1: ExperimentalCell<Any>) -> (result1: ExperimentalCell<Any>)` | The function that transforms the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table with the transformed column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"a": [1, 2, 3], "b": [4, 5, 6]})
    // table.transform_column("a", lambda cell: cell + 1)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="416"
    @Pure
    @PythonName("transform_column")
    fun transformColumn(
        name: String,
        transformer: (param1: ExperimentalCell<Any>) -> result1: ExperimentalCell<Any>
    ) -> newTable: ExperimentalTable
    ```

## `#!sds fun` transformTable {#safeds.data.tabular.containers.ExperimentalTable.transformTable data-toc-label='transformTable'}

Return a new table transformed by a **fitted** transformer.

**Notes:**

* The original table is not modified.
* Depending on the transformer, this operation might fully load the data into memory, which can be expensive.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `fittedTransformer` | [`ExperimentalTableTransformer`][safeds.data.tabular.transformation.ExperimentalTableTransformer] | The fitted transformer to apply. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `newTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The transformed table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // from safeds.data.tabular.transformation import ExperimentalRangeScaler
    // table = ExperimentalTable({"a": [1, 2, 3]})
    // transformer = ExperimentalRangeScaler(min_=0, max_=1).fit(table, ["a"])
    // table.transform_table(transformer)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="769"
    @Pure
    @PythonName("transform_table")
    fun transformTable(
        @PythonName("fitted_transformer") fittedTransformer: ExperimentalTableTransformer
    ) -> newTable: ExperimentalTable
    ```

## `#!sds static fun` fromColumns {#safeds.data.tabular.containers.ExperimentalTable.fromColumns data-toc-label='fromColumns'}

Create a table from a list of columns.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>` | The columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The created table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn, ExperimentalTable
    // a = ExperimentalColumn("a", [1, 2, 3])
    // b = ExperimentalColumn("b", [4, 5, 6])
    // ExperimentalTable.from_columns([a, b])
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="75"
    @Pure
    @PythonName("from_columns")
    static fun fromColumns(
        columns: union<ExperimentalColumn<Any>, List<ExperimentalColumn<Any>>>
    ) -> table: ExperimentalTable
    ```

## `#!sds static fun` fromCsvFile {#safeds.data.tabular.containers.ExperimentalTable.fromCsvFile data-toc-label='fromCsvFile'}

Create a table from a CSV file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the CSV file. If the file extension is omitted, it is assumed to be ".csv". | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The created table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // ExperimentalTable.from_csv_file("./src/resources/from_csv_file.csv")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="94"
    @Pure
    @PythonName("from_csv_file")
    static fun fromCsvFile(
        path: String
    ) -> table: ExperimentalTable
    ```

## `#!sds static fun` fromJsonFile {#safeds.data.tabular.containers.ExperimentalTable.fromJsonFile data-toc-label='fromJsonFile'}

Create a table from a JSON file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the JSON file. If the file extension is omitted, it is assumed to be ".json". | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The created table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // ExperimentalTable.from_json_file("./src/resources/from_json_file_2.json")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="133"
    @Pure
    @PythonName("from_json_file")
    static fun fromJsonFile(
        path: String
    ) -> table: ExperimentalTable
    ```

## `#!sds static fun` fromMap {#safeds.data.tabular.containers.ExperimentalTable.fromMap data-toc-label='fromMap'}

Create a table from a map of column names to column values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>`][safeds.lang.Map] | The data. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The generated table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // data = {'a': [1, 2, 3], 'b': [4, 5, 6]}
    // ExperimentalTable.from_dict(data)
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="114"
    @Pure
    @PythonName("from_dict")
    static fun fromMap(
        data: Map<String, List<Any>>
    ) -> table: ExperimentalTable
    ```

## `#!sds static fun` fromParquetFile {#safeds.data.tabular.containers.ExperimentalTable.fromParquetFile data-toc-label='fromParquetFile'}

Create a table from a Parquet file.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path to the Parquet file. If the file extension is omitted, it is assumed to be ".parquet". | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The created table. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // ExperimentalTable.from_parquet_file("./src/resources/from_parquet_file.parquet")
}
```

??? quote "Stub code in `ExperimentalTable.sdsstub`"

    ```sds linenums="152"
    @Pure
    @PythonName("from_parquet_file")
    static fun fromParquetFile(
        path: String
    ) -> table: ExperimentalTable
    ```
