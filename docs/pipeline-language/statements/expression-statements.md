# Expression Statements

Expression statements are used to evaluate an [expression][expressions] exactly once. The results of this expression are ignored. Therefore, expression statements are only useful if the expression has side effects. The following snippet demonstrates this by [calling][calls] the `#!sds toCsvFile` function that writes a `Table` to a CSV file:

```sds
Table({"demo": [1, 2]}).toCsvFile("demo.csv");
```

As we can see here, an expression statement has the following syntactic elements:

- The [expression][expressions] to evaluate.
- A semicolon at the end.


[calls]: ../expressions/calls.md#calls
[expressions]: ../expressions/README.md
[pipelines]: ../pipelines.md
