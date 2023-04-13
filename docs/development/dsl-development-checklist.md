# How to add a new language concept

1. Create new classes in the EMF model (_abstract syntax_):

    1. [Update the Ecore file][safeds.ecore]. Ensure that `SdsAbstractObject` is either a direct of transitive supertype.
    1. [Update the Genmodel file][safeds.genmodel].

1. Update the grammar (_concrete syntax_).

    1. Create [grammar tests][grammar-tests].
    1. Run the tests (`./gradlew test`). There should be failures.
    1. Update the [Xtext grammar file][safeds.xtext].
    1. Run the tests again (`./gradlew test`). Tests should now pass.

1. Update the [constants][constants] if the concrete syntax of your concept has terminals that need to be accessed programmatically (e.g. operators or modifiers). Mark new declarations with [`@ExperimentalSdsApi`][experimental-sds-api].

1. Update the [creators][creators], which simplify the creation of instances of model classes. There should be at least one function for each class. Mark new declarations with [`@ExperimentalSdsApi`][experimental-sds-api].

1. Update the [access shortcuts][shortcuts], which simplify the traversal of the EMF model. This is not always required and the file should only contain functions that are simple enough to not require tests. Mark new declarations with [`@ExperimentalSdsApi`][experimental-sds-api].

1. Update the converters if your concept includes terminals where the value they represent differs from their textual representation.

    1. Create [converter tests][converter-tests]
    1. Run the tests (`./gradlew test`). There should be failures.
    1. Add a [converter][converters].
    1. Run the tests again (`./gradlew test`). Tests should now pass.

1. Update the scope provider if your concept has cross-references.

    1. Create [scoping tests][scoping-tests].
    1. Run the tests (`./gradlew test`). There should be failures.
    1. Update the [local scope provider][local-scope-provider].
    1. Run the tests again (`./gradlew test`). Tests should now pass.

1. Update the [resource description strategy][resource-description-strategy] if your concept is a declaration that should be visible from another file.

1. Update the [static analyses][static-analysis]. Mark new declarations with [`@ExperimentalSdsApi`][experimental-sds-api].

1. Update the validator.

    1. Create [validation tests][validation-tests]
    1. Run the tests (`./gradlew test`). There should be failures.
    1. Update the [validators][validators] or add a new one.
    1. Run the tests again (`./gradlew test`). Tests should now pass.

1. Update the code generator.

    1. Create [generator tests][generator-tests]
    1. Run the tests (`./gradlew test`). There should be failures.
    1. Update the [generator][generator].
    1. Run the tests again (`./gradlew test`). Tests should now pass.

1. Update the formatter.

    1. Create [formatting tests][formatting-tests].
    1. Run the tests (`./gradlew test`). There should be failures.
    1. Update the [formatter][formatting].
    1. Run the tests again (`./gradlew test`). Tests should now pass.

1. Update the [tutorial][tutorial].

<!-- Links -->

[experimental-sds-api]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/utils/MarkerAnnotations.kt
[safeds.ecore]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/model/SafeDS.ecore
[safeds.genmodel]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/model/SafeDS.genmodel
[grammar-tests]: ./grammar-testing.md
[safeds.xtext]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/SafeDS.xtext
[converter-tests]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/test/kotlin/com/larsreimann/safeds/conversion
[converters]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/conversion
[scoping-tests]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/test/kotlin/com/larsreimann/safeds/scoping/ScopingTest.kt
[local-scope-provider]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/scoping/SafeDSScopeProvider.kt
[resource-description-strategy]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/scoping/SafeDSResourceDescriptionStrategy.kt
[static-analysis]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/staticAnalysis
[validation-tests]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/test/resources/validation
[validators]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/validation
[constants]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/constant
[creators]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/emf/Creators.kt
[shortcuts]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/emf/SimpleShortcuts.kt
[generator-tests]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/test/resources/generator
[generator]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/generator/SafeDSGenerator.kt
[formatting-tests]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/test/resources/formatting
[formatting]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/formatting2/SafeDSFormatter.kt
[tutorial]: ../language/README.md
