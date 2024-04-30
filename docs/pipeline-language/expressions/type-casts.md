## Type Casts

The compiler can _infer_ the [type][types] of an expression in almost all cases. However, sometimes its [type][types]
has to be specified explicitly. This is called a _type cast_. Here is an example:

```sds
dataset.getColumn("age") as Column<Int>
```

A type cast is written as follows:

- The expression to cast.
- The keyword `#!sds as`.
- The [type][types] to cast to.

Type casts are only allowed if the type of the expression is unknown. They cannot be used to override the inferred type
of an expression.


[types]: ../types.md
