---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` ExperimentalSchema {#safeds.data.tabular.typing.ExperimentalSchema data-toc-label='ExperimentalSchema'}

The schema of a row or table.

??? quote "Stub code in `ExperimentalSchema.sdsstub`"

    ```sds linenums="9"
    class ExperimentalSchema {
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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"A": [1, 2, 3], "B": ["a", "b", "c"]})
         *     // type_ = table.schema.get_column_type("A")
         * }
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            name: String
        ) -> type: ExperimentalDataType

        /**
         * Return whether the schema contains a given column.
         *
         * @param name The name of the column.
         *
         * @result contains True if the schema contains the column.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"A": [1, 2, 3], "B": ["a", "b", "c"]})
         *     // table.schema.has_column("A")
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
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable({"A": [1, 2, 3], "B": ["a", "b", "c"]})
         *     // dict_ = table.schema.to_dict()
         * }
         */
        @Pure
        @PythonName("to_dict")
        fun toDict() -> data: Map<String, ExperimentalDataType>
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.typing.ExperimentalSchema.columnNames data-toc-label='columnNames'}

Return a list of all column names contained in this schema.

**Type:** [`List<String>`][safeds.lang.List]

## `#!sds fun` getColumnType {#safeds.data.tabular.typing.ExperimentalSchema.getColumnType data-toc-label='getColumnType'}

Return the type of the given column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `type` | [`ExperimentalDataType`][safeds.data.tabular.typing.ExperimentalDataType] | The type of the column. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"A": [1, 2, 3], "B": ["a", "b", "c"]})
    // type_ = table.schema.get_column_type("A")
}
```

??? quote "Stub code in `ExperimentalSchema.sdsstub`"

    ```sds linenums="29"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        name: String
    ) -> type: ExperimentalDataType
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.typing.ExperimentalSchema.hasColumn data-toc-label='hasColumn'}

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

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"A": [1, 2, 3], "B": ["a", "b", "c"]})
    // table.schema.has_column("A")
}
```

??? quote "Stub code in `ExperimentalSchema.sdsstub`"

    ```sds linenums="49"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        name: String
    ) -> contains: Boolean
    ```

## `#!sds fun` toDict {#safeds.data.tabular.typing.ExperimentalSchema.toDict data-toc-label='toDict'}

Return a dictionary that maps column names to column types.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `data` | [`Map<String, ExperimentalDataType>`][safeds.lang.Map] | Dictionary representation of the schema. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable({"A": [1, 2, 3], "B": ["a", "b", "c"]})
    // dict_ = table.schema.to_dict()
}
```

??? quote "Stub code in `ExperimentalSchema.sdsstub`"

    ```sds linenums="67"
    @Pure
    @PythonName("to_dict")
    fun toDict() -> data: Map<String, ExperimentalDataType>
    ```
