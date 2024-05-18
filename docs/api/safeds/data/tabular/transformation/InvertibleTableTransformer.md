# `#!sds class` `InvertibleTableTransformer` {#safeds.data.tabular.transformation.InvertibleTableTransformer data-toc-label='[class] InvertibleTableTransformer'}

A `TableTransformer` that can also undo the learned transformation after it has been applied.

**Parent type:** [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer]

**Inheritors:**

- [`LabelEncoder`][safeds.data.tabular.transformation.LabelEncoder]
- [`OneHotEncoder`][safeds.data.tabular.transformation.OneHotEncoder]
- [`RangeScaler`][safeds.data.tabular.transformation.RangeScaler]
- [`StandardScaler`][safeds.data.tabular.transformation.StandardScaler]

??? quote "Stub code in `InvertibleTableTransformer.sdsstub`"

    ```sds linenums="9"
    class InvertibleTableTransformer() sub TableTransformer {
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
        ) -> fittedTransformer: InvertibleTableTransformer

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
        ) -> (fittedTransformer: InvertibleTableTransformer, transformedTable: Table)

        /**
         * Undo the learned transformation as well as possible.
         *
         * Column order and types may differ from the original table. Likewise, some values might not be restored.
         *
         * **Note:** The given table is not modified.
         *
         * @param transformedTable The table to be transformed back to the original version.
         *
         * @result originalTable The original table.
         */
        @Pure
        @PythonName("inverse_transform")
        fun inverseTransform(
            @PythonName("transformed_table") transformedTable: Table
        ) -> originalTable: Table
    }
    ```

## `#!sds attr` `isFitted` {#safeds.data.tabular.transformation.InvertibleTableTransformer.isFitted data-toc-label='[attr] isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` `fit` {#safeds.data.tabular.transformation.InvertibleTableTransformer.fit data-toc-label='[fun] fit'}

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
| `fittedTransformer` | [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer] | The fitted transformer. |

??? quote "Stub code in `InvertibleTableTransformer.sdsstub`"

    ```sds linenums="20"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: InvertibleTableTransformer
    ```

## `#!sds fun` `fitAndTransform` {#safeds.data.tabular.transformation.InvertibleTableTransformer.fitAndTransform data-toc-label='[fun] fitAndTransform'}

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
| `fittedTransformer` | [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `InvertibleTableTransformer.sdsstub`"

    ```sds linenums="37"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> (fittedTransformer: InvertibleTableTransformer, transformedTable: Table)
    ```

## `#!sds fun` `inverseTransform` {#safeds.data.tabular.transformation.InvertibleTableTransformer.inverseTransform data-toc-label='[fun] inverseTransform'}

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

## `#!sds fun` `transform` {#safeds.data.tabular.transformation.InvertibleTableTransformer.transform data-toc-label='[fun] transform'}

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
