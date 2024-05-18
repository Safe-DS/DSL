---
search:
  boost: 0.5
---

# `#!sds abstract class` Any {#safeds.lang.Any data-toc-label='[abstract class] Any'}

The common superclass of all classes.

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="6"
    class Any {

        /**
         * Return whether the object is truthy.
         *
         * @example
         * pipeline example {
         *     val boolean = 1.toBoolean(); // true
         * }
         *
         * @example
         * pipeline example {
         *     val boolean = 0.toBoolean(); // false
         * }
         */
        @Pure
        @PythonMacro("bool($this)")
        fun toBoolean() -> boolean: Boolean

        /**
         * Return a string representation of the object.
         *
         * @example
         * pipeline example {
         *     val string = 1.toString(); // "1"
         * }
         */
        @Pure
        @PythonMacro("str($this)")
        fun toString() -> string: String
    }
    ```

## `#!sds fun` toBoolean {#safeds.lang.Any.toBoolean data-toc-label='[fun] toBoolean'}

Return whether the object is truthy.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `boolean` | [`Boolean`][safeds.lang.Boolean] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val boolean = 1.toBoolean(); // true
}
```
```sds hl_lines="2"
pipeline example {
    val boolean = 0.toBoolean(); // false
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="21"
    @Pure
    @PythonMacro("bool($this)")
    fun toBoolean() -> boolean: Boolean
    ```

## `#!sds fun` toString {#safeds.lang.Any.toString data-toc-label='[fun] toString'}

Return a string representation of the object.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `string` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val string = 1.toString(); // "1"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="33"
    @Pure
    @PythonMacro("str($this)")
    fun toString() -> string: String
    ```
