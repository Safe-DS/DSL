import { SafeDsServices } from '../safe-ds-module.js';
import {
    CallableType,
    ClassType,
    EnumType,
    EnumVariantType,
    LiteralType,
    NamedTupleEntry,
    NamedTupleType,
    NamedType,
    StaticType,
    Type,
    TypeParameterSubstitutions,
    TypeParameterType,
    UnionType,
} from './model.js';
import { Constant } from '../partialEvaluation/model.js';
import {
    SdsAbstractResult,
    SdsCallable,
    SdsClass,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsParameter,
    SdsTypeParameter,
} from '../generated/ast.js';

export class SafeDsTypeFactory {
    constructor(private readonly services: SafeDsServices) {}

    createCallableType(
        callable: SdsCallable,
        parameter: SdsParameter | undefined,
        inputType: NamedTupleType<SdsParameter>,
        outputType: NamedTupleType<SdsAbstractResult>,
    ): CallableType {
        return new CallableType(this.services, callable, parameter, inputType, outputType);
    }

    createClassType(
        declaration: SdsClass,
        substitutions: TypeParameterSubstitutions,
        isExplicitlyNullable: boolean,
    ): ClassType {
        return new ClassType(declaration, substitutions, isExplicitlyNullable);
    }

    createEnumType(declaration: SdsEnum, isExplicitlyNullable: boolean): EnumType {
        return new EnumType(declaration, isExplicitlyNullable);
    }

    createEnumVariantType(declaration: SdsEnumVariant, isExplicitlyNullable: boolean): EnumVariantType {
        return new EnumVariantType(declaration, isExplicitlyNullable);
    }

    createLiteralType(...constants: Constant[]): LiteralType {
        return new LiteralType(this.services, constants);
    }

    createNamedTupleType<T extends SdsDeclaration>(...entries: NamedTupleEntry<T>[]): NamedTupleType<T> {
        return new NamedTupleType(this.services, entries);
    }

    createStaticType(instanceType: NamedType<SdsDeclaration>): StaticType {
        return new StaticType(this.services, instanceType);
    }

    createTypeParameterType(declaration: SdsTypeParameter, isExplicitlyNullable: boolean): TypeParameterType {
        return new TypeParameterType(declaration, isExplicitlyNullable);
    }

    createUnionType(...types: Type[]): UnionType {
        return new UnionType(this.services, types);
    }
}
