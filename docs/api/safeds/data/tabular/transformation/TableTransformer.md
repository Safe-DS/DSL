---
search:
  boost: 0.5
---

# `#!sds abstract class` TableTransformer {#safeds.data.tabular.transformation.TableTransformer data-toc-label='TableTransformer'}

Learn a transformation for a set of columns in a `Table` and transform another `Table` with the same columns.

**Inheritors:**

- [`Discretizer`][safeds.data.tabular.transformation.Discretizer]
- `#!sds Imputer`
- [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]
- [`SimpleImputer`][safeds.data.tabular.transformation.SimpleImputer]

??? quote "Stub code in `TableTransformer.sdsstub`"

    ```sds linenums="8"
    class TableTransformer {
        /**
         * Whether the transformer is fitted.
         */
        @PythonName("is_fitted") attr isFitted: Boolean

        /**
         * Learn a transformation for a set of columns in a table.
         *
         * **Note:** This transformer is not modified.
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
        ) -> fittedTransformer: TableTransformer

        /**
         * Apply the learned transformation to a table.
         *
         * **Note:** The given table is not modified.
         *
         * @param table The table to which the learned transformation is applied.
         *
         * @result transformedTable The transformed table.
         */
        @Pure
        fun transform(
            table: Table
        ) -> transformedTable: Table

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
        ) -> (fittedTransformer: TableTransformer, transformedTable: Table)
    }
    ```

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.TableTransformer.isFitted data-toc-label='isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.data.tabular.transformation.TableTransformer.fit data-toc-label='fit'}

Learn a transformation for a set of columns in a table.

**Note:** This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `null`, all columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer] | The fitted transformer. |

??? quote "Stub code in `TableTransformer.sdsstub`"

    ```sds linenums="24"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: TableTransformer
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.TableTransformer.fitAndTransform data-toc-label='fitAndTransform'}

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
| `fittedTransformer` | [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `TableTransformer.sdsstub`"

    ```sds linenums="55"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> (fittedTransformer: TableTransformer, transformedTable: Table)
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.TableTransformer.transform data-toc-label='transform'}

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
