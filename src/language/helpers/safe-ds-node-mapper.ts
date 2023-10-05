import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import {isSdsAnnotationCall, isSdsCall, isSdsCallable, SdsAbstractCall, SdsCallable} from "../generated/ast.js";
import {CallableType, StaticType} from "../typing/model.js";

export class SafeDsNodeMapper {
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.typeComputer = new SafeDsTypeComputer(services);
    }

    callToCallableOrNull(node: SdsAbstractCall | undefined): SdsCallable | null {
        if (isSdsAnnotationCall(node)) {
            return node.annotation?.ref ?? null;
        } else if (isSdsCall(node)) {
            const receiverType = this.typeComputer.computeType(node.receiver);
            if (receiverType instanceof CallableType) {
                return receiverType.sdsCallable;
            } else if (receiverType instanceof StaticType) {
                const declaration = receiverType.instanceType.sdsDeclaration;
                if (isSdsCallable(declaration)) {
                    return declaration;
                }
            }

            return null;
        } else {
            return null;
        }
    }
}
