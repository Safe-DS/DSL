import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsNodeMapper } from './safe-ds-node-mapper.js';
import {
    isSdsCall,
    isSdsClass,
    isSdsEnumVariant,
    isSdsExpressionLambda,
    isSdsMemberAccess,
    isSdsReference,
    SdsExpression,
} from '../generated/ast.js';
import { getAbstractResults } from './nodeProperties.js';

export class SafeDsSyntheticProperties {
    private readonly nodeMapper: SafeDsNodeMapper;

    constructor(services: SafeDsServices) {
        this.nodeMapper = services.helpers.NodeMapper;
    }

    /**
     * Get readable value names for an expression. Only one name is returned unless the expression is a named tuple.
     */
    getValueNamesForExpression(node: SdsExpression): string[] {
        if (isSdsCall(node)) {
            const callable = this.nodeMapper.callToCallable(node);
            if (isSdsClass(callable)) {
                return [callable.name];
            } else if (isSdsEnumVariant(callable)) {
                return [callable.name];
            } else if (isSdsExpressionLambda(callable)) {
                return [`result`];
            } else {
                return getAbstractResults(callable).map((it) => it.name);
            }
        } else if (isSdsMemberAccess(node)) {
            const declarationName = node.member?.target?.ref?.name;
            if (declarationName) {
                return [declarationName];
            }
        } else if (isSdsReference(node)) {
            const declarationName = node.target.ref?.name;
            if (declarationName) {
                return [declarationName];
            }
        }

        return ['expression'];
    }
}
