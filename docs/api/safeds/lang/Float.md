---
search:
  boost: 0.5
---

# `#!sds abstract class` Float {#safeds.lang.Float data-toc-label='Float'}

A floating-point number.

**Parent type:** [`Number`][safeds.lang.Number]

**Examples:**

```sds
pipeline example {
    val float = 1.0;
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="76"
    class Float sub Number {
        /**
         * Converts this floating-point number to an integer by truncating the fractional part.
         *
         * @example
         * pipeline example {
         *     val int = 1.0.toInt(); // 1
         * }
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

**Examples:**

```sds
pipeline example {
    val int = 1.0.toInt(); // 1
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="85"
    @Pure
    @PythonCall("int($this)")
    fun toInt() -> i: Int
    ```
