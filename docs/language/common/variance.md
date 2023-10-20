# Variance

**Note:** This is an advanced section. Feel free to skip it initially.

Variance deals with the question, which generic types are compatible with each other. We explain this concept using the following [class][classes]:

```sds
class Stack<T>(initialElements: List<T>) {
    fun push(element: T)

    fun pop() -> element: T
}
```

The [class][classes] is called `#!sds Stack` and has a single [type parameter][type-parameters], which is supposed to the denote the [type][types] of the elements of the stack. With its [constructor], we can specify the initial elements of the stack. Moreover, two [methods][methods] are defined on the stack:

- `#!sds push` is supposed to add a new element to the top of the stack.
- `#!sds pop` is supposed to remove and return the topmost element of the stack.

We will now try to answer the following two questions:

1. If `#!sds A` is a subclass of `#!sds B`, can we assign `#!sds Stack<A>` to `#!sds Stack<B>`?
2. If `#!sds B` is a subclass of `#!sds A`, can we assign `#!sds Stack<A>` to `#!sds Stack<B>`?

## Invariance

By default, the answer to both questions is "no". The reason for this is that it can allow illegal behavior:

Say, we expect a `#!sds Stack<Number>`, but pass a `#!sds Stack<Int>` (`Int` is a subclass of `#!sds Number`). If we can treat the `#!sds Stack<Int>` as a `#!sds Stack<Number>`, we are also allowed to add values of type `#!sds Float` to it. This would also change the original `#!sds Stack<Int>`, which now contains illegal floating point values.

Now, imagine we a `#!sds Stack<Number>`, but pass a `#!sds Stack<Any>` (`Number` is a subclass of `#!sds Any`). If we can treat the `#!sds Stack<Any>` as a `#!sds Stack<Number>`, we could read values from the stack that are not numbers, for example strings, since the original stack can contain `#!sds Any` value.

To sum this up, we cannot assign `#!sds Stack<A>` to `#!sds Stack<B>` if `#!sds A` is a subclass of `#!sds B` because we might write to the `#!sds Stack<B>` and alter the original `#!sds Stack<A>` in an illegal way. Likewise, we cannot assign `#!sds Stack<A>` to `#!sds Stack<B>` if `#!sds B` is a subclass of `#!sds A` because we might read something from the `#!sds Stack<B>` that is not of type `#!sds B`.

We say, the [type parameter][type-parameters] `#!sds T` of the [class][classes] is invariant. It must be matched exactly. The conditions we describe above, however, already give us the information under which circumstances we can loosen this requirement.

## Covariance

We now want a `#!sds Stack<A>` to be assignable to a `#!sds Stack<B>` if `#!sds A` is a subclass of `#!sds B`. This behavior is called _covariance_ since the type compatibility relation between `#!sds Stack<A>` and `#!sds Stack<B>` points in the same direction as the type compatibility relation between `#!sds A` and `#!sds B`.

As outlined above, we can only allow covariance if we forbid writing access. This means that a [type parameter][type-parameters] that is covariant can only be used for reading. Concretely, a covariant [type parameter][type-parameters] can only be used as the type of a [result][results] not the type of a [parameter][parameters]. We also say the [type parameter][type-parameters] can only be used in the _out-position_ (i.e. as output), which motivates the keyword `#!sds out` to denote covariance (see Section [Specifying Variance](#specifying-variance)).

In the `#!sds Stack` example, we can make the [class][classes] covariant by adding the keyword `#!sds out` to the [type parameter][type-parameters] `#!sds T` and removing the writing [method][methods] `#!sds push`:

```sds
class Stack<out T> {
    fun pop() -> element: T
}
```

## Contravariance

We now want a `#!sds Stack<A>` to be assignable to a `#!sds Stack<B>` if `#!sds B` is a subclass of `#!sds A`. This behavior is called _contravariance_ since the type compatibility relation between `#!sds Stack<A>` and `#!sds Stack<B>` points in the opposite direction as the type compatibility relation between `#!sds A` and `#!sds B`.

As outlined above, we can only allow contravariance if we forbid reading access. This means that a [type parameter][type-parameters] that is contravariant can only be used for writing. Concretely, a contravariant [type parameter][type-parameters] can only be used as the type of a [parameter][parameters] not the type of a [result][results]. We also say the [type parameter][type-parameters] can only be used in the _in-position_ (i.e. as input), which motivates the keyword `#!sds in` to denote contravariance (see Section [Specifying Variance](#specifying-variance)).

In the `#!sds Stack` example, we can make the [class][classes] contravariant by adding the keyword `#!sds in` to the [type parameter][type-parameters] `#!sds T` and removing the reading [method][methods] `#!sds pop`:

```sds
class Stack<in T> {
    fun push(element: T)
}
```

## Specifying Variance

The variance of a [type parameter][type-parameters] can only be declared at its [declaration site][declaration-site-variance], using the syntax shown in the following table:

| Desired Variance | Declaration Site     |
|------------------|----------------------|
| Invariant        | `#!sds class Stack<T>`     |
| Covariant        | `#!sds class Stack<out T>` |
| Contravariant    | `#!sds class Stack<in T>`  |

[types]: types.md
[named-types]: types.md#named-types
[type-arguments]: types.md#type-arguments
[parameters]: parameters.md
[results]: results.md
[classes]: ../stub-language/classes.md
[methods]: ../stub-language/classes.md#defining-methods
[type-parameters]: ../stub-language/type-parameters.md
[declaration-site-variance]: ../stub-language/type-parameters.md#declaration-site-variance
