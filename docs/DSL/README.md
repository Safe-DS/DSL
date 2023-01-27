# Safe-DS DSL Tutorial

The Safe-DS DSL is split into two main parts:

-   The _[pipeline language][pipeline-language]_ is used to solve specific Machine Learning problems. Unless you want to add functionality to Safe-DS, this sublanguage is all you need to learn. To use the pipeline language, create a file with the extension `.sdspipe`.
-   The _[stub language][stub-language]_ is used to integrate external code written in Python into Safe-DS, so it can be used in the [pipeline language][pipeline-language]. The main purpose of this sublanguage is to define the [Safe-DS Standard Library (stdlib)][stdlib]. To use the stub language, create a file with the extension `.sdsstub`.

[pipeline-language]: pipeline-language/README.md
[stub-language]: stub-language/README.md
[stdlib]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/resources/stdlib
