# `#!sds class` Discretizer {#safeds.data.tabular.transformation.Discretizer data-toc-label='Discretizer'}

The Discretizer bins continuous data into intervals.

**Parent type:** [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `numberOfBins` | [`Int`][safeds.lang.Int] | The number of bins to be created. | `#!sds 5` |

??? quote "Source code in `discretizer.sdsstub`"

    ```sds linenums="11"
    class Discretizer(
        @PythonName("number_of_bins") const numberOfBins: Int = 5
    ) sub TableTransformer where {
        numberOfBins >= 2
    } {
        /**
         * Learn a transformation for a set of columns in a table.
         *
         * This transformer is not modified.
         *
         * @param table The table used to fit the transformer.
         * @param columnNames The list of columns from the table used to fit the transformer. If `None`, all columns are used.
         *
         * @result result1 The fitted transformer.
         */
        @Pure
        fun fit(
            table: Table,
            @PythonName("column_names") columnNames: List<String>?
        ) -> result1: Discretizer
    }
    ```

## `#!sds fun` fit {#safeds.data.tabular.transformation.Discretizer.fit data-toc-label='fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `None`, all columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Discretizer`][safeds.data.tabular.transformation.Discretizer] | The fitted transformer. |

??? quote "Source code in `discretizer.sdsstub`"

    ```sds linenums="26"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: Discretizer
    ```
