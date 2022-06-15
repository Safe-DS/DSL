# Packages

_Packages_ are used to prevent conflicts when multiple files have declarations with the same name. They accomplish this by grouping all declarations in a file into a namespace. Here is an example for a package declaration:

```
package de.unibonn.speedPrediction
```

It has these syntactic elements:
* The keyword `package`.
* The name of the package, which consists of multiple _segments_ separated by dots. Each segment can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `lowerCamelCase` for all segments. We also recommend to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation) for the package name.

Multiple files can belong to the same package but each non-empty file must declare its package before any [import][imports] or declarations. Moreover, within the same package the names of declarations must be unique.

Continue with the explanation of [imports][imports] to understand how to access declarations that are defined in other packages.

## Corresponding Python Code

**Note:** This section is only relevant if you are interested in the [stub language][stub-language].

In order for code generation to work properly, the Simple-ML package of a Simple-ML declaration in the [stub language][stub-language] must correspond to a [Python module][python-modules] that exports its matching Python declaration. These [Python modules][python-modules] can either directly contain the implementation or globally import the declaration. The latter is possible since all declarations that are globally imported in a [Python module][python-modules] are also automatically exported again in Python.

### File Contains Implementation

The first option is to use the file that contains the actual implementation of the declaration. Let us start with the following Python code to explain this idea:

```py
# Python file "simpleml/model/regression/_decision_tree.py"

class DecisionTree:
    def __init__(self):
        pass # Implementation omitted
```

This file contains the actual implementation of the Python class `DecisionTree`. We now want to make this Python class available in Simple-ML, which requires the following Simple-ML stub file:

```
// Simple-ML file "simpleml/model/regression/_decision_tree/DecisionTree.sdsstub"

package simpleml.model.regression._decision_tree

class DecisionTree()
```

Note that the Simple-ML package corresponds to the path to the Python file, where we replace file separators (here `/`) by dots and remove the file extension (here `.py`). Another way to think about this is to ask how a from-import of the Python declaration would look like in Python code that wants to use the Python declaration. In this case we would write

```py
# Python

from simpleml.model.regression._decision_tree import DecisionTree
```

The part between `from` and `import` is exactly what the Simple-ML package has to be.

The file path is irrelevant in Simple-ML. For the sake of code organization, however, we advise to use the segments of the package name to create a folder hierarchy and then create a Simple-ML stub file with some fitting name in there.

### File Imports Declaration

The second option is to chose the Simple-ML package that corresponds to a [Python module][python-modules] that imports the declaration we are interested in. This is particularly useful if multiple [Python modules][python-modules] are bundled into a [Python package][python-packages]. In the `__init__.py` file we can then bundle the declarations from different [Python module][python-modules] together.

We will demonstrate this by extending the example we used above:

```py
# Python file "simpleml/model/regression/_decision_tree.py"

class DecisionTree:
    def __init__(self):
        pass # Implementation omitted
```

```py
# Python file "simpleml/model/regression/__init__.py

from ._decision_tree import DecisionTree
```

The addition of the `__init__.py` file now allows us to import the Python class `DecisionTree` in another way in Python client code:

```py
# Python

from simpleml.model.regression import DecisionTree
```

Note the omission of the suffix `._decision_tree` after `simpleml.model.regression`. Likewise, we can now update the Simple-ML stub code. We again just take everything between `from` and `import` and use this as the Simple-ML package name:

```
// Simple-ML file "simpleml/model/regression/DecisionTree.sdsstub"

package simpleml.model.regression

class DecisionTree()
```

Generally, this method is preferable to our initial solution in the Section ["File Contains Implementation"](#file-contains-implementation), since we hide the detail in which file a declaration resides. This makes later refactorings easier since we can freely move declarations between files in the same Python package without breaking client code.

### `@PythonModule` Annotation

Choosing the Simple-ML package according to the rules described above is essential for code generation to work properly. However, we might sometimes get warnings related to the Simple-ML naming convention, which wants the segments of the Simple-ML package to be `lowerCamelCase`. We now have several options:
* If the declaration is not part of the Simple-ML standard library, we can ignore the warning.
* We can update the Python code.
* We can use the `@PythonModule` annotation.

The first two options are self-explanatory. Let us now look at the third one. We use our initial example from the Section ["File Contains Implementation"](#file-contains-implementation) again:

```py
# Python file "simpleml/model/regression/_decision_tree.py"

class DecisionTree:
    def __init__(self):
        pass # Implementation omitted
```

Our original solution leads to a warning because the Simple-ML package name contains the segment `_decision_tree`, which is not `lowerCamelCase` due to the underscores:

```
// Simple-ML file "simpleml/model/regression/_decision_tree/DecisionTree.sdsstub"

package simpleml.model.regression._decision_tree

class DecisionTree()
```

By [calling][annotation-calls] the [annotation][annotations] `@PythonModule`, we can also specify the corresponding [Python module][python-modules], however. If this [annotation][annotations] is [called][annotation-calls], it takes precedence over the Simple-ML package name. This allows us to pick an arbitrary Simple-ML package that respects the Simple-ML naming convention. We can even group multiple [Python modules][python-modules] together in one Simple-ML package without relying on Python's `__init__.py` files:

```
// Simple-ML file "simpleml/model/regression/DecisionTree.sdsstub"

@PythonModule("simpleml.model.regression._decision_tree")

package simpleml.model.regression

class DecisionTree()
```

Here is a breakdown of this:
* We [call][annotation-calls] the `@PythonModule` [annotation][annotations] before we declare the Simple-ML package. The [Python module][python-modules] that exports the Python declarations that correspond to the Simple-ML declarations in this stub file is passed as a [string literal][string-literals] (here `simpleml.model.regression._decision_tree`). This is used only for code generation and does not affect users of Simple-ML.
* We specify the Simple-ML package as usual. This must be used when we [import][imports] the declaration in another Simple-ML file:
    ```
    // Simple-ML

    import simpleml.model.regression.DecisionTree
    ```

It is important to note that the `@PythonModule` annotation only affects the one Simple-ML file that contains it rather than the entire Simple-ML package. This allows different Simple-ML files in the same package to point to different [Python modules][python-modules].

[stub-language]: ../stub-language/README.md
[annotations]: ../stub-language/annotations.md
[annotation-calls]: ../stub-language/annotations.md#calling-an-annotation
[imports]: ./imports.md
[classes]: ../stub-language/classes.md
[steps]: ../workflow-language/steps.md
[workflows]: ../workflow-language/workflows.md
[string-literals]: ../workflow-language/expressions.md#string-literals

[python-modules]: https://docs.python.org/3/tutorial/modules.html#modules
[python-packages]: https://docs.python.org/3/tutorial/modules.html#packages
