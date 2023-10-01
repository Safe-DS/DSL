import { AstNode, AstNodeLocator, getDocument, WorkspaceCache } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsCoreClasses } from '../builtins/safe-ds-core-classes.js';
import { ClassType, Type, UnresolvedType } from './model.js';
import {
    isSdsBoolean,
    isSdsFloat,
    isSdsInt,
    isSdsNull,
    isSdsString,
    isSdsTemplateString,
    SdsClass
} from '../generated/ast.js';

export class SafeDsTypeComputer {
    readonly astNodeLocator: AstNodeLocator;
    readonly coreClasses: SafeDsCoreClasses;

    readonly typeCache: WorkspaceCache<string, Type>;

    constructor(readonly services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.coreClasses = services.builtins.CoreClasses;

        this.typeCache = new WorkspaceCache(services.shared);
    }

    computeType(node: AstNode): Type {
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        return this.typeCache.get(key, () => this.doComputeType(node));
    }

    private doComputeType(node: AstNode): Type {
        // Terminal cases
        if (node === undefined) {
            return UnresolvedType;
        } else if (isSdsBoolean(node)) {
            return this.Boolean();
        } else if (isSdsFloat(node)) {
            return this.Float();
        } else if (isSdsInt(node)) {
            return this.Int();
        } else if (isSdsNull(node)) {
            return this.Nothing(true);
        } else if (isSdsString(node)) {
            return this.String();
        } else if (isSdsTemplateString(node)) {
            return this.String();
        }

        return UnresolvedType;
    }

    private cachedAny: Type = UnresolvedType;

    private Any(): Type {
        if (this.cachedAny === UnresolvedType) {
            this.cachedAny = this.createCoreType(this.coreClasses.Any);
        }
        return this.cachedAny;
    }

    private cachedBoolean: Type = UnresolvedType;

    private Boolean(): Type {
        if (this.cachedBoolean === UnresolvedType) {
            this.cachedBoolean = this.createCoreType(this.coreClasses.Boolean);
        }
        return this.cachedBoolean;
    }

    private cachedFloat: Type = UnresolvedType;

    private Float(): Type {
        if (this.cachedFloat === UnresolvedType) {
            this.cachedFloat = this.createCoreType(this.coreClasses.Float);
        }
        return this.cachedFloat;
    }

    private cachedInt: Type = UnresolvedType;

    private Int(): Type {
        if (this.cachedInt === UnresolvedType) {
            this.cachedInt = this.createCoreType(this.coreClasses.Int);
        }
        return this.cachedInt;
    }

    private cachedNullableNothing: Type = UnresolvedType;
    private cachedNothing: Type = UnresolvedType;

    private Nothing(isNullable: boolean): Type {
        if (isNullable) {
            if (this.cachedNullableNothing === UnresolvedType) {
                this.cachedNullableNothing = this.createCoreType(this.coreClasses.Nothing, true);
            }
            return this.cachedNullableNothing;
        } else {
            if (this.cachedNothing === UnresolvedType) {
                this.cachedNothing = this.createCoreType(this.coreClasses.Nothing);
            }
            return this.cachedNothing;
        }
    }

    private cachedString: Type = UnresolvedType;

    private String(): Type {
        if (this.cachedString === UnresolvedType) {
            this.cachedString = this.createCoreType(this.coreClasses.String);
        }
        return this.cachedString;
    }

    private createCoreType(coreClass: SdsClass | undefined, isNullable: boolean = false): Type {
        if (coreClass) {
            return new ClassType(coreClass, isNullable);
        } else {
            return UnresolvedType;
        }
    }
}
