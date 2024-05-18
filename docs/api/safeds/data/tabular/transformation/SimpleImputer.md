# `#!sds class` SimpleImputer {#safeds.data.tabular.transformation.SimpleImputer data-toc-label='[class] SimpleImputer'}

Replace missing values with the given strategy.

**Parent type:** [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `strategy` | [`Strategy`][safeds.data.tabular.transformation.SimpleImputer.Strategy] | The strategy used to impute missing values. | - |
| `valueToReplace` | `#!sds union<Float, String?>` | - | `#!sds null` |

**Examples:**

```sds hl_lines="3"
pipeline example {
   val table = Table({"a": [1, null], "b": [3, 4]});
   val imputer = SimpleImputer(SimpleImputer.Strategy.Mean).fit(table, ["a"]);
   val transformedTable = imputer.transform(table);
   // Table({"a": [1, 1], "b": [3, 4]})
}
```
```sds hl_lines="3"
pipeline example {
   val table = Table({"a": [1, null], "b": [3, 4]});
   val imputer = SimpleImputer(SimpleImputer.Strategy.Constant(0)).fit(table, ["a"]);
   val transformedTable = imputer.transform(table);
   // Table({"a": [1, 0], "b": [3, 4]})
}
```

??? quote "Stub code in `SimpleImputer.sdsstub`"

    ```sds linenums="27"
    class SimpleImputer(
        strategy: SimpleImputer.Strategy,
        @PythonName("value_to_replace") valueToReplace: union<Float, String, Nothing?> = null
    ) sub TableTransformer {
        /**
         * Various strategies to replace missing values.
         */
        enum Strategy {
            /**
             * Replace missing values with the given constant value.
             *
             * @param value The value to replace missing values.
             */
            @PythonName("constant")
            Constant(value: Any)

            /**
             * Replace missing values with the mean of each column.
             */
            @PythonName("mean")
            Mean

            /**
             * Replace missing values with the median of each column.
             */
            @PythonName("median")
            Median

            /**
             * Replace missing values with the mode of each column.
             */
            @PythonName("mode")
            Mode
        }

        /**
         * The strategy used to replace missing values.
         */
        attr strategy: SimpleImputer.Strategy
        /**
         * The value that should be replaced.
         */
        @PythonName("value_to_replace") attr valueToReplace: Any

        /**
         * Learn a transformation for a set of columns in a table.
         *
         * This transformer is not modified.
         *
         * @param table The table used to fit the transformer.
         * @param columnNames The list of columns from the table used to fit the transformer. If `null`, all columns are used.
         *
         * @result fittedTransformer The fitted transformer.
         */
        @Pure
        fun fit(
            table: Table,
            @PythonName("column_names") columnNames: List<String>?
        ) -> fittedTransformer: SimpleImputer

        /**
         * Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.
         *
         * **Note:** Neither this transformer nor the given table are modified.
         *
         * @param table The table used to fit the transformer. The transformer is then applied to this table.
         * @param columnNames The list of columns from the table used to fit the transformer. If `null`, all columns are used.
         *
         * @result fittedTransformer The fitted transformer.
         * @result transformedTable The transformed table.
         */
        @Pure
        @PythonName("fit_and_transform")
        fun fitAndTransform(
            table: Table,
            @PythonName("column_names") columnNames: List<String>? = null
        ) -> (fittedTransformer: SimpleImputer, transformedTable: Table)
    }
    ```

## `#!sds attr` isFitted {#safeds.data.tabular.transformation.SimpleImputer.isFitted data-toc-label='[attr] isFitted'}

Whether the transformer is fitted.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` strategy {#safeds.data.tabular.transformation.SimpleImputer.strategy data-toc-label='[attr] strategy'}

The strategy used to replace missing values.

**Type:** [`Strategy`][safeds.data.tabular.transformation.SimpleImputer.Strategy]

## `#!sds attr` valueToReplace {#safeds.data.tabular.transformation.SimpleImputer.valueToReplace data-toc-label='[attr] valueToReplace'}

The value that should be replaced.

**Type:** [`Any`][safeds.lang.Any]

## `#!sds fun` fit {#safeds.data.tabular.transformation.SimpleImputer.fit data-toc-label='[fun] fit'}

Learn a transformation for a set of columns in a table.

This transformer is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `null`, all columns are used. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`SimpleImputer`][safeds.data.tabular.transformation.SimpleImputer] | The fitted transformer. |

??? quote "Stub code in `SimpleImputer.sdsstub`"

    ```sds linenums="81"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> fittedTransformer: SimpleImputer
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.SimpleImputer.fitAndTransform data-toc-label='[fun] fitAndTransform'}

Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.

**Note:** Neither this transformer nor the given table are modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table used to fit the transformer. The transformer is then applied to this table. | - |
| `columnNames` | [`List<String>?`][safeds.lang.List] | The list of columns from the table used to fit the transformer. If `null`, all columns are used. | `#!sds null` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `fittedTransformer` | [`SimpleImputer`][safeds.data.tabular.transformation.SimpleImputer] | The fitted transformer. |
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `SimpleImputer.sdsstub`"

    ```sds linenums="98"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> (fittedTransformer: SimpleImputer, transformedTable: Table)
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.SimpleImputer.transform data-toc-label='[fun] transform'}

Apply the learned transformation to a table.

**Note:** The given table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `table` | [`Table`][safeds.data.tabular.containers.Table] | The table to which the learned transformation is applied. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The transformed table. |

??? quote "Stub code in `TableTransformer.sdsstub`"

    ```sds linenums="39"
    @Pure
    fun transform(
        table: Table
    ) -> transformedTable: Table
    ```

## `#!sds enum` Strategy {#safeds.data.tabular.transformation.SimpleImputer.Strategy data-toc-label='[enum] Strategy'}

Various strategies to replace missing values.

??? quote "Stub code in `SimpleImputer.sdsstub`"

    ```sds linenums="34"
    enum Strategy {
        /**
         * Replace missing values with the given constant value.
         *
         * @param value The value to replace missing values.
         */
        @PythonName("constant")
        Constant(value: Any)

        /**
         * Replace missing values with the mean of each column.
         */
        @PythonName("mean")
        Mean

        /**
         * Replace missing values with the median of each column.
         */
        @PythonName("median")
        Median

        /**
         * Replace missing values with the mode of each column.
         */
        @PythonName("mode")
        Mode
    }
    ```

### Constant {#safeds.data.tabular.transformation.SimpleImputer.Strategy.Constant data-toc-label='Constant'}

Replace missing values with the given constant value.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `value` | [`Any`][safeds.lang.Any] | The value to replace missing values. | - |

### Mean {#safeds.data.tabular.transformation.SimpleImputer.Strategy.Mean data-toc-label='Mean'}

Replace missing values with the mean of each column.

### Median {#safeds.data.tabular.transformation.SimpleImputer.Strategy.Median data-toc-label='Median'}

Replace missing values with the median of each column.

### Mode {#safeds.data.tabular.transformation.SimpleImputer.Strategy.Mode data-toc-label='Mode'}

Replace missing values with the mode of each column.
