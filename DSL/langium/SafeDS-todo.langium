grammar SafeDS
import 'SafeDS-types'




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



SdsEnumBody returns SdsEnumBody:
    {SdsEnumBody} '{' variants+=SdsEnumVariant * '}'
;

SdsEnumVariant returns SdsEnumVariant:
    annotationCalls+=SdsAnnotationCall * name=ID  typeParameterList=SdsTypeParameterList ? parameterList=SdsParameterList ? constraint=SdsConstraint ?
;


SdsFunctionBody returns SdsFunctionBody:
    {SdsFunctionBody} '{' statements+=SdsFunctionStatement * '}'
;

SdsFunctionStatement returns SdsAbstractObject:
    SdsConstraint
;






SdsConstraintBlock returns SdsBlock:
    {SdsBlock} '{' (statements+=SdsConstraintStatement  (',' statements+=SdsConstraintStatement  )* )? '}'
;

SdsConstraintStatement returns SdsAbstractStatement:
    SdsPredicateAssignment | SdsPredicateExpressionStatement | SdsTypeParameterConstraint
;





terminal FLOAT returns number:DECIMAL_DIGIT+ '.' DECIMAL_DIGIT+ FLOAT_EXPONENT?  | DECIMAL_DIGIT+ FLOAT_EXPONENT  ;
terminal DECIMAL_DIGIT returns string:'0' ..'9' ;
terminal FLOAT_EXPONENT returns string:('e' | 'E' )('+' | '-' )?DECIMAL_DIGIT+  ;
terminal SCHEMA_EFFECT returns string:'$readSchema' | '$checkColumn' | '$removeColumn' | '$keepColumn' | '$renameColumn' | '$addColumn' | '$changeColumnType' ;
terminal INT returns number:DECIMAL_DIGIT+ ;
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
