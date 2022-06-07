# Steps

Steps are used to extract a sequence of [statements][statements] from a Machine Learning program to give the sequence a name and make it reusable. In the following discussion we explain how to [declare a step](#declaring-a-step) and how to [call it](#calling-a-step).

## Declaring a Step

### Minimal Example

Let's look at a minimal example of a step:

```
step loadMovieRatingsSample() {}
```

This declaration of a step has the following syntactic elements:
* The keyword `step`.
* The name of the step, here `loadMovieRatingsSample`. This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `lowerCamelCase` for the names of steps.
* The list of parameters (i.e. inputs) of the step. This is delimited by parentheses. In the example above, the step has no parameters.
* The _body_ of the step, which contains the [statements][statements] that should be run when the step is [called](#calling-a-step). The body is delimited by curly braces. In this example, the body is empty, so running this step does nothing.

### Parameters

To make a step configurable, add [parameters][parameters] (inputs). We will first show how to [declare parameters](#parameter-declaration) and afterwards how to [refer to them](#references-to-parameters) in the body of the step.
#### Parameter Declaration

Parameters must be declared in the header of the step so [callers](#calling-a-step) know they are expected to pass them as an argument, and so we can [use them](#references-to-parameters) in the body of the step.

In the following example, we give the step a single parameters with name `nInstances` and [type][types] `Int`.

```
step loadMovieRatingsSample(nInstances: Int) {}
```

More information about parameters can be found in the [linked document][parameters].

#### References to Parameters

Within the step we can access the value of a parameter using a [reference][references]. Here is a basic example where we print the value of the `nInstances` parameter to the console:

```
step loadMovieRatingsSample(nInstances: Int) {
    print(nInstances);
}
```

More information about references can be found in the [linked document][references].

### Statements

In order to describe what should be done when the step is executed, we need to add [statements][statements] to its body. The previous example in the section ["References to Parameters"](#references-to-parameters) already contained a statement - an [expression statement][expression-statements] to be precise. Here is another example, this time showing an [assignment][assignments]:

```
step loadMovieRatingsSample(nInstances: Int) {
    val movieRatingsSample = loadDataset("movieRatings").sample(nInstances = 1000);
}
```

More information about statements can be found in the [linked document][statements]. Note particularly, that all statements must end with a semicolon.

### Results

[Results][results] (outputs) are used to return values that are produced inside the step back to the caller. First, we show how to [declare the available results](#result-declaration) of the step and then how to [assign a value to them](#assigning-to-results).

#### Result Declaration

As with [parameters](#parameters) we first need to declare the available results in the headed. This tells [callers](#calling-a-step) that they can use these results and reminds us to [assign a value to them](#assigning-to-results) in the body of the step. Let's look at an example:

```
step loadMovieRatingsSample(nInstances: Int) -> (features: Dataset, target: Dataset) {
    val movieRatingsSample = loadDataset("movieRatings").sample(nInstances = 1000);
}
```

We added two results to the step: The first one is called `features` and has type `Dataset`, while the second one is called `target` and also has type `Dataset`.

More information about the declaration of results can be found in the [linked document][results].

#### Assigning to Results

Currently, the program will not compile since we never assigned a value to these results. This can be done with an [assignment][assignments] and the `yield` keyword:


```
step loadMovieRatingsSample(nInstances: Int) -> (features: Dataset, target: Dataset) {
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

In the assignment beginning with `yield features =` we specify the value of the result called `features`, while the next assignment beginning with `yield target =` assigns a value to the `target` result.

The order of the [result declarations](#result-declaration) does not need to match the order of assignment. However, **each result musts be assigned exactly once**. Note that unlike the `return` in other programming languages, `yield` does not stop the execution of the step, which allows [assignments][assignments] to different results to be split across multiple [statements][statements].

## Visibility

By default a step can be [imported][imports] in any other file and reused there. We say they have `public` visibility. However, it is possible to restrict the visibility of a step with modifiers:

```
internal step internalStep() {}

private step privateStep() {}
```

The step `internalStep` is only visible in files with the same [package][packages]. The step `privateStep` is only visible in the file it is declared in.

## Calling a Step

Inside of a [workflow][workflows], another step, or a [lambda][lambdas] we can then [call][calls] a step, which means the step is executed when the call is reached: The results of a step can then be used as needed. In the following example, where we call the step `loadMovieRatingsSample` that we defined above, we [assign the results to placeholders][assignments-to-placeholders]:

```
val features, val target = loadMovieRatingsSample(nInstances = 1000);
```

More information about calls can be found in the [linked document][calls].

[imports]: ../common/imports.md
[parameters]: ../common/parameters.md
[results]: ../common/results.md
[types]: ../common/types.md
[packages]: ./packages.md
[statements]: ./statements.md
[assignments]: ./statements.md#assignments
[assignments-to-placeholders]: ./statements.md#assigning-placeholders
[expression-statements]: ./statements.md#expression-statements
[calls]: ./expressions.md#calls
[lambdas]: ./expressions.md#lambdas
[references]: ./expressions.md#references
[workflows]: ./workflows.md
