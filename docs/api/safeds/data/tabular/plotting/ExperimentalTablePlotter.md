# :test_tube:{ title="Experimental" } `#!sds class` ExperimentalTablePlotter {#safeds.data.tabular.plotting.ExperimentalTablePlotter data-toc-label='ExperimentalTablePlotter'}

A class that contains plotting methods for a table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`ExperimentalTable`][safeds.data.tabular.containers.ExperimentalTable] | The table to plot. | - |

**Examples:**

```sds
pipeline example {
    val table = ExperimentalTable({"test": [1, 2, 3]});
    val plotter = table.plot;
}
```

??? quote "Stub code in `ExperimentalTablePlotter.sdsstub`"

    ```sds linenums="18"
    class ExperimentalTablePlotter(
        table: ExperimentalTable
    ) {
        /**
         * Plot a boxplot for every numerical column.
         *
         * @result plot The plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import Table
         *     // table = Table({"a":[1, 2], "b": [3, 42]})
         *     // image = table.plot_boxplots()
         * }
         */
        @Pure
        @PythonName("box_plots")
        fun boxPlots() -> plot: Image

        /**
         * Plot a correlation heatmap for all numerical columns of this `Table`.
         *
         * @result plot The plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import Table
         *     // table = Table.from_dict({"temperature": [10, 15, 20, 25, 30], "sales": [54, 74, 90, 206, 210]})
         *     // image = table.plot_correlation_heatmap()
         * }
         */
        @Pure
        @PythonName("correlation_heatmap")
        fun correlationHeatmap() -> plot: Image

        /**
         * Plot a histogram for every column.
         *
         * @param numberOfBins The number of bins to use in the histogram. Default is 10.
         *
         * @result plot The plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import Table
         *     // table = Table({"a": [2, 3, 5, 1], "b": [54, 74, 90, 2014]})
         *     // image = table.plot_histograms()
         * }
         */
        @Pure
        fun histograms(
            @PythonName("number_of_bins") numberOfBins: Int = 10
        ) -> plot: Image

        /**
         * Create a line plot for two columns in the table.
         *
         * @param xName The name of the column to be plotted on the x-axis.
         * @param yName The name of the column to be plotted on the y-axis.
         *
         * @result linePlot The plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable(
         *     //     {
         *     //         "a": [1, 2, 3, 4, 5],
         *     //         "b": [2, 3, 4, 5, 6],
         *     //     }
         *     // )
         *     // image = table.plot.line_plot("a", "b")
         * }
         */
        @Pure
        @PythonName("line_plot")
        fun linePlot(
            @PythonName("x_name") xName: String,
            @PythonName("y_name") yName: String
        ) -> linePlot: Image

        /**
         * Create a scatter plot for two columns in the table.
         *
         * @param xName The name of the column to be plotted on the x-axis.
         * @param yName The name of the column to be plotted on the y-axis.
         *
         * @result scatterPlot The plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalTable
         *     // table = ExperimentalTable(
         *     //     {
         *     //         "a": [1, 2, 3, 4, 5],
         *     //         "b": [2, 3, 4, 5, 6],
         *     //     }
         *     // )
         *     // image = table.plot.scatter_plot("a", "b")
         * }
         */
        @Pure
        @PythonName("scatter_plot")
        fun scatterPlot(
            @PythonName("x_name") xName: String,
            @PythonName("y_name") yName: String
        ) -> scatterPlot: Image
    }
    ```

## `#!sds fun` boxPlots {#safeds.data.tabular.plotting.ExperimentalTablePlotter.boxPlots data-toc-label='boxPlots'}

Plot a boxplot for every numerical column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import Table
    // table = Table({"a":[1, 2], "b": [3, 42]})
    // image = table.plot_boxplots()
}
```

??? quote "Stub code in `ExperimentalTablePlotter.sdsstub`"

    ```sds linenums="33"
    @Pure
    @PythonName("box_plots")
    fun boxPlots() -> plot: Image
    ```

## `#!sds fun` correlationHeatmap {#safeds.data.tabular.plotting.ExperimentalTablePlotter.correlationHeatmap data-toc-label='correlationHeatmap'}

Plot a correlation heatmap for all numerical columns of this `Table`.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import Table
    // table = Table.from_dict({"temperature": [10, 15, 20, 25, 30], "sales": [54, 74, 90, 206, 210]})
    // image = table.plot_correlation_heatmap()
}
```

??? quote "Stub code in `ExperimentalTablePlotter.sdsstub`"

    ```sds linenums="49"
    @Pure
    @PythonName("correlation_heatmap")
    fun correlationHeatmap() -> plot: Image
    ```

## `#!sds fun` histograms {#safeds.data.tabular.plotting.ExperimentalTablePlotter.histograms data-toc-label='histograms'}

Plot a histogram for every column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfBins` | [`Int`][safeds.lang.Int] | The number of bins to use in the histogram. Default is 10. | `#!sds 10` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import Table
    // table = Table({"a": [2, 3, 5, 1], "b": [54, 74, 90, 2014]})
    // image = table.plot_histograms()
}
```

??? quote "Stub code in `ExperimentalTablePlotter.sdsstub`"

    ```sds linenums="67"
    @Pure
    fun histograms(
        @PythonName("number_of_bins") numberOfBins: Int = 10
    ) -> plot: Image
    ```

## `#!sds fun` linePlot {#safeds.data.tabular.plotting.ExperimentalTablePlotter.linePlot data-toc-label='linePlot'}

Create a line plot for two columns in the table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xName` | [`String`][safeds.lang.String] | The name of the column to be plotted on the x-axis. | - |
| `yName` | [`String`][safeds.lang.String] | The name of the column to be plotted on the y-axis. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `linePlot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable(
    //     {
    //         "a": [1, 2, 3, 4, 5],
    //         "b": [2, 3, 4, 5, 6],
    //     }
    // )
    // image = table.plot.line_plot("a", "b")
}
```

??? quote "Stub code in `ExperimentalTablePlotter.sdsstub`"

    ```sds linenums="92"
    @Pure
    @PythonName("line_plot")
    fun linePlot(
        @PythonName("x_name") xName: String,
        @PythonName("y_name") yName: String
    ) -> linePlot: Image
    ```

## `#!sds fun` scatterPlot {#safeds.data.tabular.plotting.ExperimentalTablePlotter.scatterPlot data-toc-label='scatterPlot'}

Create a scatter plot for two columns in the table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xName` | [`String`][safeds.lang.String] | The name of the column to be plotted on the x-axis. | - |
| `yName` | [`String`][safeds.lang.String] | The name of the column to be plotted on the y-axis. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `scatterPlot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalTable
    // table = ExperimentalTable(
    //     {
    //         "a": [1, 2, 3, 4, 5],
    //         "b": [2, 3, 4, 5, 6],
    //     }
    // )
    // image = table.plot.scatter_plot("a", "b")
}
```

??? quote "Stub code in `ExperimentalTablePlotter.sdsstub`"

    ```sds linenums="119"
    @Pure
    @PythonName("scatter_plot")
    fun scatterPlot(
        @PythonName("x_name") xName: String,
        @PythonName("y_name") yName: String
    ) -> scatterPlot: Image
    ```
