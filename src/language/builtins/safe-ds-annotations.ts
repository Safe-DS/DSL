import {
    isSdsAnnotation,
    SdsAnnotatedObject,
    SdsAnnotation,
    SdsAnnotationCall,
    SdsParameter,
} from '../generated/ast.js';
import { annotationCallsOrEmpty } from '../helpers/nodeProperties.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';
import { resourceNameToUri } from '../../helpers/resources.js';
import {URI} from "langium";

const CORE_ANNOTATIONS_URI = resourceNameToUri('builtins/safeds/lang/coreAnnotations.sdsstub');

export class SafeDsAnnotations extends SafeDsModuleMembers<SdsAnnotation> {
    isDeprecated(node: SdsAnnotatedObject | undefined): boolean {
        return this.hasAnnotationCallOf(node, this.Deprecated);
    }

    private get Deprecated(): SdsAnnotation | undefined {
        return this.getAnnotation(CORE_ANNOTATIONS_URI, 'Deprecated');
    }

    isExperimental(node: SdsAnnotatedObject | undefined): boolean {
        return this.hasAnnotationCallOf(node, this.Experimental);
    }

    private get Experimental(): SdsAnnotation | undefined {
        return this.getAnnotation(CORE_ANNOTATIONS_URI, 'Experimental');
    }

    findExpertAnnotationCall(node: SdsParameter | undefined): SdsAnnotationCall | undefined {
        return this.findAnnotationCallOf(node, this.Expert);
    }

    private get Expert(): SdsAnnotation | undefined {
        return this.getAnnotation(CORE_ANNOTATIONS_URI,'Expert');
    }

    private hasAnnotationCallOf(node: SdsAnnotatedObject | undefined, expected: SdsAnnotation | undefined): boolean {
        return annotationCallsOrEmpty(node).some((it) => {
            const actual = it.annotation?.ref;
            return actual === expected;
        });
    }

    private findAnnotationCallOf(
        node: SdsAnnotatedObject | undefined,
        expected: SdsAnnotation | undefined,
    ): SdsAnnotationCall | undefined {
        return annotationCallsOrEmpty(node).find((it) => {
            const actual = it.annotation?.ref;
            return actual === expected;
        });
    }

    private getAnnotation(uri: URI, name: string): SdsAnnotation | undefined {
        return this.getModuleMember(uri, name, isSdsAnnotation);
    }
}
