package de.unibonn.simpleml.validation.codes

enum class WarningCode {

    // Deprecation
    AssignedDeclarationIsDeprecated,
    CorrespondingParameterIsDeprecated,
    CorrespondingTypeParameterIsDeprecated,
    ReferencedDeclarationIsDeprecated,

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
