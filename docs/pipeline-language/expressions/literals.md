# Literals

Literals are the basic building blocks of expressions. They describe a fixed, constant value.

## Int Literals

Int literals denote integers. They use the expected syntax. For example, the integer three is written as `#!sds 3`.

## Float Literals

Float literals denote floating point numbers. There are two ways to specify them:

- **Decimal form**: One half can be written as `#!sds 0.5`. Note that neither the integer part nor the decimal part can be omitted, so `#!sds .5` and `#!sds 0.` are syntax errors.
- **Scientific notation**: Writing very large or very small numbers in decimal notation can be cumbersome. In those cases, [scientific notation](https://en.wikipedia.org/wiki/Scientific_notation) is helpful. For example, one thousandth can be written in Safe-DS as `#!sds 1.0e-3` or `#!sds 1.0E-3`. You can read this as `#!sds 1.0 × 10⁻³`. When scientific notation is used, it is allowed to omit the decimal part, so this can be shortened to `#!sds 1e-3` or `#!sds 1E-3`.

## String Literals

String literals describe text. Their syntax is simply text enclosed by double quotes: `#!sds "Hello, world!"`. Various special characters can be denoted with _escape sequences_:

| Escape sequence | Meaning                                                             |
|-----------------|---------------------------------------------------------------------|
| `\b`            | Backspace                                                           |
| `\f`            | Form feed                                                           |
| `\n`            | New line                                                            |
| `\r`            | Carriage return                                                     |
| `\t`            | Tab                                                                 |
| `\v`            | Vertical tab                                                        |
| `\0`            | Null character                                                      |
| `\'`            | Single quote                                                        |
| `\"`            | Double quote                                                        |
| `\{`            | Opening curly brace (used for [template strings][template-strings]) |
| `\\`            | Backslash                                                           |
| `\uXXXX`        | Unicode character, where `XXXX` is its hexadecimal code             |

String literals can contain also contain raw line breaks:

```sds
"Hello,

world!"
```

In order to interpolate text with other computed values, use [template strings][template-strings].

## Boolean Literals

To work with truthiness, Safe-DS has the two boolean literals `#!sds false` and `#!sds true`.

## `#!sds null` Literal

To denote that a value is unknown or absent, use the literal `#!sds null`.


[template-strings]: ../expressions/template-strings.md
