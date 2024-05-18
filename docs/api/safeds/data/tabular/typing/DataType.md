---
search:
  boost: 0.5
---

# <code class="doc-symbol doc-symbol-class"></code> `DataType` {#safeds.data.tabular.typing.DataType data-toc-label='[class] DataType'}

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

## <code class="doc-symbol doc-symbol-attribute"></code> `isNumeric` {#safeds.data.tabular.typing.DataType.isNumeric data-toc-label='[attribute] isNumeric'}

Whether the column type is numeric.

**Type:** [`Boolean`][safeds.lang.Boolean]

## <code class="doc-symbol doc-symbol-attribute"></code> `isTemporal` {#safeds.data.tabular.typing.DataType.isTemporal data-toc-label='[attribute] isTemporal'}

Whether the column type is temporal.

**Type:** [`Boolean`][safeds.lang.Boolean]
