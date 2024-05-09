# :test_tube:{ title="Experimental" } `#!sds class` ExperimentalLabelEncoder {#safeds.data.tabular.transformation.ExperimentalLabelEncoder data-toc-label='ExperimentalLabelEncoder'}

The LabelEncoder encodes one or more given columns into labels.

**Parent type:** [`ExperimentalInvertibleTableTransformer`][safeds.data.tabular.transformation.ExperimentalInvertibleTableTransformer]

??? quote "Stub code in `ExperimentalLabelEncoder.sdsstub`"

    ```sds linenums="10"
    class ExperimentalLabelEncoder() sub ExperimentalInvertibleTableTransformer {
        /**
         * Learn a transformation for a set of columns in a table.
         *
         * This transformer is not modified.
         *
         * @param table The table used to fit the transformer.
         * @param columnNames The list of columns from the table used to fit the transformer. If `None`, all columns are used.
         *
         * @result fittedTransformer The fitted transformer.
         */
        @Pure
        fun fit(
            table: ExperimentalTable,
            @PythonName("column_names") columnNames: List<String>?
        ) -> fittedTransformer: ExperimentalLabelEncoder
    }
    ```

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.ExperimentalLabelEncoder.isFitted data-toc-label='isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds fun` fit {#safeds.data.tabular.transformation.ExperimentalLabelEncoder.fit data-toc-label='fit'}

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
| `fittedTransformer` | [`ExperimentalLabelEncoder`][safeds.data.tabular.transformation.ExperimentalLabelEncoder] | The fitted transformer. |

??? quote "Stub code in `ExperimentalLabelEncoder.sdsstub`"

    ```sds linenums="21"
    @Pure
    fun fit(
        table: ExperimentalTable,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: ExperimentalLabelEncoder
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.ExperimentalLabelEncoder.fitAndTransform data-toc-label='fitAndTransform'}

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

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.ExperimentalLabelEncoder.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

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

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.ExperimentalLabelEncoder.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

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

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.ExperimentalLabelEncoder.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

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

## `#!sds fun` inverseTransform {#safeds.data.tabular.transformation.ExperimentalLabelEncoder.inverseTransform data-toc-label='inverseTransform'}

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

## `#!sds fun` transform {#safeds.data.tabular.transformation.ExperimentalLabelEncoder.transform data-toc-label='transform'}

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
