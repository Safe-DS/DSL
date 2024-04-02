# `#!sds class` RangeScaler {#safeds.data.tabular.transformation.RangeScaler data-toc-label='RangeScaler'}

The RangeScaler transforms column values by scaling each value to a given range.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `minimum` | [`Float`][safeds.lang.Float] | The minimum of the new range after the transformation | `#!sds 0.0` |
| `maximum` | [`Float`][safeds.lang.Float] | The maximum of the new range after the transformation | `#!sds 1.0` |

??? quote "Source code in `range_scaler.sdsstub`"

    ```sds linenums="12"
    class RangeScaler(
        const minimum: Float = 0.0,
        const maximum: Float = 1.0
    ) sub InvertibleTableTransformer {
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
        ) -> result1: RangeScaler
    }
    ```

## `#!sds fun` fit {#safeds.data.tabular.transformation.RangeScaler.fit data-toc-label='fit'}

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
| `result1` | [`RangeScaler`][safeds.data.tabular.transformation.RangeScaler] | The fitted transformer. |

??? quote "Source code in `range_scaler.sdsstub`"

    ```sds linenums="26"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: RangeScaler
    ```
