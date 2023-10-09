grammar SafeDs

// -----------------------------------------------------------------------------
// Base interfaces
// -----------------------------------------------------------------------------

interface SdsObject {}

interface SdsAnnotatedObject extends SdsObject {
    annotationCalls?: SdsAnnotationCall[]
}

interface SdsAbstractCall extends SdsObject {
    argumentList: SdsArgumentList
}

interface SdsDeclaration extends SdsAnnotatedObject {
    annotationCallList?: SdsAnnotationCallList
    name: string
}

interface SdsLocalVariable extends SdsDeclaration {}


// -----------------------------------------------------------------------------
// Module
// -----------------------------------------------------------------------------

interface SdsModule extends SdsDeclaration {
    imports: SdsImport[];
    members: SdsAnnotatedObject[]
}

entry SdsModule returns SdsModule:
    {SdsModule}
    annotationCalls+=SdsAnnotationCall*
    (
        ('package' name=QualifiedName)
        imports+=SdsImport*
        members+=(SdsAnnotatedModuleMember | SdsUnannotatedModuleMember)*

    |   imports+=SdsImport+
        members+=(SdsAnnotatedModuleMember | SdsUnannotatedModuleMember)*

    |   members+=SdsUnannotatedModuleMember
        members+=(SdsAnnotatedModuleMember | SdsUnannotatedModuleMember)*
    )?
;

interface SdsImport extends SdsObject {
    package: string;
}

SdsImport returns SdsImport:
    SdsQualifiedImport
  | SdsWildcardImport
;


interface SdsQualifiedImport extends SdsImport {
    importedDeclarationList: SdsImportedDeclarationList;
}

SdsQualifiedImport returns SdsQualifiedImport:
    'from'
    package=QualifiedName
    'import'
    importedDeclarationList=SdsImportedDeclarationList
;

interface SdsImportedDeclarationList extends SdsObject {
    importedDeclarations: SdsImportedDeclaration[]
}

SdsImportedDeclarationList returns SdsImportedDeclarationList:
    importedDeclarations+=SdsImportedDeclaration (',' importedDeclarations+=SdsImportedDeclaration)* ','?
;

interface SdsImportedDeclaration extends SdsObject {
    declaration: @SdsModuleMember;
    alias?: string;
}

SdsImportedDeclaration returns SdsImportedDeclaration:
    declaration=[SdsModuleMember:ID] ('as' alias=ID)?
;

interface SdsWildcardImport extends SdsImport {}

SdsWildcardImport returns SdsWildcardImport:
    'from'
    package=QualifiedName
    'import'
    '*'
;

QualifiedName returns string:
    ID ('.' ID)*
;


// -----------------------------------------------------------------------------
// Declarations
// -----------------------------------------------------------------------------

interface SdsModuleMember extends SdsDeclaration {}

SdsAnnotatedModuleMember returns SdsModuleMember:
    {SdsAnnotationCallList}
    annotationCalls+=SdsAnnotationCall+
    (
        {SdsAnnotation.annotationCallList=current}
        SdsAnnotationFragment

      | {SdsClass.annotationCallList=current}
        SdsClassFragment

      | {SdsEnum.annotationCallList=current}
        SdsEnumFragment

      | {SdsFunction.annotationCallList=current}
        SdsFunctionFragment

      | {SdsSchema.annotationCallList=current}
        SdsSchemaFragment

      | {SdsPipeline.annotationCallList=current}
        SdsPipelineFragment

      | {SdsSegment.annotationCallList=current}
        SdsSegmentFragment
    )
;

SdsUnannotatedModuleMember returns SdsModuleMember:
      {SdsAnnotation}
      SdsAnnotationFragment

    | {SdsClass}
      SdsClassFragment

    | {SdsEnum}
      SdsEnumFragment

    | {SdsFunction}
      SdsFunctionFragment

    | {SdsSchema}
      SdsSchemaFragment

    | {SdsPipeline}
      SdsPipelineFragment

    | {SdsSegment}
      SdsSegmentFragment
;

interface SdsAnnotation extends SdsCallable, SdsModuleMember {
    constraintList?: SdsConstraintList
}

fragment SdsAnnotationFragment:
    'annotation' name=ID
    parameterList=SdsParameterList?
    constraintList=SdsConstraintList?
;

interface SdsClass extends SdsCallable, SdsClassMember, SdsModuleMember, SdsNamedTypeDeclaration {
    typeParameterList?: SdsTypeParameterList
    parentTypeList?: SdsParentTypeList
    constraintList?: SdsConstraintList
    body?: SdsClassBody
}

fragment SdsClassFragment:
    'class'
    name=ID
    typeParameterList=SdsTypeParameterList?
    parameterList=SdsParameterList?
    parentTypeList=SdsParentTypeList?
    constraintList=SdsConstraintList?
    body=SdsClassBody?
;

interface SdsParentTypeList extends SdsObject {
    parentTypes: SdsType[]
}

SdsParentTypeList returns SdsParentTypeList:
    'sub'
    parentTypes+=SdsParentType
    (',' parentTypes+=SdsParentType)*
    ','?
;

interface SdsClassBody extends SdsObject {
    members: SdsClassMember[]
}

SdsClassBody returns SdsClassBody:
    {SdsClassBody} '{' members+=SdsClassMember* '}'
;

interface SdsClassMember extends SdsDeclaration {}

SdsClassMember returns SdsClassMember:
    SdsAnnotatedClassMember
  | SdsUnannotatedClassMember
;

SdsAnnotatedClassMember returns SdsClassMember:
    {SdsAnnotationCallList}
    annotationCalls+=SdsAnnotationCall+
    (
        {SdsAttribute.annotationCallList=current}
        SdsAttributeFragment

      | {SdsClass.annotationCallList=current}
        SdsClassFragment

      | {SdsEnum.annotationCallList=current}
        SdsEnumFragment

      | {SdsFunction.annotationCallList=current}
        isStatic?='static'?
        SdsFunctionFragment
    )
;

SdsUnannotatedClassMember returns SdsClassMember:
      {SdsAttribute}
      SdsAttributeFragment

    | {SdsClass}
      SdsClassFragment

    | {SdsEnum}
      SdsEnumFragment

    | {SdsFunction}
      isStatic?='static'?
      SdsFunctionFragment
;

interface SdsAttribute extends SdsClassMember {
    isStatic: boolean
    ^type?: SdsType
}

fragment SdsAttributeFragment:
    isStatic?='static'?
    'attr'
    name=ID
    (':' ^type=SdsType)?
;

interface SdsEnum extends SdsNamedTypeDeclaration, SdsClassMember, SdsModuleMember {
    body?: SdsEnumBody
}

fragment SdsEnumFragment:
    'enum'
    name=ID
    body=SdsEnumBody?
;

interface SdsEnumBody extends SdsObject {
    variants: SdsEnumVariant[]
}

SdsEnumBody returns SdsEnumBody:
    {SdsEnumBody} '{' variants+=SdsEnumVariant * '}'
;

interface SdsEnumVariant extends SdsCallable, SdsNamedTypeDeclaration {
    typeParameterList?: SdsTypeParameterList
    constraintList?: SdsConstraintList
}

SdsEnumVariant returns SdsEnumVariant:
    annotationCalls+=SdsAnnotationCall*
    name=ID
    typeParameterList=SdsTypeParameterList?
    parameterList=SdsParameterList?
    constraintList=SdsConstraintList?
;

interface SdsFunction extends SdsCallable, SdsClassMember, SdsModuleMember {
    isStatic: boolean
    typeParameterList?: SdsTypeParameterList
    resultList?: SdsResultList
    constraintList?: SdsConstraintList
}

fragment SdsFunctionFragment:
    'fun'
    name=ID
    typeParameterList=SdsTypeParameterList?
    parameterList=SdsParameterList
    resultList=SdsResultList?
    constraintList=SdsConstraintList?
;

interface SdsPipeline extends SdsModuleMember {
    body: SdsBlock
}

fragment SdsPipelineFragment:
    'pipeline'
    name=ID
    body=SdsBlock
;

interface SdsSegment extends SdsCallable, SdsModuleMember {
    visibility?: string
    resultList?: SdsResultList
    body: SdsBlock
}

fragment SdsSegmentFragment:
    visibility=('internal' | 'private')?
    'segment'
    name=ID
    parameterList=SdsParameterList
    resultList=SdsResultList?
    body=SdsBlock
;


// -----------------------------------------------------------------------------
// Annotation calls
// -----------------------------------------------------------------------------

interface SdsAnnotationCallList extends SdsAnnotatedObject {}

interface SdsAnnotationCall extends SdsAbstractCall {
    annotation: @SdsAnnotation
}

SdsAnnotationCall returns SdsAnnotationCall:
    '@' annotation=[SdsAnnotation:ID] argumentList=SdsAnnotationCallArgumentList?
;

SdsAnnotationCallArgumentList returns SdsArgumentList:
    {SdsArgumentList} '(' (arguments+=SdsAnnotationCallArgument  (',' arguments+=SdsAnnotationCallArgument)* ','? )? ')'
;

SdsAnnotationCallArgument returns SdsArgument:
    (parameter=[SdsParameter:ID ] '=')? value=SdsExpression
;


// -----------------------------------------------------------------------------
// Constraints
// -----------------------------------------------------------------------------

interface SdsConstraintList extends SdsObject {
    constraints: SdsConstraint[]
}

SdsConstraintList returns SdsConstraintList:
    'where'
    '{'
    (
        constraints+=SdsConstraint
        (',' constraints+=SdsConstraint)*
        ','?
    )?
    '}'
;

interface SdsConstraint extends SdsObject {}

SdsConstraint returns SdsConstraint:
    SdsTypeParameterConstraint
;

interface SdsTypeParameterConstraint extends SdsConstraint {
    leftOperand: @SdsTypeParameter
    operator: string
    rightOperand: SdsType
}

SdsTypeParameterConstraint returns SdsTypeParameterConstraint:
    leftOperand=[SdsTypeParameter:ID]
    operator=SdsTypeParameterConstraintOperator
    rightOperand=SdsType
;

SdsTypeParameterConstraintOperator returns string:
    'sub' | 'super'
;


// -----------------------------------------------------------------------------
// Callables, parameters, and results
// -----------------------------------------------------------------------------

interface SdsCallable extends SdsObject {
    parameterList?: SdsParameterList
}

interface SdsParameterList extends SdsObject {
    parameters: SdsParameter[]
}

SdsParameterList returns SdsParameterList:
    {SdsParameterList}
    '('
    (
        parameters+=SdsParameter
        (',' parameters+=SdsParameter)*
        ','?
    )?
    ')'
;

interface SdsParameter extends SdsLocalVariable {
    isConstant: boolean
    isVariadic: boolean
    ^type?: SdsType
    defaultValue?: SdsExpression
}

SdsParameter returns SdsParameter:
    annotationCalls+=SdsAnnotationCall*
    (isConstant?='const' & isVariadic?='vararg')
    name=ID
    (':' ^type=SdsType)?
    ('=' defaultValue=SdsExpression)?
;

interface SdsResultList extends SdsObject {
    results: SdsResult[]
}

SdsResultList returns SdsResultList:
    {SdsResultList} '->' results+=SdsResult
  | {SdsResultList} '->' '(' (results+=SdsResult (',' results+=SdsResult)* ','? )? ')'
;

interface SdsAbstractResult extends SdsDeclaration {}

interface SdsResult extends SdsAbstractResult {
    ^type?: SdsType
}

SdsResult returns SdsResult:
    annotationCalls+=SdsAnnotationCall*
    name=ID
    (':' ^type=SdsType)?
;


// -----------------------------------------------------------------------------
// Statements
// -----------------------------------------------------------------------------

interface SdsStatement extends SdsObject {}

interface SdsBlock extends SdsObject {
    statements: SdsStatement[]
}

SdsBlock returns SdsBlock:
    {SdsBlock} '{' statements+=SdsStatement* '}'
;

SdsStatement returns SdsStatement:
    SdsAssignment
  | SdsExpressionStatement
;

interface SdsAssignment extends SdsStatement {
    assigneeList?: SdsAssigneeList
    expression?: SdsExpression
}

SdsAssignment returns SdsAssignment:
    assigneeList=SdsAssigneeList '=' expression=SdsExpression ';'
;

interface SdsAssigneeList extends SdsObject {
    assignees: SdsAssignee[]
}

SdsAssigneeList returns SdsAssigneeList:
    assignees+=SdsAssignee  (',' assignees+=SdsAssignee)* ','?
;

interface SdsAssignee extends SdsObject {}

interface SdsPlaceholder extends SdsAssignee, SdsLocalVariable {}

interface SdsWildcard extends SdsAssignee {}

interface SdsYield extends SdsAssignee {
    result?: @SdsResult
}

SdsAssignee returns SdsAssignee:
    {SdsPlaceholder} 'val' name=ID
  | {SdsWildcard} '_'
  | {SdsYield} 'yield' result=[SdsResult:ID]
;

interface SdsExpressionStatement extends SdsStatement {
    expression: SdsExpression
}

SdsExpressionStatement returns SdsExpressionStatement:
    expression=SdsExpression ';'
;


// -----------------------------------------------------------------------------
// Expressions
// -----------------------------------------------------------------------------

interface SdsExpression extends SdsObject {}

SdsExpression returns SdsExpression:
    SdsLambda | SdsOrExpression
;

interface SdsLambda extends SdsCallable, SdsExpression {}

interface SdsBlockLambda extends SdsLambda {
    body: SdsBlock
}

interface SdsExpressionLambda extends SdsLambda {
    result: SdsExpression
}

SdsLambda returns SdsExpression:
    SdsParameterList
    (
      {SdsBlockLambda.parameterList=current} body=SdsBlockLambdaBlock
    | {SdsExpressionLambda.parameterList=current} '->' result=SdsExpression
    )
;

SdsBlockLambdaBlock returns SdsBlock:
    {SdsBlock} '{' statements+=SdsBlockLambdaStatement* '}'
;

SdsBlockLambdaStatement returns SdsStatement:
    SdsBlockLambdaAssignment | SdsExpressionStatement
;

SdsBlockLambdaAssignment returns SdsAssignment:
    assigneeList=SdsBlockLambdaAssigneeList  '=' expression=SdsExpression  ';'
;

SdsBlockLambdaAssigneeList returns SdsAssigneeList:
    assignees+=SdsBlockLambdaAssignee  (',' assignees+=SdsBlockLambdaAssignee)* ','?
;

interface SdsBlockLambdaResult extends SdsAssignee, SdsAbstractResult {}

SdsBlockLambdaAssignee returns SdsAssignee:
    {SdsWildcard} '_'
  | {SdsPlaceholder} 'val' name=ID
  | {SdsBlockLambdaResult} 'yield' name=ID
;

interface SdsInfixOperation extends SdsExpression {
    leftOperand: SdsExpression
    operator: string
    rightOperand: SdsExpression
}

interface SdsPrefixOperation extends SdsExpression {
    operand: SdsExpression
    operator: string
}

SdsOrExpression returns SdsExpression:
    SdsAndExpression
    (
        {SdsInfixOperation.leftOperand=current}
        operator='or'
        rightOperand=SdsAndExpression
    )*
;

SdsAndExpression returns SdsExpression:
    SdsNotExpression
    (
        {SdsInfixOperation.leftOperand=current}
        operator='and'
        rightOperand=SdsNotExpression
    )*
;

SdsNotExpression returns SdsExpression:
    {SdsPrefixOperation} operator='not' operand=SdsNotExpression
  | SdsEqualityExpression
;

SdsEqualityExpression returns SdsExpression:
    SdsComparisonExpression
    (
        {SdsInfixOperation.leftOperand=current}
        operator=SdsEqualityOperator
        rightOperand=SdsComparisonExpression
    )?
;

SdsEqualityOperator returns string:
    '==' | '!=' | '===' | '!=='
;

SdsComparisonExpression returns SdsExpression:
    SdsAdditiveExpression
    (
        {SdsInfixOperation.leftOperand=current}
        operator=SdsComparisonOperator
        rightOperand=SdsAdditiveExpression
    )?
;

SdsComparisonOperator returns string:
    '<' | '<=' | '>=' | '>'
;

SdsAdditiveExpression returns SdsExpression:
    SdsMultiplicativeExpression
    (
        {SdsInfixOperation.leftOperand=current}
        operator=SdsAdditiveOperator
        rightOperand=SdsMultiplicativeExpression
    )*
;

SdsAdditiveOperator returns string:
    '+' | '-'
;

SdsMultiplicativeExpression returns SdsExpression:
    SdsElvisExpression
    (
        {SdsInfixOperation.leftOperand=current}
        operator=SdsMultiplicativeOperator
        rightOperand=SdsElvisExpression
    )*
;

SdsMultiplicativeOperator returns string:
    '*' | '/'
;

SdsElvisExpression returns SdsExpression:
    SdsUnaryOperation
    (
        {SdsInfixOperation.leftOperand=current}
        operator='?:'
        rightOperand=SdsUnaryOperation
    )*
;

SdsUnaryOperation returns SdsExpression:
    {SdsPrefixOperation} operator='-' operand=SdsUnaryOperation
  | SdsChainedExpression
;

interface SdsChainedExpression extends SdsExpression {
    receiver: SdsExpression
}

interface SdsCall extends SdsAbstractCall, SdsChainedExpression {}

interface SdsIndexedAccess extends SdsChainedExpression {
    index: SdsExpression
}

interface SdsMemberAccess extends SdsChainedExpression {
    isNullSafe: boolean
    member: SdsReference
}

SdsChainedExpression returns SdsExpression:
    SdsPrimaryExpression
    (
        {SdsCall.receiver=current}
        argumentList=SdsCallArgumentList

    |   {SdsIndexedAccess.receiver=current}
        '[' index=SdsExpression ']'

    |   {SdsMemberAccess.receiver=current}
        (isNullSafe?='?')?
        '.'
        member=SdsReference
    )*
;

interface SdsArgumentList extends SdsObject {
    arguments: SdsArgument[]
}

SdsCallArgumentList returns SdsArgumentList:
    {SdsArgumentList}
    '('
    (
        arguments+=SdsCallArgument
        (',' arguments+=SdsCallArgument)*
        ','?
    )?
    ')'
;

interface SdsArgument extends SdsExpression {
    parameter?: @SdsParameter
    value: SdsExpression
}

SdsCallArgument returns SdsArgument:
    (parameter=[SdsParameter:ID] '=')? value=SdsExpression
;

SdsPrimaryExpression returns SdsExpression:
    SdsList
  | SdsLiteral
  | SdsMap
  | SdsParenthesizedExpression
  | SdsReference
  | SdsTemplateString
;

interface SdsList extends SdsExpression {
    elements: SdsExpression[]
}

SdsList returns SdsList:
    {SdsList} '[' (elements+=SdsExpression (',' elements+=SdsExpression)* ','? )? ']'
;

interface SdsLiteral extends SdsExpression {}

SdsLiteral returns SdsLiteral:
    SdsBoolean
  | SdsFloat
  | SdsInt
  | SdsNull
  | SdsString
;

interface SdsBoolean extends SdsLiteral {
    value: boolean
}

SdsBoolean returns SdsBoolean:
    value?='true'
  | {SdsBoolean} 'false'
;

interface SdsNumber extends SdsLiteral {}

interface SdsFloat extends SdsNumber {
    value: number
}

SdsFloat returns SdsFloat:
    value=FLOAT
;

interface SdsInt extends SdsNumber {
    value: number
}

SdsInt returns SdsInt:
    value=INT
;

interface SdsNull extends SdsLiteral {}

SdsNull returns SdsNull:
    {SdsNull} 'null'
;

interface SdsString extends SdsLiteral {
    value: string
}

SdsString returns SdsString:
    value=STRING
;

interface SdsMap extends SdsExpression {
    entries: SdsMapEntry[]
}

SdsMap returns SdsMap:
    {SdsMap} '{' (entries+=SdsMapEntry (',' entries+=SdsMapEntry)* ','? )? '}'
;

interface SdsMapEntry extends SdsObject {
    key: SdsExpression
    value: SdsExpression
}

SdsMapEntry returns SdsMapEntry:
    key=SdsExpression ':' value=SdsExpression
;

interface SdsParenthesizedExpression extends SdsExpression {
    expression: SdsExpression
}

SdsParenthesizedExpression returns SdsParenthesizedExpression:
    '(' expression=SdsExpression  ')'
;

interface SdsReference extends SdsExpression {
    target: @SdsDeclaration
}

SdsReference returns SdsReference:
    target=[SdsDeclaration:ID]
;

interface SdsTemplateString extends SdsExpression {
    expressions: SdsExpression[]
}

SdsTemplateString returns SdsTemplateString:
    expressions+=SdsTemplateStringStart
    expressions+=SdsExpression?
    (expressions+=SdsTemplateStringInner expressions+=SdsExpression?)*
    expressions+=SdsTemplateStringEnd
;

interface SdsTemplateStringPart extends SdsLiteral {
    value: string
}

interface SdsTemplateStringStart extends SdsTemplateStringPart {}

SdsTemplateStringStart returns SdsExpression:
    {SdsTemplateStringStart}
    value=TEMPLATE_STRING_START
;

interface SdsTemplateStringInner extends SdsTemplateStringPart {}

SdsTemplateStringInner returns SdsExpression:
    {SdsTemplateStringInner}
    value=TEMPLATE_STRING_INNER
;

interface SdsTemplateStringEnd extends SdsTemplateStringPart {}

SdsTemplateStringEnd returns SdsExpression:
    {SdsTemplateStringEnd}
    value=TEMPLATE_STRING_END
;


// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SdsType extends SdsObject {}

interface SdsNamedTypeDeclaration extends SdsDeclaration {}

interface SdsMemberType extends SdsType {
    member: SdsNamedType
    receiver: SdsType
}

SdsType returns SdsType:
    SdsPrimaryType ({SdsMemberType.receiver=current} '.' member=SdsNamedType)*
;

SdsPrimaryType returns SdsType:
    SdsCallableType
  | SdsLiteralType
  | SdsNamedType
  | SdsUnionType
;

interface SdsCallableType extends SdsCallable, SdsType {
    resultList: SdsResultList
}

SdsCallableType returns SdsCallableType:
    parameterList=SdsParameterList
    resultList=SdsResultList
;

interface SdsLiteralType extends SdsType {
    literalList: SdsLiteralList
}

SdsLiteralType returns SdsLiteralType:
    'literal' literalList=SdsLiteralList
;

interface SdsLiteralList extends SdsObject {
    literals: SdsLiteral[]
}

SdsLiteralList returns SdsLiteralList:
    {SdsLiteralList}
    '<'
    (
        literals+=SdsLiteral
        (',' literals+=SdsLiteral)*
        ','?
    )?
    '>'
;

interface SdsNamedType extends SdsType {
    declaration: @SdsNamedTypeDeclaration
    typeArgumentList?: SdsTypeArgumentList
    isNullable: boolean
}

SdsNamedType returns SdsNamedType:
    declaration=[SdsNamedTypeDeclaration:ID]
    typeArgumentList=SdsTypeArgumentList?
    (isNullable?='?' )?
;

interface SdsUnionType extends SdsType {
    typeArgumentList: SdsTypeArgumentList
}

SdsUnionType returns SdsUnionType:
    'union' typeArgumentList=SdsUnionTypeArgumentList
;

SdsUnionTypeArgumentList returns SdsTypeArgumentList:
    {SdsTypeArgumentList}
    '<'
    (
        typeArguments+=SdsUnionTypeArgument
        (',' typeArguments+=SdsUnionTypeArgument)*
        ','?
    )?
    '>'
;

SdsUnionTypeArgument returns SdsTypeArgument:
    value=SdsUnionTypeArgumentValue
;

SdsUnionTypeArgumentValue returns SdsTypeArgumentValue:
    {SdsTypeProjection} ^type=SdsType
;

SdsParentType returns SdsType:
    SdsNamedType ({SdsMemberType.receiver=current} '.' member=SdsNamedType)*
;

interface SdsTypeParameterList extends SdsObject {
    typeParameters: SdsTypeParameter[]
}

SdsTypeParameterList returns SdsTypeParameterList:
    {SdsTypeParameterList}
    '<'
        (
            typeParameters+=SdsTypeParameter
            (',' typeParameters+=SdsTypeParameter)*
            ','?
        )?
    '>'
;

interface SdsTypeParameter extends SdsNamedTypeDeclaration {
    variance?: string
}

SdsTypeParameter returns SdsTypeParameter:
    annotationCalls+=SdsAnnotationCall*
    variance=SdsTypeParameterVariance?
    name=ID
;

SdsTypeParameterVariance returns string:
    'in' | 'out'
;

interface SdsTypeArgumentList extends SdsObject {
    typeArguments: SdsTypeArgument[]
}

SdsTypeArgumentList returns SdsTypeArgumentList:
    {SdsTypeArgumentList}
    '<'
    (typeArguments+=SdsTypeArgument (',' typeArguments+=SdsTypeArgument)* ','? )?
    '>'
;

interface SdsTypeArgument extends SdsObject {
    typeParameter?: @SdsTypeParameter
    value: SdsTypeArgumentValue
}

SdsTypeArgument returns SdsTypeArgument:
    (typeParameter=[SdsTypeParameter:ID] '=' )?
    value=SdsTypeArgumentValue
;

interface SdsTypeArgumentValue extends SdsObject {}

interface SdsTypeProjection extends SdsTypeArgumentValue {
    ^type: SdsType
}

SdsTypeArgumentValue returns SdsTypeArgumentValue:
    {SdsTypeProjection} ^type=SdsType
;


// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------

interface SdsSchema extends SdsModuleMember {
    columnList: SdsColumnList
}

fragment SdsSchemaFragment:
    'schema'
    name=ID
    columnList=SdsColumnList
;

interface SdsColumnList extends SdsObject {
    columns: SdsColumn[]
}

SdsColumnList returns SdsColumnList:
    {SdsColumnList} '{' (columns+=SdsColumn  (',' columns+=SdsColumn)* ','? )? '}'
;

interface SdsColumn extends SdsObject {
    columnName: SdsString
    columnType: SdsType
}

SdsColumn returns SdsColumn:
    columnName=SdsString ":" columnType=SdsType
;


// -----------------------------------------------------------------------------
// Terminals
// -----------------------------------------------------------------------------

terminal ID returns string: IDENTIFIER | '`' IDENTIFIER '`';
terminal fragment IDENTIFIER: /[_a-zA-Z][_a-zA-Z0-9]*/;

terminal FLOAT returns number
    : DECIMAL_DIGIT+ '.' DECIMAL_DIGIT+ FLOAT_EXPONENT?
    | DECIMAL_DIGIT+ FLOAT_EXPONENT;
terminal fragment DECIMAL_DIGIT: /[0-9]/;
terminal fragment FLOAT_EXPONENT: ('e' | 'E' )('+' | '-' )? DECIMAL_DIGIT+;
terminal INT returns number: DECIMAL_DIGIT+;
terminal STRING returns string: STRING_START STRING_TEXT* STRING_END;
terminal fragment STRING_START: STRING_DELIMITER;
terminal fragment STRING_END: '{'? STRING_DELIMITER;
terminal fragment STRING_DELIMITER: '"';
terminal fragment STRING_TEXT
    : '{'? ESCAPE_SEQUENCE
    | /{?[^\\"{]/
;
terminal fragment ESCAPE_SEQUENCE: '\\' .;
terminal fragment TEMPLATE_EXPRESSION_START: '{{';
terminal fragment TEMPLATE_EXPRESSION_END: '}}';
terminal TEMPLATE_STRING_START returns string: STRING_START STRING_TEXT* TEMPLATE_EXPRESSION_START;
terminal TEMPLATE_STRING_INNER returns string: TEMPLATE_EXPRESSION_END STRING_TEXT* TEMPLATE_EXPRESSION_START;
terminal TEMPLATE_STRING_END returns string: TEMPLATE_EXPRESSION_END STRING_TEXT* STRING_END;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
hidden terminal TEST_MARKER: /[»«]/;
hidden terminal WS: /\s+/;
