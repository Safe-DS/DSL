package de.unibonn.simpleml.prologBridge.model.facts

import de.unibonn.simpleml.prologBridge.model.facts.PlTerm.Companion.fromJavaRepresentation
import de.unibonn.simpleml.simpleML.SmlAbstractAssignee
import de.unibonn.simpleml.simpleML.SmlAbstractConstraint
import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlAbstractObject
import de.unibonn.simpleml.simpleML.SmlAbstractProtocolTerm
import de.unibonn.simpleml.simpleML.SmlAbstractProtocolToken
import de.unibonn.simpleml.simpleML.SmlAbstractStatement
import de.unibonn.simpleml.simpleML.SmlAbstractType
import de.unibonn.simpleml.simpleML.SmlAbstractTypeArgumentValue
import de.unibonn.simpleml.simpleML.SmlAnnotation
import de.unibonn.simpleml.simpleML.SmlAnnotationCall
import de.unibonn.simpleml.simpleML.SmlArgument
import de.unibonn.simpleml.simpleML.SmlAssignment
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlBlockLambda
import de.unibonn.simpleml.simpleML.SmlBlockLambdaResult
import de.unibonn.simpleml.simpleML.SmlBoolean
import de.unibonn.simpleml.simpleML.SmlCall
import de.unibonn.simpleml.simpleML.SmlCallableType
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlExpressionLambda
import de.unibonn.simpleml.simpleML.SmlExpressionStatement
import de.unibonn.simpleml.simpleML.SmlFloat
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlImport
import de.unibonn.simpleml.simpleML.SmlIndexedAccess
import de.unibonn.simpleml.simpleML.SmlInfixOperation
import de.unibonn.simpleml.simpleML.SmlInt
import de.unibonn.simpleml.simpleML.SmlMemberAccess
import de.unibonn.simpleml.simpleML.SmlMemberType
import de.unibonn.simpleml.simpleML.SmlNamedType
import de.unibonn.simpleml.simpleML.SmlNull
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlPlaceholder
import de.unibonn.simpleml.simpleML.SmlPrefixOperation
import de.unibonn.simpleml.simpleML.SmlProtocol
import de.unibonn.simpleml.simpleML.SmlProtocolAlternative
import de.unibonn.simpleml.simpleML.SmlProtocolComplement
import de.unibonn.simpleml.simpleML.SmlProtocolParenthesizedTerm
import de.unibonn.simpleml.simpleML.SmlProtocolQuantifiedTerm
import de.unibonn.simpleml.simpleML.SmlProtocolReference
import de.unibonn.simpleml.simpleML.SmlProtocolSequence
import de.unibonn.simpleml.simpleML.SmlProtocolSubterm
import de.unibonn.simpleml.simpleML.SmlProtocolTokenClass
import de.unibonn.simpleml.simpleML.SmlReference
import de.unibonn.simpleml.simpleML.SmlResult
import de.unibonn.simpleml.simpleML.SmlStarProjection
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.simpleML.SmlString
import de.unibonn.simpleml.simpleML.SmlTemplateString
import de.unibonn.simpleml.simpleML.SmlTemplateStringEnd
import de.unibonn.simpleml.simpleML.SmlTemplateStringInner
import de.unibonn.simpleml.simpleML.SmlTemplateStringStart
import de.unibonn.simpleml.simpleML.SmlTypeArgument
import de.unibonn.simpleml.simpleML.SmlTypeParameter
import de.unibonn.simpleml.simpleML.SmlTypeParameterConstraint
import de.unibonn.simpleml.simpleML.SmlTypeProjection
import de.unibonn.simpleml.simpleML.SmlUnionType
import de.unibonn.simpleml.simpleML.SmlWildcard
import de.unibonn.simpleml.simpleML.SmlWorkflow
import de.unibonn.simpleml.simpleML.SmlYield
import de.unibonn.simpleml.utils.Id

/**
 * Represents generic Prolog facts.
 *
 * @param factName
 * The name of this fact.
 *
 * @param arguments
 * The arguments of this fact. Arguments can either be `null`, booleans, IDs, number, strings or lists.
 */
sealed class PlFact(factName: String, vararg arguments: Any?) {

    /**
     * The name of this fact as a Prolog atom.
     */
    private val factName: PlAtom = PlAtom(factName)

    /**
     * The arguments of this fact as a list of Prolog terms.
     */
    val plArguments: List<PlTerm> = fromJavaRepresentation(listOf(*arguments))

    /**
     * The number of arguments of this fact.
     */
    private val arity = arguments.size

    /**
     * The functor of this fact, i.e. factName/arity.
     *
     * **Example:** If the name is "example" and the number of arguments (= arity) is 3, the functor is "example/3".
     */
    val functor: String = "$factName/$arity"

    override fun toString() = plArguments.joinToString(prefix = "$factName(", postfix = ").") { it.toString() }
}

/**
 * Prolog facts that have their own ID and a reference to the fact for their logical parent.
 *
 * @param factName
 * The name of this fact.
 *
 * @param id
 * The ID of this fact.
 *
 * @param otherArguments
 * Arguments of this fact beyond the ID. Arguments can either be `null`, booleans, IDs, number, strings or lists.
 */
sealed class Node(factName: String, id: Id<SmlAbstractObject>, vararg otherArguments: Any?) :
    PlFact(factName, id, *otherArguments) {

    /**
     * The ID of this fact.
     */
    abstract val id: Id<SmlAbstractObject>
}

/**
 * Prolog facts that have their own ID and a reference to the fact for their logical parent.
 *
 * @param factName
 * The name of this fact.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent.
 *
 * @param otherArguments
 * Arguments of this fact beyond ID and parent. Arguments can either be `null`, booleans, IDs, number, strings or lists.
 */
sealed class NodeWithParent(
    factName: String,
    id: Id<SmlAbstractObject>,
    parent: Id<SmlAbstractObject>,
    vararg otherArguments: Any?
) :
    Node(factName, id, parent, *otherArguments) {

    /**
     * The ID of the fact for the logical parent.
     */
    abstract val parent: Id<SmlAbstractObject>
}

/**********************************************************************************************************************
 * Compilation Unit
 **********************************************************************************************************************/

/**
 * This Prolog fact represents compilations units.
 *
 * @param id
 * The ID of this fact.
 *
 * @param packageName
 * The name of the package that this compilation unit belongs to or `null` if no package is declared.
 *
 * @param
 * IDs of [ImportT] facts.
 *
 * @param members
 * The IDs of the facts for the members.
 */
data class CompilationUnitT(
    override val id: Id<SmlCompilationUnit>,
    val packageName: String?,
    val imports: List<Id<SmlImport>>,
    val members: List<Id<SmlAbstractDeclaration>>
) : Node("compilationUnitT", id, packageName, imports, members) {
    override fun toString() = super.toString()
}

/**********************************************************************************************************************
 * Declarations
 **********************************************************************************************************************/

/**
 * Prolog facts that have their own ID, a reference to the fact for their logical parent, and a name (which is the name
 * of the declaration and unrelated to the factName).
 *
 * @param factName
 * The name of this fact.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent.
 *
 * @param name
 * The name of the declaration.
 *
 * @param otherArguments
 * Arguments of this fact beyond ID, parent, and name. Arguments can either be `null`, booleans, IDs, number, strings or
 * lists.
 */
sealed class DeclarationT(
    factName: String,
    id: Id<SmlAbstractDeclaration>,
    parent: Id<SmlAbstractObject>, // SmlClass | SmlCompilationUnit
    name: String,
    vararg otherArguments: Any?
) :
    NodeWithParent(factName, id, parent, name, *otherArguments) {

    /**
     * The name of the declaration.
     */
    abstract val name: String
}

/**
 * This Prolog fact represents annotations.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the compilationUnitT fact for the containing compilation unit.
 *
 * @param name
 * The name of the annotation.
 *
 * @param parameters
 * The list of parameters or null. Each element in the list is the ID of a parameterT fact for the respective parameter.
 * Note that an empty list is used for an annotation with an empty parameter list, e.g. `annotation A()`, while null is
 * used for an annotation with no parameter list at all, like `annotation B`.
 *
 * @param constraints
 * The IDs of the facts for the constraints of this annotation or null if the annotation has no type parameter
 * constraints. Note that the grammar forbids the use of the keyword `where` without any type parameter constraints
 * afterwards, so this will never be set to an empty list.
 */
data class AnnotationT(
    override val id: Id<SmlAnnotation>,
    override val parent: Id<SmlAbstractObject>, // Actually just SmlCompilationUnit but this allows a handleDeclaration function
    override val name: String,
    val parameters: List<Id<SmlParameter>>?,
    val constraints: List<Id<SmlAbstractConstraint>>?,
) : DeclarationT("annotationT", id, parent, name, parameters) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents attributes of a class or interface.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the classT/interfaceT fact for the containing class or interface.
 *
 * @param name
 * The name of the attribute.
 *
 * @param isStatic
 * Whether this attribute is static.
 *
 * @param type
 * The ID of the fact for the type of the attribute or null if no type was specified.
 */
data class AttributeT(
    override val id: Id<SmlAttribute>,
    override val parent: Id<SmlAbstractObject>, // Actually just SmlClass but this allows a handleDeclaration function
    override val name: String,
    val isStatic: Boolean,
    val type: Id<SmlAbstractType>?
) :
    DeclarationT("attributeT", id, parent, name, isStatic, type) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents classes.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the containing compilation unit, class or interface.
 *
 * @param name
 * The name of the class.
 *
 * @param typeParameters
 * The list of type parameters or null. Each element in the list is the ID of a typeParameterT fact for the respective
 * type parameter. Note that an empty list is used for a class with an empty type parameter list, e.g. `class A<>`,
 * while null is used for a class with no type parameter list at all, like `class B`.
 *
 * @param parameters
 * The list of parameters or null. Each element in the list is the ID of a parameterT fact for the respective parameter.
 * Note that an empty list is used for a class with a constructor with an empty parameter list, e.g. `class A()`, while
 * null is used for a class with no constructor at all, like `class B`.
 *
 * @param parentTypes
 * The IDs of the facts for the parent types of this class or null if the class has no parent types. Note that the
 * grammar forbids the use of the keyword `sub` without any parent types afterwards, so this will never be set to an
 * empty list.
 *
 * @param constraints
 * The IDs of the facts for the constraints of this class or null if the class has no type parameter constraints. Note
 * that the grammar forbids the use of the keyword `where` without any type parameter constraints afterwards, so this
 * will never be set to an empty list.
 *
 * @param members
 * The list of class members or null. Each element in the list is the ID of the fact for the respective member. Note
 * that an empty list is used for a class with an empty body, e.g. `class A {}`, while null is used for a class without
 * a body, like `class B`.
 */
data class ClassT(
    override val id: Id<SmlClass>,
    override val parent: Id<SmlAbstractObject>, // SmlClass | SmlCompilationUnit
    override val name: String,
    val typeParameters: List<Id<SmlTypeParameter>>?,
    val parameters: List<Id<SmlParameter>>?,
    val parentTypes: List<Id<SmlAbstractType>>?,
    val constraints: List<Id<SmlAbstractConstraint>>?,
    val members: List<Id<SmlAbstractObject>>? // SmlClassMember | SmlProtocol
) : DeclarationT(
    "classT",
    id,
    parent,
    name,
    typeParameters,
    parameters,
    parentTypes,
    constraints,
    members
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents enums.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the containing compilation unit, class or interface.
 *
 * @param name
 * The name of the enum.
 *
 * @param variants
 * The list of instances or null. Each element in the list is the ID of the enumVariantT fact for the respective
 * instance. Note that an empty list is used for an enum with an empty body, e.g. `enum A {}`, while null is used for
 * an enum without a body, like `enum B`.
 */
data class EnumT(
    override val id: Id<SmlEnum>,
    override val parent: Id<SmlAbstractObject>, // SmlClass | SmlCompilationUnit
    override val name: String,
    val variants: List<Id<SmlEnumVariant>>?
) :
    DeclarationT("enumT", id, parent, name, variants) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents enum instances.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the enumT fact for the containing enum.
 *
 * @param name
 * The name of the enum instance.
 *
 * @param typeParameters
 * The list of type parameters or null. Each element in the list is the ID of a typeParameterT fact for the respective
 * type parameter. Note that an empty list is used for a variant with an empty type parameter list, e.g. `A<>`,
 * while null is used for a variant with no type parameter list at all, like `B`.
 *
 * @param parameters
 * The list of parameters or null. Each element in the list is the ID of a parameterT fact for the respective parameter.
 * Note that an empty list is used for a variant with a constructor with an empty parameter list, e.g. `A()`, while
 * null is used for a variant with no constructor at all, like `B`.
 *
 * @param constraints
 * The IDs of the facts for the constraints of this variant or null if the variant has no type parameter constraints.
 * Note that the grammar forbids the use of the keyword `where` without any type parameter constraints afterwards, so
 * this will never be set to an empty list.
 */
data class EnumVariantT(
    override val id: Id<SmlEnumVariant>,
    override val parent: Id<SmlAbstractObject>, // Actually just SmlEnum but this allows a handleDeclaration function
    override val name: String,
    val typeParameters: List<Id<SmlTypeParameter>>?,
    val parameters: List<Id<SmlParameter>>?,
    val constraints: List<Id<SmlAbstractConstraint>>?
) :
    DeclarationT("enumVariantT", id, parent, name, typeParameters, parameters, constraints) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents functions.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the containing compilation unit, class or interface.
 *
 * @param name
 * The name of the function.
 *
 * @param isStatic
 * Whether this function is static.
 *
 * @param typeParameters
 * The list of type parameters or null. Each element in the list is the ID of a typeParameterT fact for the respective
 * type parameter. Note that an empty list is used for a function with an empty type parameter list, e.g. `fun a<>()`,
 * while null is used for a function with no type parameter list at all, like `fun b()`.
 *
 * @param parameters
 * The IDs of the parameterT facts for the parameters of the function. The grammar requires the list to be there so this
 * is never null.
 *
 * @param results
 * The list of result or null. Each element in the list is the ID of a resultT fact for the respective result. Note that
 * an empty list is used for a function with an empty result list, e.g. `fun a() -> ()`, while null is used for a
 * function with no result list at all, like `fun b()`.
 *
 * @param constraints
 * The IDs of the facts for the constraints of this function or null if the function has no type parameter constraints.
 * Note that the grammar forbids the use of the keyword `where` without any type parameter constraints afterwards, so
 * this will never be set to an empty list.
 */
data class FunctionT(
    override val id: Id<SmlFunction>,
    override val parent: Id<SmlAbstractObject>, // SmlClass | SmlCompilationUnit
    override val name: String,
    val isStatic: Boolean,
    val typeParameters: List<Id<SmlTypeParameter>>?,
    val parameters: List<Id<SmlParameter>>,
    val results: List<Id<SmlResult>>?,
    val constraints: List<Id<SmlAbstractConstraint>>?
) : DeclarationT(
    "functionT",
    id,
    parent,
    name,
    isStatic,
    typeParameters,
    parameters,
    results,
    constraints
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents imports.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the packageT fact for the containing package.
 *
 * @param importedNamespace
 * The qualified name of the imported namespace.
 *
 * @param alias
 * The alias the namespace should be imported under or null if no alias is specified.
 */
data class ImportT(
    override val id: Id<SmlImport>,
    override val parent: Id<SmlCompilationUnit>,
    val importedNamespace: String,
    val alias: String?
) :
    NodeWithParent("importT", id, parent, importedNamespace, alias) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents parameters.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. an annotation.
 *
 * @param name
 * The name of the parameter.
 *
 * @param isVariadic
 * Whether this parameter is variadic.
 *
 * @param type
 * The ID of the fact for the type or null if no type is specified.
 *
 * @param defaultValue
 * The ID of the fact for the default value or null if the parameter is required and has no default value.
 */
data class ParameterT(
    override val id: Id<SmlParameter>,
    override val parent: Id<SmlAbstractObject>, // Actually just SmlDeclaration but this allows a handleDeclaration function
    override val name: String,
    val isVariadic: Boolean,
    val type: Id<SmlAbstractType>?,
    val defaultValue: Id<SmlAbstractExpression>?
) : DeclarationT(
    "parameterT",
    id,
    parent,
    name,
    isVariadic,
    type,
    defaultValue
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents results.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a function.
 *
 * @param name
 * The name of the result.
 *
 * @param type
 * The ID of the fact for the type or null if no type is specified.
 */
data class ResultT(
    override val id: Id<SmlResult>,
    override val parent: Id<SmlAbstractObject>,
    override val name: String,
    val type: Id<SmlAbstractType>?
) :
    DeclarationT("resultT", id, parent, name, type) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents type parameters.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a class.
 *
 * @param name
 * The name of the type parameter.
 *
 * @param variance
 * The variance of this type parameter ("in" for contravariance, "out" for covariance, or `null` for invariance).
 */
data class TypeParameterT(
    override val id: Id<SmlTypeParameter>,
    override val parent: Id<SmlAbstractObject>,
    override val name: String,
    val variance: String?
) : DeclarationT("typeParameterT", id, parent, name, variance) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents workflows.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the compilationUnitT fact for the containing compilation unit.
 *
 * @param name
 * The name of the workflow.
 *
 * @param statements
 * The IDs of the facts for the statements in the workflow body. The grammar requires the body to be there so this is
 * never null.
 */
data class WorkflowT(
    override val id: Id<SmlWorkflow>,
    override val parent: Id<SmlAbstractObject>, // Actually just SmlCompilationUnit but this allows a handleDeclaration function
    override val name: String,
    val statements: List<Id<SmlAbstractStatement>>
) : DeclarationT("workflowT", id, parent, name, statements) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents steps.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the compilationUnitT fact for the containing compilation unit.
 *
 * @param name
 * The name of the step.
 *
 * @param parameters
 * The IDs of the parameterT facts for the parameters of the step. The grammar requires the list to be there so this is
 * never null.
 *
 * @param results
 * The list of result or null. Each element in the list is the ID of a resultT fact for the respective result. Note that
 * an empty list is used for a step with an empty result list, e.g. `step a() -> () {}`, while null is used for a step
 * with no result list at all, like `step b() {}`.
 *
 * @param statements
 * The IDs of the facts for the statements in the body of the step. The grammar requires the body to be there so this is
 * never null.
 */
data class StepT(
    override val id: Id<SmlStep>,
    override val parent: Id<SmlAbstractObject>, // Actually just SmlCompilationUnit but this allows a handleDeclaration function
    override val name: String,
    val visibility: String?,
    val parameters: List<Id<SmlParameter>>,
    val results: List<Id<SmlResult>>?,
    val statements: List<Id<SmlAbstractStatement>>
) : DeclarationT(
    "stepT",
    id,
    parent,
    name,
    visibility,
    parameters,
    results,
    statements
) {
    override fun toString() = super.toString()
}

/**********************************************************************************************************************
 * Statements
 **********************************************************************************************************************/

/**
 * Prolog facts for statements.
 *
 * @param factName
 * The name of this fact.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent.
 *
 * @param otherArguments
 * Arguments of this fact beyond ID and parent. Arguments can either be `null`, booleans, IDs, number, strings or lists.
 */
sealed class StatementT(
    factName: String,
    id: Id<SmlAbstractStatement>,
    parent: Id<SmlAbstractObject>, // SmlBlockLambda | SmlWorkflow | SmlWorkflowStep
    vararg otherArguments: Any?
) :
    NodeWithParent(factName, id, parent, *otherArguments)

/**
 * This Prolog fact represents assignments.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, such as a workflow.
 *
 * @param assignees
 * The assignees of this assignment (has at least one).
 *
 * @param expression
 * The ID of the fact for the expression on the right-hand side of this assignment.
 */
data class AssignmentT(
    override val id: Id<SmlAssignment>,
    override val parent: Id<SmlAbstractObject>,
    val assignees: List<Id<SmlAbstractAssignee>>,
    val expression: Id<SmlAbstractExpression>
) :
    StatementT("assignmentT", id, parent, assignees, expression) {
    override fun toString() = super.toString()
}

/**
 * Facts that can be uses as assignees in an assignmentT fact.
 */
interface AssigneeT

/**
 * This Prolog fact represents results of a block lambda.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the assignmentT fact for the containing assignment.
 *
 * @param name
 * The name of the result.
 */
data class BlockLambdaResultT(
    override val id: Id<SmlBlockLambdaResult>,
    override val parent: Id<SmlAssignment>,
    override val name: String
) :
    DeclarationT("blockLambdaResultT", id, parent, name), AssigneeT {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents placeholder declarations.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the assignmentT fact for the containing assignment.
 *
 * @param name
 * The name of the placeholder.
 */
data class PlaceholderT(
    override val id: Id<SmlPlaceholder>,
    override val parent: Id<SmlAssignment>,
    override val name: String
) :
    DeclarationT("placeholderT", id, parent, name), AssigneeT {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents wildcards in an assignment, which discard the assigned value.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the assignmentT fact for the containing assignment.
 */
data class WildcardT(override val id: Id<SmlWildcard>, override val parent: Id<SmlAssignment>) :
    NodeWithParent("wildcardT", id, parent), AssigneeT {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents yields.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the assignmentT fact for the containing assignment.
 *
 * @param result
 * The ID of the resultT fact for the referenced result or an unresolvedT fact if the result could not be
 * resolved.
 */
data class YieldT(
    override val id: Id<SmlYield>,
    override val parent: Id<SmlAssignment>,
    val result: Id<SmlResult>
) :
    NodeWithParent("yieldT", id, parent, result), AssigneeT {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents expression statements.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, such as a workflow.
 *
 * @param expression
 * The ID of the fact for the expression that is evaluated.
 */
data class ExpressionStatementT(
    override val id: Id<SmlExpressionStatement>,
    override val parent: Id<SmlAbstractObject>,
    val expression: Id<SmlAbstractExpression>
) :
    StatementT("expressionStatementT", id, parent, expression) {
    override fun toString() = super.toString()
}

/**********************************************************************************************************************
 * Expressions
 **********************************************************************************************************************/

/**
 * Prolog facts for expressions.
 *
 * @param factName
 * The name of this fact.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param otherArguments
 * Arguments of this fact beyond ID, parent, and enclosing. Arguments can either be `null`, booleans, IDs, number,
 * strings or lists.
 */
sealed class ExpressionT(
    factName: String,
    id: Id<SmlAbstractExpression>,
    parent: Id<SmlAbstractObject>,
    enclosing: Id<SmlAbstractObject>,
    vararg otherArguments: Any?
) :
    NodeWithParent(factName, id, parent, enclosing, *otherArguments) {

    /**
     * The ID of the fact for closest ancestor that is not an expression. This is usually a statement but can also be a
     * parameter if the expression is its default value.
     */
    abstract val enclosing: Id<SmlAbstractObject>
}

/**
 * This Prolog fact represents arguments for annotation calls or calls.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression. This is either a statement or an annotation call.
 *
 * @param parameter
 * If the argument is named, this is the ID of the parameterT fact for the referenced parameter or an unresolvedT
 * fact if the parameter could not be resolved. If the argument is purely positional this is null.
 *
 * @param value
 * The ID of the fact for the expression that represents the passed value.
 */
data class ArgumentT(
    override val id: Id<SmlArgument>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val parameter: Id<SmlParameter>?,
    val value: Id<SmlAbstractExpression>
) : ExpressionT("argumentT", id, parent, enclosing, parameter, value) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents block lambdas.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param parameters
 * The list of parameters. Each element in the list is the ID of a parameterT fact for the respective parameter.The
 * grammar requires the body to be there so this is never null.
 *
 * @param statements
 * The IDs of the facts for the statements in the body of the lambda. The grammar requires the body to be there
 * so this is never null.
 */
data class BlockLambdaT(
    override val id: Id<SmlBlockLambda>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val parameters: List<Id<SmlParameter>>,
    val statements: List<Id<SmlAbstractStatement>>
) : ExpressionT(
    "blockLambdaT",
    id,
    parent,
    enclosing,
    parameters,
    statements
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents boolean literals.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param value
 * The value of the literal.
 */
data class BooleanT(
    override val id: Id<SmlBoolean>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val value: Boolean
) :
    ExpressionT("booleanT", id, parent, enclosing, value) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents calls.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. another call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param receiver
 * The ID of the fact for the callable that is called.
 *
 * @param typeArguments
 * The list of type arguments or null. Each element in the list is the ID of a typeArgumentT fact for the respective
 * type argument. Note that an empty list is used for a call with an empty type argument list, e.g. `a<>()`, while null
 * is used for a call with no type argument list at all, like `b()`.
 *
 * @param arguments
 * The IDs of the argumentT facts for the arguments of the call. The grammar requires the list to be there so this
 * is never null.
 */
data class CallT(
    override val id: Id<SmlCall>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val receiver: Id<SmlAbstractExpression>,
    val typeArguments: List<Id<SmlTypeArgument>>?,
    val arguments: List<Id<SmlArgument>>
) : ExpressionT(
    "callT",
    id,
    parent,
    enclosing,
    receiver,
    typeArguments,
    arguments
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents expression lambdas.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param parameters
 * The list of parameters. Each element in the list is the ID of a parameterT fact for the respective parameter.The
 * grammar requires the body to be there so this is never null.
 *
 * @param result
 * The ID of the fact for the result of the lambda.
 */
data class ExpressionLambdaT(
    override val id: Id<SmlExpressionLambda>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val parameters: List<Id<SmlParameter>>,
    val result: Id<SmlAbstractExpression>
) : ExpressionT(
    "expressionLambdaT",
    id,
    parent,
    enclosing,
    parameters,
    result
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents float literals.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param value
 * The value of the literal.
 */
data class FloatT(
    override val id: Id<SmlFloat>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val value: Double
) :
    ExpressionT("floatT", id, parent, enclosing, value) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents member accesses.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param receiver
 * The ID of the fact for the receiver of the indexed access.
 *
 * @param index
 * The accessed index.
 */
data class IndexedAccessT(
    override val id: Id<SmlIndexedAccess>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val receiver: Id<SmlAbstractExpression>,
    val index: Id<SmlAbstractExpression>
) : ExpressionT(
    "indexedAccessT",
    id,
    parent,
    enclosing,
    receiver,
    index
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents infix operations.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param leftOperand
 * The ID of the fact for the expression that is used as the left operand.
 *
 * @param operator
 * The operator of this operation.
 *
 * @param rightOperand
 * The ID of the fact for the expression that is used as the right operand.
 */
data class InfixOperationT(
    override val id: Id<SmlInfixOperation>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val leftOperand: Id<SmlAbstractExpression>,
    val operator: String,
    val rightOperand: Id<SmlAbstractExpression>
) : ExpressionT(
    "infixOperationT",
    id,
    parent,
    enclosing,
    leftOperand,
    operator,
    rightOperand
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents integer literals.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param value
 * The value of the literal.
 */
data class IntT(
    override val id: Id<SmlInt>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val value: Int
) :
    ExpressionT("intT", id, parent, enclosing, value) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents member accesses.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param receiver
 * The ID of the fact for the receiver of the member access.
 *
 * @param isNullSafe
 * Whether this member access is null safe.
 *
 * @param member
 * The ID of the referenceT fact for the accessed member.
 */
data class MemberAccessT(
    override val id: Id<SmlMemberAccess>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val receiver: Id<SmlAbstractExpression>,
    val isNullSafe: Boolean,
    val member: Id<SmlReference>
) : ExpressionT(
    "memberAccessT",
    id,
    parent,
    enclosing,
    receiver,
    isNullSafe,
    member
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represent the `null` literal.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 */
data class NullT(
    override val id: Id<SmlNull>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>
) :
    ExpressionT("nullT", id, parent, enclosing) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents parenthesized expressions.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param expression
 * The ID of the fact for the expression inside the parentheses.
 */
data class ParenthesizedExpressionT(
    override val id: Id<SmlAbstractExpression>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val expression: Id<SmlAbstractExpression>
) : ExpressionT("parenthesizedExpressionT", id, parent, enclosing, expression) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents prefix operations.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param operator
 * The operator of this operation.
 *
 * @param operand
 * The ID of the fact for the expression that is used as the operand.
 */
data class PrefixOperationT(
    override val id: Id<SmlPrefixOperation>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val operator: String,
    val operand: Id<SmlAbstractExpression>
) : ExpressionT(
    "prefixOperationT",
    id,
    parent,
    enclosing,
    operator,
    operand
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents references.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param declaration
 * The ID of the fact for the referenced declaration or an unresolvedT fact if the reference could not be resolved.
 */
data class ReferenceT(
    override val id: Id<SmlReference>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val declaration: Id<SmlAbstractDeclaration>
) : ExpressionT("referenceT", id, parent, enclosing, declaration) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents string literals.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param value
 * The value of the literal.
 */
data class StringT(
    override val id: Id<SmlString>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val value: String
) : ExpressionT("stringT", id, parent, enclosing, value) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents string literals.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param expressions
 * Template string parts and template expressions.
 */
data class TemplateStringT(
    override val id: Id<SmlTemplateString>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val expressions: List<Id<SmlAbstractExpression>>
) : ExpressionT("templateStringT", id, parent, enclosing, expressions) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents starts of template string.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param value
 * The value of the template string part.
 */
data class TemplateStringStartT(
    override val id: Id<SmlTemplateStringStart>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val value: String
) : ExpressionT("templateStringStartT", id, parent, enclosing, value) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents inner parts of template string.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param value
 * The value of the template string part.
 */
data class TemplateStringInnerT(
    override val id: Id<SmlTemplateStringInner>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val value: String
) : ExpressionT("templateStringInnerT", id, parent, enclosing, value) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents the end of template strings.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param enclosing
 * The ID of the fact for closest ancestor that is not an expression.
 *
 * @param value
 * The value of the template string part.
 */
data class TemplateStringEndT(
    override val id: Id<SmlTemplateStringEnd>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val value: String
) : ExpressionT("templateStringEndT", id, parent, enclosing, value) {
    override fun toString() = super.toString()
}

/**********************************************************************************************************************
 * Types
 **********************************************************************************************************************/

/**
 * Prolog facts for types.
 *
 * @param factName
 * The name of this fact.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent.
 *
 * @param otherArguments
 * Arguments of this fact beyond ID and parent. Arguments can either be `null`, booleans, IDs, number, strings or lists.
 */
sealed class TypeT(
    factName: String,
    id: Id<SmlAbstractType>,
    parent: Id<SmlAbstractObject>,
    vararg otherArguments: Any?
) :
    NodeWithParent(factName, id, parent, *otherArguments)

/**
 * This Prolog fact represents callable types.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a parameter.
 *
 * @param parameters
 * The IDs of the parameterT facts for the parameters of the callable type. The grammar requires the list to be there so
 * this is never null.
 *
 * @param results
 * The IDs of the resultT facts for the results of the callable type. The grammar requires the list to be there so this
 * is never null.
 */
data class CallableTypeT(
    override val id: Id<SmlCallableType>,
    override val parent: Id<SmlAbstractObject>,
    val parameters: List<Id<SmlParameter>>,
    val results: List<Id<SmlResult>>
) : TypeT("callableTypeT", id, parent, parameters, results) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents member types.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a parameter.
 *
 * @param receiver
 * The ID of the fact for the receiver of the member type.
 *
 * @param member
 * The ID of the namedTypeT fact for the accessed member type.
 */
data class MemberTypeT(
    override val id: Id<SmlMemberType>,
    override val parent: Id<SmlAbstractObject>,
    val receiver: Id<SmlAbstractType>,
    val member: Id<SmlNamedType>
) :
    TypeT("memberTypeT", id, parent, receiver, member) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents named types like classes.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a parameter.
 *
 * @param declaration
 * The ID of the fact for the declaration that is used as the type or an unresolvedT fact if the declaration could not
 * be resolved.
 *
 * @param typeArguments
 * The list of type arguments or null. Each element in the list is the ID of a typeArgumentT fact for the respective
 * type argument. Note that an empty list is used for a named type with an empty type argument list, e.g. `A<>`, while
 * null is used for a named type with no type argument list at all, like `B`.
 *
 * @param isNullable
 * Whether `null` is a valid instance of the type.
 */
data class NamedTypeT(
    override val id: Id<SmlNamedType>,
    override val parent: Id<SmlAbstractObject>,
    val declaration: Id<SmlAbstractDeclaration>,
    val typeArguments: List<Id<SmlTypeArgument>>?,
    val isNullable: Boolean
) : TypeT(
    "namedTypeT",
    id,
    parent,
    declaration,
    typeArguments,
    isNullable
) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents parenthesized types.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a parameter.
 *
 * @param type
 * The ID of the fact for the type inside the parentheses.
 */
data class ParenthesizedTypeT(
    override val id: Id<SmlAbstractType>,
    override val parent: Id<SmlAbstractObject>,
    val type: Id<SmlAbstractType>
) :
    TypeT("parenthesizedTypeT", id, parent, type) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents union types.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a parameter.
 *
 * @param typeArguments
 * The IDs of the typeArgumentT facts for the type arguments of this union type. Note that the grammar requires the list
 * to be there (can be empty) so this will never be `null`.
 */
data class UnionTypeT(
    override val id: Id<SmlUnionType>,
    override val parent: Id<SmlAbstractObject>,
    val typeArguments: List<Id<SmlTypeArgument>>
) :
    TypeT("unionTypeT", id, parent, typeArguments) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents type arguments.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a call.
 *
 * @param typeParameter
 * If the type argument is named, this is the ID of the typeParameterT fact for the referenced type parameter or an
 * unresolvedT fact if the type parameter could not be resolved. If the type argument is purely positional this is null.
 *
 * @param value
 * The ID of the fact for the type that represents the passed value.
 */
data class TypeArgumentT(
    override val id: Id<SmlTypeArgument>,
    override val parent: Id<SmlAbstractObject>,
    val typeParameter: Id<SmlTypeParameter>?,
    val value: Id<SmlAbstractTypeArgumentValue>
) :
    NodeWithParent("typeArgumentT", id, parent, typeParameter, value) {
    override fun toString() = super.toString()
}

/**
 * A Prolog fact that can be used as the value of a type argument.
 */
interface TypeArgumentValueT

/**
 * This Prolog fact represents star projections `*`.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the containing typeArgumentT fact.
 */
data class StarProjectionT(override val id: Id<SmlStarProjection>, override val parent: Id<SmlTypeArgument>) :
    NodeWithParent("starProjectionT", id, parent), TypeArgumentValueT {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents type projections.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the containing typeArgumentT fact.
 *
 * @param variance
 * The variance of this type projection ("in" for contravariance, "out" for covariance, or `null` for invariance).
 *
 * @param type
 * The ID of the fact for the type to use for projection.
 */
data class TypeProjectionT(
    override val id: Id<SmlTypeProjection>,
    override val parent: Id<SmlTypeArgument>,
    val variance: String?,
    val type: Id<SmlAbstractType>
) :
    NodeWithParent("typeProjectionT", id, parent, variance, type), TypeArgumentValueT {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents type parameter constraints.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the logical parent, e.g. a class.
 *
 * @param leftOperand
 * The ID of the typeParameterT fact for the type parameter that is used as the left operand or an unresolvedT fact if
 * the type parameter could not be resolved.
 *
 * @param operator
 * The operator of this operation.
 *
 * @param rightOperand
 * The ID of the fact for the type that is used as the right operand.
 */
data class TypeParameterConstraintT(
    override val id: Id<SmlTypeParameterConstraint>,
    override val parent: Id<SmlAbstractObject>,
    val leftOperand: Id<SmlTypeParameter>,
    val operator: String,
    val rightOperand: Id<SmlAbstractType>
) : NodeWithParent(
    "typeParameterConstraintT",
    id,
    parent,
    leftOperand,
    operator,
    rightOperand
) {
    override fun toString() = super.toString()
}

/**********************************************************************************************************************
 * Other
 **********************************************************************************************************************/

/**
 * This Prolog fact represents annotation calls.
 *
 * @param id
 * The ID of this fact.
 *
 * @param parent
 * The ID of the fact for the annotated declaration.
 *
 * @param annotation
 * The ID of the annotationT fact for the referenced annotation or an unresolvedT fact if the annotation could
 * not be resolved.
 *
 * @param arguments
 * The list of arguments or null. Each element in the list is the ID of an argumentT fact for the respective argument.
 * Note that an empty list is used for an annotation call with an empty argument list, e.g. `@A()`, while null is used
 * for an annotation call without an argument list, like `@B`.
 */
data class AnnotationCallT(
    override val id: Id<SmlAnnotationCall>,
    override val parent: Id<SmlAbstractDeclaration>,
    val annotation: Id<SmlAnnotation>,
    val arguments: List<Id<SmlArgument>>?
) :
    NodeWithParent("annotationCallT", id, parent, annotation, arguments) {
    override fun toString() = super.toString()
}

data class ProtocolT(
    override val id: Id<SmlProtocol>,
    override val parent: Id<SmlClass>,
    val subterms: List<Id<SmlProtocolSubterm>>?,
    val term: Id<SmlAbstractProtocolTerm>?
) : NodeWithParent("protocolT", id, parent, subterms, term) {
    override fun toString() = super.toString()
}

sealed class ProtocolTermT(
    factName: String,
    id: Id<SmlAbstractProtocolTerm>,
    parent: Id<SmlAbstractObject>,
    enclosing: Id<SmlAbstractObject>,
    vararg otherArguments: Any?
) : NodeWithParent(factName, id, parent, enclosing, *otherArguments) {

    /**
     * The ID of the fact for closest ancestor that is not an expression. This is usually a statement but can also be a
     * parameter if the expression is its default value.
     */
    abstract val enclosing: Id<SmlAbstractObject>
}

data class ProtocolAlternativeT(
    override val id: Id<SmlProtocolAlternative>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val terms: List<Id<SmlAbstractProtocolTerm>>
) : ProtocolTermT("protocolAlternativeT", id, parent, enclosing, terms) {
    override fun toString() = super.toString()
}

data class ProtocolComplementT(
    override val id: Id<SmlProtocolComplement>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val universe: Id<SmlProtocolTokenClass>?,
    val references: List<Id<SmlProtocolReference>>?
) : ProtocolTermT("protocolComplementT", id, parent, enclosing, references) {
    override fun toString() = super.toString()
}

data class ProtocolParenthesizedTermT(
    override val id: Id<SmlProtocolParenthesizedTerm>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val term: Id<SmlAbstractProtocolTerm>
) : ProtocolTermT("protocolParenthesizedTermT", id, parent, enclosing, term) {
    override fun toString() = super.toString()
}

data class ProtocolQuantifiedTermT(
    override val id: Id<SmlProtocolQuantifiedTerm>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val term: Id<SmlAbstractProtocolTerm>,
    val quantifier: String
) : ProtocolTermT("protocolQuantifiedTermT", id, parent, term, enclosing, quantifier) {
    override fun toString() = super.toString()
}

data class ProtocolReferenceT(
    override val id: Id<SmlProtocolReference>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val token: Id<SmlAbstractProtocolToken>,
) : ProtocolTermT("protocolReferenceT", id, parent, enclosing, token) {
    override fun toString() = super.toString()
}

data class ProtocolSequenceT(
    override val id: Id<SmlProtocolSequence>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val terms: List<Id<SmlAbstractProtocolTerm>>,
) : ProtocolTermT("protocolSequenceT", id, parent, enclosing, terms) {
    override fun toString() = super.toString()
}

data class ProtocolSubtermT(
    override val id: Id<SmlProtocolSubterm>,
    override val parent: Id<SmlAbstractObject>, // Actually just SmlProtocol but this allows a handleDeclaration function
    override val name: String,
    val term: Id<SmlAbstractProtocolTerm>,
) : DeclarationT("protocolSubtermT", id, parent, name, term) {
    override fun toString() = super.toString()
}

data class ProtocolTokenClassT(
    override val id: Id<SmlProtocolTokenClass>,
    override val parent: Id<SmlAbstractObject>,
    override val enclosing: Id<SmlAbstractObject>,
    val value: String,
) : ProtocolTermT("protocolTokenClassT", id, parent, enclosing, value) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact represents cross-references that could not be resolved. It is used so the name of the referenced
 * declaration can be retrieved.
 *
 * @param id
 * The ID of this fact.
 *
 * @param name
 * The name of the referenced declaration.
 */
data class UnresolvedT(override val id: Id<SmlAbstractObject>, val name: String) : Node("unresolvedT", id, name) {
    override fun toString() = super.toString()
}

/**********************************************************************************************************************
 * Relations
 **********************************************************************************************************************/

/**
 * Prolog facts that add additional information to nodes and do not have their own ID.
 *
 * @param factName
 * The name of this fact.
 *
 * @param target
 * The ID of the node that should be enhanced.
 *
 * @param otherArguments
 * The arguments of this fact. Arguments can either be `null`, booleans, IDs, number, strings or lists.
 */
sealed class Relation(factName: String, target: Id<SmlAbstractObject>, vararg otherArguments: Any?) :
    PlFact(factName, target, *otherArguments) {

    /**
     * The ID of the node that should be enhanced.
     */
    abstract val target: Id<SmlAbstractObject>
}

/**
 * This Prolog fact stores the resource URI of a compilation unit.
 *
 * @param target
 * The ID of the fact for the respective compilation unit.
 *
 * @param uri
 * The resource URI of the compilation unit.
 */
data class ResourceS(override val target: Id<SmlCompilationUnit>, val uri: String) :
    Relation("resourceS", target, uri) {
    override fun toString() = super.toString()
}

/**
 * This Prolog fact stores the location of the source code for some node in a source file.
 *
 * @param target
 * The ID of the fact for the respective node.
 *
 * @param offset
 * The total offset of start of the source code for the node from the start of the file.
 *
 * @param line
 * The line where the start of the source code for the node is located.
 *
 * @param column
 * The column where the start of the source code for the node is located.
 *
 * @param length
 * The length the source code for the node.
 */
data class SourceLocationS(
    override val target: Id<SmlAbstractObject>,
    val uriHash: String,
    val offset: Int,
    val line: Int,
    val column: Int,
    val length: Int
) :
    Relation("sourceLocationS", target, uriHash, offset, line, column, length) {
    override fun toString() = super.toString()
}
