# Expression Statements

Expression statements evaluate an [expression][expressions] and discard any results. Therefore, they are only useful if
the expression has side effects, for example if it writes to a file. The following snippet demonstrates this by
[calling][calls] the [`toCsvFile`][safeds.data.tabular.containers.Table.toCsvFile] function that writes a
[`Table`][safeds.data.tabular.containers.Table] to a CSV file:

```sds
Table({"ids": [1, 2, 3]}).toCsvFile("example.csv");
```

An expression statement has the following syntactic elements:

- The [expression][expressions] to evaluate.
- A semicolon at the end.


[calls]: ../expressions/calls.md#calls
[expressions]: ../expressions/README.md
[pipelines]: ../pipelines.md
