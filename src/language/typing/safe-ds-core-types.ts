import { WorkspaceCache } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { ClassType, Type, UnknownType } from './model.js';
import { SdsClass } from '../generated/ast.js';

export class SafeDsCoreTypes {
    private readonly builtinClasses: SafeDsClasses;
    private readonly cache: WorkspaceCache<string, Type>;

    constructor(services: SafeDsServices) {
        this.builtinClasses = services.builtins.Classes;
        this.cache = new WorkspaceCache(services.shared);
    }

    get AnyOrNull(): Type {
        return this.createCoreType(this.builtinClasses.Any, true);
    }

    get Boolean(): Type {
        return this.createCoreType(this.builtinClasses.Boolean);
    }

    get Float(): Type {
        return this.createCoreType(this.builtinClasses.Float);
    }

    get Int(): Type {
        return this.createCoreType(this.builtinClasses.Int);
    }

    get List(): Type {
        return this.createCoreType(this.builtinClasses.List);
    }

    get Map(): Type {
        return this.createCoreType(this.builtinClasses.Map);
    }

    /* c8 ignore start */
    get NothingOrNull(): Type {
        return this.createCoreType(this.builtinClasses.Nothing, true);
    }
    /* c8 ignore stop */

    get String(): Type {
        return this.createCoreType(this.builtinClasses.String);
    }

    private createCoreType(coreClass: SdsClass | undefined, isNullable: boolean = false): Type {
        /* c8 ignore start */
        if (!coreClass) {
            return UnknownType;
        }
        /* c8 ignore stop */

        const key = `${coreClass.name}~${isNullable}`;
        return this.cache.get(key, () => new ClassType(coreClass, isNullable));
    }
}
