# :test_tube:{ title="Experimental" } `#!sds class` ExperimentalTabularDataset {#safeds.data.labeled.containers.ExperimentalTabularDataset data-toc-label='ExperimentalTabularDataset'}

A dataset containing tabular data. It can be used to train machine learning models.

Columns in a tabular dataset are divided into three categories:

* The target column is the column that a model should predict.
* Feature columns are columns that a model should use to make predictions.
* Extra columns are columns that are neither feature nor target. They can be used to provide additional context,
  like an ID column.

Feature columns are implicitly defined as all columns except the target and extra columns. If no extra columns
are specified, all columns except the target column are used as features.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The data. | - |
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `extraNames` | [`List<String>?`][safeds.lang.List] | Names of the columns that are neither features nor target. If None, no extra columns are used, i.e. all but the target column are used as features. | `#!sds null` |

**Examples:**

```sds
pipeline example {
    // from safeds.data.labeled.containers import TabularDataset
    // dataset = TabularDataset(
    //     {"id": [1, 2, 3], "feature": [4, 5, 6], "target": [1, 2, 3]},
    //     target_name="target",
    //     extra_names=["id"]
    // )
}
```

??? quote "Stub code in `ExperimentalTabularDataset.sdsstub`"

    ```sds linenums="34"
    class ExperimentalTabularDataset(
        data: ExperimentalTable,
        @PythonName("target_name") targetName: String,
        @PythonName("extra_names") extraNames: List<String>? = null
    ) {
        /**
         * The feature columns of the tabular dataset.
         */
        attr features: ExperimentalTable
        /**
         * The target column of the tabular dataset.
         */
        attr target: ExperimentalColumn<Any>
        /**
         * Additional columns of the tabular dataset that are neither features nor target.
         *
         * These can be used to store additional information about instances, such as IDs.
         */
        attr extras: ExperimentalTable

        /**
         * Return a table containing all columns of the tabular dataset.
         *
         * @result table A table containing all columns of the tabular dataset.
         */
        @Pure
        @PythonName("to_table")
        fun toTable() -> table: ExperimentalTable
    }
    ```

## `#!sds attr` extras {#safeds.data.labeled.containers.ExperimentalTabularDataset.extras data-toc-label='extras'}

Additional columns of the tabular dataset that are neither features nor target.

These can be used to store additional information about instances, such as IDs.

**Type:** [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable]

## `#!sds attr` features {#safeds.data.labeled.containers.ExperimentalTabularDataset.features data-toc-label='features'}

The feature columns of the tabular dataset.

**Type:** [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable]

## `#!sds attr` target {#safeds.data.labeled.containers.ExperimentalTabularDataset.target data-toc-label='target'}

The target column of the tabular dataset.

**Type:** [`ExperimentalColumn<Any>`][safeds.data.tabular.containers.ExperimentalColumn]

## `#!sds fun` toTable {#safeds.data.labeled.containers.ExperimentalTabularDataset.toTable data-toc-label='toTable'}

Return a table containing all columns of the tabular dataset.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | A table containing all columns of the tabular dataset. |

??? quote "Stub code in `ExperimentalTabularDataset.sdsstub`"

    ```sds linenums="59"
    @Pure
    @PythonName("to_table")
    fun toTable() -> table: ExperimentalTable
    ```
