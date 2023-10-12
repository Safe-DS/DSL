import { isSdsAnnotation, SdsAnnotatedObject, SdsAnnotation, SdsParameter } from '../generated/ast.js';
import { annotationCallsOrEmpty } from '../helpers/nodeProperties.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';
import { resourceNameToUri } from '../../helpers/resources.js';
import { URI } from 'langium';

const ANNOTATION_USAGE_URI = resourceNameToUri('builtins/safeds/lang/annotationUsage.sdsstub');
const IDE_INTEGRATION_URI = resourceNameToUri('builtins/safeds/lang/ideIntegration.sdsstub');
const MATURITY_URI = resourceNameToUri('builtins/safeds/lang/maturity.sdsstub');

export class SafeDsAnnotations extends SafeDsModuleMembers<SdsAnnotation> {
    isDeprecated(node: SdsAnnotatedObject | undefined): boolean {
        return this.hasAnnotationCallOf(node, this.Deprecated);
    }

    private get Deprecated(): SdsAnnotation | undefined {
        return this.getAnnotation(MATURITY_URI, 'Deprecated');
    }

    isExperimental(node: SdsAnnotatedObject | undefined): boolean {
        return this.hasAnnotationCallOf(node, this.Experimental);
    }

    private get Experimental(): SdsAnnotation | undefined {
        return this.getAnnotation(MATURITY_URI, 'Experimental');
    }

    isExpert(node: SdsParameter | undefined): boolean {
        return this.hasAnnotationCallOf(node, this.Expert);
    }

    private get Expert(): SdsAnnotation | undefined {
        return this.getAnnotation(IDE_INTEGRATION_URI, 'Expert');
    }

    isRepeatable(node: SdsAnnotation | undefined): boolean {
        return this.hasAnnotationCallOf(node, this.Repeatable);
    }

    private get Repeatable(): SdsAnnotation | undefined {
        return this.getAnnotation(ANNOTATION_USAGE_URI, 'Repeatable');
    }

    private hasAnnotationCallOf(node: SdsAnnotatedObject | undefined, expected: SdsAnnotation | undefined): boolean {
        return annotationCallsOrEmpty(node).some((it) => {
            const actual = it.annotation?.ref;
            return actual === expected;
        });
    }

    private getAnnotation(uri: URI, name: string): SdsAnnotation | undefined {
        return this.getModuleMember(uri, name, isSdsAnnotation);
    }
}
