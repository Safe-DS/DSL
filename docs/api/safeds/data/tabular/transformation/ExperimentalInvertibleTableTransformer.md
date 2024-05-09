# :test_tube:{ title="Experimental" } `#!sds class` ExperimentalInvertibleTableTransformer {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer data-toc-label='ExperimentalInvertibleTableTransformer'}

A `TableTransformer` that can also undo the learned transformation after it has been applied.

**Parent type:** [`ExperimentalTableTransformer`][safeds.data.tabular.transformation.ExperimentalTableTransformer]

**Inheritors:**

- [`ExperimentalLabelEncoder`][safeds.data.tabular.transformation.ExperimentalLabelEncoder]
- [`ExperimentalOneHotEncoder`][safeds.data.tabular.transformation.ExperimentalOneHotEncoder]
- [`ExperimentalRangeScaler`][safeds.data.tabular.transformation.ExperimentalRangeScaler]
- [`ExperimentalStandardScaler`][safeds.data.tabular.transformation.ExperimentalStandardScaler]

??? quote "Stub code in `ExperimentalInvertibleTableTransformer.sdsstub`"

    ```sds linenums="10"
    class ExperimentalInvertibleTableTransformer() sub ExperimentalTableTransformer {
        /**
         * Undo the learned transformation.
         *
         * The table is not modified.
         *
         * @param transformedTable The table to be transformed back to the original version.
         *
         * @result originalTable The original table.
         */
        @Pure
        @PythonName("inverse_transform")
        fun inverseTransform(
            @PythonName("transformed_table") transformedTable: ExperimentalTable
        ) -> originalTable: ExperimentalTable
    }
    ```

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer.isFitted data-toc-label='isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer.fit data-toc-label='fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `None`, all columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`ExperimentalTableTransformer`][safeds.data.tabular.transformation.ExperimentalTableTransformer] | The fitted transformer. |

??? quote "Stub code in `ExperimentalTableTransformer.sdsstub`"

    ```sds linenums="25"
    @Pure
    fun fit(
        table: ExperimentalTable,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: ExperimentalTableTransformer
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer.fitAndTransform data-toc-label='fitAndTransform'}

Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.

Neither the transformer nor the table are modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table used to fit the transformer. The transformer is then applied to this table. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `None`, all columns are used. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`ExperimentalTableTransformer`][safeds.data.tabular.transformation.ExperimentalTableTransformer] | - |
| `result2` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | - |

??? quote "Stub code in `ExperimentalTableTransformer.sdsstub`"

    ```sds linenums="83"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: ExperimentalTable,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> (result1: ExperimentalTableTransformer, result2: ExperimentalTable)
    ```

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

Get the names of all new columns that have been added by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `addedColumns` | [`List<String>`][safeds.lang.List] | A list of names of the added columns, ordered as they will appear in the table. |

??? quote "Stub code in `ExperimentalTableTransformer.sdsstub`"

    ```sds linenums="50"
    @Pure
    @PythonName("get_names_of_added_columns")
    fun getNamesOfAddedColumns() -> addedColumns: List<String>
    ```

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

Get the names of all columns that have been changed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `changedColumns` | [`List<String>`][safeds.lang.List] | A list of names of changed columns, ordered as they appear in the table. |

??? quote "Stub code in `ExperimentalTableTransformer.sdsstub`"

    ```sds linenums="59"
    @Pure
    @PythonName("get_names_of_changed_columns")
    fun getNamesOfChangedColumns() -> changedColumns: List<String>
    ```

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

Get the names of all columns that have been removed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `removedColumns` | [`List<String>`][safeds.lang.List] | A list of names of the removed columns, ordered as they appear in the table the transformer was fitted on. |

??? quote "Stub code in `ExperimentalTableTransformer.sdsstub`"

    ```sds linenums="68"
    @Pure
    @PythonName("get_names_of_removed_columns")
    fun getNamesOfRemovedColumns() -> removedColumns: List<String>
    ```

## `#!sds fun` inverseTransform {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer.inverseTransform data-toc-label='inverseTransform'}

Undo the learned transformation.

The table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformedTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table to be transformed back to the original version. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `originalTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The original table. |

??? quote "Stub code in `ExperimentalInvertibleTableTransformer.sdsstub`"

    ```sds linenums="20"
    @Pure
    @PythonName("inverse_transform")
    fun inverseTransform(
        @PythonName("transformed_table") transformedTable: ExperimentalTable
    ) -> originalTable: ExperimentalTable
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer.transform data-toc-label='transform'}

Apply the learned transformation to a table.

The table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table to which the learned transformation is applied. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedTable` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The transformed table. |

??? quote "Stub code in `ExperimentalTableTransformer.sdsstub`"

    ```sds linenums="40"
    @Pure
    fun transform(
        table: ExperimentalTable
    ) -> transformedTable: ExperimentalTable
    ```
