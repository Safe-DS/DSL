# Assignments

An assignment evaluates an [expression][expressions], its _right-hand side_, exactly once. This is identical to [expression statements][expression-statements]. However, the results of this expression can then either be [assigned to placeholders](#declaring-placeholders), [assigned to results](#yielding-results), or [ignored](#ignoring-results).

## Declaring Placeholders

Placeholders are used to provide a name for a fixed value. This later allows us to use this value without recomputing it. In line with those semantics, placeholders must be given a value exactly once: They must be given a value directly when they are declared and that value cannot be changed afterwards (immutability).

The next snippet shows how the singular result of an expression (the integer `#!sds 1`) can be assigned to a placeholder called `#!sds one`:

```sds
val one = 1;
```

This assignment to a placeholder has the following syntactic elements:

- The keyword `#!sds val`, which indicates that we want to declare a placeholder.
- The name of the placeholder, here `#!sds one`. This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest using `#!sds lowerCamelCase` for the names of placeholders.
- An `#!sds =` sign.
- The expression to evaluate (right-hand side).
- A semicolon at the end.

### References to Placeholder

We can access the value of a placeholder in any statement that follows the assignment of that placeholder in the closest containing [pipeline][pipelines], [segment][segments], or [block lambda][block-lambdas] using a [reference][references]. Here is a basic example, where we print the value of the `#!sds one` placeholder (here `#!sds 1`) to the console:

```sds
segment loadMovieRatingsSample(nInstances: Int) {
    val one = 1;
    print(one);
}
```

More information about references can be found in the [linked document][references].

## Yielding Results

In addition to the [declaration of placeholders](#declaring-placeholders), assignments are used to assign a value to a [result of a segment](#yielding-results-of-segments) or declare [results of a block lambda](#declare-results-of-block-lambdas).

### Yielding Results of Segments

The following snippet shows how we can assign a value to a declared [result][results] of a [segment][segments]:

```sds
segment trulyRandomInt() -> result: Int {
    yield result = 1;
}
```

The assignment here has the following syntactic elements:

- The keyword `#!sds yield`, which indicates that we want to assign to a result.
- The name of the result, here `#!sds greeting`. This must be identical to one of the names of a declared result in the header of the segment.
- An `#!sds =` sign.
- The expression to evaluate (right-hand side).
- A semicolon at the end.

### Declare Results of Block Lambdas

Similar syntax is used to yield results of [block lambdas][block-lambdas]. The difference to segments is that block lambdas do not declare their results in their header. Instead the results are declared within the assignments, just like [placeholders](#declaring-placeholders). The block lambda in the following snippet has a single result called `#!sds greeting`, which gets the value `#!sds "Hello, world!"`:

```sds
() -> {
    yield greeting = "Hello, world!";
}
```

The assignment here has the following syntactic elements:

- The keyword `#!sds yield`, which indicates that we want to declare a result.
- The name of the result, here `#!sds result`. This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest using `#!sds lowerCamelCase` for the names of results.
- An `#!sds =` sign.
- The expression to evaluate (right-hand side).
- A semicolon at the end.

## Ignoring Results

In case we want to ignore a result of the expression on the right-hand side of the assignment we can inserting an underscore (called _wildcard_). The following snippet is equivalent to the [expression statement][expression-statements] `#!sds 1;`:

```sds
_ = 1;
```

## Multiple Assignees

So far, the left-hand side of the assignment always had a single assignee. However, when the right-hand side of the assignment produces more than one value, it is possible to freely decide for each value whether it should be [assigned to a placeholder](#declaring-placeholders), [yielded](#yielding-results) or [ignored](#ignoring-results).

For example, the `#!sds split` method in the next example splits a large dataset into two datasets according to a given ratio. We then ignore the first dataset using a [wildcard](#ignoring-results) and [assign the second result to a placeholder](#declaring-placeholders) called `#!sds trainingDataset`. Afterwards, we train a `#!sds DecisionTree` using the `#!sds trainingDataset` and yield the trained model as a result:

```sds
segment createModel(fullDataset: Dataset) -> trainedModel: Model {
    _, val trainingDataset = fullDataset.split(0.2);
    yield trainedModel = DecisionTree().fit(trainingDataset);
}
```

Let us sum up the complete syntax of an assignment:

- A comma-separated list of assignees, possibly with a trailing comma (left-hand side). Each entry is one of
    - [Placeholder](#declaring-placeholders)
    - [Yield](#yielding-results)
    - [Wildcard](#ignoring-results)
- An `#!sds =` sign.
- The expression to evaluate (right-hand side).
- A semicolon at the end.

**There must be at most as many assignees on the left-hand side as the right-hand side has results.** For everything but calls this means only a single assignee can be specified. For calls it depends on the number of declared [results][results] of the callee.

Assignment happens by index, so the first result is assigned to the first assignee, the second result is assigned to the second assignee, and so forth. If there are more results than assignees, any trailing results are implicitly ignored.

[expression-statements]: expression-statements.md
[results]: ../segments.md#results
[stub-language]: ../../stub-language/README.md
[pipeline-language]: ../README.md
[expressions]: ../expressions/README.md
[block-lambdas]: ../expressions/lambdas.md#block-lambdas
[calls]: ../expressions/calls.md#calls
[references]: ../expressions/references.md#references
[segments]: ../segments.md
[pipelines]: ../pipelines.md