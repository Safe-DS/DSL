# Template Strings

[String literals][string-literals] can only be used to denote a fixed string. Sometimes, however, parts of the string have to be computed and then interpolated into the remaining text. This is done with template strings. Here is an example:

```sds
"1 + 2 = {{ 1 + 2 }}"
```

The syntax for template strings is similar to [string literals][string-literals]: They are also delimited by double quotes, the text can contain escape sequences, and raw newlines can be inserted. The additional syntax are _template expressions_, which are any expression enclosed by `#!sds {{` and `#!sds }}`. There must be no space between the curly braces.

These template expressions are evaluated, converted to a string and inserted into the template string at their position. The template string in the example above is, hence, equivalent to the [string literal][string-literals] `#!sds "1 + 2 = 3"`.


[string-literals]: literals.md#string-literals
