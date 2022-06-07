package de.unibonn.simpleml.validation.codes

enum class InfoCode {

    // Unnecessary syntax that can be simplified
    UnnecessaryAssignment,
    UnnecessaryArgumentList,
    UnnecessaryBody,
    UnnecessaryElvisOperator,
    UnnecessarySafeAccess,
    UnnecessaryParameterList,
    UnnecessaryResultList,
    UnnecessaryTypeArgumentList,
    UnnecessaryTypeParameterList,
    UnnecessaryUnionType,

    // Annotation calls
    IdenticalPythonModule,
    IdenticalPythonName,
    PureImpliesNoSideEffects
}
