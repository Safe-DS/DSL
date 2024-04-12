# `#!sds abstract class` Any {#safeds.lang.Any data-toc-label='Any'}

The common superclass of all classes.

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="6"
    class Any {
    
        /**
         * Returns a string representation of the object.
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

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="11"
    @Pure
    @PythonCall("str($this)")
    fun toString() -> s: String
    ```
