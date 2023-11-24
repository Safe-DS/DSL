import { SdsIndexedAccess } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { EvaluatedList, EvaluatedMap, IntConstant } from '../../../partialEvaluation/model.js';

export const CODE_INDEXED_ACCESS_INVALID_INDEX = 'indexed-access/invalid-index';

export const indexedAccessIndexMustBeValid = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const partialEvaluator = services.evaluation.PartialEvaluator;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
        const indexValue = partialEvaluator.evaluate(node.index);
        if (!indexValue.isFullyEvaluated) {
            return;
        }

        const receiverValue = partialEvaluator.evaluate(node.receiver);
        console.log(receiverValue.toString());
        if (indexValue instanceof IntConstant && receiverValue instanceof EvaluatedList) {
            if (receiverValue.size) {
            }
        } else if (receiverValue instanceof EvaluatedMap) {
            if (!receiverValue.has(indexValue)) {
                accept('error', `Map key '${indexValue}' does not exist.`, { node, property: 'index' });
            }
        }
    };
};
