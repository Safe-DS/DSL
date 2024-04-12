# Packages

_Packages_ are used to prevent conflicts when multiple files have declarations with the same name. They accomplish this by grouping all declarations in a file into a namespace. Here is an example for a package declaration:

```sds
package de.unibonn.speedPrediction
```

It has these syntactic elements:

- The keyword `#!sds package`.
- The name of the package, which consists of multiple _segments_ separated by dots. Each segment can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds lowerCamelCase` for all segments. We also recommend to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation) for the package name.

Multiple files can belong to the same package but each non-empty file must declare its package before any [import][imports] or declarations. Moreover, within the same package the names of declarations must be unique.

Continue with the explanation of [imports][imports] to understand how to access declarations that are defined in other packages.

[imports]: imports.md
