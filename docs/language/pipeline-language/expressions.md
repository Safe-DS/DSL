# Expressions

Expressions are the parts of the [pipeline language][pipeline-language] that evaluate to some value. A multitude of different expression types known from other programming languages are supported by Safe-DS, from basic [literals](#literals) to [lambdas](#lambdas).

## Literals

Literals are the basic building blocks of expressions. They describe a fixed, constant value.

### Int Literals

Int literals denote integers. They use the expected syntax. For example, the integer three is written as `3`.

### Float Literals

Float literals denote floating point numbers. There are two ways to specify them:

- **Decimal form**: One half can be written as `0.5`. Note that neither the integer part nor the decimal part can be omitted, so `.5` and `0.` are syntax errors.
- **Scientific notation**: Writing very large or very small numbers in decimal notation can be cumbersome. In those cases, [scientific notation](https://en.wikipedia.org/wiki/Scientific_notation) is helpful. For example, one thousandth can be written in Safe-DS as `1.0e-3` or `1.0E-3`. You can read this as `1.0 × 10⁻³`. When scientific notation is used, it is allowed to omit the decimal part, so this can be shortened to `1e-3` or `1E-3`.

### String Literals

String literals describe text. Their syntax is simply text enclosed by double quotes: `"Hello, world!"`. Various special characters can be denoted with _escape sequences_:

| Escape sequence | Meaning                                                              |
|-----------------|----------------------------------------------------------------------|
| `\b`            | Backspace                                                            |
| `\t`            | Tab                                                                  |
| `\n`            | New line                                                             |
| `\f`            | Form feed                                                            |
| `\r`            | Carriage return                                                      |
| `\"`            | Double quote                                                         |
| `\'`            | Single quote                                                         |
| `\\`            | Backslash                                                            |
| `\{`            | Opening curly brace (used for [template strings](#template-strings)) |
| `\uXXXX`        | Unicode character, where `XXXX` is its hexadecimal index             |

String literals can contain also contain raw line breaks:

```txt
"Hello,

world!"
```

In order to interpolate text with other computed values, use [template strings](#template-strings).

### Boolean Literals

To work with truthiness, Safe-DS has the two boolean literals `false` and `true`.

### `null` Literal

To denote that a value is unknown or absent, use the literal `null`.

## Operations

Operations are special functions that can be applied to one or two expressions. Safe-DS has a fixed set of operations that cannot be extended. We distinguish between

- prefix operations (general form `<operator> <operand>`), and
- infix operations (general form `<left operand> <operator> <right operand>`).

### Operations on Numbers

Numbers can be negated using the unary `-` operator:

- The integer negative three is `-3`.
- The float negative three is `-3.0`.

The usual arithmetic operations are also supported for integers, floats and combinations of the two. Note that when either operand is a float, the whole expression is evaluated to a float.

- Addition: `0 + 5` (result is an integer)
- Subtraction: `6 - 2.9` (result is a float)
- Multiplication: `1.1 * 3` (result is a float)
- Division: `1.0 / 4.2` (result is a float)

Finally, two numbers can be compared, which results in a boolean. The integer `3` for example is less than the integer `5`. Safe-DS offers operators to do such checks for order:

- Less than: `5 < 6`
- Less than or equal: `1 <= 3`
- Greater than or equal: `7 >= 7`
- Greater than: `9 > 2`

### Logical Operations

To work with logic, Safe-DS has the two boolean literals `false` and `true` as well as operations to work with them:

- (Logical) **negation** (example `not a`): Output is `true` if and only if the operand is false:

| `not a` | false | true  |
|---------|-------|-------|
| &nbsp;  | true  | false |

- **Conjunction** (example `a and b`): Output is `true` if and only if both operands are `true`. Note that the second operand is always evaluated, even if the first operand is `false` and, thus, already determines the result of the expression. The operator is not short-circuited:

| `a and b` | false | true  |
|-----------|-------|-------|
| **false** | false | false |
| **true**  | false | true  |

- **Disjunction** (example `a or b`): Output is `true` if and only if at least one operand is `true`. Note that the second operand is always evaluated, even if the first operand is `true` and, thus, already determines the result of the expression. The operator is not short-circuited:

| `a or b`  | false | true |
|-----------|-------|------|
| **false** | false | true |
| **true**  | true  | true |

### Equality Checks

There are two different types of equality in Safe-DS, _identity_ and _structural equality_. Identity checks if two objects are one and the same, whereas structural equality checks if two objects have the same structure and content. Using a real world example, two phones of the same type would be structurally equal but not identical. Both types of equality checks return a boolean literal `true` if the check was positive and `false` if the check was negative. The syntax for these operations is as follows:

- Identity: `1 === 2`
- Structural equality: `1 == 2`

Safe-DS also has shorthand versions for negated equality checks which should be used instead of an explicit logical negation with the `not` operator:

- Negated identity: `1 !== 2`
- Negated structural equality: `1 != 2`

### Elvis Operator

The elvis operator `?:` (given its name because it resembles Elvis's haircut) is used to specify a default value that should be used instead if the left operand is `null`. This operator is not short-circuited, so both operand are always evaluated. In the following example the whole expression evaluates to `nullableExpression` if this value is not `null` and to `42` if it is:

```txt
nullableExpression ?: 42
```

## Template Strings

[String literals](#string-literals) can only be used to denote a fixed string. Sometimes, however, parts of the string have to be computed and then interpolated into the remaining text. This is done with template strings. Here is an example:

```txt
"1 + 2 = {{ 1 + 2 }}"
```

The syntax for template strings is similar to [string literals](#string-literals): They are also delimited by double quotes, the text can contain escape sequences, and raw newlines can be inserted. The additional syntax are _template expressions_, which are any expression enclosed by `{{` and `}}`. There must be no space between the curly braces.

These template expressions are evaluated, converted to a string and inserted into the template string at their position. The template string in the example above is, hence, equivalent to the [string literal](#string-literals) "1 + 2 = 3".

## References

References are used to refer to a declaration, such as a [class][classes] or a [placeholder][placeholders]. The syntax is simply the name of the declaration, as shown in the next snippet where we first declare a [placeholder][placeholders] called `one` and then refer to it when computing the value for the [placeholder][placeholders] called `two`:

```txt
val one = 1;
val two = one + one;
```

In order to refer to global declarations in other [packages][packages], we first need to [import][imports] them.

## Calls

Calls are used to trigger the execution of a specific action, which can, for example, be the creation of an instance of a [class][classes] or executing the code in a [step][steps]. Let's look at an example:

First, we show the code of the [step][steps] that we want to call.

```txt
step createDecisionTree(maxDepth: Int = 10) {
    // ... do something ...
}
```

This [step][steps] has a single [parameter][parameters] `maxDepth`, which must have [type][types] `Int`, and has the default value `10`. Since it has a default value, we are not required to specify a value when we call this [step][steps]. The most basic legal call of the [step][steps] is, thus, this:

```txt
createDecisionTree()
```

This calls the [step][steps] `createDecisionTree`, using the default `maxDepth` of `10`.

The syntax consists of these elements:

- The _callee_ of the call, which is the expression to call (here a [reference](#references) to the [step][steps] `createDecisionTree`)
- The list of arguments, which is delimited by parentheses. In this case the list is empty, so no arguments are passed.

If we want to override the default value of an optional [parameter][parameters] or if the callee has required [parameters][parameters], we need to pass arguments. We can either use _positional arguments_ or _named arguments_.

In the case of positional arguments, they are mapped to parameters by position, i.e. the first argument is assigned to the first parameter, the second argument is assigned to the second parameter and so forth. We do this in the following example to set `maxDepth` to 5:

```txt
createDecisionTree(5)
```

The syntax for positional argument is simply the expression we want to pass as value.

Named arguments, however, are mapped to parameters by name. On the one hand, this can improve readability of the code, since the meaning of a value becomes obvious. On the other hand, it allows to override only specific optional parameters and keep the rest unchanged. Here is how to set `maxDepth` to 5 using a named argument:

```txt
createDecisionTree(maxDepth = 5)
```

These are the syntactic elements:

- The name of the parameter for which we want to specify a value.
- An equals sign.
- The value to assign to the parameter.

### Passing Multiple Arguments

We now add another parameter to the `createDecisionTree` [step][steps]:

```txt
step createDecisionTree(isBinary: Boolean, maxDepth: Int = 10) {
    // ... do something ...
}
```

This allows us to show how multiple arguments can be passed:

```txt
createDecisionTree(isBinary = true, maxDepth = 5)
```

We have already seen the syntax for a single argument. If we want to pass multiple arguments, we just separate them by commas. A trailing comma is allowed.

### Restrictions For Arguments

There are some restriction regarding the choice of positional vs. named arguments and passing arguments in general:

- For all [parameters][parameters] of the callee there must be at most one argument.
- For all [required parameters][required-parameters] there must be exactly one argument.
- After a named argument all arguments must be named.
- [Variadic parameters][variadic-parameters] can only be assigned by position.

### Legal Callees

Depending on the callee, a call can do different things. The following table lists all legal callees and what happens if they are called:

| Callee                                           | Meaning                                                                                                                        |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [Class][classes]                                 | Create a new instance of the class. The class must have a constructor to be callable. The call evaluates to this new instance. |
| [Enum Variant][enum-variants]                    | Creates a new instance of the enum variant. Enum variants are always callable. The call evaluates to this new instance.        |
| [Global Function][global-functions]              | Invokes the function and runs the associated Python code. The call evaluates to the result record of the function.             |
| [Method][methods]                                | Invokes the method and runs the associated Python code. The call evaluates to the result record of the method.                 |
| [Step][steps]                                    | Invokes the step and runs the Safe-DS code in its body. The call evaluates to the result record of the step.                   |
| [Block Lambda](#block-lambdas)                   | Invokes the lambda and runs the Safe-DS code in its body. The call evaluates to the result record of the lambda.               |
| [Expression Lambda](#expression-lambdas)         | Invokes the lambda and runs the Safe-DS code in its body. The call evaluates to the result record of the lambda.               |
| Declaration with [Callable Type][callable-types] | Call whatever the value of the declaration is.                                                                                 |

#### Result Record

The term _result record_ warrants further explanation: A result record maps [results][results] of a

- [global function][global-functions],
- [method][methods],
- [step][steps], or
- [lambda](#lambdas)

to their computed values.

If the result record only has a single entry, its value can be accessed directly. Otherwise, the result record must be _deconstructed_ either by an [assignment][assignment-multiple-assignees] (can access multiple results) or by a [member access](#member-access-of-results) (can access a single result).

## Member Accesses

A member access is used to refer to members of a complex data structure such as

- a [class][classes],
- an [enum][enums], or
- the [result record](#result-record) of a [call](#calls).

The general syntax of a member access is this:

```txt
<receiver>.<member>
```

Here, the receiver is some expression (the legal choices are explained below), while the member is always a [reference](#references).

### Member Access of Class Members

To understand how we can access members of a [class][classes] we must first look briefly at a declaration of the [class][classes] we use in the following examples:

```txt
class DecisionTree() {
    static attr verboseTraining: Boolean

    attr maxDepth: Int
}
```

This class has a static [attribute][attributes] called `verboseTraining`, which has type `Boolean`. Static means that the attribute is shared between all instances of the class and can be accessed on the class itself, rather than a specific instance.

Moreover, the class has an instance [attribute][attributes]`maxDepth`, which is an integer. This must be accessed on a specific instance of the class.

#### Member Access of Static Class Member

Let us look at how to access the static [attribute][attributes] `verboseTraining` to retrieve its value:

```txt
DecisionTree.verboseTraining
```

These are the syntactic elements of this member access:

- The receiver, which is the name of the class (here `DecisionTree`)
- A dot.
- The name of the static member of the class (here `verboseTraining`)

Note that we cannot access a static member from an instance of the class. We must use the class itself.

#### Member Access of Instance Class Member

Contrary to static member accesses, we can only access instance members on an instance of a class:

```txt
DecisionTree().maxDepth
```

We now take apart the syntax again:

- The receiver, here a [call](#calls) of the constructor of the class `DecisionTree`. This creates an instance of this class.
- A dot.
- The name of the instance member (here `maxDepth`).

Note that instance members cannot be accessed from the class itself, but only from its instances.

##### Null-Safe Member Access

If an expression could be `null` it cannot be used as the receiver of a regular member access, since `null` does not have members. Instead a null-safe member access must be used. A null-safe member access evaluates to `null` if its receiver is `null`. Otherwise, it evaluates to the accessed member, just like a normal member access.

The syntax is identical to a normal member access except that we replace the dot with the operator `?.`:

```txt
nullableExpression?.member
```

### Member Access of Enum Variants

A member access can also be used to access the [variants][enum-variants] of an [enum][enums]. Here is the declaration of the [enum][enums] that we use in the example:

```txt
enum SvmKernel {
    Linear,
    RBF
}
```

This [enum][enums] is called `SvmKernel` and has the two [variants][enum-variants] `Linear` and `RBF`.

We can access the [variant][enum-variants] `Linear` using this member access:

```txt
SvmKernel.Linear
```

These are the elements of the syntax:

- The receiver, which is the name of the [enum][enums] (here `SvmKernel`).
- A dot.
- The name of the [variant][enum-variants] (here `Linear`).

This syntax is identical to the [member access of static class members](#member-access-of-static-class-member).

### Member Access of Results

If the [result record](#result-record) that is produced by a [call](#calls) has multiple results, we can use a member access to select a single one. Here is the [global function][global-functions] we use to explain this concept:

```txt
fun divideWithRemainder(dividend: Int, divisor: Int) -> (quotient: Int, remainder: Int)
```

The [global function][global-functions] `divideWithRemainder` has two [parameters][parameters], namely `dividend` and `divisor`, both of which have type `Int`. It produces two [results][results], `quotient` and `remainder`, which also have type `Int`.

If we are only interested in the remainder of `12` divided by `5`, we can use a member access:

```txt
divideWithRemainder(12, 5).remainder
```

Here are the syntactic elements:

- The receiver, which is a [call](#calls).
- A dot.
- The name of the result (here `remainder`).

While it is also possible to access the result by name if the [result record](#result-record) contains only a single entry, there is no need to do so, since this result can be used directly. If you still use a member access and the singular result of the call has the same name as an instance member of the corresponding class, the instance member wins.

To explain this concept further, we need the following declarations:

```txt
class ValueWrapper {
    attr value: Int
}

fun createValueWrapper() -> value: ValueWrapper
```

We first declare a [class][classes] called `ValueWrapper`, which has an [attribute][attributes] `value` of type `Int`. Next, we declare a function, which is supposed to create an instance of the [class][classes] `ValueWrapper` and put it into the [result][results] `value`.

Let us now look at this member access:

```txt
createValueWrapper().value
```

This evaluates to the [attribute][attributes], i.e. an integer, rather than the [result][results], which would be an instance of `ValueWrapper`.

If you want the result instead, simply omit the member access:

```txt
createValueWrapper()
```

## Indexed Accesses

An indexed access is currently only used to access one value assigned to a [variadic parameter][variadic-parameters]. In the following example, we use an index access to retrieve the first value that is assigned to the [variadic parameter][variadic-parameters] `values` of the step `printFirst`:

```txt
step printFirst(vararg values: Int) {
    print(values[0]);
}
```

These are the elements of the syntax:

- The name of the variadic parameter (here `values`).
- An opening square bracket.
- The index, which is an expression that evaluates to an integer. The first element has index 0.
- A closing square bracket.

Note that accessing a value at an index outside the bounds of the value list currently only raises an error at runtime.

## Chaining

Multiple [calls](#calls), [member accesses](#member-accesses), and [indexed accesses](#member-accesses) can be chained together. Let us first look at the declaration of the [class][classes] we need for the example:

```txt
class LinearRegression() {
    fun drawAsGraph()
}
```

This is a [class][classes] `LinearRegression`, which has a constructor and an instance [method][methods] called `drawAsGraph`.

We can then use those declarations in a [step][steps]:

```txt
step myStep(vararg regressions: LinearRegression) {
    regressions[0].drawAsGraph();
}
```

This step is called `myStep` and has a [variadic parameter][variadic-parameters] `regressions` of type `LinearRegression`. This means we can pass an arbitrary number of instances of `LinearRegression` to the step when we [call](#calls) it.

In the body of the step we then

1. access the first instance that was pass using an [indexed access](#indexed-accesses),
2. access the instance method `drawAsGraph` of this instance using a [member access](#member-accesses),
3. [call](#calls) this method.

## Lambdas

If you want to write reusable blocks of code, use a [step][steps]. However, sometimes you need to create a highly application-specific callable that can be passed as argument to some function or returned as the result of a [step][steps]. We will explain this concept by filtering a list. Here are the relevant declarations:

```txt
class IntList {
    fun filter(filterFunction: (element: Int) -> shouldKeep: Boolean) -> filteredList: IntList
}

fun intListOf(vararg elements: Int) -> result: IntList
```

First, we declare a [class][classes] `IntList`, which has a single [method][methods] called `filter`. The `filter` method returns a single result called `filteredList`, which is a new `IntList`. `filteredList` is supposed to only contain the elements of the receiving `IntList` for which the `filterFunction` [parameter][parameters] returns `true`.

Second, we declare a [global function][global-functions] `intListOf` that is supposed to wrap `elements` into an `IntList`.

Say, we now want to keep only the elements in the list that are less than `10`. We can do this by declaring a [step][steps]:

```txt
step keepLessThan10(a: Int) -> shouldKeep: Boolean {
    yield shouldKeep = a < 10;
}
```

Here is how to solve the task of keeping only elements below `10` with this [step][steps]:

```txt
intListOf(1, 4, 11).filter(keepLessThan10)
```

The [call](#calls) to `intListOf` is just there to create an `IntList` that we can use for filtering. The interesting part is the argument we pass to the `filter` [method][methods], which is simply a reference to the [step][steps] we declared above.

The problem here is that this solution is very cumbersome and verbose. We need to come up with a name for a [step][steps] that we will likely use only once. Moreover, the step must declare the [types][types] of its [parameters][parameters] and its [results][results] in its header. Finally, the declaration of the step has to happen in a separate location then its use. We can solve those issues with lambdas.

### Block Lambdas

We will first rewrite the above solution using a _block lambda_, which is essentially a [step][steps] without a name and more concise syntax that can be declared where it is needed:

```txt
intListOf(1, 4, 11).filter(
    (a) { yield shouldKeep = a < 10; }
)
```

While this appears longer than the solution with [steps][steps], note that it replaces both the declaration of the [step][steps] as well as the [reference](#references) to it.

Here are the syntactic elements:

- A list of [parameters][parameters], which is enclosed in parentheses. Individual parameters are separated by commas.
- The _body_, which is a list of [statements][statements] enclosed in curly braces. Note that each [statement][statements] is terminated by a semicolon.

The results of a block lambda are [declared in its body using assignments][assignments-to-block-lambda-results].

### Expression Lambdas

Often, the body of a [block lambda](#block-lambdas) only consists of yielding a single result, as is the case in the example above. The syntax of [block lambdas](#block-lambdas) is quite verbose for such a common use-case, which is why Safe-DS has _expression lambdas_ as a shorter but less flexible alternative. Using an expression lambda we can rewrite the example above as

```txt
intListOf(1, 4, 11).filter(
    (a) -> a < 10
)
```

These are the syntactic elements:

- A list of [parameters][parameters], which is enclosed in parentheses. Individual parameters are separated by commas.
- An arrow `->`.
- The expression that should be returned.

### Closures

**Note:** This is advanced concept, so feel free to skip this section initially.

Both [block lambdas](#block-lambdas) and [expression lambdas](#expression-lambdas) are closures, which means they remember the values of [placeholders][placeholders] and [parameters][parameters] that can be accessed within their body at the time of their creation. Here is an example:

```txt
step lazyValue(value: Int) -> result: () -> storedValue: Int {
    yield result = () -> value
}
```

This deserves further explanation: We declare a [step][steps] `lazyValue`. It takes a single [required parameter][required-parameters] `value` with type `Int`. It produces a single [result][results] called `result`, which has a [callable type][callable-types] that takes no [parameters] and produces a single [result][results] called `storedValue` with type `Int`. In the [body][step-body] of the [step][steps] we then [assign][assignments-to-step-results] an [expression lambda](#expression-lambdas) to the [result][results] `result`.

The interesting part here is that we [refer to](#references) to the [parameter][parameters] `value` within the expression of the lambda. Since lambdas are closures, this means the current `value` is stored when the lambda is created. When we later call this lambda, exactly this value is returned.

### Restrictions

At the moment, lambdas can only be used if the context determines the type of its parameters. Concretely, this means we can use lambdas in these two places:

- As an argument that is assigned to a [parameter][parameters] with a [type][types] in a [call](#calls).
- As the value that is [assigned to a result of a step][assignments-to-step-results].
    In other cases, declare a step instead and use a [reference](#references) to this step where you would write the lambda.

## Precedence

We all know that `2 + 3 * 7` is `23` and not `35`. The reason is that the `*` operator has a higher precedence than the `+` operator and is, therefore, evaluated first. These precedence rules are necessary for all types of expressions listed above and shown in the following list. The higher up an expression is in the list, the higher its precedence and the earlier it is evaluated. Expressions listed beside each other have the same precedence and are evaluated from left to right:

- **HIGHER PRECEDENCE**
- `()` (parentheses around an expression)
- `1` ([integer literals](#int-literals)), `1.0` ([float literals](#float-literals)), `"a"` ([string literals](#string-literals)), `true`/`false` ([boolean literals](#boolean-literals)), `null` ([null literal](#null-literal)), `someName` ([references](#references)), `"age: {{ age }}"` ([template strings](#template-strings))
- `()` ([calls](#calls)), `.` ([member accesses](#member-accesses)), `?.` ([null-safe member accesses](#null-safe-member-access)), `[]` ([indexed accesses](#indexed-accesses))
- `-` (unary, [arithmetic negations](#operations-on-numbers))
- `?:` ([Elvis operators](#elvis-operator))
- `*`, `/` ([multiplicative operators](#operations-on-numbers))
- `+`, `-` (binary, [additive operators](#operations-on-numbers))
- `<`, `<=`, `>=`, `>` ([comparison operators](#operations-on-numbers))
- `===`, `==`, `!==`, `!=` ([equality operators](#equality-checks))
- `not` ([logical negations](#logical-operations))
- `and` ([conjunctions](#logical-operations))
- `or` ([disjunctions](#logical-operations))
- `() -> 1` ([expression lambdas](#expression-lambdas)), `() {}` ([block lambdas](#block-lambdas))
- **LOWER PRECEDENCE**

If the default precedence of operators is not sufficient, parentheses can be used to force a part of an expression to be evaluated first.

[imports]: ../common/imports.md
[packages]: ../common/packages.md
[parameters]: ../common/parameters.md
[required-parameters]: ../common/parameters.md#required-parameters
[variadic-parameters]: ../common/parameters.md#variadic-parameters
[results]: ../common/results.md
[types]: ../common/types.md
[callable-types]: ../common/types.md#callable-types
[classes]: ../stub-language/classes.md
[attributes]: ../stub-language/classes.md#defining-attributes
[methods]: ../stub-language/classes.md#defining-methods
[enums]: ../stub-language/enumerations.md
[enum-variants]: ../stub-language/enumerations.md#enum-variants
[global-functions]: ../stub-language/global-functions.md
[pipeline-language]: README.md
[statements]: statements.md
[assignment-multiple-assignees]: statements.md#multiple-assignees
[assignments-to-step-results]: statements.md#yielding-results-of-steps
[assignments-to-block-lambda-results]: statements.md#declare-results-of-block-lambdas
[placeholders]: statements.md#declaring-placeholders
[steps]: steps.md
[step-body]: steps.md#statements
