# `#!sds class` LabelEncoder {#safeds.data.tabular.transformation.LabelEncoder data-toc-label='LabelEncoder'}

The LabelEncoder encodes one or more given columns into labels.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

??? quote "Source code in `label_encoder.sdsstub`"

    ```sds linenums="9"
    class LabelEncoder() sub InvertibleTableTransformer {
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
        ) -> result1: LabelEncoder
    }
    ```

## `#!sds fun` fit {#safeds.data.tabular.transformation.LabelEncoder.fit data-toc-label='fit'}

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
| `result1` | [`LabelEncoder`][safeds.data.tabular.transformation.LabelEncoder] | The fitted transformer. |

??? quote "Source code in `label_encoder.sdsstub`"

    ```sds linenums="20"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: LabelEncoder
    ```
