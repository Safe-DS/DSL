---
search:
  boost: 0.5
---

# `#!sds abstract class` InvertibleTableTransformer {#safeds.data.tabular.transformation.InvertibleTableTransformer data-toc-label='InvertibleTableTransformer'}

A `TableTransformer` that can also undo the learned transformation after it has been applied.

**Parent type:** [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer]

**Inheritors:**

- [`LabelEncoder`][safeds.data.tabular.transformation.LabelEncoder]
- [`OneHotEncoder`][safeds.data.tabular.transformation.OneHotEncoder]
- [`RangeScaler`][safeds.data.tabular.transformation.RangeScaler]
- [`StandardScaler`][safeds.data.tabular.transformation.StandardScaler]

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="92"
    class InvertibleTableTransformer sub TableTransformer {
        /**
         * Learn a transformation for a set of columns in a table.
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
        ) -> result1: InvertibleTableTransformer

        /**
         * Undo the learned transformation.
         *
         * The table is not modified.
         *
         * @param transformedTable The table to be transformed back to the original version.
         *
         * @result result1 The original table.
         */
        @Pure
        @PythonName("inverse_transform")
        fun inverseTransform(
            @PythonName("transformed_table") transformedTable: Table
        ) -> result1: Table
    }
    ```

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.InvertibleTableTransformer.isFitted data-toc-label='isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.data.tabular.transformation.InvertibleTableTransformer.fit data-toc-label='fit'}

Learn a transformation for a set of columns in a table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `None`, all columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer] | The fitted transformer. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="101"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: InvertibleTableTransformer
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.InvertibleTableTransformer.fitAndTransform data-toc-label='fitAndTransform'}

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

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.InvertibleTableTransformer.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

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

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.InvertibleTableTransformer.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

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

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.InvertibleTableTransformer.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

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

## `#!sds fun` inverseTransform {#safeds.data.tabular.transformation.InvertibleTableTransformer.inverseTransform data-toc-label='inverseTransform'}

Undo the learned transformation.

The table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The table to be transformed back to the original version. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The original table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="116"
    @Pure
    @PythonName("inverse_transform")
    fun inverseTransform(
        @PythonName("transformed_table") transformedTable: Table
    ) -> result1: Table
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.InvertibleTableTransformer.transform data-toc-label='transform'}

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
