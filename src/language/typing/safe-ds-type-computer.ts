import { AstNode } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import {SafeDsCoreClasses} from "../builtins/safe-ds-core-classes.js";

export class SafeDsTypeComputer {
    // TODO cache types in a workspace cache

    readonly coreClasses: SafeDsCoreClasses;

    constructor(readonly services: SafeDsServices) {
        this.coreClasses = services.builtins.CoreClasses;
    }

    computeType(node: AstNode): Type {
        return computeType(node);
    }
}

export const computeType = (_node: AstNode): Type => {
    return {
        equals(_other: Type): boolean {
            return true;
        },

        toString(): string {
            return 'test';
        },
    };
};

interface Type {
    equals(other: Type): boolean;

    toString(): string;
}

// TODO create a class that accepts the services and add it to the module as an added service
