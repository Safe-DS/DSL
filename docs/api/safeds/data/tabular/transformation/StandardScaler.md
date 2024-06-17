# <code class="doc-symbol doc-symbol-class"></code> `StandardScaler` {#safeds.data.tabular.transformation.StandardScaler data-toc-label='[class] StandardScaler'}

The StandardScaler transforms column values to a range by removing the mean and scaling to unit variance.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | `#!sds union<List<String>, String?>` | The list of columns used to fit the transformer. If `None`, all numeric columns are used. | `#!sds null` |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [0, 1, 0]});
    val scaler = StandardScaler(columnNames = "a").fit(table);
    val transformedTable = scaler.transform(table);
    // transformedTable = Table({"a": [-0.707,  1.414, -0.707]});
    val originalTable = scaler.inverseTransform(transformedTable);
    // originalTable = Table({"a": [1, 2, 3]});
}
```

??? quote "Stub code in `StandardScaler.sdsstub`"

    ```sds linenums="21"
    class StandardScaler(
        @PythonName("column_names") columnNames: union<List<String>, String, Nothing?> = null
    ) sub InvertibleTableTransformer {
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
        ) -> fittedTransformer: StandardScaler

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
        ) -> (fittedTransformer: StandardScaler, transformedTable: Table)
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `isFitted` {#safeds.data.tabular.transformation.StandardScaler.isFitted data-toc-label='[attribute] isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-function"></code> `fit` {#safeds.data.tabular.transformation.StandardScaler.fit data-toc-label='[function] fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`StandardScaler`][safeds.data.tabular.transformation.StandardScaler] | The fitted transformer. |

??? quote "Stub code in `StandardScaler.sdsstub`"

    ```sds linenums="33"
    @Pure
    fun fit(
        table: Table
    ) -> fittedTransformer: StandardScaler
    ```

## <code class="doc-symbol doc-symbol-function"></code> `fitAndTransform` {#safeds.data.tabular.transformation.StandardScaler.fitAndTransform data-toc-label='[function] fitAndTransform'}

Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.

**Note:** Neither this transformer nor the given table are modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. The transformer is then applied to this table. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`StandardScaler`][safeds.data.tabular.transformation.StandardScaler] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `StandardScaler.sdsstub`"

    ```sds linenums="48"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table
    ) -> (fittedTransformer: StandardScaler, transformedTable: Table)
    ```

## <code class="doc-symbol doc-symbol-function"></code> `inverseTransform` {#safeds.data.tabular.transformation.StandardScaler.inverseTransform data-toc-label='[function] inverseTransform'}

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

## <code class="doc-symbol doc-symbol-function"></code> `transform` {#safeds.data.tabular.transformation.StandardScaler.transform data-toc-label='[function] transform'}

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
