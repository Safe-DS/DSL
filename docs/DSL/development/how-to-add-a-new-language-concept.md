# How to add a new language concept

1. Create new classes in the EMF model (_abstract syntax_):
   1. [Update the Ecore file][SimpleML.ecore]. Ensure that `SmlAbstractObject` is either a direct of transitive supertype.
   1. [Update the Genmodel file][SimpleML.genmodel].

1. Update the grammar (_concrete syntax_).
   1. Create [grammar tests][grammar-tests]:
      1. Positive tests (with comment `// no_syntax_error`)
      1. Negative tests (with comment `// syntax_error`)
   1. Run the tests (`./gradlew test`). There should be failures.
   1. Update the [Xtext grammar file][SimpleML.xtext].
   1. Run the tests again (`./gradlew test`). Tests should now pass.

1. Update the [constants][constants] if the concrete syntax of your concept has terminals that need to be accessed programmatically (e.g. operators or modifiers).

1. Update the [creators][creators], which simplify the creation of instances of model classes. There should be at least one function for each class.

1. Update the [access shortcuts][shortcuts], which simplify the traversal of the EMF model. This is not always required and the file should only contain functions that are simple enough to not require tests.

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

1. Update the [static analyses][static-analysis].

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

1. Update the converter to Prolog.
   1. Create [classes for facts][prolog-facts].
   1. Create [tests][prolog-tests].
   1. Run the tests (`./gradlew test`). There should be failures.
   1. Update the [converter to Prolog][prolog-converter].
   1. Run the tests again (`./gradlew test`). Tests should now pass.

1. Update the [tutorial][tutorial].

<!-- Links -->

[SimpleML.ecore]: ../../../DSL/de.unibonn.simpleml/model/SimpleML.ecore

[SimpleML.genmodel]: ../../../DSL/de.unibonn.simpleml/model/SimpleML.genmodel

[grammar-tests]: ../../../DSL/de.unibonn.simpleml/src/test/resources/grammar

[SimpleML.xtext]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/SimpleML.xtext

[converter-tests]: ../../../DSL/de.unibonn.simpleml/src/test/kotlin/de/unibonn/simpleml/conversion

[converters]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/conversion

[scoping-tests]: ../../../DSL/de.unibonn.simpleml/src/test/kotlin/de/unibonn/simpleml/scoping/ScopingTest.kt

[local-scope-provider]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/scoping/SimpleMLScopeProvider.kt

[resource-description-strategy]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/scoping/SimpleMLResourceDescriptionStrategy.kt

[static-analysis]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/staticAnalysis

[validation-tests]: ../../../DSL/de.unibonn.simpleml/src/test/resources/validation

[validators]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/validation

[constants]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/constant

[creators]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/emf/Creators.kt

[shortcuts]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/emf/SimpleShortcuts.kt

[generator-tests]: ../../../DSL/de.unibonn.simpleml/src/test/resources/generator

[generator]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/generator/SimpleMLGenerator.kt

[formatting-tests]: ../../../DSL/de.unibonn.simpleml/src/test/resources/formatting

[formatting]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/formatting2/SimpleMLFormatter.kt

[prolog-facts]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/prologBridge/model/facts/Facts.kt

[prolog-tests]: ../../../DSL/de.unibonn.simpleml/src/test/kotlin/de/unibonn/simpleml/prologBridge/AstToPrologFactbaseTest.kt

[prolog-converter]: ../../../DSL/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/prologBridge/converters/AstToPrologFactbase.kt

[tutorial]: ../tutorial/README.md
