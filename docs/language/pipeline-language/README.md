# Pipeline Language

The pipeline language is the part of the Safe-DS DSL that is designed to solve specific data science problems. It has the following concepts:

- [Packages][packages] help avoid conflicts that could arise if two declarations have the same name.
- [Imports][imports] make declarations in other packages accessible.
- [Pipelines][pipelines] define the entry point of a data science program.
- [Segments][segments] encapsulate parts of a data science program and make them reusable.
- [Statements][statements] are the instructions that are executed as part of a [pipeline][pipelines], [segment][segments], or [block lambda][block-lambdas].
- [Expressions][expressions] are computations that produce some value.
- [Comments][comments] document the code.

Files that use the pipeline language must have the extension `.sds`.

[packages]: ../common/packages.md
[imports]: ../common/imports.md
[pipelines]: pipelines.md
[segments]: segments.md
[statements]: statements.md
[expressions]: expressions.md
[block-lambdas]: expressions.md#block-lambdas
[comments]: ../common/comments.md
