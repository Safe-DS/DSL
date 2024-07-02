# Results

_Results_ define the outputs of some declaration when it is [called][calls]. Here is an example:

```sds
result: Int
```

Here is a breakdown of the syntax:

- The name of the result (here `#!sds result`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `#!sds Int`).

## Complete Example

Let us now look at a full example of a [segment][segments] called `#!sds doSomething` with two results:

```sds
segment doSomething() -> (result1: Int, result2: Boolean) {
    // ...
}
```

The interesting part is the list of results, which uses the following syntactic elements:

- An arrow `#!sds ->`.
- An opening parenthesis.
- A list of results, the syntax is as described above. They are separated by commas. A trailing commas is permitted.
- A closing parenthesis.

## Shorthand Version: Single Result

In case that the callable produces only a single result, we can omit the parentheses. The following two declarations are, hence, equivalent:

```sds
segment doSomething1() -> (result: Int) {}
```

```sds
segment doSomething2() -> result: Int {}
```

## Shorthand Version: No Results

In case that the callable produces no results, we can usually omit the entire results list. The following two declarations are, hence equivalent:

```sds
segment doSomething1() -> () {}
```

```sds
segment doSomething2() {}
```

The notable exception are [callable types][callable-types], where the result list must always be specified even when it is empty.

## Corresponding Python Code

**Note:** This section is only relevant if you are interested in the [stub language][stub-language].

Results must be ordered the same way in Python as they are in Safe-DS. Moreover, the Safe-DS type of a result should capture the possible values of this result accurately. Ideally, the Python result should also have a matching [type hint][types-python].

Since Python results do not have a name, the names of Safe-DS results can be arbitrary. Naturally, a name should be chosen that captures the purpose of the result.

[stub-language]: README.md
[types]: types.md
[types-python]: types.md#corresponding-python-code
[callable-types]: types.md#callable-types
[segments]: ../pipeline-language/segments.md
[calls]: ../pipeline-language/expressions/calls.md#calls
