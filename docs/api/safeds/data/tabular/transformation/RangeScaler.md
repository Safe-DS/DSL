# `#!sds class` RangeScaler {#safeds.data.tabular.transformation.RangeScaler data-toc-label='RangeScaler'}

The RangeScaler transforms column values by scaling each value to a given range.

**Parent type:** [`InvertibleTableTransformer`][safeds.data.tabular.transformation.InvertibleTableTransformer]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `minimum` | [`Float`][safeds.lang.Float] | The minimum of the new range after the transformation | `#!sds 0.0` |
| `maximum` | [`Float`][safeds.lang.Float] | The maximum of the new range after the transformation | `#!sds 1.0` |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `range_scaler.sdsstub`"

    ```sds linenums="17"
    class RangeScaler(
        const minimum: Float = 0.0,
        const maximum: Float = 1.0
    ) sub InvertibleTableTransformer {
        /**
         * Learn a transformation for a set of columns in a table.
         *
         * This transformer is not modified.
         *
         * @param table The table used to fit the transformer.
         * @param columnNames The list of columns from the table used to fit the transformer. If `None`, all columns are used.
         *
         * @result result1 The fitted transformer.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        fun fit(
            table: Table,
            @PythonName("column_names") columnNames: List<String>?
        ) -> result1: RangeScaler
    }
    ```

## `#!sds fun` fit {#safeds.data.tabular.transformation.RangeScaler.fit data-toc-label='fit'}

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
| `result1` | [`RangeScaler`][safeds.data.tabular.transformation.RangeScaler] | The fitted transformer. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `range_scaler.sdsstub`"

    ```sds linenums="36"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: RangeScaler
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.RangeScaler.fitAndTransform data-toc-label='fitAndTransform'}

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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="125"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> result1: Table
    ```

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.RangeScaler.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

Get the names of all new columns that have been added by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the added columns, ordered as they will appear in the table. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="64"
    @Pure
    @PythonName("get_names_of_added_columns")
    fun getNamesOfAddedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.RangeScaler.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

Get the names of all columns that have been changed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of changed columns, ordered as they appear in the table. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="78"
    @Pure
    @PythonName("get_names_of_changed_columns")
    fun getNamesOfChangedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.RangeScaler.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

Get the names of all columns that have been removed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the removed columns, ordered as they appear in the table the transformer was fitted on. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="92"
    @Pure
    @PythonName("get_names_of_removed_columns")
    fun getNamesOfRemovedColumns() -> result1: List<String>
    ```

## `#!sds fun` inverseTransform {#safeds.data.tabular.transformation.RangeScaler.inverseTransform data-toc-label='inverseTransform'}

Undo the learned transformation.

The table is not modified.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `transformedTable` | [`Table`][safeds.data.tabular.containers.Table] | The table to be transformed back to the original version. | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Table`][safeds.data.tabular.containers.Table] | The original table. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="175"
    @Pure
    @PythonName("inverse_transform")
    fun inverseTransform(
        @PythonName("transformed_table") transformedTable: Table
    ) -> result1: Table
    ```

## `#!sds fun` isFitted {#safeds.data.tabular.transformation.RangeScaler.isFitted data-toc-label='isFitted'}

Check if the transformer is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | Whether the transformer is fitted. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="106"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> result1: Boolean
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.RangeScaler.transform data-toc-label='transform'}

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

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="49"
    @Pure
    fun transform(
        table: Table
    ) -> result1: Table
    ```
