import { AstUtils, URI } from 'langium';
import { resourceNameToUri } from '../../helpers/resources.js';
import { isSdsEnum, SdsEnum, type SdsEnumVariant } from '../generated/ast.js';
import { getEnumVariants } from '../helpers/nodeProperties.js';
import { EvaluatedEnumVariant, EvaluatedNode } from '../partialEvaluation/model.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';

const ANNOTATION_USAGE_URI = resourceNameToUri('builtins/safeds/lang/annotationUsage.sdsstub');
const IDE_INTEGRATION_URI = resourceNameToUri('builtins/safeds/lang/ideIntegration.sdsstub');
const PURITY_URI = resourceNameToUri('builtins/safeds/lang/purity.sdsstub');

export class SafeDsEnums extends SafeDsModuleMembers<SdsEnum> {
    // AnnotationTarget ------------------------------------------------------------------------------------------------

    get AnnotationTarget(): SdsEnum | undefined {
        return this.getEnum(ANNOTATION_USAGE_URI, 'AnnotationTarget');
    }

    isEvaluatedAnnotationTarget = (node: EvaluatedNode): node is EvaluatedEnumVariant =>
        node instanceof EvaluatedEnumVariant &&
        AstUtils.getContainerOfType(node.variant, isSdsEnum) === this.AnnotationTarget;

    // DataScienceCategory ---------------------------------------------------------------------------------------------

    get DataScienceCategory(): SdsEnum | undefined {
        return this.getEnum(IDE_INTEGRATION_URI, 'DataScienceCategory');
    }

    isEvaluatedDataScienceCategory = (node: EvaluatedNode): node is EvaluatedEnumVariant =>
        node instanceof EvaluatedEnumVariant &&
        AstUtils.getContainerOfType(node.variant, isSdsEnum) === this.DataScienceCategory;

    // ImpurityReason --------------------------------------------------------------------------------------------------

    get ImpurityReason(): SdsEnum | undefined {
        return this.getEnum(PURITY_URI, 'ImpurityReason');
    }

    isEvaluatedImpurityReason = (node: EvaluatedNode): node is EvaluatedEnumVariant =>
        node instanceof EvaluatedEnumVariant &&
        AstUtils.getContainerOfType(node.variant, isSdsEnum) === this.ImpurityReason;

    // Helpers ---------------------------------------------------------------------------------------------------------

    private getEnum(uri: URI, name: string): SdsEnum | undefined {
        return this.getModuleMember(uri, name, isSdsEnum);
    }
}

export class SafeDsImpurityReasons {
    private readonly builtinEnums: SafeDsEnums;

    constructor(services: SafeDsServices) {
        this.builtinEnums = services.builtins.Enums;
    }

    get FileReadFromConstantPath(): SdsEnumVariant | undefined {
        return this.getEnumVariant('FileReadFromConstantPath');
    }

    get FileReadFromParameterizedPath(): SdsEnumVariant | undefined {
        return this.getEnumVariant('FileReadFromParameterizedPath');
    }

    get FileWriteToConstantPath(): SdsEnumVariant | undefined {
        return this.getEnumVariant('FileWriteToConstantPath');
    }

    get FileWriteToParameterizedPath(): SdsEnumVariant | undefined {
        return this.getEnumVariant('FileWriteToParameterizedPath');
    }

    get PotentiallyImpureParameterCall(): SdsEnumVariant | undefined {
        return this.getEnumVariant('PotentiallyImpureParameterCall');
    }

    get Other(): SdsEnumVariant | undefined {
        return this.getEnumVariant('Other');
    }

    private getEnumVariant(name: string): SdsEnumVariant | undefined {
        return getEnumVariants(this.builtinEnums.ImpurityReason).find((variant) => variant.name === name);
    }
}
