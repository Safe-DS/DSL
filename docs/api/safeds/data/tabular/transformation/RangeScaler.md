# `#!sds class` `RangeScaler` {#safeds.data.tabular.transformation.RangeScaler data-toc-label='[class] RangeScaler'}

The RangeScaler transforms column values by scaling each value to a given range.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `min` | [`Float`][safeds.lang.Float] | The minimum of the new range after the transformation | `#!sds 0.0` |
| `max` | [`Float`][safeds.lang.Float] | The maximum of the new range after the transformation | `#!sds 1.0` |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3]});
    val scaler = RangeScaler(0.0, 1.0).fit(table, ["a"]);
    val transformedTable = scaler.transform(table);
    // transformedTable = Table({"a": [0.0, 0.5, 1.0]});
    val originalTable = scaler.inverseTransform(transformedTable);
    // originalTable = Table({"a": [1, 2, 3]});
}
```

??? quote "Stub code in `RangeScaler.sdsstub`"

    ```sds linenums="22"
    class RangeScaler(
        const min: Float = 0.0,
        const max: Float = 1.0
    ) sub InvertibleTableTransformer {
        /**
         * The minimum of the new range after the transformation.
         */
        attr min: Float
        /**
         * The maximum of the new range after the transformation.
         */
        attr max: Float

        /**
         * Learn a transformation for a set of columns in a table.
         *
         * This transformer is not modified.
         *
         * @param table The table used to fit the transformer.
         * @param columnNames The list of columns from the table used to fit the transformer. If `null`, all numeric columns are used.
         *
         * @result fittedTransformer The fitted transformer.
         */
        @Pure
        fun fit(
            table: Table,
            @PythonName("column_names") columnNames: List<String>?
        ) -> fittedTransformer: RangeScaler

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
        ) -> (fittedTransformer: RangeScaler, transformedTable: Table)
    }
    ```

## `#!sds attr` `isFitted` {#safeds.data.tabular.transformation.RangeScaler.isFitted data-toc-label='[attr] isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` `max` {#safeds.data.tabular.transformation.RangeScaler.max data-toc-label='[attr] max'}

The maximum of the new range after the transformation.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds attr` `min` {#safeds.data.tabular.transformation.RangeScaler.min data-toc-label='[attr] min'}

The minimum of the new range after the transformation.

**Type:** [`Float`][safeds.lang.Float]

## `#!sds fun` `fit` {#safeds.data.tabular.transformation.RangeScaler.fit data-toc-label='[fun] fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `null`, all numeric columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`RangeScaler`][safeds.data.tabular.transformation.RangeScaler] | The fitted transformer. |

??? quote "Stub code in `RangeScaler.sdsstub`"

    ```sds linenums="45"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: RangeScaler
    ```

## `#!sds fun` `fitAndTransform` {#safeds.data.tabular.transformation.RangeScaler.fitAndTransform data-toc-label='[fun] fitAndTransform'}

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
| `fittedTransformer` | [`RangeScaler`][safeds.data.tabular.transformation.RangeScaler] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `RangeScaler.sdsstub`"

    ```sds linenums="62"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> (fittedTransformer: RangeScaler, transformedTable: Table)
    ```

## `#!sds fun` `inverseTransform` {#safeds.data.tabular.transformation.RangeScaler.inverseTransform data-toc-label='[fun] inverseTransform'}

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

## `#!sds fun` `transform` {#safeds.data.tabular.transformation.RangeScaler.transform data-toc-label='[fun] transform'}

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
