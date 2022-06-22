package com.larsreimann.safeds.validation.codes

enum class ErrorCode {
    AttributeMustHaveType,
    ParameterMustHaveType,
    ResultMustHaveType,

    CLASS_MUST_HAVE_UNIQUE_INHERITED_MEMBERS,
    CLASS_MUST_HAVE_UNIQUE_PARENT_TYPES,
    CLASS_MUST_INHERIT_ONLY_CLASSES,
    CLASS_MUST_NOT_BE_SUBTYPE_OF_ITSELF,
    REDECLARATION,

    FileMustDeclarePackage,
    StubFileMustNotDeclareWorkflowsSchemasOrSteps,
    WorkflowFileMustOnlyDeclareWorkflowsAndSteps,
    SchemaFileMustOnlyDeclareSchemas,

    ANNOTATION_IS_SINGLE_USE,
    DEPRECATED_REQUIRED_PARAMETER,

    UNRESOLVED_IMPORTED_NAMESPACE,
    WILDCARD_IMPORT_WITH_ALIAS,

    NoRequiredParametersAfterFirstOptionalParameter,
    NoMoreParametersAfterVariadicParameter,
    NoVariadicParameterAfterOptionalParameter,

    NO_YIELD_IN_WORKFLOW,

    CONTEXT_OF_CALL_WITHOUT_RESULTS,
    CONTEXT_OF_CALL_WITH_MANY_RESULTS,
    NO_RECURSION,
    RECEIVER_MUST_BE_CALLABLE,
    CALLED_CLASS_MUST_HAVE_CONSTRUCTOR,

    INSTANCE_METHOD_MUST_BE_CALLED,
    ENUM_VARIANT_MUST_BE_INSTANTIATED,

    MISSING_REQUIRED_PARAMETER,
    NO_POSITIONAL_ARGUMENTS_AFTER_FIRST_NAMED_ARGUMENT,
    TOO_MANY_ARGUMENTS,
    TooManyTypeArguments,
    UNIQUE_PARAMETERS,
    UniqueTypeParameters,

    MISSING_REQUIRED_TYPE_PARAMETER,
    NO_POSITIONAL_TYPE_ARGUMENTS_AFTER_FIRST_NAMED_TYPE_ARGUMENT,

    ASSIGNEE_WITHOUT_VALUE,

    MISSING_TYPE_ARGUMENT_LIST,

    UNION_TYPE_WITHOUT_TYPE_ARGUMENTS,

    NON_STATIC_PROPAGATES,
    PURE_PROPAGATES,
    STATIC_PROPAGATES,

    REDECLARATION_IN_OTHER_FILE,

    MISSING_ARGUMENT_LIST,
    WRONG_TARGET,

    OneProtocolPerClass,
    OnlyReferenceInstanceMembers,

    MissingTemplateExpression,

    MissingSafeAccess,

    UnassignedResult,
    DuplicateResultAssignment,
    MustBeConstant,

    MustNotStaticallyReferenceClass,
    MustNotStaticallyReferenceEnum,

    DivisionByZero,

    UnsupportedAnnotationParameterType,

    LambdaMustBeTypedArgumentOrYielded,

    NoOptionalParametersInCallableType,

    VariadicParametersMustNotHaveDefaultValue,
    VariadicParameterMustNotBeAssignedByName,

    BlockLambdaPrefix,

    WrongType,

    VarianceAndKind,

    ExpertMustBeOptional
}
