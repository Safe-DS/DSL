---
search:
  boost: 0.5
---

# `#!sds abstract class` Int {#safeds.lang.Int data-toc-label='Int'}

An integer.

**Parent type:** [`Number`][safeds.lang.Number]

**Examples:**

```sds
pipeline example {
    val int = 1;
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="54"
    class Int sub Number {
        /**
         * Converts this integer to a floating-point number.
         *
         * @example
         * pipeline example {
         *     val float = 1.toFloat(); // 1.0
         * }
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

**Examples:**

```sds
pipeline example {
    val float = 1.toFloat(); // 1.0
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="63"
    @Pure
    @PythonCall("float($this)")
    fun toFloat() -> f: Float
    ```
