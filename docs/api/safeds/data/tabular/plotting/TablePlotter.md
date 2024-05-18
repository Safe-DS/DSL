# <code class="doc-symbol doc-symbol-class"></code> `TablePlotter` {#safeds.data.tabular.plotting.TablePlotter data-toc-label='[class] TablePlotter'}

A class that contains plotting methods for a table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table to plot. | - |

**Examples:**

```sds
pipeline example {
    val table = Table({"test": [1, 2, 3]});
    val plotter = table.plot;
}
```

??? quote "Stub code in `TablePlotter.sdsstub`"

    ```sds linenums="17"
    class TablePlotter(
        table: Table
    ) {
        /**
         * Plot a boxplot for every numerical column.
         *
         * @result plot The plot as an image.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a":[1, 2], "b": [3, 42]});
         *     val image = table.plot.boxPlots();
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
         *     val table = Table({"temperature": [10, 15, 20, 25, 30], "sales": [54, 74, 90, 206, 210]});
         *     val image = table.plot.correlationHeatmap();
         * }
         */
        @Pure
        @PythonName("correlation_heatmap")
        fun correlationHeatmap() -> plot: Image

        /**
         * Plot a histogram for every column.
         *
         * @param maxBinCount The maximum number of bins to use in the histogram. Default is 10.
         *
         * @result plot The plot as an image.
         *
         * @example
         * pipeline example {
         *     val table = Table({"a": [2, 3, 5, 1], "b": [54, 74, 90, 2014]});
         *     val image = table.plot.histograms();
         * }
         */
        @Pure
        fun histograms(
            @PythonName("maximum_number_of_bins") const maxBinCount: Int = 10
        ) -> plot: Image where {
            maxBinCount > 0
        }

        /**
         * Create a line plot for two columns in the table.
         *
         * @param xName The name of the column to be plotted on the x-axis.
         * @param yName The name of the column to be plotted on the y-axis.
         *
         * @result plot The plot as an image.
         *
         * @example
         * pipeline example {
         *     val table = Table(
         *         {
         *             "a": [1, 2, 3, 4, 5],
         *             "b": [2, 3, 4, 5, 6],
         *         }
         *     );
         *     val image = table.plot.linePlot("a", "b");
         * }
         */
        @Pure
        @PythonName("line_plot")
        fun linePlot(
            @PythonName("x_name") xName: String,
            @PythonName("y_name") yName: String
        ) -> plot: Image

        /**
         * Create a scatter plot for two columns in the table.
         *
         * @param xName The name of the column to be plotted on the x-axis.
         * @param yName The name of the column to be plotted on the y-axis.
         *
         * @result plot The plot as an image.
         *
         * @example
         * pipeline example {
         *     val table = Table(
         *         {
         *             "a": [1, 2, 3, 4, 5],
         *             "b": [2, 3, 4, 5, 6],
         *         }
         *     );
         *     val image = table.plot.scatterPlot("a", "b");
         * }
         */
        @Pure
        @PythonName("scatter_plot")
        fun scatterPlot(
            @PythonName("x_name") xName: String,
            @PythonName("y_name") yName: String
        ) -> plot: Image
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `boxPlots` {#safeds.data.tabular.plotting.TablePlotter.boxPlots data-toc-label='[function] boxPlots'}

Plot a boxplot for every numerical column.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a":[1, 2], "b": [3, 42]});
    val image = table.plot.boxPlots();
}
```

??? quote "Stub code in `TablePlotter.sdsstub`"

    ```sds linenums="31"
    @Pure
    @PythonName("box_plots")
    fun boxPlots() -> plot: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `correlationHeatmap` {#safeds.data.tabular.plotting.TablePlotter.correlationHeatmap data-toc-label='[function] correlationHeatmap'}

Plot a correlation heatmap for all numerical columns of this `Table`.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"temperature": [10, 15, 20, 25, 30], "sales": [54, 74, 90, 206, 210]});
    val image = table.plot.correlationHeatmap();
}
```

??? quote "Stub code in `TablePlotter.sdsstub`"

    ```sds linenums="46"
    @Pure
    @PythonName("correlation_heatmap")
    fun correlationHeatmap() -> plot: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `histograms` {#safeds.data.tabular.plotting.TablePlotter.histograms data-toc-label='[function] histograms'}

Plot a histogram for every column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `maxBinCount` | [`Int`][safeds.lang.Int] | The maximum number of bins to use in the histogram. Default is 10. | `#!sds 10` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val table = Table({"a": [2, 3, 5, 1], "b": [54, 74, 90, 2014]});
    val image = table.plot.histograms();
}
```

??? quote "Stub code in `TablePlotter.sdsstub`"

    ```sds linenums="63"
    @Pure
    fun histograms(
        @PythonName("maximum_number_of_bins") const maxBinCount: Int = 10
    ) -> plot: Image where {
        maxBinCount > 0
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `linePlot` {#safeds.data.tabular.plotting.TablePlotter.linePlot data-toc-label='[function] linePlot'}

Create a line plot for two columns in the table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xName` | [`String`][safeds.lang.String] | The name of the column to be plotted on the x-axis. | - |
| `yName` | [`String`][safeds.lang.String] | The name of the column to be plotted on the y-axis. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="8"
pipeline example {
    val table = Table(
        {
            "a": [1, 2, 3, 4, 5],
            "b": [2, 3, 4, 5, 6],
        }
    );
    val image = table.plot.linePlot("a", "b");
}
```

??? quote "Stub code in `TablePlotter.sdsstub`"

    ```sds linenums="89"
    @Pure
    @PythonName("line_plot")
    fun linePlot(
        @PythonName("x_name") xName: String,
        @PythonName("y_name") yName: String
    ) -> plot: Image
    ```

## <code class="doc-symbol doc-symbol-function"></code> `scatterPlot` {#safeds.data.tabular.plotting.TablePlotter.scatterPlot data-toc-label='[function] scatterPlot'}

Create a scatter plot for two columns in the table.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `xName` | [`String`][safeds.lang.String] | The name of the column to be plotted on the x-axis. | - |
| `yName` | [`String`][safeds.lang.String] | The name of the column to be plotted on the y-axis. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `plot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="8"
pipeline example {
    val table = Table(
        {
            "a": [1, 2, 3, 4, 5],
            "b": [2, 3, 4, 5, 6],
        }
    );
    val image = table.plot.scatterPlot("a", "b");
}
```

??? quote "Stub code in `TablePlotter.sdsstub`"

    ```sds linenums="115"
    @Pure
    @PythonName("scatter_plot")
    fun scatterPlot(
        @PythonName("x_name") xName: String,
        @PythonName("y_name") yName: String
    ) -> plot: Image
    ```
