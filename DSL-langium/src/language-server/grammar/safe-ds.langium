grammar SafeDs

// -----------------------------------------------------------------------------
// Base interfaces
// -----------------------------------------------------------------------------

interface SdsAbstractObject {}

interface SdsAbstractAnnotatedObject extends SdsAbstractObject {
    annotationCalls?: SdsAnnotationCall[]
}

interface SdsAbstractDeclaration extends SdsAbstractAnnotatedObject, SdsAbstractObject {
    annotationCallList?: SdsAnnotationCallList
	name?: string
}

interface SdsAbstractLocalVariable extends SdsAbstractDeclaration, SdsAbstractObject {}


// -----------------------------------------------------------------------------
// Module
// -----------------------------------------------------------------------------

interface SdsModule extends SdsAbstractDeclaration {
    imports: SdsImport[];
    members: SdsAbstractAnnotatedObject[]
}

entry SdsModule returns SdsModule:
    {SdsModule}
    annotationCalls+=SdsAnnotationCall*
    (
        ('package' name=QualifiedName)
        imports+=SdsImport*
        members+=SdsAnnotatedModuleMember*
    
    |   imports+=SdsImport+
        members+=SdsAnnotatedModuleMember*
     
    |   members+=SdsUnannotatedModuleMember
        members+=SdsAnnotatedModuleMember*
    )?
;

interface SdsImport extends SdsAbstractObject {
    importedNamespace: string;
    alias?: SdsImportAlias;
}

SdsImport returns SdsImport:
    'import'
    importedNamespace=QualifiedNameWithWildcard
    alias=SdsImportAlias?
;

interface SdsImportAlias extends SdsAbstractObject {
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

interface SdsAbstractModuleMember extends SdsAbstractDeclaration, SdsAbstractObject {}

SdsAnnotatedModuleMember returns SdsAbstractAnnotatedObject:
    {SdsAnnotationCallList} 
    annotationCalls+=SdsAnnotationCall*
    (
        {SdsAnnotation.annotationCallList=current}
        'annotation' name=ID
        parameterList=SdsParameterList?
        constraint=SdsConstraint?

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

SdsUnannotatedModuleMember returns SdsAbstractAnnotatedObject:
      {SdsAnnotation}
      'annotation' name=ID
      parameterList=SdsParameterList?
      constraint=SdsConstraint?

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

interface SdsClass extends SdsAbstractCallable, SdsAbstractClassMember, SdsAbstractModuleMember, SdsAbstractNamedTypeDeclaration {
	typeParameterList?: SdsTypeParameterList
	parentTypeList?: SdsParentTypeList
	body?: SdsClassBody
}

fragment SdsClassFragment:
    'class'
    name=ID
    typeParameterList=SdsTypeParameterList?
    parameterList=SdsParameterList?
    parentTypeList=SdsParentTypeList?
    body=SdsClassBody?
;

interface SdsParentTypeList extends SdsAbstractObject {
	parentTypes: SdsAbstractType[]
}

SdsParentTypeList returns SdsParentTypeList:
    'sub'
    parentTypes+=SdsParentType
    (',' parentTypes+=SdsParentType)*
    ','?
;

interface SdsClassBody extends SdsAbstractObject {
	members: SdsAbstractObject[]
}

SdsClassBody returns SdsClassBody:
    {SdsClassBody} '{' members+=SdsClassMember* '}'
;

interface SdsAbstractClassMember extends SdsAbstractDeclaration, SdsAbstractObject {}

SdsClassMember returns SdsAbstractObject:
    SdsAnnotatedClassMember 
  | SdsProtocol
  | SdsConstraint
;

SdsAnnotatedClassMember returns SdsAbstractAnnotatedObject:
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

interface SdsConstraint extends SdsAbstractObject {
	body: SdsBlock
}

SdsConstraint returns SdsConstraint:
    'constraint'
    body=SdsConstraintBlock
;

SdsConstraintBlock returns SdsBlock:
    {SdsBlock} 
    '{'
    (
        statements+=SdsConstraintStatement
        (',' statements+=SdsConstraintStatement)*
        ','?
    )?
    '}'
;

SdsConstraintStatement returns SdsAbstractStatement:
    SdsTypeParameterConstraint
;

interface SdsAttribute extends SdsAbstractClassMember, SdsAbstractProtocolToken {
	static: boolean
	^type?: SdsAbstractType
}

fragment SdsAttributeFragment:
    static?='static'?
    'attr'
    name=ID 
    (':' ^type=SdsType)?
;

interface SdsEnum extends SdsAbstractNamedTypeDeclaration, SdsAbstractClassMember, SdsAbstractModuleMember {
	body?: SdsEnumBody
}

fragment SdsEnumFragment:
    'enum'
    name=ID
    body=SdsEnumBody?
;

interface SdsEnumBody extends SdsAbstractObject {
	variants: SdsEnumVariant[]
}

SdsEnumBody returns SdsEnumBody:
    {SdsEnumBody} '{' variants+=SdsEnumVariant * '}'
;

interface SdsEnumVariant extends SdsAbstractCallable, SdsAbstractNamedTypeDeclaration {
	typeParameterList?: SdsTypeParameterList
	constraint?: SdsConstraint
}

SdsEnumVariant returns SdsEnumVariant:
    annotationCalls+=SdsAnnotationCall*
    name=ID
    typeParameterList=SdsTypeParameterList?
    parameterList=SdsParameterList?
    constraint=SdsConstraint?
;

interface SdsFunction extends SdsAbstractCallable, SdsAbstractClassMember, SdsAbstractModuleMember, SdsAbstractProtocolToken {
	static: boolean
	typeParameterList?: SdsTypeParameterList
	resultList?: SdsResultList
	body?: SdsFunctionBody
}

fragment SdsFunctionFragment:
    'fun'
    name=ID
    typeParameterList=SdsTypeParameterList?
    parameterList=SdsParameterList
    resultList=SdsResultList?
    body=SdsFunctionBody?
;

interface SdsFunctionBody extends SdsAbstractObject {
	statements: SdsAbstractObject[]
}

SdsFunctionBody returns SdsFunctionBody:
    {SdsFunctionBody} '{' statements+=SdsFunctionStatement* '}'
;

SdsFunctionStatement returns SdsAbstractObject:
    SdsConstraint
;

interface SdsPipeline extends SdsAbstractModuleMember {
	body: SdsBlock
}

fragment SdsPipelineFragment:
    'pipeline'
    name=ID
    body=SdsBlock
;

interface SdsStep extends SdsAbstractCallable, SdsAbstractModuleMember {
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
// Annotations
// -----------------------------------------------------------------------------

interface SdsAnnotationCallList extends SdsAbstractAnnotatedObject {}

interface SdsAnnotation extends SdsAbstractCallable, SdsAbstractModuleMember {
	constraint?: SdsConstraint
}

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
// Callables, parameters, and results
// -----------------------------------------------------------------------------

interface SdsAbstractCallable extends SdsAbstractObject {
	parameterList: SdsParameterList
}

interface SdsParameterList extends SdsAbstractObject {
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

interface SdsLambdaParameterList extends SdsAbstractExpression, SdsParameterList {}

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

interface SdsParameter extends SdsAbstractLocalVariable {
	variadic: boolean
	^type?: SdsAbstractType
	defaultValue?: SdsAbstractExpression
}

SdsParameter returns SdsParameter:
    annotationCalls+=SdsAnnotationCall*
    variadic?='vararg'?
    name=ID
    (':' ^type=SdsType)?
    ('=' defaultValue=SdsExpression)?
;

interface SdsResultList extends SdsAbstractObject {
	results: SdsResult[]
}

SdsResultList returns SdsResultList:
    {SdsResultList} '->' results+=SdsResult
  | {SdsResultList} '->' '(' (results+=SdsResult (',' results+=SdsResult)* ','? )? ')'
;

interface SdsAbstractResult extends SdsAbstractDeclaration, SdsAbstractObject {}

interface SdsResult extends SdsAbstractResult {
	^type?: SdsAbstractType
}

SdsResult returns SdsResult:
    annotationCalls+=SdsAnnotationCall*
    name=ID
    (':' ^type=SdsType)?
;


// -----------------------------------------------------------------------------
// Statements
// -----------------------------------------------------------------------------

interface SdsAbstractStatement extends SdsAbstractObject {}

interface SdsBlock extends SdsAbstractObject {
	statements: SdsAbstractStatement[]
}

SdsBlock returns SdsBlock:
    {SdsBlock} '{' statements+=SdsStatement* '}'
;

SdsStatement returns SdsAbstractStatement:
    SdsAssignment 
  | SdsExpressionStatement
;

interface SdsAssignment extends SdsAbstractStatement {
	assigneeList?: SdsAssigneeList
	expression?: SdsAbstractExpression
}

SdsAssignment returns SdsAssignment:
    assigneeList=SdsAssigneeList '=' expression=SdsExpression ';'
;

interface SdsAssigneeList extends SdsAbstractObject {
	assignees: SdsAbstractAssignee[]
}

SdsAssigneeList returns SdsAssigneeList:
    assignees+=SdsAssignee  (',' assignees+=SdsAssignee  )* ','?
;

interface SdsAbstractAssignee extends SdsAbstractObject {}

interface SdsPlaceholder extends SdsAbstractAssignee, SdsAbstractLocalVariable {}

interface SdsWildcard extends SdsAbstractAssignee {}

interface SdsYield extends SdsAbstractAssignee {
    result?: @SdsResult
}

SdsAssignee returns SdsAbstractAssignee:
    {SdsPlaceholder} 'val' name=ID
  | {SdsWildcard} '_'
  | {SdsYield} 'yield' result=[SdsResult:ID]
;

interface SdsExpressionStatement extends SdsAbstractStatement {
	expression: SdsAbstractExpression
}

SdsExpressionStatement returns SdsExpressionStatement:
    expression=SdsExpression ';'
;


// -----------------------------------------------------------------------------
// Expressions
// -----------------------------------------------------------------------------

interface SdsAbstractExpression extends SdsAbstractObject {}

SdsExpression returns SdsAbstractExpression:
    SdsLambda | SdsOrExpression
;

interface SdsAbstractLambda extends SdsAbstractCallable, SdsAbstractExpression {}

interface SdsBlockLambda extends SdsAbstractLambda {
	body: SdsBlock
}

interface SdsExpressionLambda extends SdsAbstractLambda {
	result: SdsAbstractExpression
}

SdsLambda returns SdsAbstractExpression:
    SdsLambdaParameterList
    (
      {SdsBlockLambda.parameterList=current} body=SdsBlockLambdaBlock
    | {SdsExpressionLambda.parameterList=current} '->' result=SdsExpression
    )
;

SdsBlockLambdaBlock returns SdsBlock:
    {SdsBlock} '{' statements+=SdsBlockLambdaStatement* '}'
;

SdsBlockLambdaStatement returns SdsAbstractStatement:
    SdsBlockLambdaAssignment | SdsExpressionStatement
;

SdsBlockLambdaAssignment returns SdsAssignment:
    assigneeList=SdsBlockLambdaAssigneeList  '=' expression=SdsExpression  ';'
;

SdsBlockLambdaAssigneeList returns SdsAssigneeList:
    assignees+=SdsBlockLambdaAssignee  (',' assignees+=SdsBlockLambdaAssignee  )* ','?
;

interface SdsBlockLambdaResult extends SdsAbstractAssignee, SdsAbstractResult {}

SdsBlockLambdaAssignee returns SdsAbstractAssignee:
    {SdsWildcard} '_'
  | {SdsPlaceholder} 'val' name=ID
  | {SdsBlockLambdaResult} 'yield' name=ID
;

interface SdsInfixOperation extends SdsAbstractExpression {
	leftOperand: SdsAbstractExpression
	operator: string
	rightOperand: SdsAbstractExpression
}

interface SdsPrefixOperation extends SdsAbstractExpression {
	operand: SdsAbstractExpression
	operator: string
}

SdsOrExpression returns SdsAbstractExpression:
    SdsAndExpression
    (
        {SdsInfixOperation.leftOperand=current}
        operator='or'
        rightOperand=SdsAndExpression
    )*
;

SdsAndExpression returns SdsAbstractExpression:
    SdsNotExpression
    (
        {SdsInfixOperation.leftOperand=current}
        operator='and'
        rightOperand=SdsNotExpression
    )*
;

SdsNotExpression returns SdsAbstractExpression:
    {SdsPrefixOperation} operator='not' operand=SdsNotExpression
  | SdsEqualityExpression
;

SdsEqualityExpression returns SdsAbstractExpression:
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

SdsComparisonExpression returns SdsAbstractExpression:
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

SdsAdditiveExpression returns SdsAbstractExpression:
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

SdsMultiplicativeExpression returns SdsAbstractExpression:
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

SdsElvisExpression returns SdsAbstractExpression:
    SdsUnaryOperation
    (
        {SdsInfixOperation.leftOperand=current}
        operator='?:'
        rightOperand=SdsUnaryOperation
    )*
;

SdsUnaryOperation returns SdsAbstractExpression:
    {SdsPrefixOperation} operator='-' operand=SdsUnaryOperation
  | SdsChainedExpression
;

interface SdsAbstractChainedExpression extends SdsAbstractExpression {
	receiver: SdsAbstractExpression
}

interface SdsAbstractCall extends SdsAbstractObject {
	argumentList: SdsArgumentList
}

interface SdsCall extends SdsAbstractCall, SdsAbstractChainedExpression {
	typeArgumentList?: SdsTypeArgumentList
}

interface SdsIndexedAccess extends SdsAbstractChainedExpression {
	index: SdsAbstractExpression
}

interface SdsMemberAccess extends SdsAbstractChainedExpression {
	nullSafe: boolean
	member: SdsReference
}

SdsChainedExpression returns SdsAbstractExpression:
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

interface SdsArgumentList extends SdsAbstractObject {
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

interface SdsArgument extends SdsAbstractExpression {
	parameter?: @SdsParameter
	value: SdsAbstractExpression
}

SdsCallArgument returns SdsArgument:
    (parameter=[SdsParameter:ID] '=')? value=SdsExpression
;

interface SdsSchemaReference extends SdsAbstractExpression {
	^type?: SdsSchemaType
}

SdsPrimaryExpression returns SdsAbstractExpression:
    SdsLiteral
  | SdsParenthesizedExpression
  | SdsReference
  | SdsTemplateString
  | {SdsSchemaReference} ^type=SdsSchemaType
;

interface SdsAbstractLiteral extends SdsAbstractExpression {}

SdsLiteral returns SdsAbstractLiteral:
    SdsBoolean
  | SdsFloat
  | SdsInt
  | SdsNull
  | SdsString
;

interface SdsBoolean extends SdsAbstractLiteral {
	value: boolean
}

SdsBoolean returns SdsBoolean:
    value?='true'
  | {SdsBoolean} 'false'
;

interface SdsAbstractNumber extends SdsAbstractLiteral, SdsAbstractExpression {}

interface SdsFloat extends SdsAbstractNumber {
	value: number
}

SdsFloat returns SdsFloat:
    value=FLOAT
;

interface SdsInt extends SdsAbstractNumber {
	value: number
}

SdsInt returns SdsInt:
    value=INT
;

interface SdsNull extends SdsAbstractLiteral {}

SdsNull returns SdsNull:
    {SdsNull} 'null'
;

interface SdsString extends SdsAbstractLiteral {
	value: string
}

SdsString returns SdsString:
    value=STRING
;

interface SdsReference extends SdsAbstractExpression {
	declaration?: @SdsAbstractDeclaration
}

SdsReference returns SdsReference:
    declaration=[SdsAbstractDeclaration:ID]
;

interface SdsParenthesizedExpression extends SdsAbstractExpression {
	expression: SdsAbstractExpression
}

SdsParenthesizedExpression returns SdsParenthesizedExpression:
    '(' expression=SdsExpression  ')'
;

interface SdsTemplateString extends SdsAbstractExpression {
	expressions: SdsAbstractExpression[]
}

SdsTemplateString returns SdsTemplateString:
    expressions+=SdsTemplateStringStart
    expressions+=SdsExpression?
    (expressions+=SdsTemplateStringInner expressions+=SdsExpression?)*
    expressions+=SdsTemplateStringEnd
;

interface SdsAbstractTemplateStringPart extends SdsAbstractExpression, SdsAbstractLiteral {
	value: string
}

interface SdsTemplateStringStart extends SdsAbstractTemplateStringPart {}

SdsTemplateStringStart returns SdsAbstractExpression:
    {SdsTemplateStringStart}
    value=TEMPLATE_STRING_START
;

interface SdsTemplateStringInner extends SdsAbstractTemplateStringPart {}

SdsTemplateStringInner returns SdsAbstractExpression:
    {SdsTemplateStringInner}
    value=TEMPLATE_STRING_INNER
;

interface SdsTemplateStringEnd extends SdsAbstractTemplateStringPart {}

SdsTemplateStringEnd returns SdsAbstractExpression:
    {SdsTemplateStringEnd}
    value=TEMPLATE_STRING_END
;


// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SdsAbstractType extends SdsAbstractObject {}

interface SdsAbstractNamedTypeDeclaration extends SdsAbstractDeclaration, SdsAbstractObject {}

interface SdsMemberType extends SdsAbstractType {
	member: SdsNamedType
	receiver: SdsAbstractType
}

SdsType returns SdsAbstractType:
    SdsPrimaryType ({SdsMemberType.receiver=current} '.' member=SdsNamedType)*
;

SdsPrimaryType returns SdsAbstractType:
    SdsCallableType 
  | SdsNamedType
  | SdsUnionType
;

interface SdsCallableType extends SdsAbstractCallable, SdsAbstractType {
	resultList: SdsResultList
}

SdsCallableType returns SdsCallableType:
    parameterList=SdsParameterList
    resultList=SdsResultList
;

interface SdsNamedType extends SdsAbstractType {
	declaration: @SdsAbstractNamedTypeDeclaration
	typeArgumentList?: SdsTypeArgumentList
	nullable: boolean
}

SdsNamedType returns SdsNamedType:
    declaration=[SdsAbstractNamedTypeDeclaration:ID]
    typeArgumentList=SdsTypeArgumentList?
    (nullable?='?' )?
;

interface SdsSchemaType extends SdsAbstractType {
	declaration: @SdsAbstractNamedTypeDeclaration
}

SdsSchemaType returns SdsSchemaType:
    '::' declaration=[SdsAbstractNamedTypeDeclaration:ID]
;

interface SdsUnionType extends SdsAbstractType {
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

SdsUnionTypeArgumentValue returns SdsAbstractTypeArgumentValue:
    {SdsTypeProjection} ^type=SdsType
;

SdsParentType returns SdsAbstractType:
    SdsNamedType ({SdsMemberType.receiver=current} '.' member=SdsNamedType)*
;

interface SdsTypeParameterList extends SdsAbstractObject {
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

interface SdsTypeParameter extends SdsAbstractNamedTypeDeclaration {
	variance?: string
	kind?: string
}

SdsTypeParameter returns SdsTypeParameter:
    annotationCalls+=SdsAnnotationCall*
    variance=SdsTypeParameterVariance?
    name=ID
    ('::' kind=SdsTypeParameterKind)?
;

SdsTypeParameterVariance returns string:
    'in' | 'out'
;

SdsTypeParameterKind returns string:
    '$SchemaType'
  | '$ExpressionType'
  | '$IntType'
  | '$FloatType'
  | '$BooleanType'
  | '$StringType'
  | '$NamedType'
;

interface SdsTypeParameterConstraint extends SdsAbstractStatement {
	leftOperand: @SdsTypeParameter
	operator: string
	rightOperand: SdsAbstractType
}

SdsTypeParameterConstraint returns SdsTypeParameterConstraint:
    leftOperand=[SdsTypeParameter:ID]
    operator=SdsTypeParameterConstraintOperator
    rightOperand=SdsType
;

SdsTypeParameterConstraintOperator returns string:
    'sub' | 'super'
;

interface SdsTypeArgumentList extends SdsAbstractObject {
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

interface SdsTypeArgument extends SdsAbstractObject {
	typeParameter?: @SdsTypeParameter
	value: SdsAbstractTypeArgumentValue
}

SdsTypeArgument returns SdsTypeArgument:
    (typeParameter=[SdsTypeParameter:ID] '=' )?
    value=SdsTypeArgumentValue
;

interface SdsAbstractTypeArgumentValue extends SdsAbstractObject {}

interface SdsStarProjection extends SdsAbstractTypeArgumentValue {}

interface SdsTypeProjection extends SdsAbstractTypeArgumentValue {
	variance?: string
	^type: SdsAbstractType
}

SdsTypeArgumentValue returns SdsAbstractTypeArgumentValue:
    {SdsStarProjection} '*'
  | {SdsTypeProjection} variance=SdsTypeParameterVariance? ^type=SdsType
;


// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------

interface SdsSchema extends SdsAbstractModuleMember {
	columnList: SdsColumnList
}

fragment SdsSchemaFragment:
    'schema'
    name=ID
    columnList=SdsColumnList
;

interface SdsColumnList extends SdsAbstractObject {
	columns: SdsColumn[]
}

SdsColumnList returns SdsColumnList:
    {SdsColumnList} '{' (columns+=SdsColumn  (',' columns+=SdsColumn  )* ','? )? '}'
;

interface SdsColumn extends SdsAbstractObject {
	columnName: SdsString
	columnType: SdsAbstractType
}

SdsColumn returns SdsColumn:
    columnName=SdsString ":" columnType=SdsType
;


// -----------------------------------------------------------------------------
// Behavior protocols
// -----------------------------------------------------------------------------

interface SdsProtocol extends SdsAbstractObject {
	body: SdsProtocolBody
}

SdsProtocol returns SdsProtocol:
    'protocol' body=SdsProtocolBody
;

interface SdsProtocolBody extends SdsAbstractObject {
	subtermList?: SdsProtocolSubtermList
	term?: SdsAbstractProtocolTerm
}

SdsProtocolBody returns SdsProtocolBody:
    {SdsProtocolBody}
    '{'
    subtermList=SdsProtocolSubtermList?
    term=SdsProtocolTerm?
    '}'
;

interface SdsProtocolSubtermList extends SdsAbstractObject {
	subterms: SdsProtocolSubterm[]
}

SdsProtocolSubtermList returns SdsProtocolSubtermList:
    subterms+=SdsProtocolSubterm+
;

interface SdsAbstractProtocolToken extends SdsAbstractDeclaration, SdsAbstractObject {}

interface SdsProtocolSubterm extends SdsAbstractProtocolToken {
	term?: SdsAbstractProtocolTerm
}

SdsProtocolSubterm returns SdsProtocolSubterm:
    'subterm'
    name=ID 
    '='
    term=SdsProtocolTerm
    ';'
;

interface SdsAbstractProtocolTerm extends SdsAbstractObject {}

SdsProtocolTerm returns SdsAbstractProtocolTerm:
    SdsProtocolAlternative
;

interface SdsProtocolAlternative extends SdsAbstractProtocolTerm {
	terms: SdsAbstractProtocolTerm[]
}

SdsProtocolAlternative returns SdsAbstractProtocolTerm:
    SdsProtocolSequence
    (
        {SdsProtocolAlternative.terms+=current}
        '|'
        terms+=SdsProtocolSequence
        ('|' terms+=SdsProtocolSequence)*
    )?
;

interface SdsProtocolSequence extends SdsAbstractProtocolTerm {
	terms: SdsAbstractProtocolTerm[]
}

SdsProtocolSequence returns SdsAbstractProtocolTerm:
    SdsProtocolQuantifiedTerm 
    (
        {SdsProtocolSequence.terms+=current}
        terms+=SdsProtocolQuantifiedTerm 
        (terms+=SdsProtocolQuantifiedTerm)*
    )?
;

interface SdsProtocolQuantifiedTerm extends SdsAbstractProtocolTerm {
	term: SdsAbstractProtocolTerm
	quantifier: string
}

SdsProtocolQuantifiedTerm returns SdsAbstractProtocolTerm:
    SdsProtocolPrimaryElement
    (
        {SdsProtocolQuantifiedTerm.term=current}
        quantifier=SdsProtocolQuantifier
    )?
;

SdsProtocolQuantifier returns string:
    '?' | '*' | '+'
;

SdsProtocolPrimaryElement returns SdsAbstractProtocolTerm:
    SdsProtocolComplement 
  | SdsProtocolReference
  | SdsProtocolTokenClass
  | SdsProtocolParenthesizedTerm
;

interface SdsProtocolComplement extends SdsAbstractProtocolTerm {
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

interface SdsProtocolReferenceList extends SdsAbstractProtocolTerm {
	references: SdsProtocolReference[]
}

SdsProtocolReferenceList returns SdsProtocolReferenceList:
    references+=SdsProtocolReference+
;

interface SdsProtocolReference extends SdsAbstractProtocolTerm {
	token: @SdsAbstractProtocolToken
}

SdsProtocolReference returns SdsProtocolReference:
    token=[SdsAbstractProtocolToken:ID]
;

interface SdsProtocolTokenClass extends SdsAbstractProtocolTerm {
	value: string
}

SdsProtocolTokenClass returns SdsProtocolTokenClass:
    value=SdsProtocolTokenClassValue
;

SdsProtocolTokenClassValue returns string:
    '.' | '\\a' | '\\f'
;

interface SdsProtocolParenthesizedTerm extends SdsAbstractProtocolTerm {
	term: SdsAbstractProtocolTerm
}

SdsProtocolParenthesizedTerm returns SdsProtocolParenthesizedTerm:
    '(' term=SdsProtocolTerm  ')'
;


// -----------------------------------------------------------------------------
// Terminals
// -----------------------------------------------------------------------------

terminal ID returns string: IDENTIFIER | '`' IDENTIFIER '`';
terminal fragment IDENTIFIER: /[_a-zA-Z][_a-zA-Z0-9]*/;

terminal FLOAT returns number: DECIMAL_DIGIT+ '.' DECIMAL_DIGIT+ FLOAT_EXPONENT?  | DECIMAL_DIGIT+ FLOAT_EXPONENT;
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
