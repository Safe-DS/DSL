import { isSdsEnum, SdsEnum } from '../generated/ast.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';
import { resourceNameToUri } from '../../helpers/resources.js';
import { URI } from 'langium';

const ANNOTATION_USAGE_URI = resourceNameToUri('builtins/safeds/lang/annotationUsage.sdsstub');

export class SafeDsEnums extends SafeDsModuleMembers<SdsEnum> {
    get AnnotationTarget(): SdsEnum | undefined {
        return this.getEnum(ANNOTATION_USAGE_URI, 'AnnotationTarget');
    }

    private getEnum(uri: URI, name: string): SdsEnum | undefined {
        return this.getModuleMember(uri, name, isSdsEnum);
    }
}
