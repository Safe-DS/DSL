import { isSdsAnnotation, SdsAnnotatedObject, SdsAnnotation } from '../generated/ast.js';
import { annotationCallsOrEmpty } from '../helpers/nodeProperties.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';
import { resourceNameToUri } from '../../helpers/resources.js';

const CORE_ANNOTATIONS_URI = resourceNameToUri('builtins/safeds/lang/coreAnnotations.sdsstub');

export class SafeDsAnnotations extends SafeDsModuleMembers<SdsAnnotation> {
    isDeprecated(node: SdsAnnotatedObject | undefined): boolean {
        return annotationCallsOrEmpty(node).some((it) => {
            const annotation = it.annotation?.ref;
            return annotation === this.Deprecated;
        });
    }

    isExperimental(node: SdsAnnotatedObject | undefined): boolean {
        return annotationCallsOrEmpty(node).some((it) => {
            const annotation = it.annotation?.ref;
            return annotation === this.Experimental;
        });
    }

    private get Deprecated(): SdsAnnotation | undefined {
        return this.getAnnotation('Deprecated');
    }

    private get Experimental(): SdsAnnotation | undefined {
        return this.getAnnotation('Experimental');
    }

    private getAnnotation(name: string): SdsAnnotation | undefined {
        return this.getModuleMember(CORE_ANNOTATIONS_URI, name, isSdsAnnotation);
    }
}
