interface SdsAnnotationCall extends SdsAbstractCall {
	annotation?: @SdsAnnotation
}

interface SdsAnnotation extends SdsAbstractCallable, SdsAbstractCompilationUnitMember {
	constraint?: SdsConstraint
}

interface SdsConstraint extends SdsAbstractObject {
	body?: SdsBlock
}

interface SdsPipeline extends SdsAbstractCompilationUnitMember {
	body?: SdsBlock
}

interface SdsAttribute extends SdsAbstractClassMember, SdsAbstractProtocolToken {
	static: boolean
	^type?: SdsAbstractType
}

interface SdsSchemaPlaceholder extends SdsAbstractAssignee, SdsAbstractNamedTypeDeclaration {
}

interface SdsSchemaYield extends SdsAbstractAssignee {
	^type?: SdsSchemaType
}
