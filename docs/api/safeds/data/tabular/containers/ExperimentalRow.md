---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` ExperimentalRow {#safeds.data.tabular.containers.ExperimentalRow data-toc-label='ExperimentalRow'}

A one-dimensional collection of named, heterogeneous values.

This class cannot be instantiated directly. It is only used for arguments of callbacks.

??? quote "Stub code in `ExperimentalRow.sdsstub`"

    ```sds linenums="12"
    class ExperimentalRow {
        /**
         * The names of the columns in the row.
         */
        @PythonName("column_names") attr columnNames: List<String>
        /**
         * The number of columns in the row.
         */
        @PythonName("number_of_columns") attr numberOfColumns: Int
        /**
         * The schema of the row.
         */
        attr `schema`: ExperimentalSchema

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
        ) -> value: ExperimentalCell<Any>

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
        ) -> type: ExperimentalDataType

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

## `#!sds attr` columnNames {#safeds.data.tabular.containers.ExperimentalRow.columnNames data-toc-label='columnNames'}

The names of the columns in the row.

**Type:** [`List<String>`][safeds.lang.List]

## `#!sds attr` numberOfColumns {#safeds.data.tabular.containers.ExperimentalRow.numberOfColumns data-toc-label='numberOfColumns'}

The number of columns in the row.

**Type:** [`Int`][safeds.lang.Int]

## `#!sds attr` schema {#safeds.data.tabular.containers.ExperimentalRow.schema data-toc-label='schema'}

The schema of the row.

**Type:** [`ExperimentalSchema`][safeds.data.tabular.typing.ExperimentalSchema]

## `#!sds fun` getColumnType {#safeds.data.tabular.containers.ExperimentalRow.getColumnType data-toc-label='getColumnType'}

Get the type of the specified column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `type` | [`ExperimentalDataType`][safeds.data.tabular.typing.ExperimentalDataType] | The type of the column. |

??? quote "Stub code in `ExperimentalRow.sdsstub`"

    ```sds linenums="46"
    @Pure
    @PythonName("get_column_type")
    fun getColumnType(
        name: String
    ) -> type: ExperimentalDataType
    ```

## `#!sds fun` getValue {#safeds.data.tabular.containers.ExperimentalRow.getValue data-toc-label='getValue'}

Get the value of the specified column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `value` | [`ExperimentalCell<Any>`][safeds.data.tabular.containers.ExperimentalCell] | The value of the column. |

??? quote "Stub code in `ExperimentalRow.sdsstub`"

    ```sds linenums="33"
    @Pure
    @PythonName("get_value")
    fun getValue(
        name: String
    ) -> value: ExperimentalCell<Any>
    ```

## `#!sds fun` hasColumn {#safeds.data.tabular.containers.ExperimentalRow.hasColumn data-toc-label='hasColumn'}

Check if the row has a column with the specified name.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `hasColumn` | [`Boolean`][safeds.lang.Boolean] | Whether the row has a column with the specified name. |

??? quote "Stub code in `ExperimentalRow.sdsstub`"

    ```sds linenums="59"
    @Pure
    @PythonName("has_column")
    fun hasColumn(
        name: String
    ) -> hasColumn: Boolean
    ```
