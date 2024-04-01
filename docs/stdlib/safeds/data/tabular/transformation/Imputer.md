# `#!sds class` Imputer {#safeds.data.tabular.transformation.Imputer data-toc-label='Imputer'}

Replace missing values with the given strategy.

**Parent type:** [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `strategy` | [`Strategy`][safeds.data.tabular.transformation.Imputer.Strategy] | The strategy used to impute missing values. Use the classes nested inside `Imputer.Strategy` to specify it. | - |

??? quote "Source code in `imputer.sdsstub`"

    ```sds linenums="11"
    class Imputer(
        strategy: Imputer.Strategy
    ) sub TableTransformer {
        enum Strategy {
            /**
            * An imputation strategy for imputing missing data with given constant values.
            *
            * @param value The given value to impute missing values.
            */
            Constant(value: Any)
    
            /**
            * An imputation strategy for imputing missing data with mean values.
            */
            Mean
    
            /**
            * An imputation strategy for imputing missing data with median values.
            */
            Median
    
            /**
            * An imputation strategy for imputing missing data with mode values. The lowest value will be used if there are multiple values with the same highest count.
            */
            Mode
        }
    
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
        ) -> result1: Imputer
    }
    ```

## `#!sds enum` Strategy {#safeds.data.tabular.transformation.Imputer.Strategy data-toc-label='Strategy'}

??? quote "Source code in `imputer.sdsstub`"

    ```sds linenums="14"
    enum Strategy {
        /**
        * An imputation strategy for imputing missing data with given constant values.
        *
        * @param value The given value to impute missing values.
        */
        Constant(value: Any)
    
        /**
        * An imputation strategy for imputing missing data with mean values.
        */
        Mean
    
        /**
        * An imputation strategy for imputing missing data with median values.
        */
        Median
    
        /**
        * An imputation strategy for imputing missing data with mode values. The lowest value will be used if there are multiple values with the same highest count.
        */
        Mode
    }
    ```

### Constant {#safeds.data.tabular.transformation.Imputer.Strategy.Constant data-toc-label='Constant'}

An imputation strategy for imputing missing data with given constant values.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `value` | [`Any`][safeds.lang.Any] | The given value to impute missing values. | - |

### Mean {#safeds.data.tabular.transformation.Imputer.Strategy.Mean data-toc-label='Mean'}

An imputation strategy for imputing missing data with mean values.

### Median {#safeds.data.tabular.transformation.Imputer.Strategy.Median data-toc-label='Median'}

An imputation strategy for imputing missing data with median values.

### Mode {#safeds.data.tabular.transformation.Imputer.Strategy.Mode data-toc-label='Mode'}

An imputation strategy for imputing missing data with mode values. The lowest value will be used if there are multiple values with the same highest count.

## `#!sds fun` fit {#safeds.data.tabular.transformation.Imputer.fit data-toc-label='fit'}

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
| `result1` | [`Imputer`][safeds.data.tabular.transformation.Imputer] | The fitted transformer. |

??? quote "Source code in `imputer.sdsstub`"

    ```sds linenums="48"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: Imputer
    ```
