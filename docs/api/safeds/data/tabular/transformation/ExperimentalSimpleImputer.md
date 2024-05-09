# :test_tube:{ title="Experimental" } `#!sds class` ExperimentalSimpleImputer {#safeds.data.tabular.transformation.ExperimentalSimpleImputer data-toc-label='ExperimentalSimpleImputer'}

Replace missing values using the given strategy.

**Parent type:** [`ExperimentalTableTransformer`][safeds.data.tabular.transformation.ExperimentalTableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `strategy` | [`Strategy`][safeds.data.tabular.transformation.ExperimentalSimpleImputer.Strategy] | How to replace missing values. | - |
| `valueToReplace` | `#!sds union<Float, String?>` | The value that should be replaced. | `#!sds null` |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import Column, Table
    // from safeds.data.tabular.transformation import Imputer
    //
    // table = Table.from_columns(
    //     [
    //         Column("a", [1, 3, None]),
    //         Column("b", [None, 2, 3]),
    //     ],
    // )
    // transformer = Imputer(Imputer.Strategy.Constant(0))
    // transformed_table = transformer.fit_and_transform(table)
}
```

??? quote "Stub code in `ExperimentalSimpleImputer.sdsstub`"

    ```sds linenums="28"
    class ExperimentalSimpleImputer(
        strategy: ExperimentalSimpleImputer.Strategy,
        @PythonName("value_to_replace") valueToReplace: union<Float, String, Nothing?> = null
    ) sub ExperimentalTableTransformer {
        /**
         * Various strategies to replace missing values.
         */
        enum Strategy {
            /**
             * Replace missing values with the given constant value.
             *
             * @param value The value to replace missing values.
             */
            Constant(value: Any)

            /**
             * Replace missing values with the mean of each column.
             */
            Mean

            /**
             * Replace missing values with the median of each column.
             */
            Median

            /**
             * Replace missing values with the mode of each column.
             */
            Mode
        }

        /**
         * The strategy used to replace missing values.
         */
        attr strategy: ExperimentalSimpleImputer.Strategy
        /**
         * The value that should be replaced.
         */
        @PythonName("value_to_replace") attr valueToReplace: Any

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
        ) -> fittedTransformer: ExperimentalSimpleImputer
    }
    ```

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.isFitted data-toc-label='isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` strategy {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.strategy data-toc-label='strategy'}

The strategy used to replace missing values.

**Type:** [`Strategy`][safeds.data.tabular.transformation.ExperimentalSimpleImputer.Strategy]

## `#!sds attr` valueToReplace {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.valueToReplace data-toc-label='valueToReplace'}

The value that should be replaced.

**Type:** [`Any`][safeds.lang.Any]

## `#!sds fun` fit {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.fit data-toc-label='fit'}

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
| `fittedTransformer` | [`ExperimentalSimpleImputer`][safeds.data.tabular.transformation.ExperimentalSimpleImputer] | The fitted transformer. |

??? quote "Stub code in `ExperimentalSimpleImputer.sdsstub`"

    ```sds linenums="78"
    @Pure
    fun fit(
        table: ExperimentalTable,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: ExperimentalSimpleImputer
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.fitAndTransform data-toc-label='fitAndTransform'}

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

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

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

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

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

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

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

## `#!sds fun` transform {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.transform data-toc-label='transform'}

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

## `#!sds enum` Strategy {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.Strategy data-toc-label='Strategy'}

Various strategies to replace missing values.

??? quote "Stub code in `ExperimentalSimpleImputer.sdsstub`"

    ```sds linenums="35"
    enum Strategy {
        /**
         * Replace missing values with the given constant value.
         *
         * @param value The value to replace missing values.
         */
        Constant(value: Any)

        /**
         * Replace missing values with the mean of each column.
         */
        Mean

        /**
         * Replace missing values with the median of each column.
         */
        Median

        /**
         * Replace missing values with the mode of each column.
         */
        Mode
    }
    ```

### Constant {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.Strategy.Constant data-toc-label='Constant'}

Replace missing values with the given constant value.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `value` | [`Any`][safeds.lang.Any] | The value to replace missing values. | - |

### Mean {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.Strategy.Mean data-toc-label='Mean'}

Replace missing values with the mean of each column.

### Median {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.Strategy.Median data-toc-label='Median'}

Replace missing values with the median of each column.

### Mode {#safeds.data.tabular.transformation.ExperimentalSimpleImputer.Strategy.Mode data-toc-label='Mode'}

Replace missing values with the mode of each column.
