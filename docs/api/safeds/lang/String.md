---
search:
  boost: 0.5
---

# `#!sds abstract class` String {#safeds.lang.String data-toc-label='String'}

Some text.

**Examples:**

```sds
pipeline example {
    val string = "Hello, world!";
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="188"
    class String {

        /**
         * Parses the string to a floating-point number.
         *
         * @example
         * pipeline example {
         *     val float = "1.0".toFloat(); // 1.0
         * }
         */
        @Pure
        @PythonCall("float($this)")
        fun toFloat() -> f: Float

        /**
         * Parses the string to an integer.
         *
         * @param base The base of the integer.
         *
         * @example
         * pipeline example {
         *     val int = "10".toInt(); // 10
         * }
         *
         * @example
         * pipeline example {
         *     val int = "10".toInt(base = 2); // 2
         * }
         */
        @Pure
        @PythonCall("int($this, $base)")
        fun toInt(base: Int = 10) -> i: Int
    }
    ```

## `#!sds fun` toFloat {#safeds.lang.String.toFloat data-toc-label='toFloat'}

Parses the string to a floating-point number.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `f` | [`Float`][safeds.lang.Float] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val float = "1.0".toFloat(); // 1.0
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="198"
    @Pure
    @PythonCall("float($this)")
    fun toFloat() -> f: Float
    ```

## `#!sds fun` toInt {#safeds.lang.String.toInt data-toc-label='toInt'}

Parses the string to an integer.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `base` | [`Int`][safeds.lang.Int] | The base of the integer. | `#!sds 10` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `i` | [`Int`][safeds.lang.Int] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val int = "10".toInt(); // 10
}
```
```sds hl_lines="2"
pipeline example {
    val int = "10".toInt(base = 2); // 2
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="217"
    @Pure
    @PythonCall("int($this, $base)")
    fun toInt(base: Int = 10) -> i: Int
    ```
