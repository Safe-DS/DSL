# `#!sds class` TabularDataset {#safeds.data.labeled.containers.TabularDataset data-toc-label='[class] TabularDataset'}

A dataset containing tabular data. It can be used to train machine learning models.

Columns in a tabular dataset are divided into three categories:

- The target column is the column that a model should predict.
- Feature columns are columns that a model should use to make predictions.
- Extra columns are columns that are neither feature nor target. They can be used to provide additional context,
  like an ID column.

Feature columns are implicitly defined as all columns except the target and extra columns. If no extra columns
are specified, all columns except the target column are used as features.

**Parent type:** [`Dataset`][safeds.data.labeled.containers.Dataset]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | `#!sds union<Map<String, List<Any>>, Table>` | The data. | - |
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `extraNames` | [`List<String>`][safeds.lang.List] | Names of the columns that are neither features nor target. If null, no extra columns are used, i.e. all but the target column are used as features. | `#!sds []` |

**Examples:**

```sds
pipeline example {
    val table = Table(
        {
            "id": [1, 2, 3],
            "feature": [4, 5, 6],
            "target": [1, 2, 3],
        },
    );
    val dataset = table.toTabularDataset(targetName="target", extraNames=["id"]);
}
```

??? quote "Stub code in `TabularDataset.sdsstub`"

    ```sds linenums="36"
    class TabularDataset(
        data: union<Map<String, List<Any>>, Table>,
        @PythonName("target_name") targetName: String,
        @PythonName("extra_names") extraNames: List<String> = []
    ) sub Dataset {
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
         * Return a table containing all columns of the tabular dataset.
         *
         * @result table A table containing all columns of the tabular dataset.
         */
        @Pure
        @PythonName("to_table")
        fun toTable() -> table: Table
    }
    ```

## `#!sds attr` extras {#safeds.data.labeled.containers.TabularDataset.extras data-toc-label='[attr] extras'}

Additional columns of the tabular dataset that are neither features nor target.

These can be used to store additional information about instances, such as IDs.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

## `#!sds attr` features {#safeds.data.labeled.containers.TabularDataset.features data-toc-label='[attr] features'}

The feature columns of the tabular dataset.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

## `#!sds attr` target {#safeds.data.labeled.containers.TabularDataset.target data-toc-label='[attr] target'}

The target column of the tabular dataset.

**Type:** [`Column<Any?>`][safeds.data.tabular.containers.Column]

## `#!sds fun` toTable {#safeds.data.labeled.containers.TabularDataset.toTable data-toc-label='[fun] toTable'}

Return a table containing all columns of the tabular dataset.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | A table containing all columns of the tabular dataset. |

??? quote "Stub code in `TabularDataset.sdsstub`"

    ```sds linenums="61"
    @Pure
    @PythonName("to_table")
    fun toTable() -> table: Table
    ```
