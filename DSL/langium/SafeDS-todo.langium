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
