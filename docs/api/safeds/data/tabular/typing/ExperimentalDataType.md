---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` ExperimentalDataType {#safeds.data.tabular.typing.ExperimentalDataType data-toc-label='ExperimentalDataType'}

The type of a column or cell in a table.

??? quote "Stub code in `ExperimentalDataType.sdsstub`"

    ```sds linenums="7"
    class ExperimentalDataType {
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

## `#!sds attr` isNumeric {#safeds.data.tabular.typing.ExperimentalDataType.isNumeric data-toc-label='isNumeric'}

Whether the column type is numeric.

**Type:** [`Boolean`][safeds.lang.Boolean]

## `#!sds attr` isTemporal {#safeds.data.tabular.typing.ExperimentalDataType.isTemporal data-toc-label='isTemporal'}

Whether the column type is temporal.

**Type:** [`Boolean`][safeds.lang.Boolean]
