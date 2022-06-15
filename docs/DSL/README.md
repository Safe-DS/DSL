# Safe-DS DSL Tutorial

The Safe-DS DSL is split into two main parts:

* The _[workflow language][workflow-language]_ is used to solve specific Machine Learning problems. Unless you want to add functionality to Safe-DS, this sublanguage is all you need to learn. To use the workflow language, create a file with the extension `.sdsflow`.
* The _[stub language][stub-language]_ is used to integrate external code written in Python into Safe-DS, so it can be used in the [workflow language][workflow-language]. The main purpose of this sublanguage is to define the [Safe-DS Standard Library (stdlib)][stdlib]. To use the stub language, create a file with the extension `.sdsstub`.

[workflow-language]: docs/DSL/workflow-languageanguage/README.md
[stub-language]: docs/DSL/stub-languageanguage/README.md
[stdlib]: DSL/com.larsreimann.safeds/src/main/resources/stdlib
