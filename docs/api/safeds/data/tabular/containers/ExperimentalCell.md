---
search:
  boost: 0.5
---

# :test_tube:{ title="Experimental" } `#!sds abstract class` ExperimentalCell {#safeds.data.tabular.containers.ExperimentalCell data-toc-label='ExperimentalCell'}

A single value in a table.

This class cannot be instantiated directly. It is only used for arguments of callbacks.

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `T` | [`Any?`][safeds.lang.Any] | - | [`Any?`][safeds.lang.Any] |

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="9"
    class ExperimentalCell<T = Any?> {
        /**
         * Negate a boolean. This is equivalent to the `~` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [True, False])
         *     // column.transform(lambda cell: cell.not_())
         * }
         */
        @Pure
        @PythonName("not_")
        fun `not`() -> result: ExperimentalCell<Boolean>

        /**
         * Perform a boolean AND operation. This is equivalent to the `&` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [True, False])
         *     // column.transform(lambda cell: cell.and_(False))
         * }
         */
        @Pure
        @PythonName("and_")
        fun `and`(
            other: union<Boolean, ExperimentalCell<Boolean>>
        ) -> result: ExperimentalCell<Boolean>

        /**
         * Perform a boolean OR operation. This is equivalent to the `|` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [True, False])
         *     // column.transform(lambda cell: cell.or_(True))
         * }
         */
        @Pure
        @PythonName("or_")
        fun `or`(
            other: union<Boolean, ExperimentalCell<Boolean>>
        ) -> result: ExperimentalCell<Boolean>

        /**
         * Perform a boolean XOR operation. This is equivalent to the `^` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [True, False])
         *     // column.transform(lambda cell: cell.xor(True))
         * }
         */
        @Pure
        fun xor(
            other: union<Boolean, ExperimentalCell<Boolean>>
        ) -> result: ExperimentalCell<Boolean>

        /**
         * Get the absolute value.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1, -2])
         *     // column.transform(lambda cell: cell.abs())
         * }
         */
        @Pure
        fun abs() -> result: ExperimentalCell

        /**
         * Round up to the nearest integer.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1.1, 2.9])
         *     // column.transform(lambda cell: cell.ceil())
         * }
         */
        @Pure
        fun ceil() -> result: ExperimentalCell

        /**
         * Round down to the nearest integer.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1.1, 2.9])
         *     // column.transform(lambda cell: cell.floor())
         * }
         */
        @Pure
        fun floor() -> result: ExperimentalCell

        /**
         * Negate the value.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1, -2])
         *     // column.transform(lambda cell: cell.neg())
         * }
         */
        @Pure
        fun neg() -> result: ExperimentalCell

        /**
         * Add a value. This is equivalent to the `+` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1, 2])
         *     // column.transform(lambda cell: cell.add(3))
         * }
         */
        @Pure
        fun add(
            other: Any
        ) -> result: ExperimentalCell

        /**
         * Perform a modulo operation. This is equivalent to the `%` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [5, 6])
         *     // column.transform(lambda cell: cell.mod(3))
         * }
         */
        @Pure
        fun mod(
            other: Any
        ) -> result: ExperimentalCell

        /**
         * Multiply by a value. This is equivalent to the `*` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [2, 3])
         *     // column.transform(lambda cell: cell.mul(4))
         * }
         */
        @Pure
        fun mul(
            other: Any
        ) -> result: ExperimentalCell

        /**
         * Raise to a power. This is equivalent to the `**` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [2, 3])
         *     // column.transform(lambda cell: cell.pow(3))
         * }
         */
        @Pure
        fun pow(
            other: union<ExperimentalCell, Float>
        ) -> result: ExperimentalCell

        /**
         * Subtract a value. This is equivalent to the `-` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [5, 6])
         *     // column.transform(lambda cell: cell.sub(3))
         * }
         */
        @Pure
        fun `sub`(
            other: Any
        ) -> result: ExperimentalCell

        /**
         * Divide by a value. This is equivalent to the `/` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [6, 8])
         *     // column.transform(lambda cell: cell.div(2))
         * }
         */
        @Pure
        fun div(
            other: Any
        ) -> result: ExperimentalCell

        /**
         * Check if equal to a value. This is equivalent to the `==` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1, 2])
         *     // column.transform(lambda cell: cell.eq(2))
         * }
         */
        @Pure
        fun eq(
            other: Any
        ) -> result: ExperimentalCell<Boolean>

        /**
         * Check if greater than or equal to a value. This is equivalent to the `>=` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1, 2])
         *     // column.transform(lambda cell: cell.ge(2))
         * }
         */
        @Pure
        fun ge(
            other: Any
        ) -> result: ExperimentalCell<Boolean>

        /**
         * Check if greater than a value. This is equivalent to the `>` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1, 2])
         *     // column.transform(lambda cell: cell.gt(2))
         * }
         */
        @Pure
        fun gt(
            other: Any
        ) -> result: ExperimentalCell<Boolean>

        /**
         * Check if less than or equal to a value. This is equivalent to the `<=` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1, 2])
         *     // column.transform(lambda cell: cell.le(2))
         * }
         */
        @Pure
        fun le(
            other: Any
        ) -> result: ExperimentalCell<Boolean>

        /**
         * Check if less than a value. This is equivalent to the `<` operator.
         *
         * @example
         * pipeline example {
         *     // from safeds.data.tabular.containers import ExperimentalColumn
         *     // column = ExperimentalColumn("example", [1, 2])
         *     // column.transform(lambda cell: cell.lt(2))
         * }
         */
        @Pure
        fun lt(
            other: Any
        ) -> result: ExperimentalCell<Boolean>
    }
    ```

## `#!sds fun` abs {#safeds.data.tabular.containers.ExperimentalCell.abs data-toc-label='abs'}

Get the absolute value.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1, -2])
    // column.transform(lambda cell: cell.abs())
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="81"
    @Pure
    fun abs() -> result: ExperimentalCell
    ```

## `#!sds fun` add {#safeds.data.tabular.containers.ExperimentalCell.add data-toc-label='add'}

Add a value. This is equivalent to the `+` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1, 2])
    // column.transform(lambda cell: cell.add(3))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="133"
    @Pure
    fun add(
        other: Any
    ) -> result: ExperimentalCell
    ```

## `#!sds fun` and {#safeds.data.tabular.containers.ExperimentalCell.and data-toc-label='and'}

Perform a boolean AND operation. This is equivalent to the `&` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | `#!sds union<Boolean, ExperimentalCell<Boolean>>` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [True, False])
    // column.transform(lambda cell: cell.and_(False))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="34"
    @Pure
    @PythonName("and_")
    fun `and`(
        other: union<Boolean, ExperimentalCell<Boolean>>
    ) -> result: ExperimentalCell<Boolean>
    ```

## `#!sds fun` ceil {#safeds.data.tabular.containers.ExperimentalCell.ceil data-toc-label='ceil'}

Round up to the nearest integer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1.1, 2.9])
    // column.transform(lambda cell: cell.ceil())
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="94"
    @Pure
    fun ceil() -> result: ExperimentalCell
    ```

## `#!sds fun` div {#safeds.data.tabular.containers.ExperimentalCell.div data-toc-label='div'}

Divide by a value. This is equivalent to the `/` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [6, 8])
    // column.transform(lambda cell: cell.div(2))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="208"
    @Pure
    fun div(
        other: Any
    ) -> result: ExperimentalCell
    ```

## `#!sds fun` eq {#safeds.data.tabular.containers.ExperimentalCell.eq data-toc-label='eq'}

Check if equal to a value. This is equivalent to the `==` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1, 2])
    // column.transform(lambda cell: cell.eq(2))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="223"
    @Pure
    fun eq(
        other: Any
    ) -> result: ExperimentalCell<Boolean>
    ```

## `#!sds fun` floor {#safeds.data.tabular.containers.ExperimentalCell.floor data-toc-label='floor'}

Round down to the nearest integer.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1.1, 2.9])
    // column.transform(lambda cell: cell.floor())
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="107"
    @Pure
    fun floor() -> result: ExperimentalCell
    ```

## `#!sds fun` ge {#safeds.data.tabular.containers.ExperimentalCell.ge data-toc-label='ge'}

Check if greater than or equal to a value. This is equivalent to the `>=` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1, 2])
    // column.transform(lambda cell: cell.ge(2))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="238"
    @Pure
    fun ge(
        other: Any
    ) -> result: ExperimentalCell<Boolean>
    ```

## `#!sds fun` gt {#safeds.data.tabular.containers.ExperimentalCell.gt data-toc-label='gt'}

Check if greater than a value. This is equivalent to the `>` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1, 2])
    // column.transform(lambda cell: cell.gt(2))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="253"
    @Pure
    fun gt(
        other: Any
    ) -> result: ExperimentalCell<Boolean>
    ```

## `#!sds fun` le {#safeds.data.tabular.containers.ExperimentalCell.le data-toc-label='le'}

Check if less than or equal to a value. This is equivalent to the `<=` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1, 2])
    // column.transform(lambda cell: cell.le(2))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="268"
    @Pure
    fun le(
        other: Any
    ) -> result: ExperimentalCell<Boolean>
    ```

## `#!sds fun` lt {#safeds.data.tabular.containers.ExperimentalCell.lt data-toc-label='lt'}

Check if less than a value. This is equivalent to the `<` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1, 2])
    // column.transform(lambda cell: cell.lt(2))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="283"
    @Pure
    fun lt(
        other: Any
    ) -> result: ExperimentalCell<Boolean>
    ```

## `#!sds fun` mod {#safeds.data.tabular.containers.ExperimentalCell.mod data-toc-label='mod'}

Perform a modulo operation. This is equivalent to the `%` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [5, 6])
    // column.transform(lambda cell: cell.mod(3))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="148"
    @Pure
    fun mod(
        other: Any
    ) -> result: ExperimentalCell
    ```

## `#!sds fun` mul {#safeds.data.tabular.containers.ExperimentalCell.mul data-toc-label='mul'}

Multiply by a value. This is equivalent to the `*` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [2, 3])
    // column.transform(lambda cell: cell.mul(4))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="163"
    @Pure
    fun mul(
        other: Any
    ) -> result: ExperimentalCell
    ```

## `#!sds fun` neg {#safeds.data.tabular.containers.ExperimentalCell.neg data-toc-label='neg'}

Negate the value.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [1, -2])
    // column.transform(lambda cell: cell.neg())
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="120"
    @Pure
    fun neg() -> result: ExperimentalCell
    ```

## `#!sds fun` not {#safeds.data.tabular.containers.ExperimentalCell.not data-toc-label='not'}

Negate a boolean. This is equivalent to the `~` operator.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [True, False])
    // column.transform(lambda cell: cell.not_())
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="20"
    @Pure
    @PythonName("not_")
    fun `not`() -> result: ExperimentalCell<Boolean>
    ```

## `#!sds fun` or {#safeds.data.tabular.containers.ExperimentalCell.or data-toc-label='or'}

Perform a boolean OR operation. This is equivalent to the `|` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | `#!sds union<Boolean, ExperimentalCell<Boolean>>` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [True, False])
    // column.transform(lambda cell: cell.or_(True))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="50"
    @Pure
    @PythonName("or_")
    fun `or`(
        other: union<Boolean, ExperimentalCell<Boolean>>
    ) -> result: ExperimentalCell<Boolean>
    ```

## `#!sds fun` pow {#safeds.data.tabular.containers.ExperimentalCell.pow data-toc-label='pow'}

Raise to a power. This is equivalent to the `**` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | `#!sds union<ExperimentalCell<Any?>, Float>` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [2, 3])
    // column.transform(lambda cell: cell.pow(3))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="178"
    @Pure
    fun pow(
        other: union<ExperimentalCell, Float>
    ) -> result: ExperimentalCell
    ```

## `#!sds fun` sub {#safeds.data.tabular.containers.ExperimentalCell.sub data-toc-label='sub'}

Subtract a value. This is equivalent to the `-` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | [`Any`][safeds.lang.Any] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Any?>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [5, 6])
    // column.transform(lambda cell: cell.sub(3))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="193"
    @Pure
    fun `sub`(
        other: Any
    ) -> result: ExperimentalCell
    ```

## `#!sds fun` xor {#safeds.data.tabular.containers.ExperimentalCell.xor data-toc-label='xor'}

Perform a boolean XOR operation. This is equivalent to the `^` operator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `other` | `#!sds union<Boolean, ExperimentalCell<Boolean>>` | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `result` | [`ExperimentalCell<Boolean>`][safeds.data.tabular.containers.ExperimentalCell] | - |

**Examples:**

```sds hl_lines="4"
pipeline example {
    // from safeds.data.tabular.containers import ExperimentalColumn
    // column = ExperimentalColumn("example", [True, False])
    // column.transform(lambda cell: cell.xor(True))
}
```

??? quote "Stub code in `ExperimentalCell.sdsstub`"

    ```sds linenums="66"
    @Pure
    fun xor(
        other: union<Boolean, ExperimentalCell<Boolean>>
    ) -> result: ExperimentalCell<Boolean>
    ```
