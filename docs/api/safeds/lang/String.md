---
search:
  boost: 0.5
---

# `#!sds abstract class` String {#safeds.lang.String data-toc-label='String'}

Some text.

**Examples:**

```sds
pipeline example {
    val string = "Hello, world!";
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="221"
    class String {

        /**
         * Return the number of characters in the string.
         *
         * @example
         * pipeline example {
         *     val length = "Hello, world!".length(); // 13
         * }
         */
        @Pure
        @PythonMacro("len($this)")
        fun length() -> length: Int

        /**
         * Check if the string contains the substring.
         *
         * @example
         * pipeline example {
         *     val contains = "Hello, world!".contains("world!"); // true
         * }
         */
        @Pure
        @PythonMacro("$this.__contains__($substring)")
        fun contains(substring: String) -> contains: Boolean

        /**
         * Check if the string ends with the suffix.
         *
         * @example
         * pipeline example {
         *     val endsWith = "Hello, world!".endsWith("world!"); // true
         * }
         */
        @Pure
        @PythonMacro("$this.endswith($suffix)")
        fun endsWith(suffix: String) -> endsWith: Boolean

        /**
         * Check if the string starts with the prefix.
         *
         * @example
         * pipeline example {
         *     val startsWith = "Hello, world!".startsWith("Hello"); // true
         * }
         */
        @Pure
        @PythonMacro("$this.startswith($prefix)")
        fun startsWith(prefix: String) -> startsWith: Boolean

        /**
         * Return the substring of the string starting at the start index up to but excluding the end index.
         *
         * @param start The start index (inclusive).
         * @param end The end index (exclusive).
         *
         * @example
         * pipeline example {
         *     val substring = "Hello, world!".substring(7, 12); // "world"
         * }
         */
        @Pure
        @PythonMacro("$this[$start:$end]")
        fun substring(start: Int = 0, end: Int = this.length()) -> substring: String

        /**
         * Return the index of the first occurrence of the substring in the string or -1 if the substring is not found.
         *
         * @example
         * pipeline example {
         *     val index = "Hello, world!".indexOf("o"); // 4
         * }
         */
        @Pure
        @PythonMacro("$this.find($substring)")
        fun indexOf(substring: String) -> index: Int

        /**
         * Return the index of the last occurrence of the substring in the string or -1 if the substring is not found.
         *
         * @example
         * pipeline example {
         *     val index = "Hello, world!".lastIndexOf("o"); // 8
         * }
         */
        @Pure
        @PythonMacro("$this.rfind($substring)")
        fun lastIndexOf(substring: String) -> index: Int

        /**
         * Replace all occurrences of the old substring with the new substring.
         *
         * @example
         * pipeline example {
         *     val replacedString = "Hello, world!".replace("world", "Safe-DS"); // "Hello, Safe-DS!"
         * }
         */
        @Pure
        @PythonMacro("$this.replace($old, $new)")
        fun replace(old: String, new: String) -> replacedString: String

        /**
         * Repeat the string n times.
         *
         * @example
         * pipeline example {
         *     val repeatedString = "Ha".repeat(3); // "HaHaHa"
         * }
         */
        @Pure
        @PythonMacro("$this * $n")
        fun repeat(n: Int) -> repeatedString: String

        /**
         * Split the string into parts using the separator.
         *
         * @example
         * pipeline example {
         *     val parts = "a,b,c".split(","); // ["a", "b", "c"]
         * }
         */
        @Pure
        @PythonMacro("$this.split($separator)")
        fun split(separator: String) -> parts: List<String>

        /**
         * Trim leading and trailing whitespace from the string.
         *
         * @example
         * pipeline example {
         *     val trimmed = "  Hello, world!  ".trim(); // "Hello, world!"
         * }
         */
        @Pure
        @PythonMacro("$this.strip()")
        fun trim() -> trimmed: String

        /**
         * Trim leading whitespace from the string.
         *
         * @example
         * pipeline example {
         *     val trimmed = "  Hello, world!  ".trimStart(); // "Hello, world!  "
         * }
         */
        @Pure
        @PythonMacro("$this.lstrip()")
        fun trimStart() -> trimmed: String

        /**
         * Trim trailing whitespace from the string.
         *
         * @example
         * pipeline example {
         *     val trimmed = "  Hello, world!  ".trimEnd(); // "  Hello, world!"
         * }
         */
        @Pure
        @PythonMacro("$this.rstrip()")
        fun trimEnd() -> trimmed: String

        /**
         * Normalize the casing of a string to make it suitable for case-insensitive matching. This is essentially a more
         * aggressive form of lowercasing. For example, the German lowercase letter "ß" gets converted to "ss".
         *
         * Casefolding is described in section 3.13 of the [Unicode Standard](https://www.unicode.org/versions/latest/).
         *
         * @example
         * pipeline example {
         *     val casefolded = "Hello, world!".toCasefolded(); // "hello, world!"
         * }
         *
         * @example
         * pipeline example {
         *     val casefolded = "Poststraße".toCasefolded(); // "poststrasse"
         * }
         */
        @Pure
        @PythonMacro("$this.casefold()")
        fun toCasefolded() -> casefolded: String

        /**
         * Convert the string to lowercase. Prefer {@link String.toCasefolded} for case-insensitive matching.
         *
         * Lowercasing is described in section 3.13 of the [Unicode Standard](https://www.unicode.org/versions/latest/).
         *
         * @example
         * pipeline example {
         *     val lowercase = "Hello, world!".toLowercase(); // "hello, world!"
         * }
         *
         * @example
         * pipeline example {
         *     val lowercase = "Poststraße".toLowercase(); // "poststraße"
         * }
         */
        @Pure
        @PythonMacro("$this.lower()")
        fun toLowercase() -> lowercase: String

        /**
         * Convert the string to uppercase. Prefer {@link String.toCasefolded} for case-insensitive matching.
         *
         * Uppercasing is described in section 3.13 of the [Unicode Standard](https://www.unicode.org/versions/latest/).
         *
         * @example
         * pipeline example {
         *     val uppercase = "Hello, world!".toUppercase(); // "HELLO, WORLD!"
         * }
         *
         * @example
         * pipeline example {
         *     val uppercase = "Poststraße".toUppercase(); // "POSTSTRASSE"
         * }
         */
        @Pure
        @PythonMacro("$this.upper()")
        fun toUppercase() -> uppercase: String

        /**
         * Parse the string to a floating-point number.
         *
         * @example
         * pipeline example {
         *     val float = "1.0".toFloat(); // 1.0
         * }
         */
        @Pure
        @PythonMacro("float($this)")
        fun toFloat() -> float: Float

        /**
         * Parse the string to an integer.
         *
         * @param base The base of the integer.
         *
         * @example
         * pipeline example {
         *     val int = "10".toInt(); // 10
         * }
         *
         * @example
         * pipeline example {
         *     val int = "10".toInt(base = 2); // 2
         * }
         */
        @Pure
        @PythonMacro("int($this, $base)")
        fun toInt(base: Int = 10) -> int: Int
    }
    ```

## `#!sds fun` contains {#safeds.lang.String.contains data-toc-label='contains'}

Check if the string contains the substring.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `substring` | [`String`][safeds.lang.String] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `contains` | [`Boolean`][safeds.lang.Boolean] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val contains = "Hello, world!".contains("world!"); // true
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="243"
    @Pure
    @PythonMacro("$this.__contains__($substring)")
    fun contains(substring: String) -> contains: Boolean
    ```

## `#!sds fun` endsWith {#safeds.lang.String.endsWith data-toc-label='endsWith'}

Check if the string ends with the suffix.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `suffix` | [`String`][safeds.lang.String] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `endsWith` | [`Boolean`][safeds.lang.Boolean] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val endsWith = "Hello, world!".endsWith("world!"); // true
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="255"
    @Pure
    @PythonMacro("$this.endswith($suffix)")
    fun endsWith(suffix: String) -> endsWith: Boolean
    ```

## `#!sds fun` indexOf {#safeds.lang.String.indexOf data-toc-label='indexOf'}

Return the index of the first occurrence of the substring in the string or -1 if the substring is not found.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `substring` | [`String`][safeds.lang.String] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `index` | [`Int`][safeds.lang.Int] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val index = "Hello, world!".indexOf("o"); // 4
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="294"
    @Pure
    @PythonMacro("$this.find($substring)")
    fun indexOf(substring: String) -> index: Int
    ```

## `#!sds fun` lastIndexOf {#safeds.lang.String.lastIndexOf data-toc-label='lastIndexOf'}

Return the index of the last occurrence of the substring in the string or -1 if the substring is not found.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `substring` | [`String`][safeds.lang.String] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `index` | [`Int`][safeds.lang.Int] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val index = "Hello, world!".lastIndexOf("o"); // 8
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="306"
    @Pure
    @PythonMacro("$this.rfind($substring)")
    fun lastIndexOf(substring: String) -> index: Int
    ```

## `#!sds fun` length {#safeds.lang.String.length data-toc-label='length'}

Return the number of characters in the string.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `length` | [`Int`][safeds.lang.Int] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val length = "Hello, world!".length(); // 13
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="231"
    @Pure
    @PythonMacro("len($this)")
    fun length() -> length: Int
    ```

## `#!sds fun` repeat {#safeds.lang.String.repeat data-toc-label='repeat'}

Repeat the string n times.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `n` | [`Int`][safeds.lang.Int] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `repeatedString` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val repeatedString = "Ha".repeat(3); // "HaHaHa"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="330"
    @Pure
    @PythonMacro("$this * $n")
    fun repeat(n: Int) -> repeatedString: String
    ```

## `#!sds fun` replace {#safeds.lang.String.replace data-toc-label='replace'}

Replace all occurrences of the old substring with the new substring.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `old` | [`String`][safeds.lang.String] | - | - |
| `new` | [`String`][safeds.lang.String] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `replacedString` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val replacedString = "Hello, world!".replace("world", "Safe-DS"); // "Hello, Safe-DS!"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="318"
    @Pure
    @PythonMacro("$this.replace($old, $new)")
    fun replace(old: String, new: String) -> replacedString: String
    ```

## `#!sds fun` split {#safeds.lang.String.split data-toc-label='split'}

Split the string into parts using the separator.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `separator` | [`String`][safeds.lang.String] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `parts` | [`List<String>`][safeds.lang.List] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val parts = "a,b,c".split(","); // ["a", "b", "c"]
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="342"
    @Pure
    @PythonMacro("$this.split($separator)")
    fun split(separator: String) -> parts: List<String>
    ```

## `#!sds fun` startsWith {#safeds.lang.String.startsWith data-toc-label='startsWith'}

Check if the string starts with the prefix.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `prefix` | [`String`][safeds.lang.String] | - | - |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `startsWith` | [`Boolean`][safeds.lang.Boolean] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val startsWith = "Hello, world!".startsWith("Hello"); // true
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="267"
    @Pure
    @PythonMacro("$this.startswith($prefix)")
    fun startsWith(prefix: String) -> startsWith: Boolean
    ```

## `#!sds fun` substring {#safeds.lang.String.substring data-toc-label='substring'}

Return the substring of the string starting at the start index up to but excluding the end index.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `start` | [`Int`][safeds.lang.Int] | The start index (inclusive). | `#!sds 0` |
| `end` | [`Int`][safeds.lang.Int] | The end index (exclusive). | `#!sds this.length()` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `substring` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val substring = "Hello, world!".substring(7, 12); // "world"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="282"
    @Pure
    @PythonMacro("$this[$start:$end]")
    fun substring(start: Int = 0, end: Int = this.length()) -> substring: String
    ```

## `#!sds fun` toCasefolded {#safeds.lang.String.toCasefolded data-toc-label='toCasefolded'}

Normalize the casing of a string to make it suitable for case-insensitive matching. This is essentially a more
aggressive form of lowercasing. For example, the German lowercase letter "ß" gets converted to "ss".

Casefolding is described in section 3.13 of the [Unicode Standard](https://www.unicode.org/versions/latest/).

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `casefolded` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val casefolded = "Hello, world!".toCasefolded(); // "hello, world!"
}
```
```sds hl_lines="2"
pipeline example {
    val casefolded = "Poststraße".toCasefolded(); // "poststrasse"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="398"
    @Pure
    @PythonMacro("$this.casefold()")
    fun toCasefolded() -> casefolded: String
    ```

## `#!sds fun` toFloat {#safeds.lang.String.toFloat data-toc-label='toFloat'}

Parse the string to a floating-point number.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `float` | [`Float`][safeds.lang.Float] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val float = "1.0".toFloat(); // 1.0
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="448"
    @Pure
    @PythonMacro("float($this)")
    fun toFloat() -> float: Float
    ```

## `#!sds fun` toInt {#safeds.lang.String.toInt data-toc-label='toInt'}

Parse the string to an integer.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `base` | [`Int`][safeds.lang.Int] | The base of the integer. | `#!sds 10` |

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `int` | [`Int`][safeds.lang.Int] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val int = "10".toInt(); // 10
}
```
```sds hl_lines="2"
pipeline example {
    val int = "10".toInt(base = 2); // 2
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="467"
    @Pure
    @PythonMacro("int($this, $base)")
    fun toInt(base: Int = 10) -> int: Int
    ```

## `#!sds fun` toLowercase {#safeds.lang.String.toLowercase data-toc-label='toLowercase'}

Convert the string to lowercase. Prefer [String.toCasefolded][safeds.lang.String.toCasefolded] for case-insensitive matching.

Lowercasing is described in section 3.13 of the [Unicode Standard](https://www.unicode.org/versions/latest/).

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `lowercase` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val lowercase = "Hello, world!".toLowercase(); // "hello, world!"
}
```
```sds hl_lines="2"
pipeline example {
    val lowercase = "Poststraße".toLowercase(); // "poststraße"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="417"
    @Pure
    @PythonMacro("$this.lower()")
    fun toLowercase() -> lowercase: String
    ```

## `#!sds fun` toUppercase {#safeds.lang.String.toUppercase data-toc-label='toUppercase'}

Convert the string to uppercase. Prefer [String.toCasefolded][safeds.lang.String.toCasefolded] for case-insensitive matching.

Uppercasing is described in section 3.13 of the [Unicode Standard](https://www.unicode.org/versions/latest/).

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `uppercase` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val uppercase = "Hello, world!".toUppercase(); // "HELLO, WORLD!"
}
```
```sds hl_lines="2"
pipeline example {
    val uppercase = "Poststraße".toUppercase(); // "POSTSTRASSE"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="436"
    @Pure
    @PythonMacro("$this.upper()")
    fun toUppercase() -> uppercase: String
    ```

## `#!sds fun` trim {#safeds.lang.String.trim data-toc-label='trim'}

Trim leading and trailing whitespace from the string.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `trimmed` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val trimmed = "  Hello, world!  ".trim(); // "Hello, world!"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="354"
    @Pure
    @PythonMacro("$this.strip()")
    fun trim() -> trimmed: String
    ```

## `#!sds fun` trimEnd {#safeds.lang.String.trimEnd data-toc-label='trimEnd'}

Trim trailing whitespace from the string.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `trimmed` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val trimmed = "  Hello, world!  ".trimEnd(); // "  Hello, world!"
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="378"
    @Pure
    @PythonMacro("$this.rstrip()")
    fun trimEnd() -> trimmed: String
    ```

## `#!sds fun` trimStart {#safeds.lang.String.trimStart data-toc-label='trimStart'}

Trim leading whitespace from the string.

**Results:**

| Name | Type | Description |
|------|------|-------------|
| `trimmed` | [`String`][safeds.lang.String] | - |

**Examples:**

```sds hl_lines="2"
pipeline example {
    val trimmed = "  Hello, world!  ".trimStart(); // "Hello, world!  "
}
```

??? quote "Stub code in `coreClasses.sdsstub`"

    ```sds linenums="366"
    @Pure
    @PythonMacro("$this.lstrip()")
    fun trimStart() -> trimmed: String
    ```
