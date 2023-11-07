import { EMPTY_STREAM, getContainerOfType, Stream, stream, URI } from 'langium';
import { resourceNameToUri } from '../../helpers/resources.js';
import {
    isSdsAnnotation,
    isSdsEnum,
    SdsAnnotatedObject,
    SdsAnnotation,
    SdsEnumVariant,
    SdsFunction,
    SdsModule,
    SdsParameter,
} from '../generated/ast.js';
import {
    findFirstAnnotationCallOf,
    getArguments,
    getEnumVariants,
    getParameters,
    hasAnnotationCallOf,
} from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { EvaluatedEnumVariant, EvaluatedList, EvaluatedNode, StringConstant } from '../partialEvaluation/model.js';
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

    isDeprecated(node: SdsAnnotatedObject | undefined): boolean {
        return hasAnnotationCallOf(node, this.Deprecated);
    }

    private get Deprecated(): SdsAnnotation | undefined {
        return this.getAnnotation(MATURITY_URI, 'Deprecated');
    }

    isExperimental(node: SdsAnnotatedObject | undefined): boolean {
        return hasAnnotationCallOf(node, this.Experimental);
    }

    private get Experimental(): SdsAnnotation | undefined {
        return this.getAnnotation(MATURITY_URI, 'Experimental');
    }

    isExpert(node: SdsParameter | undefined): boolean {
        return hasAnnotationCallOf(node, this.Expert);
    }

    private get Expert(): SdsAnnotation | undefined {
        return this.getAnnotation(IDE_INTEGRATION_URI, 'Expert');
    }

    getPythonCall(node: SdsFunction | undefined): string | undefined {
        const value = this.getArgumentValue(node, this.PythonCall, 'callSpecification');
        if (value instanceof StringConstant) {
            return value.value;
        } else {
            return undefined;
        }
    }

    isPure(node: SdsFunction | SdsParameter | undefined): boolean {
        return hasAnnotationCallOf(node, this.Pure);
    }

    private get Pure(): SdsAnnotation | undefined {
        return this.getAnnotation(PURITY_URI, 'Pure');
    }

    get PythonCall(): SdsAnnotation | undefined {
        return this.getAnnotation(CODE_GENERATION_URI, 'PythonCall');
    }

    getPythonModule(node: SdsModule | undefined): string | undefined {
        const value = this.getArgumentValue(node, this.PythonModule, 'qualifiedName');
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
        const value = this.getArgumentValue(node, this.PythonName, 'name');
        if (value instanceof StringConstant) {
            return value.value;
        } else {
            return undefined;
        }
    }

    get PythonName(): SdsAnnotation | undefined {
        return this.getAnnotation(CODE_GENERATION_URI, 'PythonName');
    }

    isRepeatable(node: SdsAnnotation | undefined): boolean {
        return hasAnnotationCallOf(node, this.Repeatable);
    }

    private get Repeatable(): SdsAnnotation | undefined {
        return this.getAnnotation(ANNOTATION_USAGE_URI, 'Repeatable');
    }

    streamValidTargets(node: SdsAnnotation | undefined): Stream<SdsEnumVariant> {
        // If no targets are specified, every target is valid
        if (!hasAnnotationCallOf(node, this.Target)) {
            return stream(getEnumVariants(this.builtinEnums.AnnotationTarget));
        }

        // If targets are specified, but we could not evaluate them to a list, no target is valid
        const value = this.getArgumentValue(node, this.Target, 'targets');
        if (!(value instanceof EvaluatedList)) {
            return EMPTY_STREAM;
        }

        // Otherwise, filter the elements of the list and keep only variants of the AnnotationTarget enum
        return stream(value.elements)
            .filter(
                (it) =>
                    it instanceof EvaluatedEnumVariant &&
                    getContainerOfType(it.variant, isSdsEnum) === this.builtinEnums.AnnotationTarget,
            )
            .map((it) => (<EvaluatedEnumVariant>it).variant);
    }

    get Target(): SdsAnnotation | undefined {
        return this.getAnnotation(ANNOTATION_USAGE_URI, 'Target');
    }

    private getAnnotation(uri: URI, name: string): SdsAnnotation | undefined {
        return this.getModuleMember(uri, name, isSdsAnnotation);
    }

    /**
     * Finds the first call of the given annotation on the given node and returns the value that is assigned to the
     * parameter with the given name.
     */
    private getArgumentValue(
        node: SdsAnnotatedObject | undefined,
        annotation: SdsAnnotation | undefined,
        parameterName: string,
    ): EvaluatedNode {
        const annotationCall = findFirstAnnotationCallOf(node, annotation);

        // Parameter is set explicitly
        const argument = getArguments(annotationCall).find(
            (it) => this.nodeMapper.argumentToParameter(it)?.name === parameterName,
        );
        if (argument) {
            return this.partialEvaluator.evaluate(argument.value);
        }

        // Parameter is not set explicitly, so we use the default value
        const parameter = getParameters(annotation).find((it) => it.name === parameterName);
        return this.partialEvaluator.evaluate(parameter?.defaultValue);
    }
}
