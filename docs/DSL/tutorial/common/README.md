# Common Parts of Workflow Language and Stub Language

Several parts of the Safe-DS DSL are shared between the [workflow lanugage][workflow-language] and the [stub language][stub-language]. Here is the list:

* [Packages][packages] help avoid conflicts that could arise if two declarations have the same name.
* [Imports][imports] make declarations in other packages accessible.
* [Parameters][parameters] define the expected inputs of some declaration that can be [called][calls].
* [Results][results] define the outputs of some declaration when it is [called][calls].
* [Types][types] describe the values that a declaration can accept.
* [Comments][comments] document the code.

[workflow-language]: ../workflow-language/README.md
[stub-language]: ../stub-language/README.md
[calls]: ../workflow-language/expressions.md#calls
[packages]: ./packages.md
[imports]: ./imports.md
[parameters]: ./parameters.md
[results]: ./results.md
[types]: ./types.md
[comments]: ./comments.md
