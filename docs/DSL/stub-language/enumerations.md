# Enumerations

An enumeration is a datatype that can take a fixed, finite set of values. The [Ridge model of scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Ridge.html#sklearn.linear_model.Ridge) for instance allows the user to choose a solver by selecting one of the strings "auto", "svd", "cholesky", "lsqr", "sparse_cg", "sag", "saga". However, the string datatype does not prevent the user from passing another invalid string like "automatic", leading to unspecified behavior. To prevent this, in Safe-DS the solver is an enumeration.

## Declaring an Enumeration

The syntax to declare an enumeration is as follows:

* The keyword `enum`.
* The name of the enumeration.
* A list of the _instances_, i. e. the valid values of the enumeration enclosed in curly braces and separated by commas.

Coming back to the ridge solver example from the introduction, we would implement this in Safe-DS as follows, so that only the seven specified values are valid instances of the datatype.

```txt
enum RidgeSolver {
    AUTO,
    SVD,
    CHOLESKY,
    LSQR,
    SPARSE_CG,
    SAG,
    SAGA
}
```

## Enum Variants

**TODO**

### Constructors

**TODO**

## Using an Enumeration as a Type

To express that the type of a declaration is an enumeration we simply write the name of the enumeration as the type. For example, when declaring a [class][classes] called "Ridge" for the ridge regression model we can declare a parameter of type "RidgeSolver" like this:

```txt
class Ridge(solver: RidgeSolver) {
    // ...
}
```

[classes]: classes.md
