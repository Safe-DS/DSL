# `#!sds class` OneHotEncoder {#safeds.data.tabular.transformation.OneHotEncoder data-toc-label='OneHotEncoder'}

A way to deal with categorical features that is particularly useful for unordered (i.e. nominal) data.

It replaces a column with a set of columns, each representing a unique value in the original column. The value of
each new column is 1 if the original column had that value, and 0 otherwise. Take the following table as an
example:

| col1 |
|------|
| "a"  |
| "b"  |
| "c"  |
| "a"  |

The one-hot encoding of this table is:

| col1__a | col1__b | col1__c |
|---------|---------|---------|
| 1       | 0       | 0       |
| 0       | 1       | 0       |
| 0       | 0       | 1       |
| 1       | 0       | 0       |

The name "one-hot" comes from the fact that each row has exactly one 1 in it, and the rest of the values are 0s.
One-hot encoding is closely related to dummy variable / indicator variables, which are used in statistics.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

**Examples:**

```sds hl_lines="3"
pipeline example {
   val table = Table({"a": ["z", "y"], "b": [3, 4]});
   val encoder = OneHotEncoder().fit(table, ["a"]);
   val transformedTable = encoder.transform(table);
   // Table({"a__z": [1, 0], "a__y": [0, 1], "b": [3, 4]})
   val originalTable = encoder.inverseTransform(transformedTable);
   // Table({"a": ["z", "y"], "b": [3, 4]})
}
```

??? quote "Stub code in `one_hot_encoder.sdsstub`"

    ```sds linenums="42"
    class OneHotEncoder() sub InvertibleTableTransformer {
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
        ) -> result1: OneHotEncoder
    }
    ```

## `#!sds fun` fit {#safeds.data.tabular.transformation.OneHotEncoder.fit data-toc-label='fit'}

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
| `result1` | [`OneHotEncoder`][safeds.data.tabular.transformation.OneHotEncoder] | The fitted transformer. |

??? quote "Stub code in `one_hot_encoder.sdsstub`"

    ```sds linenums="53"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: OneHotEncoder
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.OneHotEncoder.fitAndTransform data-toc-label='fitAndTransform'}

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

    ```sds linenums="85"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> result1: Table
    ```

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.OneHotEncoder.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

Get the names of all new columns that have been added by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the added columns, ordered as they will appear in the table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="44"
    @Pure
    @PythonName("get_names_of_added_columns")
    fun getNamesOfAddedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.OneHotEncoder.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

Get the names of all columns that have been changed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of changed columns, ordered as they appear in the table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="53"
    @Pure
    @PythonName("get_names_of_changed_columns")
    fun getNamesOfChangedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.OneHotEncoder.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

Get the names of all columns that have been removed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the removed columns, ordered as they appear in the table the transformer was fitted on. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="62"
    @Pure
    @PythonName("get_names_of_removed_columns")
    fun getNamesOfRemovedColumns() -> result1: List<String>
    ```

## `#!sds fun` inverseTransform {#safeds.data.tabular.transformation.OneHotEncoder.inverseTransform data-toc-label='inverseTransform'}

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

    ```sds linenums="120"
    @Pure
    @PythonName("inverse_transform")
    fun inverseTransform(
        @PythonName("transformed_table") transformedTable: Table
    ) -> result1: Table
    ```

## `#!sds fun` isFitted {#safeds.data.tabular.transformation.OneHotEncoder.isFitted data-toc-label='isFitted'}

Check if the transformer is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | Whether the transformer is fitted. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="71"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> result1: Boolean
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.OneHotEncoder.transform data-toc-label='transform'}

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

    ```sds linenums="34"
    @Pure
    fun transform(
        table: Table
    ) -> result1: Table
    ```
