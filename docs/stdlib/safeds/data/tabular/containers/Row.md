# `#!sds class` Row {#safeds.data.tabular.containers.Row data-toc-label='Row'}

A row is a collection of named values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>?`][safeds.lang.Map] | The data. If None, an empty row is created. | `#!sds null` |

??? quote "Source code in `row.sdsstub`"

    ```sds linenums="10"
    class Row(
        data: Map<String, List<Any>>? = null // TODO: update default value to empty map
    ) {
        /**
         * Return a list of all column names in the row.
         */
        @PythonName("column_names") attr columnNames: List<String>
        /**
         * Return the number of columns in this row.
         */
        @PythonName("number_of_column") attr numberOfColumn: Int
        /**
         * Return the schema of the row.
         */
        attr `schema`: Schema
    
        /**
         * Create a row from a dictionary that maps column names to column values.
         *
         * @param data The data.
         *
         * @result result1 The created row.
         */
        @Pure
        @PythonName("from_dict")
        static fun fromDict(
            data: Map<String, Any>
        ) -> result1: Row
    
        /**
         * Return the value of a specified column.
         *
         * @param columnName The column name.
         *
         * @result result1 The column value.
         */
        @Pure
        @PythonName("get_value")
        fun getValue(
            @PythonName("column_name") columnName: String
        ) -> result1: Any
    
        /**
         * Check whether the row contains a given column.
         *
         * @param columnName The column name.
         *
         * @result result1 True, if the row contains the column, False otherwise.
         */
        @Pure
        @PythonName("has_column")
        fun hasColumn(
            @PythonName("column_name") columnName: String
        ) -> result1: Boolean
    
        /**
         * Return the type of the specified column.
         *
         * @param columnName The column name.
         *
         * @result result1 The type of the column.
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            @PythonName("column_name") columnName: String
        ) -> result1: ColumnType
    
        // // TODO Safe-DS does not support tuple types.
        // /**
        //  * Sort the columns of a `Row` with the given comparator and return a new `Row`.
        //  *
        //  * The original row is not modified. The comparator is a function that takes two tuples of (ColumnName,
        //  * Value) `col1` and `col2` and returns an integer:
        //  *
        //  * * If `col1` should be ordered before `col2`, the function should return a negative number.
        //  * * If `col1` should be ordered after `col2`, the function should return a positive number.
        //  * * If the original order of `col1` and `col2` should be kept, the function should return 0.
        //  *
        //  * If no comparator is given, the columns will be sorted alphabetically by their name.
        //  *
        //  * @param comparator The function used to compare two tuples of (ColumnName, Value).
        //  *
        //  * @result result1 A new row with sorted columns.
        //  */
        // @Pure
        // @PythonName("sort_columns")
        // fun sortColumns(
        //     comparator: (param1: Tuple<Any>, param2: Tuple<Any>) -> param3: Int
        // ) -> result1: Row
    
        /**
         * Return a dictionary that maps column names to column values.
         *
         * @result result1 Dictionary representation of the row.
         */
        @Pure
        @PythonName("to_dict")
        fun toDict() -> result1: Map<String, Any>
    
        /**
         * Return an HTML representation of the row.
         *
         * @result result1 The generated HTML.
         */
        @Pure
        @PythonName("to_html")
        fun toHtml() -> result1: String
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.containers.Row.columnNames data-toc-label='columnNames'}

Return a list of all column names in the row.

**Type:** [`List<String>`][safeds.lang.List]

## `#!sds attr` numberOfColumn {#safeds.data.tabular.containers.Row.numberOfColumn data-toc-label='numberOfColumn'}

Return the number of columns in this row.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` schema {#safeds.data.tabular.containers.Row.schema data-toc-label='schema'}

Return the schema of the row.

**Type:** [`Schema`][safeds.data.tabular.typing.Schema]

## `#!sds static fun` fromDict {#safeds.data.tabular.containers.Row.fromDict data-toc-label='fromDict'}

Create a row from a dictionary that maps column names to column values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, Any>`][safeds.lang.Map] | The data. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Row`][safeds.data.tabular.containers.Row] | The created row. |

??? quote "Source code in `row.sdsstub`"

    ```sds linenums="33"
    @Pure
    @PythonName("from_dict")
    static fun fromDict(
        data: Map<String, Any>
    ) -> result1: Row
    ```

## `#!sds fun` getValue {#safeds.data.tabular.containers.Row.getValue data-toc-label='getValue'}

Return the value of a specified column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The column name. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Any`][safeds.lang.Any] | The column value. |

??? quote "Source code in `row.sdsstub`"

    ```sds linenums="46"
    @Pure
    @PythonName("get_value")
    fun getValue(
        @PythonName("column_name") columnName: String
    ) -> result1: Any
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.containers.Row.hasColumn data-toc-label='hasColumn'}

Check whether the row contains a given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The column name. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True, if the row contains the column, False otherwise. |

??? quote "Source code in `row.sdsstub`"

    ```sds linenums="59"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        @PythonName("column_name") columnName: String
    ) -> result1: Boolean
    ```

## `#!sds fun` getColumnType {#safeds.data.tabular.containers.Row.getColumnType data-toc-label='getColumnType'}

Return the type of the specified column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The column name. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`ColumnType`][safeds.data.tabular.typing.ColumnType] | The type of the column. |

??? quote "Source code in `row.sdsstub`"

    ```sds linenums="72"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        @PythonName("column_name") columnName: String
    ) -> result1: ColumnType
    ```

## `#!sds fun` toDict {#safeds.data.tabular.containers.Row.toDict data-toc-label='toDict'}

Return a dictionary that maps column names to column values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Map<String, Any>`][safeds.lang.Map] | Dictionary representation of the row. |

??? quote "Source code in `row.sdsstub`"

    ```sds linenums="106"
    @Pure
    @PythonName("to_dict")
    fun toDict() -> result1: Map<String, Any>
    ```

## `#!sds fun` toHtml {#safeds.data.tabular.containers.Row.toHtml data-toc-label='toHtml'}

Return an HTML representation of the row.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`String`][safeds.lang.String] | The generated HTML. |

??? quote "Source code in `row.sdsstub`"

    ```sds linenums="115"
    @Pure
    @PythonName("to_html")
    fun toHtml() -> result1: String
    ```
