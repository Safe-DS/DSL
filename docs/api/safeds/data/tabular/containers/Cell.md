---
search:
  boost: 0.5
---

# `#!sds abstract class` Cell {#safeds.data.tabular.containers.Cell data-toc-label='[abstract class] Cell'}

A single value in a table.

This class cannot be instantiated directly. It is only used for arguments of callbacks.

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `T` | [`Any?`][safeds.lang.Any] | - | [`Any?`][safeds.lang.Any] |

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="8"
    class Cell<out T = Any?> {
        /**
         * Negate a boolean. This WILL LATER BE equivalent to the ^not operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [true, false]);
         *     val result = column.transform((cell) -> cell.^not());
         *     // Column("example", [false, true])
         * }
         */
        @Pure
        @PythonName("not_")
        fun ^not() -> result: Cell<Boolean>

        /**
         * Perform a boolean AND operation. This WILL LATER BE equivalent to the ^and operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [true, false]);
         *     val result = column.transform((cell) -> cell.^and(false));
         *     // Column("example", [false, false])
         * }
         */
        @Pure
        @PythonName("and_")
        fun ^and(
            other: union<Boolean, Cell<Boolean>>
        ) -> result: Cell<Boolean>

        /**
         * Perform a boolean OR operation. This WILL LATER BE equivalent to the ^or operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [true, false]);
         *     val result = column.transform((cell) -> cell.^or(true));
         *     // Column("example", [true, true])
         * }
         */
        @Pure
        @PythonName("or_")
        fun ^or(
            other: union<Boolean, Cell<Boolean>>
        ) -> result: Cell<Boolean>

        /**
         * Perform a boolean XOR operation.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [true, false]);
         *     val result = column.transform((cell) -> cell.xor(true));
         *     // Column("example", [false, true])
         * }
         */
        @Pure
        fun xor(
            other: union<Boolean, Cell<Boolean>>
        ) -> result: Cell<Boolean>

        /**
         * Get the absolute value.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1, -2]);
         *     val result = column.transform((cell) -> cell.abs());
         *     // Column("example", [1, 2])
         * }
         */
        @Pure
        fun abs() -> result: Cell

        /**
         * Round up to the nearest integer.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1.1, 2.9]);
         *     val result = column.transform((cell) -> cell.ceil());
         *     // Column("example", [2, 3])
         * }
         */
        @Pure
        fun ceil() -> result: Cell

        /**
         * Round down to the nearest integer.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1.1, 2.9]);
         *     val result = column.transform((cell) -> cell.floor());
         *     // Column("example", [1, 2])
         * }
         */
        @Pure
        fun floor() -> result: Cell

        /**
         * Negate the value.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1, -2]);
         *     val result = column.transform((cell) -> cell.neg());
         *     // Column("example", [-1, 2])
         * }
         */
        @Pure
        fun neg() -> result: Cell

        /**
         * Add a value. This WILL LATER BE equivalent to the `+` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1, 2]);
         *     val result = column.transform((cell) -> cell.add(3));
         *     // Column("example", [4, 5])
         * }
         */
        @Pure
        fun add(
            other: Any
        ) -> result: Cell

        /**
         * Perform a modulo operation.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [5, 6]);
         *     val result = column.transform((cell) -> cell.mod(3));
         *     // Column("example", [2, 0])
         * }
         */
        @Pure
        fun mod(
            other: Any
        ) -> result: Cell

        /**
         * Multiply by a value. This WILL LATER BE equivalent to the `*` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [2, 3]);
         *     val result = column.transform((cell) -> cell.mul(4));
         *     // Column("example", [8, 12])
         * }
         */
        @Pure
        fun mul(
            other: Any
        ) -> result: Cell

        /**
         * Raise to a power.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [2, 3]);
         *     val result = column.transform((cell) -> cell.pow(3.0));
         *     // Column("example", [8, 27])
         * }
         */
        @Pure
        fun pow(
            other: union<Cell, Float>
        ) -> result: Cell

        /**
         * Subtract a value. This WILL LATER BE equivalent to the `-` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [5, 6]);
         *     val result = column.transform((cell) -> cell.^sub(3));
         *     // Column("example", [2, 3])
         * }
         */
        @Pure
        fun ^sub(
            other: Any
        ) -> result: Cell

        /**
         * Divide by a value. This WILL LATER BE equivalent to the `/` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [6, 8]);
         *     val result = column.transform((cell) -> cell.div(2));
         *     // Column("example", [3, 4])
         * }
         */
        @Pure
        fun div(
            other: Any
        ) -> result: Cell

        /**
         * Check if equal to a value. This WILL LATER BE equivalent to the `==` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1, 2]);
         *     val result = column.transform((cell) -> cell.eq(2));
         *     // Column("example", [false, true])
         * }
         */
        @Pure
        fun eq(
            other: Any
        ) -> result: Cell<Boolean>

        /**
         * Check if greater than or equal to a value. This WILL LATER BE equivalent to the `>=` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1, 2]);
         *     val result = column.transform((cell) -> cell.ge(2));
         *     // Column("example", [false, true])
         * }
         */
        @Pure
        fun ge(
            other: Any
        ) -> result: Cell<Boolean>

        /**
         * Check if greater than a value. This WILL LATER BE equivalent to the `>` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1, 2]);
         *     val result = column.transform((cell) -> cell.gt(2));
         *     // Column("example", [false, false])
         * }
         */
        @Pure
        fun gt(
            other: Any
        ) -> result: Cell<Boolean>

        /**
         * Check if less than or equal to a value. This WILL LATER BE equivalent to the `<=` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1, 2]);
         *     val result = column.transform((cell) -> cell.le(2));
         *     // Column("example", [true, true])
         * }
         */
        @Pure
        fun le(
            other: Any
        ) -> result: Cell<Boolean>

        /**
         * Check if less than a value. This WILL LATER BE equivalent to the `<` operator.
         *
         * @example
         * pipeline example {
         *     val column = Column("example", [1, 2]);
         *     val result = column.transform((cell) -> cell.lt(2));
         *     // Column("example", [true, false])
         * }
         */
        @Pure
        fun lt(
            other: Any
        ) -> result: Cell<Boolean>
    }
    ```

## `#!sds fun` abs {#safeds.data.tabular.containers.Cell.abs data-toc-label='[fun] abs'}

Get the absolute value.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1, -2]);
    val result = column.transform((cell) -> cell.abs());
    // Column("example", [1, 2])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="80"
    @Pure
    fun abs() -> result: Cell
    ```

## `#!sds fun` add {#safeds.data.tabular.containers.Cell.add data-toc-label='[fun] add'}

Add a value. This WILL LATER BE equivalent to the `+` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1, 2]);
    val result = column.transform((cell) -> cell.add(3));
    // Column("example", [4, 5])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="132"
    @Pure
    fun add(
        other: Any
    ) -> result: Cell
    ```

## `#!sds fun` and {#safeds.data.tabular.containers.Cell.and data-toc-label='[fun] and'}

Perform a boolean AND operation. This WILL LATER BE equivalent to the ^and operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | `#!sds union<Boolean, Cell<Boolean>>` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [true, false]);
    val result = column.transform((cell) -> cell.^and(false));
    // Column("example", [false, false])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="33"
    @Pure
    @PythonName("and_")
    fun ^and(
        other: union<Boolean, Cell<Boolean>>
    ) -> result: Cell<Boolean>
    ```

## `#!sds fun` ceil {#safeds.data.tabular.containers.Cell.ceil data-toc-label='[fun] ceil'}

Round up to the nearest integer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1.1, 2.9]);
    val result = column.transform((cell) -> cell.ceil());
    // Column("example", [2, 3])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="93"
    @Pure
    fun ceil() -> result: Cell
    ```

## `#!sds fun` div {#safeds.data.tabular.containers.Cell.div data-toc-label='[fun] div'}

Divide by a value. This WILL LATER BE equivalent to the `/` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [6, 8]);
    val result = column.transform((cell) -> cell.div(2));
    // Column("example", [3, 4])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="207"
    @Pure
    fun div(
        other: Any
    ) -> result: Cell
    ```

## `#!sds fun` eq {#safeds.data.tabular.containers.Cell.eq data-toc-label='[fun] eq'}

Check if equal to a value. This WILL LATER BE equivalent to the `==` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1, 2]);
    val result = column.transform((cell) -> cell.eq(2));
    // Column("example", [false, true])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="222"
    @Pure
    fun eq(
        other: Any
    ) -> result: Cell<Boolean>
    ```

## `#!sds fun` floor {#safeds.data.tabular.containers.Cell.floor data-toc-label='[fun] floor'}

Round down to the nearest integer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1.1, 2.9]);
    val result = column.transform((cell) -> cell.floor());
    // Column("example", [1, 2])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="106"
    @Pure
    fun floor() -> result: Cell
    ```

## `#!sds fun` ge {#safeds.data.tabular.containers.Cell.ge data-toc-label='[fun] ge'}

Check if greater than or equal to a value. This WILL LATER BE equivalent to the `>=` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1, 2]);
    val result = column.transform((cell) -> cell.ge(2));
    // Column("example", [false, true])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="237"
    @Pure
    fun ge(
        other: Any
    ) -> result: Cell<Boolean>
    ```

## `#!sds fun` gt {#safeds.data.tabular.containers.Cell.gt data-toc-label='[fun] gt'}

Check if greater than a value. This WILL LATER BE equivalent to the `>` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1, 2]);
    val result = column.transform((cell) -> cell.gt(2));
    // Column("example", [false, false])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="252"
    @Pure
    fun gt(
        other: Any
    ) -> result: Cell<Boolean>
    ```

## `#!sds fun` le {#safeds.data.tabular.containers.Cell.le data-toc-label='[fun] le'}

Check if less than or equal to a value. This WILL LATER BE equivalent to the `<=` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1, 2]);
    val result = column.transform((cell) -> cell.le(2));
    // Column("example", [true, true])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="267"
    @Pure
    fun le(
        other: Any
    ) -> result: Cell<Boolean>
    ```

## `#!sds fun` lt {#safeds.data.tabular.containers.Cell.lt data-toc-label='[fun] lt'}

Check if less than a value. This WILL LATER BE equivalent to the `<` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1, 2]);
    val result = column.transform((cell) -> cell.lt(2));
    // Column("example", [true, false])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="282"
    @Pure
    fun lt(
        other: Any
    ) -> result: Cell<Boolean>
    ```

## `#!sds fun` mod {#safeds.data.tabular.containers.Cell.mod data-toc-label='[fun] mod'}

Perform a modulo operation.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [5, 6]);
    val result = column.transform((cell) -> cell.mod(3));
    // Column("example", [2, 0])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="147"
    @Pure
    fun mod(
        other: Any
    ) -> result: Cell
    ```

## `#!sds fun` mul {#safeds.data.tabular.containers.Cell.mul data-toc-label='[fun] mul'}

Multiply by a value. This WILL LATER BE equivalent to the `*` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [2, 3]);
    val result = column.transform((cell) -> cell.mul(4));
    // Column("example", [8, 12])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="162"
    @Pure
    fun mul(
        other: Any
    ) -> result: Cell
    ```

## `#!sds fun` neg {#safeds.data.tabular.containers.Cell.neg data-toc-label='[fun] neg'}

Negate the value.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [1, -2]);
    val result = column.transform((cell) -> cell.neg());
    // Column("example", [-1, 2])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="119"
    @Pure
    fun neg() -> result: Cell
    ```

## `#!sds fun` not {#safeds.data.tabular.containers.Cell.not data-toc-label='[fun] not'}

Negate a boolean. This WILL LATER BE equivalent to the ^not operator.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [true, false]);
    val result = column.transform((cell) -> cell.^not());
    // Column("example", [false, true])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="19"
    @Pure
    @PythonName("not_")
    fun ^not() -> result: Cell<Boolean>
    ```

## `#!sds fun` or {#safeds.data.tabular.containers.Cell.or data-toc-label='[fun] or'}

Perform a boolean OR operation. This WILL LATER BE equivalent to the ^or operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | `#!sds union<Boolean, Cell<Boolean>>` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [true, false]);
    val result = column.transform((cell) -> cell.^or(true));
    // Column("example", [true, true])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="49"
    @Pure
    @PythonName("or_")
    fun ^or(
        other: union<Boolean, Cell<Boolean>>
    ) -> result: Cell<Boolean>
    ```

## `#!sds fun` pow {#safeds.data.tabular.containers.Cell.pow data-toc-label='[fun] pow'}

Raise to a power.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | `#!sds union<Cell<Any?>, Float>` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [2, 3]);
    val result = column.transform((cell) -> cell.pow(3.0));
    // Column("example", [8, 27])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="177"
    @Pure
    fun pow(
        other: union<Cell, Float>
    ) -> result: Cell
    ```

## `#!sds fun` sub {#safeds.data.tabular.containers.Cell.sub data-toc-label='[fun] sub'}

Subtract a value. This WILL LATER BE equivalent to the `-` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Any?>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [5, 6]);
    val result = column.transform((cell) -> cell.^sub(3));
    // Column("example", [2, 3])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="192"
    @Pure
    fun ^sub(
        other: Any
    ) -> result: Cell
    ```

## `#!sds fun` xor {#safeds.data.tabular.containers.Cell.xor data-toc-label='[fun] xor'}

Perform a boolean XOR operation.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | `#!sds union<Boolean, Cell<Boolean>>` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`Cell<Boolean>`][safeds.data.tabular.containers.Cell] | - |

**Examples:**

```sds hl_lines="3"
pipeline example {
    val column = Column("example", [true, false]);
    val result = column.transform((cell) -> cell.xor(true));
    // Column("example", [false, true])
}
```

??? quote "Stub code in `Cell.sdsstub`"

    ```sds linenums="65"
    @Pure
    fun xor(
        other: union<Boolean, Cell<Boolean>>
    ) -> result: Cell<Boolean>
    ```
