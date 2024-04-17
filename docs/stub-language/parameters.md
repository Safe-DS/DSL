# Parameters

_Parameters_ define the expected inputs of some declaration that can be [called][calls]. We refer to such declarations as _callables_. We distinguish between

- [required parameters](#required-parameters), which must always be passed, and
- [optional parameters](#optional-parameters), which use a default value if no value is passed explicitly.

## Required Parameters

_Required parameters_ must always be passed when the declaration is [called][calls]. Let us look at an example:

```sds
requiredParameter: Int
```

Here are the pieces of syntax:

- The name of the parameter (here `#!sds requiredParameter`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `#!sds Int`).

## Optional Parameters

_Optional parameters_ have a default value and, thus, need not be passed as an [argument][calls] unless the default value does not fit. Here is an example:

```sds
optionalParameter: Int = 1
```

These are the syntactic elements:

- The name of the parameter (here `#!sds optionalParameter`). This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds lowerCamelCase` for the names of parameters.
- A colon.
- The [type][types] of the parameter (here `#!sds Int`).
- An equals sign.
- The default value of the parameter (here `#!sds 1`). This must be a constant expression, i.e. something that can be evaluated by the compiler. Particularly [calls][calls] usually do not fulfill this requirement.

## Complete Example

Let us now look at a full example of a [segment][segments] called `#!sds doSomething` with one [required parameter](#required-parameters) and one [optional parameter](#optional-parameters):

```sds
segment doSomething(requiredParameter: Int, optionalParameter: Boolean = false) {
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

## Corresponding Python Code

**Note:** This section is only relevant if you are interested in the [stub language][stub-language].

Parameters must be ordered the same way in Python as they are in Safe-DS. Moreover, for each parameter the following elements must match:

- Name
- Type
- Optionality (required vs. optional)
- Default value for optional parameters

Let's look at these elements in turn.

### Matching Name

By default, parameter names in Safe-DS must be identical to their names in Python. If this is not desired, for example due to clashing name conventions in Safe-DS and Python, the `#!sds @PythonName` annotation can be used to link a Safe-DS parameter to a Python parameter with a different name. Here is an example:

```py title="Python"
def accuracy(x_pred: Dataset, x_test: Dataset) -> float:
    pass
```

```sds title="Safe-DS" hl_lines="2-3"
fun accuracy(
    @PythonName("x_pred") xPred: Dataset,
    @PythonName("x_test") xTest: Dataset
) -> accuracy: Float
```

In this case, the Safe-DS parameters `#!sds xPred` and `#!sds xTest` refer to the Python parameters `#!py x_pred` and `#!py x_test` respectively.

### Matching Type

The Safe-DS type of a parameter should capture the legal values of this parameter accurately. Ideally, the Python parameter should also have a matching [type hint][types-python].

### Matching Optionality

Parameters kinds must match on the Safe-DS and Python sides as well. Concretely, this means:

- All required parameters in Safe-DS must be required in Python.
- All optional parameters in Safe-DS must be optional in Python.

Moreover, it must be possible to pass

- required parameters by position, and
- optional parameters by name.

These rules allow us to restrict required parameters to [positional-only][python-positional-only] or optional parameters to [keyword-only][python-keyword-only]. We can also keep both unrestricted.

The following three examples show valid pairs of Python and Safe-DS programs.

#### Required Parameter

```py title="Python"
def required(a: int):
    pass
```

```sds title="Safe-DS"
fun required(a: Int)
```

#### Optional Parameter

```py title="Python"
def optional(a: int = 1):
    pass
```

```sds title="Safe-DS"
fun optional(a: Int = 1)
```

### Matching Default Value

Most commonly, default values in Python are literals, since default values are only evaluated once in Python rather than every time the function is called. The following table shows how Safe-DS literals and Python literals correspond:

| Safe-DS Literal                       | Python Literal                    |
|---------------------------------------|-----------------------------------|
| `#!sds 1` ([int][int-literals])             | `#!py 1`                          |
| `#!sds 1.0` ([float][float-literals])       | `#!py 1.0`                        |
| `#!sds "hello"` ([string][string-literals]) | `#!py "hello"` or `#!sds 'hello'` |
| `#!sds false` ([boolean][boolean-literals]) | `#!py False`                      |
| `#!sds true` ([boolean][boolean-literals])  | `#!py True`                       |
| `#!sds null` ([null][null-literals])        | `#!py None`                       |

[types]: types.md
[types-python]: types.md#corresponding-python-code
[segments]: ../pipeline-language/segments.md
[calls]: ../pipeline-language/expressions.md#calls
[stub-language]: README.md
[int-literals]: ../pipeline-language/expressions.md#int-literals
[float-literals]: ../pipeline-language/expressions.md#float-literals
[string-literals]: ../pipeline-language/expressions.md#string-literals
[boolean-literals]: ../pipeline-language/expressions.md#boolean-literals
[null-literals]: ../pipeline-language/expressions.md#sds-null-literal
[python-keyword-only]: https://peps.python.org/pep-3102/
[python-positional-only]: https://peps.python.org/pep-0570/
