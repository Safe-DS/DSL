---
search:
  boost: 0.5
---

# `#!sds abstract class` Schema {#safeds.data.tabular.typing.Schema data-toc-label='Schema'}

The schema of a row or table.

??? quote "Stub code in `Schema.sdsstub`"

    ```sds linenums="8"
    class Schema {
        /**
         * Return a list of all column names contained in this schema.
         */
        @PythonName("column_names") attr columnNames: List<String>

        /**
         * Return the type of the given column.
         *
         * @param name The name of the column.
         *
         * @result type The type of the column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"A": [1, 2, 3], "B": ["a", "b", "c"]});
         *     val type = table.^schema.getColumnType("A");
         * }
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            name: String
        ) -> type: DataType

        /**
         * Return whether the schema contains a given column.
         *
         * @param name The name of the column.
         *
         * @result contains True if the schema contains the column.
         *
         * @example
         * pipeline example {
         *     val table = Table({"A": [1, 2, 3], "B": ["a", "b", "c"]});
         *     val contains = table.^schema.hasColumn("A"); // true
         * }
         */
        @Pure
        @PythonName("has_column")
        fun hasColumn(
            name: String
        ) -> contains: Boolean

        /**
         * Return a dictionary that maps column names to column types.
         *
         * @result data Dictionary representation of the schema.
         *
         * @example
         * pipeline example {
         *     val table = Table({"A": [1, 2, 3], "B": ["a", "b", "c"]});
         *     val map = table.^schema.toMap();
         * }
         */
        @Pure
        @PythonName("to_dict")
        fun toMap() -> data: Map<String, DataType>
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.typing.Schema.columnNames data-toc-label='columnNames'}

Return a list of all column names contained in this schema.

**Type:** [`List<String>`][safeds.lang.List]

## `#!sds fun` getColumnType {#safeds.data.tabular.typing.Schema.getColumnType data-toc-label='getColumnType'}

Return the type of the given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `type` | [`DataType`][safeds.data.tabular.typing.DataType] | The type of the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"A": [1, 2, 3], "B": ["a", "b", "c"]});
    val type = table.^schema.getColumnType("A");
}
```

??? quote "Stub code in `Schema.sdsstub`"

    ```sds linenums="27"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        name: String
    ) -> type: DataType
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.typing.Schema.hasColumn data-toc-label='hasColumn'}

Return whether the schema contains a given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `contains` | [`Boolean`][safeds.lang.Boolean] | True if the schema contains the column. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"A": [1, 2, 3], "B": ["a", "b", "c"]});
    val contains = table.^schema.hasColumn("A"); // true
}
```

??? quote "Stub code in `Schema.sdsstub`"

    ```sds linenums="46"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        name: String
    ) -> contains: Boolean
    ```

## `#!sds fun` toMap {#safeds.data.tabular.typing.Schema.toMap data-toc-label='toMap'}

Return a dictionary that maps column names to column types.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `data` | [`Map<String, DataType>`][safeds.lang.Map] | Dictionary representation of the schema. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"A": [1, 2, 3], "B": ["a", "b", "c"]});
    val map = table.^schema.toMap();
}
```

??? quote "Stub code in `Schema.sdsstub`"

    ```sds linenums="63"
    @Pure
    @PythonName("to_dict")
    fun toMap() -> data: Map<String, DataType>
    ```
