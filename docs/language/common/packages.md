# Packages

_Packages_ are used to prevent conflicts when multiple files have declarations with the same name. They accomplish this by grouping all declarations in a file into a namespace. Here is an example for a package declaration:

```sds
package de.unibonn.speedPrediction
```

It has these syntactic elements:

- The keyword `#!sds package`.
- The name of the package, which consists of multiple _segments_ separated by dots. Each segment can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds lowerCamelCase` for all segments. We also recommend to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation) for the package name.

Multiple files can belong to the same package but each non-empty file must declare its package before any [import][imports] or declarations. Moreover, within the same package the names of declarations must be unique.

Continue with the explanation of [imports][imports] to understand how to access declarations that are defined in other packages.

## Corresponding Python Code

**Note:** This section is only relevant if you are interested in the [stub language][stub-language].

In order for code generation to work properly, the Safe-DS package of a Safe-DS declaration in the [stub language][stub-language] must correspond to a [Python module][python-modules] that exports its matching Python declaration. These [Python modules][python-modules] can either directly contain the implementation or globally import the declaration. The latter is possible since all declarations that are globally imported in a [Python module][python-modules] are also automatically exported again in Python.

### File Contains Implementation

The first option is to use the file that contains the actual implementation of the declaration. Let us start with the following Python code to explain this idea:

```py title="Python file 'safeds/model/regression/_decision_tree.py'"
class DecisionTree:
    def __init__(self):
        pass # Implementation omitted
```

This file contains the actual implementation of the Python class `#!py DecisionTree`. We now want to make this Python class available in Safe-DS, which requires the following Safe-DS stub file:

```sds title="Safe-DS file 'safeds/model/regression/_decision_tree/DecisionTree.sdsstub'"
package safeds.model.regression._decision_tree

class DecisionTree()
```

Note that the Safe-DS package corresponds to the path to the Python file, where we replace file separators (here `/`) by dots and remove the file extension (here `.py`). Another way to think about this is to ask how a from-import of the Python declaration would look like in Python code that wants to use the Python declaration. In this case we would write

```py title="Python"
from safeds.model.regression._decision_tree import DecisionTree
```

The part between `#!py from` and `#!py import` is exactly what the Safe-DS package has to be.

The file path is irrelevant in Safe-DS. For the sake of code organization, however, we advise to use the segments of the package name to create a folder hierarchy and then create a Safe-DS stub file with some fitting name in there.

### File Imports Declaration

The second option is to chose the Safe-DS package that corresponds to a [Python module][python-modules] that imports the declaration we are interested in. This is particularly useful if multiple [Python modules][python-modules] are bundled into a [Python package][python-packages]. In the `#!sds __init__.py` file we can then bundle the declarations from different [Python module][python-modules] together.

We will demonstrate this by extending the example we used above:

```py title="Python file 'safeds/model/regression/_decision_tree.py'"
class DecisionTree:
    def __init__(self):
        pass # Implementation omitted
```

```py title="Python file 'safeds/model/regression/__init__.py'"
from ._decision_tree import DecisionTree
```

The addition of the `__init__.py` file now allows us to import the Python class `#!py DecisionTree` in another way in Python client code:

```py title="Python"
from safeds.model.regression import DecisionTree
```

Note the omission of the suffix `#!py ._decision_tree` after `#!py safeds.model.regression`. Likewise, we can now update the Safe-DS stub code. We again just take everything between `#!py from` and `#!py import` and use this as the Safe-DS package name:

```sds title="Safe-DS file 'safeds/model/regression/DecisionTree.sdsstub'"
package safeds.model.regression

class DecisionTree()
```

Generally, this method is preferable to our initial solution in the Section ["File Contains Implementation"](#file-contains-implementation), since we hide the detail in which file a declaration resides. This makes later refactorings easier since we can freely move declarations between files in the same Python package without breaking client code.

### `#!sds @PythonModule` Annotation

Choosing the Safe-DS package according to the rules described above is essential for code generation to work properly. However, we might sometimes get warnings related to the Safe-DS naming convention, which wants the segments of the Safe-DS package to be `#!sds lowerCamelCase`. We now have several options:

- If the declaration is not part of the Safe-DS standard library, we can ignore the warning.
- We can update the Python code.
- We can use the `#!sds @PythonModule` annotation.

The first two options are self-explanatory. Let us now look at the third one. We use our initial example from the Section ["File Contains Implementation"](#file-contains-implementation) again:

```py title="Python file 'safeds/model/regression/_decision_tree.py'"
class DecisionTree:
    def __init__(self):
        pass # Implementation omitted
```

Our original solution leads to a warning because the Safe-DS package name contains the segment `#!sds _decision_tree`, which is not `#!sds lowerCamelCase` due to the underscores:

```sds title="Safe-DS file 'safeds/model/regression/_decision_tree/DecisionTree.sdsstub'"
package safeds.model.regression._decision_tree

class DecisionTree()
```

By [calling][annotation-calls] the [annotation][annotations] `#!sds @PythonModule`, we can also specify the corresponding [Python module][python-modules], however. If this [annotation][annotations] is [called][annotation-calls], it takes precedence over the Safe-DS package name. This allows us to pick an arbitrary Safe-DS package that respects the Safe-DS naming convention. We can even group multiple [Python modules][python-modules] together in one Safe-DS package without relying on Python's `#!sds __init__.py` files:

```sds title="Safe-DS file 'safeds/model/regression/DecisionTree.sdsstub'" hl_lines="1"
@PythonModule("safeds.model.regression._decision_tree")

package safeds.model.regression

class DecisionTree()
```

Here is a breakdown of this:

- We [call][annotation-calls] the `#!sds @PythonModule` [annotation][annotations] before we declare the Safe-DS package. The [Python module][python-modules] that exports the Python declarations that correspond to the Safe-DS declarations in this stub file is passed as a [string literal][string-literals] (here `#!sds safeds.model.regression._decision_tree`). This is used only for code generation and does not affect users of Safe-DS.
- We specify the Safe-DS package as usual. This must be used when we [import][imports] the declaration in another Safe-DS file:

```sds title="Safe-DS"
from safeds.model.regression import DecisionTree
```

It is important to note that the `#!sds @PythonModule` annotation only affects the one Safe-DS file that contains it rather than the entire Safe-DS package. This allows different Safe-DS files in the same package to point to different [Python modules][python-modules].

[stub-language]: ../stub-language/README.md
[annotations]: ../stub-language/annotations.md
[annotation-calls]: ../stub-language/annotations.md#calling-an-annotation
[imports]: imports.md
[string-literals]: ../pipeline-language/expressions.md#string-literals
[python-modules]: https://docs.python.org/3/tutorial/modules.html#modules
[python-packages]: https://docs.python.org/3/tutorial/modules.html#packages
