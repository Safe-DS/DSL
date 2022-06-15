# Variance

**Note:** This is an advanced section. Feel free to skip it initially.

Variance deals with the question which generic types are compatible with each other. We explain this concept using the following [class][classes]:

```
class Stack<T>(vararg initialElements: T) {
    fun push(element: T)

    fun pop() -> element: T
}
```

The [class][classes] is called `Stack` and has a single [type parameter][type-parameters], which is supposed to the denote the [type][types] of the elements of the stack. With its [constructor], we can specify the initial elements of the stack. Moreover, two [methods][methods] are defined on the stack:
* `push` is supposed to add a new element to the top of the stack.
* `pop` is supposed to remove and return the topmost element of the stack.

We will now try to answer the following two questions:
1. If `A` is a subclass of `B`, can we assign `Stack<A>` to `Stack<B>`?
2. If `B` is a subclass of `A`, can we assign `Stack<A>` to `Stack<B>`?

## Invariance

By default, the answer to both questions is "no". The reason for this is that it can allow illegal behavior:

Say, we expect a `Stack<Number>`, but pass a `Stack<Int>` (`Int` is a subclass of `Number`). If we can treat the `Stack<Int>` as a `Stack<Number>`, we are also allowed to add values of type `Float` to it. This would also change the original `Stack<Int>`, which now contains illegal floating point values.

Now, imagine we a `Stack<Number>`, but pass a `Stack<Any>` (`Number` is a subclass of `Any`). If we can treat the `Stack<Any>` as a `Stack<Number>`, we could read values from the stack that are not numbers, for example strings, since the original stack can contain `Any` value.

To sum this up, we cannot assign `Stack<A>` to `Stack<B>` if `A` is a subclass of `B` because we might write to the `Stack<B>` and alter the original `Stack<A>` in an illegal way. Likewise, we cannot assign `Stack<A>` to `Stack<B>` if `B` is a subclass of `A` because we might read something from the `Stack<B>` that is not of type `B`.

We say, the [type parameter][type-parameters] `T` of the [class][classes] is invariant. It must be matched exactly. The conditions we describe above, however, already give us the information under which circumstances we can loosen this requirement.

## Covariance

We now want a `Stack<A>` to be assignable to a `Stack<B>` if `A` is a subclass of `B`. This behavior is called _covariance_ since the type compatibility relation between `Stack<A>` and `Stack<B>` points in the same direction as the type compatibility relation between `A` and `B`.

As outlined above, we can only allow covariance if we forbid writing access.  This means that a [type parameter][type-parameters] that is covariant can only be used for reading. Concretely, a covariant [type parameter][type-parameters] can only be used as the type of a [result][results] not the type of a [parameter][parameters]. We also say the [type parameter][type-parameters] can only be used in the _out-position_ (i.e. as output), which motivates the keyword `out` to denote covariance (see Section [Specifying Variance](#specifying-variance)).

In the `Stack` example, we can make the [class][classes] covariant by adding the keyword `out` to the [type parameter][type-parameters] `T` and removing the writing [method][methods] `push`:

```
class Stack<out T> {
    fun pop() -> element: T
}
```

## Contravariance

We now want a `Stack<A>` to be assignable to a `Stack<B>` if `B` is a subclass of `A`. This behavior is called _contravariance_ since the type compatibility relation between `Stack<A>` and `Stack<B>` points in the opposite direction as the type compatibility relation between `A` and `B`.

As outlined above, we can only allow contravariance if we forbid reading access.  This means that a [type parameter][type-parameters] that is contravariant can only be used for writing. Concretely, a contravariant [type parameter][type-parameters] can only be used as the type of a [parameter][parameters] not the type of a [result][results]. We also say the [type parameter][type-parameters] can only be used in the _in-position_ (i.e. as input), which motivates the keyword `in` to denote contravariance (see Section [Specifying Variance](#specifying-variance)).

In the `Stack` example, we can make the [class][classes] contravariant by adding the keyword `in` to the [type parameter][type-parameters] `T` and removing the reading [method][methods] `pop`:

```
class Stack<in T> {
    fun push(element: T)
}
```

## Specifying Variance

The variance of a [type parameter][type-parameters] can either be declared at its [declaration site][declaration-site-variance] or its [use site][use-site-variance]. If it is specified already at the [declaration site][declaration-site-variance], however, [use-site variance][use-site-variance] is no longer available.

The following table sums up the syntax of [declaration-site variance][declaration-site-variance], where the [class][classes] declaration is changed, and [use-site variance][use-site-variance], where the [type arguments][type-arguments] passed by the [named type][named-types] Refer to the linked documents for more details.

| Desired Variance | Declaration Site | Use Site   |
|------------------|------------------|------------|
| Invariant        | `class Stack<T>` | `Stack<T>` |
|Covariant|`class Stack<out T>`|`Stack<out T>`
|Contravariant|`class Stack<in T>`|`Stack<in T>`|

[types]: types.md
[named-types]: types.md#named-types
[type-arguments]: types.md#type-arguments
[use-site-variance]: types.md#use-site-variance
[parameters]: parameters.md
[results]: results.md

[classes]: ../stub-language/classes.md
[methods]: ../stub-language/classes.md#defining-methods
[subclassing]: ../stub-language/classes.md#subclassing
[type-parameters]: ../stub-language/type-parameters.md
[declaration-site-variance]: ../stub-language/type-parameters.md#declaration-site-variance
