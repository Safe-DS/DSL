# :warning:{ title="Deprecated" } `#!sds class` Row {#safeds.data.tabular.containers.Row data-toc-label='Row'}

!!! warning "Deprecated"

    This class is deprecated since version **0.15.0** and will be removed in version **0.16.0**.

    - **Alternative:** None.
    - **Reason:** This interface cannot be implemented efficiently.

A row is a collection of named values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, Any>?`][safeds.lang.Map] | The data. If None, an empty row is created. | `#!sds null` |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val row = Row({"a": 1, "b": 2});
}
```

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="21"
    class Row(
        data: Map<String, Any>? = null // TODO: update default value to empty map
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
        @PythonName("number_of_columns") attr numberOfColumns: Int
        /**
         * Return the schema of the row.
         *
         * @example
         * pipeline example {
         *     val row = Row({"a": 1, "b": 2});
         *     val `schema` = row.`schema`;
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

        /**
         * Sort the columns of a `Row` with the given comparator and return a new `Row`.
         *
         * The original row is not modified. The comparator is a function with four parameters:
         *
         * * `name_1` is the name of the first column.
         * * `value_1` is the value of the first column.
         * * `name_2` is the name of the second column.
         * * `value_2` is the value of the second column.
         *
         * It should return an integer, indicating the desired order of the columns:
         *
         * * If `col1` should be ordered before `col2`, the function should return a negative number.
         * * If `col1` should be ordered after `col2`, the function should return a positive number.
         * * If the original order of `col1` and `col2` should be kept, the function should return 0.
         *
         * If no comparator is given, the columns will be sorted alphabetically by their name.
         *
         * @param comparator The function used to compare two tuples of (ColumnName, Value).
         *
         * @result sortedRow A new row with sorted columns.
         *
         * @example
         * pipeline example {
         *     val row = Row({"b": 2, "a": 1});
         *     val sortedRow = row.sortColumns((name1, value1, name2, value2) ->
         *         value1 as (Int) - value2 as (Int)
         *     );
         * }
         */
        @Pure
        @PythonName("sort_columns")
        fun sortColumns(
            comparator: (name1: String, value1: Any, name2: String, value2: Any) -> comparison: Int
        ) -> sortedRow: Row

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
    val `schema` = row.`schema`;
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

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="124"
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

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="86"
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

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="105"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        @PythonName("column_name") columnName: String
    ) -> hasColumn: Boolean
    ```

## `#!sds fun` sortColumns {#safeds.data.tabular.containers.Row.sortColumns data-toc-label='sortColumns'}

Sort the columns of a `Row` with the given comparator and return a new `Row`.

The original row is not modified. The comparator is a function with four parameters:

* `name_1` is the name of the first column.
* `value_1` is the value of the first column.
* `name_2` is the name of the second column.
* `value_2` is the value of the second column.

It should return an integer, indicating the desired order of the columns:

* If `col1` should be ordered before `col2`, the function should return a negative number.
* If `col1` should be ordered after `col2`, the function should return a positive number.
* If the original order of `col1` and `col2` should be kept, the function should return 0.

If no comparator is given, the columns will be sorted alphabetically by their name.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `comparator` | `#!sds (name1: String, value1: Any, name2: String, value2: Any) -> (comparison: Int)` | The function used to compare two tuples of (ColumnName, Value). | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `sortedRow` | [`Row`][safeds.data.tabular.containers.Row] | A new row with sorted columns. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val row = Row({"b": 2, "a": 1});
    val sortedRow = row.sortColumns((name1, value1, name2, value2) ->
        value1 as (Int) - value2 as (Int)
    );
}
```

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="160"
    @Pure
    @PythonName("sort_columns")
    fun sortColumns(
        comparator: (name1: String, value1: Any, name2: String, value2: Any) -> comparison: Int
    ) -> sortedRow: Row
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

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="192"
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

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="177"
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

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="67"
    @Pure
    @PythonName("from_dict")
    static fun fromDict(
        data: Map<String, Any>
    ) -> row: Row
    ```
