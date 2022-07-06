package com.larsreimann.safeds.validation

import com.larsreimann.safeds.validation.declarations.AnnotationChecker
import com.larsreimann.safeds.validation.declarations.AttributeChecker
import com.larsreimann.safeds.validation.declarations.ClassChecker
import com.larsreimann.safeds.validation.declarations.CompilationUnitChecker
import com.larsreimann.safeds.validation.declarations.DeclarationChecker
import com.larsreimann.safeds.validation.declarations.EnumChecker
import com.larsreimann.safeds.validation.declarations.EnumVariantChecker
import com.larsreimann.safeds.validation.declarations.FunctionChecker
import com.larsreimann.safeds.validation.declarations.ImportChecker
import com.larsreimann.safeds.validation.declarations.NameConventionChecker
import com.larsreimann.safeds.validation.declarations.ParameterChecker
import com.larsreimann.safeds.validation.declarations.ParameterListChecker
import com.larsreimann.safeds.validation.declarations.PlaceholderChecker
import com.larsreimann.safeds.validation.declarations.ResultChecker
import com.larsreimann.safeds.validation.declarations.StepChecker
import com.larsreimann.safeds.validation.declarations.TypeParameterChecker
import com.larsreimann.safeds.validation.declarations.WorkflowChecker
import com.larsreimann.safeds.validation.expressions.ArgumentChecker
import com.larsreimann.safeds.validation.expressions.CallChecker
import com.larsreimann.safeds.validation.expressions.InfixOperationChecker
import com.larsreimann.safeds.validation.expressions.LambdaChecker
import com.larsreimann.safeds.validation.expressions.MemberAccessChecker
import com.larsreimann.safeds.validation.expressions.ReferenceChecker
import com.larsreimann.safeds.validation.expressions.TemplateStringChecker
import com.larsreimann.safeds.validation.other.AnnotationCallChecker
import com.larsreimann.safeds.validation.other.ArgumentListChecker
import com.larsreimann.safeds.validation.other.DeprecationChecker
import com.larsreimann.safeds.validation.other.ProtocolChecker
import com.larsreimann.safeds.validation.other.TypeArgumentListChecker
import com.larsreimann.safeds.validation.statements.AssignmentChecker
import com.larsreimann.safeds.validation.statements.ExpressionsStatementChecker
import com.larsreimann.safeds.validation.typeChecking.ArgumentTypeChecker
import com.larsreimann.safeds.validation.typeChecking.DefaultValueTypeChecker
import com.larsreimann.safeds.validation.typeChecking.GoalArgumentTypeChecker
import com.larsreimann.safeds.validation.typeChecking.IndexedAccessTypeChecker
import com.larsreimann.safeds.validation.typeChecking.InfixOperationTypeChecker
import com.larsreimann.safeds.validation.typeChecking.PrefixOperationTypeChecker
import com.larsreimann.safeds.validation.typeChecking.YieldTypeChecker
import com.larsreimann.safeds.validation.types.CallableTypeChecker
import com.larsreimann.safeds.validation.types.NamedTypeChecker
import com.larsreimann.safeds.validation.types.UnionTypeChecker
import org.eclipse.xtext.validation.ComposedChecks

/**
 * This class contains custom validation rules.
 *
 * See https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#validation
 */
@ComposedChecks(
    validators = [

        // Declarations
        AnnotationChecker::class,
        AttributeChecker::class,
        ClassChecker::class,
        CompilationUnitChecker::class,
        DeclarationChecker::class,
        EnumChecker::class,
        EnumVariantChecker::class,
        FunctionChecker::class,
        ImportChecker::class,
        ParameterChecker::class,
        ParameterListChecker::class,
        PlaceholderChecker::class,
        ResultChecker::class,
        WorkflowChecker::class,
        StepChecker::class,
        TypeParameterChecker::class,

        NameConventionChecker::class,

        // Expressions
        ArgumentChecker::class,
        CallChecker::class,
        InfixOperationChecker::class,
        LambdaChecker::class,
        MemberAccessChecker::class,
        ReferenceChecker::class,
        TemplateStringChecker::class,

        // Statements
        AssignmentChecker::class,
        ExpressionsStatementChecker::class,

        // Type Checking
        ArgumentTypeChecker::class,
        DefaultValueTypeChecker::class,
        GoalArgumentTypeChecker::class,
        IndexedAccessTypeChecker::class,
        InfixOperationTypeChecker::class,
        PrefixOperationTypeChecker::class,
        YieldTypeChecker::class,

        // Types
        CallableTypeChecker::class,
        NamedTypeChecker::class,
        UnionTypeChecker::class,

        // Other
        AnnotationCallChecker::class,
        ArgumentListChecker::class,
        DeprecationChecker::class,
        ProtocolChecker::class,
        TypeArgumentListChecker::class,
    ]
)
class SafeDSValidator : AbstractSafeDSValidator()
