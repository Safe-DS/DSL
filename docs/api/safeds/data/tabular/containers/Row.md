# `#!sds class` Row {#safeds.data.tabular.containers.Row data-toc-label='Row'}

A row is a collection of named values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>?`][safeds.lang.Map] | The data. If None, an empty row is created. | `#!sds null` |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val row = Row({"a": 1, "b": 2});
}
```

??? quote "Stub code in `row.sdsstub`"

    ```sds linenums="15"
    class Row(
        data: Map<String, List<Any>>? = null // TODO: update default value to empty map
    ) {
        /**
         * Return a list of all column names in the row.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val columnNames = row.columnNames; // ["a", "b"]
         * }
         */
        @PythonName("column_names") attr columnNames: List<String>
        /**
         * Return the number of columns in this row.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val numberOfColumns = row.numberOfColumns; // 2
         * }
         */
        @PythonName("number_of_column") attr numberOfColumns: Int
        /**
         * Return the schema of the row.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val schema = row.schema;
         * }
         */
        attr `schema`: Schema

        /**
         * Create a row from a dictionary that maps column names to column values.
         *
         * @param data The data.
         *
         * @result row The created row.
         *
         * @example
         * pipeline example {
         *     val row = Row.fromDict({"a": 1, "b": 2});
         * }
         */
        @Pure
        @PythonName("from_dict")
        static fun fromDict(
            data: Map<String, Any>
        ) -> row: Row

        /**
         * Return the value of a specified column.
         *
         * @param columnName The column name.
         *
         * @result value The column value.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val value = row.getValue("a"); // 1
         * }
         */
        @Pure
        @PythonName("get_value")
        fun getValue(
            @PythonName("column_name") columnName: String
        ) -> value: Any

        /**
         * Check whether the row contains a given column.
         *
         * @param columnName The column name.
         *
         * @result hasColumn True, if the row contains the column, False otherwise.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val hasColumn = row.hasColumn("a"); // True
         * }
         */
        @Pure
        @PythonName("has_column")
        fun hasColumn(
            @PythonName("column_name") columnName: String
        ) -> hasColumn: Boolean

        /**
         * Return the type of the specified column.
         *
         * @param columnName The column name.
         *
         * @result type The type of the column.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val type = row.getColumnType("a"); // Integer
         * }
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            @PythonName("column_name") columnName: String
        ) -> type: ColumnType

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
        //  * @result sortedRow A new row with sorted columns.
        //  *
        //  * @example
        //  * pipeline example {
        //  *     // TODO
        //  * }
        //  */
        // @Pure
        // @PythonName("sort_columns")
        // fun sortColumns(
        //     comparator: (param1: Tuple<Any>, param2: Tuple<Any>) -> param3: Int
        // ) -> sortedRow: Row

        /**
         * Return a map of column names to column values.
         *
         * @result map Map representation of the row.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val map = row.toMap(); // {"a": 1, "b": 2}
         * }
         */
        @Pure
        @PythonName("to_dict")
        fun toMap() -> map: Map<String, Any>

        /**
         * Return an HTML representation of the row.
         *
         * @result html The generated HTML.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val html = row.toHtml();
         * }
         */
        @Pure
        @PythonName("to_html")
        fun toHtml() -> html: String
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.containers.Row.columnNames data-toc-label='columnNames'}

Return a list of all column names in the row.

**Type:** [`List<String>`][safeds.lang.List]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"a": 1, "b": 2});
    val columnNames = row.columnNames; // ["a", "b"]
}
```

## `#!sds attr` numberOfColumns {#safeds.data.tabular.containers.Row.numberOfColumns data-toc-label='numberOfColumns'}

Return the number of columns in this row.

**Type:** [`Int`][safeds.lang.Int]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"a": 1, "b": 2});
    val numberOfColumns = row.numberOfColumns; // 2
}
```

## `#!sds attr` schema {#safeds.data.tabular.containers.Row.schema data-toc-label='schema'}

Return the schema of the row.

**Type:** [`Schema`][safeds.data.tabular.typing.Schema]

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"a": 1, "b": 2});
    val schema = row.schema;
}
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
| `type` | [`ColumnType`][safeds.data.tabular.typing.ColumnType] | The type of the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"a": 1, "b": 2});
    val type = row.getColumnType("a"); // Integer
}
```

??? quote "Stub code in `row.sdsstub`"

    ```sds linenums="118"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        @PythonName("column_name") columnName: String
    ) -> type: ColumnType
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
| `value` | [`Any`][safeds.lang.Any] | The column value. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"a": 1, "b": 2});
    val value = row.getValue("a"); // 1
}
```

??? quote "Stub code in `row.sdsstub`"

    ```sds linenums="80"
    @Pure
    @PythonName("get_value")
    fun getValue(
        @PythonName("column_name") columnName: String
    ) -> value: Any
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
| `hasColumn` | [`Boolean`][safeds.lang.Boolean] | True, if the row contains the column, False otherwise. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"a": 1, "b": 2});
    val hasColumn = row.hasColumn("a"); // True
}
```

??? quote "Stub code in `row.sdsstub`"

    ```sds linenums="99"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        @PythonName("column_name") columnName: String
    ) -> hasColumn: Boolean
    ```

## `#!sds fun` toHtml {#safeds.data.tabular.containers.Row.toHtml data-toc-label='toHtml'}

Return an HTML representation of the row.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `html` | [`String`][safeds.lang.String] | The generated HTML. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"a": 1, "b": 2});
    val html = row.toHtml();
}
```

??? quote "Stub code in `row.sdsstub`"

    ```sds linenums="178"
    @Pure
    @PythonName("to_html")
    fun toHtml() -> html: String
    ```

## `#!sds fun` toMap {#safeds.data.tabular.containers.Row.toMap data-toc-label='toMap'}

Return a map of column names to column values.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `map` | [`Map<String, Any>`][safeds.lang.Map] | Map representation of the row. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"a": 1, "b": 2});
    val map = row.toMap(); // {"a": 1, "b": 2}
}
```

??? quote "Stub code in `row.sdsstub`"

    ```sds linenums="163"
    @Pure
    @PythonName("to_dict")
    fun toMap() -> map: Map<String, Any>
    ```

## `#!sds static fun` fromDict {#safeds.data.tabular.containers.Row.fromDict data-toc-label='fromDict'}

Create a row from a dictionary that maps column names to column values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, Any>`][safeds.lang.Map] | The data. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `row` | [`Row`][safeds.data.tabular.containers.Row] | The created row. |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val row = Row.fromDict({"a": 1, "b": 2});
}
```

??? quote "Stub code in `row.sdsstub`"

    ```sds linenums="61"
    @Pure
    @PythonName("from_dict")
    static fun fromDict(
        data: Map<String, Any>
    ) -> row: Row
    ```
