# `#!sds abstract class` InvertibleTableTransformer {#safeds.data.tabular.transformation.InvertibleTableTransformer data-toc-label='InvertibleTableTransformer'}

A `TableTransformer` that can also undo the learned transformation after it has been applied.

**Parent type:** [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer]

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="96"
    class InvertibleTableTransformer sub TableTransformer {
        /**
         * Learn a transformation for a set of columns in a table.
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
        ) -> result1: InvertibleTableTransformer
    
        /**
         * Undo the learned transformation.
         *
         * The table is not modified.
         *
         * @param transformedTable The table to be transformed back to the original version.
         *
         * @result result1 The original table.
         */
        @Pure
        @PythonName("inverse_transform")
        fun inverseTransform(
            @PythonName("transformed_table") transformedTable: Table
        ) -> result1: Table
    }
    ```

## `#!sds fun` fit {#safeds.data.tabular.transformation.InvertibleTableTransformer.fit data-toc-label='fit'}

Learn a transformation for a set of columns in a table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `None`, all columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer] | The fitted transformer. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="105"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: InvertibleTableTransformer
    ```

## `#!sds fun` inverseTransform {#safeds.data.tabular.transformation.InvertibleTableTransformer.inverseTransform data-toc-label='inverseTransform'}

Undo the learned transformation.

The table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The table to be transformed back to the original version. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The original table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="120"
    @Pure
    @PythonName("inverse_transform")
    fun inverseTransform(
        @PythonName("transformed_table") transformedTable: Table
    ) -> result1: Table
    ```
