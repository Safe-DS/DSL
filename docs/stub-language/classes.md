# Classes

Classes can be used to define custom datatypes that bundle data and operations on this data.

## Defining Classes

To define a class we use the following syntax:

* The keyword `#!sds class`.
* The name of the class ("Lasso" in the following examples).
* To define the constructor of the class we list the _parameters_ (inputs) necessary to create an instance. This list is enclosed in parentheses and separated by commas, `#!sds (regularizationStrength: Float)` in the following snippet. For each parameter, we list the name of the parameter followed by a colon and its type.
* Finally, we have the _body_ of the class, which lists the members ([attributes](#defining-attributes) for data and [methods](#defining-methods) for operations on this data, as explained in the following sections) of the class enclosed by curly braces.

```sds
class Lasso(regularizationStrength: Float) {
    // ...
}
```

### Defining Attributes

The data of a class is called _attributes_. We differentiate _static attributes_, which are available on the class itself, and _instance attributes_, which are available on instances on the class. Here is the syntax to define attributes:

* The modifier keyword `#!sds static` to define a static attribute (no modifier needed to define an instance attribute).
* The keyword `#!sds attr`.
* The name of the attribute ("regularizationStrength" in the following example).
* A colon followed by the type of the attribute ("Float" in the next example).

```sds
class Lasso(regularizationStrength: Float) {
    attr regularizationStrength: Float

   // ...
}
```

### Defining Methods

_Methods_ represent operations on the attributes of a class. As with attributes we differentiate _static methods_, which are accessible from the class itself, and _instance methods_, which are available on instances of the class. The syntax to define methods is as follows:

* The modifier keyword `#!sds static` to define a static method (no modifier needed to define an instance method).
* The keyword `#!sds fun`.
* The name of the attribute ("fit" in the following example).
* The list of _parameters_ (inputs) enclosed in parentheses and separated by commas (`(features: Table, target: Table)` in the following snippet). For each parameter we list the name of the parameter followed by a colon and its type.
* Optionally, we can list the _results_ (outputs) after the symbol `#!sds ->`. If this section is missing it means the method does not produce results. The list of results is again enclosed in parentheses and we use commas to separate the entries. If there is exactly one result we can omit the parentheses (see `#!sds -> trainedModel: Lasso` in the following example). For each result we specify its name followed by a colon and its type.

```sds
class Lasso(regularizationStrength: Float) {
    attr regularizationStrength: Float

    fun fit(features: Table, target: Table) -> trainedModel: Lasso
}
```

## Constructors

**TODO**

## Subclassing

**TODO**

## Using a Class as a Type

To express that the type of a declaration is some class we simply write the name of the class as the type. For example, we could declare a function that plots the line learned by a ridge regression model like this:

```sds
fun plotRidge(model: Ridge)
```
