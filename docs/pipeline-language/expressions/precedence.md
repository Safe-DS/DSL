# Precedence

We all know that `#!sds 2 + 3 * 7` is `#!sds 23` and not `#!sds 35`. The reason is that the `#!sds *` operator has a higher precedence than the `#!sds +` operator and is, therefore, evaluated first. These precedence rules are necessary for all types of expressions listed above and shown in the following list. The higher up an expression is in the list, the higher its precedence and the earlier it is evaluated. Expressions listed beside each other have the same precedence and are evaluated from left to right:

- **HIGHER PRECEDENCE**
- `#!sds ()` (parentheses around an expression)
- `#!sds 1` ([integer literals][int-literals]), `#!sds 1.0` ([float literals][float-literals]), `#!sds "a"` ([string literals][string-literals]), `#!sds true`/`false` ([boolean literals][boolean-literals]), `#!sds null` ([null literal][null-literal]), `#!sds someName` ([references][references]), `#!sds "age: {{ age }}"` ([template strings][template-strings])
- `#!sds ()` ([calls][calls]), `#!sds ?()` ([null-safe calls][null-safe-calls]), `#!sds .` ([member accesses][member-accesses]), `#!sds ?.` ([null-safe member accesses][null-safe-member-accesses]), `#!sds []` ([indexed accesses][indexed-accesses]), `#!sds ?[]` ([null-safe indexed accesses][null-safe-indexed-accesses])
- `#!sds -` (unary, [arithmetic negations][operations-on-numbers])
- `#!sds ?:` ([Elvis operators][elvis-operator])
- `#!sds *`, `#!sds /` ([multiplicative operators][operations-on-numbers])
- `#!sds +`, `#!sds -` (binary, [additive operators][operations-on-numbers])
- `#!sds <`, `#!sds <=`, `#!sds >=`, `#!sds >` ([comparison operators][operations-on-numbers])
- `#!sds ===`, `#!sds ==`, `#!sds !==`, `#!sds !=` ([equality operators][equality-checks])
- `#!sds not` ([logical negations][logical-operations])
- `#!sds and` ([conjunctions][logical-operations])
- `#!sds or` ([disjunctions][logical-operations])
- `#!sds () -> 1` ([expression lambdas][expression-lambdas]), `#!sds () {}` ([block lambdas][block-lambdas]), `#!sds as` ([type casts][type-casts])
- **LOWER PRECEDENCE**

If the default precedence of operators is not sufficient, parentheses can be used to force a part of an expression to be evaluated first.

[segments]: ../segments.md
[calls]: calls.md#calls
[int-literals]: literals.md#int-literals
[float-literals]: literals.md#float-literals
[string-literals]: literals.md#string-literals
[boolean-literals]: literals.md#boolean-literals
[null-literals]: literals.md#sds-null-literal
[logical-operations]: operations.md#logical-operations
[block-lambdas]: lambdas.md#block-lambdas
[expression-lambdas]: lambdas.md#expression-lambdas
[elvis-operator]: operations.md#elvis-operator
[equality-checks]: operations.md#equality-checks
[operations-on-numbers]: operations.md#operations-on-numbers
[type-casts]: type-casts.md
[template-strings]: template-strings.md
[null-safe-calls]: calls.md#null-safe-calls
[null-safe-member-accesses]: member-accesses.md#null-safe-member-accesses
[null-safe-indexed-accesses]: indexed-accesses.md#null-safe-indexed-accesses
[references]: references.md
[member-accesses]: member-accesses.md
[indexed-accesses]: indexed-accesses.md
[null-literal]: literals.md#sds-null-literal
