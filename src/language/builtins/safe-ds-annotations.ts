import { isSdsAnnotation, SdsAnnotatedObject, SdsAnnotation, SdsModule, SdsParameter } from '../generated/ast.js';
import { argumentsOrEmpty, findFirstAnnotationCallOf, hasAnnotationCallOf } from '../helpers/nodeProperties.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';
import { resourceNameToUri } from '../../helpers/resources.js';
import { URI } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { toConstantExpressionOrUndefined } from '../partialEvaluation/toConstantExpressionOrUndefined.js';
import { SdsConstantExpression, SdsConstantString } from '../partialEvaluation/model.js';

const ANNOTATION_USAGE_URI = resourceNameToUri('builtins/safeds/lang/annotationUsage.sdsstub');
const CODE_GENERATION_URI = resourceNameToUri('builtins/safeds/lang/codeGeneration.sdsstub');
const IDE_INTEGRATION_URI = resourceNameToUri('builtins/safeds/lang/ideIntegration.sdsstub');
const MATURITY_URI = resourceNameToUri('builtins/safeds/lang/maturity.sdsstub');

export class SafeDsAnnotations extends SafeDsModuleMembers<SdsAnnotation> {
    private readonly nodeMapper: SafeDsNodeMapper;

    constructor(services: SafeDsServices) {
        super(services);

        this.nodeMapper = services.helpers.NodeMapper;
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

    getPythonModule(node: SdsModule | undefined): string | undefined {
        const value = this.getArgumentValue(node, this.PythonModule, 'qualifiedName');
        if (value instanceof SdsConstantString) {
            return value.value;
        } else {
            return undefined;
        }
    }

    private get PythonModule(): SdsAnnotation | undefined {
        return this.getAnnotation(CODE_GENERATION_URI, 'PythonModule');
    }

    getPythonName(node: SdsAnnotatedObject | undefined): string | undefined {
        const value = this.getArgumentValue(node, this.PythonName, 'name');
        if (value instanceof SdsConstantString) {
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
    ): SdsConstantExpression | undefined {
        const annotationCall = findFirstAnnotationCallOf(node, annotation);
        const expression = argumentsOrEmpty(annotationCall).find(
            (it) => this.nodeMapper.argumentToParameterOrUndefined(it)?.name === parameterName,
        )?.value;
        return toConstantExpressionOrUndefined(expression);
    }
}
