# <code class="doc-symbol doc-symbol-class"></code> `RangeScaler` {#safeds.data.tabular.transformation.RangeScaler data-toc-label='[class] RangeScaler'}

The RangeScaler transforms column values by scaling each value to a given range.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `min` | [`Float`][safeds.lang.Float] | The minimum of the new range after the transformation | `#!sds 0.0` |
| `max` | [`Float`][safeds.lang.Float] | The maximum of the new range after the transformation | `#!sds 1.0` |
| `columnNames` | `#!sds union<List<String>, String?>` | The list of columns used to fit the transformer. If `None`, all numeric columns are used. | `#!sds null` |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3]});
    val scaler = RangeScaler(0.0, 1.0, columnNames = "a").fit(table);
    val transformedTable = scaler.transform(table);
    // transformedTable = Table({"a": [0.0, 0.5, 1.0]});
    val originalTable = scaler.inverseTransform(transformedTable);
    // originalTable = Table({"a": [1, 2, 3]});
}
```

??? quote "Stub code in `RangeScaler.sdsstub`"

    ```sds linenums="23"
    class RangeScaler(
        @PythonName("min_") const min: Float = 0.0,
        @PythonName("max_") const max: Float = 1.0,
        @PythonName("column_names") columnNames: union<List<String>, String, Nothing?> = null
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
         *
         * @result fittedTransformer The fitted transformer.
         */
        @Pure
        fun fit(
            table: Table
        ) -> fittedTransformer: RangeScaler

        /**
         * Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.
         *
         * **Note:** Neither this transformer nor the given table are modified.
         *
         * @param table The table used to fit the transformer. The transformer is then applied to this table.
         *
         * @result fittedTransformer The fitted transformer.
         * @result transformedTable The transformed table.
         */
        @Pure
        @PythonName("fit_and_transform")
        fun fitAndTransform(
            table: Table
        ) -> (fittedTransformer: RangeScaler, transformedTable: Table)
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `isFitted` {#safeds.data.tabular.transformation.RangeScaler.isFitted data-toc-label='[attribute] isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-attribute"></code> `max` {#safeds.data.tabular.transformation.RangeScaler.max data-toc-label='[attribute] max'}

The maximum of the new range after the transformation.

**Type:** [`Float`][safeds.lang.Float]

## <code class="doc-symbol doc-symbol-attribute"></code> `min` {#safeds.data.tabular.transformation.RangeScaler.min data-toc-label='[attribute] min'}

The minimum of the new range after the transformation.

**Type:** [`Float`][safeds.lang.Float]

## <code class="doc-symbol doc-symbol-function"></code> `fit` {#safeds.data.tabular.transformation.RangeScaler.fit data-toc-label='[function] fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`RangeScaler`][safeds.data.tabular.transformation.RangeScaler] | The fitted transformer. |

??? quote "Stub code in `RangeScaler.sdsstub`"

    ```sds linenums="46"
    @Pure
    fun fit(
        table: Table
    ) -> fittedTransformer: RangeScaler
    ```

## <code class="doc-symbol doc-symbol-function"></code> `fitAndTransform` {#safeds.data.tabular.transformation.RangeScaler.fitAndTransform data-toc-label='[function] fitAndTransform'}

Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.

**Note:** Neither this transformer nor the given table are modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. The transformer is then applied to this table. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`RangeScaler`][safeds.data.tabular.transformation.RangeScaler] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `RangeScaler.sdsstub`"

    ```sds linenums="61"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table
    ) -> (fittedTransformer: RangeScaler, transformedTable: Table)
    ```

## <code class="doc-symbol doc-symbol-function"></code> `inverseTransform` {#safeds.data.tabular.transformation.RangeScaler.inverseTransform data-toc-label='[function] inverseTransform'}

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

    ```sds linenums="51"
    @Pure
    @PythonName("inverse_transform")
    fun inverseTransform(
        @PythonName("transformed_table") transformedTable: Table
    ) -> originalTable: Table
    ```

## <code class="doc-symbol doc-symbol-function"></code> `transform` {#safeds.data.tabular.transformation.RangeScaler.transform data-toc-label='[function] transform'}

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
