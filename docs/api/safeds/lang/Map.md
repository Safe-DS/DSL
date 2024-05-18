---
search:
  boost: 0.5
---

# `#!sds abstract class` Map {#safeds.lang.Map data-toc-label='[abstract class] Map'}

A map of keys to values.

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `K` | [`Any?`][safeds.lang.Any] | - | - |
| `V` | [`Any?`][safeds.lang.Any] | - | - |

**Examples:**

```sds
pipeline example {
    val map = {
        "a": 1,
        "b": 2,
        "c": 3
    };
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="176"
    class Map<K, out V> {

        /**
         * Return the number of entries in the map.
         *
         * @example
         * pipeline example {
         *     val map = {
         *         "a": 1,
         *         "b": 2,
         *         "c": 3
         *     };
         *     val size = map.size(); // 3
         * }
         */
        @Pure
        @PythonMacro("len($this)")
        fun size() -> size: Int

        /**
         * Return the keys of the map.
         *
         * @example
         * pipeline example {
         *     val map = {
         *         "a": 1,
         *         "b": 2,
         *         "c": 3
         *     };
         *     val keys = map.keys(); // ["a", "b", "c"]
         * }
         */
        @Pure
        @PythonMacro("list($this.keys())")
        fun keys() -> keys: List<K>

        /**
         * Return the values of the map.
         *
         * @example
         * pipeline example {
         *     val map = {
         *         "a": 1,
         *         "b": 2,
         *         "c": 3
         *     };
         *     val values = map.values(); // [1, 2, 3]
         * }
         */
        @Pure
        @PythonMacro("list($this.values())")
        fun values() -> values: List<V>
    }
    ```

## `#!sds fun` keys {#safeds.lang.Map.keys data-toc-label='[fun] keys'}

Return the keys of the map.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `keys` | [`List<K>`][safeds.lang.List] | - |

**Examples:**

```sds hl_lines="7"
pipeline example {
    val map = {
        "a": 1,
        "b": 2,
        "c": 3
    };
    val keys = map.keys(); // ["a", "b", "c"]
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="208"
    @Pure
    @PythonMacro("list($this.keys())")
    fun keys() -> keys: List<K>
    ```

## `#!sds fun` size {#safeds.lang.Map.size data-toc-label='[fun] size'}

Return the number of entries in the map.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `size` | [`Int`][safeds.lang.Int] | - |

**Examples:**

```sds hl_lines="7"
pipeline example {
    val map = {
        "a": 1,
        "b": 2,
        "c": 3
    };
    val size = map.size(); // 3
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="191"
    @Pure
    @PythonMacro("len($this)")
    fun size() -> size: Int
    ```

## `#!sds fun` values {#safeds.lang.Map.values data-toc-label='[fun] values'}

Return the values of the map.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `values` | [`List<V>`][safeds.lang.List] | - |

**Examples:**

```sds hl_lines="7"
pipeline example {
    val map = {
        "a": 1,
        "b": 2,
        "c": 3
    };
    val values = map.values(); // [1, 2, 3]
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="225"
    @Pure
    @PythonMacro("list($this.values())")
    fun values() -> values: List<V>
    ```
