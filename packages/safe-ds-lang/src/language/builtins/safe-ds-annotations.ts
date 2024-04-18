import { EMPTY_STREAM, Stream, stream, URI } from 'langium';
import { resourceNameToUri } from '../../helpers/resources.js';
import {
    isSdsAnnotation,
    SdsAnnotatedObject,
    SdsAnnotation,
    SdsEnumVariant,
    SdsFunction,
    SdsModule,
    SdsParameter,
} from '../generated/ast.js';
import { findFirstAnnotationCallOf, getEnumVariants, hasAnnotationCallOf } from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import {
    EvaluatedEnumVariant,
    EvaluatedList,
    EvaluatedNode,
    StringConstant,
    UnknownEvaluatedNode,
} from '../partialEvaluation/model.js';
import { SafeDsPartialEvaluator } from '../partialEvaluation/safe-ds-partial-evaluator.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsEnums } from './safe-ds-enums.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';

const ANNOTATION_USAGE_URI = resourceNameToUri('builtins/safeds/lang/annotationUsage.sdsstub');
const CODE_GENERATION_URI = resourceNameToUri('builtins/safeds/lang/codeGeneration.sdsstub');
const IDE_INTEGRATION_URI = resourceNameToUri('builtins/safeds/lang/ideIntegration.sdsstub');
const MATURITY_URI = resourceNameToUri('builtins/safeds/lang/maturity.sdsstub');
const PURITY_URI = resourceNameToUri('builtins/safeds/lang/purity.sdsstub');

export class SafeDsAnnotations extends SafeDsModuleMembers<SdsAnnotation> {
    private readonly builtinEnums: SafeDsEnums;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly partialEvaluator: SafeDsPartialEvaluator;

    constructor(services: SafeDsServices) {
        super(services);

        this.builtinEnums = services.builtins.Enums;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;
    }

    callsDeprecated(node: SdsAnnotatedObject | undefined): boolean {
        return hasAnnotationCallOf(node, this.Deprecated);
    }

    getDeprecationInfo(node: SdsAnnotatedObject | undefined): DeprecationInfo | undefined {
        if (!this.callsDeprecated(node)) {
            return undefined;
        }

        const alternative = this.getParameterValue(node, this.Deprecated, 'alternative');
        const reason = this.getParameterValue(node, this.Deprecated, 'reason');
        const sinceVersion = this.getParameterValue(node, this.Deprecated, 'sinceVersion');
        const removalVersion = this.getParameterValue(node, this.Deprecated, 'removalVersion');

        return {
            alternative: alternative instanceof StringConstant ? alternative.value : undefined,
            reason: reason instanceof StringConstant ? reason.value : undefined,
            sinceVersion: sinceVersion instanceof StringConstant ? sinceVersion.value : undefined,
            removalVersion: removalVersion instanceof StringConstant ? removalVersion.value : undefined,
        };
    }

    private get Deprecated(): SdsAnnotation | undefined {
        return this.getAnnotation(MATURITY_URI, 'Deprecated');
    }

    callsExperimental(node: SdsAnnotatedObject | undefined): boolean {
        return hasAnnotationCallOf(node, this.Experimental);
    }

    private get Experimental(): SdsAnnotation | undefined {
        return this.getAnnotation(MATURITY_URI, 'Experimental');
    }

    callsExpert(node: SdsParameter | undefined): boolean {
        return hasAnnotationCallOf(node, this.Expert);
    }

    private get Expert(): SdsAnnotation | undefined {
        return this.getAnnotation(IDE_INTEGRATION_URI, 'Expert');
    }

    callsImpure(node: SdsFunction | undefined): boolean {
        return hasAnnotationCallOf(node, this.Impure);
    }

    streamImpurityReasons(node: SdsFunction | undefined): Stream<EvaluatedEnumVariant> {
        // If allReasons are specified, but we could not evaluate them to a list, no reasons apply
        const value = this.getParameterValue(node, this.Impure, 'allReasons');
        if (!(value instanceof EvaluatedList)) {
            return EMPTY_STREAM;
        }

        // Otherwise, filter the elements of the list and keep only variants of the ImpurityReason enum
        return stream(value.elements).filter(this.builtinEnums.isEvaluatedImpurityReason);
    }

    get Impure(): SdsAnnotation | undefined {
        return this.getAnnotation(PURITY_URI, 'Impure');
    }

    callsPure(node: SdsFunction | undefined): boolean {
        return hasAnnotationCallOf(node, this.Pure);
    }

    get Pure(): SdsAnnotation | undefined {
        return this.getAnnotation(PURITY_URI, 'Pure');
    }

    getPythonCall(node: SdsFunction | undefined): string | undefined {
        const value = this.getParameterValue(node, this.PythonCall, 'callSpecification');
        if (value instanceof StringConstant) {
            return value.value;
        } else {
            return undefined;
        }
    }

    get PythonCall(): SdsAnnotation | undefined {
        return this.getAnnotation(CODE_GENERATION_URI, 'PythonCall');
    }

    getPythonModule(node: SdsModule | undefined): string | undefined {
        const value = this.getParameterValue(node, this.PythonModule, 'qualifiedName');
        if (value instanceof StringConstant) {
            return value.value;
        } else {
            return undefined;
        }
    }

    get PythonModule(): SdsAnnotation | undefined {
        return this.getAnnotation(CODE_GENERATION_URI, 'PythonModule');
    }

    getPythonName(node: SdsAnnotatedObject | undefined): string | undefined {
        const value = this.getParameterValue(node, this.PythonName, 'name');
        if (value instanceof StringConstant) {
            return value.value;
        } else {
            return undefined;
        }
    }

    get PythonName(): SdsAnnotation | undefined {
        return this.getAnnotation(CODE_GENERATION_URI, 'PythonName');
    }

    callsRepeatable(node: SdsAnnotation | undefined): boolean {
        return hasAnnotationCallOf(node, this.Repeatable);
    }

    private get Repeatable(): SdsAnnotation | undefined {
        return this.getAnnotation(ANNOTATION_USAGE_URI, 'Repeatable');
    }

    streamValidTargets(node: SdsAnnotation | undefined): Stream<SdsEnumVariant> {
        // If no targets are specified, every target is valid
        if (!hasAnnotationCallOf(node, this.Targets)) {
            return stream(getEnumVariants(this.builtinEnums.AnnotationTarget));
        }

        // If targets are specified, but we could not evaluate them to a list, no target is valid
        const value = this.getParameterValue(node, this.Targets, 'targets');
        if (!(value instanceof EvaluatedList)) {
            return EMPTY_STREAM;
        }

        // Otherwise, filter the elements of the list and keep only variants of the AnnotationTarget enum
        return stream(value.elements)
            .filter(this.builtinEnums.isEvaluatedAnnotationTarget)
            .map((it) => it.variant);
    }

    get Targets(): SdsAnnotation | undefined {
        return this.getAnnotation(ANNOTATION_USAGE_URI, 'Targets');
    }

    private getAnnotation(uri: URI, name: string): SdsAnnotation | undefined {
        return this.getModuleMember(uri, name, isSdsAnnotation);
    }

    /**
     * Finds the first call of the given annotation on the given node and returns the value that is assigned to the
     * parameter with the given name.
     */
    private getParameterValue(
        node: SdsAnnotatedObject | undefined,
        annotation: SdsAnnotation | undefined,
        parameterName: string,
    ): EvaluatedNode {
        const annotationCall = findFirstAnnotationCallOf(node, annotation);
        if (!annotationCall) {
            return UnknownEvaluatedNode;
        }

        const parameterValue = this.nodeMapper.callToParameterValue(annotationCall, parameterName);
        return this.partialEvaluator.evaluate(parameterValue);
    }
}

interface DeprecationInfo {
    alternative?: string;
    reason?: string;
    sinceVersion?: string;
    removalVersion?: string;
}
