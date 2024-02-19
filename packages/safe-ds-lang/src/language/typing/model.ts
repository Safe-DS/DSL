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
import { SafeDsTypeChecker } from './safe-ds-type-checker.js';

export type TypeParameterSubstitutions = Map<SdsTypeParameter, Type>;

/**
 * The type of an AST node.
 */
export abstract class Type {
    /**
     * Whether this type is explicitly marked as nullable (e.g. using a `?` for named types). A type parameter type can
     * also become nullable if its upper bound is nullable, which is not checked here. Use {@link TypeChecker.canBeNull}
     * if this is relevant for your situation.
     */
    abstract isExplicitlyNullable: boolean;

    /**
     * Whether the type does not contain type parameter types anymore.
     */
    abstract isFullySubstituted: boolean;

    /**
     * Returns whether the type is equal to another type.
     */
    abstract equals(other: unknown): boolean;

    /**
     * Returns a string representation of this type.
     */
    abstract toString(): string;

    /**
     * Returns an equivalent type that is simplified as much as possible. Types computed by
     * {@link TypeComputer.computeType} are already simplified, so this method is mainly useful for types that are
     * constructed or modified manually.
     */
    abstract simplify(): Type;

    /**
     * Returns a copy of this type with the given type parameters substituted.
     */
    abstract substituteTypeParameters(substitutions: TypeParameterSubstitutions): Type;

    /**
     * Returns a copy of this type with the given nullability.
     */
    abstract withExplicitNullability(isExplicitlyNullable: boolean): Type;
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

    override get isFullySubstituted(): boolean {
        return this.inputType.isFullySubstituted && this.outputType.isFullySubstituted;
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

    override simplify(): CallableType {
        return this.factory.createCallableType(
            this.callable,
            this.parameter,
            this.factory.createNamedTupleType(...this.inputType.entries.map((it) => it.simplify())),
            this.factory.createNamedTupleType(...this.outputType.entries.map((it) => it.simplify())),
        );
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): CallableType {
        if (isEmpty(substitutions) || this.isFullySubstituted) {
            return this;
        }

        return this.factory.createCallableType(
            this.callable,
            this.parameter,
            this.inputType.substituteTypeParameters(substitutions),
            this.outputType.substituteTypeParameters(substitutions),
        );
    }

    override withExplicitNullability(isExplicitlyNullable: boolean): Type {
        if (!isExplicitlyNullable) {
            return this;
        }

        return this.factory.createUnionType(this, this.factory.createLiteralType(NullConstant));
    }
}

export class LiteralType extends Type {
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly factory: SafeDsTypeFactory;

    private _isExplicitlyNullable: boolean | undefined;
    override readonly isFullySubstituted = true;

    constructor(
        services: SafeDsServices,
        readonly constants: Constant[],
    ) {
        super();

        this.coreTypes = services.types.CoreTypes;
        this.factory = services.types.TypeFactory;
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

    override simplify(): Type {
        // Handle empty literal types
        if (isEmpty(this.constants)) {
            return this.coreTypes.Nothing;
        }

        // Remove duplicate constants
        const uniqueConstants: Constant[] = [];
        const knownConstants = new Set<String>();

        for (const constant of this.constants) {
            let key = constant.toString();

            if (!knownConstants.has(key)) {
                uniqueConstants.push(constant);
                knownConstants.add(key);
            }
        }

        // Apply other simplifications
        if (uniqueConstants.length === 1 && uniqueConstants[0] === NullConstant) {
            return this.coreTypes.NothingOrNull;
        } else if (uniqueConstants.length < this.constants.length) {
            return this.factory.createLiteralType(...uniqueConstants);
        } else {
            return this;
        }
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): Type {
        return this;
    }

    override withExplicitNullability(isExplicitlyNullable: boolean): LiteralType {
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
    private _isFullySubstituted: boolean | undefined;

    constructor(services: SafeDsServices, entries: NamedTupleEntry<T>[]) {
        super();

        this.factory = services.types.TypeFactory;
        this.entries = entries;
    }

    override get isFullySubstituted(): boolean {
        if (this._isFullySubstituted === undefined) {
            this._isFullySubstituted = this.entries.every((it) => it.type.isFullySubstituted);
        }

        return this._isFullySubstituted;
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

    /**
     * If this only has one entry, returns its type. Otherwise, returns this.
     */
    override simplify(): Type {
        if (this.entries.length === 1) {
            return this.entries[0]!.type.simplify();
        }

        return this.factory.createNamedTupleType(...this.entries.map((it) => it.simplify()));
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): NamedTupleType<T> {
        if (isEmpty(substitutions) || this.isFullySubstituted) {
            return this;
        }

        return this.factory.createNamedTupleType(
            ...this.entries.map((it) => it.substituteTypeParameters(substitutions)),
        );
    }

    override withExplicitNullability(isExplicitlyNullable: boolean): Type {
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
        if (isEmpty(substitutions) || this.type.isFullySubstituted) {
            /* c8 ignore next 2 */
            return this;
        }

        return new NamedTupleEntry(this.declaration, this.name, this.type.substituteTypeParameters(substitutions));
    }

    simplify(): NamedTupleEntry<T> {
        return new NamedTupleEntry(this.declaration, this.name, this.type.simplify());
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

    simplify(): NamedType<T> {
        return this;
    }

    abstract override withExplicitNullability(isExplicitlyNullable: boolean): NamedType<T>;
}

export class ClassType extends NamedType<SdsClass> {
    private _isFullySubstituted: boolean | undefined;

    constructor(
        declaration: SdsClass,
        readonly substitutions: TypeParameterSubstitutions,
        override readonly isExplicitlyNullable: boolean,
    ) {
        super(declaration);
    }

    override get isFullySubstituted(): boolean {
        if (this._isFullySubstituted === undefined) {
            this._isFullySubstituted = stream(this.substitutions.values()).every((it) => it.isFullySubstituted);
        }

        return this._isFullySubstituted;
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

    override simplify(): ClassType {
        const newSubstitutions = new Map(stream(this.substitutions).map(([key, value]) => [key, value.simplify()]));
        return new ClassType(this.declaration, newSubstitutions, this.isExplicitlyNullable);
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): ClassType {
        if (isEmpty(substitutions) || this.isFullySubstituted) {
            return this;
        }

        const newSubstitutions = new Map(
            stream(this.substitutions).map(([key, value]) => [key, value.substituteTypeParameters(substitutions)]),
        );

        return new ClassType(this.declaration, newSubstitutions, this.isExplicitlyNullable);
    }

    override withExplicitNullability(isExplicitlyNullable: boolean): ClassType {
        if (this.isExplicitlyNullable === isExplicitlyNullable) {
            return this;
        }

        return new ClassType(this.declaration, this.substitutions, isExplicitlyNullable);
    }
}

export class EnumType extends NamedType<SdsEnum> {
    override readonly isFullySubstituted = true;

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

    override withExplicitNullability(isExplicitlyNullable: boolean): EnumType {
        if (this.isExplicitlyNullable === isExplicitlyNullable) {
            return this;
        }

        return new EnumType(this.declaration, isExplicitlyNullable);
    }
}

export class EnumVariantType extends NamedType<SdsEnumVariant> {
    override readonly isFullySubstituted = true;

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

    override withExplicitNullability(isExplicitlyNullable: boolean): EnumVariantType {
        if (this.isExplicitlyNullable === isExplicitlyNullable) {
            return this;
        }

        return new EnumVariantType(this.declaration, isExplicitlyNullable);
    }
}

export class TypeParameterType extends NamedType<SdsTypeParameter> {
    override readonly isFullySubstituted = false;

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
            return substitution.withExplicitNullability(true);
        } else {
            return substitution;
        }
    }

    override withExplicitNullability(isExplicitlyNullable: boolean): TypeParameterType {
        if (this.isExplicitlyNullable === isExplicitlyNullable) {
            return this;
        }

        return new TypeParameterType(this.declaration, isExplicitlyNullable);
    }
}

/**
 * A type that represents an actual named type declaration instead of an instance of it.
 */
export class StaticType extends Type {
    private readonly factory: SafeDsTypeFactory;

    override readonly isExplicitlyNullable = false;
    override readonly isFullySubstituted = true;

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

    override simplify(): Type {
        return this;
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): StaticType {
        // The substitutions are only meaningful for instances of a declaration, not for the declaration itself. Hence,
        // we don't substitute anything here.
        return this;
    }

    override withExplicitNullability(isExplicitlyNullable: boolean): Type {
        if (!isExplicitlyNullable) {
            return this;
        }

        return this.factory.createUnionType(this, this.factory.createLiteralType(NullConstant));
    }
}

export class UnionType extends Type {
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly factory: SafeDsTypeFactory;
    private readonly typeChecker: SafeDsTypeChecker;

    readonly types: Type[];
    private _isExplicitlyNullable: boolean | undefined;
    private _isFullySubstituted: boolean | undefined;

    constructor(services: SafeDsServices, types: Type[]) {
        super();

        this.coreTypes = services.types.CoreTypes;
        this.factory = services.types.TypeFactory;
        this.typeChecker = services.types.TypeChecker;

        this.types = types;
    }

    override get isExplicitlyNullable(): boolean {
        if (this._isExplicitlyNullable === undefined) {
            this._isExplicitlyNullable = this.types.some((it) => it.isExplicitlyNullable);
        }

        return this._isExplicitlyNullable;
    }

    override get isFullySubstituted(): boolean {
        if (this._isFullySubstituted === undefined) {
            this._isFullySubstituted = this.types.every((it) => it.isFullySubstituted);
        }

        return this._isFullySubstituted;
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

    override simplify(): Type {
        // Handle empty union types
        if (isEmpty(this.types)) {
            return this.coreTypes.Nothing;
        }

        // Flatten nested unions
        const newTypes = this.types.flatMap((type) => {
            const unwrappedType = type.simplify();
            if (unwrappedType instanceof UnionType) {
                return unwrappedType.types;
            } else {
                return unwrappedType;
            }
        });

        // Merge literal types and remove types that are subtypes of others. We do this back-to-front to keep the first
        // occurrence of duplicate types. It's also makes splicing easier.
        for (let i = newTypes.length - 1; i >= 0; i--) {
            const currentType = newTypes[i]!;

            for (let j = newTypes.length - 1; j >= 0; j--) {
                if (i === j) {
                    continue;
                }

                const otherType = newTypes[j]!;

                // Don't merge `Nothing?` into callable types, named tuple types or static types, since that would
                // create another union type.
                if (
                    currentType.equals(this.coreTypes.NothingOrNull) &&
                    (otherType instanceof CallableType ||
                        otherType instanceof NamedTupleType ||
                        otherType instanceof StaticType)
                ) {
                    continue;
                }

                // Merge literal types
                if (currentType instanceof LiteralType && otherType instanceof LiteralType) {
                    // Other type always occurs before current type
                    const newConstants = [...otherType.constants, ...currentType.constants];
                    const newLiteralType = this.factory.createLiteralType(...newConstants).simplify();
                    newTypes.splice(j, 1, newLiteralType);
                    newTypes.splice(i, 1);
                    break;
                }

                // Remove subtypes of other types. Type parameter types are a special case, since there might be a
                // subtype relation between `currentType` and `otherType` in both directions. We always keep the type
                // parameter type in this case for consistency, since it can be narrower if it has a lower bound.
                if (currentType instanceof TypeParameterType) {
                    const candidateType = currentType.withExplicitNullability(
                        currentType.isExplicitlyNullable || otherType.isExplicitlyNullable,
                    );

                    if (this.typeChecker.isSubtypeOf(otherType, candidateType)) {
                        newTypes.splice(j, 1, candidateType);
                        newTypes.splice(i, 1);
                        break;
                    }
                }

                const candidateType = otherType.withExplicitNullability(
                    currentType.isExplicitlyNullable || otherType.isExplicitlyNullable,
                );
                if (this.typeChecker.isSubtypeOf(currentType, candidateType)) {
                    newTypes.splice(j, 1, candidateType); // Update nullability
                    newTypes.splice(i, 1);
                    break;
                }
            }
        }

        if (newTypes.length === 1) {
            return newTypes[0]!;
        } else {
            return this.factory.createUnionType(...newTypes);
        }
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): UnionType {
        if (isEmpty(substitutions) || this.isFullySubstituted) {
            return this;
        }

        return this.factory.createUnionType(...this.types.map((it) => it.substituteTypeParameters(substitutions)));
    }

    override withExplicitNullability(isExplicitlyNullable: boolean): Type {
        if (isEmpty(this.types)) {
            return this.coreTypes.Nothing.withExplicitNullability(isExplicitlyNullable);
        }

        if (this.isExplicitlyNullable && !isExplicitlyNullable) {
            return this.factory.createUnionType(...this.types.map((it) => it.withExplicitNullability(false)));
        } else if (!this.isExplicitlyNullable && isExplicitlyNullable) {
            return this.factory.createUnionType(...this.types.map((it) => it.withExplicitNullability(true)));
        } else {
            return this;
        }
    }
}

class UnknownTypeClass extends Type {
    override readonly isExplicitlyNullable = false;
    override readonly isFullySubstituted = true;

    override equals(other: unknown): boolean {
        return other instanceof UnknownTypeClass;
    }

    override toString(): string {
        return '$unknown';
    }

    override simplify(): Type {
        return this;
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): Type {
        return this;
    }

    override withExplicitNullability(_isExplicitlyNullable: boolean): Type {
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
