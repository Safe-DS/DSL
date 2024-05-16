---
search:
  boost: 0.5
---

# `#!sds abstract class` DataType {#safeds.data.tabular.typing.DataType data-toc-label='DataType'}

The type of a column or cell in a table.

??? quote "Stub code in `DataType.sdsstub`"

    ```sds linenums="6"
    class DataType {
        /**
         * Whether the column type is numeric.
         */
        @PythonName("is_numeric") attr isNumeric: Boolean
        /**
         * Whether the column type is temporal.
         */
        @PythonName("is_temporal") attr isTemporal: Boolean
    }
    ```

## `#!sds attr` isNumeric {#safeds.data.tabular.typing.DataType.isNumeric data-toc-label='isNumeric'}

Whether the column type is numeric.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` isTemporal {#safeds.data.tabular.typing.DataType.isTemporal data-toc-label='isTemporal'}

Whether the column type is temporal.

**Type:** [`Boolean`][safeds.lang.Boolean]
