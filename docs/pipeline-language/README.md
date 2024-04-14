# Language Reference

Safe-DS is a domain-specific language (DSL) to quickly and safely develop data science programs. In this context,
safety means that it tries to prevent errors or detect them while you program, so you do not waste time running a
program that will fail.

!!! note "File extension"

    Safe-DS programs must have the file extension `sds`, like in `titanic.sds`.

This remaining documentation provides a detailed reference for the concepts of the Safe-DS language:

- [Packages][packages] help avoid conflicts that could arise if two declarations have the same name.
- [Pipelines][pipelines] define the entry point of a program.
- [Statements][statements] are the instructions that are executed as part of a program.
- [Expressions][expressions] are computations that produce some value.
- [Comments][comments] document the code.
- [Segments][segments] encapsulate parts of program and make them reusable.
- [Types][types] describe the kind of data that a declaration accepts.
- [Imports][imports] make declarations in other packages accessible.


[packages]: packages.md
[pipelines]: pipelines.md
[statements]: statements.md
[expressions]: expressions.md
[comments]: comments.md
[segments]: segments.md
[types]: types.md
[imports]: imports.md
