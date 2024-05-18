---
search:
  boost: 0.5
---

# <code class="doc-symbol doc-symbol-class"></code> `List` {#safeds.lang.List data-toc-label='[class] List'}

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

    ```sds linenums="117"
    class List<out E> {

        /**
         * Join the elements of the list into a string using the separator.
         *
         * @example
         * pipeline example {
         *     val string = [1, 2, 3].join(); // "1, 2, 3"
         * }
         *
         * @example
         * pipeline example {
         *     val string = [1, 2, 3].join("-"); // "1-2-3"
         * }
         */
        @Pure
        @PythonMacro("$separator.join($this)")
        fun join(separator: String = ", ") -> string: String

        /**
         * Return the slice of the list starting at the start index up to but excluding the end index.
         *
         * @param start The start index (inclusive).
         * @param end The end index (exclusive). Negative indices count from the end of the list.
         *
         * @example
         * pipeline example {
         *     val slice = [1, 2, 3].slice(1, 3); // [2, 3]
         * }
         */
        @Pure
        @PythonMacro("$this[$start:$end]")
        fun slice(start: Int = 0, end: Int = this.size()) -> slice: List<E>

        /**
         * Return the number of elements in the list.
         *
         * @example
         * pipeline example {
         *     val size = [1, 2, 3].size(); // 3
         * }
         */
        @Pure
        @PythonMacro("len($this)")
        fun size() -> size: Int
    }
    ```

## <code class="doc-symbol doc-symbol-function"></code> `join` {#safeds.lang.List.join data-toc-label='[function] join'}

Join the elements of the list into a string using the separator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `separator` | [`String`][safeds.lang.String] | - | `#!sds ", "` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `string` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val string = [1, 2, 3].join(); // "1, 2, 3"
}
```
```sds hl_lines="2"
pipeline example {
    val string = [1, 2, 3].join("-"); // "1-2-3"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="132"
    @Pure
    @PythonMacro("$separator.join($this)")
    fun join(separator: String = ", ") -> string: String
    ```

## <code class="doc-symbol doc-symbol-function"></code> `size` {#safeds.lang.List.size data-toc-label='[function] size'}

Return the number of elements in the list.

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

    ```sds linenums="159"
    @Pure
    @PythonMacro("len($this)")
    fun size() -> size: Int
    ```

## <code class="doc-symbol doc-symbol-function"></code> `slice` {#safeds.lang.List.slice data-toc-label='[function] slice'}

Return the slice of the list starting at the start index up to but excluding the end index.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `start` | [`Int`][safeds.lang.Int] | The start index (inclusive). | `#!sds 0` |
| `end` | [`Int`][safeds.lang.Int] | The end index (exclusive). Negative indices count from the end of the list. | `#!sds this.size()` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `slice` | [`List<E>`][safeds.lang.List] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val slice = [1, 2, 3].slice(1, 3); // [2, 3]
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="147"
    @Pure
    @PythonMacro("$this[$start:$end]")
    fun slice(start: Int = 0, end: Int = this.size()) -> slice: List<E>
    ```
