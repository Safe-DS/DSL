---
search:
  boost: 0.5
---

# `#!sds abstract class` `Int` {#safeds.lang.Int data-toc-label='[abstract class] Int'}

An integer.

**Parent type:** [`Number`][safeds.lang.Number]

**Examples:**

```sds
pipeline example {
    val int = 1;
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="71"
    class Int sub Number {

        /**
         * Convert this integer to a floating-point number.
         *
         * @example
         * pipeline example {
         *     val float = 1.toFloat(); // 1.0
         * }
         */
        @Pure
        @PythonMacro("float($this)")
        fun toFloat() -> float: Float
    }
    ```

## `#!sds fun` `toFloat` {#safeds.lang.Int.toFloat data-toc-label='[fun] toFloat'}

Convert this integer to a floating-point number.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `float` | [`Float`][safeds.lang.Float] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val float = 1.toFloat(); // 1.0
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="81"
    @Pure
    @PythonMacro("float($this)")
    fun toFloat() -> float: Float
    ```
