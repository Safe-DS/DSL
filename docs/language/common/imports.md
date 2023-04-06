# Imports

By default, only declarations in the same package as the current file or in the `safeds.lang` [package][packages] are accessible. All other declarations must be imported first.

Safe-DS has two kinds of imports, namely a _qualified import_, which imports a single declaration, and a _wildcard import_, which imports everything in a [package][packages].

## Qualified Imports

A _qualified import_ makes a single declaration available. Here is an example that imports the [class][classes] `DecisionTree` in the [package][packages] `safeds.model.regression`:

```txt
import safeds.model.regression.DecisionTree
```

The syntax consists of the following parts:

- The keyword `import`
- The _qualified name_ of the declaration to import (here `safeds.model.regression.DecisionTree`). The qualified name can be obtained by concatenating the name of the [package][packages] that contains the declaration (i.e. `safeds.model.regression`) with the name of the declaration (i.e. `DecisionTree`). The two parts are separated by a dot.

Once the declaration is imported, we can refer to it by its _simple name_. This is the last segment of the qualified name, which is the name of the declaration. Here is, for example, a [call][calls] to the constructor of the `DecisionTree` class:

```txt
DecisionTree()
```

### Qualified Imports with Alias

Sometimes the name of the imported declaration can conflict with other declarations that are imported or that are contained in the importing file. To counter this, declarations can be imported under an alias:

```txt
import safeds.model.regression.DecisionTree as StdlibDecisionTree
```

Let us take apart the syntax:

- The keyword `import`.
- The _qualified name_ of the declaration to import (here `safeds.model.regression.DecisionTree`). The qualified name can be obtained by concatenating the name of the [package][packages] that contains the declaration (i.e. `safeds.model.regression`) with the name of the declaration (i.e. `DecisionTree`). The two parts are separated by a dot.
- The keyword `as`.
- The alias to use (here `StdlibDecisionTree`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number.

Afterwards, the declaration can **only** be accessed using the alias. The simple name cannot be used anymore. The next example shows how to create a new instance of the class now by invoking its constructor:

```txt
StdlibDecisionTree()
```

## Wildcard Imports

We can also import all declarations in a [package][packages] with a single import. While this saves some typing, it also increases the likelihood of name conflicts and can make it harder for readers of the code to determine where a declaration comes from. Therefore, this should be used with caution.

Nevertheless, let us look at an example, which imports all declarations from the [package][packages] `safeds.model.regression`:

```txt
import safeds.model.regression.*
```

Here is the breakdown of the syntax:

- The keyword `import`.
- The name of the [package][packages] to import (here `safeds.model.regression`).
- A dot.
- A star.

Afterwards, we can again access declarations by their simple name, such as the [class][classes] `DecisionTree`:

```txt
DecisionTree()
```

[Aliases](#qualified-imports-with-alias) cannot be used together with wildcard imports.

Note that declarations in subpackages, i.e. packages that have a different name but the same prefix as the imported one, are **not** imported. Therefore, if we would only `import safeds.model`, we could no longer access the [class][classes] `DecisionTree`.

[classes]: ../stub-language/classes.md
[packages]: packages.md
[calls]: ../pipeline-language/expressions.md#calls
