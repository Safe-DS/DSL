# Lambdas

If you want to write reusable blocks of code, use a [segment][segments]. However, sometimes you need to create a highly application-specific callable that can be passed as argument to some function or returned as the result of a [segment][segments]. We will explain this concept by filtering a list. Here are the relevant declarations:

```sds
class IntList {
    fun filter(filterFunction: (element: Int) -> shouldKeep: Boolean) -> filteredList: IntList
}

fun intListOf(elements: List<Int>) -> result: IntList
```

First, we declare a [class][classes] `#!sds IntList`, which has a single [method][methods] called `#!sds filter`. The `#!sds filter` method returns a single result called `#!sds filteredList`, which is a new `#!sds IntList`. `#!sds filteredList` is supposed to only contain the elements of the receiving `#!sds IntList` for which the `#!sds filterFunction` [parameter][parameters] returns `#!sds true`.

Second, we declare a [global function][global-functions] `#!sds intListOf` that is supposed to wrap `#!sds elements` into an `#!sds IntList`.

Say, we now want to keep only the elements in the list that are less than `#!sds 10`. We can do this by declaring a [segment][segments]:

```sds
segment keepLessThan10(a: Int) -> shouldKeep: Boolean {
    yield shouldKeep = a < 10;
}
```

Here is how to solve the task of keeping only elements below `#!sds 10` with this [segment][segments]:

```sds
intListOf(1, 4, 11).filter(keepLessThan10)
```

The [call][calls] to `#!sds intListOf` is just there to create an `#!sds IntList` that we can use for filtering. The interesting part is the argument we pass to the `#!sds filter` [method][methods], which is simply a reference to the [segment][segments] we declared above.

The problem here is that this solution is very cumbersome and verbose. We need to come up with a name for a [segment][segments] that we will likely use only once. Moreover, the segment must declare the [types][types] of its [parameters][parameters] and its [results][results] in its header. Finally, the declaration of the segment has to happen in a separate location then its use. We can solve those issues with lambdas.

## Block Lambdas

We will first rewrite the above solution using a _block lambda_, which is essentially a [segment][segments] without a name and more concise syntax that can be declared where it is needed:

```sds
intListOf(1, 4, 11).filter(
    (a) { yield shouldKeep = a < 10; }
)
```

While this appears longer than the solution with [segments][segments], note that it replaces both the declaration of the [segment][segments] as well as the [reference][references] to it.

Here are the syntactic elements:

- A list of [parameters][parameters], which is enclosed in parentheses. Individual parameters are separated by commas.
- The _body_, which is a list of [statements][statements] enclosed in curly braces. Note that each [statement][statements] is terminated by a semicolon.

The results of a block lambda are [declared in its body using assignments][assignments-to-block-lambda-results].

## Expression Lambdas

Often, the body of a [block lambda](#block-lambdas) only consists of yielding a single result, as is the case in the example above. The syntax of [block lambdas](#block-lambdas) is quite verbose for such a common use-case, which is why Safe-DS has _expression lambdas_ as a shorter but less flexible alternative. Using an expression lambda we can rewrite the example above as

```sds
intListOf(1, 4, 11).filter(
    (a) -> a < 10
)
```

These are the syntactic elements:

- A list of [parameters][parameters], which is enclosed in parentheses. Individual parameters are separated by commas.
- An arrow `#!sds ->`.
- The expression that should be returned.

## Closures

**Note:** This is advanced concept, so feel free to skip this section initially.

Both [block lambdas](#block-lambdas) and [expression lambdas](#expression-lambdas) are closures, which means they remember the values of [placeholders][placeholders] and [parameters][parameters] that can be accessed within their body at the time of their creation. Here is an example:

```sds
segment lazyValue(value: Int) -> result: () -> storedValue: Int {
    yield result = () -> value
}
```

This deserves further explanation: We declare a [segment][segments] `#!sds lazyValue`. It takes a single [required parameter][required-parameters] `#!sds value` with type `#!sds Int`. It produces a single [result][results] called `#!sds result`, which has a [callable type][callable-types] that takes no [parameters] and produces a single [result][results] called `#!sds storedValue` with type `#!sds Int`. In the [body][segment-body] of the [segment][segments] we then [assign][assignments-to-segment-results] an [expression lambda](#expression-lambdas) to the [result][results] `#!sds result`.

The interesting part here is that we [refer to][references] to the [parameter][parameters] `#!sds value` within the expression of the lambda. Since lambdas are closures, this means the current `#!sds value` is stored when the lambda is created. When we later call this lambda, exactly this value is returned.

## Restrictions

At the moment, lambdas can only be used if the context determines the type of its parameters. Concretely, this means we can use lambdas in these two places:

- As an argument that is assigned to a [parameter][parameters] with a [type][types] in a [call][calls].
- As the value that is [assigned to a result of a segment][assignments-to-segment-results].
  In other cases, declare a segment instead and use a [reference][references] to this segment where you would write the lambda.


[parameters]: ../segments.md#parameters
[required-parameters]: ../segments.md#required-parameters
[results]: ../segments.md#results
[types]: ../types.md
[callable-types]: ../types.md#callable-types
[classes]: ../../stub-language/classes.md
[attributes]: ../../stub-language/classes.md#defining-attributes
[methods]: ../../stub-language/classes.md#defining-methods
[enums]: ../../stub-language/enumerations.md
[global-functions]: ../../stub-language/global-functions.md
[statements]: ../statements/README.md
[assignments-to-segment-results]: ../statements/assignments.md#yielding-results-of-segments
[assignments-to-block-lambda-results]: ../statements/assignments.md#declare-results-of-block-lambdas
[placeholders]: ../statements/assignments.md#declaring-placeholders
[segments]: ../segments.md
[segment-body]: ../segments.md#statements
[calls]: calls.md
[references]: references.md
