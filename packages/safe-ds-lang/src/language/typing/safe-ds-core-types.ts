import { WorkspaceCache } from 'langium';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { SdsClass } from '../generated/ast.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { ClassType, Type, TypeParameterSubstitutions, UnknownType } from './model.js';
import { getTypeParameters } from '../helpers/nodeProperties.js';

export class SafeDsCoreTypes {
    private readonly builtinClasses: SafeDsClasses;
    private readonly cache: WorkspaceCache<string, Type>;

    constructor(services: SafeDsServices) {
        this.builtinClasses = services.builtins.Classes;
        this.cache = new WorkspaceCache(services.shared);
    }

    get Any(): Type {
        return this.createCoreType(this.builtinClasses.Any, false);
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

    get Image(): Type {
        return this.createCoreType(this.builtinClasses.Image);
    }

    get Int(): Type {
        return this.createCoreType(this.builtinClasses.Int);
    }

    List(elementType: Type): Type {
        const list = this.builtinClasses.List;
        const elementTypeParameter = getTypeParameters(list)[0];

        if (!list || !elementTypeParameter) {
            /* c8 ignore next 2 */
            return UnknownType;
        }

        let substitutions = new Map([[elementTypeParameter, elementType]]);
        return new ClassType(list, substitutions, false);
    }

    Map(keyType: Type, valueType: Type): Type {
        const map = this.builtinClasses.Map;
        const keyTypeParameter = getTypeParameters(map)[0];
        const valueTypeParameter = getTypeParameters(map)[1];

        if (!map || !keyTypeParameter || !valueTypeParameter) {
            /* c8 ignore next 2 */
            return UnknownType;
        }

        const substitutions = new Map([
            [keyTypeParameter, keyType],
            [valueTypeParameter, valueType],
        ]);
        return new ClassType(map, substitutions, false);
    }

    get Nothing(): Type {
        return this.createCoreType(this.builtinClasses.Nothing, false);
    }

    get NothingOrNull(): Type {
        return this.createCoreType(this.builtinClasses.Nothing, true);
    }

    get Number(): Type {
        return this.createCoreType(this.builtinClasses.Number);
    }

    get String(): Type {
        return this.createCoreType(this.builtinClasses.String);
    }

    get Table(): Type {
        return this.createCoreType(this.builtinClasses.Table);
    }

    private createCoreType(coreClass: SdsClass | undefined, isNullable: boolean = false): Type {
        if (!coreClass) {
            /* c8 ignore next 2 */
            return UnknownType;
        }

        const key = `${coreClass.name}~${isNullable}`;
        return this.cache.get(key, () => new ClassType(coreClass, NO_SUBSTITUTIONS, isNullable));
    }
}

const NO_SUBSTITUTIONS: TypeParameterSubstitutions = new Map();
