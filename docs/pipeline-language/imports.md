# Imports

By default, only declarations in the same package as the current file or in a package whose name starts with `safeds` [package][packages] are accessible. All other declarations must be imported first.

Safe-DS has two kinds of imports, namely a _qualified import_, which imports a single declaration, and a _wildcard import_, which imports everything in a [package][packages].

## Qualified Imports

A _qualified import_ makes a single declaration available. Here is an example that imports the [class][classes] `DecisionTree` in the [package][packages] `safeds.model.regression`:

```sds
from safeds.model.regression import DecisionTree
```

The syntax consists of the following parts:

- The keyword `from`.
- The name of the [package][packages] that contains the declaration (here `safeds.model.regression`).
- The keyword `import`.
- The name of the declaration (i.e. `DecisionTree`).

Once the declaration is imported, we can refer to it by its name. Here is, for example, a [call][calls] to the constructor of the `DecisionTree` class:

```sds
DecisionTree()
```

Multiple declarations can be imported from the same package in a single import statement by separating them with commas:

```sds
from safeds.model.regression import DecisionTree, RandomForest
```

### Qualified Imports with Alias

Sometimes the name of the imported declaration can conflict with other declarations that are imported or that are contained in the importing file. To counter this, declarations can be imported under an alias:

```sds
from safeds.model.regression import DecisionTree as StdlibDecisionTree
```

Let us take apart the syntax:

- The keyword `#!sds from`.
- The name of the [package][packages] that contains the declaration (here `safeds.model.regression`).
- The keyword `#!sds import`.
- The name of the declaration (i.e. `DecisionTree`).
- The keyword `#!sds as`.
- The alias to use (here `StdlibDecisionTree`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number.

Afterwards, the declaration can **only** be accessed using the alias. The next example shows how to create a new instance of the class now by invoking its constructor:

```sds
StdlibDecisionTree()
```

Multiple declarations can be imported with or without an alias in a single import statement by separating them with commas:

```sds
from safeds.model.regression import DecisionTree as StdlibDecisionTree, RandomForest
```

## Wildcard Imports

We can also import all declarations in a [package][packages] with a single import. While this saves some typing, it also increases the likelihood of name conflicts and can make it harder for readers of the code to determine where a declaration comes from. Therefore, this should be used with caution.

Nevertheless, let us look at an example, which imports all declarations from the [package][packages] `#!sds safeds.model.regression`:

```sds
from safeds.model.regression import *
```

Here is the breakdown of the syntax:

- The keyword `#!sds from`.
- The name of the [package][packages] to import (here `#!sds safeds.model.regression`).
- The keyword `#!sds import`.
- A star.

Afterward, we can again access declarations by their simple name, such as the [class][classes] `#!sds DecisionTree`:

```sds
DecisionTree()
```

[Aliases](#qualified-imports-with-alias) cannot be used together with wildcard imports.

Note that declarations in subpackages, i.e. packages that have a different name but the same prefix as the imported one, are **not** imported. Therefore, if we would instead write `#!sds from safeds.model import *`, we could no longer access the [class][classes] `#!sds DecisionTree`.

[classes]: ../stub-language/classes.md
[packages]: packages.md
[calls]: expressions/calls.md#calls
