# Pipeline Language

The pipeline language is the part of the Safe-DS DSL that is designed to solve specific data science problems. It has the following concepts:

- [Packages][packages] help avoid conflicts that could arise if two declarations have the same name.
- [Imports][imports] make declarations in other packages accessible.
- [Pipelines][pipelines] define the entry point of a data science program.
- [Statements][statements] are the instructions that are executed as part of a [pipeline][pipelines], [segment][segments], or [block lambda][block-lambdas].
- [Expressions][expressions] are computations that produce some value.
- [Comments][comments] document the code.
- [Segments][segments] encapsulate parts of a Data Science program and make them reusable.

Files that use the pipeline language must have the extension `.sdspipe`.

[packages]: ../common/packages.md
[imports]: ../common/imports.md
[pipelines]: pipelines.md
[segments]: segments.md
[statements]: statements.md
[expressions]: expressions.md
[block-lambdas]: expressions.md#block-lambdas
[comments]: ../common/comments.md
