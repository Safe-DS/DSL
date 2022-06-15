# Stub Language

The stub language is the part of the Safe-DS DSL that is used to integrate functions written in Python into Safe-DS. It describes which functionality that is implemented in Python should be publicly available and how it must be used. If do not want to make functionality that exists in Python accessible in Safe-DS, simply do not write stubs for them. The stub language has the following concepts:

* [Packages][packages] help avoid conflicts that could arise if two declarations have the same name.
* [Imports][imports] make declarations in other packages accessible.
* [Classes][classes] define custom datatypes that bundle data and operations on this data.
* [Global Functions][global-functions] define operations that do not belong to a specific [class][classes].
* [Enumerations][enumerations] define custom datatypes with a fixed set of possible variants.
* [Annotations][annotations] attach additional metainformation to declarations.
* [Comments][comments] document the code.

Files that use the stub language must have the extension `.sdsstub`.

[packages]: docs/DSL/commoncommon/packages.md
[imports]: docs/DSL/commoncommon/imports.md
[classes]: docs/DSL/stub-language/classes.md
[global-functions]: docs/DSL/stub-language/global-functions.md
[enumerations]: docs/DSL/stub-language/enumerations.md
[annotations]: docs/DSL/stub-language/annotations.md
[comments]: docs/DSL/commoncommon/comments.md
