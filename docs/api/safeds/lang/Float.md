# `#!sds abstract class` Float {#safeds.lang.Float data-toc-label='Float'}

A floating-point number.

**Parent type:** [`Number`][safeds.lang.Number]

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="46"
    class Float sub Number {
        /**
         * Converts this floating-point number to an integer by truncating the fractional part.
         */
        @Pure
        @PythonCall("int($this)")
        fun toInt() -> i: Int
    }
    ```

## `#!sds fun` toInt {#safeds.lang.Float.toInt data-toc-label='toInt'}

Converts this floating-point number to an integer by truncating the fractional part.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `i` | [`Int`][safeds.lang.Int] | - |

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="50"
    @Pure
    @PythonCall("int($this)")
    fun toInt() -> i: Int
    ```
