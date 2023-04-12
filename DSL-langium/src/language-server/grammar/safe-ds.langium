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

interface SdsDeclaration extends SdsAnnotatedObject, SdsObject {
    annotationCallList?: SdsAnnotationCallList
	name: string
}

interface SdsLocalVariable extends SdsDeclaration, SdsObject {}


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
    importedNamespace: string;
    alias?: SdsImportAlias;
}

SdsImport returns SdsImport:
    'import'
    importedNamespace=QualifiedNameWithWildcard
    alias=SdsImportAlias?
;

interface SdsImportAlias extends SdsObject {
    name: string;
}

SdsImportAlias returns SdsImportAlias:
    'as' name=ID
;

QualifiedNameWithWildcard returns string:
    ID ('.' ID)* ('.' '*')?
;

QualifiedName returns string:
    ID ('.' ID)*
;


// -----------------------------------------------------------------------------
// Declarations
// -----------------------------------------------------------------------------

interface SdsModuleMember extends SdsDeclaration, SdsObject {}

SdsAnnotatedModuleMember returns SdsAnnotatedObject:
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

      | {SdsStep.annotationCallList=current}
        SdsStepFragment
    )
;

SdsUnannotatedModuleMember returns SdsAnnotatedObject:
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

    | {SdsStep}
      SdsStepFragment
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
	members: SdsObject[]
}

SdsClassBody returns SdsClassBody:
    {SdsClassBody} '{' members+=SdsClassMember* '}'
;

interface SdsClassMember extends SdsDeclaration, SdsObject {}

SdsClassMember returns SdsObject:
    SdsAnnotatedClassMember 
  | SdsProtocol
;

SdsAnnotatedClassMember returns SdsAnnotatedObject:
    {SdsAnnotationCallList}
    annotationCalls+=SdsAnnotationCall*
    (
        {SdsAttribute.annotationCallList=current}
        SdsAttributeFragment

      | {SdsClass.annotationCallList=current}
        SdsClassFragment

      | {SdsEnum.annotationCallList=current}
        SdsEnumFragment

      | {SdsFunction.annotationCallList=current}
        static?='static'?
        SdsFunctionFragment
    )
;

interface SdsAttribute extends SdsClassMember, SdsProtocolToken {
	static: boolean
	^type?: SdsType
}

fragment SdsAttributeFragment:
    static?='static'?
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

interface SdsFunction extends SdsCallable, SdsClassMember, SdsModuleMember, SdsProtocolToken {
	static: boolean
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

interface SdsStep extends SdsCallable, SdsModuleMember {
	visibility?: string
	resultList?: SdsResultList
	body: SdsBlock
}

fragment SdsStepFragment:
    visibility=('internal' | 'private')?
    'step'
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
	annotation?: @SdsAnnotation
}

SdsAnnotationCall returns SdsAnnotationCall:
    '@' annotation=[SdsAnnotation:ID] argumentList=SdsAnnotationCallArgumentList?
;

SdsAnnotationCallArgumentList returns SdsArgumentList:
    {SdsArgumentList} '(' (arguments+=SdsAnnotationCallArgument  (',' arguments+=SdsAnnotationCallArgument  )* ','? )? ')'
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
	parameterList: SdsParameterList
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

interface SdsLambdaParameterList extends SdsExpression, SdsParameterList {}

SdsLambdaParameterList returns SdsParameterList:
    {SdsLambdaParameterList}
    '(' 
    (
        parameters+=SdsParameter
        (',' parameters+=SdsParameter)*
        ','? 
    )? 
    ')'
;

interface SdsParameter extends SdsLocalVariable {
	variadic: boolean
	^type?: SdsType
	defaultValue?: SdsExpression
}

SdsParameter returns SdsParameter:
    annotationCalls+=SdsAnnotationCall*
    variadic?='vararg'?
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

interface SdsAbstractResult extends SdsDeclaration, SdsObject {}

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
    assignees+=SdsAssignee  (',' assignees+=SdsAssignee  )* ','?
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
    SdsLambdaParameterList
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
    assignees+=SdsBlockLambdaAssignee  (',' assignees+=SdsBlockLambdaAssignee  )* ','?
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
    LESS_THAN | '<=' | '>=' | '>'
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

interface SdsCall extends SdsAbstractCall, SdsChainedExpression {
	typeArgumentList?: SdsTypeArgumentList
}

interface SdsIndexedAccess extends SdsChainedExpression {
	index: SdsExpression
}

interface SdsMemberAccess extends SdsChainedExpression {
	nullSafe: boolean
	member: SdsReference
}

SdsChainedExpression returns SdsExpression:
    SdsPrimaryExpression
    (
        {SdsCall.receiver=current}
        typeArgumentList=SdsCallTypeArgumentList?
        argumentList=SdsCallArgumentList

    | {SdsIndexedAccess.receiver=current}
        '[' index=SdsExpression ']'

    | {SdsMemberAccess.receiver=current}
        (nullSafe?='?')?
        '.'
        member=SdsReference*
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
    SdsLiteral
  | SdsParenthesizedExpression
  | SdsReference
  | SdsTemplateString
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

interface SdsNumber extends SdsLiteral, SdsExpression {}

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

interface SdsReference extends SdsExpression {
	declaration?: @SdsDeclaration
}

SdsReference returns SdsReference:
    declaration=[SdsDeclaration:ID]
;

interface SdsParenthesizedExpression extends SdsExpression {
	expression: SdsExpression
}

SdsParenthesizedExpression returns SdsParenthesizedExpression:
    '(' expression=SdsExpression  ')'
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

interface SdsTemplateStringPart extends SdsExpression, SdsLiteral {
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

interface SdsNamedTypeDeclaration extends SdsDeclaration, SdsObject {}

interface SdsMemberType extends SdsType {
	member: SdsNamedType
	receiver: SdsType
}

SdsType returns SdsType:
    SdsPrimaryType ({SdsMemberType.receiver=current} '.' member=SdsNamedType)*
;

SdsPrimaryType returns SdsType:
    SdsCallableType 
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

interface SdsNamedType extends SdsType {
	declaration: @SdsNamedTypeDeclaration
	typeArgumentList?: SdsTypeArgumentList
	nullable: boolean
}

SdsNamedType returns SdsNamedType:
    declaration=[SdsNamedTypeDeclaration:ID]
    typeArgumentList=SdsTypeArgumentList?
    (nullable?='?' )?
;

interface SdsUnionType extends SdsType {
	typeArgumentList: SdsTypeArgumentList
}

SdsUnionType returns SdsUnionType:
    'union' typeArgumentList=SdsUnionTypeArgumentList
;

SdsUnionTypeArgumentList returns SdsTypeArgumentList:
    {SdsTypeArgumentList}
    (LESS_THAN | CALL_TYPE_ARGUMENT_LIST_START)
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
    (LESS_THAN | CALL_TYPE_ARGUMENT_LIST_START)
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
    (LESS_THAN | CALL_TYPE_ARGUMENT_LIST_START)
    (typeArguments+=SdsTypeArgument (',' typeArguments+=SdsTypeArgument)* ','? )?
    '>'
;

SdsCallTypeArgumentList returns SdsTypeArgumentList:
    {SdsTypeArgumentList}
    CALL_TYPE_ARGUMENT_LIST_START
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

interface SdsStarProjection extends SdsTypeArgumentValue {}

interface SdsTypeProjection extends SdsTypeArgumentValue {
	variance?: string
	^type: SdsType
}

SdsTypeArgumentValue returns SdsTypeArgumentValue:
    {SdsStarProjection} '*'
  | {SdsTypeProjection} variance=SdsTypeParameterVariance? ^type=SdsType
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
    {SdsColumnList} '{' (columns+=SdsColumn  (',' columns+=SdsColumn  )* ','? )? '}'
;

interface SdsColumn extends SdsObject {
	columnName: SdsString
	columnType: SdsType
}

SdsColumn returns SdsColumn:
    columnName=SdsString ":" columnType=SdsType
;


// -----------------------------------------------------------------------------
// Behavior protocols
// -----------------------------------------------------------------------------

interface SdsProtocol extends SdsObject {
	body: SdsProtocolBody
}

SdsProtocol returns SdsProtocol:
    'protocol' body=SdsProtocolBody
;

interface SdsProtocolBody extends SdsObject {
	subtermList?: SdsProtocolSubtermList
	term?: SdsProtocolTerm
}

SdsProtocolBody returns SdsProtocolBody:
    {SdsProtocolBody}
    '{'
    subtermList=SdsProtocolSubtermList?
    term=SdsProtocolTerm?
    '}'
;

interface SdsProtocolSubtermList extends SdsObject {
	subterms: SdsProtocolSubterm[]
}

SdsProtocolSubtermList returns SdsProtocolSubtermList:
    subterms+=SdsProtocolSubterm+
;

interface SdsProtocolToken extends SdsDeclaration, SdsObject {}

interface SdsProtocolSubterm extends SdsProtocolToken {
	term?: SdsProtocolTerm
}

SdsProtocolSubterm returns SdsProtocolSubterm:
    'subterm'
    name=ID 
    '='
    term=SdsProtocolTerm
    ';'
;

interface SdsProtocolTerm extends SdsObject {}

SdsProtocolTerm returns SdsProtocolTerm:
    SdsProtocolAlternative
;

interface SdsProtocolAlternative extends SdsProtocolTerm {
	terms: SdsProtocolTerm[]
}

SdsProtocolAlternative returns SdsProtocolTerm:
    SdsProtocolSequence
    (
        {SdsProtocolAlternative.terms+=current}
        '|'
        terms+=SdsProtocolSequence
        ('|' terms+=SdsProtocolSequence)*
    )?
;

interface SdsProtocolSequence extends SdsProtocolTerm {
	terms: SdsProtocolTerm[]
}

SdsProtocolSequence returns SdsProtocolTerm:
    SdsProtocolQuantifiedTerm 
    (
        {SdsProtocolSequence.terms+=current}
        terms+=SdsProtocolQuantifiedTerm 
        (terms+=SdsProtocolQuantifiedTerm)*
    )?
;

interface SdsProtocolQuantifiedTerm extends SdsProtocolTerm {
	term: SdsProtocolTerm
	quantifier: string
}

SdsProtocolQuantifiedTerm returns SdsProtocolTerm:
    SdsProtocolPrimaryElement
    (
        {SdsProtocolQuantifiedTerm.term=current}
        quantifier=SdsProtocolQuantifier
    )?
;

SdsProtocolQuantifier returns string:
    '?' | '*' | '+'
;

SdsProtocolPrimaryElement returns SdsProtocolTerm:
    SdsProtocolComplement 
  | SdsProtocolReference
  | SdsProtocolTokenClass
  | SdsProtocolParenthesizedTerm
;

interface SdsProtocolComplement extends SdsProtocolTerm {
	universe?: SdsProtocolTokenClass
	referenceList?: SdsProtocolReferenceList
}

SdsProtocolComplement returns SdsProtocolComplement:
    {SdsProtocolComplement}
    '['
    universe=SdsProtocolTokenClass?
    '^'
    referenceList=SdsProtocolReferenceList?
    ']'
;

interface SdsProtocolReferenceList extends SdsProtocolTerm {
	references: SdsProtocolReference[]
}

SdsProtocolReferenceList returns SdsProtocolReferenceList:
    references+=SdsProtocolReference+
;

interface SdsProtocolReference extends SdsProtocolTerm {
	token: @SdsProtocolToken
}

SdsProtocolReference returns SdsProtocolReference:
    token=[SdsProtocolToken:ID]
;

interface SdsProtocolTokenClass extends SdsProtocolTerm {
	value: string
}

SdsProtocolTokenClass returns SdsProtocolTokenClass:
    value=SdsProtocolTokenClassValue
;

SdsProtocolTokenClassValue returns string:
    '.' | '\\a' | '\\f'
;

interface SdsProtocolParenthesizedTerm extends SdsProtocolTerm {
	term: SdsProtocolTerm
}

SdsProtocolParenthesizedTerm returns SdsProtocolParenthesizedTerm:
    '(' term=SdsProtocolTerm  ')'
;


// -----------------------------------------------------------------------------
// Terminals
// -----------------------------------------------------------------------------

terminal ID returns string: IDENTIFIER | '`' IDENTIFIER '`';
terminal fragment IDENTIFIER: /[_a-zA-Z][_a-zA-Z0-9]*/;

terminal FLOAT returns number: DECIMAL_DIGIT+ '.' DECIMAL_DIGIT+ FLOAT_EXPONENT? | DECIMAL_DIGIT+ FLOAT_EXPONENT;
terminal fragment DECIMAL_DIGIT: /[0-9]/;
terminal fragment FLOAT_EXPONENT: ('e' | 'E' )('+' | '-' )? DECIMAL_DIGIT+;
terminal INT returns number: DECIMAL_DIGIT+;
terminal STRING returns string: STRING_START STRING_TEXT* STRING_END;
terminal fragment STRING_START: STRING_DELIMITER;
terminal fragment STRING_END: '{'? STRING_DELIMITER;
terminal fragment STRING_DELIMITER: '"';
terminal fragment STRING_TEXT
    : '{'? ESCAPE_SEQUENCE
    |  /{?[^\\"{]/
;
terminal fragment ESCAPE_SEQUENCE: '\\' .;
terminal fragment TEMPLATE_EXPRESSION_START: '{{';
terminal fragment TEMPLATE_EXPRESSION_END: '}}';
terminal TEMPLATE_STRING_START returns string: STRING_START STRING_TEXT* TEMPLATE_EXPRESSION_START;
terminal TEMPLATE_STRING_INNER returns string: TEMPLATE_EXPRESSION_END STRING_TEXT* TEMPLATE_EXPRESSION_START;
terminal TEMPLATE_STRING_END returns string: TEMPLATE_EXPRESSION_END STRING_TEXT* STRING_END;

// Resolves the ambiguity between the less than operator (<) and the start of a type argument list of a call (<).
// See also: https://github.com/langium/langium/discussions/921#discussioncomment-4943180
terminal CALL_TYPE_ARGUMENT_LIST_START:
    '<' 
    (?=
        /\s*/
        (   '*'                                 // Star projection as positional type argument
        |   'in'                                // Contravariant type projection as positional type argument
        |   'out'                               // Covariant type projection as positional type argument
        |   'union'                             // Invariant union type as positional type argument
        |   '>'                                 // Empty type argument list
        |    ID /\s*/ 
            ( '='                               // Named type argument
            | ('.' /\s*/ ID /\s*/)* (',' | '>') // Invariant type projection as positional type argument
            )
        )
    )
;
terminal LESS_THAN:
    '<'
;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
hidden terminal TEST_MARKER: /[»«]/;
hidden terminal WS: /\s+/;
