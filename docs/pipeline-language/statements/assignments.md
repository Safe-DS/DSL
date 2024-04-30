# Assignments

An assignment evaluates an [expression][expressions], its _right-hand side_, and stores results in
[placeholders](#placeholders). This allows reusing the results multiple times without having to recompute them or
repeat complicated expressions.

## Placeholders

Placeholders are used to provide a name for a fixed value. In line with those semantics, placeholders must be given a
value exactly once: They must be given a value directly when they are declared and that value cannot be changed
afterward (_immutability_).

!!! warning "Placeholder ≠ Variable"
    Placeholders are not the same as variables in other programming languages. They are immutable, meaning that their
    value cannot be changed later.

The next snippet shows how the singular result of an expression (the loaded
[`Table`][safeds.data.tabular.containers.Table]) can be assigned to a placeholder called `titanic`:

```sds
val titanic = Table.fromCsvFile("titanic.csv");
```

This assignment to a placeholder has the following syntactic elements:

- The keyword `#!sds val`, which indicates that we want to declare a placeholder.
- The name of the placeholder, here `titanic`. It can be any combination of lower- and uppercase letters, underscores,
  and numbers, as long as it does not start with a number.
- An `#!sds =` sign.
- The expression to evaluate (right-hand side).
- A semicolon at the end.

??? info "Name convention"

    Use `#!sds lowerCamelCase` for the name of the placeholder.

### References to Placeholder

We can access the value of a placeholder in statements that follow its assignment by using the placeholder's name. This
is called a [_reference_][references]. Here is a basic example, where we
[`slice`][safeds.data.tabular.containers.Table.sliceRows] the `titanic` table to get the first five rows. We then store
the result of that [call][calls] in another placeholder called `head`:

```sds hl_lines="2"
val titanic = Table.fromCsvFile("titanic.csv");
val head = titanic.sliceRows(end = 5);
```

More information about references can be found in the [dedicated document][references].

### Assigning Multiple Placeholders

Some [calls][calls] return multiple results. In such cases, we can assign each result to a separate placeholder. For
example, the [`splitRows`][safeds.data.tabular.containers.Table.splitRows] method in the next example splits a table
into two tables according to a given ratio. We assign the two results to the placeholders `training` and `validation`:

```sds
val training, val validation = titanic.splitRows(0.8);
```

The placeholder declarations are separated by commas. Note, that the keyword `#!sds val` is repeated for each
declaration.

There must be at most as many placeholder declarations on the left-hand side as the right-hand side has results.
Assignment happens by index, so the first result is assigned to the first placeholder, the second result is assigned to
the second one, and so forth. If there are more results than placeholders, any trailing results are implicitly ignored.

### Inspecting Placeholder Values in VS Code

Inspecting placeholder values requires a working installation of the [Safe-DS Runner][runner]. Follow the instructions
in the [installation guide][installation] to install it. Afterward, you can inspect values of various types via
so-called _code lenses_ in the editor:

![Explore Table](../../img/pipeline-language/code-lens-explore-table-dark.png#only-dark)
![Explore Table](../../img/pipeline-language/code-lens-explore-table-light.png#only-light)

- **Tabular data** can be inspected using the `Explore <placeholder name>` code lens. It opens the table in a separate
  view.
- **Images** can be inspected using the `Show <placeholder name>` code lens. It opens the image in an image viewer.
- **Primitive data** (e.g. `Int`, `Float`, `String`, etc.) can be inspected using the `Print <placeholder name>` code
  lens. It shows the value in the output panel.

!!! tip "Efficiency"

    When you inspect a placeholder, only the part of your pipeline, which is necessary to compute the value of the
    placeholder, is executed. There is no need to comment out other parts of your pipeline.

## Wildcards

In case we want to ignore a result of the right-hand side, we can insert an underscore (called a _wildcard_). In the
next example, we ignore the first result of [`splitRows`][safeds.data.tabular.containers.Table.splitRows]:

```sds
_, val validation = titanic.splitRows(0.8);
```

Ignoring all results is equivalent to an [expression statement][expression-statements], which should be used instead in
such cases.


[calls]: ../expressions/calls.md#calls
[expressions]: ../expressions/README.md
[expression-statements]: expression-statements.md
[installation]: ../../getting-started/installation.md
[references]: ../expressions/references.md#references
[runner]: https://github.com/Safe-DS/Runner
[results]: ../segments.md#results
