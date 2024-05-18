# `#!sds class` `OneHotEncoder` {#safeds.data.tabular.transformation.OneHotEncoder data-toc-label='[class] OneHotEncoder'}

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
| `separator` | [`String`][safeds.lang.String] | The separator used to separate the original column name from the value in the new column names. | `#!sds "__"` |

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

??? quote "Stub code in `OneHotEncoder.sdsstub`"

    ```sds linenums="44"
    class OneHotEncoder(
        separator: String = "__"
    ) sub InvertibleTableTransformer {
        /**
         * Learn a transformation for a set of columns in a table.
         *
         * This transformer is not modified.
         *
         * @param table The table used to fit the transformer.
         * @param columnNames The list of columns from the table used to fit the transformer. If `null`, all columns are used.
         *
         * @result fittedTransformer The fitted transformer.
         */
        @Pure
        fun fit(
            table: Table,
            @PythonName("column_names") columnNames: List<String>?
        ) -> fittedTransformer: OneHotEncoder

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
        ) -> (fittedTransformer: OneHotEncoder, transformedTable: Table)
    }
    ```

## `#!sds attr` `isFitted` {#safeds.data.tabular.transformation.OneHotEncoder.isFitted data-toc-label='[attr] isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` `fit` {#safeds.data.tabular.transformation.OneHotEncoder.fit data-toc-label='[fun] fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `null`, all columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`OneHotEncoder`][safeds.data.tabular.transformation.OneHotEncoder] | The fitted transformer. |

??? quote "Stub code in `OneHotEncoder.sdsstub`"

    ```sds linenums="57"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: OneHotEncoder
    ```

## `#!sds fun` `fitAndTransform` {#safeds.data.tabular.transformation.OneHotEncoder.fitAndTransform data-toc-label='[fun] fitAndTransform'}

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
| `fittedTransformer` | [`OneHotEncoder`][safeds.data.tabular.transformation.OneHotEncoder] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `OneHotEncoder.sdsstub`"

    ```sds linenums="74"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> (fittedTransformer: OneHotEncoder, transformedTable: Table)
    ```

## `#!sds fun` `inverseTransform` {#safeds.data.tabular.transformation.OneHotEncoder.inverseTransform data-toc-label='[fun] inverseTransform'}

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

## `#!sds fun` `transform` {#safeds.data.tabular.transformation.OneHotEncoder.transform data-toc-label='[fun] transform'}

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
