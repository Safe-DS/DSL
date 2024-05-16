# `#!sds class` LabelEncoder {#safeds.data.tabular.transformation.LabelEncoder data-toc-label='LabelEncoder'}

The LabelEncoder encodes one or more given columns into labels.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `partialOrder` | [`List<Any?>`][safeds.lang.List] | The partial order of the labels. The labels are encoded in the order of the given list. Additional values are encoded as the next integer after the last value in the list in the order they appear in the data. | `#!sds []` |

**Examples:**

```sds hl_lines="3"
pipeline example {
   val table = Table({"a": ["z", "y"], "b": [3, 4]});
   val encoder = LabelEncoder().fit(table, ["a"]);
   val transformedTable = encoder.transform(table);
   // Table({"a": [1, 0], "b": [3, 4]})
   val originalTable = encoder.inverseTransform(transformedTable);
   // Table({"a": ["z", "y"], "b": [3, 4]})
}
```

??? quote "Stub code in `LabelEncoder.sdsstub`"

    ```sds linenums="22"
    class LabelEncoder(
        @PythonName("partial_order") partialOrder: List<Any?> = []
    ) sub InvertibleTableTransformer {
        /**
         * Learn a transformation for a set of columns in a table.
         *
         * This transformer is not modified.
         *
         * @param table The table used to fit the transformer.
         * @param columnNames The list of columns from the table used to fit the transformer. If `null`, all non-numeric columns are used.
         *
         * @result fittedTransformer The fitted transformer.
         */
        @Pure
        fun fit(
            table: Table,
            @PythonName("column_names") columnNames: List<String>?
        ) -> fittedTransformer: LabelEncoder

        /**
         * Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.
         *
         * **Note:** Neither this transformer nor the given table are modified.
         *
         * @param table The table used to fit the transformer. The transformer is then applied to this table.
         * @param columnNames The list of columns from the table used to fit the transformer. If `null`, all columns are used.
         *
         * @result fittedTransformer The fitted transformer.
         * @result transformedTable The transformed table.
         */
        @Pure
        @PythonName("fit_and_transform")
        fun fitAndTransform(
            table: Table,
            @PythonName("column_names") columnNames: List<String>? = null
        ) -> (fittedTransformer: LabelEncoder, transformedTable: Table)
    }
    ```

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.LabelEncoder.isFitted data-toc-label='isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.data.tabular.transformation.LabelEncoder.fit data-toc-label='fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `null`, all non-numeric columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`LabelEncoder`][safeds.data.tabular.transformation.LabelEncoder] | The fitted transformer. |

??? quote "Stub code in `LabelEncoder.sdsstub`"

    ```sds linenums="35"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: LabelEncoder
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.LabelEncoder.fitAndTransform data-toc-label='fitAndTransform'}

Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.

**Note:** Neither this transformer nor the given table are modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. The transformer is then applied to this table. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `null`, all columns are used. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`LabelEncoder`][safeds.data.tabular.transformation.LabelEncoder] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `LabelEncoder.sdsstub`"

    ```sds linenums="52"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> (fittedTransformer: LabelEncoder, transformedTable: Table)
    ```

## `#!sds fun` inverseTransform {#safeds.data.tabular.transformation.LabelEncoder.inverseTransform data-toc-label='inverseTransform'}

Undo the learned transformation as well as possible.

Column order and types may differ from the original table. Likewise, some values might not be restored.

**Note:** The given table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The table to be transformed back to the original version. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `originalTable` | [`Table`][safeds.data.tabular.containers.Table] | The original table. |

??? quote "Stub code in `InvertibleTableTransformer.sdsstub`"

    ```sds linenums="55"
    @Pure
    @PythonName("inverse_transform")
    fun inverseTransform(
        @PythonName("transformed_table") transformedTable: Table
    ) -> originalTable: Table
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.LabelEncoder.transform data-toc-label='transform'}

Apply the learned transformation to a table.

**Note:** The given table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table to which the learned transformation is applied. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `TableTransformer.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun transform(
        table: Table
    ) -> transformedTable: Table
    ```
