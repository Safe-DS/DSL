# `#!sds class` Imputer {#safeds.data.tabular.transformation.Imputer data-toc-label='Imputer'}

Replace missing values with the given strategy.

**Parent type:** [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `strategy` | [`Strategy`][safeds.data.tabular.transformation.Imputer.Strategy] | The strategy used to impute missing values. Use the classes nested inside `Imputer.Strategy` to specify it. | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
   val table = Table({"a": [1, null], "b": [3, 4]});
   val imputer = Imputer(Imputer.Strategy.Mean).fit(table, ["a"]);
   val transformedTable = imputer.transform(table);
   // Table({"a": [1, 1], "b": [3, 4]})
}
```
```sds hl_lines="3"
pipeline example {
   val table = Table({"a": [1, null], "b": [3, 4]});
   val imputer = Imputer(Imputer.Strategy.Constant(0)).fit(table, ["a"]);
   val transformedTable = imputer.transform(table);
   // Table({"a": [1, 0], "b": [3, 4]})
}
```

??? quote "Stub code in `imputer.sdsstub`"

    ```sds linenums="27"
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

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.Imputer.isFitted data-toc-label='isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

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

??? quote "Stub code in `imputer.sdsstub`"

    ```sds linenums="64"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: Imputer
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.Imputer.fitAndTransform data-toc-label='fitAndTransform'}

Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.

The table is not modified. If you also need the fitted transformer, use `fit` and `transform` separately.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. The transformer is then applied to this table. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `None`, all columns are used. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="81"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> result1: Table
    ```

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.Imputer.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

Get the names of all new columns that have been added by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the added columns, ordered as they will appear in the table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="49"
    @Pure
    @PythonName("get_names_of_added_columns")
    fun getNamesOfAddedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.Imputer.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

Get the names of all columns that have been changed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of changed columns, ordered as they appear in the table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="58"
    @Pure
    @PythonName("get_names_of_changed_columns")
    fun getNamesOfChangedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.Imputer.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

Get the names of all columns that have been removed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the removed columns, ordered as they appear in the table the transformer was fitted on. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="67"
    @Pure
    @PythonName("get_names_of_removed_columns")
    fun getNamesOfRemovedColumns() -> result1: List<String>
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.Imputer.transform data-toc-label='transform'}

Apply the learned transformation to a table.

The table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table to which the learned transformation is applied. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun transform(
        table: Table
    ) -> result1: Table
    ```

## `#!sds enum` Strategy {#safeds.data.tabular.transformation.Imputer.Strategy data-toc-label='Strategy'}

??? quote "Stub code in `imputer.sdsstub`"

    ```sds linenums="30"
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
