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
         * Returns a string representation of the object.
         *
         * @example
         * pipeline example {
         *     val string = 1.toString(); // "1"
         * }
         */
        @Pure
        @PythonCall("str($this)")
        fun toString() -> s: String
    }
    ```

## `#!sds fun` toString {#safeds.lang.Any.toString data-toc-label='toString'}

Returns a string representation of the object.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `s` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds
pipeline example {
    val string = 1.toString(); // "1"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="16"
    @Pure
    @PythonCall("str($this)")
    fun toString() -> s: String
    ```
