
interface SdsCompilationUnit extends SdsAbstractDeclaration {
	imports: SdsImport[]
	members: SdsAbstractAnnotatedObject[]
}

interface SdsAbstractDeclaration extends SdsAbstractAnnotatedObject {
	annotationCallList?: SdsAnnotationCallList
	name?: string
}

interface SdsAbstractAnnotatedObject extends SdsAbstractObject {
	annotationCalls: SdsAnnotationCall[]
}

interface SdsAbstractObject {
}

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

interface SdsAbstractExpression extends SdsAbstractObject {
}

interface SdsParameter extends SdsAbstractLocalVariable {
	defaultValue?: SdsAbstractExpression
	^type?: SdsAbstractType
	variadic: boolean
}

interface SdsAbstractLocalVariable extends SdsAbstractDeclaration {
}

interface SdsAbstractType extends SdsAbstractObject {
}

interface SdsAnnotation extends SdsAbstractCallable, SdsAbstractCompilationUnitMember {
	constraint?: SdsConstraint
}

interface SdsAbstractCallable extends SdsAbstractObject {
	parameterList?: SdsParameterList
}

interface SdsParameterList extends SdsAbstractObject {
	parameters: SdsParameter[]
}

interface SdsAbstractCompilationUnitMember extends SdsAbstractDeclaration {
}

interface SdsConstraint extends SdsAbstractObject {
	body?: SdsBlock
}

interface SdsBlock extends SdsAbstractObject {
	statements: SdsAbstractStatement[]
}

interface SdsAbstractStatement extends SdsAbstractObject {
}

interface SdsAnnotationCallList extends SdsAbstractAnnotatedObject {
}

interface SdsImport extends SdsAbstractObject {
	importedNamespace?: string
	alias?: SdsImportAlias
}

interface SdsImportAlias extends SdsAbstractObject {
	name?: string
}

interface SdsClass extends SdsAbstractCallable, SdsAbstractClassMember, SdsAbstractCompilationUnitMember, SdsAbstractNamedTypeDeclaration {
	typeParameterList?: SdsTypeParameterList
	parentTypeList?: SdsParentTypeList
	body?: SdsClassBody
}

interface SdsAbstractClassMember extends SdsAbstractDeclaration {
}

interface SdsAbstractNamedTypeDeclaration extends SdsAbstractDeclaration {
}

interface SdsTypeParameterList extends SdsAbstractObject {
	typeParameters: SdsTypeParameter[]
}

interface SdsTypeParameter extends SdsAbstractNamedTypeDeclaration {
	variance?: string
	kind?: string
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

interface SdsAbstractProtocolToken extends SdsAbstractDeclaration {
}

interface SdsResultList extends SdsAbstractObject {
	results: SdsResult[]
}

interface SdsResult extends SdsAbstractResult {
	^type?: SdsAbstractType
}

interface SdsAbstractResult extends SdsAbstractDeclaration {
}

interface SdsFunctionBody extends SdsAbstractObject {
	statements: SdsAbstractObject[]
}

interface SdsPredicate extends SdsAbstractCompilationUnitMember, SdsAbstractCallable {
	typeParameterList?: SdsTypeParameterList
	resultList?: SdsResultList
	body?: SdsBlock
}

interface SdsSchema extends SdsAbstractCompilationUnitMember {
	columnList?: SdsColumnList
}

interface SdsColumnList extends SdsAbstractObject {
	columns: SdsColumn[]
}

interface SdsColumn extends SdsAbstractObject {
	columnName?: SdsString
	columnType?: SdsAbstractType
}

interface SdsString extends SdsAbstractLiteral {
	value?: string
}

interface SdsAbstractLiteral extends SdsAbstractExpression {
}

interface SdsPipeline extends SdsAbstractCompilationUnitMember {
	body?: SdsBlock
}

interface SdsStep extends SdsAbstractCallable, SdsAbstractCompilationUnitMember {
	visibility?: string
	resultList?: SdsResultList
	body?: SdsBlock
}

interface SdsMemberType extends SdsAbstractType {
	member?: SdsNamedType
	receiver?: SdsAbstractType
}

interface SdsNamedType extends SdsAbstractType {
	declaration?: @SdsAbstractNamedTypeDeclaration
	nullable: boolean
	typeArgumentList?: SdsTypeArgumentList
}

interface SdsTypeArgumentList extends SdsAbstractObject {
	typeArguments: SdsTypeArgument[]
}

interface SdsTypeArgument extends SdsAbstractObject {
	typeParameter?: @SdsTypeParameter
	value?: SdsAbstractTypeArgumentValue
}

interface SdsAbstractTypeArgumentValue extends SdsAbstractObject {
}

interface SdsParenthesizedType extends SdsAbstractType {
	^type?: SdsAbstractType
}

interface SdsAttribute extends SdsAbstractClassMember, SdsAbstractProtocolToken {
	static: boolean
	^type?: SdsAbstractType
}

interface SdsProtocol extends SdsAbstractObject {
	body?: SdsProtocolBody
}

interface SdsProtocolBody extends SdsAbstractObject {
	subtermList?: SdsProtocolSubtermList
	term?: SdsAbstractProtocolTerm
}

interface SdsProtocolSubtermList extends SdsAbstractObject {
	subterms: SdsProtocolSubterm[]
}

interface SdsProtocolSubterm extends SdsAbstractProtocolToken {
	term?: SdsAbstractProtocolTerm
}

interface SdsAbstractProtocolTerm extends SdsAbstractObject {
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

interface SdsLambdaParameterList extends SdsAbstractExpression, SdsParameterList {
}

interface SdsAssignment extends SdsAbstractStatement {
	assigneeList?: SdsAssigneeList
	expression?: SdsAbstractExpression
}

interface SdsAssigneeList extends SdsAbstractObject {
	assignees: SdsAbstractAssignee[]
}

interface SdsAbstractAssignee extends SdsAbstractObject {
}

interface SdsPlaceholder extends SdsAbstractAssignee, SdsAbstractLocalVariable {
}

interface SdsWildcard extends SdsAbstractAssignee {
}

interface SdsYield extends SdsAbstractAssignee {
	result?: @SdsResult
}

interface SdsExpressionStatement extends SdsAbstractStatement {
	expression?: SdsAbstractExpression
}

interface SdsSchemaPlaceholder extends SdsAbstractAssignee, SdsAbstractNamedTypeDeclaration {
}

interface SdsSchemaYield extends SdsAbstractAssignee {
	^type?: SdsSchemaType
}

interface SdsSchemaType extends SdsAbstractType {
	declaration?: @SdsAbstractNamedTypeDeclaration
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

interface SdsCallableType extends SdsAbstractCallable, SdsAbstractType {
	resultList?: SdsResultList
}

interface SdsUnionType extends SdsAbstractType {
	typeArgumentList?: SdsTypeArgumentList
}

interface SdsTypeProjection extends SdsAbstractTypeArgumentValue {
	^type?: SdsAbstractType
	variance?: string
}

interface SdsTypeParameterConstraint extends SdsAbstractStatement {
	leftOperand?: @SdsTypeParameter
	operator?: string
	rightOperand?: SdsAbstractType
}

interface SdsStarProjection extends SdsAbstractTypeArgumentValue {
}

