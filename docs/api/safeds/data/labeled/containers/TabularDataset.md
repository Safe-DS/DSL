# `#!sds class` TabularDataset {#safeds.data.labeled.containers.TabularDataset data-toc-label='TabularDataset'}

A tabular dataset maps feature columns to a target column.

Create a tabular dataset from a mapping of column names to their values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | `#!sds union<Map<String, List<Any>>, Table>` | The data. | - |
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `extraNames` | [`List<String>`][safeds.lang.List] | Names of the columns that are neither features nor target. If None, no extra columns are used, i.e. all but the target column are used as features. | `#!sds []` |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val dataset = TabularDataset(
        {"id": [1, 2, 3], "feature": [4, 5, 6], "target": [1, 2, 3]},
        targetName="target",
        extraNames=["id"]
    );
}
```

??? quote "Stub code in `TabularDataset.sdsstub`"

    ```sds linenums="27"
    class TabularDataset(
        data: union<Map<String, List<Any>>, Table>,
        @PythonName("target_name") targetName: String,
        @PythonName("extra_names") extraNames: List<String> = []
    ) {
        /**
         * The feature columns of the tabular dataset.
         */
        attr features: Table
        /**
         * The target column of the tabular dataset.
         */
        attr target: Column
        /**
         * Additional columns of the tabular dataset that are neither features nor target.
         *
         * These can be used to store additional information about instances, such as IDs.
         */
        attr extras: Table

        /**
         * Return a new `Table` containing the feature columns and the target column.
         *
         * The original `TabularDataset` is not modified.
         *
         * @result table A table containing the feature columns and the target column.
         */
        @Pure
        @PythonName("to_table")
        fun toTable() -> table: Table
    }
    ```

## `#!sds attr` extras {#safeds.data.labeled.containers.TabularDataset.extras data-toc-label='extras'}

Additional columns of the tabular dataset that are neither features nor target.

These can be used to store additional information about instances, such as IDs.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

## `#!sds attr` features {#safeds.data.labeled.containers.TabularDataset.features data-toc-label='features'}

The feature columns of the tabular dataset.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

## `#!sds attr` target {#safeds.data.labeled.containers.TabularDataset.target data-toc-label='target'}

The target column of the tabular dataset.

**Type:** [`Column<Any?>`][safeds.data.tabular.containers.Column]

## `#!sds fun` toTable {#safeds.data.labeled.containers.TabularDataset.toTable data-toc-label='toTable'}

Return a new `Table` containing the feature columns and the target column.

The original `TabularDataset` is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the feature columns and the target column. |

??? quote "Stub code in `TabularDataset.sdsstub`"

    ```sds linenums="54"
    @Pure
    @PythonName("to_table")
    fun toTable() -> table: Table
    ```
