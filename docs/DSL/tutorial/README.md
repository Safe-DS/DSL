# Simple-ML DSL Tutorial

The Simple-ML DSL is split into two main parts:

* The _[workflow language][workflow-language]_ is used to solve specific Machine Learning problems. Unless you want to add functionality to Simple-ML, this sublanguage is all you need to learn. To use the workflow language, create a file with the extension `.smlflow`.
* The _[stub language][stub-language]_ is used to integrate external code written in Python into Simple-ML, so it can be used in the [workflow language][workflow-language]. The main purpose of this sublanguage is to define the [Simple-ML Standard Library (stdlib)][stdlib]. To use the stub language, create a file with the extension `.smlstub`.

[workflow-language]: ./workflow-language/README.md
[stub-language]: ./stub-language/README.md
[stdlib]: ../../../DSL/de.unibonn.simpleml/src/main/resources/stdlib
