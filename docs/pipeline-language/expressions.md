# Expressions

Expressions are the parts of the [pipeline language][pipeline-language] that evaluate to some value. A multitude of different expression types known from other programming languages are supported by Safe-DS, from basic [literals](#literals) to [lambdas](#lambdas).

## Literals

Literals are the basic building blocks of expressions. They describe a fixed, constant value.

### Int Literals

Int literals denote integers. They use the expected syntax. For example, the integer three is written as `#!sds 3`.

### Float Literals

Float literals denote floating point numbers. There are two ways to specify them:

- **Decimal form**: One half can be written as `#!sds 0.5`. Note that neither the integer part nor the decimal part can be omitted, so `#!sds .5` and `#!sds 0.` are syntax errors.
- **Scientific notation**: Writing very large or very small numbers in decimal notation can be cumbersome. In those cases, [scientific notation](https://en.wikipedia.org/wiki/Scientific_notation) is helpful. For example, one thousandth can be written in Safe-DS as `#!sds 1.0e-3` or `#!sds 1.0E-3`. You can read this as `#!sds 1.0 × 10⁻³`. When scientific notation is used, it is allowed to omit the decimal part, so this can be shortened to `#!sds 1e-3` or `#!sds 1E-3`.

### String Literals

String literals describe text. Their syntax is simply text enclosed by double quotes: `#!sds "Hello, world!"`. Various special characters can be denoted with _escape sequences_:

| Escape sequence | Meaning                                                              |
|-----------------|----------------------------------------------------------------------|
| `\b`            | Backspace                                                            |
| `\f`            | Form feed                                                            |
| `\n`            | New line                                                             |
| `\r`            | Carriage return                                                      |
| `\t`            | Tab                                                                  |
| `\v`            | Vertical tab                                                         |
| `\0`            | Null character                                                       |
| `\'`            | Single quote                                                         |
| `\"`            | Double quote                                                         |
| `\{`            | Opening curly brace (used for [template strings](#template-strings)) |
| `\\`            | Backslash                                                            |
| `\uXXXX`        | Unicode character, where `XXXX` is its hexadecimal code              |

String literals can contain also contain raw line breaks:

```sds
"Hello,

world!"
```

In order to interpolate text with other computed values, use [template strings](#template-strings).

### Boolean Literals

To work with truthiness, Safe-DS has the two boolean literals `#!sds false` and `#!sds true`.

### `#!sds null` Literal

To denote that a value is unknown or absent, use the literal `#!sds null`.

## Operations

Operations are special functions that can be applied to one or two expressions. Safe-DS has a fixed set of operations that cannot be extended. We distinguish between

- prefix operations (general form `#!sds <operator> <operand>`), and
- infix operations (general form `#!sds <left operand> <operator> <right operand>`).

### Operations on Numbers

Numbers can be negated using the unary `#!sds -` operator:

- The integer negative three is `#!sds -3`.
- The float negative three is `#!sds -3.0`.

The usual arithmetic operations are also supported for integers, floats and combinations of the two. Note that when either operand is a float, the whole expression is evaluated to a float.

- Addition: `#!sds 0 + 5` (result is an integer)
- Subtraction: `#!sds 6 - 2.9` (result is a float)
- Multiplication: `#!sds 1.1 * 3` (result is a float)
- Division: `#!sds 1.0 / 4.2` (result is a float)

Finally, two numbers can be compared, which results in a boolean. The integer `#!sds 3` for example is less than the integer `#!sds 5`. Safe-DS offers operators to do such checks for order:

- Less than: `#!sds 5 < 6`
- Less than or equal: `#!sds 1 <= 3`
- Greater than or equal: `#!sds 7 >= 7`
- Greater than: `#!sds 9 > 2`

### Logical Operations

To work with logic, Safe-DS has the two boolean literals `#!sds false` and `#!sds true` as well as operations to work with them:

- (Logical) **negation** (example `#!sds not a`): Output is `#!sds true` if and only if the operand is false:

| `#!sds not a` | false | true  |
|---------|-------|-------|
| &nbsp;  | true  | false |

- **Conjunction** (example `#!sds a and b`): Output is `#!sds true` if and only if both operands are `#!sds true`. Note that the second operand is always evaluated, even if the first operand is `#!sds false` and, thus, already determines the result of the expression. The operator is not short-circuited:

| `#!sds a and b` | false | true  |
|-----------|-------|-------|
| **false** | false | false |
| **true**  | false | true  |

- **Disjunction** (example `#!sds a or b`): Output is `#!sds true` if and only if at least one operand is `#!sds true`. Note that the second operand is always evaluated, even if the first operand is `#!sds true` and, thus, already determines the result of the expression. The operator is not short-circuited:

| `#!sds a or b`  | false | true |
|-----------|-------|------|
| **false** | false | true |
| **true**  | true  | true |

### Equality Checks

There are two different types of equality in Safe-DS, _identity_ and _structural equality_. Identity checks if two objects are one and the same, whereas structural equality checks if two objects have the same structure and content. Using a real world example, two phones of the same type would be structurally equal but not identical. Both types of equality checks return a boolean literal `#!sds true` if the check was positive and `#!sds false` if the check was negative. The syntax for these operations is as follows:

- Identity: `#!sds 1 === 2`
- Structural equality: `#!sds 1 == 2`

Safe-DS also has shorthand versions for negated equality checks which should be used instead of an explicit logical negation with the `#!sds not` operator:

- Negated identity: `#!sds 1 !== 2`
- Negated structural equality: `#!sds 1 != 2`

### Elvis Operator

The elvis operator `#!sds ?:` (given its name because it resembles Elvis's haircut) is used to specify a default value that should be used instead if the left operand is `#!sds null`. This operator is not short-circuited, so both operand are always evaluated. In the following example the whole expression evaluates to `#!sds nullableExpression` if this value is not `#!sds null` and to `#!sds 42` if it is:

```sds
nullableExpression ?: 42
```

## Template Strings

[String literals](#string-literals) can only be used to denote a fixed string. Sometimes, however, parts of the string have to be computed and then interpolated into the remaining text. This is done with template strings. Here is an example:

```sds
"1 + 2 = {{ 1 + 2 }}"
```

The syntax for template strings is similar to [string literals](#string-literals): They are also delimited by double quotes, the text can contain escape sequences, and raw newlines can be inserted. The additional syntax are _template expressions_, which are any expression enclosed by `#!sds {{` and `#!sds }}`. There must be no space between the curly braces.

These template expressions are evaluated, converted to a string and inserted into the template string at their position. The template string in the example above is, hence, equivalent to the [string literal](#string-literals) `#!sds "1 + 2 = 3"`.

## References

References are used to refer to a declaration, such as a [class][classes] or a [placeholder][placeholders]. The syntax is simply the name of the declaration, as shown in the next snippet where we first declare a [placeholder][placeholders] called `#!sds one` and then refer to it when computing the value for the [placeholder][placeholders] called `#!sds two`:

```sds
val one = 1;
val two = one + one;
```

In order to refer to global declarations in other [packages][packages], we first need to [import][imports] them.

## Calls

Calls are used to trigger the execution of a specific action, which can, for example, be the creation of an instance of a [class][classes] or executing the code in a [segment][segments]. Let's look at an example:

First, we show the code of the [segment][segments] that we want to call.

```sds
segment createDecisionTree(maxDepth: Int = 10) {
    // ... do something ...
}
```

This [segment][segments] has a single [parameter][parameters] `#!sds maxDepth`, which must have [type][types] `#!sds Int`, and has the default value `#!sds 10`. Since it has a default value, we are not required to specify a value when we call this [segment][segments]. The most basic legal call of the [segment][segments] is, thus, this:

```sds
createDecisionTree()
```

This calls the [segment][segments] `#!sds createDecisionTree`, using the default `#!sds maxDepth` of `#!sds 10`.

The syntax consists of these elements:

- The _callee_ of the call, which is the expression to call (here a [reference](#references) to the [segment][segments] `#!sds createDecisionTree`)
- The list of arguments, which is delimited by parentheses. In this case the list is empty, so no arguments are passed.

If we want to override the default value of an optional [parameter][parameters] or if the callee has required [parameters][parameters], we need to pass arguments. We can either use _positional arguments_ or _named arguments_.

In the case of positional arguments, they are mapped to parameters by position, i.e. the first argument is assigned to the first parameter, the second argument is assigned to the second parameter and so forth. We do this in the following example to set `#!sds maxDepth` to 5:

```sds
createDecisionTree(5)
```

The syntax for positional argument is simply the expression we want to pass as value.

Named arguments, however, are mapped to parameters by name. On the one hand, this can improve readability of the code, since the meaning of a value becomes obvious. On the other hand, it allows to override only specific optional parameters and keep the rest unchanged. Here is how to set `#!sds maxDepth` to 5 using a named argument:

```sds
createDecisionTree(maxDepth = 5)
```

These are the syntactic elements:

- The name of the parameter for which we want to specify a value.
- An equals sign.
- The value to assign to the parameter.

### Passing Multiple Arguments

We now add another parameter to the `#!sds createDecisionTree` [segment][segments]:

```sds
segment createDecisionTree(isBinary: Boolean, maxDepth: Int = 10) {
    // ... do something ...
}
```

This allows us to show how multiple arguments can be passed:

```sds
createDecisionTree(isBinary = true, maxDepth = 5)
```

We have already seen the syntax for a single argument. If we want to pass multiple arguments, we just separate them by commas. A trailing comma is allowed.

### Restrictions For Arguments

There are some restriction regarding the choice of positional vs. named arguments and passing arguments in general:

- For all [parameters][parameters] of the callee there must be at most one argument.
- For all [required parameters][required-parameters] there must be exactly one argument.
- After a named argument all arguments must be named.

### Legal Callees

Depending on the callee, a call can do different things. The following table lists all legal callees and what happens if they are called:

| Callee                                           | Meaning                                                                                                                        |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [Class][classes]                                 | Create a new instance of the class. The class must have a constructor to be callable. The call evaluates to this new instance. |
| [Enum Variant][enum-variants]                    | Creates a new instance of the enum variant. Enum variants are always callable. The call evaluates to this new instance.        |
| [Global Function][global-functions]              | Invokes the function and runs the associated Python code. The call evaluates to the result record of the function.             |
| [Method][methods]                                | Invokes the method and runs the associated Python code. The call evaluates to the result record of the method.                 |
| [Segment][segments]                                    | Invokes the segment and runs the Safe-DS code in its body. The call evaluates to the result record of the segment.                   |
| [Block Lambda](#block-lambdas)                   | Invokes the lambda and runs the Safe-DS code in its body. The call evaluates to the result record of the lambda.               |
| [Expression Lambda](#expression-lambdas)         | Invokes the lambda and runs the Safe-DS code in its body. The call evaluates to the result record of the lambda.               |
| Declaration with [Callable Type][callable-types] | Call whatever the value of the declaration is.                                                                                 |

#### Result Record

The term _result record_ warrants further explanation: A result record maps [results][results] of a

- [global function][global-functions],
- [method][methods],
- [segment][segments], or
- [lambda](#lambdas)

to their computed values.

If the result record only has a single entry, its value can be accessed directly. Otherwise, the result record must be _deconstructed_ either by an [assignment][assignment-multiple-assignees] (can access multiple results) or by a [member access](#member-access-of-results) (can access a single result).

### Null-Safe Calls

If an expression can be `#!sds null`, it cannot be used as the callee of a normal call. Instead, a null-safe call must be used. A null-safe call evaluates to `#!sds null` if its callee is `#!sds null`. Otherwise, it works just like a normal call. This is particularly useful for [chaining](#chaining).

The syntax is identical to a normal call except that we replace the `#!sds ()` with `#!sds ?()`:

```sds
nullableCallee?()
```

## Member Accesses

A member access is used to refer to members of a complex data structure such as

- a [class][classes],
- an [enum][enums], or
- the [result record](#result-record) of a [call](#calls).

The general syntax of a member access is this:

```sds
<receiver>.<member>
```

Here, the receiver is some expression (the legal choices are explained below), while the member is always a [reference](#references).

### Member Access of Class Members

To understand how we can access members of a [class][classes] we must first look briefly at a declaration of the [class][classes] we use in the following examples:

```sds
class DecisionTree() {
    static attr verboseTraining: Boolean

    attr maxDepth: Int
}
```

This class has a static [attribute][attributes] called `#!sds verboseTraining`, which has type `#!sds Boolean`. Static means that the attribute is shared between all instances of the class and can be accessed on the class itself, rather than a specific instance.

Moreover, the class has an instance [attribute][attributes]`maxDepth`, which is an integer. This must be accessed on a specific instance of the class.

#### Member Access of Static Class Member

Let us look at how to access the static [attribute][attributes] `#!sds verboseTraining` to retrieve its value:

```sds
DecisionTree.verboseTraining
```

These are the syntactic elements of this member access:

- The receiver, which is the name of the class (here `#!sds DecisionTree`)
- A dot.
- The name of the static member of the class (here `#!sds verboseTraining`)

Note that we cannot access a static member from an instance of the class. We must use the class itself.

#### Member Access of Instance Class Member

Contrary to static member accesses, we can only access instance members on an instance of a class:

```sds
DecisionTree().maxDepth
```

We now take apart the syntax again:

- The receiver, here a [call](#calls) of the constructor of the class `#!sds DecisionTree`. This creates an instance of this class.
- A dot.
- The name of the instance member (here `#!sds maxDepth`).

Note that instance members cannot be accessed from the class itself, but only from its instances.

### Member Access of Enum Variants

A member access can also be used to access the [variants][enum-variants] of an [enum][enums]. Here is the declaration of the [enum][enums] that we use in the example:

```sds
enum SvmKernel {
    Linear,
    RBF
}
```

This [enum][enums] is called `#!sds SvmKernel` and has the two [variants][enum-variants] `#!sds Linear` and `#!sds RBF`.

We can access the [variant][enum-variants] `#!sds Linear` using this member access:

```sds
SvmKernel.Linear
```

These are the elements of the syntax:

- The receiver, which is the name of the [enum][enums] (here `#!sds SvmKernel`).
- A dot.
- The name of the [variant][enum-variants] (here `#!sds Linear`).

This syntax is identical to the [member access of static class members](#member-access-of-static-class-member).

### Member Access of Results

If the [result record](#result-record) that is produced by a [call](#calls) has multiple results, we can use a member access to select a single one. Here is the [global function][global-functions] we use to explain this concept:

```sds
fun divideWithRemainder(dividend: Int, divisor: Int) -> (quotient: Int, remainder: Int)
```

The [global function][global-functions] `#!sds divideWithRemainder` has two [parameters][parameters], namely `#!sds dividend` and `#!sds divisor`, both of which have type `#!sds Int`. It produces two [results][results], `#!sds quotient` and `#!sds remainder`, which also have type `#!sds Int`.

If we are only interested in the remainder of `#!sds 12` divided by `#!sds 5`, we can use a member access:

```sds
divideWithRemainder(12, 5).remainder
```

Here are the syntactic elements:

- The receiver, which is a [call](#calls).
- A dot.
- The name of the result (here `#!sds remainder`).

While it is also possible to access the result by name if the [result record](#result-record) contains only a single entry, there is no need to do so, since this result can be used directly. If you still use a member access and the singular result of the call has the same name as an instance member of the corresponding class, the instance member wins.

To explain this concept further, we need the following declarations:

```sds
class ValueWrapper {
    attr value: Int
}

fun createValueWrapper() -> value: ValueWrapper
```

We first declare a [class][classes] called `#!sds ValueWrapper`, which has an [attribute][attributes] `#!sds value` of type `#!sds Int`. Next, we declare a function, which is supposed to create an instance of the [class][classes] `#!sds ValueWrapper` and put it into the [result][results] `#!sds value`.

Let us now look at this member access:

```sds
createValueWrapper().value
```

This evaluates to the [attribute][attributes], i.e. an integer, rather than the [result][results], which would be an instance of `#!sds ValueWrapper`.

If you want the result instead, simply omit the member access:

```sds
createValueWrapper()
```

### Null-Safe Member Accesses

If an expression can be `#!sds null`, it cannot be used as the receiver of a regular member access, since `#!sds null` does not have members. Instead, a null-safe member access must be used. A null-safe member access evaluates to `#!sds null` if its receiver is `#!sds null`. Otherwise, it evaluates to the accessed member, just like a normal member access.

The syntax is identical to a normal member access except that we replace the dot with the operator `#!sds ?.`:

```sds
nullableExpression?.member
```

## Indexed Accesses

An indexed access is used to access elements of a list by index or values of a map by key. In the following example, we use an index access to retrieve the first element of the `#!sds values` list:

```sds
segment printFirst(values: List<Int>) {
    print(values[0]);
}
```

These are the elements of the syntax:

- An expression that evaluates to a list or map (here the [reference](#references) `#!sds values`).
- An opening square bracket.
- The index, which is an expression that evaluates to an integer. The first element has index 0.
- A closing square bracket.

Note that accessing a value at an index outside the bounds of the value list currently only raises an error at runtime.

### Null-Safe Indexed Accesses

If an expression can be `#!sds null`, it cannot be used as the receiver of a regular indexed access. Instead, a null-safe indexed access must be used. A null-safe indexed access evaluates to `#!sds null` if its receiver is `#!sds null`. Otherwise, it works just like a normal indexed access. This is particularly useful for [chaining](#chaining).

The syntax is identical to a normal indexed access except that we replace the `#!sds []` with `#!sds ?[]`:

```sds
nullableList?[0]
```

## Chaining

Multiple [calls](#calls), [member accesses](#member-accesses), and [indexed accesses](#member-accesses) can be chained together. Let us first look at the declaration of the [class][classes] we need for the example:

```sds
class LinearRegression() {
    fun drawAsGraph()
}
```

This is a [class][classes] `#!sds LinearRegression`, which has a constructor and an instance [method][methods] called `#!sds drawAsGraph`.

We can then use those declarations in a [segment][segments]:

```sds
segment mySegment(regressions: List<LinearRegression>) {
    regressions[0].drawAsGraph();
}
```

This segment is called `#!sds mySegment` and has a [parameter][parameters] `#!sds regressions` of type `#!sds List<LinearRegression>`.

In the body of the segment we then

1. access the first instance in the list using an [indexed access](#indexed-accesses),
2. access the instance method `#!sds drawAsGraph` of this instance using a [member access](#member-accesses),
3. [call](#calls) this method.

## Lambdas

If you want to write reusable blocks of code, use a [segment][segments]. However, sometimes you need to create a highly application-specific callable that can be passed as argument to some function or returned as the result of a [segment][segments]. We will explain this concept by filtering a list. Here are the relevant declarations:

```sds
class IntList {
    fun filter(filterFunction: (element: Int) -> shouldKeep: Boolean) -> filteredList: IntList
}

fun intListOf(elements: List<Int>) -> result: IntList
```

First, we declare a [class][classes] `#!sds IntList`, which has a single [method][methods] called `#!sds filter`. The `#!sds filter` method returns a single result called `#!sds filteredList`, which is a new `#!sds IntList`. `#!sds filteredList` is supposed to only contain the elements of the receiving `#!sds IntList` for which the `#!sds filterFunction` [parameter][parameters] returns `#!sds true`.

Second, we declare a [global function][global-functions] `#!sds intListOf` that is supposed to wrap `#!sds elements` into an `#!sds IntList`.

Say, we now want to keep only the elements in the list that are less than `#!sds 10`. We can do this by declaring a [segment][segments]:

```sds
segment keepLessThan10(a: Int) -> shouldKeep: Boolean {
    yield shouldKeep = a < 10;
}
```

Here is how to solve the task of keeping only elements below `#!sds 10` with this [segment][segments]:

```sds
intListOf(1, 4, 11).filter(keepLessThan10)
```

The [call](#calls) to `#!sds intListOf` is just there to create an `#!sds IntList` that we can use for filtering. The interesting part is the argument we pass to the `#!sds filter` [method][methods], which is simply a reference to the [segment][segments] we declared above.

The problem here is that this solution is very cumbersome and verbose. We need to come up with a name for a [segment][segments] that we will likely use only once. Moreover, the segment must declare the [types][types] of its [parameters][parameters] and its [results][results] in its header. Finally, the declaration of the segment has to happen in a separate location then its use. We can solve those issues with lambdas.

### Block Lambdas

We will first rewrite the above solution using a _block lambda_, which is essentially a [segment][segments] without a name and more concise syntax that can be declared where it is needed:

```sds
intListOf(1, 4, 11).filter(
    (a) { yield shouldKeep = a < 10; }
)
```

While this appears longer than the solution with [segments][segments], note that it replaces both the declaration of the [segment][segments] as well as the [reference](#references) to it.

Here are the syntactic elements:

- A list of [parameters][parameters], which is enclosed in parentheses. Individual parameters are separated by commas.
- The _body_, which is a list of [statements][statements] enclosed in curly braces. Note that each [statement][statements] is terminated by a semicolon.

The results of a block lambda are [declared in its body using assignments][assignments-to-block-lambda-results].

### Expression Lambdas

Often, the body of a [block lambda](#block-lambdas) only consists of yielding a single result, as is the case in the example above. The syntax of [block lambdas](#block-lambdas) is quite verbose for such a common use-case, which is why Safe-DS has _expression lambdas_ as a shorter but less flexible alternative. Using an expression lambda we can rewrite the example above as

```sds
intListOf(1, 4, 11).filter(
    (a) -> a < 10
)
```

These are the syntactic elements:

- A list of [parameters][parameters], which is enclosed in parentheses. Individual parameters are separated by commas.
- An arrow `#!sds ->`.
- The expression that should be returned.

### Closures

**Note:** This is advanced concept, so feel free to skip this section initially.

Both [block lambdas](#block-lambdas) and [expression lambdas](#expression-lambdas) are closures, which means they remember the values of [placeholders][placeholders] and [parameters][parameters] that can be accessed within their body at the time of their creation. Here is an example:

```sds
segment lazyValue(value: Int) -> result: () -> storedValue: Int {
    yield result = () -> value
}
```

This deserves further explanation: We declare a [segment][segments] `#!sds lazyValue`. It takes a single [required parameter][required-parameters] `#!sds value` with type `#!sds Int`. It produces a single [result][results] called `#!sds result`, which has a [callable type][callable-types] that takes no [parameters] and produces a single [result][results] called `#!sds storedValue` with type `#!sds Int`. In the [body][segment-body] of the [segment][segments] we then [assign][assignments-to-segment-results] an [expression lambda](#expression-lambdas) to the [result][results] `#!sds result`.

The interesting part here is that we [refer to](#references) to the [parameter][parameters] `#!sds value` within the expression of the lambda. Since lambdas are closures, this means the current `#!sds value` is stored when the lambda is created. When we later call this lambda, exactly this value is returned.

### Restrictions

At the moment, lambdas can only be used if the context determines the type of its parameters. Concretely, this means we can use lambdas in these two places:

- As an argument that is assigned to a [parameter][parameters] with a [type][types] in a [call](#calls).
- As the value that is [assigned to a result of a segment][assignments-to-segment-results].
    In other cases, declare a segment instead and use a [reference](#references) to this segment where you would write the lambda.

## Type Casts

The compiler can _infer_ the [type][types] of an expression in almost all cases. However, sometimes its [type][types]
has to be specified explicitly. This is called a _type cast_. Here is an example:

```sds
dataset.getColumn("age") as Column<Int>
```

A type cast is written as follows:

- The expression to cast.
- The keyword `#!sds as`.
- The [type][types] to cast to.

Type casts are only allowed if the type of the expression is unknown. They cannot be used to override the inferred type
of an expression.

## Precedence

We all know that `#!sds 2 + 3 * 7` is `#!sds 23` and not `#!sds 35`. The reason is that the `#!sds *` operator has a higher precedence than the `#!sds +` operator and is, therefore, evaluated first. These precedence rules are necessary for all types of expressions listed above and shown in the following list. The higher up an expression is in the list, the higher its precedence and the earlier it is evaluated. Expressions listed beside each other have the same precedence and are evaluated from left to right:

- **HIGHER PRECEDENCE**
- `#!sds ()` (parentheses around an expression)
- `#!sds 1` ([integer literals](#int-literals)), `#!sds 1.0` ([float literals](#float-literals)), `#!sds "a"` ([string literals](#string-literals)), `#!sds true`/`false` ([boolean literals](#boolean-literals)), `#!sds null` ([null literal](#null-literal)), `#!sds someName` ([references](#references)), `#!sds "age: {{ age }}"` ([template strings](#template-strings))
- `#!sds ()` ([calls](#calls)), `#!sds ?()` ([null-safe calls](#null-safe-calls)), `#!sds .` ([member accesses](#member-accesses)), `#!sds ?.` ([null-safe member accesses](#null-safe-member-accesses)), `#!sds []` ([indexed accesses](#indexed-accesses)), `#!sds ?[]` ([null-safe indexed accesses](#null-safe-indexed-accesses))
- `#!sds -` (unary, [arithmetic negations](#operations-on-numbers))
- `#!sds as` ([type casts](#type-casts))
- `#!sds ?:` ([Elvis operators](#elvis-operator))
- `#!sds *`, `#!sds /` ([multiplicative operators](#operations-on-numbers))
- `#!sds +`, `#!sds -` (binary, [additive operators](#operations-on-numbers))
- `#!sds <`, `#!sds <=`, `#!sds >=`, `#!sds >` ([comparison operators](#operations-on-numbers))
- `#!sds ===`, `#!sds ==`, `#!sds !==`, `#!sds !=` ([equality operators](#equality-checks))
- `#!sds not` ([logical negations](#logical-operations))
- `#!sds and` ([conjunctions](#logical-operations))
- `#!sds or` ([disjunctions](#logical-operations))
- `#!sds () -> 1` ([expression lambdas](#expression-lambdas)), `#!sds () {}` ([block lambdas](#block-lambdas))
- **LOWER PRECEDENCE**

If the default precedence of operators is not sufficient, parentheses can be used to force a part of an expression to be evaluated first.

[imports]: imports.md
[packages]: packages.md
[parameters]: segments.md#parameters
[required-parameters]: segments.md#required-parameters
[results]: segments.md#results
[types]: types.md
[callable-types]: types.md#callable-types
[classes]: ../stub-language/classes.md
[attributes]: ../stub-language/classes.md#defining-attributes
[methods]: ../stub-language/classes.md#defining-methods
[enums]: ../stub-language/enumerations.md
[enum-variants]: ../stub-language/enumerations.md#enum-variants
[global-functions]: ../stub-language/global-functions.md
[pipeline-language]: README.md
[statements]: statements.md
[assignment-multiple-assignees]: statements.md#multiple-assignees
[assignments-to-segment-results]: statements.md#yielding-results-of-segments
[assignments-to-block-lambda-results]: statements.md#declare-results-of-block-lambdas
[placeholders]: statements.md#declaring-placeholders
[segments]: segments.md
[segment-body]: segments.md#statements
