package com.larsreimann.safeds.validation.codes

enum class WarningCode {

    // Deprecation
    AssignedDeclarationIsDeprecated,
    CorrespondingParameterIsDeprecated,
    CorrespondingTypeParameterIsDeprecated,
    ReferencedDeclarationIsDeprecated,

    // Experimental
    AssignedDeclarationIsExperimental,
    CorrespondingParameterIsExperimental,
    CorrespondingTypeParameterIsExperimental,
    ReferencedDeclarationIsExperimental,

    // Name conventions
    NameShouldBeLowerCamelCase,
    NameShouldBeUpperCamelCase,
    SegmentsShouldBeLowerCamelCase,

    // Unused declarations
    UnusedParameter,
    UnusedPlaceholder,

    // Other
    DuplicateTarget,
    ImplicitlyIgnoredResultOfCall,
    PlaceholderIsRenamingOfDeclaration,
    StatementDoesNothing,
}
