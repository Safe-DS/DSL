# Pipelines

Pipelines are data science programs designed to solve a specific task. They act as the entry point to start execution.
Pipelines are not meant to be reusable, instead extract reusable code into a [segment][segments].

## Syntax

### Minimal Example

Let's look at a minimal example of a pipeline:

```sds
pipeline predictSurvival {}
```

This declaration of a pipeline has the following syntactic elements:

- The keyword `#!sds pipeline`.
- The name of the pipeline, here `#!sds predictSurvival`. It can be any combination of lower- and uppercase letters,
  underscores, and numbers, as long as it does not start with a number.
- Curly braces that delimit the _body_ of the pipeline. This is the code that is executed when the pipeline is run. In
  this example, the body is empty, so running this pipeline does nothing.

??? info "Name convention"

    Use `#!sds lowerCamelCase` for the name of the pipeline.

### Statements

In order to describe what should be done when the pipeline is executed, we need to add [statements][statements] to its
body, as shown in this example:

```sds
pipeline whoSurvived {
    val titanic = Table.fromCsvFile("titanic.csv");
    val head = titanic.sliceRows(end = 5);

    // …
}
```

Note particularly, that all statements must end with a semicolon. More information about statements can be found in the
[dedicated document][statements].


## Running a Pipeline in VS Code

Running a pipeline requires a working installation of the [Safe-DS Runner][runner]. Follow the instructions in the
[installation guide][installation] to install it.

Afterward, you can run a pipeline via a so-called _code lens_ in the editor. It is displayed above the pipeline once the
runner is started successfully. Click on the `Run <pipeline name>` code lens to run the pipeline:

![Run Pipeline](../img/pipeline-language/code-lens-run-pipeline-dark.png#only-dark)
![Run Pipeline](../img/pipeline-language/code-lens-run-pipeline-light.png#only-light)

This executes the pipeline completely, including all side effects, like writing to files. Most of the time, you will
want to inspect only one value, instead. For this, additional code lenses are shown above [assignments][assignments],
depending on the type of the assigned value. For example, if the assigned value is a table, you can explore it in a
separate view by clicking on the `Explore <placeholder name>` code lens:

![Explore Table](../img/pipeline-language/code-lens-explore-table-dark.png#only-dark)
![Explore Table](../img/pipeline-language/code-lens-explore-table-light.png#only-light)

More information about code lenses for value inspection can be found in the [dedicated document][assignments].


[assignments]: statements/assignments.md
[installation]: ../getting-started/installation.md
[runner]: https://github.com/Safe-DS/Runner
[segments]: segments.md
[statements]: statements/README.md
