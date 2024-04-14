# Packages

_Packages_ prevent conflicts when multiple files have declarations with the same name. They accomplish this by grouping
all declarations in a file into a namespace. All Safe-DS programs must declare their package at the beginning of the
file. Here is an example:

```sds
package com.safeds.titanic
```

It has these syntactic elements:

- The keyword `#!sds package`.
- The name of the package. It consists of multiple _parts_ separated by dots. Each part can be any combination of lower-
  and uppercase letters, underscores, and numbers, as long as it does not start with a number.

??? info "Name convention"

    - Use `#!sds lowerCamelCase` for all parts.
    - Use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation) for the package
      name.

Multiple files can belong to the same package. However, within the same package the names of declarations must be
unique.
