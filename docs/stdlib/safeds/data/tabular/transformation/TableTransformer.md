# `#!sds abstract class` TableTransformer {#safeds.data.tabular.transformation.TableTransformer data-toc-label='TableTransformer'}

Learn a transformation for a set of columns in a `Table` and transform another `Table` with the same columns.

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="8"
    class TableTransformer {
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
        ) -> result1: TableTransformer
    
        /**
         * Apply the learned transformation to a table.
         *
         * The table is not modified.
         *
         * @param table The table to which the learned transformation is applied.
         *
         * @result result1 The transformed table.
         */
        @Pure
        fun transform(
            table: Table
        ) -> result1: Table
    
        /**
         * Get the names of all new columns that have been added by the transformer.
         *
         * @result result1 A list of names of the added columns, ordered as they will appear in the table.
         */
        @Pure
        @PythonName("get_names_of_added_columns")
        fun getNamesOfAddedColumns() -> result1: List<String>
    
        /**
         * Get the names of all columns that have been changed by the transformer.
         *
         * @result result1 A list of names of changed columns, ordered as they appear in the table.
         */
        @Pure
        @PythonName("get_names_of_changed_columns")
        fun getNamesOfChangedColumns() -> result1: List<String>
    
        /**
         * Get the names of all columns that have been removed by the transformer.
         *
         * @result result1 A list of names of the removed columns, ordered as they appear in the table the transformer was fitted on.
         */
        @Pure
        @PythonName("get_names_of_removed_columns")
        fun getNamesOfRemovedColumns() -> result1: List<String>
    
        /**
         * Check if the transformer is fitted.
         *
         * @result result1 Whether the transformer is fitted.
         */
        @Pure
        @PythonName("is_fitted")
        fun isFitted() -> result1: Boolean
    
        /**
         * Learn a transformation for a set of columns in a table and apply the learned transformation to the same table.
         *
         * The table is not modified. If you also need the fitted transformer, use `fit` and `transform` separately.
         *
         * @param table The table used to fit the transformer. The transformer is then applied to this table.
         * @param columnNames The list of columns from the table used to fit the transformer. If `None`, all columns are used.
         *
         * @result result1 The transformed table.
         */
        @Pure
        @PythonName("fit_and_transform")
        fun fitAndTransform(
            table: Table,
            @PythonName("column_names") columnNames: List<String>? = null
        ) -> result1: Table
    }
    ```

## `#!sds fun` fit {#safeds.data.tabular.transformation.TableTransformer.fit data-toc-label='fit'}

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
| `result1` | [`TableTransformer`][safeds.data.tabular.transformation.TableTransformer] | The fitted transformer. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="19"
    @Pure
    fun fit(
        table: Table,
        @PythonName("column_names") columnNames: List<String>?
    ) -> result1: TableTransformer
    ```

## `#!sds fun` fitAndTransform {#safeds.data.tabular.transformation.TableTransformer.fitAndTransform data-toc-label='fitAndTransform'}

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

    ```sds linenums="85"
    @Pure
    @PythonName("fit_and_transform")
    fun fitAndTransform(
        table: Table,
        @PythonName("column_names") columnNames: List<String>? = null
    ) -> result1: Table
    ```

## `#!sds fun` getNamesOfAddedColumns {#safeds.data.tabular.transformation.TableTransformer.getNamesOfAddedColumns data-toc-label='getNamesOfAddedColumns'}

Get the names of all new columns that have been added by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the added columns, ordered as they will appear in the table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="44"
    @Pure
    @PythonName("get_names_of_added_columns")
    fun getNamesOfAddedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfChangedColumns {#safeds.data.tabular.transformation.TableTransformer.getNamesOfChangedColumns data-toc-label='getNamesOfChangedColumns'}

Get the names of all columns that have been changed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of changed columns, ordered as they appear in the table. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="53"
    @Pure
    @PythonName("get_names_of_changed_columns")
    fun getNamesOfChangedColumns() -> result1: List<String>
    ```

## `#!sds fun` getNamesOfRemovedColumns {#safeds.data.tabular.transformation.TableTransformer.getNamesOfRemovedColumns data-toc-label='getNamesOfRemovedColumns'}

Get the names of all columns that have been removed by the transformer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`List<String>`][safeds.lang.List] | A list of names of the removed columns, ordered as they appear in the table the transformer was fitted on. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="62"
    @Pure
    @PythonName("get_names_of_removed_columns")
    fun getNamesOfRemovedColumns() -> result1: List<String>
    ```

## `#!sds fun` isFitted {#safeds.data.tabular.transformation.TableTransformer.isFitted data-toc-label='isFitted'}

Check if the transformer is fitted.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | Whether the transformer is fitted. |

??? quote "Stub code in `table_transformer.sdsstub`"

    ```sds linenums="71"
    @Pure
    @PythonName("is_fitted")
    fun isFitted() -> result1: Boolean
    ```

## `#!sds fun` transform {#safeds.data.tabular.transformation.TableTransformer.transform data-toc-label='transform'}

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

    ```sds linenums="34"
    @Pure
    fun transform(
        table: Table
    ) -> result1: Table
    ```
