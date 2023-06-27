// SdsAbstractDeclaration --------------------------------------------------------------------------

import {SdsAnnotationCall, SdsDeclaration} from "../generated/ast";

export const annotationCallsOrEmpty = function (node: SdsDeclaration): SdsAnnotationCall[] {
    return node?.annotationCallList?.annotationCalls ?? node?.annotationCalls ?? []
}
