# `#!sds abstract class` Schema {#safeds.data.tabular.typing.Schema data-toc-label='Schema'}

Store column names and corresponding data types for a `Table` or `Row`.

??? quote "Source code in `schema.sdsstub`"

    ```sds linenums="10"
    class Schema {
        /**
         * Return a list of all column names saved in this schema.
         */
        @PythonName("column_names") attr columnNames: List<String>
    
        /**
         * Return whether the schema contains a given column.
         *
         * @param columnName The name of the column.
         *
         * @result result1 True if the schema contains the column.
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
         */
        @Pure
        @PythonName("to_dict")
        fun toDict() -> result1: Map<String, ColumnType>
    
        /**
         * Merge multiple schemas into one.
         *
         * For each type missmatch the new schema will have the least common supertype.
         *
         * The type hierarchy is as follows:
         * * Anything
         *     * RealNumber
         *         * Integer
         *     * Boolean
         *     * String
         *
         * @param schemas the list of schemas you want to merge
         *
         * @result result1 the new merged schema
         */
        @Pure
        @PythonName("merge_multiple_schemas")
        static fun mergeMultipleSchemas(
            schemas: List<Schema>
        ) -> result1: Schema
    }
    ```

## `#!sds attr` columnNames {#safeds.data.tabular.typing.Schema.columnNames data-toc-label='columnNames'}

Return a list of all column names saved in this schema.

**Type:** [`List<String>`][safeds.lang.List]

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

??? quote "Source code in `schema.sdsstub`"

    ```sds linenums="23"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        @PythonName("column_name") columnName: String
    ) -> result1: Boolean
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

??? quote "Source code in `schema.sdsstub`"

    ```sds linenums="36"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        @PythonName("column_name") columnName: String
    ) -> result1: ColumnType
    ```

## `#!sds fun` toDict {#safeds.data.tabular.typing.Schema.toDict data-toc-label='toDict'}

Return a dictionary that maps column names to column types.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Map<String, ColumnType>`][safeds.lang.Map] | Dictionary representation of the schema. |

??? quote "Source code in `schema.sdsstub`"

    ```sds linenums="47"
    @Pure
    @PythonName("to_dict")
    fun toDict() -> result1: Map<String, ColumnType>
    ```

## `#!sds static fun` mergeMultipleSchemas {#safeds.data.tabular.typing.Schema.mergeMultipleSchemas data-toc-label='mergeMultipleSchemas'}

Merge multiple schemas into one.

For each type missmatch the new schema will have the least common supertype.

The type hierarchy is as follows:
* Anything
    * RealNumber
        * Integer
    * Boolean
    * String

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `schemas` | [`List<Schema>`][safeds.lang.List] | the list of schemas you want to merge | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Schema`][safeds.data.tabular.typing.Schema] | the new merged schema |

??? quote "Source code in `schema.sdsstub`"

    ```sds linenums="67"
    @Pure
    @PythonName("merge_multiple_schemas")
    static fun mergeMultipleSchemas(
        schemas: List<Schema>
    ) -> result1: Schema
    ```
