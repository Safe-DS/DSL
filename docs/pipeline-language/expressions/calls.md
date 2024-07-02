# Calls

Calls are used to trigger the execution of a specific action, which can, for example, be the creation of an instance of a [class][classes] or executing the code in a [segment][segments]. Let's look at an example:

First, we show the code of the [segment][segments] that we want to call.

```sds
segment createDecisionTree(maxDepth: Int = 10) {
    // ... do something ...
}
```

This [segment][segments] has a single [parameter][parameters] `#!sds maxDepth`, which must have [type][types] `#!sds Int`, and has the default value `#!sds 10`. Since it has a default value, we are not required to specify a value when we call this [segment][segments]. The most basic legal call of the [segment][segments] is, thus, this:

```sds
createDecisionTree()
```

This calls the [segment][segments] `#!sds createDecisionTree`, using the default `#!sds maxDepth` of `#!sds 10`.

The syntax consists of these elements:

- The _callee_ of the call, which is the expression to call (here a [reference][references] to the [segment][segments] `#!sds createDecisionTree`)
- The list of arguments, which is delimited by parentheses. In this case the list is empty, so no arguments are passed.

If we want to override the default value of an optional [parameter][parameters] or if the callee has required [parameters][parameters], we need to pass arguments. We can either use _positional arguments_ or _named arguments_.

In the case of positional arguments, they are mapped to parameters by position, i.e. the first argument is assigned to the first parameter, the second argument is assigned to the second parameter and so forth. We do this in the following example to set `#!sds maxDepth` to 5:

```sds
createDecisionTree(5)
```

The syntax for positional argument is simply the expression we want to pass as value.

Named arguments, however, are mapped to parameters by name. On the one hand, this can improve readability of the code, since the meaning of a value becomes obvious. On the other hand, it allows to override only specific optional parameters and keep the rest unchanged. Here is how to set `#!sds maxDepth` to 5 using a named argument:

```sds
createDecisionTree(maxDepth = 5)
```

These are the syntactic elements:

- The name of the parameter for which we want to specify a value.
- An equals sign.
- The value to assign to the parameter.

## Passing Multiple Arguments

We now add another parameter to the `#!sds createDecisionTree` [segment][segments]:

```sds
segment createDecisionTree(isBinary: Boolean, maxDepth: Int = 10) {
    // ... do something ...
}
```

This allows us to show how multiple arguments can be passed:

```sds
createDecisionTree(isBinary = true, maxDepth = 5)
```

We have already seen the syntax for a single argument. If we want to pass multiple arguments, we just separate them by commas. A trailing comma is allowed.

## Restrictions For Arguments

There are some restriction regarding the choice of positional vs. named arguments and passing arguments in general:

- For all [parameters][parameters] of the callee there must be at most one argument.
- For all [required parameters][required-parameters] there must be exactly one argument.
- After a named argument all arguments must be named.

## Legal Callees

Depending on the callee, a call can do different things. The following table lists all legal callees and what happens if they are called:

| Callee                                           | Meaning                                                                                                                        |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [Class][classes]                                 | Create a new instance of the class. The class must have a constructor to be callable. The call evaluates to this new instance. |
| [Enum Variant][enum-variants]                    | Creates a new instance of the enum variant. Enum variants are always callable. The call evaluates to this new instance.        |
| [Global Function][global-functions]              | Invokes the function and runs the associated Python code. The call evaluates to the result record of the function.             |
| [Method][methods]                                | Invokes the method and runs the associated Python code. The call evaluates to the result record of the method.                 |
| [Segment][segments]                              | Invokes the segment and runs the Safe-DS code in its body. The call evaluates to the result record of the segment.             |
| [Block Lambda][block-lambdas]                    | Invokes the lambda and runs the Safe-DS code in its body. The call evaluates to the result record of the lambda.               |
| [Expression Lambda][expression-lambdas]          | Invokes the lambda and runs the Safe-DS code in its body. The call evaluates to the result record of the lambda.               |
| Declaration with [Callable Type][callable-types] | Call whatever the value of the declaration is.                                                                                 |

### Result Record

The term _result record_ warrants further explanation: A result record maps [results][results] of a

- [global function][global-functions],
- [method][methods],
- [segment][segments], or
- [lambda][lambdas]

to their computed values.

If the result record only has a single entry, its value can be accessed directly. Otherwise, the result record must be _deconstructed_ either by an [assignment][assignment-multiple-assignees] (can access multiple results) or by a [member access][member-accesses-of-results] (can access a single result).

## Null-Safe Calls

If an expression can be `#!sds null`, it cannot be used as the callee of a normal call. Instead, a null-safe call must be used. A null-safe call evaluates to `#!sds null` if its callee is `#!sds null`. Otherwise, it works just like a normal call. This is particularly useful for [chaining][chaining].

The syntax is identical to a normal call except that we replace the `#!sds ()` with `#!sds ?()`:

```sds
nullableCallee?()
```


[parameters]: ../segments.md#parameters
[required-parameters]: ../segments.md#required-parameters
[results]: ../segments.md#results
[types]: ../types.md
[callable-types]: ../types.md#callable-types
[classes]: ../../stub-language/classes.md
[methods]: ../../stub-language/classes.md#defining-methods
[enum-variants]: ../../stub-language/enumerations.md#enum-variants
[global-functions]: ../../stub-language/global-functions.md
[assignment-multiple-assignees]: ../statements/assignments.md#multiple-assignees
[assignments-to-segment-results]: ../statements/assignments.md#yielding-results-of-segments
[assignments-to-block-lambda-results]: ../statements/assignments.md#declare-results-of-block-lambdas
[placeholders]: ../statements/assignments.md#declaring-placeholders
[segments]: ../segments.md
[segment-body]: ../segments.md#statements
[references]: references.md
[lambdas]: lambdas.md
[block-lambdas]: lambdas.md#block-lambdas
[expression-lambdas]: lambdas.md#expression-lambdas
[member-accesses-of-results]: member-accesses.md#member-access-of-results
[chaining]: chaining.md
