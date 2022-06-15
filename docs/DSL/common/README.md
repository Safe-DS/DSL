# Common Parts of Workflow Language and Stub Language

Several parts of the Safe-DS DSL are shared between the [workflow lanugage][workflow-language] and the [stub language][stub-language]. Here is the list:

* [Packages][packages] help avoid conflicts that could arise if two declarations have the same name.
* [Imports][imports] make declarations in other packages accessible.
* [Parameters][parameters] define the expected inputs of some declaration that can be [called][calls].
* [Results][results] define the outputs of some declaration when it is [called][calls].
* [Types][types] describe the values that a declaration can accept.
* [Comments][comments] document the code.

[workflow-language]: docs/DSL/workflow-languagenguage/README.md
[stub-language]: docs/DSL/stub-languagenguage/README.md
[calls]: docs/DSL/workflow-languagenguage/expressions.md#calls
[packages]: docs/DSL/common/packages.md
[imports]: docs/DSL/common/imports.md
[parameters]: docs/DSL/common/parameters.md
[results]: docs/DSL/common/results.md
[types]: docs/DSL/common/types.md
[comments]: docs/DSL/common/comments.md
