# `#!sds abstract class` Number {#safeds.lang.Number data-toc-label='Number'}

A number.

??? quote "Source code in `coreClasses.sdsstub`"

    ```sds linenums="29"
    class Number {
    
        /**
         * Converts the number to an integer.
         */
        @Pure
        @PythonCall("int($this)")
        fun toInt() -> i: Int
    }
    ```

## `#!sds fun` toInt {#safeds.lang.Number.toInt data-toc-label='toInt'}

Converts the number to an integer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `i` | [`Int`][safeds.lang.Int] | - |

??? quote "Source code in `coreClasses.sdsstub`"

    ```sds linenums="34"
    @Pure
    @PythonCall("int($this)")
    fun toInt() -> i: Int
    ```
