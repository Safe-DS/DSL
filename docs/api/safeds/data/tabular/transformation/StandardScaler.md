# `#!sds class` StandardScaler {#safeds.data.tabular.transformation.StandardScaler data-toc-label='StandardScaler'}

The StandardScaler transforms column values to a range by removing the mean and scaling to unit variance.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

??? quote "Stub code in `standard_scaler.sdsstub`"

    ```sds linenums="9"
    class StandardScaler() sub InvertibleTableTransformer {
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
        ) -> result1: StandardScaler
    }
    ```

## `#!sds fun` fit {#safeds.data.tabular.transformation.StandardScaler.fit data-toc-label='fit'}

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
| `result1` | [`StandardScaler`][safeds.data.tabular.transformation.StandardScaler] | The fitted transformer. |

??? quote "Stub code in `standard_scaler.sdsstub`"

    ```sds linenums="20"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: StandardScaler
    ```
