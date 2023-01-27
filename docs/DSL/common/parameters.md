# Parameters

_Parameters_ define the expected inputs of some declaration that can be [called][calls]. We refer to such declarations as _callables_. We distinguish between

- [required parameters](#required-parameters), which must always be passed,
- [optional parameters](#optional-parameters), which use a default value if no value is passed explicitly, and
- [variadic parameters](#variadic-parameters), which can accept zero or more values.

## Required Parameters

_Required parameters_ must always be passed when the declaration is [called][calls]. Let us look at an example:

```txt
requiredParameter: Int
```

Here are the pieces of syntax:

- The name of the parameter (here `requiredParameter`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `Int`).

## Optional Parameters

_Optional parameters_ have a default value and, thus, need not be passed as an [argument][calls] unless the default value does not fit. Here is an example:

```txt
optionalParameter: Int = 1
```

These are the syntactic elements:

- The name of the parameter (here `optionalParameter`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `Int`).
- An equals sign.
- The default value of the parameter (here `1`). This must be a constant expression, i.e. something that can be evaluated by the compiler. Particularly [calls][calls] usually do not fulfill this requirement.

## Variadic Parameters

_Variadic parameters_ can consume arbitrarily many [arguments][calls]. Here is an example:

```txt
vararg variadicParameter: Int
```

Let us break down the syntax:

- The keyword `vararg`
- The name of the parameter (here `variadicParameter`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `Int`).

## Complete Example

Let us now look at a full example of a [step][steps] called `doSomething` with one [required parameter](#required-parameters) and one [optional parameter](#optional-parameters):

```txt
step doSomething(requiredParameter: Int, optionalParameter: Boolean = false) {
    // ...
}
```

The interesting part is the list of parameters, which uses the following syntactic elements:

- An opening parenthesis.
- A list of parameters, the syntax is as described above. They are separated by commas. A trailing commas is permitted.
- A closing parenthesis.

## Restrictions

Several restrictions apply to the order of parameters and to combinations of the various categories of parameters:

- After an [optional parameter](#optional-parameters) all parameters must be optional.
- A single [variadic parameter](#variadic-parameters) can be added at the end of the parameter list.
- Implied by this: A callable cannot have both [optional parameters](#optional-parameters) and [variadic parameters](#variadic-parameters).

## Corresponding Python Code

**Note:** This section is only relevant if you are interested in the [stub language][stub-language].

Parameters must be ordered the same way in Python as they are in Safe-DS. Moreover, for each parameter the following elements must match:

- Name
- Type
- Kind (required vs. optional vs. variadic)
- Default value for optional parameters

Let's look at these elements in turn.

### Matching Name

By default, parameter names in Safe-DS must be identical to their names in Python. If this is not desired, for example due to clashing name conventions in Safe-DS and Python, the `@PythonName` annotation can be used to link a Safe-DS parameter to a Python parameter with a different name. Here is an example:

```py
# Python code

def accuracy(x_pred: Dataset, x_test: Dataset) -> float:
    pass
```

```txt
// Safe-DS code

fun accuracy(
    @PythonName("x_pred") xPred: Dataset,
    @PythonName("x_test") xTest: Dataset
) -> accuracy: Float
```

In this case, the Safe-DS parameters `xPred` and `xTest` refer to the Python parameters `x_pred` and `x_test` respectively.

### Matching Type

The Safe-DS type of a parameter should capture the legal values of this parameter accurately. Ideally, the Python parameter should also have a matching [type hint][types-python].

### Matching Kind

Parameters kinds must match on the Safe-DS and Python sides as well. Concretely, this means:

- All required parameters in Safe-DS must be required in Python.
- All optional parameters in Safe-DS must be optional in Python.
- All variadic parameters in Safe-DS must be variadic in Python (`*args`).

Moreover, it must be possible to pass

- required parameters by position,
- optional parameters by name,
- variadic parameters by position.

These rules allow us to restrict required parameters to [positional-only][python-positional-only] or optional parameters to [keyword-only][python-keyword-only]. We can also keep both unrestricted.

The following three examples show valid pairs of Python and Safe-DS programs.

#### Required Parameter

```py
# Python code

def required(a: int):
    pass
```

```txt
// Safe-DS code

fun required(a: Int)
```

#### Optional Parameter

```py
# Python code

def optional(a: int = 1):
    pass
```

```txt
// Safe-DS code

fun optional(a: Int = 1)
```

#### Variadic Parameter

```py
# Python code

def variadic(*a: int):
    pass
```

```txt
// Safe-DS code

fun variadic(vararg a: Int)
```

### Matching Default Value

Most commonly, default values in Python are literals, since default values are only evaluated once in Python rather than every time the function is called. The following table shows how Safe-DS literals and Python literals correspond:

| Safe-DS Literal                       | Python Literal         |
| ------------------------------------- | ---------------------- |
| `1` ([int][int-literals])             | `1`                    |
| `1.0` ([float][float-literals])       | `1.0`                  |
| `"hello"` ([string][string-literals]) | `"hello"` or `'hello'` |
| `false` ([boolean][boolean-literals]) | `False`                |
| `true` ([boolean][boolean-literals])  | `True`                 |
| `null` ([null][null-literals])        | `None`                 |

[types]: types.md
[types-python]: types.md#corresponding-python-code
[steps]: ../workflow-language/steps.md
[calls]: ../workflow-language/expressions.md#calls
[stub-language]: ../stub-language/README.md
[int-literals]: ../workflow-language/expressions.md#int-literals
[float-literals]: ../workflow-language/expressions.md#float-literals
[string-literals]: ../workflow-language/expressions.md#string-literals
[boolean-literals]: ../workflow-language/expressions.md#boolean-literals
[null-literals]: ../workflow-language/expressions.md#null-literal
[python-keyword-only]: https://peps.python.org/pep-3102/
[python-positional-only]: https://peps.python.org/pep-0570/
