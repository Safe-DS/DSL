grammar SafeDS
import 'SafeDS-types'

entry SdsCompilationUnit returns SdsCompilationUnit:
    {SdsCompilationUnit} annotationCalls+=SdsAnnotationCall * ('package' name=QualifiedName  )? imports+=SdsImport * members+=SdsCompilationUnitMember *  
;

SdsCompilationUnitMember returns SdsAbstractAnnotatedObject:
    {SdsAnnotationCallList} annotationCalls+=SdsAnnotationCall * ({SdsAnnotation.annotationCallList=current} 'annotation' name=ID  parameterList=SdsParameterList ? constraint=SdsConstraint ?  | {SdsClass.annotationCallList=current} 'class' name=ID  typeParameterList=SdsTypeParameterList ? parameterList=SdsParameterList ? parentTypeList=SdsParentTypeList ? body=SdsClassBody ?  | {SdsEnum.annotationCallList=current} 'enum' name=ID  body=SdsEnumBody ?  | {SdsFunction.annotationCallList=current} 'fun' name=ID  typeParameterList=SdsTypeParameterList ? parameterList=SdsParameterList  resultList=SdsResultList ? body=SdsFunctionBody ?  | {SdsPredicate.annotationCallList=current} 'predicate' name=ID  typeParameterList=SdsTypeParameterList ? parameterList=SdsPredicateParameterList  resultList=SdsPredicateResultList ? body=SdsPredicateBlock   | {SdsPredicate.annotationCallList=current} 'abstract' 'predicate' name=ID  typeParameterList=SdsTypeParameterList ? parameterList=SdsPredicateParameterList  resultList=SdsPredicateResultList ?  | {SdsSchema.annotationCallList=current} 'schema' name=ID  columnList=SdsColumnList   | {SdsPipeline.annotationCallList=current} 'pipeline' name=ID  body=SdsBlock   | {SdsStep.annotationCallList=current} visibility=('internal' | 'private' )? 'step' name=ID  parameterList=SdsParameterList  resultList=SdsResultList ? body=SdsBlock   ) 
;

SdsImport returns SdsImport:
    'import' importedNamespace=QualifiedNameWithWildcard  alias=SdsImportAlias ?  
;

SdsImportAlias returns SdsImportAlias:
    'as' name=ID   
;

SdsAnnotationCall returns SdsAnnotationCall:
    '@' annotation=[SdsAnnotation:ID ] argumentList=SdsAnnotationCallArgumentList ?  
;

SdsAnnotationCallArgumentList returns SdsArgumentList:
    {SdsArgumentList} '(' (arguments+=SdsAnnotationCallArgument  (',' arguments+=SdsAnnotationCallArgument  )* ','? )? ')'  
;

SdsAnnotationCallArgument returns SdsArgument:
    (parameter=[SdsParameter:ID ] '=' )? value=SdsExpression   
;

SdsParentTypeList returns SdsParentTypeList:
    'sub' parentTypes+=SdsParentType  (',' parentTypes+=SdsParentType  )* ','?  
;

SdsParentType returns SdsAbstractType:
    SdsParentPrimaryType {SdsMemberType.receiver=current} '.' member=SdsNamedType   *  
;

SdsParentPrimaryType returns SdsAbstractType:
    SdsNamedType | SdsParentParenthesizedType 
;

SdsParentParenthesizedType returns SdsParenthesizedType:
    '(' ^type=SdsParentType  ')'  
;

SdsClassBody returns SdsClassBody:
    {SdsClassBody} '{' members+=SdsClassMember * '}'  
;

SdsClassMember returns SdsAbstractObject:
    SdsAnnotatedClassMember | SdsProtocol | SdsConstraint 
;

SdsAnnotatedClassMember returns SdsAbstractAnnotatedObject:
    {SdsAnnotationCallList} annotationCalls+=SdsAnnotationCall * ({SdsAttribute.annotationCallList=current} static?='static' ? 'attr' name=ID  (':' ^type=SdsType  )?  | {SdsClass.annotationCallList=current} 'class' name=ID  typeParameterList=SdsTypeParameterList ? parameterList=SdsParameterList ? parentTypeList=SdsParentTypeList ? body=SdsClassBody ?  | {SdsEnum.annotationCallList=current} 'enum' name=ID  body=SdsEnumBody ?  | {SdsFunction.annotationCallList=current} static?='static' ? 'fun' name=ID  typeParameterList=SdsTypeParameterList ? parameterList=SdsParameterList  resultList=SdsResultList ? body=SdsFunctionBody ?  ) 
;

SdsConstraint returns SdsConstraint:
    'constraint' body=SdsConstraintBlock   
;

SdsProtocol returns SdsProtocol:
    'protocol' body=SdsProtocolBody   
;

SdsProtocolBody returns SdsProtocolBody:
    {SdsProtocolBody} '{' subtermList=SdsProtocolSubtermList ? term=SdsProtocolTerm ? '}'  
;

SdsProtocolSubtermList returns SdsProtocolSubtermList:
    subterms+=SdsProtocolSubterm + 
;

SdsProtocolSubterm returns SdsProtocolSubterm:
    'subterm' name=ID  '=' term=SdsProtocolTerm  ';'  
;

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
    {SdsProtocolComplement} '[' universe=SdsProtocolTokenClass ? '^' referenceList=SdsProtocolReferenceList ? ']'  
;

SdsProtocolReferenceList returns SdsProtocolReferenceList:
    references+=SdsProtocolReference + 
;

SdsProtocolReference returns SdsProtocolReference:
    token=[SdsAbstractProtocolToken:ID ] 
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

SdsEnumBody returns SdsEnumBody:
    {SdsEnumBody} '{' variants+=SdsEnumVariant * '}'  
;

SdsEnumVariant returns SdsEnumVariant:
    annotationCalls+=SdsAnnotationCall * name=ID  typeParameterList=SdsTypeParameterList ? parameterList=SdsParameterList ? constraint=SdsConstraint ?  
;

SdsParameterList returns SdsParameterList:
    {SdsParameterList} '(' (parameters+=SdsParameter  (',' parameters+=SdsParameter  )* ','? )? ')'  
;

SdsLambdaParameterList returns SdsLambdaParameterList:
    {SdsLambdaParameterList} '(' (parameters+=SdsParameter  (',' parameters+=SdsParameter  )* ','? )? ')'  
;

SdsParameter returns SdsParameter:
    annotationCalls+=SdsAnnotationCall * variadic?='vararg' ? name=ID  (':' ^type=SdsType  )? ('=' defaultValue=SdsExpression  )?  
;

SdsPredicateParameterList returns SdsParameterList:
    {SdsParameterList} '(' (parameters+=SdsPredicateParameter  (',' parameters+=SdsPredicateParameter  )* ','? )? ')'  
;

SdsPredicateParameter returns SdsParameter:
    annotationCalls+=SdsAnnotationCall * (variadic?='vararg' ? name=ID  (':' ^type=SdsType  )? ('=' defaultValue=SdsExpression  )?  | ^type=SdsSchemaType  ) 
;

SdsResultList returns SdsResultList:
    {SdsResultList} '->' results+=SdsResult   | {SdsResultList} '->' '(' (results+=SdsResult  (',' results+=SdsResult  )* ','? )? ')'  
;

SdsResult returns SdsResult:
    annotationCalls+=SdsAnnotationCall * name=ID  (':' ^type=SdsType  )?  
;

SdsPredicateResultList returns SdsResultList:
    {SdsResultList} '->' results+=SdsPredicateResult   
;

SdsPredicateResult returns SdsResult:
    annotationCalls+=SdsAnnotationCall * ^type=SdsSchemaType   
;

SdsFunctionBody returns SdsFunctionBody:
    {SdsFunctionBody} '{' statements+=SdsFunctionStatement * '}'  
;

SdsFunctionStatement returns SdsAbstractObject:
    SdsConstraint 
;

SdsBlock returns SdsBlock:
    {SdsBlock} '{' statements+=SdsStatement * '}'  
;

SdsStatement returns SdsAbstractStatement:
    SdsAssignment | SdsExpressionStatement 
;

SdsAssignment returns SdsAssignment:
    assigneeList=SdsAssigneeList  '=' expression=SdsExpression  ';'  
;

SdsAssigneeList returns SdsAssigneeList:
    assignees+=SdsAssignee  (',' assignees+=SdsAssignee  )* ','?  
;

SdsAssignee returns SdsAbstractAssignee:
    {SdsPlaceholder} 'val' name=ID   | {SdsWildcard} '_'  | {SdsYield} 'yield' result=[SdsResult:ID ]  
;

SdsExpressionStatement returns SdsExpressionStatement:
    expression=SdsExpression  ';'  
;

SdsConstraintBlock returns SdsBlock:
    {SdsBlock} '{' (statements+=SdsConstraintStatement  (',' statements+=SdsConstraintStatement  )* )? '}'  
;

SdsConstraintStatement returns SdsAbstractStatement:
    SdsPredicateAssignment | SdsPredicateExpressionStatement | SdsTypeParameterConstraint 
;

SdsPredicateBlock returns SdsBlock:
    {SdsBlock} '{' (statements+=SdsPredicateStatement  (',' statements+=SdsPredicateStatement  )* )? '}'  
;

SdsPredicateStatement returns SdsAbstractStatement:
    SdsPredicateAssignment | SdsPredicateExpressionStatement 
;

SdsPredicateAssignment returns SdsAssignment:
    assigneeList=SdsPredicateAssigneeList  '=' expression=SdsExpression   
;

SdsPredicateAssigneeList returns SdsAssigneeList:
    assignees+=SdsPredicateAssignee  (',' assignees+=SdsPredicateAssignee  )* ','?  
;

SdsPredicateAssignee returns SdsAbstractAssignee:
    {SdsPlaceholder} 'val' name=ID   | {SdsWildcard} '_'  | {SdsSchemaPlaceholder} 'val' '::' name=ID   | {SdsSchemaYield} 'yield' ^type=SdsSchemaType   
;

SdsPredicateExpressionStatement returns SdsExpressionStatement:
    expression=SdsExpression  
;

SdsExpression returns SdsAbstractExpression:
    SdsLambda | SdsOrExpression 
;

SdsLambda returns SdsAbstractExpression:
    SdsLambdaParameterList ({SdsBlockLambda.parameterList=current} body=SdsBlockLambdaBlock   | {SdsExpressionLambda.parameterList=current} '->' result=SdsExpression   ) 
;

SdsBlockLambdaBlock returns SdsBlock:
    {SdsBlock} '{' statements+=SdsBlockLambdaStatement * '}'  
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
    SdsPrimaryExpression {SdsCall.receiver=current} typeArgumentList=SdsTypeArgumentList ? argumentList=SdsCallArgumentList   | {SdsIndexedAccess.receiver=current} '[' index=SdsExpression  ']'  | {SdsMemberAccess.receiver=current} (nullSafe?='?' )? '.' member=SdsReference   *  
;

SdsCallArgumentList returns SdsArgumentList:
    {SdsArgumentList} '(' (arguments+=SdsCallArgument  (',' arguments+=SdsCallArgument  )* ','? )? ')'  
;

SdsCallArgument returns SdsArgument:
    (parameter=[SdsParameter:ID ] '=' )? value=SdsExpression   
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
    declaration=[SdsAbstractDeclaration:ID ] 
;

SdsParenthesizedExpression returns SdsParenthesizedExpression:
    '(' expression=SdsExpression  ')'  
;

SdsTemplateString returns SdsTemplateString:
    expressions+=SdsTemplateStringStart  expressions+=SdsExpression ? (expressions+=SdsTemplateStringInner  expressions+=SdsExpression ? )* expressions+=SdsTemplateStringEnd   
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

SdsColumnList returns SdsColumnList:
    {SdsColumnList} '{' (columns+=SdsColumn  (',' columns+=SdsColumn  )* ','? )? '}'  
;

SdsColumn returns SdsColumn:
    columnName=SdsString  ":" columnType=SdsType   
;

QualifiedName returns string:
    ID ('.' ID )*  
;

QualifiedNameWithWildcard returns string:
    QualifiedName ('.' '*' )?  
;

SdsType returns SdsAbstractType:
    SdsPrimaryType {SdsMemberType.receiver=current} '.' member=SdsNamedType   *  
;

SdsPrimaryType returns SdsAbstractType:
    SdsCallableType | SdsNamedType | SdsUnionType | SdsParenthesizedType 
;

SdsParenthesizedType returns SdsParenthesizedType:
    '(' ^type=SdsType  ')'  
;

SdsCallableType returns SdsCallableType:
    parameterList=SdsParameterList  resultList=SdsResultList   
;

SdsNamedType returns SdsNamedType:
    declaration=[SdsAbstractNamedTypeDeclaration:ID ] typeArgumentList=SdsTypeArgumentList ? (nullable?='?' )?  
;

SdsSchemaType returns SdsSchemaType:
    '::' declaration=[SdsAbstractNamedTypeDeclaration:ID ]  
;

SdsUnionType returns SdsUnionType:
    'union' typeArgumentList=SdsUnionTypeArgumentList   
;

SdsUnionTypeArgumentList returns SdsTypeArgumentList:
    {SdsTypeArgumentList} ('<' (typeArguments+=SdsUnionTypeArgument  (',' typeArguments+=SdsUnionTypeArgument  )* ','? )? '>' )  
;

SdsUnionTypeArgument returns SdsTypeArgument:
    value=SdsUnionTypeArgumentValue  
;

SdsUnionTypeArgumentValue returns SdsAbstractTypeArgumentValue:
    {SdsTypeProjection} ^type=SdsType   
;

SdsTypeParameterList returns SdsTypeParameterList:
    {SdsTypeParameterList} ('<' (typeParameters+=SdsTypeParameter  (',' typeParameters+=SdsTypeParameter  )* ','? )? '>' )  
;

SdsTypeParameter returns SdsTypeParameter:
    annotationCalls+=SdsAnnotationCall * variance=SdsTypeParameterVariance ? name=ID  ('::' kind=SdsTypeParameterKind  )?  
;

SdsTypeParameterVariance returns string:
    'in' | 'out' 
;

SdsTypeParameterKind returns string:
    '$SchemaType' | '$ExpressionType' | '$IntType' | '$FloatType' | '$BooleanType' | '$StringType' | '$NamedType' 
;

SdsTypeParameterConstraint returns SdsTypeParameterConstraint:
    leftOperand=[SdsTypeParameter:ID ] operator=SdsTypeParameterConstraintOperator  rightOperand=SdsType   
;

SdsTypeParameterConstraintOperator returns string:
    'sub' | 'super' 
;

SdsTypeArgumentList returns SdsTypeArgumentList:
    {SdsTypeArgumentList} '<' (typeArguments+=SdsTypeArgument  (',' typeArguments+=SdsTypeArgument  )* ','? )? '>'  
;

SdsTypeArgument returns SdsTypeArgument:
    (typeParameter=[SdsTypeParameter:ID ] '=' )? value=SdsTypeArgumentValue   
;

SdsTypeArgumentValue returns SdsAbstractTypeArgumentValue:
    {SdsStarProjection} '*'  | {SdsTypeProjection} variance=SdsTypeParameterVariance ? ^type=SdsType   
;

terminal FLOAT returns number:DECIMAL_DIGIT+ '.' DECIMAL_DIGIT+ FLOAT_EXPONENT?  | DECIMAL_DIGIT+ FLOAT_EXPONENT  ;
terminal DECIMAL_DIGIT returns string:'0' ..'9' ;
terminal FLOAT_EXPONENT returns string:('e' | 'E' )('+' | '-' )?DECIMAL_DIGIT+  ;
terminal ID returns string:IDENTIFIER | '`' IDENTIFIER '`'  ;
terminal IDENTIFIER returns string:('a' ..'z' | 'A' ..'Z' | '_' )('a' ..'z' | 'A' ..'Z' | '_' | '0' ..'9' )* | SCHEMA_EFFECT ;
terminal SCHEMA_EFFECT returns string:'$readSchema' | '$checkColumn' | '$removeColumn' | '$keepColumn' | '$renameColumn' | '$addColumn' | '$changeColumnType' ;
terminal INT returns number:DECIMAL_DIGIT+ ;
hidden terminal ML_COMMENT returns string:'/*'  -> '*/'  ;
hidden terminal SL_COMMENT returns string:'//'  !('\r' | '\n' )('\r'? '\n' )?  ;
terminal STRING returns string:STRING_START STRING_TEXT* STRING_END  ;
terminal STRING_START returns string:STRING_DELIMITER ;
terminal STRING_END returns string:'{'? STRING_DELIMITER  ;
terminal STRING_DELIMITER returns string:'"' ;
terminal STRING_TEXT returns string:'{'? ESCAPE_SEQUENCE  | '{'?  !('\\' | STRING_DELIMITER | '{' ) ;
terminal ESCAPE_SEQUENCE returns string:'\\' . ;
terminal TEMPLATE_EXPRESSION_START returns string:'{{' ;
terminal TEMPLATE_EXPRESSION_END returns string:'}}' ;
terminal TEMPLATE_STRING_START returns string:STRING_START STRING_TEXT* TEMPLATE_EXPRESSION_START  ;
terminal TEMPLATE_STRING_INNER returns string:TEMPLATE_EXPRESSION_END STRING_TEXT* TEMPLATE_EXPRESSION_START  ;
terminal TEMPLATE_STRING_END returns string:TEMPLATE_EXPRESSION_END STRING_TEXT* STRING_END  ;
hidden terminal TEST_MARKER returns string:'»' | '«' ;
hidden terminal WS returns string:(' ' | '\t' | '\r' | '\n' )+;
