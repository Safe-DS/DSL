---
search:
  boost: 0.5
---

# `#!sds abstract class` Int {#safeds.lang.Int data-toc-label='Int'}

An integer.

**Parent type:** [`Number`][safeds.lang.Number]

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="34"
    class Int sub Number {
        /**
         * Converts this integer to a floating-point number.
         */
        @Pure
        @PythonCall("float($this)")
        fun toFloat() -> f: Float
    }
    ```

## `#!sds fun` toFloat {#safeds.lang.Int.toFloat data-toc-label='toFloat'}

Converts this integer to a floating-point number.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `f` | [`Float`][safeds.lang.Float] | - |

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="38"
    @Pure
    @PythonCall("float($this)")
    fun toFloat() -> f: Float
    ```
