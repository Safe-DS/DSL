package de.unibonn.simpleml.prologBridge

import de.unibonn.simpleml.SimpleMLStandaloneSetup
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.prologBridge.model.facts.AnnotationCallT
import de.unibonn.simpleml.prologBridge.model.facts.AnnotationT
import de.unibonn.simpleml.prologBridge.model.facts.ArgumentT
import de.unibonn.simpleml.prologBridge.model.facts.AssignmentT
import de.unibonn.simpleml.prologBridge.model.facts.AttributeT
import de.unibonn.simpleml.prologBridge.model.facts.BlockLambdaResultT
import de.unibonn.simpleml.prologBridge.model.facts.BlockLambdaT
import de.unibonn.simpleml.prologBridge.model.facts.BooleanT
import de.unibonn.simpleml.prologBridge.model.facts.CallT
import de.unibonn.simpleml.prologBridge.model.facts.CallableTypeT
import de.unibonn.simpleml.prologBridge.model.facts.ClassT
import de.unibonn.simpleml.prologBridge.model.facts.CompilationUnitT
import de.unibonn.simpleml.prologBridge.model.facts.DeclarationT
import de.unibonn.simpleml.prologBridge.model.facts.EnumT
import de.unibonn.simpleml.prologBridge.model.facts.EnumVariantT
import de.unibonn.simpleml.prologBridge.model.facts.ExpressionLambdaT
import de.unibonn.simpleml.prologBridge.model.facts.ExpressionStatementT
import de.unibonn.simpleml.prologBridge.model.facts.ExpressionT
import de.unibonn.simpleml.prologBridge.model.facts.FloatT
import de.unibonn.simpleml.prologBridge.model.facts.FunctionT
import de.unibonn.simpleml.prologBridge.model.facts.ImportT
import de.unibonn.simpleml.prologBridge.model.facts.IndexedAccessT
import de.unibonn.simpleml.prologBridge.model.facts.InfixOperationT
import de.unibonn.simpleml.prologBridge.model.facts.IntT
import de.unibonn.simpleml.prologBridge.model.facts.MemberAccessT
import de.unibonn.simpleml.prologBridge.model.facts.MemberTypeT
import de.unibonn.simpleml.prologBridge.model.facts.NamedTypeT
import de.unibonn.simpleml.prologBridge.model.facts.NodeWithParent
import de.unibonn.simpleml.prologBridge.model.facts.NullT
import de.unibonn.simpleml.prologBridge.model.facts.ParameterT
import de.unibonn.simpleml.prologBridge.model.facts.ParenthesizedExpressionT
import de.unibonn.simpleml.prologBridge.model.facts.ParenthesizedTypeT
import de.unibonn.simpleml.prologBridge.model.facts.PlFactbase
import de.unibonn.simpleml.prologBridge.model.facts.PlaceholderT
import de.unibonn.simpleml.prologBridge.model.facts.PrefixOperationT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolAlternativeT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolComplementT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolParenthesizedTermT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolQuantifiedTermT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolReferenceT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolSequenceT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolSubtermT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolTermT
import de.unibonn.simpleml.prologBridge.model.facts.ProtocolTokenClassT
import de.unibonn.simpleml.prologBridge.model.facts.ReferenceT
import de.unibonn.simpleml.prologBridge.model.facts.ResourceS
import de.unibonn.simpleml.prologBridge.model.facts.ResultT
import de.unibonn.simpleml.prologBridge.model.facts.SourceLocationS
import de.unibonn.simpleml.prologBridge.model.facts.StarProjectionT
import de.unibonn.simpleml.prologBridge.model.facts.StatementT
import de.unibonn.simpleml.prologBridge.model.facts.StepT
import de.unibonn.simpleml.prologBridge.model.facts.StringT
import de.unibonn.simpleml.prologBridge.model.facts.TemplateStringEndT
import de.unibonn.simpleml.prologBridge.model.facts.TemplateStringInnerT
import de.unibonn.simpleml.prologBridge.model.facts.TemplateStringStartT
import de.unibonn.simpleml.prologBridge.model.facts.TemplateStringT
import de.unibonn.simpleml.prologBridge.model.facts.TypeArgumentT
import de.unibonn.simpleml.prologBridge.model.facts.TypeParameterConstraintT
import de.unibonn.simpleml.prologBridge.model.facts.TypeParameterT
import de.unibonn.simpleml.prologBridge.model.facts.TypeProjectionT
import de.unibonn.simpleml.prologBridge.model.facts.TypeT
import de.unibonn.simpleml.prologBridge.model.facts.UnionTypeT
import de.unibonn.simpleml.prologBridge.model.facts.UnresolvedT
import de.unibonn.simpleml.prologBridge.model.facts.WildcardT
import de.unibonn.simpleml.prologBridge.model.facts.WorkflowT
import de.unibonn.simpleml.prologBridge.model.facts.YieldT
import de.unibonn.simpleml.testing.assertions.findUniqueFactOrFail
import de.unibonn.simpleml.testing.assertions.shouldBeChildExpressionOf
import de.unibonn.simpleml.testing.assertions.shouldBeChildOf
import de.unibonn.simpleml.testing.assertions.shouldBeChildProtocolTermOf
import de.unibonn.simpleml.testing.assertions.shouldBeCloseTo
import de.unibonn.simpleml.testing.assertions.shouldBeNChildExpressionsOf
import de.unibonn.simpleml.testing.assertions.shouldBeNChildProtocolTermsOf
import de.unibonn.simpleml.testing.assertions.shouldBeNChildrenOf
import de.unibonn.simpleml.testing.assertions.shouldHaveNAnnotationCalls
import de.unibonn.simpleml.testing.getResourcePath
import io.kotest.assertions.asClue
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldBeOneOf
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldEndWith
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/**
 * ## Testing procedure for a fact:
 * - Check its own primitive arguments
 * - Check size of lists of children
 * - Ensure IDs of children are correct
 */
class AstToPrologFactbaseTest {

    private val main = SimpleMLStandaloneSetup()
        .createInjectorAndDoEMFRegistration()
        .getInstance(Main::class.java)

    private val testRoot = javaClass.classLoader.getResourcePath("astToPrologFactbase").toString()

    // *****************************************************************************************************************
    // Declarations
    // ****************************************************************************************************************/

    @Nested
    inner class Declarations {

        @Nested
        inner class CompilationUnit {
            @Test
            fun `should handle empty compilation units`() = withFactbaseFromFile("empty") {
                val compilationUnitT = findUniqueFactOrFail<CompilationUnitT>()
                compilationUnitT.asClue {
                    it.members.shouldBeEmpty()
                }
            }

            @Test
            fun `should store package name`() = withFactbaseFromFile("declarations") {
                val compilationUnitT = findUniqueFactOrFail<CompilationUnitT>()
                compilationUnitT.asClue {
                    compilationUnitT.packageName shouldBe "tests.astToPrologFactbase.declarations"
                }
            }

            @Test
            fun `should reference imports`() = withFactbaseFromFile("declarations") {
                val compilationUnitT = findUniqueFactOrFail<CompilationUnitT>()
                shouldBeNChildrenOf<ImportT>(compilationUnitT.imports, compilationUnitT, 3)
            }

            @Test
            fun `should reference members`() = withFactbaseFromFile("declarations") {
                val compilationUnitT = findUniqueFactOrFail<CompilationUnitT>()
                shouldBeNChildrenOf<DeclarationT>(compilationUnitT.members, compilationUnitT, 12)
            }

            @Test
            fun `should store resource URI in separate relation`() = withFactbaseFromFile("empty") {
                val compilationUnitT = findUniqueFactOrFail<CompilationUnitT>()
                val resourceS = findUniqueFactOrFail<ResourceS>()
                resourceS.asClue {
                    resourceS.target shouldBe compilationUnitT.id
                    resourceS.uri shouldEndWith "astToPrologFactbase/empty.${SmlFileExtension.Test}"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("empty") {
                val compilationUnitT = findUniqueFactOrFail<CompilationUnitT>()
                findUniqueFactOrFail<SourceLocationS> { it.target == compilationUnitT.id }
            }
        }

        @Nested
        inner class Annotation {
            @Test
            fun `should handle simple annotations`() = withFactbaseFromFile("declarations") {
                val annotationT = findUniqueFactOrFail<AnnotationT> { it.name == "MySimpleAnnotation" }
                annotationT.asClue {
                    annotationT.parameters.shouldBeNull()
                    annotationT.constraints.shouldBeNull()
                }

                shouldHaveNAnnotationCalls(annotationT, 0)
            }

            @Test
            fun `should reference parameters`() = withFactbaseFromFile("declarations") {
                val annotationT = findUniqueFactOrFail<AnnotationT> { it.name == "MyComplexAnnotation" }
                shouldBeNChildrenOf<ParameterT>(annotationT.parameters, annotationT, 2)
            }

            @Test
            fun `should reference constraints`() = withFactbaseFromFile("declarations") {
                val annotationT = findUniqueFactOrFail<AnnotationT> { it.name == "MyComplexAnnotation" }
                shouldBeNChildrenOf<TypeParameterConstraintT>(annotationT.constraints, annotationT, 2)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val annotationT = findUniqueFactOrFail<AnnotationT> { it.name == "MyComplexAnnotation" }
                shouldHaveNAnnotationCalls(annotationT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val annotationT = findUniqueFactOrFail<AnnotationT> { it.name == "MySimpleAnnotation" }
                findUniqueFactOrFail<SourceLocationS> { it.target == annotationT.id }
            }
        }

        @Nested
        inner class Attribute {
            @Test
            fun `should handle simple attributes`() = withFactbaseFromFile("declarations") {
                val attributeT = findUniqueFactOrFail<AttributeT> { it.name == "mySimpleAttribute" }
                attributeT.asClue {
                    attributeT.isStatic shouldBe false
                    attributeT.type.shouldBeNull()
                }

                shouldHaveNAnnotationCalls(attributeT, 0)
            }

            @Test
            fun `should store isStatic`() = withFactbaseFromFile("declarations") {
                val attributeT = findUniqueFactOrFail<AttributeT> { it.name == "myComplexAttribute" }
                attributeT.asClue {
                    attributeT.isStatic shouldBe true
                }
            }

            @Test
            fun `should reference type`() = withFactbaseFromFile("declarations") {
                val attributeT = findUniqueFactOrFail<AttributeT> { it.name == "myComplexAttribute" }
                shouldBeChildOf<TypeT>(attributeT.type, attributeT)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val attributeT = findUniqueFactOrFail<AttributeT> { it.name == "myComplexAttribute" }
                shouldHaveNAnnotationCalls(attributeT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val attributeT = findUniqueFactOrFail<AttributeT> { it.name == "mySimpleAttribute" }
                findUniqueFactOrFail<SourceLocationS> { it.target == attributeT.id }
            }
        }

        @Nested
        inner class Class {
            @Test
            fun `should handle simple classes`() = withFactbaseFromFile("declarations") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MySimpleClass" }
                classT.asClue {
                    classT.typeParameters.shouldBeNull()
                    classT.parameters.shouldBeNull()
                    classT.parentTypes.shouldBeNull()
                    classT.constraints.shouldBeNull()
                    classT.members.shouldBeNull()
                }

                shouldHaveNAnnotationCalls(classT, 0)
            }

            @Test
            fun `should reference type parameters`() = withFactbaseFromFile("declarations") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyComplexClass" }
                shouldBeNChildrenOf<TypeParameterT>(classT.typeParameters, classT, 2)
            }

            @Test
            fun `should reference parameters`() = withFactbaseFromFile("declarations") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyComplexClass" }
                shouldBeNChildrenOf<ParameterT>(classT.parameters, classT, 2)
            }

            @Test
            fun `should reference parent types`() = withFactbaseFromFile("declarations") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyComplexClass" }
                shouldBeNChildrenOf<TypeT>(classT.parentTypes, classT, 2)
            }

            @Test
            fun `should reference constraints`() = withFactbaseFromFile("declarations") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyComplexClass" }
                shouldBeNChildrenOf<TypeParameterConstraintT>(classT.constraints, classT, 2)
            }

            @Test
            fun `should reference members`() = withFactbaseFromFile("declarations") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyComplexClass" }
                shouldBeNChildrenOf<DeclarationT>(classT.members, classT, 5)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyComplexClass" }
                shouldHaveNAnnotationCalls(classT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MySimpleClass" }
                findUniqueFactOrFail<SourceLocationS> { it.target == classT.id }
            }
        }

        @Nested
        inner class Enum {
            @Test
            fun `should handle simple enums`() = withFactbaseFromFile("declarations") {
                val enumT = findUniqueFactOrFail<EnumT> { it.name == "MySimpleEnum" }
                enumT.asClue {
                    enumT.variants.shouldBeNull()
                }

                shouldHaveNAnnotationCalls(enumT, 0)
            }

            @Test
            fun `should reference instances`() = withFactbaseFromFile("declarations") {
                val enumT = findUniqueFactOrFail<EnumT> { it.name == "MyComplexEnum" }
                shouldBeNChildrenOf<EnumVariantT>(enumT.variants, enumT, 2)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val enumT = findUniqueFactOrFail<EnumT> { it.name == "MyComplexEnum" }
                shouldHaveNAnnotationCalls(enumT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val enumT = findUniqueFactOrFail<EnumT> { it.name == "MySimpleEnum" }
                findUniqueFactOrFail<SourceLocationS> { it.target == enumT.id }
            }
        }

        @Nested
        inner class EnumInstance {
            @Test
            fun `should handle simple enum instances`() = withFactbaseFromFile("declarations") {
                val enumVariantT = findUniqueFactOrFail<EnumVariantT> { it.name == "MySimpleVariant" }
                shouldHaveNAnnotationCalls(enumVariantT, 0)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val enumVariantT = findUniqueFactOrFail<EnumVariantT> { it.name == "MyComplexVariant" }
                shouldHaveNAnnotationCalls(enumVariantT, 1)
            }

            @Test
            fun `should reference type parameters`() = withFactbaseFromFile("declarations") {
                val enumVariantT = findUniqueFactOrFail<EnumVariantT> { it.name == "MyComplexVariant" }
                shouldBeNChildrenOf<TypeParameterT>(enumVariantT.typeParameters, enumVariantT, 2)
            }

            @Test
            fun `should reference parameters`() = withFactbaseFromFile("declarations") {
                val enumVariantT = findUniqueFactOrFail<EnumVariantT> { it.name == "MyComplexVariant" }
                shouldBeNChildrenOf<ParameterT>(enumVariantT.parameters, enumVariantT, 2)
            }

            @Test
            fun `should reference constraints`() = withFactbaseFromFile("declarations") {
                val enumVariantT = findUniqueFactOrFail<EnumVariantT> { it.name == "MyComplexVariant" }
                shouldBeNChildrenOf<TypeParameterConstraintT>(enumVariantT.constraints, enumVariantT, 2)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val enumVariantT = findUniqueFactOrFail<EnumVariantT> { it.name == "MySimpleVariant" }
                findUniqueFactOrFail<SourceLocationS> { it.target == enumVariantT.id }
            }
        }

        @Nested
        inner class Function {
            @Test
            fun `should handle simple functions`() = withFactbaseFromFile("declarations") {
                val functionT = findUniqueFactOrFail<FunctionT> { it.name == "mySimpleFunction" }
                functionT.asClue {
                    functionT.isStatic shouldBe false
                    functionT.typeParameters.shouldBeNull()
                    functionT.parameters.shouldBeEmpty()
                    functionT.results.shouldBeNull()
                    functionT.constraints.shouldBeNull()
                }

                shouldHaveNAnnotationCalls(functionT, 0)
            }

            @Test
            fun `should store isStatic`() = withFactbaseFromFile("declarations") {
                val functionT = findUniqueFactOrFail<FunctionT> { it.name == "myStaticMethod" }
                functionT.asClue {
                    functionT.isStatic shouldBe true
                }
            }

            @Test
            fun `should reference type parameters`() = withFactbaseFromFile("declarations") {
                val functionT = findUniqueFactOrFail<FunctionT> { it.name == "myComplexFunction" }
                shouldBeNChildrenOf<TypeParameterT>(functionT.typeParameters, functionT, 2)
            }

            @Test
            fun `should reference parameters`() = withFactbaseFromFile("declarations") {
                val functionT = findUniqueFactOrFail<FunctionT> { it.name == "myComplexFunction" }
                shouldBeNChildrenOf<ParameterT>(functionT.parameters, functionT, 2)
            }

            @Test
            fun `should reference results`() = withFactbaseFromFile("declarations") {
                val functionT = findUniqueFactOrFail<FunctionT> { it.name == "myComplexFunction" }
                shouldBeNChildrenOf<ResultT>(functionT.results, functionT, 2)
            }

            @Test
            fun `should reference constraints`() = withFactbaseFromFile("declarations") {
                val functionT = findUniqueFactOrFail<FunctionT> { it.name == "myComplexFunction" }
                shouldBeNChildrenOf<TypeParameterConstraintT>(functionT.constraints, functionT, 2)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val functionT = findUniqueFactOrFail<FunctionT> { it.name == "myComplexFunction" }
                shouldHaveNAnnotationCalls(functionT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val functionT = findUniqueFactOrFail<FunctionT> { it.name == "mySimpleFunction" }
                findUniqueFactOrFail<SourceLocationS> { it.target == functionT.id }
            }
        }

        @Nested
        inner class Import {
            @Test
            fun `should handle normal imports`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.MyClass" }
                importT.asClue {
                    importT.alias.shouldBeNull()
                }
            }

            @Test
            fun `should handle imports with alias`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.MyOtherClass" }
                importT.asClue {
                    importT.alias shouldBe "Class"
                }
            }

            @Test
            fun `should handle imports with wildcard`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.*" }
                importT.asClue {
                    importT.alias.shouldBeNull()
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.MyClass" }
                findUniqueFactOrFail<SourceLocationS> { it.target == importT.id }
            }
        }

        @Nested
        inner class Parameter {
            @Test
            fun `should handle simple parameters`() = withFactbaseFromFile("declarations") {
                val parameterT = findUniqueFactOrFail<ParameterT> { it.name == "mySimpleParameter" }
                parameterT.asClue {
                    parameterT.isVariadic shouldBe false
                    parameterT.type.shouldBeNull()
                    parameterT.defaultValue.shouldBeNull()
                }

                shouldHaveNAnnotationCalls(parameterT, 0)
            }

            @Test
            fun `should store isVariadic`() = withFactbaseFromFile("declarations") {
                val parameterT = findUniqueFactOrFail<ParameterT> { it.name == "myComplexParameter" }
                parameterT.asClue {
                    parameterT.isVariadic shouldBe true
                }
            }

            @Test
            fun `should reference type`() = withFactbaseFromFile("declarations") {
                val parameterT = findUniqueFactOrFail<ParameterT> { it.name == "myComplexParameter" }
                shouldBeChildOf<TypeT>(parameterT.type, parameterT)
            }

            @Test
            fun `should reference default value`() = withFactbaseFromFile("declarations") {
                val parameterT = findUniqueFactOrFail<ParameterT> { it.name == "myComplexParameter" }
                shouldBeChildExpressionOf<ExpressionT>(parameterT.defaultValue, parameterT)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val parameterT = findUniqueFactOrFail<ParameterT> { it.name == "myComplexParameter" }
                shouldHaveNAnnotationCalls(parameterT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val parameterT = findUniqueFactOrFail<ParameterT> { it.name == "mySimpleParameter" }
                findUniqueFactOrFail<SourceLocationS> { it.target == parameterT.id }
            }
        }

        @Nested
        inner class Result {
            @Test
            fun `should handle simple parameters`() = withFactbaseFromFile("declarations") {
                val resultT = findUniqueFactOrFail<ResultT> { it.name == "mySimpleResult" }
                resultT.asClue {
                    resultT.type.shouldBeNull()
                }

                shouldHaveNAnnotationCalls(resultT, 0)
            }

            @Test
            fun `should reference type`() = withFactbaseFromFile("declarations") {
                val resultT = findUniqueFactOrFail<ResultT> { it.name == "myComplexResult" }
                shouldBeChildOf<TypeT>(resultT.type, resultT)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val resultT = findUniqueFactOrFail<ResultT> { it.name == "myComplexResult" }
                shouldHaveNAnnotationCalls(resultT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val resultT = findUniqueFactOrFail<ResultT> { it.name == "mySimpleResult" }
                findUniqueFactOrFail<SourceLocationS> { it.target == resultT.id }
            }
        }

        @Nested
        inner class TypeParameter {
            @Test
            fun `should handle simple parameters`() = withFactbaseFromFile("declarations") {
                val typeParameterT = findUniqueFactOrFail<TypeParameterT> { it.name == "MY_SIMPLE_TYPE_PARAMETER" }
                typeParameterT.asClue {
                    typeParameterT.variance.shouldBeNull()
                }

                shouldHaveNAnnotationCalls(typeParameterT, 0)
            }

            @Test
            fun `should store variance`() = withFactbaseFromFile("declarations") {
                val typeParameterT = findUniqueFactOrFail<TypeParameterT> { it.name == "MY_COMPLEX_TYPE_PARAMETER" }
                typeParameterT.asClue {
                    typeParameterT.variance shouldBe "out"
                }
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val typeParameterT = findUniqueFactOrFail<TypeParameterT> { it.name == "MY_COMPLEX_TYPE_PARAMETER" }
                shouldHaveNAnnotationCalls(typeParameterT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val typeParameterT = findUniqueFactOrFail<TypeParameterT> { it.name == "MY_SIMPLE_TYPE_PARAMETER" }
                findUniqueFactOrFail<SourceLocationS> { it.target == typeParameterT.id }
            }
        }

        @Nested
        inner class Steps {
            @Test
            fun `should handle simple steps`() = withFactbaseFromFile("declarations") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "mySimpleStep" }
                stepT.asClue {
                    stepT.visibility.shouldBeNull()
                    stepT.parameters.shouldBeEmpty()
                    stepT.results.shouldBeNull()
                    stepT.statements.shouldBeEmpty()
                }

                shouldHaveNAnnotationCalls(stepT, 0)
            }

            @Test
            fun `should store visibility`() = withFactbaseFromFile("declarations") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myComplexStep" }
                stepT.visibility shouldBe "private"
            }

            @Test
            fun `should reference parameters`() = withFactbaseFromFile("declarations") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myComplexStep" }
                shouldBeNChildrenOf<ParameterT>(stepT.parameters, stepT, 2)
            }

            @Test
            fun `should reference results`() = withFactbaseFromFile("declarations") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myComplexStep" }
                shouldBeNChildrenOf<ResultT>(stepT.results, stepT, 2)
            }

            @Test
            fun `should reference statements`() = withFactbaseFromFile("declarations") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myComplexStep" }
                shouldBeNChildrenOf<StatementT>(stepT.statements, stepT, 1)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myComplexStep" }
                shouldHaveNAnnotationCalls(stepT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "mySimpleStep" }
                findUniqueFactOrFail<SourceLocationS> { it.target == stepT.id }
            }
        }

        @Nested
        inner class Workflow {
            @Test
            fun `should handle simple workflows`() = withFactbaseFromFile("declarations") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "mySimpleWorkflow" }
                workflowT.asClue {
                    workflowT.statements.shouldBeEmpty()
                }

                shouldHaveNAnnotationCalls(workflowT, 0)
            }

            @Test
            fun `should reference statements`() = withFactbaseFromFile("declarations") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myComplexWorkflow" }
                shouldBeNChildrenOf<StatementT>(workflowT.statements, workflowT, 1)
            }

            @Test
            fun `should store annotation uses`() = withFactbaseFromFile("declarations") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myComplexWorkflow" }
                shouldHaveNAnnotationCalls(workflowT, 1)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("declarations") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "mySimpleWorkflow" }
                findUniqueFactOrFail<SourceLocationS> { it.target == workflowT.id }
            }
        }
    }

    // *****************************************************************************************************************
    // Statements
    // ****************************************************************************************************************/

    @Nested
    inner class Statements {

        @Nested
        inner class Assignment {
            @Test
            fun `should reference assignees`() = withFactbaseFromFile("statements") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myFunctionalStep" }
                val assignmentT = findUniqueFactOrFail<AssignmentT> { it.parent == stepT.id }
                shouldBeNChildrenOf<NodeWithParent>(assignmentT.assignees, assignmentT, 4)
            }

            @Test
            fun `should reference expression`() = withFactbaseFromFile("statements") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myFunctionalStep" }
                val assignmentT = findUniqueFactOrFail<AssignmentT> { it.parent == stepT.id }
                shouldBeChildExpressionOf<ExpressionT>(assignmentT.expression, assignmentT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("statements") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myFunctionalStep" }
                val assignmentT = findUniqueFactOrFail<AssignmentT> { it.parent == stepT.id }
                findUniqueFactOrFail<SourceLocationS> { it.target == assignmentT.id }
            }
        }

        @Nested
        inner class LambdaResult {
            @Test
            fun `should handle lambda results`() = withFactbaseFromFile("statements") {
                findUniqueFactOrFail<BlockLambdaResultT> { it.name == "mySimpleLambdaResult" }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("statements") {
                val blockLambdaResultT = findUniqueFactOrFail<BlockLambdaResultT> { it.name == "mySimpleLambdaResult" }
                findUniqueFactOrFail<SourceLocationS> { it.target == blockLambdaResultT.id }
            }
        }

        @Nested
        inner class Placeholder {
            @Test
            fun `should handle placeholders`() = withFactbaseFromFile("statements") {
                findUniqueFactOrFail<PlaceholderT> { it.name == "mySimplePlaceholder" }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("statements") {
                val placeholderT = findUniqueFactOrFail<PlaceholderT> { it.name == "mySimplePlaceholder" }
                findUniqueFactOrFail<SourceLocationS> { it.target == placeholderT.id }
            }
        }

        @Nested
        inner class Wildcard {
            @Test
            fun `should handle wildcards`() = withFactbaseFromFile("statements") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myFunctionalStep" }
                val assignmentT = findUniqueFactOrFail<AssignmentT> { it.parent == stepT.id }
                findUniqueFactOrFail<WildcardT> { it.parent == assignmentT.id }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("statements") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myFunctionalStep" }
                val assignmentT = findUniqueFactOrFail<AssignmentT> { it.parent == stepT.id }
                val wildcardT = findUniqueFactOrFail<WildcardT> { it.parent == assignmentT.id }
                findUniqueFactOrFail<SourceLocationS> { it.target == wildcardT.id }
            }
        }

        @Nested
        inner class Yield {
            @Test
            fun `should reference result if possible`() = withFactbaseFromFile("statements") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myFunctionalStep" }
                val assignmentT = findUniqueFactOrFail<AssignmentT> { it.parent == stepT.id }
                val yieldT = findUniqueFactOrFail<YieldT> { it.parent == assignmentT.id }
                val resultT = findUniqueFactOrFail<ResultT> { it.id == yieldT.result }
                resultT.asClue {
                    resultT.parent shouldBe stepT.id
                    resultT.name shouldBe "a"
                }
            }

            @Test
            fun `should store name for unresolvable results`() = withFactbaseFromFile("statements") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myStepWithUnresolvedYield" }
                val assignmentT = findUniqueFactOrFail<AssignmentT> { it.parent == stepT.id }
                val yieldT = findUniqueFactOrFail<YieldT> { it.parent == assignmentT.id }
                val unresolvedT = findUniqueFactOrFail<UnresolvedT> { it.id == yieldT.result }
                unresolvedT.asClue {
                    unresolvedT.name shouldBe "myUnresolvedResult"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("statements") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myFunctionalStep" }
                val assignmentT = findUniqueFactOrFail<AssignmentT> { it.parent == stepT.id }
                val yieldT = findUniqueFactOrFail<YieldT> { it.parent == assignmentT.id }
                findUniqueFactOrFail<SourceLocationS> { it.target == yieldT.id }
            }
        }

        @Nested
        inner class ExpressionStatement {
            @Test
            fun `should reference expression`() = withFactbaseFromFile("statements") {
                val expressionStatementT = findUniqueFactOrFail<ExpressionStatementT>()
                shouldBeChildExpressionOf<ExpressionT>(expressionStatementT.expression, expressionStatementT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("statements") {
                val expressionStatementT = findUniqueFactOrFail<ExpressionStatementT>()
                findUniqueFactOrFail<SourceLocationS> { it.target == expressionStatementT.id }
            }
        }
    }

    // *****************************************************************************************************************
    // Expressions
    // ****************************************************************************************************************/

    @Nested
    inner class Expressions {

        @Nested
        inner class Argument {
            @Test
            fun `should handle positional arguments`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithPositionalArgument" }
                val argumentT = findUniqueFactOrFail<ArgumentT> { isContainedIn(it, workflowT) }
                argumentT.asClue {
                    argumentT.parameter.shouldBeNull()
                }
            }

            @Test
            fun `should reference parameter if possible`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithResolvableNamedArgument" }
                val argumentT = findUniqueFactOrFail<ArgumentT> { isContainedIn(it, workflowT) }
                val parameterT = findUniqueFactOrFail<ParameterT> { it.id == argumentT.parameter }
                parameterT.asClue {
                    parameterT.name shouldBe "a"
                }
            }

            @Test
            fun `should reference value`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithResolvableNamedArgument" }
                val argumentT = findUniqueFactOrFail<ArgumentT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ExpressionT>(argumentT.value, argumentT)
            }

            @Test
            fun `should store name for unresolvable arguments`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithUnresolvedArgument" }
                val argumentT = findUniqueFactOrFail<ArgumentT> { isContainedIn(it, workflowT) }
                val unresolvedT = findUniqueFactOrFail<UnresolvedT> { it.id == argumentT.parameter }
                unresolvedT.asClue {
                    unresolvedT.name shouldBe "myUnresolvedParameter"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithPositionalArgument" }
                val argumentT = findUniqueFactOrFail<ArgumentT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == argumentT.id }
            }
        }

        @Nested
        inner class Boolean {
            @Test
            fun `should store value`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val booleanT = findUniqueFactOrFail<BooleanT> { isContainedIn(it, workflowT) }
                booleanT.asClue {
                    booleanT.value shouldBe true
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val booleanT = findUniqueFactOrFail<BooleanT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == booleanT.id }
            }
        }

        @Nested
        inner class BlockLambda {
            @Test
            fun `should handle simple block lambdas`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithSimpleBlockLambda" }
                val blockLambdaT = findUniqueFactOrFail<BlockLambdaT> { isContainedIn(it, workflowT) }
                blockLambdaT.asClue {
                    blockLambdaT.parameters.shouldBeEmpty()
                    blockLambdaT.statements.shouldBeEmpty()
                }
            }

            @Test
            fun `should reference parameters`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexBlockLambda" }
                val blockLambdaT = findUniqueFactOrFail<BlockLambdaT> { isContainedIn(it, workflowT) }
                shouldBeNChildrenOf<ParameterT>(blockLambdaT.parameters, blockLambdaT, 2)
            }

            @Test
            fun `should reference statements`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexBlockLambda" }
                val blockLambdaT = findUniqueFactOrFail<BlockLambdaT> { isContainedIn(it, workflowT) }
                shouldBeNChildrenOf<StatementT>(blockLambdaT.statements, blockLambdaT, 2)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithSimpleBlockLambda" }
                val blockLambdaT = findUniqueFactOrFail<BlockLambdaT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == blockLambdaT.id }
            }
        }

        @Nested
        inner class Call {
            @Test
            fun `should handle simple calls`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithSimpleCall" }
                val callT = findUniqueFactOrFail<CallT> { isContainedIn(it, workflowT) }
                callT.asClue {
                    callT.typeArguments.shouldBeNull()
                    callT.arguments.shouldBeEmpty()
                }
            }

            @Test
            fun `should reference receiver`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexCall" }
                val callT = findUniqueFactOrFail<CallT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ExpressionT>(callT.receiver, callT)
            }

            @Test
            fun `should reference type arguments`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexCall" }
                val callT = findUniqueFactOrFail<CallT> { isContainedIn(it, workflowT) }
                shouldBeNChildrenOf<TypeArgumentT>(callT.typeArguments, callT, 2)
            }

            @Test
            fun `should reference arguments`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexCall" }
                val callT = findUniqueFactOrFail<CallT> { isContainedIn(it, workflowT) }
                shouldBeNChildExpressionsOf<ExpressionT>(callT.arguments, callT, 2)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithSimpleCall" }
                val callT = findUniqueFactOrFail<CallT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == callT.id }
            }
        }

        @Nested
        inner class ExpressionLambda {
            @Test
            fun `should handle simple expression lambdas`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithSimpleExpressionLambda" }
                val expressionLambdaT = findUniqueFactOrFail<ExpressionLambdaT> { isContainedIn(it, workflowT) }
                expressionLambdaT.asClue {
                    expressionLambdaT.parameters.shouldBeEmpty()
                }
            }

            @Test
            fun `should reference parameters`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexExpressionLambda" }
                val expressionLambdaT = findUniqueFactOrFail<ExpressionLambdaT> { isContainedIn(it, workflowT) }
                shouldBeNChildrenOf<ParameterT>(expressionLambdaT.parameters, expressionLambdaT, 2)
            }

            @Test
            fun `should reference result`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexExpressionLambda" }
                val expressionLambdaT = findUniqueFactOrFail<ExpressionLambdaT> { isContainedIn(it, workflowT) }
                shouldBeChildOf<ExpressionT>(expressionLambdaT.result, expressionLambdaT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithSimpleExpressionLambda" }
                val expressionLambdaT = findUniqueFactOrFail<ExpressionLambdaT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == expressionLambdaT.id }
            }
        }

        @Nested
        inner class Float {
            @Test
            fun `should store value`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val floatT = findUniqueFactOrFail<FloatT> { isContainedIn(it, workflowT) }
                floatT.asClue {
                    floatT.value.shouldBeCloseTo(1.0)
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val floatT = findUniqueFactOrFail<FloatT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == floatT.id }
            }
        }

        @Nested
        inner class IndexedAccess {
            @Test
            fun `should reference receiver`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithIndexedAccess" }
                val indexedAccessT = findUniqueFactOrFail<IndexedAccessT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ExpressionT>(indexedAccessT.receiver, indexedAccessT)
            }

            @Test
            fun `should reference index`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithIndexedAccess" }
                val indexedAccessT = findUniqueFactOrFail<IndexedAccessT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<IntT>(indexedAccessT.index, indexedAccessT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithIndexedAccess" }
                val indexedAccessT = findUniqueFactOrFail<IndexedAccessT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == indexedAccessT.id }
            }
        }

        @Nested
        inner class InfixOperation {
            @Test
            fun `should reference left operand`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithOperations" }
                val infixOperationT = findUniqueFactOrFail<InfixOperationT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ExpressionT>(infixOperationT.leftOperand, infixOperationT)
            }

            @Test
            fun `should store operator`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithOperations" }
                val infixOperationT = findUniqueFactOrFail<InfixOperationT> { isContainedIn(it, workflowT) }
                infixOperationT.asClue {
                    infixOperationT.operator shouldBe "+"
                }
            }

            @Test
            fun `should reference right operand`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithOperations" }
                val infixOperationT = findUniqueFactOrFail<InfixOperationT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ExpressionT>(infixOperationT.rightOperand, infixOperationT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithOperations" }
                val infixOperationT = findUniqueFactOrFail<InfixOperationT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == infixOperationT.id }
            }
        }

        @Nested
        inner class Int {
            @Test
            fun `should store value`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val intT = findUniqueFactOrFail<IntT> { isContainedIn(it, workflowT) }
                intT.asClue {
                    intT.value shouldBe 42
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val intT = findUniqueFactOrFail<IntT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == intT.id }
            }
        }

        @Nested
        inner class MemberAccess {
            @Test
            fun `should reference receiver`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithMemberAccess" }
                val memberAccessT = findUniqueFactOrFail<MemberAccessT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ExpressionT>(memberAccessT.receiver, memberAccessT)
            }

            @Test
            fun `should store null safety`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithMemberAccess" }
                val memberAccessT = findUniqueFactOrFail<MemberAccessT> { isContainedIn(it, workflowT) }
                memberAccessT.asClue {
                    memberAccessT.isNullSafe shouldBe true
                }
            }

            @Test
            fun `should reference member`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithMemberAccess" }
                val memberAccessT = findUniqueFactOrFail<MemberAccessT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ReferenceT>(memberAccessT.member, memberAccessT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithMemberAccess" }
                val memberAccessT = findUniqueFactOrFail<MemberAccessT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == memberAccessT.id }
            }
        }

        @Nested
        inner class Null {
            @Test
            fun `should handle nulls`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                findUniqueFactOrFail<NullT> { isContainedIn(it, workflowT) }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val nullT = findUniqueFactOrFail<NullT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == nullT.id }
            }
        }

        @Nested
        inner class ParenthesizedExpression {
            @Test
            fun `should reference expression`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithParenthesizedExpression" }
                val parenthesizedExpressionT =
                    findUniqueFactOrFail<ParenthesizedExpressionT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ExpressionT>(parenthesizedExpressionT.expression, parenthesizedExpressionT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithParenthesizedExpression" }
                val parenthesizedExpressionT =
                    findUniqueFactOrFail<ParenthesizedExpressionT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == parenthesizedExpressionT.id }
            }
        }

        @Nested
        inner class PrefixOperation {
            @Test
            fun `should store operator`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithOperations" }
                val prefixOperationT = findUniqueFactOrFail<PrefixOperationT> { isContainedIn(it, workflowT) }
                prefixOperationT.asClue {
                    prefixOperationT.operator shouldBe "-"
                }
            }

            @Test
            fun `should reference operand`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithOperations" }
                val prefixOperationT = findUniqueFactOrFail<PrefixOperationT> { isContainedIn(it, workflowT) }
                shouldBeChildExpressionOf<ExpressionT>(prefixOperationT.operand, prefixOperationT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithOperations" }
                val prefixOperationT = findUniqueFactOrFail<PrefixOperationT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == prefixOperationT.id }
            }
        }

        @Nested
        inner class Reference {
            @Test
            fun `should reference declaration if possible`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithResolvableReference" }
                val referenceT = findUniqueFactOrFail<ReferenceT> { isContainedIn(it, workflowT) }
                val placeholderT = findUniqueFactOrFail<PlaceholderT> { it.id == referenceT.declaration }
                placeholderT.asClue {
                    placeholderT.name shouldBe "a"
                }
            }

            @Test
            fun `should store name for unresolvable references`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithUnresolvableReference" }
                val referenceT = findUniqueFactOrFail<ReferenceT> { isContainedIn(it, workflowT) }
                val unresolvedT = findUniqueFactOrFail<UnresolvedT> { it.id == referenceT.declaration }
                unresolvedT.asClue {
                    unresolvedT.name shouldBe "myUnresolvedDeclaration"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithResolvableReference" }
                val referenceT = findUniqueFactOrFail<ReferenceT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == referenceT.id }
            }
        }

        @Nested
        inner class String {
            @Test
            fun `should store value`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val stringT = findUniqueFactOrFail<StringT> { isContainedIn(it, workflowT) }
                stringT.asClue {
                    stringT.value shouldBe "bla"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithLiterals" }
                val stringT = findUniqueFactOrFail<StringT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == stringT.id }
            }
        }

        @Nested
        inner class TemplateString {
            @Test
            fun `should store expressions`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithTemplateString" }
                val templateStringT = findUniqueFactOrFail<TemplateStringT> { isContainedIn(it, workflowT) }
                shouldBeNChildExpressionsOf<ExpressionT>(templateStringT.expressions, templateStringT, 5)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithTemplateString" }
                val templateStringT = findUniqueFactOrFail<TemplateStringT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == templateStringT.id }
            }
        }

        @Nested
        inner class TemplateStringStart {
            @Test
            fun `should store value`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithTemplateString" }
                val templateStringStartT = findUniqueFactOrFail<TemplateStringStartT> { isContainedIn(it, workflowT) }
                templateStringStartT.asClue {
                    templateStringStartT.value shouldBe "start "
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithTemplateString" }
                val templateStringStartT = findUniqueFactOrFail<TemplateStringStartT> { isContainedIn(it, workflowT) }
                templateStringStartT.asClue {
                    findUniqueFactOrFail<SourceLocationS> { it.target == templateStringStartT.id }
                }
            }
        }

        @Nested
        inner class TemplateStringInner {
            @Test
            fun `should store value`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithTemplateString" }
                val templateStringInnerT = findUniqueFactOrFail<TemplateStringInnerT> { isContainedIn(it, workflowT) }
                templateStringInnerT.asClue {
                    templateStringInnerT.value shouldBe " inner "
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithTemplateString" }
                val templateStringInnerT = findUniqueFactOrFail<TemplateStringInnerT> { isContainedIn(it, workflowT) }
                templateStringInnerT.asClue {
                    findUniqueFactOrFail<SourceLocationS> { it.target == templateStringInnerT.id }
                }
            }
        }

        @Nested
        inner class TemplateStringEnd {
            @Test
            fun `should store value`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithTemplateString" }
                val templateStringEndT = findUniqueFactOrFail<TemplateStringEndT> { isContainedIn(it, workflowT) }
                templateStringEndT.asClue {
                    templateStringEndT.value shouldBe " end"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("expressions") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithTemplateString" }
                val templateStringEndT = findUniqueFactOrFail<TemplateStringEndT> { isContainedIn(it, workflowT) }
                templateStringEndT.asClue {
                    findUniqueFactOrFail<SourceLocationS> { it.target == templateStringEndT.id }
                }
            }
        }
    }

    // *****************************************************************************************************************
    // Protocols
    // ****************************************************************************************************************/

    @Nested
    inner class Protocols {

        @Nested
        inner class Protocols {
            @Test
            fun `should handle simple protocols`() = withFactbaseFromFile("protocols") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithSimpleProtocol" }
                val protocolT = findUniqueFactOrFail<ProtocolT> { it.parent == classT.id }
                protocolT.asClue {
                    protocolT.subterms.shouldBeNull()
                    protocolT.term.shouldBeNull()
                }
            }

            @Test
            fun `should reference subterms`() = withFactbaseFromFile("protocols") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithComplexProtocol" }
                val protocolT = findUniqueFactOrFail<ProtocolT> { it.parent == classT.id }
                shouldBeNChildrenOf<ProtocolSubtermT>(protocolT.subterms, protocolT, 9)
            }

            @Test
            fun `should reference term`() = withFactbaseFromFile("protocols") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithComplexProtocol" }
                val protocolT = findUniqueFactOrFail<ProtocolT> { it.parent == classT.id }
                shouldBeChildProtocolTermOf<ProtocolTermT>(protocolT.term, protocolT)
            }

            @Test
            fun `should store source location in separate relation`() =
                withFactbaseFromFile("protocols") {
                    val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithSimpleProtocol" }
                    val protocolT = findUniqueFactOrFail<ProtocolT> { it.parent == classT.id }
                    findUniqueFactOrFail<SourceLocationS> { it.target == protocolT.id }
                }
        }

        @Nested
        inner class ProtocolAlternatives {
            @Test
            fun `should reference term`() = withFactbaseFromFile("protocols") {
                val alternativeT = findUniqueFactOrFail<ProtocolAlternativeT>()
                shouldBeNChildProtocolTermsOf<ProtocolTermT>(alternativeT.terms, alternativeT, 2)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("protocols") {
                val alternativeT = findUniqueFactOrFail<ProtocolAlternativeT>()
                findUniqueFactOrFail<SourceLocationS> { it.target == alternativeT.id }
            }
        }

        @Nested
        inner class ProtocolComplements {
            @Test
            fun `should handle simple complements`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "simpleComplement" }
                val complementT = findUniqueFactOrFail<ProtocolComplementT> { isContainedIn(it, subtermT) }
                complementT.asClue {
                    complementT.universe.shouldBeNull()
                    complementT.references.shouldBeNull()
                }
            }

            @Test
            fun `should reference universe`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "complexComplement" }
                val complementT = findUniqueFactOrFail<ProtocolComplementT> { isContainedIn(it, subtermT) }
                shouldBeChildProtocolTermOf<ProtocolTokenClassT>(complementT.universe, complementT)
            }

            @Test
            fun `should reference references`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "complexComplement" }
                val complementT = findUniqueFactOrFail<ProtocolComplementT> { isContainedIn(it, subtermT) }
                shouldBeNChildProtocolTermsOf<ProtocolReferenceT>(complementT.references, complementT, 2)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "simpleComplement" }
                val complementT = findUniqueFactOrFail<ProtocolComplementT> { isContainedIn(it, subtermT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == complementT.id }
            }
        }

        @Nested
        inner class ProtocolParenthesizedTerms {
            @Test
            fun `should reference term`() = withFactbaseFromFile("protocols") {
                val parenthesizedTermT = findUniqueFactOrFail<ProtocolParenthesizedTermT>()
                shouldBeChildProtocolTermOf<ProtocolTermT>(parenthesizedTermT.term, parenthesizedTermT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("protocols") {
                val parenthesizedTermT = findUniqueFactOrFail<ProtocolParenthesizedTermT>()
                findUniqueFactOrFail<SourceLocationS> { it.target == parenthesizedTermT.id }
            }
        }

        @Nested
        inner class ProtocolQuantifiedTerms {
            @Test
            fun `should reference term`() = withFactbaseFromFile("protocols") {
                val quantifiedTermT = findUniqueFactOrFail<ProtocolQuantifiedTermT>()
                shouldBeChildProtocolTermOf<ProtocolTermT>(quantifiedTermT.term, quantifiedTermT)
            }

            @Test
            fun `should store quantified`() = withFactbaseFromFile("protocols") {
                val quantifiedTermT = findUniqueFactOrFail<ProtocolQuantifiedTermT>()
                quantifiedTermT.asClue {
                    quantifiedTermT.quantifier shouldBe "?"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("protocols") {
                val quantifiedTermT = findUniqueFactOrFail<ProtocolQuantifiedTermT>()
                findUniqueFactOrFail<SourceLocationS> { it.target == quantifiedTermT.id }
            }
        }

        @Nested
        inner class ProtocolReferences {
            @Test
            fun `should reference declaration if possible`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "reference" }
                val referenceT = findUniqueFactOrFail<ProtocolReferenceT> { isContainedIn(it, subtermT) }
                val attributeT = findUniqueFactOrFail<AttributeT> { it.id == referenceT.token }
                attributeT.asClue {
                    attributeT.name shouldBe "member"
                }
            }

            @Test
            fun `should store name for unresolvable references`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "unresolvedReference" }
                val referenceT = findUniqueFactOrFail<ProtocolReferenceT> { isContainedIn(it, subtermT) }
                val unresolvedT = findUniqueFactOrFail<UnresolvedT> { it.id == referenceT.token }
                unresolvedT.asClue {
                    unresolvedT.name shouldBe "unresolved"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "reference" }
                val referenceT = findUniqueFactOrFail<ProtocolReferenceT> { isContainedIn(it, subtermT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == referenceT.id }
            }
        }

        @Nested
        inner class ProtocolSequences {
            @Test
            fun `should reference terms`() = withFactbaseFromFile("protocols") {
                val sequenceT = findUniqueFactOrFail<ProtocolSequenceT>()
                shouldBeNChildProtocolTermsOf<ProtocolTermT>(sequenceT.terms, sequenceT, 2)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("protocols") {
                val sequenceT = findUniqueFactOrFail<ProtocolSequenceT>()
                findUniqueFactOrFail<SourceLocationS> { it.target == sequenceT.id }
            }
        }

        @Nested
        inner class ProtocolSubterms {
            @Test
            fun `should store name`() = withFactbaseFromFile("protocols") {
                findUniqueFactOrFail<ProtocolSubtermT> { it.name == "alternative" }
            }

            @Test
            fun `should reference term`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "alternative" }
                shouldBeChildProtocolTermOf<ProtocolTermT>(subtermT.term, subtermT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "alternative" }
                findUniqueFactOrFail<SourceLocationS> { it.target == subtermT.id }
            }
        }

        @Nested
        inner class ProtocolTokenClasses {
            @Test
            fun `should store value`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "tokenClass" }
                val tokenClassT = findUniqueFactOrFail<ProtocolTokenClassT> { isContainedIn(it, subtermT) }
                tokenClassT.asClue {
                    it.value shouldBe "\\a"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("protocols") {
                val subtermT = findUniqueFactOrFail<ProtocolSubtermT> { it.name == "tokenClass" }
                val tokenClassT = findUniqueFactOrFail<ProtocolTokenClassT> { isContainedIn(it, subtermT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == tokenClassT.id }
            }
        }
    }

    // *****************************************************************************************************************
    // Types
    // ****************************************************************************************************************/

    @Nested
    inner class Types {

        @Nested
        inner class CallableType {
            @Test
            fun `should handle simple callable types`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithSimpleCallableType" }
                val callableTypeT = findUniqueFactOrFail<CallableTypeT> { isContainedIn(it, stepT) }
                callableTypeT.asClue {
                    callableTypeT.parameters.shouldBeEmpty()
                    callableTypeT.results.shouldBeEmpty()
                }
            }

            @Test
            fun `should reference parameters`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithComplexCallableType" }
                val callableTypeT = findUniqueFactOrFail<CallableTypeT> { isContainedIn(it, stepT) }
                shouldBeNChildrenOf<ParameterT>(callableTypeT.parameters, callableTypeT, 2)
            }

            @Test
            fun `should reference results`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithComplexCallableType" }
                val callableTypeT = findUniqueFactOrFail<CallableTypeT> { isContainedIn(it, stepT) }
                shouldBeNChildrenOf<ResultT>(callableTypeT.results, callableTypeT, 2)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithSimpleCallableType" }
                val callableTypeT = findUniqueFactOrFail<CallableTypeT> { isContainedIn(it, stepT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == callableTypeT.id }
            }
        }

        @Nested
        inner class MemberType {
            @Test
            fun `should reference receiver`() = withFactbaseFromFile("types") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithMemberType" }
                val memberTypeT = findUniqueFactOrFail<MemberTypeT> { isContainedIn(it, stepT) }
                shouldBeChildOf<TypeT>(memberTypeT.receiver, memberTypeT)
            }

            @Test
            fun `should reference member`() = withFactbaseFromFile("types") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithMemberType" }
                val memberTypeT = findUniqueFactOrFail<MemberTypeT> { isContainedIn(it, stepT) }
                shouldBeChildOf<NamedTypeT>(memberTypeT.member, memberTypeT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val stepT = findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithMemberType" }
                val memberTypeT = findUniqueFactOrFail<MemberTypeT> { isContainedIn(it, stepT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == memberTypeT.id }
            }
        }

        @Nested
        inner class NamedType {
            @Test
            fun `should handle simple named types`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithSimpleResolvableNamedType" }
                val namedTypeT = findUniqueFactOrFail<NamedTypeT> { isContainedIn(it, stepT) }
                namedTypeT.asClue {
                    namedTypeT.typeArguments.shouldBeNull()
                    namedTypeT.isNullable shouldBe false
                }
            }

            @Test
            fun `should reference declaration if possible`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithComplexResolvableNamedType" }
                val namedTypeT = findUniqueFactOrFail<NamedTypeT> { isContainedIn(it, stepT) }
                val declarationT = findUniqueFactOrFail<DeclarationT> { it.id == namedTypeT.declaration }
                declarationT.asClue {
                    declarationT.name shouldBe "C"
                }
            }

            @Test
            fun `should reference type arguments`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithComplexResolvableNamedType" }
                val namedTypeT = findUniqueFactOrFail<NamedTypeT> { isContainedIn(it, stepT) }
                shouldBeNChildrenOf<TypeArgumentT>(namedTypeT.typeArguments, namedTypeT, 1)
            }

            @Test
            fun `should store nullability`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithComplexResolvableNamedType" }
                val namedTypeT = findUniqueFactOrFail<NamedTypeT> { isContainedIn(it, stepT) }
                namedTypeT.asClue {
                    namedTypeT.isNullable shouldBe true
                }
            }

            @Test
            fun `should store name for unresolvable named types`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowWithUnresolvableNamedType" }
                val namedTypeT = findUniqueFactOrFail<NamedTypeT> { isContainedIn(it, stepT) }
                val unresolvedT = findUniqueFactOrFail<UnresolvedT> { it.id == namedTypeT.declaration }
                unresolvedT.asClue {
                    unresolvedT.name shouldBe "MyUnresolvedDeclaration"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithSimpleResolvableNamedType" }
                val namedTypeT = findUniqueFactOrFail<NamedTypeT> { isContainedIn(it, stepT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == namedTypeT.id }
            }
        }

        @Nested
        inner class ParenthesizedType {
            @Test
            fun `should reference type`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithParenthesizedType" }
                val parenthesizedTypeT = findUniqueFactOrFail<ParenthesizedTypeT> { isContainedIn(it, stepT) }
                shouldBeChildOf<TypeT>(parenthesizedTypeT.type, parenthesizedTypeT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithParenthesizedType" }
                val parenthesizedTypeT = findUniqueFactOrFail<ParenthesizedTypeT> { isContainedIn(it, stepT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == parenthesizedTypeT.id }
            }
        }

        @Nested
        inner class StarProjection {
            @Test
            fun `should handle star projections`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithStarProjection" }
                findUniqueFactOrFail<StarProjectionT> { isContainedIn(it, workflowT) }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithStarProjection" }
                val starProjectionT = findUniqueFactOrFail<StarProjectionT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == starProjectionT.id }
            }
        }

        @Nested
        inner class TypeArgument {
            @Test
            fun `should handle positional type arguments`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithPositionalTypeArgument" }
                val typeArgumentT = findUniqueFactOrFail<TypeArgumentT> { isContainedIn(it, workflowT) }
                typeArgumentT.asClue {
                    typeArgumentT.typeParameter.shouldBeNull()
                }
            }

            @Test
            fun `should reference type parameter if possible`() = withFactbaseFromFile("types") {
                val workflowT =
                    findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithResolvableNamedTypeArgument" }
                val typeArgumentT = findUniqueFactOrFail<TypeArgumentT> { isContainedIn(it, workflowT) }
                val typeParameterT = findUniqueFactOrFail<TypeParameterT> { it.id == typeArgumentT.typeParameter }
                typeParameterT.asClue {
                    typeParameterT.name shouldBe "T"
                }
            }

            @Test
            fun `should reference value`() = withFactbaseFromFile("types") {
                val workflowT =
                    findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithResolvableNamedTypeArgument" }
                val typeArgumentT = findUniqueFactOrFail<TypeArgumentT> { isContainedIn(it, workflowT) }
                shouldBeChildOf<NodeWithParent>(typeArgumentT.value, typeArgumentT)
            }

            @Test
            fun `should store name for unresolvable type arguments`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithUnresolvedTypeArgument" }
                val typeArgumentT = findUniqueFactOrFail<TypeArgumentT> { isContainedIn(it, workflowT) }
                val unresolvedT = findUniqueFactOrFail<UnresolvedT> { it.id == typeArgumentT.typeParameter }
                unresolvedT.asClue {
                    unresolvedT.name shouldBe "MY_UNRESOLVED_TYPE_PARAMETER"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithPositionalTypeArgument" }
                val typeArgumentT = findUniqueFactOrFail<TypeArgumentT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == typeArgumentT.id }
            }
        }

        @Nested
        inner class TypeParameterConstraint {
            @Test
            fun `should reference left operand if possible`() = withFactbaseFromFile("types") {
                val functionT =
                    findUniqueFactOrFail<FunctionT> { it.name == "myFunctionWithResolvableTypeParameterConstraint" }
                val typeParameterConstraintT =
                    findUniqueFactOrFail<TypeParameterConstraintT> { isContainedIn(it, functionT) }
                val typeParameterT =
                    findUniqueFactOrFail<TypeParameterT> { it.id == typeParameterConstraintT.leftOperand }
                typeParameterT.asClue {
                    typeParameterT.name shouldBe "T"
                }
            }

            @Test
            fun `should store operator`() = withFactbaseFromFile("types") {
                val functionT =
                    findUniqueFactOrFail<FunctionT> { it.name == "myFunctionWithResolvableTypeParameterConstraint" }
                val typeParameterConstraintT =
                    findUniqueFactOrFail<TypeParameterConstraintT> { isContainedIn(it, functionT) }
                typeParameterConstraintT.asClue {
                    typeParameterConstraintT.operator shouldBe "sub"
                }
            }

            @Test
            fun `should reference right operand`() = withFactbaseFromFile("types") {
                val functionT =
                    findUniqueFactOrFail<FunctionT> { it.name == "myFunctionWithResolvableTypeParameterConstraint" }
                val typeParameterConstraintT =
                    findUniqueFactOrFail<TypeParameterConstraintT> { isContainedIn(it, functionT) }
                shouldBeChildOf<TypeT>(typeParameterConstraintT.rightOperand, typeParameterConstraintT)
            }

            @Test
            fun `should store name for unresolvable type parameters`() = withFactbaseFromFile("types") {
                val functionT =
                    findUniqueFactOrFail<FunctionT> { it.name == "myFunctionWithUnresolvableTypeParameterConstraint" }
                val typeParameterConstraintT =
                    findUniqueFactOrFail<TypeParameterConstraintT> { isContainedIn(it, functionT) }
                val unresolvedT = findUniqueFactOrFail<UnresolvedT> { it.id == typeParameterConstraintT.leftOperand }
                unresolvedT.asClue {
                    unresolvedT.name shouldBe "MY_UNRESOLVED_TYPE_PARAMETER"
                }
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val functionT =
                    findUniqueFactOrFail<FunctionT> { it.name == "myFunctionWithResolvableTypeParameterConstraint" }
                val typeParameterConstraintT =
                    findUniqueFactOrFail<TypeParameterConstraintT> { isContainedIn(it, functionT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == typeParameterConstraintT.id }
            }
        }

        @Nested
        inner class TypeProjection {
            @Test
            fun `should handle simple type projections`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithSimpleTypeProjection" }
                val typeProjectionT = findUniqueFactOrFail<TypeProjectionT> { isContainedIn(it, workflowT) }
                typeProjectionT.asClue {
                    typeProjectionT.variance.shouldBeNull()
                }
            }

            @Test
            fun `should store variance`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexTypeProjection" }
                val typeProjectionT = findUniqueFactOrFail<TypeProjectionT> { isContainedIn(it, workflowT) }
                typeProjectionT.asClue {
                    typeProjectionT.variance shouldBe "out"
                }
            }

            @Test
            fun `should reference type`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithComplexTypeProjection" }
                val typeProjectionT = findUniqueFactOrFail<TypeProjectionT> { isContainedIn(it, workflowT) }
                shouldBeChildOf<TypeT>(typeProjectionT.type, typeProjectionT)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val workflowT = findUniqueFactOrFail<WorkflowT> { it.name == "myWorkflowWithSimpleTypeProjection" }
                val typeProjectionT = findUniqueFactOrFail<TypeProjectionT> { isContainedIn(it, workflowT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == typeProjectionT.id }
            }
        }

        @Nested
        inner class UnionType {
            @Test
            fun `should handle simple union types`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithSimpleUnionType" }
                val unionTypeT = findUniqueFactOrFail<UnionTypeT> { isContainedIn(it, stepT) }
                unionTypeT.asClue {
                    unionTypeT.typeArguments.shouldBeEmpty()
                }
            }

            @Test
            fun `should store type arguments`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithComplexUnionType" }
                val unionTypeT = findUniqueFactOrFail<UnionTypeT> { isContainedIn(it, stepT) }
                shouldBeNChildrenOf<TypeArgumentT>(unionTypeT.typeArguments, unionTypeT, 2)
            }

            @Test
            fun `should store source location in separate relation`() = withFactbaseFromFile("types") {
                val stepT =
                    findUniqueFactOrFail<StepT> { it.name == "myWorkflowStepWithSimpleUnionType" }
                val unionTypeT = findUniqueFactOrFail<UnionTypeT> { isContainedIn(it, stepT) }
                findUniqueFactOrFail<SourceLocationS> { it.target == unionTypeT.id }
            }
        }
    }

    // *****************************************************************************************************************
    // Other
    // ****************************************************************************************************************/

    @Nested
    inner class Other {

        @Nested
        inner class AnnotationCalls {
            @Test
            fun `should handle simple annotation uses`() = withFactbaseFromFile("annotationCalls") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithSimpleAnnotationCall" }
                val annotationCallT = findUniqueFactOrFail<AnnotationCallT> { it.parent == classT.id }
                annotationCallT.asClue {
                    annotationCallT.arguments.shouldBeNull()
                }
            }

            @Test
            fun `should reference annotation if possible`() = withFactbaseFromFile("annotationCalls") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithSimpleAnnotationCall" }
                val annotationCallT = findUniqueFactOrFail<AnnotationCallT> { it.parent == classT.id }
                val annotationT = findUniqueFactOrFail<AnnotationT> { it.id == annotationCallT.annotation }
                annotationT.asClue {
                    annotationT.name shouldBe "MyAnnotation"
                }
            }

            @Test
            fun `should reference arguments`() = withFactbaseFromFile("annotationCalls") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithComplexAnnotationCall" }
                val annotationCallT = findUniqueFactOrFail<AnnotationCallT> { it.parent == classT.id }
                shouldBeNChildExpressionsOf<ExpressionT>(annotationCallT.arguments, annotationCallT, 2)
            }

            @Test
            fun `should store name for unresolvable annotations`() = withFactbaseFromFile("annotationCalls") {
                val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithUnresolvedAnnotationCall" }
                val annotationCallT = findUniqueFactOrFail<AnnotationCallT> { it.parent == classT.id }
                val unresolvedT = findUniqueFactOrFail<UnresolvedT> { it.id == annotationCallT.annotation }
                unresolvedT.asClue {
                    unresolvedT.name shouldBe "MyUnresolvedAnnotation"
                }
            }

            @Test
            fun `should store source location in separate relation`() =
                withFactbaseFromFile("annotationCalls") {
                    val classT = findUniqueFactOrFail<ClassT> { it.name == "MyClassWithSimpleAnnotationCall" }
                    val annotationCallT = findUniqueFactOrFail<AnnotationCallT> { it.parent == classT.id }
                    findUniqueFactOrFail<SourceLocationS> { it.target == annotationCallT.id }
                }
        }

        @Nested
        inner class SourceLocation {

            @Test
            fun `should store uri hash`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.MyOtherClass" }
                val sourceLocationS = findUniqueFactOrFail<SourceLocationS> { it.target == importT.id }
                sourceLocationS.asClue {
                    sourceLocationS.uriHash shouldBe "//@imports.1"
                }
            }

            @Test
            fun `should store offset`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.MyClass" }
                val sourceLocationS = findUniqueFactOrFail<SourceLocationS> { it.target == importT.id }
                sourceLocationS.asClue {
                    // Actual offset depends on the new line characters (48 for just \n or \r and 50 for \r\n)
                    sourceLocationS.offset shouldBeOneOf listOf(48, 50)
                }
            }

            @Test
            fun `should store line`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.MyClass" }
                val sourceLocationS = findUniqueFactOrFail<SourceLocationS> { it.target == importT.id }
                sourceLocationS.asClue {
                    sourceLocationS.line shouldBe 3
                }
            }

            @Test
            fun `should store column`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.MyClass" }
                val sourceLocationS = findUniqueFactOrFail<SourceLocationS> { it.target == importT.id }
                sourceLocationS.asClue {
                    sourceLocationS.column shouldBe 1
                }
            }

            @Test
            fun `should store length`() = withFactbaseFromFile("declarations") {
                val importT = findUniqueFactOrFail<ImportT> { it.importedNamespace == "myPackage.MyClass" }
                val sourceLocationS = findUniqueFactOrFail<SourceLocationS> { it.target == importT.id }
                sourceLocationS.asClue {
                    sourceLocationS.length shouldBe 24
                }
            }
        }
    }

    // *****************************************************************************************************************
    // Helpers
    // ****************************************************************************************************************/

    private fun withFactbaseFromFile(file: String, lambda: PlFactbase.() -> Unit) {
        main.createFactbase("$testRoot/$file.${SmlFileExtension.Test}").apply(lambda)
    }
}
