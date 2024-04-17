---
search:
  boost: 0.5
---

# `#!sds abstract class` Map {#safeds.lang.Map data-toc-label='Map'}

A map of keys to values.

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `K` | [`Any?`][safeds.lang.Any] | - | - |
| `V` | [`Any?`][safeds.lang.Any] | - | - |

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="71"
    class Map<K, out V> {
    
        /**
         * Returns the number of entries in the map.
         */
        @Pure
        @PythonCall("len($this)")
        fun size() -> size: Int
    
        /**
         * Returns the keys of the map.
         */
        @Pure
        @PythonCall("list($this.keys())")
        fun keys() -> keys: List<K>
    
        /**
         * Returns the values of the map.
         */
        @Pure
        @PythonCall("list($this.values())")
        fun values() -> values: List<V>
    }
    ```

## `#!sds fun` keys {#safeds.lang.Map.keys data-toc-label='keys'}

Returns the keys of the map.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `keys` | [`List<K>`][safeds.lang.List] | - |

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="83"
    @Pure
    @PythonCall("list($this.keys())")
    fun keys() -> keys: List<K>
    ```

## `#!sds fun` size {#safeds.lang.Map.size data-toc-label='size'}

Returns the number of entries in the map.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `size` | [`Int`][safeds.lang.Int] | - |

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="76"
    @Pure
    @PythonCall("len($this)")
    fun size() -> size: Int
    ```

## `#!sds fun` values {#safeds.lang.Map.values data-toc-label='values'}

Returns the values of the map.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `values` | [`List<V>`][safeds.lang.List] | - |

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="90"
    @Pure
    @PythonCall("list($this.values())")
    fun values() -> values: List<V>
    ```
