package com.larsreimann.safeds.scoping

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.annotationCallsOrEmpty
import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsGoalReference
import com.larsreimann.safeds.safeDS.SdsMemberType
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsProtocolReference
import com.larsreimann.safeds.safeDS.SdsProtocolSubterm
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsTypeParameterConstraintGoal
import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.ResourceName
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.assertions.findUniqueDeclarationOrFail
import com.larsreimann.safeds.testing.assertions.shouldBeResolved
import com.larsreimann.safeds.testing.assertions.shouldNotBeResolved
import io.kotest.assertions.forEachAsClue
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

private const val ANNOTATION_CALL = "annotationCall"
private const val ARGUMENT = "argument"
private const val IMPORT_WITH_ALIAS = "importWithAlias"
private const val NAMED_TYPE = "namedType"
private const val PROTOCOL_REFERENCE = "protocolReference"
private const val REFERENCE = "reference"
private const val GOAL_REFERENCE = "goalReference"
private const val TYPE_ARGUMENT = "typeArgument"
private const val TYPE_PARAMETER_CONSTRAINT = "typeParameterConstraint"
private const val YIELD = "yield"

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class ScopingTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Nested
    inner class AnnotationCall {

        @Test
        fun `should resolve annotations in same file`() = withResource(ANNOTATION_CALL) {
            val annotationCalls = this.descendants<SdsAnnotationCall>().toList()
            annotationCalls.shouldHaveSize(6)

            val annotationInSameFile = findUniqueDeclarationOrFail<SdsAnnotation>("AnnotationInSameFile")

            val referencedAnnotation = annotationCalls[0].annotation
            referencedAnnotation.shouldBeResolved()
            referencedAnnotation.shouldBe(annotationInSameFile)
        }

        @Test
        fun `should resolve annotations in same package`() = withResource(ANNOTATION_CALL) {
            val annotationCalls = this.descendants<SdsAnnotationCall>().toList()
            annotationCalls.shouldHaveSize(6)

            val annotation = annotationCalls[1].annotation
            annotation.shouldBeResolved()
            annotation.name.shouldBe("AnnotationInSamePackage")
        }

        @Test
        fun `should resolve annotations in another package if imported`() = withResource(ANNOTATION_CALL) {
            val annotationCalls = this.descendants<SdsAnnotationCall>().toList()
            annotationCalls.shouldHaveSize(6)

            val annotation = annotationCalls[2].annotation
            annotation.shouldBeResolved()
            annotation.name.shouldBe("AnnotationInOtherPackage1")
        }

        @Test
        fun `should not resolve annotations in another package if not imported`() = withResource(ANNOTATION_CALL) {
            val annotationCalls = this.descendants<SdsAnnotationCall>().toList()
            annotationCalls.shouldHaveSize(6)
            annotationCalls[3].annotation.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve unknown declaration`() = withResource(ANNOTATION_CALL) {
            val annotationCalls = this.descendants<SdsAnnotationCall>().toList()
            annotationCalls.shouldHaveSize(6)
            annotationCalls[4].annotation.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve something that is not an annotation`() = withResource(ANNOTATION_CALL) {
            val annotationCalls = this.descendants<SdsAnnotationCall>().toList()
            annotationCalls.shouldHaveSize(6)
            annotationCalls[5].annotation.shouldNotBeResolved()
        }
    }

    @Nested
    inner class Argument {

        @Test
        fun `should resolve parameter in use annotation in same file`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val parameterInAnnotationInSameFile =
                    findUniqueDeclarationOrFail<SdsParameter>("parameterInAnnotationInSameFile")

                val referencedParameter = arguments[0].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.shouldBe(parameterInAnnotationInSameFile)
            }

        @Test
        fun `should resolve parameter in called block lambda in same step`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val parameterInLambdaInSameStep =
                    findUniqueDeclarationOrFail<SdsParameter>("parameterInBlockLambdaInSameStep")

                val referencedParameter = arguments[1].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.shouldBe(parameterInLambdaInSameStep)
            }

        @Test
        fun `should resolve parameter in called callable in same step`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val parameterInCallableInSameStep =
                    findUniqueDeclarationOrFail<SdsParameter>("parameterInCallableInSameStep")

                val referencedParameter = arguments[2].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.shouldBe(parameterInCallableInSameStep)
            }

        @Test
        fun `should resolve parameter in called class in same file`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val parameterInClassInSameFile = findUniqueDeclarationOrFail<SdsParameter>("parameterInClassInSameFile")

                val referencedParameter = arguments[3].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.shouldBe(parameterInClassInSameFile)
            }

        @Test
        fun `should resolve parameter in called enum variant in same file`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val parameterInEnumVariantInSameFile =
                    findUniqueDeclarationOrFail<SdsParameter>("parameterInEnumVariantInSameFile")

                val referencedParameter = arguments[4].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.shouldBe(parameterInEnumVariantInSameFile)
            }

        @Test
        fun `should resolve parameter in called expression lambda in same step`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val parameterInLambdaInSameStep =
                    findUniqueDeclarationOrFail<SdsParameter>("parameterInExpressionLambdaInSameStep")

                val referencedParameter = arguments[5].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.shouldBe(parameterInLambdaInSameStep)
            }

        @Test
        fun `should resolve parameter in called function in same file`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val parameterInFunctionSameFile =
                    findUniqueDeclarationOrFail<SdsParameter>("parameterInFunctionSameFile")

                val referencedParameter = arguments[6].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.shouldBe(parameterInFunctionSameFile)
            }

        @Test
        fun `should resolve parameter in called step in same file`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val parameterInStepInSameFile = findUniqueDeclarationOrFail<SdsParameter>("parameterInStepInSameFile")

                val referencedParameter = arguments[7].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.shouldBe(parameterInStepInSameFile)
            }

        @Test
        fun `should resolve parameter in called function in same package`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val referencedParameter = arguments[8].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.name.shouldBe("parameterInSamePackage")
            }

        @Test
        fun `should resolve parameter in called function that is imported and in another package`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)

                val referencedParameter = arguments[9].parameter
                referencedParameter.shouldBeResolved()
                referencedParameter.name.shouldBe("parameterInOtherPackage1")
            }

        @Test
        fun `should not resolve parameter in called function that is not imported and in another package`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)
                arguments[10].parameter.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve parameter in function other than called one in same package`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)
                arguments[11].parameter.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve parameter in function other than called one that is imported and in another package`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)
                arguments[12].parameter.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve parameter in function other than called one that is not imported and in another package`() =
            withResource(ARGUMENT) {
                val arguments = this.descendants<SdsArgument>().toList()
                arguments.shouldHaveSize(16)
                arguments[13].parameter.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve unknown declaration`() = withResource(ARGUMENT) {
            val arguments = this.descendants<SdsArgument>().toList()
            arguments.shouldHaveSize(16)
            arguments[14].parameter.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve something that is not a parameter`() = withResource(ARGUMENT) {
            val arguments = this.descendants<SdsArgument>().toList()
            arguments.shouldHaveSize(16)
            arguments[15].parameter.shouldNotBeResolved()
        }
    }

    @Nested
    inner class ImportWithAlias {

        @Test
        fun `should resolve alias name of declaration in same file`() = withResource(IMPORT_WITH_ALIAS) {
            val aliasNameInSameFile = findUniqueDeclarationOrFail<SdsParameter>("aliasNameInSameFile")
            val classInSameFile = findUniqueDeclarationOrFail<SdsClass>("ClassInSameFile")

            val type = aliasNameInSameFile.type
            type.shouldBeInstanceOf<SdsNamedType>()

            val declaration = type.declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(classInSameFile)
        }

        @Test
        fun `should resolve original name of declaration in same file`() = withResource(IMPORT_WITH_ALIAS) {
            val originalNameInSameFile = findUniqueDeclarationOrFail<SdsParameter>("originalNameInSameFile")

            val type = originalNameInSameFile.type
            type.shouldBeInstanceOf<SdsNamedType>()

            val declaration = type.declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("ClassInSameFile")
        }

        @Test
        fun `should resolve alias name of declaration in same package`() = withResource(IMPORT_WITH_ALIAS) {
            val aliasNameInSamePackage = findUniqueDeclarationOrFail<SdsParameter>("aliasNameInSamePackage")

            val type = aliasNameInSamePackage.type
            type.shouldBeInstanceOf<SdsNamedType>()

            val declaration = type.declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("ClassInSamePackage")
        }

        @Test
        fun `should resolve original name of declaration in same package`() = withResource(IMPORT_WITH_ALIAS) {
            val originalNameInSamePackage = findUniqueDeclarationOrFail<SdsParameter>("originalNameInSamePackage")

            val type = originalNameInSamePackage.type
            type.shouldBeInstanceOf<SdsNamedType>()

            val declaration = type.declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("ClassInSamePackage")
        }

        @Test
        fun `should resolve alias name of declaration in other package`() = withResource(IMPORT_WITH_ALIAS) {
            val aliasNameInOtherPackage = findUniqueDeclarationOrFail<SdsParameter>("aliasNameInOtherPackage")

            val type = aliasNameInOtherPackage.type
            type.shouldBeInstanceOf<SdsNamedType>()

            val declaration = type.declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("ClassInOtherPackage")
        }

        @Test
        fun `should not resolve original name of declaration in other package`() = withResource(IMPORT_WITH_ALIAS) {
            val originalNameInOtherPackage = findUniqueDeclarationOrFail<SdsParameter>("originalNameInOtherPackage")

            val type = originalNameInOtherPackage.type
            type.shouldBeInstanceOf<SdsNamedType>()
            type.declaration.shouldNotBeResolved()
        }
    }

    @Nested
    inner class NamedType {

        @Test
        fun `should resolve class in same file`() = withResource(NAMED_TYPE) {
            val paramClassInSameFile = findUniqueDeclarationOrFail<SdsParameter>("paramClassInSameFile")
            val classInSameFile = findUniqueDeclarationOrFail<SdsClass>("ClassInSameFile")

            val parameterType = paramClassInSameFile.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedClass = parameterType.declaration
            referencedClass.shouldBeResolved()
            referencedClass.shouldBe(classInSameFile)
        }

        @Test
        fun `should resolve enum in same file`() = withResource(NAMED_TYPE) {
            val paramEnumInSameFile = findUniqueDeclarationOrFail<SdsParameter>("paramEnumInSameFile")
            val enumInSameFile = findUniqueDeclarationOrFail<SdsEnum>("EnumInSameFile")

            val parameterType = paramEnumInSameFile.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedEnum = parameterType.declaration
            referencedEnum.shouldBeResolved()
            referencedEnum.shouldBe(enumInSameFile)
        }

        @Test
        fun `should resolve class in same package`() = withResource(NAMED_TYPE) {
            val paramClassInSamePackage = findUniqueDeclarationOrFail<SdsParameter>("paramClassInSamePackage")

            val parameterType = paramClassInSamePackage.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedClass = parameterType.declaration
            referencedClass.shouldBeResolved()
            referencedClass.name.shouldBe("ClassInSamePackage")
        }

        @Test
        fun `should resolve enum in same package`() = withResource(NAMED_TYPE) {
            val paramEnumInSamePackage = findUniqueDeclarationOrFail<SdsParameter>("paramEnumInSamePackage")

            val parameterType = paramEnumInSamePackage.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedEnum = parameterType.declaration
            referencedEnum.shouldBeResolved()
            referencedEnum.name.shouldBe("EnumInSamePackage")
        }

        @Test
        fun `should resolve class in another package if imported`() = withResource(NAMED_TYPE) {
            val paramClassInOtherPackage1 = findUniqueDeclarationOrFail<SdsParameter>("paramClassInOtherPackage1")

            val parameterType = paramClassInOtherPackage1.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedClass = parameterType.declaration
            referencedClass.shouldBeResolved()
            referencedClass.name.shouldBe("ClassInOtherPackage1")
        }

        @Test
        fun `should resolve enum in another package if imported`() = withResource(NAMED_TYPE) {
            val paramEnumInOtherPackage1 = findUniqueDeclarationOrFail<SdsParameter>("paramEnumInOtherPackage1")

            val parameterType = paramEnumInOtherPackage1.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedEnum = parameterType.declaration
            referencedEnum.shouldBeResolved()
            referencedEnum.name.shouldBe("EnumInOtherPackage1")
        }

        @Test
        fun `should not resolve class in another package if not imported`() = withResource(NAMED_TYPE) {
            val paramClassInOtherPackage2 = findUniqueDeclarationOrFail<SdsParameter>("paramClassInOtherPackage2")

            val parameterType = paramClassInOtherPackage2.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedClass = parameterType.declaration
            referencedClass.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve enum in another package if not imported`() = withResource(NAMED_TYPE) {
            val paramEnumInOtherPackage2 = findUniqueDeclarationOrFail<SdsParameter>("paramEnumInOtherPackage2")

            val parameterType = paramEnumInOtherPackage2.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedEnum = parameterType.declaration
            referencedEnum.shouldNotBeResolved()
        }

        @Test
        fun `should resolve type parameters in same function`() = withResource(NAMED_TYPE) {
            val paramTypeParameterInSameFunction =
                findUniqueDeclarationOrFail<SdsParameter>("paramTypeParameterInSameFunction")
            val typeParameter = findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_SAME_FUNCTION")

            val parameterType = paramTypeParameterInSameFunction.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedTypeParameter = parameterType.declaration
            referencedTypeParameter.shouldBeResolved()
            referencedTypeParameter.shouldBe(typeParameter)
        }

        @Test
        fun `should not resolve type parameters in another declaration in same file`() = withResource(NAMED_TYPE) {
            val paramTypeParameterInSameFile = findUniqueDeclarationOrFail<SdsParameter>("paramTypeParameterInSameFile")

            val parameterType = paramTypeParameterInSameFile.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedInterface = parameterType.declaration
            referencedInterface.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve type parameters in another declaration in same package`() = withResource(NAMED_TYPE) {
            val paramTypeParameterInSamePackage =
                findUniqueDeclarationOrFail<SdsParameter>("paramTypeParameterInSamePackage")

            val parameterType = paramTypeParameterInSamePackage.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedInterface = parameterType.declaration
            referencedInterface.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve type parameters in another declaration in another package`() =
            withResource(NAMED_TYPE) {
                val paramTypeParameterInOtherPackage =
                    findUniqueDeclarationOrFail<SdsParameter>("paramTypeParameterInOtherPackage")

                val parameterType = paramTypeParameterInOtherPackage.type
                parameterType.shouldBeInstanceOf<SdsNamedType>()

                val referencedInterface = parameterType.declaration
                referencedInterface.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve unknown declaration`() = withResource(NAMED_TYPE) {
            val paramUnresolvedNamedTypeDeclaration =
                findUniqueDeclarationOrFail<SdsParameter>("paramUnresolvedNamedTypeDeclaration")

            val parameterType = paramUnresolvedNamedTypeDeclaration.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedInterface = parameterType.declaration
            referencedInterface.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve something that is not a named type declaration`() = withResource(NAMED_TYPE) {
            val paramNotANamedTypeDeclaration =
                findUniqueDeclarationOrFail<SdsParameter>("paramNotANamedTypeDeclaration")

            val parameterType = paramNotANamedTypeDeclaration.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedInterface = parameterType.declaration
            referencedInterface.shouldNotBeResolved()
        }

        @Test
        fun `should resolve type parameters in containing class from attribute`() = withResource(NAMED_TYPE) {
            val attributeInClassWithTypeParameter =
                findUniqueDeclarationOrFail<SdsAttribute>("attributeInClassWithTypeParameter")
            val typeParameter = findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_OUTER_CLASS")

            val attributeType = attributeInClassWithTypeParameter.type
            attributeType.shouldBeInstanceOf<SdsNamedType>()

            val referencedTypeParameter = attributeType.declaration
            referencedTypeParameter.shouldBeResolved()
            referencedTypeParameter.shouldBe(typeParameter)
        }

        @Test
        fun `should resolve type parameters in containing class from nested class`() = withResource(NAMED_TYPE) {
            val paramClassInClassWithTypeParameter =
                findUniqueDeclarationOrFail<SdsParameter>("paramClassInClassWithTypeParameter")
            val typeParameter = findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_OUTER_CLASS")

            val parameterType = paramClassInClassWithTypeParameter.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedTypeParameter = parameterType.declaration
            referencedTypeParameter.shouldBeResolved()
            referencedTypeParameter.shouldBe(typeParameter)
        }

        @Test
        fun `should resolve type parameters in containing class from nested enum variant`() = withResource(NAMED_TYPE) {
            val paramEnumInClassWithTypeParameter =
                findUniqueDeclarationOrFail<SdsParameter>("paramEnumInClassWithTypeParameter")
            val typeParameter = findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_OUTER_CLASS")

            val parameterType = paramEnumInClassWithTypeParameter.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedTypeParameter = parameterType.declaration
            referencedTypeParameter.shouldBeResolved()
            referencedTypeParameter.shouldBe(typeParameter)
        }

        @Test
        fun `should resolve type parameters in containing class from method`() = withResource(NAMED_TYPE) {
            val paramMethodInClassWithTypeParameter =
                findUniqueDeclarationOrFail<SdsParameter>("paramMethodInClassWithTypeParameter")
            val typeParameter = findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_OUTER_CLASS")

            val parameterType = paramMethodInClassWithTypeParameter.type
            parameterType.shouldBeInstanceOf<SdsNamedType>()

            val referencedTypeParameter = parameterType.declaration
            referencedTypeParameter.shouldBeResolved()
            referencedTypeParameter.shouldBe(typeParameter)
        }

        @Nested
        inner class MemberType {
            @Test
            fun `should resolve class within class with qualified access`() = withResource(NAMED_TYPE) {
                val paramClassInClassInSameFile =
                    findUniqueDeclarationOrFail<SdsParameter>("paramClassInClassInSameFile")
                val classInSameFile = findUniqueDeclarationOrFail<SdsClass>("ClassInClassInSameFile")

                val parameterType = paramClassInClassInSameFile.type
                parameterType.shouldBeInstanceOf<SdsMemberType>()

                val referencedClass = parameterType.member.declaration
                referencedClass.shouldBeResolved()
                referencedClass.shouldBe(classInSameFile)
            }

            @Test
            fun `should resolve enum within class with qualified access`() = withResource(NAMED_TYPE) {
                val paramEnumInClassInSameFile = findUniqueDeclarationOrFail<SdsParameter>("paramEnumInClassInSameFile")
                val enumInSameFile = findUniqueDeclarationOrFail<SdsEnum>("EnumInClassInSameFile")

                val parameterType = paramEnumInClassInSameFile.type
                parameterType.shouldBeInstanceOf<SdsMemberType>()

                val referencedEnum = parameterType.member.declaration
                referencedEnum.shouldBeResolved()
                referencedEnum.shouldBe(enumInSameFile)
            }

            @Test
            fun `should resolve enum variant with qualified access`() = withResource(NAMED_TYPE) {
                val paramEnumVariantInSameFile = findUniqueDeclarationOrFail<SdsParameter>("paramEnumVariantInSameFile")
                val enumVariantInSameFile = findUniqueDeclarationOrFail<SdsEnumVariant>("EnumVariantInSameFile")

                val parameterType = paramEnumVariantInSameFile.type
                parameterType.shouldBeInstanceOf<SdsMemberType>()

                val referencedEnumVariant = parameterType.member.declaration
                referencedEnumVariant.shouldBeResolved()
                referencedEnumVariant.shouldBe(enumVariantInSameFile)
            }

            @Test
            fun `should not resolve class within class with unqualified access`() = withResource(NAMED_TYPE) {
                val paramUnqualifiedClassInClassInSameFile =
                    findUniqueDeclarationOrFail<SdsParameter>("paramUnqualifiedClassInClassInSameFile")

                val parameterType = paramUnqualifiedClassInClassInSameFile.type
                parameterType.shouldBeInstanceOf<SdsNamedType>()
                parameterType.declaration.shouldNotBeResolved()
            }

            @Test
            fun `should not resolve enum within class with unqualified access`() = withResource(NAMED_TYPE) {
                val paramUnqualifiedEnumInClassInSameFile =
                    findUniqueDeclarationOrFail<SdsParameter>("paramUnqualifiedEnumInClassInSameFile")

                val parameterType = paramUnqualifiedEnumInClassInSameFile.type
                parameterType.shouldBeInstanceOf<SdsNamedType>()
                parameterType.declaration.shouldNotBeResolved()
            }

            @Test
            fun `should not resolve enum variant with unqualified access`() = withResource(NAMED_TYPE) {
                val paramUnqualifiedEnumVariantInSameFile =
                    findUniqueDeclarationOrFail<SdsParameter>("paramUnqualifiedEnumVariantInSameFile")

                val parameterType = paramUnqualifiedEnumVariantInSameFile.type
                parameterType.shouldBeInstanceOf<SdsNamedType>()
                parameterType.declaration.shouldNotBeResolved()
            }

            @Test
            fun `should resolve inherited class within class with qualified access`() = withResource(NAMED_TYPE) {
                val paramClassInSuperClass = findUniqueDeclarationOrFail<SdsParameter>("paramClassInSuperClass")
                val classInSameFile = findUniqueDeclarationOrFail<SdsClass>("ClassInSuperClass")

                val parameterType = paramClassInSuperClass.type
                parameterType.shouldBeInstanceOf<SdsMemberType>()

                val referencedClass = parameterType.member.declaration
                referencedClass.shouldBeResolved()
                referencedClass.shouldBe(classInSameFile)
            }

            @Test
            fun `should resolve inherited enum within class with qualified access`() = withResource(NAMED_TYPE) {
                val paramEnumInSuperClass = findUniqueDeclarationOrFail<SdsParameter>("paramEnumInSuperClass")
                val enumInSameFile = findUniqueDeclarationOrFail<SdsEnum>("EnumInSuperClass")

                val parameterType = paramEnumInSuperClass.type
                parameterType.shouldBeInstanceOf<SdsMemberType>()

                val referencedEnum = parameterType.member.declaration
                referencedEnum.shouldBeResolved()
                referencedEnum.shouldBe(enumInSameFile)
            }
        }
    }

    @Nested
    inner class ProtocolReference {

        @Test
        fun `should resolve static attribute in super class`() = withResource(PROTOCOL_REFERENCE) {
            val superClassStaticAttributeReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("superClassStaticAttributeReference")

            val superClassStaticAttribute = findUniqueDeclarationOrFail<SdsAttribute>("superClassStaticAttribute")

            val term = superClassStaticAttributeReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe superClassStaticAttribute
        }

        @Test
        fun `should resolve instance attribute in super class`() = withResource(PROTOCOL_REFERENCE) {
            val superClassInstanceAttributeReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("superClassInstanceAttributeReference")

            val superClassInstanceAttribute = findUniqueDeclarationOrFail<SdsAttribute>("superClassInstanceAttribute")

            val term = superClassInstanceAttributeReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe superClassInstanceAttribute
        }

        @Test
        fun `should resolve static method in super class`() = withResource(PROTOCOL_REFERENCE) {
            val superClassStaticMethodReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("superClassStaticMethodReference")

            val superClassStaticMethod = findUniqueDeclarationOrFail<SdsFunction>("superClassStaticMethod")

            val term = superClassStaticMethodReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe superClassStaticMethod
        }

        @Test
        fun `should resolve instance method in super class`() = withResource(PROTOCOL_REFERENCE) {
            val superClassInstanceMethodReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("superClassInstanceMethodReference")

            val superClassInstanceMethod = findUniqueDeclarationOrFail<SdsFunction>("superClassInstanceMethod")

            val term = superClassInstanceMethodReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe superClassInstanceMethod
        }

        @Test
        fun `should not resolve static attribute in container class`() = withResource(PROTOCOL_REFERENCE) {
            val containerClassStaticAttributeReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("containerClassStaticAttributeReference")

            val term = containerClassStaticAttributeReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve instance attribute in container class`() = withResource(PROTOCOL_REFERENCE) {
            val containerClassInstanceAttributeReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("containerClassInstanceAttributeReference")

            val term = containerClassInstanceAttributeReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve static method in container class`() = withResource(PROTOCOL_REFERENCE) {
            val containerClassStaticMethodReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("containerClassStaticMethodReference")

            val term = containerClassStaticMethodReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve instance method in container class`() = withResource(PROTOCOL_REFERENCE) {
            val containerClassInstanceMethodReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("containerClassInstanceMethodReference")

            val term = containerClassInstanceMethodReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldNotBeResolved()
        }

        @Test
        fun `should resolve static attribute in own class`() = withResource(PROTOCOL_REFERENCE) {
            val subClassStaticAttributeReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("subClassStaticAttributeReference")

            val subClassStaticAttribute = findUniqueDeclarationOrFail<SdsAttribute>("subClassStaticAttribute")

            val term = subClassStaticAttributeReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe subClassStaticAttribute
        }

        @Test
        fun `should resolve instance attribute in own class`() = withResource(PROTOCOL_REFERENCE) {
            val subClassInstanceAttributeReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("subClassInstanceAttributeReference")

            val subClassInstanceAttribute = findUniqueDeclarationOrFail<SdsAttribute>("subClassInstanceAttribute")

            val term = subClassInstanceAttributeReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe subClassInstanceAttribute
        }

        @Test
        fun `should resolve static method in own class`() = withResource(PROTOCOL_REFERENCE) {
            val subClassStaticMethodReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("subClassStaticMethodReference")

            val subClassStaticMethod = findUniqueDeclarationOrFail<SdsFunction>("subClassStaticMethod")

            val term = subClassStaticMethodReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe subClassStaticMethod
        }

        @Test
        fun `should resolve instance method in own class`() = withResource(PROTOCOL_REFERENCE) {
            val subClassInstanceMethodReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("subClassInstanceMethodReference")

            val subClassInstanceMethod = findUniqueDeclarationOrFail<SdsFunction>("subClassInstanceMethod")

            val term = subClassInstanceMethodReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe subClassInstanceMethod
        }

        @Test
        fun `should resolve overriding declaration`() = withResource(PROTOCOL_REFERENCE) {
            val overriddenReference = findUniqueDeclarationOrFail<SdsProtocolSubterm>("overriddenReference")

            val subClass = findUniqueDeclarationOrFail<SdsClass>("SubClass")
            val overridden = subClass.findUniqueDeclarationOrFail<SdsFunction>("overridden")

            val term = overriddenReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe overridden
        }

        @Test
        fun `should resolve other subterms`() = withResource(PROTOCOL_REFERENCE) {
            val subtermReference = findUniqueDeclarationOrFail<SdsProtocolSubterm>("subtermReference")
            val forwardReference = findUniqueDeclarationOrFail<SdsProtocolSubterm>("forwardReference")

            val term = subtermReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe forwardReference
        }

        @Test
        fun `should resolve shadowing subterm`() = withResource(PROTOCOL_REFERENCE) {
            val shadowedReference = findUniqueDeclarationOrFail<SdsProtocolSubterm>("shadowedReference")
            val shadowed = findUniqueDeclarationOrFail<SdsProtocolSubterm>("shadowed")

            val term = shadowedReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldBeResolved()
            term.token shouldBe shadowed
        }

        @Test
        fun `should not resolve forward reference to subterm`() = withResource(PROTOCOL_REFERENCE) {
            val forwardReference = findUniqueDeclarationOrFail<SdsProtocolSubterm>("forwardReference")

            val term = forwardReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve unknown declaration`() = withResource(PROTOCOL_REFERENCE) {
            val unresolvedReference = findUniqueDeclarationOrFail<SdsProtocolSubterm>("unresolvedReference")

            val term = unresolvedReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve something that is not a protocol token`() = withResource(PROTOCOL_REFERENCE) {
            val notAProtocolTokenReference =
                findUniqueDeclarationOrFail<SdsProtocolSubterm>("notAProtocolTokenReference")

            val term = notAProtocolTokenReference.term
            term.shouldBeInstanceOf<SdsProtocolReference>()
            term.token.shouldNotBeResolved()
        }
    }

    @Nested
    inner class Reference {

        @Test
        fun `should not resolve annotation in same file`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToAnnotations")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[0].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve annotation in same package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToAnnotations")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[1].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve annotation in another package if imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToAnnotations")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[2].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve annotation in another package if not imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToAnnotations")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[3].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should resolve class in same file`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToClasses")
            val classInSameFile = findUniqueDeclarationOrFail<SdsClass>("ClassInSameFile")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[0].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(classInSameFile)
        }

        @Test
        fun `should resolve class in same package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToClasses")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[1].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("ClassInSamePackage")
        }

        @Test
        fun `should resolve class in another package if imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToClasses")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[2].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("ClassInOtherPackage1")
        }

        @Test
        fun `should not resolve class in another package if not imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToClasses")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[3].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should resolve enum in same file`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToEnums")
            val enumInSameFile = findUniqueDeclarationOrFail<SdsEnum>("EnumInSameFile")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[0].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(enumInSameFile)
        }

        @Test
        fun `should resolve enum in same package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToEnums")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[1].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("EnumInSamePackage")
        }

        @Test
        fun `should resolve enum in another package if imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToEnums")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[2].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("EnumInOtherPackage1")
        }

        @Test
        fun `should not resolve enum in another package if not imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToEnums")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[3].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should resolve global function in same file`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToGlobalFunctions")
            val globalFunctionInSameFile = findUniqueDeclarationOrFail<SdsFunction>("globalFunctionInSameFile")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[0].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(globalFunctionInSameFile)
        }

        @Test
        fun `should resolve global function in same package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToGlobalFunctions")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[1].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("globalFunctionInSamePackage")
        }

        @Test
        fun `should resolve global function in another package if imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToGlobalFunctions")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[2].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("globalFunctionInOtherPackage1")
        }

        @Test
        fun `should not resolve global function in another package if not imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToGlobalFunctions")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[3].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should resolve goal in same file`() = withResource(GOAL_REFERENCE) {
            val predicate = findUniqueDeclarationOrFail<SdsPredicate>("directReferencesToPredicates")
            val predicateInSameFile = findUniqueDeclarationOrFail<SdsPredicate>("PredicateInSameFile")

            val references = predicate.descendants<SdsGoalReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[0].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(predicateInSameFile)
        }

        @Test
        fun `should resolve goal in same package`() = withResource(GOAL_REFERENCE) {
            val predicate = findUniqueDeclarationOrFail<SdsPredicate>("directReferencesToPredicates")

            val references = predicate.descendants<SdsGoalReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[1].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("PredicateInSamePackage")
        }

        @Test
        fun `should resolve goal in another package if imported`() = withResource(GOAL_REFERENCE) {
            val predicate = findUniqueDeclarationOrFail<SdsPredicate>("directReferencesToPredicates")

            val references = predicate.descendants<SdsGoalReference>().toList()
            references.shouldHaveSize(4)

            val declaration = references[2].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("PredicateInOtherPackage1")
        }

        @Test
        fun `should not resolve goal in another package if not imported`() = withResource(GOAL_REFERENCE) {
            val predicate = findUniqueDeclarationOrFail<SdsPredicate>("directReferencesToPredicates")

            val references = predicate.descendants<SdsGoalReference>().toList()
            references.shouldHaveSize(4)
            references[3].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve lambda result`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToLambdaResults")

            val reference = step.descendants<SdsReference>().firstOrNull()
            reference.shouldNotBeNull()
            reference.declaration.shouldNotBeResolved()
        }

        @Test
        fun `should resolve parameter of step in same step`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToParameters")
            val parameterInStep = step.findUniqueDeclarationOrFail<SdsParameter>("parameterInStep")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(6)

            val declaration = references[0].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(parameterInStep)
        }

        @Test
        fun `should resolve parameter of step in block lambda in same step`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToParameters")
            val parameterInStep = step.findUniqueDeclarationOrFail<SdsParameter>("parameterInStep")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(6)

            val declaration = references[1].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(parameterInStep)
        }

        @Test
        fun `should resolve parameter of block lambda in same block lambda`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToParameters")
                val parameterInLambda = step.findUniqueDeclarationOrFail<SdsParameter>("parameterInBlockLambda")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(6)

                val declaration = references[2].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(parameterInLambda)
            }

        @Test
        fun `should resolve parameter of step in block lambda within block lambda in same step`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToParameters")
                val parameterInStep = step.findUniqueDeclarationOrFail<SdsParameter>("parameterInStep")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(6)

                val declaration = references[3].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(parameterInStep)
            }

        @Test
        fun `should resolve parameter of block lambda in nested block lambda`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToParameters")
                val parameterInLambda = step.findUniqueDeclarationOrFail<SdsParameter>("parameterInBlockLambda")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(6)

                val declaration = references[4].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(parameterInLambda)
            }

        @Test
        fun `should resolve parameter of expression lambda in same expression lambda`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToParameters")
                val parameterInLambda = step.findUniqueDeclarationOrFail<SdsParameter>("parameterInExpressionLambda")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(6)

                val declaration = references[5].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(parameterInLambda)
            }

        @Test
        fun `should resolve placeholder of step in same step`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToPlaceholders")
            val placeholderInStep = step.findUniqueDeclarationOrFail<SdsPlaceholder>("placeholderInStep")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(5)

            val declaration = references[0].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(placeholderInStep)
        }

        @Test
        fun `should resolve placeholder of step in lambda in same step`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToPlaceholders")
            val placeholderInStep = step.findUniqueDeclarationOrFail<SdsPlaceholder>("placeholderInStep")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(5)

            val declaration = references[1].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(placeholderInStep)
        }

        @Test
        fun `should resolve placeholder of lambda in same lambda`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToPlaceholders")
                val placeholderInLambda = step.findUniqueDeclarationOrFail<SdsPlaceholder>("placeholderInLambda")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(5)

                val declaration = references[2].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(placeholderInLambda)
            }

        @Test
        fun `should resolve placeholder of step in lambda within lambda in same step`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToPlaceholders")
                val placeholderInStep = step.findUniqueDeclarationOrFail<SdsPlaceholder>("placeholderInStep")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(5)

                val declaration = references[3].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(placeholderInStep)
            }

        @Test
        fun `should resolve placeholder of lambda in nested lambda`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToPlaceholders")
                val placeholderInLambda = step.findUniqueDeclarationOrFail<SdsPlaceholder>("placeholderInLambda")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(5)

                val declaration = references[4].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(placeholderInLambda)
            }

        @Test
        fun `should not resolve type parameters`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToTypeParameters")

            val reference = step.descendants<SdsReference>().firstOrNull()
            reference.shouldNotBeNull()
            reference.declaration.shouldNotBeResolved()
        }

        @Test
        fun `should resolve step in same file`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")
            val stepInSameFile = findUniqueDeclarationOrFail<SdsStep>("stepInSameFile")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)

            val declaration = references[0].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(stepInSameFile)
        }

        @Test
        fun `should resolve step in same package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)

            val declaration = references[1].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("stepInSamePackage")
        }

        @Test
        fun `should resolve step in another package if imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)

            val declaration = references[2].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("stepInOtherPackage1")
        }

        @Test
        fun `should not resolve step in another package if not imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)
            references[3].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should resolve internal step in same file`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")
            val stepInSameFile = findUniqueDeclarationOrFail<SdsStep>("internalStepInSameFile")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)

            val declaration = references[4].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(stepInSameFile)
        }

        @Test
        fun `should resolve private step in same file`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")
            val stepInSameFile = findUniqueDeclarationOrFail<SdsStep>("privateStepInSameFile")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)

            val declaration = references[5].declaration
            declaration.shouldBeResolved()
            declaration.shouldBe(stepInSameFile)
        }

        @Test
        fun `should resolve internal step in same package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)

            val declaration = references[6].declaration
            declaration.shouldBeResolved()
            declaration.name.shouldBe("internalStepInSamePackage")
        }

        @Test
        fun `should not resolve private step in same package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)
            references[7].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve internal step in another package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)
            references[8].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve private step in another package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToSteps")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(10)
            references[9].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve workflow in same file`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToWorkflows")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[0].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve workflow in same package`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToWorkflows")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[1].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve workflow in another package if imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToWorkflows")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[2].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve workflow in another package if not imported`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("directReferencesToWorkflows")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(4)
            references[3].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve placeholder declared later in same step`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("forwardReferences")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(3)
            references[0].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve placeholder declared later from nested lambda`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("forwardReferences")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(3)
            references[1].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve placeholder that lambda is assigned to from body of lambda`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("forwardReferences")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(3)
                references[2].declaration.shouldNotBeResolved()
            }

        @Test
        fun `should resolve declaration shadowed by parameter of step`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("shadowedReferences")

                val parameters = step.parametersOrEmpty()
                parameters.shouldHaveSize(1)

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(4)

                val declaration = references[0].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(parameters[0])
            }

        @Test
        fun `should resolve declaration shadowed by placeholder of step`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("shadowedReferences")

                val placeholders = step.descendants<SdsPlaceholder>().toList()
                placeholders.shouldHaveSize(3)

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(4)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(placeholders[0])
            }

        @Test
        fun `should resolve declaration shadowed by parameter of lambda`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("shadowedReferences")

                val parameters = step.body.descendants<SdsParameter>().toList()
                parameters.shouldHaveSize(1)

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(4)

                val declaration = references[2].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(parameters[0])
            }

        @Test
        fun `should resolve declaration shadowed by placeholder of lambda`() =
            withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("shadowedReferences")

                val placeholders = step.descendants<SdsPlaceholder>().toList()
                placeholders.shouldHaveSize(3)

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(4)

                val declaration = references[3].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(placeholders[2])
            }

        @Test
        fun `should not resolve function locals`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("referencesToFunctionLocals")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(2)
            references.forEachAsClue {
                it.declaration.shouldNotBeResolved()
            }
        }

        @Test
        fun `should not resolve lambda locals`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("referencesToLambdaLocals")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(3)
            references[0].declaration.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve step locals`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("referencesToStepLocals")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(3)
            references.forEachAsClue {
                it.declaration.shouldNotBeResolved()
            }
        }

        @Test
        fun `should not resolve unknown declaration`() = withResource(REFERENCE) {
            val step = findUniqueDeclarationOrFail<SdsStep>("unresolvedReferences")

            val references = step.descendants<SdsReference>().toList()
            references.shouldHaveSize(1)
            references[0].declaration.shouldNotBeResolved()
        }

        @Nested
        inner class MemberAccess {

            @Test
            fun `should resolve static class attribute accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToClassMembers")
                val classStaticAttributeInSameFile =
                    findUniqueDeclarationOrFail<SdsAttribute>("classStaticAttributeInSameFile")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(classStaticAttributeInSameFile)
            }

            @Test
            fun `should resolve instance class attribute accessed from class instance`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToClassMembers")
                val classInstanceAttributeInSameFile =
                    findUniqueDeclarationOrFail<SdsAttribute>("classInstanceAttributeInSameFile")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[3].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(classInstanceAttributeInSameFile)
            }

            @Test
            fun `should resolve nested class accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToClassMembers")
                val classInClassInSameFile =
                    findUniqueDeclarationOrFail<SdsClass>("ClassInClassInSameFile")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[5].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(classInClassInSameFile)
            }

            @Test
            fun `should resolve nested enum accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToClassMembers")
                val enumInClassInSameFile =
                    findUniqueDeclarationOrFail<SdsEnum>("EnumInClassInSameFile")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[7].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(enumInClassInSameFile)
            }

            @Test
            fun `should resolve static class method accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToClassMembers")
                val classStaticMethodInSameFile =
                    findUniqueDeclarationOrFail<SdsFunction>("classStaticMethodInSameFile")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[9].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(classStaticMethodInSameFile)
            }

            @Test
            fun `should resolve instance class method accessed from class instance`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToClassMembers")
                val classInstanceMethodInSameFile =
                    findUniqueDeclarationOrFail<SdsFunction>("classInstanceMethodInSameFile")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[11].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(classInstanceMethodInSameFile)
            }

            @Test
            fun `should resolve enum variants`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToEnumVariants")
                val enumVariantInSameFile =
                    findUniqueDeclarationOrFail<SdsEnumVariant>("EnumVariantInSameFile")

                val references = step.body.descendants<SdsReference>().toList()
                references.shouldHaveSize(2)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(enumVariantInSameFile)
            }

            @Test
            fun `should resolve enum variants from step annotation`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToEnumVariants")
                val enumVariantInSameFile =
                    findUniqueDeclarationOrFail<SdsEnumVariant>("EnumVariantInSameFile")

                val annotations = step.annotationCallsOrEmpty()
                annotations.shouldHaveSize(1)

                val references = annotations[0].descendants<SdsReference>().toList()
                references.shouldHaveSize(2)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(enumVariantInSameFile)
            }

            @Test
            fun `should resolve enum variants from parameter annotation`() = withResource(REFERENCE) {
                val parameter =
                    findUniqueDeclarationOrFail<SdsParameter>("referenceToEnumVariantFromParameterAnnotation")
                val enumVariantInSameFile =
                    findUniqueDeclarationOrFail<SdsEnumVariant>("EnumVariantInSameFile")

                val annotations = parameter.annotationCallsOrEmpty()
                annotations.shouldHaveSize(1)

                val references = annotations[0].descendants<SdsReference>().toList()
                references.shouldHaveSize(2)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(enumVariantInSameFile)
            }

            @Test
            fun `should resolve enum variants of nested enum from class annotation`() = withResource(REFERENCE) {
                val parameter = findUniqueDeclarationOrFail<SdsClass>("ReferencesToEnumVariantsInnerClass")
                val enumVariantInSameFile =
                    findUniqueDeclarationOrFail<SdsEnumVariant>("EnumVariantInSameClass")

                val annotations = parameter.annotationCallsOrEmpty()
                annotations.shouldHaveSize(2)

                val references = annotations[0].descendants<SdsReference>().toList()
                references.shouldHaveSize(2)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(enumVariantInSameFile)
            }

            @Test
            fun `should resolve enum variants of global enum from class annotation`() = withResource(REFERENCE) {
                val parameter = findUniqueDeclarationOrFail<SdsClass>("ReferencesToEnumVariantsInnerClass")
                val enumVariantInSameClass =
                    findUniqueDeclarationOrFail<SdsEnumVariant>("EnumVariantInSameFile")

                val annotations = parameter.annotationCallsOrEmpty()
                annotations.shouldHaveSize(2)

                val references = annotations[1].descendants<SdsReference>().toList()
                references.shouldHaveSize(2)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(enumVariantInSameClass)
            }

            @Test
            fun `should resolve parameters of enum variants`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToEnumVariantParameters")
                val enumVariantParameterInSameFile =
                    findUniqueDeclarationOrFail<SdsParameter>("enumVariantParameterInSameFile")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(3)

                val declaration = references[2].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(enumVariantParameterInSameFile)
            }

            @Test
            fun `should resolve inherited static class attribute accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToInheritedClassMembers")
                val superClassStaticAttribute =
                    findUniqueDeclarationOrFail<SdsAttribute>("superClassStaticAttribute")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(superClassStaticAttribute)
            }

            @Test
            fun `should resolve inherited instance class attribute accessed from class instance`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToInheritedClassMembers")
                    val superClassInstanceAttribute =
                        findUniqueDeclarationOrFail<SdsAttribute>("superClassInstanceAttribute")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(12)

                    val declaration = references[3].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(superClassInstanceAttribute)
                }

            @Test
            fun `should resolve inherited nested class accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToInheritedClassMembers")
                val classInSuperClass =
                    findUniqueDeclarationOrFail<SdsClass>("ClassInSuperClass")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[5].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(classInSuperClass)
            }

            @Test
            fun `should resolve inherited nested enum accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToInheritedClassMembers")
                val enumInSuperClass =
                    findUniqueDeclarationOrFail<SdsEnum>("EnumInSuperClass")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[7].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(enumInSuperClass)
            }

            @Test
            fun `should resolve inherited static class method accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToInheritedClassMembers")
                val superClassStaticMethod =
                    findUniqueDeclarationOrFail<SdsFunction>("superClassStaticMethod")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(12)

                val declaration = references[9].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(superClassStaticMethod)
            }

            @Test
            fun `should resolve inherited instance class method accessed from class instance`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToInheritedClassMembers")
                    val superClassInstanceMethod =
                        findUniqueDeclarationOrFail<SdsFunction>("superClassInstanceMethod")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(12)

                    val declaration = references[11].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(superClassInstanceMethod)
                }

            @Test
            fun `should resolve overridden instance attribute`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToOverriddenMembers")
                val subClassForOverriding = findUniqueDeclarationOrFail<SdsClass>("SubClassForOverriding")
                val instanceAttributeForOverriding =
                    subClassForOverriding.findUniqueDeclarationOrFail<SdsAttribute>("instanceAttributeForOverriding")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(8)

                val declaration = references[5].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(instanceAttributeForOverriding)
            }

            @Test
            fun `should resolve overridden instance method`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToOverriddenMembers")
                val subClassForOverriding = findUniqueDeclarationOrFail<SdsClass>("SubClassForOverriding")
                val instanceMethodForOverriding =
                    subClassForOverriding.findUniqueDeclarationOrFail<SdsFunction>("instanceMethodForOverriding")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(8)

                val declaration = references[7].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(instanceMethodForOverriding)
            }

            @Test
            fun `should resolve hidden static attribute`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToHiddenMembers")
                val subClassForHiding = findUniqueDeclarationOrFail<SdsClass>("SubClassForHiding")
                val staticAttributeForHiding =
                    subClassForHiding.findUniqueDeclarationOrFail<SdsAttribute>("staticAttributeForHiding")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(8)

                val declaration = references[1].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(staticAttributeForHiding)
            }

            @Test
            fun `should resolve hidden nested class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToHiddenMembers")
                val subClassForHiding = findUniqueDeclarationOrFail<SdsClass>("SubClassForHiding")
                val nestedClassForHiding =
                    subClassForHiding.findUniqueDeclarationOrFail<SdsClass>("NestedClassForHiding")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(8)

                val declaration = references[3].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(nestedClassForHiding)
            }

            @Test
            fun `should resolve hidden nested enum`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToHiddenMembers")
                val subClassForHiding = findUniqueDeclarationOrFail<SdsClass>("SubClassForHiding")
                val nestedEnumForHiding =
                    subClassForHiding.findUniqueDeclarationOrFail<SdsEnum>("NestedEnumForHiding")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(8)

                val declaration = references[5].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(nestedEnumForHiding)
            }

            @Test
            fun `should resolve hidden static method`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToHiddenMembers")
                val subClassForHiding = findUniqueDeclarationOrFail<SdsClass>("SubClassForHiding")
                val staticMethodForHiding =
                    subClassForHiding.findUniqueDeclarationOrFail<SdsFunction>("staticMethodForHiding")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(8)

                val declaration = references[7].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(staticMethodForHiding)
            }

            @Test
            fun `should not resolve static class members accessed from instance`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToStaticClassMembersFromInstance")
                val classInSameFile = findUniqueDeclarationOrFail<SdsClass>("ClassInSameFile")

                val references = step.descendants<SdsReference>()
                    .filter { it.declaration != classInSameFile }
                    .toList()
                references.shouldHaveSize(8)
                references.forEachAsClue {
                    it.declaration.shouldNotBeResolved()
                }
            }

            @Test
            fun `should not resolve instance class members accessed from class`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToInstanceClassMembersFromClass")
                val classInSameFile = findUniqueDeclarationOrFail<SdsClass>("ClassInSameFile")

                val references = step.descendants<SdsReference>()
                    .filter { it.declaration != classInSameFile }
                    .toList()
                references.shouldHaveSize(4)
                references.forEachAsClue {
                    it.declaration.shouldNotBeResolved()
                }
            }

            @Test
            fun `should not resolve class members with unqualified access`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("unqualifiedReferencesToClassMembers")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(6)
                references.forEachAsClue {
                    it.declaration.shouldNotBeResolved()
                }
            }

            @Test
            fun `should not resolve enum variants with unqualified access`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("unqualifiedReferencesToEnumVariants")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(1)
                references[0].declaration.shouldNotBeResolved()
            }

            @Test
            fun `should not resolve parameters of enum variants with unqualified access`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("unqualifiedReferencesToEnumVariantParameters")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(1)
                references[0].declaration.shouldNotBeResolved()
            }

            @Test
            fun `should resolve result of callable type with one result without matching member`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToCallableTypeResults")
                    val singleResult = step.findUniqueDeclarationOrFail<SdsResult>("singleResult")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(8)

                    val declaration = references[1].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(singleResult)
                }

            @Test
            fun `should resolve attribute for callable type with one result with matching class attribute`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToCallableTypeResults")
                    val classForResultMemberAccess = findUniqueDeclarationOrFail<SdsClass>("ClassForResultMemberAccess")
                    val result = classForResultMemberAccess.findUniqueDeclarationOrFail<SdsAttribute>("result")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(8)

                    val declaration = references[3].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(result)
                }

            @Test
            fun `should resolve result for callable type with one result with matching enum variant`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToCallableTypeResults")
                    val callableWithOneResultWithIdenticalEnumVariant =
                        step.findUniqueDeclarationOrFail<SdsParameter>("callableWithOneResultWithIdenticalEnumVariant")
                    val result =
                        callableWithOneResultWithIdenticalEnumVariant.findUniqueDeclarationOrFail<SdsResult>("result")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(8)

                    val declaration = references[5].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(result)
                }

            @Test
            fun `should resolve result of callable type with multiple results`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToCallableTypeResults")
                val result1 = step.findUniqueDeclarationOrFail<SdsResult>("result1")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(8)

                val declaration = references[7].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(result1)
            }

            @Test
            fun `should resolve result of function with one result without matching member`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToFunctionResults")
                    val globalFunctionResultInSameFile =
                        findUniqueDeclarationOrFail<SdsResult>("globalFunctionResultInSameFile")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(6)

                    val declaration = references[1].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(globalFunctionResultInSameFile)
                }

            @Test
            fun `should resolve member for function with one result with matching member`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToFunctionResults")
                    val classForResultMemberAccess = findUniqueDeclarationOrFail<SdsClass>("ClassForResultMemberAccess")
                    val result = classForResultMemberAccess.findUniqueDeclarationOrFail<SdsAttribute>("result")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(6)

                    val declaration = references[3].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(result)
                }

            @Test
            fun `should resolve result of function with multiple results`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToFunctionResults")
                val globalFunctionWithTwoResults =
                    findUniqueDeclarationOrFail<SdsFunction>("globalFunctionWithTwoResults")
                val result1 = globalFunctionWithTwoResults.findUniqueDeclarationOrFail<SdsResult>("result1")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(6)

                val declaration = references[5].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(result1)
            }

            @Test
            fun `should resolve result of lambda with one result without matching member`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToLambdaResults")
                val singleResult = step.findUniqueDeclarationOrFail<SdsBlockLambdaResult>("singleResult")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(7)

                val declaration = references[2].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(singleResult)
            }

            @Test
            fun `should resolve member for lambda with one result with matching member`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToLambdaResults")
                    val classForResultMemberAccess = findUniqueDeclarationOrFail<SdsClass>("ClassForResultMemberAccess")
                    val result = classForResultMemberAccess.findUniqueDeclarationOrFail<SdsAttribute>("result")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(7)

                    val declaration = references[4].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(result)
                }

            @Test
            fun `should resolve result of lambda with multiple results`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToLambdaResults")
                val result1 = step.findUniqueDeclarationOrFail<SdsBlockLambdaResult>("result1")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(7)

                val declaration = references[6].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(result1)
            }

            @Test
            fun `should resolve result of step with one result without matching member`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToStepResults")
                    val stepResultInSameFile = findUniqueDeclarationOrFail<SdsResult>("stepResultInSameFile")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(6)

                    val declaration = references[1].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(stepResultInSameFile)
                }

            @Test
            fun `should resolve member for step with one result with matching member`() =
                withResource(REFERENCE) {
                    val step = findUniqueDeclarationOrFail<SdsStep>("referencesToStepResults")
                    val classForResultMemberAccess = findUniqueDeclarationOrFail<SdsClass>("ClassForResultMemberAccess")
                    val result = classForResultMemberAccess.findUniqueDeclarationOrFail<SdsAttribute>("result")

                    val references = step.descendants<SdsReference>().toList()
                    references.shouldHaveSize(6)

                    val declaration = references[3].declaration
                    declaration.shouldBeResolved()
                    declaration.shouldBe(result)
                }

            @Test
            fun `should resolve result of step with multiple results`() = withResource(REFERENCE) {
                val step = findUniqueDeclarationOrFail<SdsStep>("referencesToStepResults")
                val stepInSameFileWithTwoResults =
                    findUniqueDeclarationOrFail<SdsStep>("stepWithTwoResults")
                val result1 = stepInSameFileWithTwoResults.findUniqueDeclarationOrFail<SdsResult>("result1")

                val references = step.descendants<SdsReference>().toList()
                references.shouldHaveSize(6)

                val declaration = references[5].declaration
                declaration.shouldBeResolved()
                declaration.shouldBe(result1)
            }
        }
    }

    @Nested
    inner class TypeArgument {

        @Test
        fun `should resolve type parameter in used class in same file`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)

                val typeParameterInSameFile =
                    findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_CLASS_IN_SAME_FILE")

                val referencedTypeParameter = typeArguments[0].typeParameter
                referencedTypeParameter.shouldBeResolved()
                referencedTypeParameter.shouldBe(typeParameterInSameFile)
            }

        @Test
        fun `should resolve type parameter in used enum variant in same file`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)

                val typeParameterInSameFile =
                    findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_ENUM_VARIANT_IN_SAME_FILE")

                val referencedTypeParameter = typeArguments[1].typeParameter
                referencedTypeParameter.shouldBeResolved()
                referencedTypeParameter.shouldBe(typeParameterInSameFile)
            }

        @Test
        fun `should resolve type parameter in used function in same file`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)

                val typeParameterInSameFile =
                    findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_FUNCTION_IN_SAME_FILE")

                val referencedTypeParameter = typeArguments[2].typeParameter
                referencedTypeParameter.shouldBeResolved()
                referencedTypeParameter.shouldBe(typeParameterInSameFile)
            }

        @Test
        fun `should resolve type parameter in used declaration in same package`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)

                val referencedTypeParameter = typeArguments[3].typeParameter
                referencedTypeParameter.shouldBeResolved()
                referencedTypeParameter.name.shouldBe("TYPE_PARAMETER_IN_SAME_PACKAGE")
            }

        @Test
        fun `should resolve type parameter in used declaration that is imported and in another package`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)

                val referencedTypeParameter = typeArguments[4].typeParameter
                referencedTypeParameter.shouldBeResolved()
                referencedTypeParameter.name.shouldBe("TYPE_PARAMETER_IN_OTHER_PACKAGE1")
            }

        @Test
        fun `should not resolve type parameter in used declaration that is not imported and in another package`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)
                typeArguments[5].typeParameter.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve type parameter in declaration other than used one in same package`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)
                typeArguments[6].typeParameter.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve type parameter in declaration other than used one that is imported and in another package`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)
                typeArguments[7].typeParameter.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve type parameter in declaration other than used one that is not imported and in another package`() =
            withResource(TYPE_ARGUMENT) {
                val typeArguments = this.descendants<SdsTypeArgument>().toList()
                typeArguments.shouldHaveSize(11)
                typeArguments[8].typeParameter.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve unknown declaration`() = withResource(TYPE_ARGUMENT) {
            val typeArguments = this.descendants<SdsTypeArgument>().toList()
            typeArguments.shouldHaveSize(11)
            typeArguments[9].typeParameter.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve something that is not a type parameter`() = withResource(TYPE_ARGUMENT) {
            val typeArguments = this.descendants<SdsTypeArgument>().toList()
            typeArguments.shouldHaveSize(11)
            typeArguments[10].typeParameter.shouldNotBeResolved()
        }
    }

    @Nested
    inner class TypeParameterConstraint {

        @Test
        fun `should resolve type parameter in same class`() = withResource(TYPE_PARAMETER_CONSTRAINT) {
            val testClass = findUniqueDeclarationOrFail<SdsClass>("TestClass")
            val typeParameterConstraintsGoal = testClass.descendants<SdsTypeParameterConstraintGoal>().toList()
            typeParameterConstraintsGoal.shouldHaveSize(1)

            val typeParameterInSameDeclaration =
                findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_SAME_CLASS")

            val referencedTypeParameter = typeParameterConstraintsGoal[0].leftOperand
            referencedTypeParameter.shouldBeResolved()
            referencedTypeParameter.shouldBe(typeParameterInSameDeclaration)
        }

        @Test
        fun `should resolve type parameter in same enum variant`() = withResource(TYPE_PARAMETER_CONSTRAINT) {
            val testEnumVariant = findUniqueDeclarationOrFail<SdsEnumVariant>("TestEnumVariant")
            val typeParameterConstraintsGoal = testEnumVariant.descendants<SdsTypeParameterConstraintGoal>().toList()
            typeParameterConstraintsGoal.shouldHaveSize(1)

            val typeParameterInSameDeclaration =
                findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_SAME_ENUM_VARIANT")

            val referencedTypeParameter = typeParameterConstraintsGoal[0].leftOperand
            referencedTypeParameter.shouldBeResolved()
            referencedTypeParameter.shouldBe(typeParameterInSameDeclaration)
        }

        @Test
        fun `should resolve type parameter in same function`() = withResource(TYPE_PARAMETER_CONSTRAINT) {
            val testFunction = findUniqueDeclarationOrFail<SdsFunction>("testFunction")
            val typeParameterConstraintsGoal = testFunction.descendants<SdsTypeParameterConstraintGoal>().toList()
            typeParameterConstraintsGoal.shouldHaveSize(7)

            val typeParameterInSameDeclaration =
                findUniqueDeclarationOrFail<SdsTypeParameter>("TYPE_PARAMETER_IN_SAME_FUNCTION")

            val referencedTypeParameter = typeParameterConstraintsGoal[0].leftOperand
            referencedTypeParameter.shouldBeResolved()
            referencedTypeParameter.shouldBe(typeParameterInSameDeclaration)
        }

        @Test
        fun `should not resolve type parameter in another declaration in same file`() = withResource(
            TYPE_PARAMETER_CONSTRAINT
        ) {
            val testFunction = findUniqueDeclarationOrFail<SdsFunction>("testFunction")
            val typeParameterConstraintsGoal = testFunction.descendants<SdsTypeParameterConstraintGoal>().toList()
            typeParameterConstraintsGoal.shouldHaveSize(7)
            typeParameterConstraintsGoal[1].leftOperand.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve type parameter in another declaration in same package`() =
            withResource(TYPE_PARAMETER_CONSTRAINT) {
                val testFunction = findUniqueDeclarationOrFail<SdsFunction>("testFunction")
                val typeParameterConstraintsGoal = testFunction.descendants<SdsTypeParameterConstraintGoal>().toList()
                typeParameterConstraintsGoal.shouldHaveSize(7)
                typeParameterConstraintsGoal[2].leftOperand.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve type parameter in another declaration that is imported and in another package`() =
            withResource(TYPE_PARAMETER_CONSTRAINT) {
                val testFunction = findUniqueDeclarationOrFail<SdsFunction>("testFunction")
                val typeParameterConstraintsGoal = testFunction.descendants<SdsTypeParameterConstraintGoal>().toList()
                typeParameterConstraintsGoal.shouldHaveSize(7)
                typeParameterConstraintsGoal[3].leftOperand.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve type parameter in another declaration that is not imported and in another package`() =
            withResource(TYPE_PARAMETER_CONSTRAINT) {
                val testFunction = findUniqueDeclarationOrFail<SdsFunction>("testFunction")
                val typeParameterConstraintsGoal = testFunction.descendants<SdsTypeParameterConstraintGoal>().toList()
                typeParameterConstraintsGoal.shouldHaveSize(7)
                typeParameterConstraintsGoal[4].leftOperand.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve unknown declaration`() = withResource(TYPE_PARAMETER_CONSTRAINT) {
            val testFunction = findUniqueDeclarationOrFail<SdsFunction>("testFunction")
            val typeParameterConstraintsGoal = testFunction.descendants<SdsTypeParameterConstraintGoal>().toList()
            typeParameterConstraintsGoal.shouldHaveSize(7)
            typeParameterConstraintsGoal[5].leftOperand.shouldNotBeResolved()
        }

        @Test
        fun `should not something that is not a type parameter`() = withResource(TYPE_PARAMETER_CONSTRAINT) {
            val testFunction = findUniqueDeclarationOrFail<SdsFunction>("testFunction")
            val typeParameterConstraintsGoal = testFunction.descendants<SdsTypeParameterConstraintGoal>().toList()
            typeParameterConstraintsGoal.shouldHaveSize(7)
            typeParameterConstraintsGoal[6].leftOperand.shouldNotBeResolved()
        }
    }

    @Nested
    inner class Yield {

        @Test
        fun `should resolve result in same step`() = withResource(YIELD) {
            val yields = this.descendants<SdsYield>().toList()
            yields.shouldHaveSize(7)

            val resultsInSameFunction = findUniqueDeclarationOrFail<SdsResult>("resultInSameStep")

            val referencedResult = yields[0].result
            referencedResult.shouldBeResolved()
            referencedResult.shouldBe(resultsInSameFunction)
        }

        @Test
        fun `should not resolve result in another step in same file`() = withResource(YIELD) {
            val yields = this.descendants<SdsYield>().toList()
            yields.shouldHaveSize(7)
            yields[1].result.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve result in another step in same package`() = withResource(YIELD) {
            val yields = this.descendants<SdsYield>().toList()
            yields.shouldHaveSize(7)
            yields[2].result.shouldNotBeResolved()
        }

        @Test
        fun `should not resolve result in another step that is imported and in another package`() =
            withResource(YIELD) {
                val yields = this.descendants<SdsYield>().toList()
                yields.shouldHaveSize(7)
                yields[3].result.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve result in another step that is not imported and in another package`() =
            withResource(YIELD) {
                val yields = this.descendants<SdsYield>().toList()
                yields.shouldHaveSize(7)
                yields[4].result.shouldNotBeResolved()
            }

        @Test
        fun `should not resolve unknown declaration`() = withResource(YIELD) {
            val yields = this.descendants<SdsYield>().toList()
            yields.shouldHaveSize(7)
            yields[5].result.shouldNotBeResolved()
        }

        @Test
        fun `should not something that is not a result`() = withResource(YIELD) {
            val yields = this.descendants<SdsYield>().toList()
            yields.shouldHaveSize(7)
            yields[6].result.shouldNotBeResolved()
        }
    }

    private fun withResource(
        resourceName: ResourceName,
        lambda: SdsCompilationUnit.() -> Unit
    ) {

        val compilationUnit =
            parseHelper.parseResource(
                "scoping/$resourceName/main.${SdsFileExtension.Test}",
                listOf(
                    "scoping/$resourceName/externalsInOtherPackage.${SdsFileExtension.Test}",
                    "scoping/$resourceName/externalsInSamePackage.${SdsFileExtension.Test}",
                )
            ) ?: throw IllegalArgumentException("File is not a compilation unit.")

        compilationUnit.apply(lambda)
    }
}
