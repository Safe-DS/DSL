---
search:
  boost: 0.5
---

# `#!sds abstract class` List {#safeds.lang.List data-toc-label='List'}

A list of elements.

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `E` | [`Any?`][safeds.lang.Any] | - | - |

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="58"
    class List<out E> {
    
        /**
         * Returns the number of elements in the list.
         */
        @Pure
        @PythonCall("len($this)")
        fun size() -> size: Int
    }
    ```

## `#!sds fun` size {#safeds.lang.List.size data-toc-label='size'}

Returns the number of elements in the list.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `size` | [`Int`][safeds.lang.Int] | - |

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="63"
    @Pure
    @PythonCall("len($this)")
    fun size() -> size: Int
    ```
