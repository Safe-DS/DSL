interface SdsAnnotationCall extends SdsAbstractCall {
	annotation?: @SdsAnnotation
}

interface SdsAbstractCall extends SdsAbstractObject {
	argumentList?: SdsArgumentList
}

interface SdsArgumentList extends SdsAbstractObject {
	arguments: SdsArgument[]
}

interface SdsArgument extends SdsAbstractExpression {
	parameter?: @SdsParameter
	value?: SdsAbstractExpression
}







interface SdsAnnotation extends SdsAbstractCallable, SdsAbstractCompilationUnitMember {
	constraint?: SdsConstraint
}







interface SdsConstraint extends SdsAbstractObject {
	body?: SdsBlock
}







interface SdsClass extends SdsAbstractCallable, SdsAbstractClassMember, SdsAbstractCompilationUnitMember, SdsAbstractNamedTypeDeclaration {
	typeParameterList?: SdsTypeParameterList
	parentTypeList?: SdsParentTypeList
	body?: SdsClassBody
}

interface SdsAbstractClassMember extends SdsAbstractDeclaration {
}







interface SdsParentTypeList extends SdsAbstractObject {
	parentTypes: SdsAbstractType[]
}

interface SdsClassBody extends SdsAbstractObject {
	members: SdsAbstractObject[]
}

interface SdsEnum extends SdsAbstractNamedTypeDeclaration, SdsAbstractClassMember, SdsAbstractCompilationUnitMember {
	body?: SdsEnumBody
}

interface SdsEnumBody extends SdsAbstractObject {
	variants: SdsEnumVariant[]
}

interface SdsEnumVariant extends SdsAbstractCallable, SdsAbstractNamedTypeDeclaration {
	typeParameterList?: SdsTypeParameterList
	constraint?: SdsConstraint
}

interface SdsFunction extends SdsAbstractCallable, SdsAbstractClassMember, SdsAbstractCompilationUnitMember, SdsAbstractProtocolToken {
	static: boolean
	typeParameterList?: SdsTypeParameterList
	resultList?: SdsResultList
	body?: SdsFunctionBody
}







interface SdsFunctionBody extends SdsAbstractObject {
	statements: SdsAbstractObject[]
}







interface SdsString extends SdsAbstractLiteral {
	value?: string
}

interface SdsAbstractLiteral extends SdsAbstractExpression {
}

interface SdsPipeline extends SdsAbstractCompilationUnitMember {
	body?: SdsBlock
}







interface SdsAttribute extends SdsAbstractClassMember, SdsAbstractProtocolToken {
	static: boolean
	^type?: SdsAbstractType
}











interface SdsProtocolAlternative extends SdsAbstractProtocolTerm {
	terms: SdsAbstractProtocolTerm[]
}

interface SdsProtocolSequence extends SdsAbstractProtocolTerm {
	terms: SdsAbstractProtocolTerm[]
}

interface SdsProtocolQuantifiedTerm extends SdsAbstractProtocolTerm {
	term?: SdsAbstractProtocolTerm
	quantifier?: string
}

interface SdsProtocolComplement extends SdsAbstractProtocolTerm {
	universe?: SdsProtocolTokenClass
	referenceList?: SdsProtocolReferenceList
}

interface SdsProtocolTokenClass extends SdsAbstractProtocolTerm {
	value?: string
}

interface SdsProtocolReferenceList extends SdsAbstractProtocolTerm {
	references: SdsProtocolReference[]
}

interface SdsProtocolReference extends SdsAbstractProtocolTerm {
	token?: @SdsAbstractProtocolToken
}

interface SdsProtocolParenthesizedTerm extends SdsAbstractProtocolTerm {
	term?: SdsAbstractProtocolTerm
}













interface SdsSchemaPlaceholder extends SdsAbstractAssignee, SdsAbstractNamedTypeDeclaration {
}

interface SdsSchemaYield extends SdsAbstractAssignee {
	^type?: SdsSchemaType
}



interface SdsBlockLambda extends SdsAbstractLambda {
	body?: SdsBlock
}

interface SdsAbstractLambda extends SdsAbstractCallable, SdsAbstractExpression {
}

interface SdsExpressionLambda extends SdsAbstractLambda {
	result?: SdsAbstractExpression
}

interface SdsBlockLambdaResult extends SdsAbstractAssignee, SdsAbstractResult {
}

interface SdsInfixOperation extends SdsAbstractExpression {
	leftOperand?: SdsAbstractExpression
	operator?: string
	rightOperand?: SdsAbstractExpression
}

interface SdsPrefixOperation extends SdsAbstractExpression {
	operand?: SdsAbstractExpression
	operator?: string
}

interface SdsCall extends SdsAbstractCall, SdsAbstractChainedExpression {
	typeArgumentList?: SdsTypeArgumentList
}

interface SdsAbstractChainedExpression extends SdsAbstractExpression {
	receiver?: SdsAbstractExpression
}

interface SdsIndexedAccess extends SdsAbstractChainedExpression {
	index?: SdsAbstractExpression
}

interface SdsMemberAccess extends SdsAbstractChainedExpression {
	member?: SdsReference
	nullSafe: boolean
}

interface SdsReference extends SdsAbstractExpression {
	declaration?: @SdsAbstractDeclaration
}

interface SdsSchemaReference extends SdsAbstractExpression {
	^type?: SdsSchemaType
}

interface SdsBoolean extends SdsAbstractLiteral {
	true: boolean
}

interface SdsFloat extends SdsAbstractNumber {
	value?: number
}

interface SdsAbstractNumber extends SdsAbstractLiteral {
}

interface SdsInt extends SdsAbstractNumber {
	value?: number
}

interface SdsNull extends SdsAbstractLiteral {
}

interface SdsParenthesizedExpression extends SdsAbstractExpression {
	expression?: SdsAbstractExpression
}

interface SdsTemplateString extends SdsAbstractExpression {
	expressions: SdsAbstractExpression[]
}

interface SdsTemplateStringStart extends SdsAbstractTemplateStringPart {
}

interface SdsAbstractTemplateStringPart extends SdsAbstractLiteral {
	value?: string
}

interface SdsTemplateStringInner extends SdsAbstractTemplateStringPart {
}

interface SdsTemplateStringEnd extends SdsAbstractTemplateStringPart {
}
