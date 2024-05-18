---
search:
  boost: 0.5
---

# <code class="doc-symbol doc-symbol-class"></code> `Float` {#safeds.lang.Float data-toc-label='[class] Float'}

A floating-point number.

**Parent type:** [`Number`][safeds.lang.Number]

**Examples:**

```sds
pipeline example {
    val float = 1.0;
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="94"
    class Float sub Number {

        /**
         * Convert this floating-point number to an integer by truncating the fractional part.
         *
         * @example
         * pipeline example {
         *     val int = 1.0.toInt(); // 1
         * }
         */
        @Pure
        @PythonMacro("int($this)")
        fun toInt() -> int: Int
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `toInt` {#safeds.lang.Float.toInt data-toc-label='[function] toInt'}

Convert this floating-point number to an integer by truncating the fractional part.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `int` | [`Int`][safeds.lang.Int] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val int = 1.0.toInt(); // 1
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="104"
    @Pure
    @PythonMacro("int($this)")
    fun toInt() -> int: Int
    ```
