---
search:
  boost: 0.5
---

# `#!sds abstract class` String {#safeds.lang.String data-toc-label='String'}

Some text.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="178"
    class String {
    
        /**
         * Parses the string to a floating-point number.
         *
         * @example
         * pipeline example {
         *     // TODO
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
         *     // TODO
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

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="188"
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

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="202"
    @Pure
    @PythonCall("int($this, $base)")
    fun toInt(base: Int = 10) -> i: Int
    ```
