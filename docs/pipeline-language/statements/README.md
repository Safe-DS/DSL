# Statements

Statements are used to run some action. Safe-DS has only two type of statements:

- [Expression statements][expression-statements] evaluate an [expression][expressions] and discard any results. They are
  only useful if the expression has side effects, such as writing to a file.
- [Assignments][assignments] also evaluate an [expression][expressions], but then store results in
  [placeholders][placeholders]. This allows reusing the results multiple times without having to recompute them.


[assignments]: ./assignments.md
[expression-statements]: ./expression-statements.md
[expressions]: ../expressions/README.md
[placeholders]: ./assignments.md#declaring-placeholders
