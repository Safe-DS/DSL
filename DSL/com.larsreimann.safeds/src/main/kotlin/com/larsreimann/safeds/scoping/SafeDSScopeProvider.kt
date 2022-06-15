package com.larsreimann.safeds.scoping

import com.larsreimann.safeds.constant.SdsVisibility
import com.larsreimann.safeds.constant.visibility
import com.larsreimann.safeds.emf.classMembersOrEmpty
import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.compilationUnitOrNull
import com.larsreimann.safeds.emf.containingCallableOrNull
import com.larsreimann.safeds.emf.containingClassOrNull
import com.larsreimann.safeds.emf.containingCompilationUnitOrNull
import com.larsreimann.safeds.emf.containingProtocolOrNull
import com.larsreimann.safeds.emf.isStatic
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.placeholdersOrEmpty
import com.larsreimann.safeds.emf.subtermsOrEmpty
import com.larsreimann.safeds.emf.typeParametersOrNull
import com.larsreimann.safeds.emf.variantsOrEmpty
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SafeDSPackage
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
import com.larsreimann.safeds.staticAnalysis.classHierarchy.superClassMembers
import com.larsreimann.safeds.staticAnalysis.linking.parametersOrNull
import com.larsreimann.safeds.staticAnalysis.linking.typeParametersOrNull
import com.larsreimann.safeds.staticAnalysis.resultsOrNull
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.EnumType
import com.larsreimann.safeds.staticAnalysis.typing.EnumVariantType
import com.larsreimann.safeds.staticAnalysis.typing.NamedType
import com.larsreimann.safeds.staticAnalysis.typing.type
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
class SafeSDScopeProvider : AbstractSafeDSScopeProvider() {

    override fun getScope(context: EObject, reference: EReference): IScope {
        return when (context) {
            is SdsArgument -> scopeForArgumentParameter(context)
            is SdsGoalReference -> scopeForGoalReferenceDeclaration(context)
            is SdsNamedType -> scopeForNamedTypeDeclaration(context)
            is SdsProtocolReference -> scopeForProtocolReferenceToken(context)
            is SdsReference -> scopeForReferenceDeclaration(context)
            is SdsTypeArgument -> scopeForTypeArgumentTypeParameter(context)
            is SdsTypeParameterConstraintGoal -> scopeForTypeParameterConstraintLeftOperand(context)
            is SdsAnnotationCall, is SdsYield -> {
                super.getScope(context, reference)
            }
            else -> IScope.NULLSCOPE
        }
    }

    private fun scopeForArgumentParameter(smlArgument: SdsArgument): IScope {
        val parameters = smlArgument
            .closestAncestorOrNull<SdsArgumentList>()
            ?.parametersOrNull()
            ?: emptyList()
        return Scopes.scopeFor(parameters)
    }

    private fun scopeForGoalReferenceDeclaration(context: SdsGoalReference): IScope {
        val resource = context.eResource()
        val packageName = context.containingCompilationUnitOrNull()?.qualifiedNameOrNull()

        // Declarations in other files
        var result: IScope = FilteringScope(
            super.delegateGetScope(context, SafeDSPackage.Literals.SDS_GOAL_REFERENCE__DECLARATION)
        ) {
            it.isReferencableExternalDeclaration(resource, packageName)
        }

        // Declarations in this file
        result = declarationsInSameFile(resource, result)

        // Declarations in this package
        return declarationsInSamePackageDeclaration(resource, result)
    }

    private fun scopeForReferenceDeclaration(context: SdsReference): IScope {
        val container = context.eContainer()
        return when {
            container is SdsMemberAccess && container.member == context -> scopeForMemberAccessDeclaration(container)
            else -> {
                val resource = context.eResource()
                val packageName = context.containingCompilationUnitOrNull()?.qualifiedNameOrNull()

                // Declarations in other files
                var result: IScope = FilteringScope(
                    super.delegateGetScope(context, SafeDSPackage.Literals.SDS_REFERENCE__DECLARATION)
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
     * Removes declarations in this [Resource], [SdsAnnotation]s, and internal [SdsStep]s located in other
     * [SdsCompilationUnit]s.
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
        if (obj is SdsAnnotation) return false

        // Internal steps in another package cannot be referenced
        return !(
            obj is SdsStep &&
                obj.visibility() == SdsVisibility.Internal &&
                obj.containingCompilationUnitOrNull()?.qualifiedNameOrNull() != fromPackageWithQualifiedName
            )
    }

    private fun scopeForMemberAccessDeclaration(context: SdsMemberAccess): IScope {
        val receiver = context.receiver

        // Static access
        val receiverDeclaration = when (receiver) {
            is SdsReference -> receiver.declaration
            is SdsMemberAccess -> receiver.member.declaration
            else -> null
        }
        if (receiverDeclaration != null) {
            when (receiverDeclaration) {
                is SdsClass -> {
                    val members = receiverDeclaration.classMembersOrEmpty().filter { it.isStatic() }
                    val superTypeMembers = receiverDeclaration.superClassMembers()
                        .filter { it.isStatic() }
                        .toList()

                    return Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers))
                }
                is SdsEnum -> {
                    return Scopes.scopeFor(receiverDeclaration.variantsOrEmpty())
                }
            }
        }

        // Call results
        var resultScope = IScope.NULLSCOPE
        if (receiver is SdsCall) {
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
            ?.filter { it !is SdsAnnotation && it !is SdsWorkflow }
            ?: emptyList()

        return Scopes.scopeFor(
            members,
            parentScope
        )
    }

    private fun declarationsInSamePackageDeclaration(resource: Resource, parentScope: IScope): IScope {
        val members = resource.compilationUnitOrNull()
            ?.members
            ?.filter { it !is SdsAnnotation && it !is SdsWorkflow }
            ?: emptyList()

        return Scopes.scopeFor(
            members,
            parentScope
        )
    }

    private fun classMembers(context: SdsClass, parentScope: IScope): IScope {
        return when (val containingClassOrNull = context.containingClassOrNull()) {
            is SdsClass -> Scopes.scopeFor(
                context.classMembersOrEmpty(),
                classMembers(containingClassOrNull, parentScope)
            )
            else -> Scopes.scopeFor(context.classMembersOrEmpty(), parentScope)
        }
    }

    private fun localDeclarations(context: EObject, parentScope: IScope): IScope {

        // Placeholders
        val placeholders = when (val containingStatement = context.closestAncestorOrNull<SdsAbstractStatement>()) {
            null -> emptyList()
            else ->
                containingStatement
                    .closestAncestorOrNull<SdsBlock>()
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
            is SdsAbstractLambda -> Scopes.scopeFor(
                localDeclarations,
                localDeclarations(containingCallable, parentScope)
            )
            else -> Scopes.scopeFor(localDeclarations, parentScope)
        }
    }

    private fun SdsBlock.placeholdersUpTo(containingStatement: SdsAbstractStatement): List<SdsPlaceholder> {
        return this.statements
            .takeWhile { it !== containingStatement }
            .filterIsInstance<SdsAssignment>()
            .flatMap { it.placeholdersOrEmpty() }
    }

    private fun scopeForNamedTypeDeclaration(context: SdsNamedType): IScope {
        val container = context.eContainer()
        return when {
            container is SdsMemberType && container.member == context -> scopeForMemberTypeDeclaration(container)
            else -> {
                super.getScope(context, SafeDSPackage.Literals.SDS_NAMED_TYPE__DECLARATION)
            }
        }
    }

    private fun scopeForMemberTypeDeclaration(context: SdsMemberType): IScope {
        val type = (context.receiver.type() as? NamedType) ?: return IScope.NULLSCOPE

        return when {
            type.isNullable -> IScope.NULLSCOPE
            type is ClassType -> {
                val members =
                    type.smlClass.classMembersOrEmpty().filterIsInstance<SdsAbstractNamedTypeDeclaration>()
                val superTypeMembers = type.smlClass.superClassMembers()
                    .filterIsInstance<SdsAbstractNamedTypeDeclaration>()
                    .toList()

                Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers))
            }
            type is EnumType -> Scopes.scopeFor(type.smlEnum.variantsOrEmpty())
            else -> IScope.NULLSCOPE
        }
    }

    private fun scopeForProtocolReferenceToken(context: SdsProtocolReference): IScope {
        val containingClass = context.containingClassOrNull() ?: return IScope.NULLSCOPE
        val containingProtocol = context.containingProtocolOrNull() ?: return IScope.NULLSCOPE
        val containingSubtermOrNull = context.closestAncestorOrNull<SdsProtocolSubterm>()

        // Own & inherited class members
        val members = containingClass.classMembersOrEmpty().filterIsInstance<SdsAbstractProtocolToken>()
        val superTypeMembers = containingClass.superClassMembers()
            .filterIsInstance<SdsAbstractProtocolToken>()
            .toList()

        val resultScope = Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers))

        // Subterms
        return Scopes.scopeFor(containingProtocol.subtermsUpTo(containingSubtermOrNull), resultScope)
    }

    private fun SdsProtocol.subtermsUpTo(containingSubtermOrNull: SdsProtocolSubterm?): List<SdsProtocolSubterm> {
        if (containingSubtermOrNull == null) {
            return this.subtermsOrEmpty()
        }

        return this.subtermsOrEmpty().takeWhile { it !== containingSubtermOrNull }
    }

    private fun scopeForTypeArgumentTypeParameter(smlTypeArgument: SdsTypeArgument): IScope {
        val typeParameters = smlTypeArgument
            .closestAncestorOrNull<SdsTypeArgumentList>()
            ?.typeParametersOrNull()
            ?: emptyList()

        return Scopes.scopeFor(typeParameters)
    }

    private fun scopeForTypeParameterConstraintLeftOperand(smlTypeParameterConstraintGoal: SdsTypeParameterConstraintGoal): IScope {
        val typeParameters = smlTypeParameterConstraintGoal
            .closestAncestorOrNull<SdsConstraint>()
            ?.typeParametersOrNull()
            ?: emptyList()

        return Scopes.scopeFor(typeParameters)
    }
}
