import { SdsIndexedAccess } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { EvaluatedList, EvaluatedMap, IntConstant } from '../../../partialEvaluation/model.js';

export const CODE_INDEXED_ACCESS_INVALID_INDEX = 'indexed-access/invalid-index';

export const indexedAccessIndexMustBeValid = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const partialEvaluator = services.evaluation.PartialEvaluator;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
        const indexValue = partialEvaluator.evaluate(node.index);
        if (!indexValue.isFullyEvaluated) {
            return;
        }

        const receiverValue = partialEvaluator.evaluate(node.receiver);

        // Check map key
        if (receiverValue instanceof EvaluatedMap) {
            if (!receiverValue.has(indexValue)) {
                accept('error', `Map key '${indexValue}' does not exist.`, {
                    node,
                    property: 'index',
                    code: CODE_INDEXED_ACCESS_INVALID_INDEX,
                });
            }
            return;
        }

        // Check list index
        if (!(indexValue instanceof IntConstant)) {
            return;
        }

        if (receiverValue instanceof EvaluatedList) {
            if (indexValue.value < 0 || indexValue.value >= receiverValue.size) {
                accept('error', `List index '${indexValue}' is out of bounds.`, {
                    node,
                    property: 'index',
                    code: CODE_INDEXED_ACCESS_INVALID_INDEX,
                });
            }
        }

        const receiverType = typeComputer.computeType(node.receiver);
        if (receiverType.equals(coreTypes.List)) {
            if (indexValue.value < 0) {
                accept('error', `List index '${indexValue}' is out of bounds.`, {
                    node,
                    property: 'index',
                    code: CODE_INDEXED_ACCESS_INVALID_INDEX,
                });
            }
        }
    };
};
