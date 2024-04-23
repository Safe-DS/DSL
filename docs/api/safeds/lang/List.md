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

**Examples:**

```sds
pipeline example {
    val list = [1, 2, 3];
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="99"
    class List<out E> {

        /**
         * Returns the number of elements in the list.
         *
         * @example
         * pipeline example {
         *     val size = [1, 2, 3].size(); // 3
         * }
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

**Examples:**

```sds hl_lines="2"
pipeline example {
    val size = [1, 2, 3].size(); // 3
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="109"
    @Pure
    @PythonCall("len($this)")
    fun size() -> size: Int
    ```
