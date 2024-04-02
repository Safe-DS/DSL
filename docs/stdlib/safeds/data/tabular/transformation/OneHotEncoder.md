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

??? quote "Source code in `one_hot_encoder.sdsstub`"

    ```sds linenums="32"
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

??? quote "Source code in `one_hot_encoder.sdsstub`"

    ```sds linenums="43"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: OneHotEncoder
    ```
