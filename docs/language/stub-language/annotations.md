# Annotations

Annotations attach additional metainformation to declarations. Annotations must first be [declared](#declaring-an-annotation), so Safe-DS knows the annotation exists and which inputs are expected. Afterwards, annotations can be [called](#calling-an-annotation), which is the segment that truly attaches metainformation to declarations.

## Declaring an Annotation

### Minimal Example

Let's look at a minimal example of an annotation:

```sds
annotation OnlyForExperts
```

This declaration of an annotation has the following syntactic elements:

- The keyword `#!sds annotation`.
- The name of the annotation, here `#!sds OnlyForExperts`. This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `#!sds UpperCamelCase` for the names of annotations.

### Parameters

For the annotation `#!sds OnlyForExperts`, no more inputs are required. It is only used to mark declarations. However, say we want to assign a category to a declaration. We could define individual annotations for each category, such as:

```sds
annotation Model
annotation Data
```

However, these annotations are difficult to process since we need to maintain a list of annotations that define such a category. Instead, it is preferable to define a single annotation called `#!sds Category` and make it configurable by adding [parameters][parameters] (inputs). Parameters must be declared in the header of the annotation, so [callers](#calling-an-annotation) know they are expected to pass them as an argument.

In the following example, we define the complete `#!sds Category` annotation with a single parameter with name `#!sds category` and [type][types] `#!sds String`.

```sds
annotation Category(category: String)
```

As we can see from the `#!sds OnlyForExperts` example, we can omit the entire parameter list, if the annotation has no parameters. More information about parameters can be found in the [linked document][parameters].

## Calling an Annotation

To attach metainformation to a declaration, the annotation must be called on that declaration. We name the annotated declaration the _target_ of the annotation. Possible targets are

- [Annotations](#declaring-an-annotation) (yes, annotations can be the target of annotation calls)
- [Attributes][attributes]
- [Classes][classes]
- Compilation units (entire files)
- [Enums][enums]
- [Enum variants][enum-variants]
- [Global functions][global-functions] / [methods][methods]
- [Parameters][parameters]
- [Results][results]
- [Segments][segments]
- [Type parameters][type-parameters]
- [Pipelines][pipelines]

The valid targets of an annotation can be restricted with the [`Target`][safeds.lang.Target] annotation. By default all targets are allowed. Likewise, an annotation can only be called once on the same declaration by default, unless the annotation is marked as[Repeatable][safeds.lang.Repeatable].

Annotation calls are always located right in front of their target. Exception: In the case of compilations units they are located at the very top of the file. Here is an example that demonstrates how to call the annotation `#!sds OnlyForExperts` that we defined above on a [class][classes]:

```sds hl_lines="1"
@OnlyForExperts
class VerySpecificMLModel
```

Here is a breakdown of the syntax:

- An `#!sds @`.
- The name of the called annotation (here `#!sds OnlyForExperts`).

The code `#!sds class VerySpecificMLModel` is **not** part of the annotation call but simply the [class declaration][classes] that is targeted by the annotation call. Since the annotation `#!sds OnlyForExperts` does not specify parameters, we also need not pass arguments and can omit the entire argument list.

For an annotation with parameters, such as the `#!sds Category` annotation that we defined above, we must pass arguments. The same syntax is used for arguments of annotation calls as for normal [calls][calls]. We can use positional arguments:

```sds hl_lines="1"
@Category("model")
class VerySpecificMLModel
```

Or we can use named arguments:

```sds hl_lines="1"
@Category(category="model")
class VerySpecificMLModel
```

The same [restrictions to arguments][argument-restrictions] as for [calls][calls] also apply here.

## Built-in Annotations

The package `#!sds safeds.lang` contains several annotations that are processed by Safe-DS. Particularly important are the annotations

- [`Target`][safeds.lang.Target], which can restrict the possible targets of an annotation, and
- [`Repeatable`][safeds.lang.Repeatable], which allows an annotation to be called multiple times on the same declaration.

[parameters]: ../common/parameters.md
[types]: ../common/types.md
[attributes]: classes.md#defining-attributes
[classes]: classes.md#defining-classes
[enums]: enumerations.md#declaring-an-enumeration
[enum-variants]: enumerations.md#enum-variants
[global-functions]: global-functions.md
[methods]: classes.md#defining-methods
[results]: ../common/parameters.md
[segments]: ../pipeline-language/segments.md
[type-parameters]: type-parameters.md
[pipelines]: ../pipeline-language/pipelines.md
[calls]: ../pipeline-language/expressions.md#calls
[argument-restrictions]: ../pipeline-language/expressions.md#restrictions-for-arguments
