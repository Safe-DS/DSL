# <code class="doc-symbol doc-symbol-class"></code> `Discretizer` {#safeds.data.tabular.transformation.Discretizer data-toc-label='[class] Discretizer'}

The Discretizer bins continuous data into intervals.

**Parent type:** [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `binCount` | [`Int`][safeds.lang.Int] | The number of bins to be created. | `#!sds 5` |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [1, 2, 3, 4]});
    val discretizer = Discretizer(2).fit(table, ["a"]);
    val transformedTable = discretizer.transform(table);
    // Table({"a": [0, 0, 1, 1]})
}
```

??? quote "Stub code in `Discretizer.sdsstub`"

    ```sds linenums="19"
    class Discretizer(
        @PythonName("number_of_bins") const binCount: Int = 5
    ) sub TableTransformer where {
        binCount >= 2
    } {
        /**
         * The number of bins to be created.
         */
        @PythonName("number_of_bins") attr binCount: Int

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
        ) -> fittedTransformer: Discretizer

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
        ) -> (fittedTransformer: Discretizer, transformedTable: Table)
    }
    ```

## <code class="doc-symbol doc-symbol-attribute"></code> `binCount` {#safeds.data.tabular.transformation.Discretizer.binCount data-toc-label='[attribute] binCount'}

The number of bins to be created.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `isFitted` {#safeds.data.tabular.transformation.Discretizer.isFitted data-toc-label='[attribute] isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-function"></code> `fit` {#safeds.data.tabular.transformation.Discretizer.fit data-toc-label='[function] fit'}

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
| `fittedTransformer` | [`Discretizer`][safeds.data.tabular.transformation.Discretizer] | The fitted transformer. |

??? quote "Stub code in `Discretizer.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: Discretizer
    ```

## <code class="doc-symbol doc-symbol-function"></code> `fitAndTransform` {#safeds.data.tabular.transformation.Discretizer.fitAndTransform data-toc-label='[function] fitAndTransform'}

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
| `fittedTransformer` | [`Discretizer`][safeds.data.tabular.transformation.Discretizer] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `Discretizer.sdsstub`"

    ```sds linenums="56"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> (fittedTransformer: Discretizer, transformedTable: Table)
    ```

## <code class="doc-symbol doc-symbol-function"></code> `transform` {#safeds.data.tabular.transformation.Discretizer.transform data-toc-label='[function] transform'}

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
