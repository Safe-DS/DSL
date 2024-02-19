import { isEmpty } from '../../helpers/collections.js';
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
import { getTypeParameters, Parameter } from '../helpers/nodeProperties.js';
import { Constant, NullConstant } from '../partialEvaluation/model.js';
import { stream } from 'langium';
import { SafeDsCoreTypes } from './safe-ds-core-types.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeFactory } from './safe-ds-type-factory.js';

export type TypeParameterSubstitutions = Map<SdsTypeParameter, Type>;

/**
 * The type of an AST node.
 */
export abstract class Type {
    /**
     * Whether this type is explicitly marked as nullable (e.g. using a `?` for named types). A type parameter type can
     * also become nullable if its upper bound is nullable, which is not covered here. Use {@link TypeChecker.canBeNull}
     * if you need to cover this.
     */
    abstract isExplicitlyNullable: boolean;

    /**
     * Returns whether the type is equal to another type.
     */
    abstract equals(other: unknown): boolean;

    /**
     * Returns a string representation of this type.
     */
    abstract toString(): string;

    /**
     * Returns a copy of this type with the given type parameters substituted.
     */
    abstract substituteTypeParameters(substitutions: TypeParameterSubstitutions): Type;

    /**
     * Removes any unnecessary containers from the type.
     */
    abstract unwrap(): Type;

    /**
     * Returns a copy of this type with the given nullability.
     */
    abstract updateExplicitNullability(isExplicitlyNullable: boolean): Type;
}

export class CallableType extends Type {
    private readonly factory: SafeDsTypeFactory;
    override isExplicitlyNullable: boolean = false;

    constructor(
        services: SafeDsServices,
        readonly callable: SdsCallable,
        readonly parameter: SdsParameter | undefined,
        readonly inputType: NamedTupleType<SdsParameter>,
        readonly outputType: NamedTupleType<SdsAbstractResult>,
    ) {
        super();

        this.factory = services.types.TypeFactory;
    }

    /**
     * Returns the type of the parameter at the given index. If the index is out of bounds, returns `undefined`.
     */
    getParameterTypeByIndex(index: number): Type {
        return this.inputType.getTypeOfEntryByIndex(index);
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof CallableType)) {
            return false;
        }

        return (
            other.callable === this.callable &&
            other.parameter === this.parameter &&
            other.inputType.equals(this.inputType) &&
            other.outputType.equals(this.outputType)
        );
    }

    override toString(): string {
        const inputTypeString = this.inputType.entries
            .map((it) => `${it.name}${Parameter.isOptional(it.declaration) ? '?' : ''}: ${it.type}`)
            .join(', ');

        return `(${inputTypeString}) -> ${this.outputType}`;
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): CallableType {
        if (isEmpty(substitutions)) {
            return this;
        }

        return this.factory.createCallableType(
            this.callable,
            this.parameter,
            this.inputType.substituteTypeParameters(substitutions),
            this.outputType.substituteTypeParameters(substitutions),
        );
    }

    override unwrap(): CallableType {
        return this.factory.createCallableType(
            this.callable,
            this.parameter,
            this.factory.createNamedTupleType(...this.inputType.entries.map((it) => it.unwrap())),
            this.factory.createNamedTupleType(...this.outputType.entries.map((it) => it.unwrap())),
        );
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): Type {
        if (!isExplicitlyNullable) {
            return this;
        }

        return this.factory.createUnionType(this, this.factory.createLiteralType(NullConstant));
    }
}

export class IntersectionType extends Type {
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly factory: SafeDsTypeFactory;

    readonly types: Type[];
    private _isExplicitlyNullable: boolean | undefined;

    constructor(services: SafeDsServices, types: Type[]) {
        super();

        this.coreTypes = services.types.CoreTypes;
        this.factory = services.types.TypeFactory;

        this.types = types;
    }

    override get isExplicitlyNullable(): boolean {
        if (this._isExplicitlyNullable === undefined) {
            this._isExplicitlyNullable = this.types.every((it) => it.isExplicitlyNullable);
        }

        return this._isExplicitlyNullable;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof IntersectionType)) {
            return false;
        }

        return this.types.length === other.types.length && this.types.every((type, i) => type.equals(other.types[i]));
    }

    override toString(): string {
        return `$intersection<${this.types.join(', ')}>`;
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): IntersectionType {
        if (isEmpty(substitutions)) {
            return this;
        }

        return this.factory.createIntersectionType(
            ...this.types.map((it) => it.substituteTypeParameters(substitutions)),
        );
    }

    override unwrap(): Type {
        // Flatten nested intersections
        const newTypes = this.types.flatMap((type) => {
            const unwrappedType = type.unwrap();
            if (unwrappedType instanceof IntersectionType) {
                return unwrappedType.types;
            } else {
                return unwrappedType;
            }
        });

        // Remove the outer intersection if there's only one type left
        if (newTypes.length === 1) {
            return newTypes[0]!;
        }

        return this.factory.createIntersectionType(...newTypes);
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): Type {
        if (this.isExplicitlyNullable && !isExplicitlyNullable) {
            if (isEmpty(this.types)) {
                return this.coreTypes.Any;
            } else {
                return this.factory.createIntersectionType(
                    ...this.types.map((it) => it.updateExplicitNullability(false)),
                );
            }
        } else if (!this.isExplicitlyNullable && isExplicitlyNullable) {
            return this.factory.createIntersectionType(...this.types.map((it) => it.updateExplicitNullability(true)));
        } else {
            return this;
        }
    }
}

export class LiteralType extends Type {
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly factory: SafeDsTypeFactory;

    readonly constants: Constant[];
    private _isExplicitlyNullable: boolean | undefined;

    constructor(services: SafeDsServices, constants: Constant[]) {
        super();

        this.coreTypes = services.types.CoreTypes;
        this.factory = services.types.TypeFactory;

        this.constants = constants;
    }

    override get isExplicitlyNullable(): boolean {
        if (this._isExplicitlyNullable === undefined) {
            this._isExplicitlyNullable = this.constants.some((it) => it === NullConstant);
        }

        return this._isExplicitlyNullable;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof LiteralType)) {
            return false;
        }

        return (
            this.constants.length === other.constants.length &&
            this.constants.every((constant, i) => constant.equals(other.constants[i]))
        );
    }

    override toString(): string {
        return `literal<${this.constants.join(', ')}>`;
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): Type {
        return this;
    }

    override unwrap(): LiteralType {
        return this;
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): LiteralType {
        if (this.isExplicitlyNullable && !isExplicitlyNullable) {
            return this.factory.createLiteralType(...this.constants.filter((it) => it !== NullConstant));
        } else if (!this.isExplicitlyNullable && isExplicitlyNullable) {
            return this.factory.createLiteralType(...this.constants, NullConstant);
        } else {
            return this;
        }
    }
}

export class NamedTupleType<T extends SdsDeclaration> extends Type {
    private readonly factory: SafeDsTypeFactory;
    readonly entries: NamedTupleEntry<T>[];
    override readonly isExplicitlyNullable = false;

    constructor(services: SafeDsServices, entries: NamedTupleEntry<T>[]) {
        super();

        this.factory = services.types.TypeFactory;
        this.entries = entries;
    }

    /**
     * The length of this tuple.
     */
    get length(): number {
        return this.entries.length;
    }

    /**
     * Returns the type of the entry at the given index. If the index is out of bounds, returns `undefined`.
     */
    getTypeOfEntryByIndex(index: number): Type {
        return this.entries[index]?.type ?? UnknownType;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof NamedTupleType)) {
            return false;
        }

        return (
            this.entries.length === other.entries.length &&
            this.entries.every((entry, i) => entry.equals(other.entries[i]))
        );
    }

    override toString(): string {
        return `(${this.entries.join(', ')})`;
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): NamedTupleType<T> {
        if (isEmpty(substitutions)) {
            return this;
        }

        return this.factory.createNamedTupleType(
            ...this.entries.map((it) => it.substituteTypeParameters(substitutions)),
        );
    }

    /**
     * If this only has one entry, returns its type. Otherwise, returns this.
     */
    override unwrap(): Type {
        if (this.entries.length === 1) {
            return this.entries[0]!.type.unwrap();
        }

        return this.factory.createNamedTupleType(...this.entries.map((it) => it.unwrap()));
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): Type {
        if (!isExplicitlyNullable) {
            return this;
        }

        return this.factory.createUnionType(this, this.factory.createLiteralType(NullConstant));
    }
}

export class NamedTupleEntry<T extends SdsDeclaration> {
    constructor(
        readonly declaration: T | undefined,
        readonly name: string,
        readonly type: Type,
    ) {}

    equals(other: unknown): boolean {
        /* c8 ignore start */
        if (other === this) {
            return true;
        } else if (!(other instanceof NamedTupleEntry)) {
            return false;
        }
        /* c8 ignore stop */

        return this.declaration === other.declaration && this.name === other.name && this.type.equals(other.type);
    }

    toString(): string {
        return `${this.name}: ${this.type}`;
    }

    substituteTypeParameters(substitutions: TypeParameterSubstitutions): NamedTupleEntry<T> {
        if (isEmpty(substitutions)) {
            /* c8 ignore next 2 */
            return this;
        }

        return new NamedTupleEntry(this.declaration, this.name, this.type.substituteTypeParameters(substitutions));
    }

    unwrap(): NamedTupleEntry<T> {
        return new NamedTupleEntry(this.declaration, this.name, this.type.unwrap());
    }
}

export abstract class NamedType<T extends SdsDeclaration> extends Type {
    protected constructor(readonly declaration: T) {
        super();
    }

    override toString(): string {
        if (this.isExplicitlyNullable) {
            return `${this.declaration.name}?`;
        } else {
            return this.declaration.name;
        }
    }

    abstract override updateExplicitNullability(isExplicitlyNullable: boolean): NamedType<T>;

    unwrap(): NamedType<T> {
        return this;
    }
}

export class ClassType extends NamedType<SdsClass> {
    constructor(
        declaration: SdsClass,
        readonly substitutions: TypeParameterSubstitutions,
        override readonly isExplicitlyNullable: boolean,
    ) {
        super(declaration);
    }

    getTypeParameterTypeByIndex(index: number): Type {
        const typeParameter = getTypeParameters(this.declaration)[index];
        if (!typeParameter) {
            return UnknownType;
        }

        return this.substitutions.get(typeParameter) ?? UnknownType;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof ClassType)) {
            return false;
        }

        return (
            other.declaration === this.declaration &&
            other.isExplicitlyNullable === this.isExplicitlyNullable &&
            substitutionsAreEqual(other.substitutions, this.substitutions)
        );
    }

    override toString(): string {
        let result = this.declaration.name;

        if (this.substitutions.size > 0) {
            result += `<${Array.from(this.substitutions.values())
                .map((value) => value.toString())
                .join(', ')}>`;
        }

        if (this.isExplicitlyNullable) {
            result += '?';
        }

        return result;
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): ClassType {
        if (isEmpty(substitutions)) {
            return this;
        }

        const newSubstitutions = new Map(
            stream(this.substitutions).map(([key, value]) => [key, value.substituteTypeParameters(substitutions)]),
        );

        return new ClassType(this.declaration, newSubstitutions, this.isExplicitlyNullable);
    }

    override unwrap(): ClassType {
        const newSubstitutions = new Map(stream(this.substitutions).map(([key, value]) => [key, value.unwrap()]));
        return new ClassType(this.declaration, newSubstitutions, this.isExplicitlyNullable);
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): ClassType {
        if (this.isExplicitlyNullable === isExplicitlyNullable) {
            return this;
        }

        return new ClassType(this.declaration, this.substitutions, isExplicitlyNullable);
    }
}

export class EnumType extends NamedType<SdsEnum> {
    constructor(
        declaration: SdsEnum,
        override readonly isExplicitlyNullable: boolean,
    ) {
        super(declaration);
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EnumType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isExplicitlyNullable === this.isExplicitlyNullable;
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): Type {
        return this;
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): EnumType {
        if (this.isExplicitlyNullable === isExplicitlyNullable) {
            return this;
        }

        return new EnumType(this.declaration, isExplicitlyNullable);
    }
}

export class EnumVariantType extends NamedType<SdsEnumVariant> {
    constructor(
        declaration: SdsEnumVariant,
        override readonly isExplicitlyNullable: boolean,
    ) {
        super(declaration);
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EnumVariantType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isExplicitlyNullable === this.isExplicitlyNullable;
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): Type {
        return this;
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): EnumVariantType {
        if (this.isExplicitlyNullable === isExplicitlyNullable) {
            return this;
        }

        return new EnumVariantType(this.declaration, isExplicitlyNullable);
    }
}

export class TypeParameterType extends NamedType<SdsTypeParameter> {
    constructor(
        declaration: SdsTypeParameter,
        override readonly isExplicitlyNullable: boolean,
    ) {
        super(declaration);
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof TypeParameterType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isExplicitlyNullable === this.isExplicitlyNullable;
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): Type {
        const substitution = substitutions.get(this.declaration);

        if (!substitution) {
            return this;
        } else if (this.isExplicitlyNullable) {
            return substitution.updateExplicitNullability(true);
        } else {
            return substitution;
        }
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): TypeParameterType {
        if (this.isExplicitlyNullable === isExplicitlyNullable) {
            return this;
        }

        return new TypeParameterType(this.declaration, isExplicitlyNullable);
    }
}

/**
 * A type that represents an actual class, enum, or enum variant instead of an instance of it.
 */
export class StaticType extends Type {
    private readonly factory: SafeDsTypeFactory;

    override readonly isExplicitlyNullable = false;

    constructor(
        services: SafeDsServices,
        readonly instanceType: NamedType<SdsDeclaration>,
    ) {
        super();

        this.factory = services.types.TypeFactory;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof StaticType)) {
            return false;
        }

        return other.instanceType.equals(this.instanceType);
    }

    override toString(): string {
        return `$type<${this.instanceType}>`;
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): StaticType {
        // The substitutions are only meaningful for instances of a declaration, not for the declaration itself. Hence,
        // we don't substitute anything here.
        return this;
    }

    override unwrap(): Type {
        return this;
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): Type {
        if (!isExplicitlyNullable) {
            return this;
        }

        return this.factory.createUnionType(this, this.factory.createLiteralType(NullConstant));
    }
}

export class UnionType extends Type {
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly factory: SafeDsTypeFactory;

    readonly types: Type[];
    private _isExplicitlyNullable: boolean | undefined;

    constructor(services: SafeDsServices, types: Type[]) {
        super();

        this.coreTypes = services.types.CoreTypes;
        this.factory = services.types.TypeFactory;

        this.types = types;
    }

    override get isExplicitlyNullable(): boolean {
        if (this._isExplicitlyNullable === undefined) {
            this._isExplicitlyNullable = this.types.some((it) => it.isExplicitlyNullable);
        }

        return this._isExplicitlyNullable;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof UnionType)) {
            return false;
        }

        return this.types.length === other.types.length && this.types.every((type, i) => type.equals(other.types[i]));
    }

    override toString(): string {
        return `union<${this.types.join(', ')}>`;
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): UnionType {
        if (isEmpty(substitutions)) {
            return this;
        }

        return this.factory.createUnionType(...this.types.map((it) => it.substituteTypeParameters(substitutions)));
    }

    override unwrap(): Type {
        // Flatten nested unions
        const newTypes = this.types.flatMap((type) => {
            const unwrappedType = type.unwrap();
            if (unwrappedType instanceof UnionType) {
                return unwrappedType.types;
            } else {
                return unwrappedType;
            }
        });

        // Remove the outer union if there's only one type left
        if (newTypes.length === 1) {
            return newTypes[0]!;
        }

        return this.factory.createUnionType(...newTypes);
    }

    override updateExplicitNullability(isExplicitlyNullable: boolean): Type {
        if (this.isExplicitlyNullable && !isExplicitlyNullable) {
            return this.factory.createUnionType(...this.types.map((it) => it.updateExplicitNullability(false)));
        } else if (!this.isExplicitlyNullable && isExplicitlyNullable) {
            if (isEmpty(this.types)) {
                return this.coreTypes.NothingOrNull;
            } else {
                return this.factory.createUnionType(...this.types.map((it) => it.updateExplicitNullability(true)));
            }
        } else {
            return this;
        }
    }
}

class UnknownTypeClass extends Type {
    readonly isExplicitlyNullable = false;

    override equals(other: unknown): boolean {
        return other instanceof UnknownTypeClass;
    }

    override toString(): string {
        return '$unknown';
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): Type {
        return this;
    }

    override unwrap(): Type {
        return this;
    }

    override updateExplicitNullability(_isExplicitlyNullable: boolean): Type {
        return this;
    }
}

export const UnknownType = new UnknownTypeClass();

// -------------------------------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------------------------------

const substitutionsAreEqual = (
    a: Map<SdsDeclaration, Type> | undefined,
    b: Map<SdsDeclaration, Type> | undefined,
): boolean => {
    if (a?.size !== b?.size) {
        return false;
    }

    const aEntries = Array.from(a?.entries() ?? []);
    const bEntries = Array.from(b?.entries() ?? []);

    return aEntries.every(([aEntry, aValue], i) => {
        const [bEntry, bValue] = bEntries[i]!;
        return aEntry === bEntry && aValue.equals(bValue);
    });
};
