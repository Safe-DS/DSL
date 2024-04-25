# Segments

Segments are used to extract a sequence of [statements][statements] from a data science program to give the sequence a name and make it reusable. In the following discussion we explain how to [declare a segment](#declaring-a-segment) and how to [call it](#calling-a-segment).

## Declaring a Segment

### Minimal Example

Let's look at a minimal example of a segment:

```sds
segment loadMovieRatingsSample() {}
```

This declaration of a segment has the following syntactic elements:

- The keyword `#!sds segment`.
- The name of the segment, here `#!sds loadMovieRatingsSample`. This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest using `#!sds lowerCamelCase` for the names of segments.
- The list of parameters (i.e. inputs) of the segment. This is delimited by parentheses. In the example above, the segment has no parameters.
- The _body_ of the segment, which contains the [statements][statements] that should be run when the segment is [called](#calling-a-segment). The body is delimited by curly braces. In this example, the body is empty, so running this segment does nothing.

## Parameters

_Parameters_ define the expected inputs of some declaration that can be [called][calls]. We refer to such declarations as _callables_. We distinguish between

- [required parameters](#required-parameters), which must always be passed, and
- [optional parameters](#optional-parameters), which use a default value if no value is passed explicitly.

### Required Parameters

_Required parameters_ must always be passed when the declaration is [called][calls]. Let us look at an example:

```sds
requiredParameter: Int
```

Here are the pieces of syntax:

- The name of the parameter (here `#!sds requiredParameter`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `#!sds Int`).

### Optional Parameters

_Optional parameters_ have a default value and, thus, need not be passed as an [argument][calls] unless the default value does not fit. Here is an example:

```sds
optionalParameter: Int = 1
```

These are the syntactic elements:

- The name of the parameter (here `#!sds optionalParameter`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `#!sds Int`).
- An equals sign.
- The default value of the parameter (here `#!sds 1`). This must be a constant expression, i.e. something that can be evaluated by the compiler. Particularly [calls][calls] usually do not fulfill this requirement.

### Complete Example

Let us now look at a full example of a [segment][segments] called `#!sds doSomething` with one [required parameter](#required-parameters) and one [optional parameter](#optional-parameters):

```sds
segment doSomething(requiredParameter: Int, optionalParameter: Boolean = false) {
    // ...
}
```

The interesting part is the list of parameters, which uses the following syntactic elements:

- An opening parenthesis.
- A list of parameters, the syntax is as described above. They are separated by commas. A trailing commas is permitted.
- A closing parenthesis.

### Restrictions

Several restrictions apply to the order of parameters and to combinations of the various categories of parameters:

- After an [optional parameter](#optional-parameters) all parameters must be optional.

### Parameters Old

To make a segment configurable, add [parameters][parameters] (inputs). We will first show how to [declare parameters](#parameter-declaration) and afterwards how to [refer to them](#references-to-parameters) in the body of the segment.

#### Parameter Declaration

Parameters must be declared in the header of the segment so [callers](#calling-a-segment) know they are expected to pass them as an argument, and so we can [use them](#references-to-parameters) in the body of the segment.

In the following example, we give the segment a single parameters with name `#!sds nInstances` and [type][types] `#!sds Int`.

```sds
segment loadMovieRatingsSample(nInstances: Int) {}
```

More information about parameters can be found in the [linked document][parameters].

#### References to Parameters

Within the segment we can access the value of a parameter using a [reference][references]. Here is a basic example where we print the value of the `#!sds nInstances` parameter to the console:

```sds
segment loadMovieRatingsSample(nInstances: Int) {
    print(nInstances);
}
```

More information about references can be found in the [linked document][references].


## Results

_Results_ define the outputs of some declaration when it is [called][calls]. Here is an example:

```sds
result: Int
```

Here is a breakdown of the syntax:

- The name of the result (here `#!sds result`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `#!sds Int`).

### Complete Example

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

### Shorthand Version: Single Result

In case that the callable produces only a single result, we can omit the parentheses. The following two declarations are, hence, equivalent:

```sds
segment doSomething1() -> (result: Int) {}
```

```sds
segment doSomething2() -> result: Int {}
```

### Shorthand Version: No Results

In case that the callable produces no results, we can usually omit the entire results list. The following two declarations are, hence equivalent:

```sds
segment doSomething1() -> () {}
```

```sds
segment doSomething2() {}
```

The notable exception are [callable types][callable-types], where the result list must always be specified even when it is empty.

[Results][results] (outputs) are used to return values that are produced inside the segment back to the caller. First, we show how to [declare the available results](#result-declaration) of the segment and then how to [assign a value to them](#assigning-to-results).

### Result Declaration

As with [parameters](#parameters) we first need to declare the available results in the headed. This tells [callers](#calling-a-segment) that they can use these results and reminds us to [assign a value to them](#assigning-to-results) in the body of the segment. Let's look at an example:

```sds
segment loadMovieRatingsSample(nInstances: Int) -> (features: Dataset, target: Dataset) {
    val movieRatingsSample = loadDataset("movieRatings").sample(nInstances = 1000);
}
```

We added two results to the segment: The first one is called `#!sds features` and has type `#!sds Dataset`, while the second one is called `#!sds target` and also has type `#!sds Dataset`.

More information about the declaration of results can be found in the [linked document][results].

### Assigning to Results

Currently, the program will not compile since we never assigned a value to these results. This can be done with an [assignment][assignments] and the `#!sds yield` keyword:

```sds
segment loadMovieRatingsSample(nInstances: Int) -> (features: Dataset, target: Dataset) {
    val movieRatingsSample = loadDataset("movieRatings").sample(nInstances = 1000);
    yield features = movieRatingsSample.keepAttributes(
        "leadingActor",
        "genre",
        "length"
    );
    yield target = movieRatingsSample.keepAttributes(
        "rating"
    );
}
```

In the assignment beginning with `#!sds yield features =` we specify the value of the result called `#!sds features`, while the next assignment beginning with `#!sds yield target =` assigns a value to the `#!sds target` result.

The order of the [result declarations](#result-declaration) does not need to match the order of assignment. However, **each result must be assigned exactly once**. Note that unlike the `#!sds return` in other programming languages, `#!sds yield` does not stop the execution of the segment, which allows [assignments][assignments] to different results to be split across multiple [statements][statements].

## Statements

In order to describe what should be done when the segment is executed, we need to add [statements][statements] to its body. The previous example in the section ["References to Parameters"](#references-to-parameters) already contained a statement - an [expression statement][expression-statements] to be precise. Here is another example, this time showing an [assignment][assignments]:

```sds
segment loadMovieRatingsSample(nInstances: Int) {
    val movieRatingsSample = loadDataset("movieRatings").sample(nInstances = 1000);
}
```

More information about statements can be found in the [linked document][statements]. Note particularly, that all statements must end with a semicolon.

## Visibility

By default, a segment can be [imported][imports] in any other file and reused there. We say they have public visibility. However, it is possible to restrict the visibility of a segment with modifiers:

```sds
internal segment internalSegment() {}

private segment privateSegment() {}
```

The segment `#!sds internalSegment` is only visible in files with the same [package][packages]. The segment `#!sds privateSegment` is only visible in the file it is declared in.

## Calling a Segment

Inside a [pipeline][pipelines], another segment, or a [lambda][lambdas] we can then [call][calls] a segment, which means the segment is executed when the call is reached: The results of a segment can then be used as needed. In the following example, where we call the segment `#!sds loadMovieRatingsSample` that we defined above, we [assign the results to placeholders][assignments-to-placeholders]:

```sds
val features, val target = loadMovieRatingsSample(nInstances = 1000);
```

More information about calls can be found in the [linked document][calls].

[imports]: imports.md
[parameters]: segments.md#parameters
[results]: segments.md#results
[types]: types.md
[packages]: packages.md
[statements]: statements/README.md
[assignments]: statements/assignments.md#assignments
[assignments-to-placeholders]: statements/assignments.md#declaring-placeholders
[expression-statements]: statements/expression-statements.md
[calls]: expressions/calls.md#calls
[lambdas]: expressions/lambdas.md#lambdas
[references]: expressions/references.md#references
[pipelines]: pipelines.md

[stub-language]: ../stub-language/README.md
[callable-types]: types.md#callable-types

[segments]: ../pipeline-language/segments.md
[calls]: expressions/calls.md#calls
[stub-language]: ../stub-language/README.md
[int-literals]: expressions/literals.md#int-literals
[float-literals]: expressions/literals.md#float-literals
[string-literals]: expressions/literals.md#string-literals
[boolean-literals]: expressions/literals.md#boolean-literals
[null-literals]: expressions/literals.md#sds-null-literal
[python-keyword-only]: https://peps.python.org/pep-3102/
[python-positional-only]: https://peps.python.org/pep-0570/
