package com.larsreimann.safeds.scoping

import de.unibonn.simpleml.constant.SmlVisibility
import de.unibonn.simpleml.constant.visibility
import de.unibonn.simpleml.emf.classMembersOrEmpty
import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.emf.compilationUnitOrNull
import de.unibonn.simpleml.emf.containingCallableOrNull
import de.unibonn.simpleml.emf.containingClassOrNull
import de.unibonn.simpleml.emf.containingCompilationUnitOrNull
import de.unibonn.simpleml.emf.containingProtocolOrNull
import de.unibonn.simpleml.emf.isStatic
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.placeholdersOrEmpty
import de.unibonn.simpleml.emf.subtermsOrEmpty
import de.unibonn.simpleml.emf.typeParametersOrNull
import de.unibonn.simpleml.emf.variantsOrEmpty
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import de.unibonn.simpleml.simpleML.SimpleMLPackage
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsAbstractNamedTypeDeclaration
import com.larsreimann.safeds.safeDS.SdsAbstractProtocolToken
import com.larsreimann.safeds.safeDS.SdsAbstractStatement
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsArgumentList
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsBlock
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsConstraint
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsGoalReference
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsMemberType
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsProtocol
import com.larsreimann.safeds.safeDS.SdsProtocolReference
import com.larsreimann.safeds.safeDS.SdsProtocolSubterm
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeArgumentList
import com.larsreimann.safeds.safeDS.SdsTypeParameterConstraintGoal
import com.larsreimann.safeds.safeDS.SdsWorkflow
import com.larsreimann.safeds.safeDS.SdsYield
import de.unibonn.simpleml.staticAnalysis.classHierarchy.superClassMembers
import de.unibonn.simpleml.staticAnalysis.linking.parametersOrNull
import de.unibonn.simpleml.staticAnalysis.linking.typeParametersOrNull
import de.unibonn.simpleml.staticAnalysis.resultsOrNull
import de.unibonn.simpleml.staticAnalysis.typing.ClassType
import de.unibonn.simpleml.staticAnalysis.typing.EnumType
import de.unibonn.simpleml.staticAnalysis.typing.EnumVariantType
import de.unibonn.simpleml.staticAnalysis.typing.NamedType
import de.unibonn.simpleml.staticAnalysis.typing.type
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.EReference
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.naming.QualifiedName
import org.eclipse.xtext.resource.IEObjectDescription
import org.eclipse.xtext.scoping.IScope
import org.eclipse.xtext.scoping.Scopes
import org.eclipse.xtext.scoping.impl.FilteringScope

/**
 * This class contains custom scoping description.
 *
 * See https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#scoping
 * on how and when to use it.
 */
class SafeSDScopeProvider : AbstractSimpleMLScopeProvider() {

    override fun getScope(context: EObject, reference: EReference): IScope {
        return when (context) {
            is SmlArgument -> scopeForArgumentParameter(context)
            is SmlGoalReference -> scopeForGoalReferenceDeclaration(context)
            is SmlNamedType -> scopeForNamedTypeDeclaration(context)
            is SmlProtocolReference -> scopeForProtocolReferenceToken(context)
            is SmlReference -> scopeForReferenceDeclaration(context)
            is SmlTypeArgument -> scopeForTypeArgumentTypeParameter(context)
            is SmlTypeParameterConstraintGoal -> scopeForTypeParameterConstraintLeftOperand(context)
            is SmlAnnotationCall, is SmlYield -> {
                super.getScope(context, reference)
            }
            else -> IScope.NULLSCOPE
        }
    }

    private fun scopeForArgumentParameter(smlArgument: SmlArgument): IScope {
        val parameters = smlArgument
            .closestAncestorOrNull<SmlArgumentList>()
            ?.parametersOrNull()
            ?: emptyList()
        return Scopes.scopeFor(parameters)
    }

    private fun scopeForGoalReferenceDeclaration(context: SmlGoalReference): IScope {
        val resource = context.eResource()
        val packageName = context.containingCompilationUnitOrNull()?.qualifiedNameOrNull()

        // Declarations in other files
        var result: IScope = FilteringScope(
            super.delegateGetScope(context, SimpleMLPackage.Literals.SML_GOAL_REFERENCE__DECLARATION)
        ) {
            it.isReferencableExternalDeclaration(resource, packageName)
        }

        // Declarations in this file
        result = declarationsInSameFile(resource, result)

        // Declarations in this package
        return declarationsInSamePackageDeclaration(resource, result)
    }

    private fun scopeForReferenceDeclaration(context: SmlReference): IScope {
        val container = context.eContainer()
        return when {
            container is SmlMemberAccess && container.member == context -> scopeForMemberAccessDeclaration(container)
            else -> {
                val resource = context.eResource()
                val packageName = context.containingCompilationUnitOrNull()?.qualifiedNameOrNull()

                // Declarations in other files
                var result: IScope = FilteringScope(
                    super.delegateGetScope(context, SimpleMLPackage.Literals.SML_REFERENCE__DECLARATION)
                ) {
                    it.isReferencableExternalDeclaration(resource, packageName)
                }

                // Declarations in this file
                result = declarationsInSameFile(resource, result)

                // Declarations in this package
                result = declarationsInSamePackageDeclaration(resource, result)

                // Declarations in containing classes
                context.containingClassOrNull()?.let {
                    result = classMembers(it, result)
                }

                // Declarations in containing blocks
                localDeclarations(context, result)
            }
        }
    }

    /**
     * Removes declarations in this [Resource], [SmlAnnotation]s, and internal [SmlStep]s located in other
     * [SmlCompilationUnit]s.
     */
    private fun IEObjectDescription?.isReferencableExternalDeclaration(
        fromResource: Resource,
        fromPackageWithQualifiedName: QualifiedName?
    ): Boolean {

        // Resolution failed in delegate scope
        if (this == null) return false

        val obj = this.eObjectOrProxy

        // Local declarations are added later using custom scoping rules
        if (obj.eResource() == fromResource) return false

        // Annotations cannot be referenced
        if (obj is SmlAnnotation) return false

        // Internal steps in another package cannot be referenced
        return !(
            obj is SmlStep &&
                obj.visibility() == SmlVisibility.Internal &&
                obj.containingCompilationUnitOrNull()?.qualifiedNameOrNull() != fromPackageWithQualifiedName
            )
    }

    private fun scopeForMemberAccessDeclaration(context: SmlMemberAccess): IScope {
        val receiver = context.receiver

        // Static access
        val receiverDeclaration = when (receiver) {
            is SmlReference -> receiver.declaration
            is SmlMemberAccess -> receiver.member.declaration
            else -> null
        }
        if (receiverDeclaration != null) {
            when (receiverDeclaration) {
                is SmlClass -> {
                    val members = receiverDeclaration.classMembersOrEmpty().filter { it.isStatic() }
                    val superTypeMembers = receiverDeclaration.superClassMembers()
                        .filter { it.isStatic() }
                        .toList()

                    return Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers))
                }
                is SmlEnum -> {
                    return Scopes.scopeFor(receiverDeclaration.variantsOrEmpty())
                }
            }
        }

        // Call results
        var resultScope = IScope.NULLSCOPE
        if (receiver is SmlCall) {
            val results = receiver.resultsOrNull()
            when {
                results == null -> return IScope.NULLSCOPE
                results.size > 1 -> return Scopes.scopeFor(results)
                results.size == 1 -> resultScope = Scopes.scopeFor(results)
            }
        }

        // Members
        val type = (receiver.type() as? NamedType) ?: return resultScope

        return when {
            type.isNullable && !context.isNullSafe -> resultScope
            type is ClassType -> {
                val members = type.smlClass.classMembersOrEmpty().filter { !it.isStatic() }
                val superTypeMembers = type.smlClass.superClassMembers()
                    .filter { !it.isStatic() }
                    .toList()

                Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers, resultScope))
            }
            type is EnumVariantType -> Scopes.scopeFor(type.smlEnumVariant.parametersOrEmpty())
            else -> resultScope
        }
    }

    private fun declarationsInSameFile(resource: Resource, parentScope: IScope): IScope {
        if (resource.compilationUnitOrNull() != null) {
            return Scopes.scopeFor(
                emptyList(),
                parentScope
            )
        }

        val members = resource.compilationUnitOrNull()
            ?.members
            ?.filter { it !is SmlAnnotation && it !is SmlWorkflow }
            ?: emptyList()

        return Scopes.scopeFor(
            members,
            parentScope
        )
    }

    private fun declarationsInSamePackageDeclaration(resource: Resource, parentScope: IScope): IScope {
        val members = resource.compilationUnitOrNull()
            ?.members
            ?.filter { it !is SmlAnnotation && it !is SmlWorkflow }
            ?: emptyList()

        return Scopes.scopeFor(
            members,
            parentScope
        )
    }

    private fun classMembers(context: SmlClass, parentScope: IScope): IScope {
        return when (val containingClassOrNull = context.containingClassOrNull()) {
            is SmlClass -> Scopes.scopeFor(
                context.classMembersOrEmpty(),
                classMembers(containingClassOrNull, parentScope)
            )
            else -> Scopes.scopeFor(context.classMembersOrEmpty(), parentScope)
        }
    }

    private fun localDeclarations(context: EObject, parentScope: IScope): IScope {

        // Placeholders
        val placeholders = when (val containingStatement = context.closestAncestorOrNull<SmlAbstractStatement>()) {
            null -> emptyList()
            else ->
                containingStatement
                    .closestAncestorOrNull<SmlBlock>()
                    ?.placeholdersUpTo(containingStatement)
                    .orEmpty()
        }

        // Parameters
        val containingCallable = context.containingCallableOrNull()
        val parameters = containingCallable.parametersOrEmpty()

        // Local declarations
        val localDeclarations = placeholders + parameters

        return when (containingCallable) {

            // Lambdas can be nested
            is SmlAbstractLambda -> Scopes.scopeFor(
                localDeclarations,
                localDeclarations(containingCallable, parentScope)
            )
            else -> Scopes.scopeFor(localDeclarations, parentScope)
        }
    }

    private fun SmlBlock.placeholdersUpTo(containingStatement: SmlAbstractStatement): List<SmlPlaceholder> {
        return this.statements
            .takeWhile { it !== containingStatement }
            .filterIsInstance<SmlAssignment>()
            .flatMap { it.placeholdersOrEmpty() }
    }

    private fun scopeForNamedTypeDeclaration(context: SmlNamedType): IScope {
        val container = context.eContainer()
        return when {
            container is SmlMemberType && container.member == context -> scopeForMemberTypeDeclaration(container)
            else -> {
                super.getScope(context, SimpleMLPackage.Literals.SML_NAMED_TYPE__DECLARATION)
            }
        }
    }

    private fun scopeForMemberTypeDeclaration(context: SmlMemberType): IScope {
        val type = (context.receiver.type() as? NamedType) ?: return IScope.NULLSCOPE

        return when {
            type.isNullable -> IScope.NULLSCOPE
            type is ClassType -> {
                val members =
                    type.smlClass.classMembersOrEmpty().filterIsInstance<SmlAbstractNamedTypeDeclaration>()
                val superTypeMembers = type.smlClass.superClassMembers()
                    .filterIsInstance<SmlAbstractNamedTypeDeclaration>()
                    .toList()

                Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers))
            }
            type is EnumType -> Scopes.scopeFor(type.smlEnum.variantsOrEmpty())
            else -> IScope.NULLSCOPE
        }
    }

    private fun scopeForProtocolReferenceToken(context: SmlProtocolReference): IScope {
        val containingClass = context.containingClassOrNull() ?: return IScope.NULLSCOPE
        val containingProtocol = context.containingProtocolOrNull() ?: return IScope.NULLSCOPE
        val containingSubtermOrNull = context.closestAncestorOrNull<SmlProtocolSubterm>()

        // Own & inherited class members
        val members = containingClass.classMembersOrEmpty().filterIsInstance<SmlAbstractProtocolToken>()
        val superTypeMembers = containingClass.superClassMembers()
            .filterIsInstance<SmlAbstractProtocolToken>()
            .toList()

        val resultScope = Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers))

        // Subterms
        return Scopes.scopeFor(containingProtocol.subtermsUpTo(containingSubtermOrNull), resultScope)
    }

    private fun SmlProtocol.subtermsUpTo(containingSubtermOrNull: SmlProtocolSubterm?): List<SmlProtocolSubterm> {
        if (containingSubtermOrNull == null) {
            return this.subtermsOrEmpty()
        }

        return this.subtermsOrEmpty().takeWhile { it !== containingSubtermOrNull }
    }

    private fun scopeForTypeArgumentTypeParameter(smlTypeArgument: SmlTypeArgument): IScope {
        val typeParameters = smlTypeArgument
            .closestAncestorOrNull<SmlTypeArgumentList>()
            ?.typeParametersOrNull()
            ?: emptyList()

        return Scopes.scopeFor(typeParameters)
    }

    private fun scopeForTypeParameterConstraintLeftOperand(smlTypeParameterConstraintGoal: SmlTypeParameterConstraintGoal): IScope {
        val typeParameters = smlTypeParameterConstraintGoal
            .closestAncestorOrNull<SmlConstraint>()
            ?.typeParametersOrNull()
            ?: emptyList()

        return Scopes.scopeFor(typeParameters)
    }
}
