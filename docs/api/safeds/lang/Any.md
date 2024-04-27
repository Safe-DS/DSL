---
search:
  boost: 0.5
---

# `#!sds abstract class` Any {#safeds.lang.Any data-toc-label='Any'}

The common superclass of all classes.

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="6"
    class Any {

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

## `#!sds fun` toString {#safeds.lang.Any.toString data-toc-label='toString'}

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

    ```sds linenums="16"
    @Pure
    @PythonMacro("str($this)")
    fun toString() -> string: String
    ```
