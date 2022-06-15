# Workflows

Workflows are Machine Learning programs designed to solve a specific task. They act as the entry point to start execution. Workflows are not meant to be reusable, instead extract reusable code into a [step][steps].

## Syntax

### Minimal Example

Let's look at a minimal example of a workflow:

```
workflow predictSpeed {}
```

This declaration of a workflow has the following syntactic elements:
* The keyword `workflow`.
* The name of the workflow, here `predictSpeed`, which can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `lowerCamelCase` for the names of workflows.
* The body of the workflow, which contains the [statements][statements] that should be run when the workflow is executed. The body is delimited by curly braces. In this example, the body is empty, so running this workflow does nothing.

### Statements

In order to describe what should be done when the workflow is executed, we need to add [statements][statements] to its body, as shown in this example:

```
workflow predictSpeed {
    val adac = loadDataset("ADAC");
    val adacSample = adac.sample(1000);

    // …
}
```

More information about statements can be found in the [linked document][statements]. Note particularly, that all statements must end with a semicolon.

[steps]: steps.md
[statements]: statements.md
