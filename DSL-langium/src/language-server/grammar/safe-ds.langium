grammar SafeDs

// -----------------------------------------------------------------------------
// Base interfaces
// -----------------------------------------------------------------------------

interface SdsAbstractObject {}

interface SdsAbstractAnnotatedObject extends SdsAbstractObject {
    annotationCalls?: SdsAnnotationCall[]
}

interface SdsAbstractDeclaration extends SdsAbstractAnnotatedObject {
    annotationCallList?: SdsAnnotationCallList
	name?: string
}

interface SdsAbstractLocalVariable extends SdsAbstractDeclaration {}


// -----------------------------------------------------------------------------
// Module
// -----------------------------------------------------------------------------

interface SdsModule extends SdsAbstractDeclaration {
    imports: SdsImport[];
// members: SdsAbstractAnnotatedObject[]
}

entry SdsModule returns SdsModule:
    {SdsModule}
    // annotationCalls+=SdsAnnotationCall*
    ('package' name=QualifiedName)?
    imports+=SdsImport*
    // members+=SdsModuleMember*
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
    QualifiedName ('.' '*' )?
;

QualifiedName returns string:
    ID ('.' ID )*
;


// -----------------------------------------------------------------------------
// Declarations
// -----------------------------------------------------------------------------

interface SdsAbstractModuleMember extends SdsAbstractDeclaration {}

SdsModuleMember returns SdsAbstractAnnotatedObject:
    {SdsAnnotationCallList} 
    annotationCalls+=SdsAnnotationCall*
    (
      {SdsAnnotation.annotationCallList=current}
      'annotation' name=ID
      parameterList=SdsParameterList?
      constraint=SdsConstraint?
    | {SdsClass.annotationCallList=current}
      'class'
      name=ID
      typeParameterList=SdsTypeParameterList?
      parameterList=SdsParameterList?
      parentTypeList=SdsParentTypeList?
      body=SdsClassBody?  
    | {SdsEnum.annotationCallList=current} 
      'enum'
      name=ID
      body=SdsEnumBody?  
    | {SdsFunction.annotationCallList=current}
      'fun'
      name=ID
      typeParameterList=SdsTypeParameterList?
      parameterList=SdsParameterList
      resultList=SdsResultList?
      body=SdsFunctionBody?  
    | {SdsSchema.annotationCallList=current}
      SdsSchema
    | {SdsPipeline.annotationCallList=current}
      'pipeline'
       name=ID
       body=SdsBlock   
    | {SdsStep.annotationCallList=current}
      SdsStepFragment
    )
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



// -----------------------------------------------------------------------------
// Callables, parameters, and results
// -----------------------------------------------------------------------------

interface SdsAbstractCallable extends SdsAbstractObject {
	parameterList?: SdsParameterList
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

SdsLambdaParameterList returns SdsLambdaParameterList:
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
    // annotationCalls+=SdsAnnotationCall*
    variadic?='vararg'?
    name=ID
    (':' ^type=SdsType)?
    // ('=' defaultValue=SdsExpression)?
;

interface SdsResultList extends SdsAbstractObject {
	results: SdsResult[]
}

SdsResultList returns SdsResultList:
    {SdsResultList} '->' results+=SdsResult
  | {SdsResultList} '->' '(' (results+=SdsResult (',' results+=SdsResult)* ','? )? ')'
;

interface SdsAbstractResult extends SdsAbstractDeclaration {}

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

SdsLambda returns SdsAbstractExpression:
    SdsLambdaParameterList ({SdsBlockLambda.parameterList=current} body=SdsBlockLambdaBlock   | {SdsExpressionLambda.parameterList=current} '->' result=SdsExpression   )
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

SdsBlockLambdaAssignee returns SdsAbstractAssignee:
    {SdsWildcard} '_'  | {SdsPlaceholder} 'val' name=ID   | {SdsBlockLambdaResult} 'yield' name=ID
;

SdsOrExpression returns SdsAbstractExpression:
    SdsAndExpression ({SdsInfixOperation.leftOperand=current} operator='or'  rightOperand=SdsAndExpression  )*
;

SdsAndExpression returns SdsAbstractExpression:
    SdsNotExpression ({SdsInfixOperation.leftOperand=current} operator='and'  rightOperand=SdsNotExpression  )*
;

SdsNotExpression returns SdsAbstractExpression:
    {SdsPrefixOperation} operator='not'  operand=SdsNotExpression   | SdsEqualityExpression
;

SdsEqualityExpression returns SdsAbstractExpression:
    SdsComparisonExpression ({SdsInfixOperation.leftOperand=current} operator=SdsEqualityOperator  rightOperand=SdsComparisonExpression  )?
;

SdsEqualityOperator returns string:
    '==' | '!=' | '===' | '!=='
;

SdsComparisonExpression returns SdsAbstractExpression:
    SdsAdditiveExpression ({SdsInfixOperation.leftOperand=current} operator=SdsComparisonOperator  rightOperand=SdsAdditiveExpression  )?
;

SdsComparisonOperator returns string:
    '<' | '<=' | '>=' | '>'
;

SdsAdditiveExpression returns SdsAbstractExpression:
    SdsMultiplicativeExpression ({SdsInfixOperation.leftOperand=current} operator=SdsAdditiveOperator  rightOperand=SdsMultiplicativeExpression  )*
;

SdsAdditiveOperator returns string:
    '+' | '-'
;

SdsMultiplicativeExpression returns SdsAbstractExpression:
    SdsElvisExpression ({SdsInfixOperation.leftOperand=current} operator=SdsMultiplicativeOperator  rightOperand=SdsElvisExpression  )*
;

SdsMultiplicativeOperator returns string:
    '*' | '/'
;

SdsElvisExpression returns SdsAbstractExpression:
    SdsUnaryOperation ({SdsInfixOperation.leftOperand=current} operator='?:'  rightOperand=SdsUnaryOperation  )*
;

SdsUnaryOperation returns SdsAbstractExpression:
    {SdsPrefixOperation} operator='-'  operand=SdsUnaryOperation   | SdsChainedExpression
;

SdsChainedExpression returns SdsAbstractExpression:
    SdsPrimaryExpression {SdsCall.receiver=current} typeArgumentList=SdsTypeArgumentList? argumentList=SdsCallArgumentList   | {SdsIndexedAccess.receiver=current} '[' index=SdsExpression  ']'  | {SdsMemberAccess.receiver=current} (nullSafe?='?' )? '.' member=SdsReference*
;

SdsCallArgumentList returns SdsArgumentList:
    {SdsArgumentList} '(' (arguments+=SdsCallArgument  (',' arguments+=SdsCallArgument  )* ','? )? ')'
;

SdsCallArgument returns SdsArgument:
    (parameter=[SdsParameter:ID] '=' )? value=SdsExpression
;

SdsPrimaryExpression returns SdsAbstractExpression:
    SdsLiteral | SdsParenthesizedExpression | SdsReference | SdsTemplateString | {SdsSchemaReference} ^type=SdsSchemaType
;

SdsLiteral returns SdsAbstractLiteral:
    SdsBoolean | SdsFloat | SdsInt | SdsNull | SdsString
;

SdsBoolean returns SdsBoolean:
    true?='true'  | {SdsBoolean} 'false'
;

SdsFloat returns SdsFloat:
    value=FLOAT
;

SdsInt returns SdsInt:
    value=INT
;

SdsNull returns SdsNull:
    {SdsNull} 'null'
;

SdsString returns SdsString:
    value=STRING
;

SdsReference returns SdsReference:
    declaration=[SdsAbstractDeclaration:ID]
;

SdsParenthesizedExpression returns SdsParenthesizedExpression:
    '(' expression=SdsExpression  ')'
;

SdsTemplateString returns SdsTemplateString:
    expressions+=SdsTemplateStringStart  expressions+=SdsExpression? (expressions+=SdsTemplateStringInner  expressions+=SdsExpression? )* expressions+=SdsTemplateStringEnd
;

SdsTemplateStringStart returns SdsTemplateStringStart:
    value=TEMPLATE_STRING_START
;

SdsTemplateStringInner returns SdsTemplateStringInner:
    value=TEMPLATE_STRING_INNER
;

SdsTemplateStringEnd returns SdsTemplateStringEnd:
    value=TEMPLATE_STRING_END
;


// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SdsAbstractType extends SdsAbstractObject {}

interface SdsAbstractNamedTypeDeclaration extends SdsAbstractDeclaration {}

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
  | SdsParenthesizedType
;

interface SdsParenthesizedType extends SdsAbstractType {
	^type: SdsAbstractType
}

SdsParenthesizedType returns SdsParenthesizedType:
    '(' ^type=SdsType ')'
;

interface SdsCallableType extends SdsAbstractCallable, SdsAbstractType {
	resultList: SdsResultList
}

SdsCallableType returns SdsCallableType:
    parameterList=SdsParameterList  resultList=SdsResultList
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

SdsUnionTypeArgumentValue returns SdsAbstractTypeArgumentValue:
    {SdsTypeProjection} ^type=SdsType
;

SdsParentType returns SdsAbstractType:
    SdsParentPrimaryType ({SdsMemberType.receiver=current} '.' member=SdsNamedType)*
;

SdsParentPrimaryType returns SdsAbstractType:
    SdsNamedType | SdsParentParenthesizedType
;

SdsParentParenthesizedType returns SdsParenthesizedType:
    '(' ^type=SdsParentType  ')'
;

interface SdsTypeParameterList extends SdsAbstractObject {
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

interface SdsTypeParameter extends SdsAbstractNamedTypeDeclaration {
	variance?: string
	kind?: string
}

SdsTypeParameter returns SdsTypeParameter:
    // annotationCalls+=SdsAnnotationCall*
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
    '<'
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

fragment SdsSchema:
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

interface SdsAbstractProtocolToken extends SdsAbstractDeclaration {}

interface SdsProtocolSubterm extends SdsAbstractProtocolToken {
	term?: SdsAbstractProtocolTerm
}

SdsProtocolSubterm returns SdsProtocolSubterm:
    'subterm'
    name=ID 
    '='
    term=SdsProtocolTerm  ';'
;

interface SdsAbstractProtocolTerm extends SdsAbstractObject {}

SdsProtocolTerm returns SdsAbstractProtocolTerm:
    SdsProtocolAlternative
;

SdsProtocolAlternative returns SdsAbstractProtocolTerm:
    SdsProtocolSequence ({SdsProtocolAlternative.terms+=current} '|' terms+=SdsProtocolSequence  ('|' terms+=SdsProtocolSequence  )* )?
;

SdsProtocolSequence returns SdsAbstractProtocolTerm:
    SdsProtocolQuantifiedTerm ({SdsProtocolSequence.terms+=current} terms+=SdsProtocolQuantifiedTerm  (terms+=SdsProtocolQuantifiedTerm )* )?
;

SdsProtocolQuantifiedTerm returns SdsAbstractProtocolTerm:
    SdsProtocolPrimaryElement ({SdsProtocolQuantifiedTerm.term=current} quantifier=SdsProtocolQuantifier  )?
;

SdsProtocolQuantifier returns string:
    '?' | '*' | '+'
;

SdsProtocolPrimaryElement returns SdsAbstractProtocolTerm:
    SdsProtocolComplement | SdsProtocolReference | SdsProtocolTokenClass | SdsProtocolParenthesizedTerm
;

SdsProtocolComplement returns SdsProtocolComplement:
    {SdsProtocolComplement} '[' universe=SdsProtocolTokenClass? '^' referenceList=SdsProtocolReferenceList? ']'
;

SdsProtocolReferenceList returns SdsProtocolReferenceList:
    references+=SdsProtocolReference+
;

SdsProtocolReference returns SdsProtocolReference:
    token=[SdsAbstractProtocolToken:ID]
;

SdsProtocolTokenClass returns SdsProtocolTokenClass:
    value=SdsProtocolTokenClassValue
;

SdsProtocolTokenClassValue returns string:
    '.' | '\\a' | '\\f'
;

SdsProtocolParenthesizedTerm returns SdsProtocolParenthesizedTerm:
    '(' term=SdsProtocolTerm  ')'
;


// -----------------------------------------------------------------------------
// Terminals
// -----------------------------------------------------------------------------

terminal ID returns string: IDENTIFIER | '`' IDENTIFIER '`';
terminal IDENTIFIER returns string: /[_a-zA-Z][_a-zA-Z0-9]*/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
hidden terminal TEST_MARKER: /[»«]/;
hidden terminal WS: /\s+/;
