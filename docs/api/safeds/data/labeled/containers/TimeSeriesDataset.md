# :test_tube:{ title="Experimental" } `#!sds class` TimeSeriesDataset {#safeds.data.labeled.containers.TimeSeriesDataset data-toc-label='TimeSeriesDataset'}

A time series dataset maps feature and time columns to a target column. Not like the TabularDataset a TimeSeries needs to contain one target and one time column, but can have empty features.

Create a time series dataset from a mapping of column names to their values.

**Parent type:** [`Dataset`][safeds.data.labeled.containers.Dataset]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | `#!sds union<Map<String, List<Any>>, Table>` | The data. | - |
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `timeName` | [`String`][safeds.lang.String] | Name of the time column. | - |
| `extraNames` | [`List<String>?`][safeds.lang.List] | Names of the columns that are neither features nor target. If null, no extra columns are used, i.e. all but the target column are used as features. | `#!sds null` |

**Examples:**

```sds hl_lines="2"
pipeline example {
     val dataset = TimeSeriesDataset(
         {"id": [1, 2, 3], "feature": [4, 5, 6], "target": [1, 2, 3], "error":[0,0,1]},
         target_name="target",
         time_name = "id",
         extra_names=["error"]
     );
}
```

??? quote "Stub code in `TimeSeriesDataset.sdsstub`"

    ```sds linenums="27"
    class TimeSeriesDataset(
        data: union<Map<String, List<Any>>, Table>,
        @PythonName("target_name") targetName: String,
        @PythonName("time_name") timeName: String,
        @PythonName("extra_names") extraNames: List<String>? = null
    ) sub Dataset {
        /**
         * The feature columns of the time series dataset.
         */
        attr features: Table
        /**
         * The target column of the time series dataset.
         */
        attr target: Column<Any>
        /**
         * The time column of the time series dataset.
         */
        attr time: Column<Any>
        /**
         * Additional columns of the time series dataset that are neither features, target nor time.
         *
         * These can be used to store additional information about instances, such as IDs.
         */
        attr extras: Table

        /**
         * Return a new `Table` containing the feature columns, the target column, the time column and the extra columns.
         *
         * The original `TimeSeriesDataset` is not modified.
         *
         * @result table A table containing the feature columns, the target column, the time column and the extra columns.
         * @example
         * pipeline example {
         *      val dataset = TimeSeriesDataset(
         *          {"id": [1, 2, 3], "feature": [4, 5, 6], "target": [1, 2, 3], "error":[0,0,1]},
         *          target_name="target",
         *          time_name = "id",
         *          extra_names=["error"]
         *      );
         *      // The next line is an example for the Method "toTable()"
         *      val result = dataset.toTable();
         * }
         */
        @Pure
        @PythonName("to_table")
        fun toTable() -> table: Table
    }
    ```

## `#!sds attr` extras {#safeds.data.labeled.containers.TimeSeriesDataset.extras data-toc-label='extras'}

Additional columns of the time series dataset that are neither features, target nor time.

These can be used to store additional information about instances, such as IDs.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

## `#!sds attr` features {#safeds.data.labeled.containers.TimeSeriesDataset.features data-toc-label='features'}

The feature columns of the time series dataset.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

## `#!sds attr` target {#safeds.data.labeled.containers.TimeSeriesDataset.target data-toc-label='target'}

The target column of the time series dataset.

**Type:** [`Column<Any>`][safeds.data.tabular.containers.Column]

## `#!sds attr` time {#safeds.data.labeled.containers.TimeSeriesDataset.time data-toc-label='time'}

The time column of the time series dataset.

**Type:** [`Column<Any>`][safeds.data.tabular.containers.Column]

## `#!sds fun` toTable {#safeds.data.labeled.containers.TimeSeriesDataset.toTable data-toc-label='toTable'}

Return a new `Table` containing the feature columns, the target column, the time column and the extra columns.

The original `TimeSeriesDataset` is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | A table containing the feature columns, the target column, the time column and the extra columns. |

**Examples:**

```sds hl_lines="8 9"
pipeline example {
     val dataset = TimeSeriesDataset(
         {"id": [1, 2, 3], "feature": [4, 5, 6], "target": [1, 2, 3], "error":[0,0,1]},
         target_name="target",
         time_name = "id",
         extra_names=["error"]
     );
     // The next line is an example for the Method "toTable()"
     val result = dataset.toTable();
}
```

??? quote "Stub code in `TimeSeriesDataset.sdsstub`"

    ```sds linenums="70"
    @Pure
    @PythonName("to_table")
    fun toTable() -> table: Table
    ```
