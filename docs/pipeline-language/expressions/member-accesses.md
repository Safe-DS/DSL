# Member Accesses

A member access is used to refer to members of a complex data structure such as

- a [class][classes],
- an [enum][enums], or
- the [result record][result-records] of a [call][calls].

The general syntax of a member access is this:

```sds
<receiver>.<member>
```

Here, the receiver is some expression (the legal choices are explained below), while the member is always a [reference][references].

## Member Access of Class Members

To understand how we can access members of a [class][classes] we must first look briefly at a declaration of the [class][classes] we use in the following examples:

```sds
class DecisionTree() {
    static attr verboseTraining: Boolean

    attr maxDepth: Int
}
```

This class has a static [attribute][attributes] called `#!sds verboseTraining`, which has type `#!sds Boolean`. Static means that the attribute is shared between all instances of the class and can be accessed on the class itself, rather than a specific instance.

Moreover, the class has an instance [attribute][attributes]`maxDepth`, which is an integer. This must be accessed on a specific instance of the class.

### Member Access of Static Class Member

Let us look at how to access the static [attribute][attributes] `#!sds verboseTraining` to retrieve its value:

```sds
DecisionTree.verboseTraining
```

These are the syntactic elements of this member access:

- The receiver, which is the name of the class (here `#!sds DecisionTree`)
- A dot.
- The name of the static member of the class (here `#!sds verboseTraining`)

Note that we cannot access a static member from an instance of the class. We must use the class itself.

### Member Access of Instance Class Member

Contrary to static member accesses, we can only access instance members on an instance of a class:

```sds
DecisionTree().maxDepth
```

We now take apart the syntax again:

- The receiver, here a [call][calls] of the constructor of the class `#!sds DecisionTree`. This creates an instance of this class.
- A dot.
- The name of the instance member (here `#!sds maxDepth`).

Note that instance members cannot be accessed from the class itself, but only from its instances.

## Member Access of Enum Variants

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

## Member Access of Results

If the [result record][result-records] that is produced by a [call][calls] has multiple results, we can use a member access to select a single one. Here is the [global function][global-functions] we use to explain this concept:

```sds
fun divideWithRemainder(dividend: Int, divisor: Int) -> (quotient: Int, remainder: Int)
```

The [global function][global-functions] `#!sds divideWithRemainder` has two [parameters][parameters], namely `#!sds dividend` and `#!sds divisor`, both of which have type `#!sds Int`. It produces two [results][results], `#!sds quotient` and `#!sds remainder`, which also have type `#!sds Int`.

If we are only interested in the remainder of `#!sds 12` divided by `#!sds 5`, we can use a member access:

```sds
divideWithRemainder(12, 5).remainder
```

Here are the syntactic elements:

- The receiver, which is a [call][calls].
- A dot.
- The name of the result (here `#!sds remainder`).

While it is also possible to access the result by name if the [result record][result-records] contains only a single entry, there is no need to do so, since this result can be used directly. If you still use a member access and the singular result of the call has the same name as an instance member of the corresponding class, the instance member wins.

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

## Null-Safe Member Accesses

If an expression can be `#!sds null`, it cannot be used as the receiver of a regular member access, since `#!sds null` does not have members. Instead, a null-safe member access must be used. A null-safe member access evaluates to `#!sds null` if its receiver is `#!sds null`. Otherwise, it evaluates to the accessed member, just like a normal member access.

The syntax is identical to a normal member access except that we replace the dot with the operator `#!sds ?.`:

```sds
nullableExpression?.member
```


[parameters]: ../segments.md#parameters
[results]: ../segments.md#results
[classes]: ../../stub-language/classes.md
[attributes]: ../../stub-language/classes.md#defining-attributes
[enums]: ../../stub-language/enumerations.md
[enum-variants]: ../../stub-language/enumerations.md#enum-variants
[global-functions]: ../../stub-language/global-functions.md
[result-records]: calls.md#result-record
[calls]: calls.md
[references]: references.md
