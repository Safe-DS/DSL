# `#!sds class` TimeSeries {#safeds.data.tabular.containers.TimeSeries data-toc-label='TimeSeries'}

**Parent type:** [`Table`][safeds.data.tabular.containers.Table]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `data` | [`Map<String, List<Any>>`][safeds.lang.Map] | The data. | - |
| `targetName` | [`String`][safeds.lang.String] | Name of the target column. | - |
| `timeName` | [`String`][safeds.lang.String] | Name of the time column | - |
| `featureNames` | [`List<String>?`][safeds.lang.List] | Names of the feature columns. If None, all columns except the target and time columns are used. | `#!sds null` |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="12"
    class TimeSeries(
        data: Map<String, List<Any>>,
        @PythonName("target_name") targetName: String,
        @PythonName("time_name") timeName: String,
        @PythonName("feature_names") featureNames: List<String>? = null
    ) sub Table {
        /**
         * Get the target column of the tagged table.
         */
        attr target: Column
        /**
         * Get the feature columns of the tagged table.
         */
        attr features: Table
        /**
         * Get the time column of the time series.
         */
        attr time: Column
    
        /**
         * Return a new `TimeSeries` with the provided column attached at the end, as neither target nor feature column.
         *
         * The original time series is not modified.
         *
         * @param column The column to be added.
         *
         * @result result1 The time series with the column attached as neither target nor feature column.
         */
        @Pure
        @PythonName("add_column")
        fun addColumn(
            column: Column
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with the provided column attached at the end, as a feature column.
         *
         * the original time series is not modified.
         *
         * @param column The column to be added.
         *
         * @result result1 The time series with the attached feature column.
         */
        @Pure
        @PythonName("add_column_as_feature")
        fun addColumnAsFeature(
            column: Column
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with the provided columns attached at the end, as feature columns.
         *
         * The original time series is not modified.
         *
         * @param columns The columns to be added as features.
         *
         * @result result1 The time series with the attached feature columns.
         */
        @Pure
        @PythonName("add_columns_as_features")
        fun addColumnsAsFeatures(
            columns: union<List<Column>, Table>
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with multiple added columns, as neither target nor feature columns.
         *
         * The original time series is not modified.
         *
         * @param columns The columns to be added.
         *
         * @result result1 A new time series combining the original table and the given columns as neither target nor feature columns.
         */
        @Pure
        @PythonName("add_columns")
        fun addColumns(
            columns: union<List<Column>, Table>
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with an extra Row attached.
         *
         * The original time series is not modified.
         *
         * @param row The row to be added.
         *
         * @result result1 A new time series with the added row at the end.
         */
        @Pure
        @PythonName("add_row")
        fun addRow(
            row: Row
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with multiple extra Rows attached.
         *
         * The original time series is not modified.
         *
         * @param rows The rows to be added.
         *
         * @result result1 A new time series which combines the original time series and the given rows.
         */
        @Pure
        @PythonName("add_rows")
        fun addRows(
            rows: union<List<Row>, Table>
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` containing only rows that match the given Callable (e.g. lambda function).
         *
         * The original time series is not modified.
         *
         * @param query A Callable that is applied to all rows.
         *
         * @result result1 A time series containing only the rows to match the query.
         */
        @Pure
        @PythonName("filter_rows")
        fun filterRows(
            query: (param1: Row) -> param2: Boolean
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with only the given column(s).
         *
         * The original time series is not modified.
         *
         * @param columnNames A list containing the columns to be kept.
         *
         * @result result1 A time series containing only the given column(s).
         */
        @Pure
        @PythonName("keep_only_columns")
        fun keepOnlyColumns(
            @PythonName("column_names") columnNames: List<String>
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with the given column(s) removed from the time series.
         *
         * The original time series is not modified.
         *
         * @param columnNames The names of all columns to be dropped.
         *
         * @result result1 A time series without the given columns.
         */
        @Pure
        @PythonName("remove_columns")
        fun removeColumns(
            @PythonName("column_names") columnNames: List<String>
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with every column that misses values removed.
         *
         * The original time series is not modified.
         *
         * @result result1 A time series without the columns that contain missing values.
         */
        @Pure
        @PythonName("remove_columns_with_missing_values")
        fun removeColumnsWithMissingValues() -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with every column that contains non-numerical values removed.
         *
         * The original time series is not modified.
         *
         * @result result1 A time series without the columns that contain non-numerical values.
         */
        @Pure
        @PythonName("remove_columns_with_non_numerical_values")
        fun removeColumnsWithNonNumericalValues() -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with all row duplicates removed.
         *
         * The original time series is not modified.
         *
         * @result result1 The time series with the duplicate rows removed.
         */
        @Pure
        @PythonName("remove_duplicate_rows")
        fun removeDuplicateRows() -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` without the rows that contain missing values.
         *
         * The original time series is not modified.
         *
         * @result result1 A time series without the rows that contain missing values.
         */
        @Pure
        @PythonName("remove_rows_with_missing_values")
        fun removeRowsWithMissingValues() -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with all rows that contain at least one outlier removed.
         *
         * We define an outlier as a value that has a distance of more than 3 standard deviations from the column mean.
         * Missing values are not considered outliers. They are also ignored during the calculation of the standard
         * deviation.
         *
         * The original time series is not modified.
         *
         * @result result1 A new time series without rows containing outliers.
         */
        @Pure
        @PythonName("remove_rows_with_outliers")
        fun removeRowsWithOutliers() -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with a single column renamed.
         *
         * The original time series is not modified.
         *
         * @param oldName The old name of the column.
         * @param newName The new name of the column.
         *
         * @result result1 The time series with the renamed column.
         */
        @Pure
        @PythonName("rename_column")
        fun renameColumn(
            @PythonName("old_name") oldName: String,
            @PythonName("new_name") newName: String
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with the specified old column replaced by a list of new columns.
         *
         * If the column to be replaced is the target or time column, it must be replaced by exactly one column. That column
         * becomes the new target or time column. If the column to be replaced is a feature column, the new columns that replace it
         * all become feature columns.
         *
         * The order of columns is kept. The original time series is not modified.
         *
         * @param oldColumnName The name of the column to be replaced.
         * @param newColumns The new columns replacing the old column.
         *
         * @result result1 A time series with the old column replaced by the new columns.
         */
        @Pure
        @PythonName("replace_column")
        fun replaceColumn(
            @PythonName("old_column_name") oldColumnName: String,
            @PythonName("new_columns") newColumns: List<Column>
        ) -> result1: TimeSeries
    
        /**
         * Slice a part of the table into a new `TimeSeries`.
         *
         * The original time series is not modified.
         *
         * @param start The first index of the range to be copied into a new time series, None by default.
         * @param end The last index of the range to be copied into a new time series, None by default.
         * @param step The step size used to iterate through the time series, 1 by default.
         *
         * @result result1 The resulting time series.
         */
        @Pure
        @PythonName("slice_rows")
        fun sliceRows(
            start: Int? = null,
            end: Int? = null,
            step: Int = 1
        ) -> result1: TimeSeries
    
        /**
         * Sort the columns of a `TimeSeries` with the given comparator and return a new `TimeSeries`.
         *
         * The comparator is a function that takes two columns `col1` and `col2` and
         * returns an integer:
         *
         * * If the function returns a negative number, `col1` will be ordered before `col2`.
         * * If the function returns a positive number, `col1` will be ordered after `col2`.
         * * If the function returns 0, the original order of `col1` and `col2` will be kept.
         *
         * If no comparator is given, the columns will be sorted alphabetically by their name.
         *
         * The original time series is not modified.
         *
         * @param comparator The function used to compare two columns.
         *
         * @result result1 A new time series with sorted columns.
         */
        @Pure
        @PythonName("sort_columns")
        fun sortColumns(
            comparator: (param1: Column, param2: Column) -> param3: Int
        ) -> result1: TimeSeries
    
        /**
         * Return a new `TimeSeries` with the provided column transformed by calling the provided transformer.
         *
         * The original time series is not modified.
         *
         * @param name The name of the column to be transformed.
         * @param transformer The transformer to the given column
         *
         * @result result1 The time series with the transformed column.
         */
        @Pure
        @PythonName("transform_column")
        fun transformColumn(
            name: String,
            transformer: (param1: Row) -> param2: Any
        ) -> result1: TimeSeries
    
        /**
         * Plot a lagplot for the target column.
         *
         * @param lag The amount of lag used to plot
         *
         * @result result1 The plot as an image.
         */
        @Pure
        @PythonName("plot_lagplot")
        fun plotLagplot(
            lag: Int
        ) -> result1: Image
    
        /**
         * Plot the time series target or the given column(s) as line plot.
         *
         * The function will take the time column as the default value for y_column_name and the target column as the
         * default value for x_column_name.
         *
         * @param xColumnName The column name of the column to be plotted on the x-Axis, default is the time column.
         * @param yColumnName The column name of the column to be plotted on the y-Axis, default is the target column.
         *
         * @result result1 The plot as an image.
         */
        @Pure
        @PythonName("plot_lineplot")
        fun plotLineplot(
            @PythonName("x_column_name") xColumnName: String? = null,
            @PythonName("y_column_name") yColumnName: String? = null
        ) -> result1: Image
    
        /**
         * Plot the time series target or the given column(s) as scatter plot.
         *
         * The function will take the time column as the default value for x_column_name and the target column as the
         * default value for y_column_name.
         *
         * @param xColumnName The column name of the column to be plotted on the x-Axis.
         * @param yColumnName The column name of the column to be plotted on the y-Axis.
         *
         * @result result1 The plot as an image.
         */
        @Pure
        @PythonName("plot_scatterplot")
        fun plotScatterplot(
            @PythonName("x_column_name") xColumnName: String? = null,
            @PythonName("y_column_name") yColumnName: String? = null
        ) -> result1: Image
    }
    ```

## `#!sds attr` features {#safeds.data.tabular.containers.TimeSeries.features data-toc-label='features'}

Get the feature columns of the tagged table.

**Type:** [`Table`][safeds.data.tabular.containers.Table]

## `#!sds attr` target {#safeds.data.tabular.containers.TimeSeries.target data-toc-label='target'}

Get the target column of the tagged table.

**Type:** [`Column<Any?>`][safeds.data.tabular.containers.Column]

## `#!sds attr` time {#safeds.data.tabular.containers.TimeSeries.time data-toc-label='time'}

Get the time column of the time series.

**Type:** [`Column<Any?>`][safeds.data.tabular.containers.Column]

## `#!sds fun` addColumn {#safeds.data.tabular.containers.TimeSeries.addColumn data-toc-label='addColumn'}

Return a new `TimeSeries` with the provided column attached at the end, as neither target nor feature column.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the column attached as neither target nor feature column. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="40"
    @Pure
    @PythonName("add_column")
    fun addColumn(
        column: Column
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addColumnAsFeature {#safeds.data.tabular.containers.TimeSeries.addColumnAsFeature data-toc-label='addColumnAsFeature'}

Return a new `TimeSeries` with the provided column attached at the end, as a feature column.

the original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `column` | [`Column<Any?>`][safeds.data.tabular.containers.Column] | The column to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the attached feature column. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="55"
    @Pure
    @PythonName("add_column_as_feature")
    fun addColumnAsFeature(
        column: Column
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addColumns {#safeds.data.tabular.containers.TimeSeries.addColumns data-toc-label='addColumns'}

Return a new `TimeSeries` with multiple added columns, as neither target nor feature columns.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<List<Column<Any?>>, Table>` | The columns to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series combining the original table and the given columns as neither target nor feature columns. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="85"
    @Pure
    @PythonName("add_columns")
    fun addColumns(
        columns: union<List<Column>, Table>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addColumnsAsFeatures {#safeds.data.tabular.containers.TimeSeries.addColumnsAsFeatures data-toc-label='addColumnsAsFeatures'}

Return a new `TimeSeries` with the provided columns attached at the end, as feature columns.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `#!sds union<List<Column<Any?>>, Table>` | The columns to be added as features. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the attached feature columns. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="70"
    @Pure
    @PythonName("add_columns_as_features")
    fun addColumnsAsFeatures(
        columns: union<List<Column>, Table>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addRow {#safeds.data.tabular.containers.TimeSeries.addRow data-toc-label='addRow'}

Return a new `TimeSeries` with an extra Row attached.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `row` | [`Row`][safeds.data.tabular.containers.Row] | The row to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series with the added row at the end. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="100"
    @Pure
    @PythonName("add_row")
    fun addRow(
        row: Row
    ) -> result1: TimeSeries
    ```

## `#!sds fun` addRows {#safeds.data.tabular.containers.TimeSeries.addRows data-toc-label='addRows'}

Return a new `TimeSeries` with multiple extra Rows attached.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `rows` | `#!sds union<List<Row>, Table>` | The rows to be added. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series which combines the original time series and the given rows. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="115"
    @Pure
    @PythonName("add_rows")
    fun addRows(
        rows: union<List<Row>, Table>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` filterRows {#safeds.data.tabular.containers.TimeSeries.filterRows data-toc-label='filterRows'}

Return a new `TimeSeries` containing only rows that match the given Callable (e.g. lambda function).

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `query` | `#!sds (param1: Row) -> (param2: Boolean)` | A Callable that is applied to all rows. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series containing only the rows to match the query. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="130"
    @Pure
    @PythonName("filter_rows")
    fun filterRows(
        query: (param1: Row) -> param2: Boolean
    ) -> result1: TimeSeries
    ```

## `#!sds fun` keepOnlyColumns {#safeds.data.tabular.containers.TimeSeries.keepOnlyColumns data-toc-label='keepOnlyColumns'}

Return a new `TimeSeries` with only the given column(s).

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>`][safeds.lang.List] | A list containing the columns to be kept. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series containing only the given column(s). |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="145"
    @Pure
    @PythonName("keep_only_columns")
    fun keepOnlyColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` plotLagplot {#safeds.data.tabular.containers.TimeSeries.plotLagplot data-toc-label='plotLagplot'}

Plot a lagplot for the target column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `lag` | [`Int`][safeds.lang.Int] | The amount of lag used to plot | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="330"
    @Pure
    @PythonName("plot_lagplot")
    fun plotLagplot(
        lag: Int
    ) -> result1: Image
    ```

## `#!sds fun` plotLineplot {#safeds.data.tabular.containers.TimeSeries.plotLineplot data-toc-label='plotLineplot'}

Plot the time series target or the given column(s) as line plot.

The function will take the time column as the default value for y_column_name and the target column as the
default value for x_column_name.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xColumnName` | [`String?`][safeds.lang.String] | The column name of the column to be plotted on the x-Axis, default is the time column. | `#!sds null` |
| `yColumnName` | [`String?`][safeds.lang.String] | The column name of the column to be plotted on the y-Axis, default is the target column. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="347"
    @Pure
    @PythonName("plot_lineplot")
    fun plotLineplot(
        @PythonName("x_column_name") xColumnName: String? = null,
        @PythonName("y_column_name") yColumnName: String? = null
    ) -> result1: Image
    ```

## `#!sds fun` plotScatterplot {#safeds.data.tabular.containers.TimeSeries.plotScatterplot data-toc-label='plotScatterplot'}

Plot the time series target or the given column(s) as scatter plot.

The function will take the time column as the default value for x_column_name and the target column as the
default value for y_column_name.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xColumnName` | [`String?`][safeds.lang.String] | The column name of the column to be plotted on the x-Axis. | `#!sds null` |
| `yColumnName` | [`String?`][safeds.lang.String] | The column name of the column to be plotted on the y-Axis. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="365"
    @Pure
    @PythonName("plot_scatterplot")
    fun plotScatterplot(
        @PythonName("x_column_name") xColumnName: String? = null,
        @PythonName("y_column_name") yColumnName: String? = null
    ) -> result1: Image
    ```

## `#!sds fun` removeColumns {#safeds.data.tabular.containers.TimeSeries.removeColumns data-toc-label='removeColumns'}

Return a new `TimeSeries` with the given column(s) removed from the time series.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `columnNames` | [`List<String>`][safeds.lang.List] | The names of all columns to be dropped. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series without the given columns. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="160"
    @Pure
    @PythonName("remove_columns")
    fun removeColumns(
        @PythonName("column_names") columnNames: List<String>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` removeColumnsWithMissingValues {#safeds.data.tabular.containers.TimeSeries.removeColumnsWithMissingValues data-toc-label='removeColumnsWithMissingValues'}

Return a new `TimeSeries` with every column that misses values removed.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series without the columns that contain missing values. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="173"
    @Pure
    @PythonName("remove_columns_with_missing_values")
    fun removeColumnsWithMissingValues() -> result1: TimeSeries
    ```

## `#!sds fun` removeColumnsWithNonNumericalValues {#safeds.data.tabular.containers.TimeSeries.removeColumnsWithNonNumericalValues data-toc-label='removeColumnsWithNonNumericalValues'}

Return a new `TimeSeries` with every column that contains non-numerical values removed.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series without the columns that contain non-numerical values. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="184"
    @Pure
    @PythonName("remove_columns_with_non_numerical_values")
    fun removeColumnsWithNonNumericalValues() -> result1: TimeSeries
    ```

## `#!sds fun` removeDuplicateRows {#safeds.data.tabular.containers.TimeSeries.removeDuplicateRows data-toc-label='removeDuplicateRows'}

Return a new `TimeSeries` with all row duplicates removed.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the duplicate rows removed. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="195"
    @Pure
    @PythonName("remove_duplicate_rows")
    fun removeDuplicateRows() -> result1: TimeSeries
    ```

## `#!sds fun` removeRowsWithMissingValues {#safeds.data.tabular.containers.TimeSeries.removeRowsWithMissingValues data-toc-label='removeRowsWithMissingValues'}

Return a new `TimeSeries` without the rows that contain missing values.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series without the rows that contain missing values. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="206"
    @Pure
    @PythonName("remove_rows_with_missing_values")
    fun removeRowsWithMissingValues() -> result1: TimeSeries
    ```

## `#!sds fun` removeRowsWithOutliers {#safeds.data.tabular.containers.TimeSeries.removeRowsWithOutliers data-toc-label='removeRowsWithOutliers'}

Return a new `TimeSeries` with all rows that contain at least one outlier removed.

We define an outlier as a value that has a distance of more than 3 standard deviations from the column mean.
Missing values are not considered outliers. They are also ignored during the calculation of the standard
deviation.

The original time series is not modified.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series without rows containing outliers. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="221"
    @Pure
    @PythonName("remove_rows_with_outliers")
    fun removeRowsWithOutliers() -> result1: TimeSeries
    ```

## `#!sds fun` renameColumn {#safeds.data.tabular.containers.TimeSeries.renameColumn data-toc-label='renameColumn'}

Return a new `TimeSeries` with a single column renamed.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldName` | [`String`][safeds.lang.String] | The old name of the column. | - |
| `newName` | [`String`][safeds.lang.String] | The new name of the column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the renamed column. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="235"
    @Pure
    @PythonName("rename_column")
    fun renameColumn(
        @PythonName("old_name") oldName: String,
        @PythonName("new_name") newName: String
    ) -> result1: TimeSeries
    ```

## `#!sds fun` replaceColumn {#safeds.data.tabular.containers.TimeSeries.replaceColumn data-toc-label='replaceColumn'}

Return a new `TimeSeries` with the specified old column replaced by a list of new columns.

If the column to be replaced is the target or time column, it must be replaced by exactly one column. That column
becomes the new target or time column. If the column to be replaced is a feature column, the new columns that replace it
all become feature columns.

The order of columns is kept. The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `oldColumnName` | [`String`][safeds.lang.String] | The name of the column to be replaced. | - |
| `newColumns` | [`List<Column<Any?>>`][safeds.lang.List] | The new columns replacing the old column. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A time series with the old column replaced by the new columns. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="256"
    @Pure
    @PythonName("replace_column")
    fun replaceColumn(
        @PythonName("old_column_name") oldColumnName: String,
        @PythonName("new_columns") newColumns: List<Column>
    ) -> result1: TimeSeries
    ```

## `#!sds fun` sliceRows {#safeds.data.tabular.containers.TimeSeries.sliceRows data-toc-label='sliceRows'}

Slice a part of the table into a new `TimeSeries`.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `start` | [`Int?`][safeds.lang.Int] | The first index of the range to be copied into a new time series, None by default. | `#!sds null` |
| `end` | [`Int?`][safeds.lang.Int] | The last index of the range to be copied into a new time series, None by default. | `#!sds null` |
| `step` | [`Int`][safeds.lang.Int] | The step size used to iterate through the time series, 1 by default. | `#!sds 1` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The resulting time series. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="274"
    @Pure
    @PythonName("slice_rows")
    fun sliceRows(
        start: Int? = null,
        end: Int? = null,
        step: Int = 1
    ) -> result1: TimeSeries
    ```

## `#!sds fun` sortColumns {#safeds.data.tabular.containers.TimeSeries.sortColumns data-toc-label='sortColumns'}

Sort the columns of a `TimeSeries` with the given comparator and return a new `TimeSeries`.

The comparator is a function that takes two columns `col1` and `col2` and
returns an integer:

* If the function returns a negative number, `col1` will be ordered before `col2`.
* If the function returns a positive number, `col1` will be ordered after `col2`.
* If the function returns 0, the original order of `col1` and `col2` will be kept.

If no comparator is given, the columns will be sorted alphabetically by their name.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `comparator` | `#!sds (param1: Column<Any?>, param2: Column<Any?>) -> (param3: Int)` | The function used to compare two columns. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | A new time series with sorted columns. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="300"
    @Pure
    @PythonName("sort_columns")
    fun sortColumns(
        comparator: (param1: Column, param2: Column) -> param3: Int
    ) -> result1: TimeSeries
    ```

## `#!sds fun` transformColumn {#safeds.data.tabular.containers.TimeSeries.transformColumn data-toc-label='transformColumn'}

Return a new `TimeSeries` with the provided column transformed by calling the provided transformer.

The original time series is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `name` | [`String`][safeds.lang.String] | The name of the column to be transformed. | - |
| `transformer` | `#!sds (param1: Row) -> (param2: Any)` | The transformer to the given column | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`TimeSeries`][safeds.data.tabular.containers.TimeSeries] | The time series with the transformed column. |

??? quote "Source code in `time_series.sdsstub`"

    ```sds linenums="316"
    @Pure
    @PythonName("transform_column")
    fun transformColumn(
        name: String,
        transformer: (param1: Row) -> param2: Any
    ) -> result1: TimeSeries
    ```
