import { getContainerOfType, URI } from 'langium';
import { resourceNameToUri } from '../../helpers/resources.js';
import { isSdsEnum, SdsEnum } from '../generated/ast.js';
import { EvaluatedEnumVariant, EvaluatedNode } from '../partialEvaluation/model.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';

const ANNOTATION_USAGE_URI = resourceNameToUri('builtins/safeds/lang/annotationUsage.sdsstub');
const PURITY_URI = resourceNameToUri('builtins/safeds/lang/purity.sdsstub');

export class SafeDsEnums extends SafeDsModuleMembers<SdsEnum> {
    get AnnotationTarget(): SdsEnum | undefined {
        return this.getEnum(ANNOTATION_USAGE_URI, 'AnnotationTarget');
    }

    isEvaluatedAnnotationTarget = (node: EvaluatedNode): node is EvaluatedEnumVariant =>
        node instanceof EvaluatedEnumVariant && getContainerOfType(node.variant, isSdsEnum) === this.AnnotationTarget;

    get ImpurityReason(): SdsEnum | undefined {
        return this.getEnum(PURITY_URI, 'ImpurityReason');
    }

    isEvaluatedImpurityReason = (node: EvaluatedNode): node is EvaluatedEnumVariant =>
        node instanceof EvaluatedEnumVariant && getContainerOfType(node.variant, isSdsEnum) === this.ImpurityReason;

    private getEnum(uri: URI, name: string): SdsEnum | undefined {
        return this.getModuleMember(uri, name, isSdsEnum);
    }
}
