---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` ColumnType {#safeds.data.tabular.typing.ColumnType data-toc-label='ColumnType'}

Abstract base class for column types.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `ColumnType.sdsstub`"

    ```sds linenums="14"
    class ColumnType {
        /**
         * Return whether the given column type is nullable.
         *
         * @result result1 True if the column is nullable.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("is_nullable")
        fun isNullable() -> result1: Boolean

        /**
         * Return whether the given column type is numeric.
         *
         * @result result1 True if the column is numeric.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        @Pure
        @PythonName("is_numeric")
        fun isNumeric() -> result1: Boolean
    }
    ```

## `#!sds fun` isNullable {#safeds.data.tabular.typing.ColumnType.isNullable data-toc-label='isNullable'}

Return whether the given column type is nullable.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if the column is nullable. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `ColumnType.sdsstub`"

    ```sds linenums="25"
    @Pure
    @PythonName("is_nullable")
    fun isNullable() -> result1: Boolean
    ```

## `#!sds fun` isNumeric {#safeds.data.tabular.typing.ColumnType.isNumeric data-toc-label='isNumeric'}

Return whether the given column type is numeric.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result1` | [`Boolean`][safeds.lang.Boolean] | True if the column is numeric. |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `ColumnType.sdsstub`"

    ```sds linenums="39"
    @Pure
    @PythonName("is_numeric")
    fun isNumeric() -> result1: Boolean
    ```
