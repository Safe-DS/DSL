# :test_tube:{ title="Experimental" } `#!sds class` ExperimentalColumnPlotter {#safeds.data.tabular.plotting.ExperimentalColumnPlotter data-toc-label='ExperimentalColumnPlotter'}

A class that contains plotting methods for a column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `column` | [`ExperimentalColumn<Any>`][safeds.data.tabular.containers.ExperimentalColumn] | The column to plot. | - |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // plotter = column.plot
}
```

??? quote "Stub code in `ExperimentalColumnPlotter.sdsstub`"

    ```sds linenums="18"
    class ExperimentalColumnPlotter(
        column: ExperimentalColumn<Any>
    ) {
        /**
         * Create a box plot for the values in the column. This is only possible for numeric columns.
         *
         * @result boxPlot The box plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // boxplot = column.plot.box_plot()
         * }
         */
        @Pure
        @PythonName("box_plot")
        fun boxPlot() -> boxPlot: Image

        /**
         * Create a histogram for the values in the column.
         *
         * @param numberOfBins The number of bins to use in the histogram. Default is 10.
         *
         * @result histogram The plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("test", [1, 2, 3])
         *     // histogram = column.plot.histogram()
         * }
         */
        @Pure
        fun histogram(
            @PythonName("number_of_bins") numberOfBins: Int = 10
        ) -> histogram: Image

        /**
         * Create a lag plot for the values in the column.
         *
         * @param lag The amount of lag.
         *
         * @result lagPlot The plot as an image.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("values", [1, 2, 3, 4])
         *     // image = column.plot.lag_plot(2)
         * }
         */
        @Pure
        @PythonName("lag_plot")
        fun lagPlot(
            lag: Int
        ) -> lagPlot: Image
    }
    ```

## `#!sds fun` boxPlot {#safeds.data.tabular.plotting.ExperimentalColumnPlotter.boxPlot data-toc-label='boxPlot'}

Create a box plot for the values in the column. This is only possible for numeric columns.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `boxPlot` | [`Image`][safeds.data.image.containers.Image] | The box plot as an image. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // boxplot = column.plot.box_plot()
}
```

??? quote "Stub code in `ExperimentalColumnPlotter.sdsstub`"

    ```sds linenums="33"
    @Pure
    @PythonName("box_plot")
    fun boxPlot() -> boxPlot: Image
    ```

## `#!sds fun` histogram {#safeds.data.tabular.plotting.ExperimentalColumnPlotter.histogram data-toc-label='histogram'}

Create a histogram for the values in the column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfBins` | [`Int`][safeds.lang.Int] | The number of bins to use in the histogram. Default is 10. | `#!sds 10` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `histogram` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("test", [1, 2, 3])
    // histogram = column.plot.histogram()
}
```

??? quote "Stub code in `ExperimentalColumnPlotter.sdsstub`"

    ```sds linenums="51"
    @Pure
    fun histogram(
        @PythonName("number_of_bins") numberOfBins: Int = 10
    ) -> histogram: Image
    ```

## `#!sds fun` lagPlot {#safeds.data.tabular.plotting.ExperimentalColumnPlotter.lagPlot data-toc-label='lagPlot'}

Create a lag plot for the values in the column.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `lag` | [`Int`][safeds.lang.Int] | The amount of lag. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `lagPlot` | [`Image`][safeds.data.image.containers.Image] | The plot as an image. |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("values", [1, 2, 3, 4])
    // image = column.plot.lag_plot(2)
}
```

??? quote "Stub code in `ExperimentalColumnPlotter.sdsstub`"

    ```sds linenums="70"
    @Pure
    @PythonName("lag_plot")
    fun lagPlot(
        lag: Int
    ) -> lagPlot: Image
    ```
