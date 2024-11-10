# Statements

Statements are used to run some action. Safe-DS only has three type of statements:

- [Expression statements][expression-statements] evaluate an [expression][expressions] and discard any results. They are
  only useful if the expression has side effects, such as writing to a file.
- [Assignments][assignments] also evaluate an [expression][expressions], but then store results in
  [placeholders][placeholders]. This allows reusing the results multiple times without having to recompute them.
- [Output statements][output-statements] evaluate an [expression][expressions] as well, and provide options to inspect
  its results. Unlike when using assignments, the result cannot be reused.

[assignments]: assignments.md
[expression-statements]: expression-statements.md
[output-statements]: output-statements.md
[expressions]: ../expressions/README.md
[placeholders]: assignments.md#declaring-placeholders
