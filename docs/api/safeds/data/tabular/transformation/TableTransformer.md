---
search:
  boost: 0.5
---

# `#!sds abstract class` TableTransformer {#safeds.data.tabular.transformation.TableTransformer data-toc-label='TableTransformer'}

Learn a transformation for a set of columns in a `Table` and transform another `Table` with the same columns.

**Inheritors:**

- [`Discretizer`][safeds.data.tabular.transformation.Discretizer]
- [`Imputer`][safeds.data.tabular.transformation.Imputer]
- [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="8"
    class TableTransformer {
        /**
         * Whether the transformer is fitted.
         */
        @PythonName("is_fitted") attr isFitted: Boolean

        /**
         * Learn a transformation for a set of columns in a table.
         *
         * This transformer is not modified.
         *
         * @param table The table used to fit the transformer.
         * @param columnNames The list of columns from the table used to fit the transformer. If `None`, all columns are used.
         *
         * @result result1 The fitted transformer.
         */
        @Pure
        fun fit(
            table: Table,
            @PythonName("column_names") columnNames: List<String>?
        ) -> result1: TableTransformer

        /**
         * Apply the learned transformation to a table.
         *
         * The table is not modified.
         *
         * @param table The table to which the learned transformation is applied.
         *
         * @result result1 The transformed table.
         */
        @Pure
        fun transform(
            table: Table
        ) -> result1: Table

        /**
         * Get the names of all new columns that have been added by the transformer.
         *
         * @result result1 A list of names of the added columns, ordered as they will appear in the table.
         */
        @Pure
        @PythonName("get_names_of_added_columns")
        fun getNamesOfAddedColumns() -> result1: List<String>

        /**
         * Get the names of all columns that have been changed by the transformer.
         *
         * @result result1 A list of names of changed columns, ordered as they appear in the table.
         */
        @Pure
        @PythonName("get_names_of_changed_columns")
        fun getNamesOfChangedColumns() -> result1: List<String>

        /**
         * Get the names of all columns that have been removed by the transformer.
         *
         * @result result1 A list of names of the removed columns, ordered as they appear in the table the transformer was fitted on.
         */
        @Pure
        @PythonName("get_names_of_removed_columns")
        fun getNamesOfRemovedColumns() -> result1: List<String>

        /**
         * Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.
         *
         * The table is not modified. If you also need the fitted transformer, use `fit` and `transform` separately.
         *
         * @param table The table used to fit the transformer. The transformer is then applied to this table.
         * @param columnNames The list of columns from the table used to fit the transformer. If `None`, all columns are used.
         *
         * @result result1 The transformed table.
         */
        @Pure
        @PythonName("fit_and_transform")
        fun fitAndTransform(
            table: Table,
            @PythonName("column_names") columnNames: List<String>? = null
        ) -> result1: Table
    }
    ```

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.TableTransformer.isFitted data-toc-label='isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.data.tabular.transformation.TableTransformer.fit data-toc-label='fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `None`, all columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer] | The fitted transformer. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="24"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: TableTransformer
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.TableTransformer.fitAndTransform data-toc-label='fitAndTransform'}

Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.

The table is not modified. If you also need the fitted transformer, use `fit` and `transform` separately.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. The transformer is then applied to this table. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `None`, all columns are used. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="81"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> result1: Table
    ```

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.TableTransformer.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

Get the names of all new columns that have been added by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the added columns, ordered as they will appear in the table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="49"
    @Pure
    @PythonName("get_names_of_added_columns")
    fun getNamesOfAddedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.TableTransformer.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

Get the names of all columns that have been changed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of changed columns, ordered as they appear in the table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="58"
    @Pure
    @PythonName("get_names_of_changed_columns")
    fun getNamesOfChangedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.TableTransformer.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

Get the names of all columns that have been removed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the removed columns, ordered as they appear in the table the transformer was fitted on. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="67"
    @Pure
    @PythonName("get_names_of_removed_columns")
    fun getNamesOfRemovedColumns() -> result1: List<String>
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.TableTransformer.transform data-toc-label='transform'}

Apply the learned transformation to a table.

The table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table to which the learned transformation is applied. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun transform(
        table: Table
    ) -> result1: Table
    ```
