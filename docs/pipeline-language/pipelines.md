# Pipelines

Pipelines are data science programs designed to solve a specific task. They act as the entry point to start execution. Pipelines are not meant to be reusable, instead extract reusable code into a [segment][segments].

## Syntax

### Minimal Example

Let's look at a minimal example of a pipeline:

```sds
pipeline predictSpeed {}
```

This declaration of a pipeline has the following syntactic elements:

- The keyword `#!sds pipeline`.
- The name of the pipeline, here `#!sds predictSpeed`, which can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest using `#!sds lowerCamelCase` for the names of pipelines.
- The body of the pipeline, which contains the [statements][statements] that should be run when the pipeline is executed. The body is delimited by curly braces. In this example, the body is empty, so running this pipeline does nothing.

### Statements

In order to describe what should be done when the pipeline is executed, we need to add [statements][statements] to its body, as shown in this example:

```sds
pipeline predictSpeed {
    val adac = loadDataset("ADAC");
    val adacSample = adac.sample(1000);

    // …
}
```

More information about statements can be found in the [linked document][statements]. Note particularly, that all statements must end with a semicolon.

[segments]: segments.md
[statements]: statements/README.md
