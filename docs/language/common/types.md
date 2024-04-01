# Types

Types describe the values that a declaration can accept. Safe-DS has various categories of types, which are explained in this document.

## Categories of Types

### Named Types

_Named types_ either denote that a declaration must be an instance of a [class][classes] or one of its [subclasses][subclassing], or an instance of a [variant][variants] of an [enum][enums]. In either case the syntax of the type is just the name of the [class][classes] or the [enum][enums] respectively.

#### Class Types

A declaration with a _class type_ must be an instance of a [class][classes] or one of its [subclasses][subclassing]. Let us use the following [classes][classes] for our example:

```sds
class SomeClass

class SomeSubclass sub SomeClass
```

To denote that a declaration accepts instances of `#!sds SomeClass` and its [subclass][subclassing] `#!sds SomeSubclass`, we write the name of the class as the type:

```sds
SomeClass
```

##### Nullable Class Types

The value `#!sds null` (see [null][null-literal]) deserves special treatment since it is not possible to operate on it in the same manner as on proper instances of a [class][classes]. For this reason `#!sds null` cannot be assigned to declarations with class types such as `#!sds SomeClass`.

To specifically allow `#!sds null` as a value, simply add a question mark to the named type:

```sds
SomeClass?
```

#### Enum Types

A declaration with an _enum type_ must be one of the [variants][variants] of the [enum][enums]. Let us use the following [enum][enums] for our example:

```sds
enum SomeEnum {
    SomeEnumVariant
    SomeOtherEnumVariant(count: Int)
}
```

To denote that a declaration accepts instances of any [variant][variants] of `#!sds SomeEnum`, use the name of the enum as the type:

```sds
SomeEnum
```

This type expects either the value `#!sds SomeEnum.SomeEnumVariant` (see [member access][member-accesses]) or anything constructed from the [variant][variants] `#!sds SomeOtherEnumVariant` such as `#!sds SomeEnum.SomeOtherEnumVariant(3)`.

#### Type Arguments

**Note:** This is an advanced section. Feel free to skip it initially.

If a declaration has [type parameters][type-parameters] we need to assign all of them when we use the declaration as a named type. This assignment happens in the form of _type arguments_. We explain this using the following declaration:

```sds
class SomeSpecialList<T>
```

When we use this [class][classes] as a named type, we need to specify the value for the [type parameter][type-parameters] `#!sds T`, which is supposed to denote the type of the elements in the list.Similar to [calls][calls], we can either use _positional type arguments_ or _named type arguments_.

In the case of positional type arguments, they are mapped to [type parameters][type-parameters] by position, i.e. the first type argument is assigned to the first [type parameter][type-parameters], the second type argument is assigned to the second [type parameter][type-parameters] and so forth.

If a positional type argument is used, we just write down its value, which is a [type projection](#type-projection).

For example, if we expect a list of integers, we could use the following type:

```sds
SomeSpecialList<Int>
```

Let us break down the syntax:

- The usual named type (here `#!sds SomeSpecialList`).
- Opening angle bracket.
- A positional type argument (here `#!sds Int`).
- A closing angle bracket.

When a named type argument is used, we explicitly specify the [type parameter][type-parameters] that we want to assign. This allows us to specify them in any order. It can also improve the clarity of the code since the meaning of the type argument becomes more apparent. Here is the type for our list of integers when a named argument is used:

```sds
SomeSpecialList<T = Int>
```

These are the syntactic elements:

- The usual named type (here `#!sds SomeSpecialList`).
- Opening angle bracket.
- A named type argument (here `#!sds T = Int`). This in turn consists of
  - The name of the [type parameter][type-parameters] (here `#!sds T`)
  - An equals sign.
  - The value of the type argument, which is still a [type projection](#type-projection).
- A closing angle bracket.

Within a list of type arguments both positional and named type arguments can be used. However, after the first named type arguments all type arguments must be named.

Let us finally look at how multiple type arguments are passed. For this we use the following declaration:

```sds
class SomeSpecialMap<K, V>
```

This [class][classes] has to [type parameters][type-parameters], namely `#!sds K` and `#!sds V`, which must both be set if we use this [class][classes] as a named type.

Here is a valid use:

```sds
SomeSpecialMap<String, V = Int>
```

We will again go over the syntax:

- The usual named type (here `#!sds SomeSpecialMap`).
- An opening angle bracket.
- The list of type arguments. Each element is either a positional or a named type argument (see above). Individual elements are separated by commas. A trailing comma is allowed
- A closing angle bracket.

We will now look at the values that we can pass within type arguments.

##### Type Projection

The most basic case is that we pass a concrete type as the value. We have already seen this in the example above where we constructed the type for a list of integers:

```sds
SomeSpecialList<Int>
```

The value of the type argument is just another named type (here `#!sds Int`).

### Member Types

A member type is essentially the same as a [named type](#named-types) with the difference that the declaration we refer to is nested inside [classes][classes] or [enums][enums].

#### Class Member Types

We begin with nested classes and use these declarations to illustrate the concept:

```sds
class SomeOuterClass {
    class SomeInnerClass
}
```

To specify that a declaration accepts instances of `#!sds SomeInnerClass` or its [subclasses][subclassing], use the following member type:

```sds
SomeOuterClass.SomeInnerClass
```

This has the following syntactic elements:

- Name of the outer [class][classes] (here `#!sds SomeOuterClass`).
- A dot.
- Name of the inner [class][classes] (here `#!sds SomeInnerClass`).

Classes can be nested multiple levels deep. In this case, use a member access for each level. Let us use the following declarations to explain this:

```sds
class SomeOuterClass {
    class SomeMiddleClass {
        class SomeInnerClass
    }
}
```

To specify that a declaration accepts instances of `#!sds SomeInnerClass`, or its [subclasses][subclassing], use the following member type:

```sds
SomeOuterClass.SomeMiddleClass.SomeInnerClass
```

If any referenced class has [type parameters][type-parameters] these must be specified by [type arguments](#type-arguments). For this we use these declarations:

```sds
class SomeOuterClass<A> {
    class SomeInnerClass<B>
}
```

To specify that a declaration accepts instances of `#!sds SomeInnerClass` where all type parameters are set to `#!sds Int`, or its [subclasses][subclassing], use the following member type:

```sds
SomeOuterClass<Int>.SomeInnerClass<Int>
```

Finally, as with [named types](#named-types), `#!sds null` is not an allowed value by default. To allow it, add a question mark at the end of the member type. This can be used independently from [type arguments](#type-arguments):

```sds
SomeOuterClass<Int>.SomeInnerClass<Int>?
```

#### Enum Variant Types

Member types are also used to specify that a declaration is an instance of a single [variant][variants] of an [enum][enums]. For this, we use the following declarations:

```sds
enum SomeEnum {
    SomeEnumVariant(count: Int),
    SomeOtherEnumVariant
}
```

To allow only instances of the [variant][variants] `#!sds SomeEnumVariant`, use the following member type:

```sds
SomeEnum.SomeEnumVariant
```

Let us take apart the syntax:

- The name of the [enum][enums] (here `#!sds SomeEnum`).
- A dot.
- The name of the [enum variant][variants] (here `#!sds SomeEnumVariant`).

Identical to [class member types](#class-member-types), all [type parameters][type-parameters] of the [enum variant][variants] must be assigned by [type arguments](#type-arguments). We use these declarations to explain the concept:

```sds
enum SomeEnum {
    SomeEnumVariant<T>(value: T),
    SomeOtherEnumVariant
}
```

To now allow only instances of the [variant][variants] `#!sds SomeEnumVariant` with `#!sds Int` values, use the following member type:

```sds
SomeEnum.SomeEnumVariant<Int>
```

### Union Types

If a declaration can have one of multiple types you can denote that with a _union type_:

```sds
union<String, Int>
```

Here is a breakdown of the syntax:

- The keyword `#!sds union`.
- An opening angle bracket.
- A list of types, which are separated by commas. A trailing comma is allowed.
- A closing angle bracket

Note that it is preferable to write the common superclass if this is equivalent to the union type. For example, `#!sds Number` has the two subclasses `#!sds Int` and `#!sds Float`. Therefore, it is usually better to write `#!sds Number` as the type rather than `#!sds union<Int, Float>`. Use the union type only when you are not able to handle the later addition of further subclasses of `#!sds Number` other than `#!sds Int` or `#!sds Float`.

### Callable Types

A _callable type_ denotes that only values that can be [called][calls] are accepted. This includes:

- [class constructors][class-constructors]
- [constructors of enum variants][enum-variant-constructors]
- [methods][methods]
- [global functions][global-functions]
- [segments][segments]
- [lambdas][lambdas]

Additionally, a callable types specifies the names and types of parameters and results. Here is the most basic callable type that expects neither parameters nor results:

```sds
() -> ()
```

Let us break down the syntax:

- A pair of parentheses, which is the list of expected [parameters][parameters].
- An arrow `#!sds ->`.
- A pair of parentheses, which is the list of expected [results][results].

We can now add some expected [parameters][parameters]:

```sds
(a: Int, b: Int) -> ()
```

These are the syntactic elements:

- [Parameters][parameters] are written in the first pair of parentheses.
- For each [parameter][parameters], specify:
  - Its name.
  - A colon.
  - Its type.
- Separate [parameters][parameters] by commas. A trailing comma is permitted.

Finally, we can add some expected [results][results]:

```sds
(a: Int, b: Int) -> (r: Int, s: Int)
```

The syntax is reminiscent of the notation for [parameters][parameters]:

- [Results][results] are written in the second pair of parentheses.
- For each [result][results], specify:
  - Its name.
  - A colon.
  - Its type.
- Separate [result][results] by commas. A trailing comma is permitted.

If exactly one result is expected, the surrounding parentheses may be also removed:

```sds
(a: Int, b: Int) -> r: Int
```

### Unknown

If the actual type of a declaration is not known, you can denote that with the special type `#!sds unknown`. However, to later use the declaration in any meaningful way, you will have to cast it to another type.

## Corresponding Python Code

**Note:** This section is only relevant if you are interested in the [stub language][stub-language].

Optionally, [type hints][type-hints] can be used in Python to denote the type of a declaration. This is generally advisable, since IDEs can use this information to offer additional feature, like improved refactorings. Moreover, static type checker like [mypy][mypy] can detect misuse of an API without running the code. We will now briefly describe how to best use Python's [type hints][type-hints] and explain how they relate to Safe-DS types.

First, to get [type hints][type-hints] in Python closer to the expected behavior, add the following import to your Python file:

```py
from __future__ import annotations
```

Also add the following import, which brings the declarations that are used by the [type hints][type-hints] into scope. You can remove any declaration you do not need:

```py
from typing import Callable, Optional, Tuple, TypeVar, Union
```

The following table shows how Safe-DS types can be written as Python [type hints][type-hints]:

| Safe-DS Type                           | Python Type Hint                             |
|----------------------------------------|----------------------------------------------|
| `#!sds Boolean`                              | `#!py bool`                                  |
| `#!sds Float`                                | `#!py float`                                 |
| `#!sds Int`                                  | `#!py int`                                   |
| `#!sds String`                               | `#!py str`                                   |
| `#!sds SomeClass`                            | `#!py SomeClass`                             |
| `#!sds SomeEnum`                             | `#!py SomeEnum`                              |
| `#!sds SomeClass?`                           | `#!py Optional[SomeClass]`                   |
| `#!sds SomeEnum?`                            | `#!py Optional[SomeEnum]`                    |
| `#!sds SomeSpecialList<Int>`                 | `#!py SomeSpecialList[int]`                  |
| `#!sds SomeOuterClass.SomeInnerClass`        | `#!py SomeOuterClass.SomeInnerClass`         |
| `#!sds SomeEnum.SomeEnumVariant`             | `#!py SomeEnum.SomeEnumVariant`              |
| `#!sds union<String, Int>`                   | `#!py Union[str, int]`                       |
| `#!sds (a: Int, b: Int) -> r: Int`           | `#!py Callable[[int, int], int]`             |
| `#!sds (a: Int, b: Int) -> (r: Int, s: Int)` | `#!py Callable[[int, int], Tuple[int, int]]` |

Most of these are rather self-explanatory. We will, however, cover the translation of [callable types](#callable-types) in a little more detail: In Python, the type hint for a callable type has the following general syntax:

```txt
Callable[<list of parameter types>, <result type>]
```

To get the `<list of parameter types>`, simply

1. convert the types of the parameters to their Python syntax,
2. separate them all by commas,
3. surround them by square brackets.

Getting the `<result type`> depends on the number of results. If there is only a single result, simply write down its type. If there are multiple types, do this instead:

1. convert the types of the results to their Python syntax,
2. separate them all by commas,
3. add the prefix `Tuple[`,
4. add the suffix `]`.

[variance]: variance.md
[parameters]: parameters.md
[results]: results.md
[stub-language]: ../stub-language/README.md
[classes]: ../stub-language/classes.md
[subclassing]: ../stub-language/classes.md#subclassing
[enums]: ../stub-language/enumerations.md
[variants]: ../stub-language/enumerations.md#enum-variants
[type-parameters]: ../stub-language/type-parameters.md
[type-parameter-bounds]: ../stub-language/type-parameters.md#bounds
[declaration-site-variance]: ../stub-language/type-parameters.md#declaration-site-variance
[class-constructors]: ../stub-language/classes.md
[enum-variant-constructors]: ../stub-language/enumerations.md#constructors
[methods]: ../stub-language/classes.md#defining-methods
[global-functions]: ../stub-language/global-functions.md
[member-accesses]: ../pipeline-language/expressions.md#member-access-of-enum-variants
[null-literal]: ../pipeline-language/expressions.md#null-literal
[calls]: ../pipeline-language/expressions.md#calls
[segments]: ../pipeline-language/segments.md
[lambdas]: ../pipeline-language/expressions.md#lambdas
[mypy]: http://mypy-lang.org/
[type-hints]: https://docs.python.org/3/library/typing.html
