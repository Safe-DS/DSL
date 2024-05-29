# <code class="doc-symbol doc-symbol-class"></code> `OneHotEncoder` {#safeds.data.tabular.transformation.OneHotEncoder data-toc-label='[class] OneHotEncoder'}

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

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | `#!sds union<List<String>, String?>` | The list of columns used to fit the transformer. If `None`, all non-numeric columns are used. | `#!sds null` |
| `separator` | [`String`][safeds.lang.String] | The separator used to separate the original column name from the value in the new column names. | `#!sds "__"` |

**Examples:**

```sds hl_lines="3"
pipeline example {
   val table = Table({"a": ["z", "y"], "b": [3, 4]});
   val encoder = OneHotEncoder(columnNames=["a"]).fit(table);
   val transformedTable = encoder.transform(table);
   // Table({"a__z": [1, 0], "a__y": [0, 1], "b": [3, 4]})
   val originalTable = encoder.inverseTransform(transformedTable);
   // Table({"a": ["z", "y"], "b": [3, 4]})
}
```

??? quote "Stub code in `OneHotEncoder.sdsstub`"

    ```sds linenums="45"
    class OneHotEncoder(
        @PythonName("column_names") columnNames: union<List<String>, String, Nothing?> = null,
        separator: String = "__"
    ) sub InvertibleTableTransformer {
        /**
         * The separator used to separate the original column name from the value in the new column names.
         */
        attr separator: String

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
        ) -> fittedTransformer: OneHotEncoder

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
        ) -> (fittedTransformer: OneHotEncoder, transformedTable: Table)
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `isFitted` {#safeds.data.tabular.transformation.OneHotEncoder.isFitted data-toc-label='[attribute] isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-attribute"></code> `separator` {#safeds.data.tabular.transformation.OneHotEncoder.separator data-toc-label='[attribute] separator'}

The separator used to separate the original column name from the value in the new column names.

**Type:** [`String`][safeds.lang.String]

## <code class="doc-symbol doc-symbol-function"></code> `fit` {#safeds.data.tabular.transformation.OneHotEncoder.fit data-toc-label='[function] fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`OneHotEncoder`][safeds.data.tabular.transformation.OneHotEncoder] | The fitted transformer. |

??? quote "Stub code in `OneHotEncoder.sdsstub`"

    ```sds linenums="63"
    @Pure
    fun fit(
        table: Table
    ) -> fittedTransformer: OneHotEncoder
    ```

## <code class="doc-symbol doc-symbol-function"></code> `fitAndTransform` {#safeds.data.tabular.transformation.OneHotEncoder.fitAndTransform data-toc-label='[function] fitAndTransform'}

Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.

**Note:** Neither this transformer nor the given table are modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. The transformer is then applied to this table. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`OneHotEncoder`][safeds.data.tabular.transformation.OneHotEncoder] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `OneHotEncoder.sdsstub`"

    ```sds linenums="78"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table
    ) -> (fittedTransformer: OneHotEncoder, transformedTable: Table)
    ```

## <code class="doc-symbol doc-symbol-function"></code> `inverseTransform` {#safeds.data.tabular.transformation.OneHotEncoder.inverseTransform data-toc-label='[function] inverseTransform'}

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

## <code class="doc-symbol doc-symbol-function"></code> `transform` {#safeds.data.tabular.transformation.OneHotEncoder.transform data-toc-label='[function] transform'}

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
