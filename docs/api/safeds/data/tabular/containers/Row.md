---
search:
  boost: 0.5
---

# <code class="doc-symbol doc-symbol-class"></code> `Row` {#safeds.data.tabular.containers.Row data-toc-label='[class] Row'}

A one-dimensional collection of named, heterogeneous values.

This class cannot be instantiated directly. It is only used for arguments of callbacks.

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="11"
    class Row {
        /**
         * The names of the columns in the row.
         */
        @PythonName("column_names") attr columnNames: List<String>
        /**
         * The number of columns in the row.
         */
        @PythonName("number_of_columns") attr columnCount: Int
        /**
         * The schema of the row.
         */
        attr ^schema: Schema

        /**
         * Get the value of the specified column.
         *
         * @param name The name of the column.
         *
         * @result value The value of the column.
         */
        @Pure
        @PythonName("get_value")
        fun getValue(
            name: String
        ) -> value: Cell<Any>

        /**
         * Get the type of the specified column.
         *
         * @param name The name of the column.
         *
         * @result type The type of the column.
         */
        @Pure
        @PythonName("get_column_type")
        fun getColumnType(
            name: String
        ) -> type: DataType

        /**
         * Check if the row has a column with the specified name.
         *
         * @param name The name of the column.
         *
         * @result hasColumn Whether the row has a column with the specified name.
         */
        @Pure
        @PythonName("has_column")
        fun hasColumn(
            name: String
        ) -> hasColumn: Boolean
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `columnCount` {#safeds.data.tabular.containers.Row.columnCount data-toc-label='[attribute] columnCount'}

The number of columns in the row.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `columnNames` {#safeds.data.tabular.containers.Row.columnNames data-toc-label='[attribute] columnNames'}

The names of the columns in the row.

**Type:** [`List<String>`][safeds.lang.List]

## <code class="doc-symbol doc-symbol-attribute"></code> `schema` {#safeds.data.tabular.containers.Row.schema data-toc-label='[attribute] schema'}

The schema of the row.

**Type:** [`Schema`][safeds.data.tabular.typing.Schema]

## <code class="doc-symbol doc-symbol-function"></code> `getColumnType` {#safeds.data.tabular.containers.Row.getColumnType data-toc-label='[function] getColumnType'}

Get the type of the specified column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `type` | [`DataType`][safeds.data.tabular.typing.DataType] | The type of the column. |

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="45"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        name: String
    ) -> type: DataType
    ```

## <code class="doc-symbol doc-symbol-function"></code> `getValue` {#safeds.data.tabular.containers.Row.getValue data-toc-label='[function] getValue'}

Get the value of the specified column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `value` | [`Cell<Any>`][safeds.data.tabular.containers.Cell] | The value of the column. |

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="32"
    @Pure
    @PythonName("get_value")
    fun getValue(
        name: String
    ) -> value: Cell<Any>
    ```

## <code class="doc-symbol doc-symbol-function"></code> `hasColumn` {#safeds.data.tabular.containers.Row.hasColumn data-toc-label='[function] hasColumn'}

Check if the row has a column with the specified name.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `hasColumn` | [`Boolean`][safeds.lang.Boolean] | Whether the row has a column with the specified name. |

??? quote "Stub code in `Row.sdsstub`"

    ```sds linenums="58"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        name: String
    ) -> hasColumn: Boolean
    ```
