# Output Statements

Output statements are used to evaluate an expression and inspect its results. Unlike when using assignments, the results
cannot be reused. However, it is also not necessary to think of unique names for placeholders, which saves time and
keeps the namespace clean.

The next snippet shows how the singular result of an expression (the loaded
[`Table`][safeds.data.tabular.containers.Table]) can be inspected:

```sds
out Table.fromCsvFile("titanic.csv");
```

This output statement has the following syntactic elements:

- The keyword `#!sds out`, which indicates that we want to inspect the results of an expression.
- The expression to evaluate.
- A semicolon at the end.

Inspecting values requires a working installation of the [Safe-DS Runner][runner]. Follow the instructions in the
[installation guide][installation] to install it. Afterward, you can inspect values of various types via
_code lenses_ in the editor, as explained for [assignments][value-inspection].

[installation]: ../../getting-started/installation.md
[runner]: https://github.com/Safe-DS/Runner
[value-inspection]: assignments.md#inspecting-placeholder-values-in-vs-code
