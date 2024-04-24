---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` Schema {#safeds.data.tabular.typing.Schema data-toc-label='Schema'}

Store column names and corresponding data types for a `Table` or `Row`.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `schema.sdsstub`"

    ```sds linenums="16"
    class Schema {
        /**
         * Return a list of all column names saved in this schema.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @PythonName("column_names") attr columnNames: List<String>

        /**
         * Return whether the schema contains a given column.
         *
         * @param columnName The name of the column.
         *
         * @result result1 True if the schema contains the column.
         *
         * @example
         * pipeline example {
         *     // TODO
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
         * @param columnName The name of the column.
         *
         * @result result1 The type of the column.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            @PythonName("column_name") columnName: String
        ) -> result1: ColumnType

        /**
         * Return a dictionary that maps column names to column types.
         *
         * @result result1 Dictionary representation of the schema.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("to_dict")
        fun toDict() -> result1: Map<String, ColumnType>
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.typing.Schema.columnNames data-toc-label='columnNames'}

Return a list of all column names saved in this schema.

**Type:** [`List<String>`][safeds.lang.List]

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## `#!sds fun` getColumnType {#safeds.data.tabular.typing.Schema.getColumnType data-toc-label='getColumnType'}

Return the type of the given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`ColumnType`][safeds.data.tabular.typing.ColumnType] | The type of the column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `schema.sdsstub`"

    ```sds linenums="57"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        @PythonName("column_name") columnName: String
    ) -> result1: ColumnType
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.typing.Schema.hasColumn data-toc-label='hasColumn'}

Return whether the schema contains a given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnName` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if the schema contains the column. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `schema.sdsstub`"

    ```sds linenums="39"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        @PythonName("column_name") columnName: String
    ) -> result1: Boolean
    ```

## `#!sds fun` toDict {#safeds.data.tabular.typing.Schema.toDict data-toc-label='toDict'}

Return a dictionary that maps column names to column types.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Map<String, ColumnType>`][safeds.lang.Map] | Dictionary representation of the schema. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `schema.sdsstub`"

    ```sds linenums="73"
    @Pure
    @PythonName("to_dict")
    fun toDict() -> result1: Map<String, ColumnType>
    ```
