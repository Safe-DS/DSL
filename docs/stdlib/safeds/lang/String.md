# `#!sds abstract class` String {#safeds.lang.String data-toc-label='String'}

Some text.

??? quote "Source code in `coreClasses.sdsstub`"

    ```sds linenums="92"
    class String {
    
        /**
         * Converts the string to an integer.
         *
         * @base The base of the integer.
         */
        @Pure
        @PythonCall("int($this, $base)")
        fun toInt(base: Int = 10) -> i: Int
    }
    ```

## `#!sds fun` toInt {#safeds.lang.String.toInt data-toc-label='toInt'}

Converts the string to an integer.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `base` | [`Int`][safeds.lang.Int] | - | `#!sds 10` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `i` | [`Int`][safeds.lang.Int] | - |

??? quote "Source code in `coreClasses.sdsstub`"

    ```sds linenums="99"
    @Pure
    @PythonCall("int($this, $base)")
    fun toInt(base: Int = 10) -> i: Int
    ```
