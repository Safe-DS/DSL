# Annotations

Annotations attach additional metainformation to declarations. Annotations must first be [declared](#declaring-an-annotation), so Simple-ML knows the annotation exists and which inputs are expected. Afterwards, annotations can be [called](#calling-an-annotation), which is the step that truly attaches metainformation to declarations.

## Declaring an Annotation

### Minimal Example

Let's look at a minimal example of an annotation:

```txt
annotation OnlyForExperts
```

This declaration of an annotation has the following syntactic elements:
* The keyword `annotation`.
* The name of the annotation, here `OnlyForExperts`. This can be any combination of upper- and lowercase letters, underscores, and numbers, as long as it does not start with a number. However, we suggest to use `UpperCamelCase` for the names of annotations.

### Parameters

For the annotation `OnlyForExperts`, no more inputs are required. It is only used to mark declarations. However, say we want to assign a category to a declaration. We could define individual annotations for each category, such as:

```txt
annotation Model
annotation Data
```

However, these annotations are difficult to process since we need to maintain a list of annotations that define such a category. Instead, it is preferable to define a single annotation called `Category` and make it configurable by adding [parameters][parameters] (inputs). Parameters must be declared in the header of the annotation, so [callers](#calling-an-annotation) know they are expected to pass them as an argument.

In the following example, we define the complete `Category` annotation with a single parameter with name `category` and [type][types] `String`.

```txt
annotation Category(category: String)
```

As we can see from the `OnlyForExperts` example, we can omit the entire parameter list, if the annotation has no parameters. More information about parameters can be found in the [linked document][parameters].

## Calling an Annotation

To attach metainformation to a declaration, the annotation must be called on that declaration. We name the annotated declaration the _target_ of the annotation. Possible targets are

* [Annotations](#declaring-an-annotation) (yes, annotations can be the target of annotation calls)
* [Attributes][attributes]
* [Classes][classes]
* Compilation units (entire files)
* [Enums][enums]
* [Enum variants][enum-variants]
* [Global functions][global-functions] / [methods][methods]
* [Parameters][parameters]
* [Results][results]
* [Steps][steps]
* [Type parameters][type-parameters]
* [Workflows][workflows]

The valid targets of an annotation can be restricted with the [`Target`][simpleml-lang-target] annotation. By default all targets are allowed. Likewise, an annotation can only be called once on the same declaration by default, unless the annotation is marked as[Repeatable][simpleml-lang-repeatable].

Annotation calls are always located right in front of their target. Exception: In the case of compilations units they are located at the very top of the file. Here is an example that demonstrates how to call the annotation `OnlyForExperts` that we defined above on a [class][classes]:

```txt
@OnlyForExperts
class VerySpecificMLModel
```

Here is a breakdown of the syntax:
* An `@`.
* The name of the called annotation (here `OnlyForExperts`).

The code `class VerySpecificMLModel` is **not** part of the annotation call but simply the [class declaration][classes] that is targeted by the annotation call. Since the annotation `OnlyForExperts` does not specify parameters, we also need not pass arguments and can omit the entire argument list.

For an annotation with parameters, such as the `Category` annotation that we defined above, we must pass arguments. The same syntax is used for arguments of annotation calls as for normal [calls][calls]. We can use positional arguments:

```txt
@Category("model")
class VerySpecificMLModel
```

Or we can use named arguments:

```txt
@Category(category="model")
class VerySpecificMLModel
```

The same [restrictions to arguments][argument-restrictions] as for [calls][calls] also apply here.

## Built-in Annotations

The package `simpleml.lang` contains several annotations that are processed by Simple-ML. Refer to the [API documentation][simpleml-lang] for more details. Particularly important are the annotations

* [`Target`][simpleml-lang-target], which can restrict the possible targets of an annotation, and
* [`Repeatable`][simpleml-lang-repeatable], which allows an annotation to be called multiple times on the same declaration.

[parameters]: ../common/parameters.md
[types]: ../common/types.md
[attributes]: ./classes.md#defining-attributes
[classes]: ./classes.md#defining-classes
[enums]: ./enumerations.md#declaring-an-enumeration
[enum-variants]: ./enumerations.md#enum-variants
[global-functions]: ./global-functions.md
[methods]: ./classes.md#defining-methods
[results]: ../common/parameters.md
[steps]: ../workflow-language/steps.md
[type-parameters]: ./type-parameters.md
[workflows]: ../workflow-language/workflows.md
[simpleml-lang]: ../../../Stdlib/API/simpleml_lang.md
[simpleml-lang-repeatable]: ../../../Stdlib/API/simpleml_lang.md#annotation-repeatable
[simpleml-lang-target]: ../../../Stdlib/API/simpleml_lang.md#annotation-target
[calls]: ../workflow-language/expressions.md#calls
[argument-restrictions]: ../workflow-language/expressions.md#restrictions-for-arguments
