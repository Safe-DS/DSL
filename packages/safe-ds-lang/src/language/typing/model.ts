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

export type TypeParameterSubstitutions = Map<SdsTypeParameter, Type>;

/**
 * The type of an AST node.
 */
export abstract class Type {
    /**
     * Whether this type allows `null` as a value.
     */
    abstract isNullable: boolean;

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
    abstract updateNullability(isNullable: boolean): Type;
}

export class CallableType extends Type {
    override isNullable: boolean = false;

    constructor(
        readonly callable: SdsCallable,
        readonly parameter: SdsParameter | undefined,
        readonly inputType: NamedTupleType<SdsParameter>,
        readonly outputType: NamedTupleType<SdsAbstractResult>,
    ) {
        super();
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

        return new CallableType(
            this.callable,
            this.parameter,
            this.inputType.substituteTypeParameters(substitutions),
            this.outputType.substituteTypeParameters(substitutions),
        );
    }

    override unwrap(): CallableType {
        return new CallableType(
            this.callable,
            this.parameter,
            new NamedTupleType(...this.inputType.entries.map((it) => it.unwrap())),
            new NamedTupleType(...this.outputType.entries.map((it) => it.unwrap())),
        );
    }

    override updateNullability(isNullable: boolean): Type {
        if (!isNullable) {
            return this;
        }

        return new UnionType(this, new LiteralType(NullConstant));
    }
}

export class LiteralType extends Type {
    readonly constants: Constant[];
    override readonly isNullable: boolean;

    constructor(...constants: Constant[]) {
        super();

        this.constants = constants;
        this.isNullable = constants.some((it) => it === NullConstant);
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

    override updateNullability(isNullable: boolean): LiteralType {
        if (this.isNullable && !isNullable) {
            return new LiteralType(...this.constants.filter((it) => it !== NullConstant));
        } else if (!this.isNullable && isNullable) {
            return new LiteralType(...this.constants, NullConstant);
        } else {
            return this;
        }
    }
}

export class NamedTupleType<T extends SdsDeclaration> extends Type {
    readonly entries: NamedTupleEntry<T>[];
    override readonly isNullable = false;

    constructor(...entries: NamedTupleEntry<T>[]) {
        super();

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

        return new NamedTupleType(...this.entries.map((it) => it.substituteTypeParameters(substitutions)));
    }

    /**
     * If this only has one entry, returns its type. Otherwise, returns this.
     */
    override unwrap(): Type {
        if (this.entries.length === 1) {
            return this.entries[0]!.type.unwrap();
        }

        return new NamedTupleType(...this.entries.map((it) => it.unwrap()));
    }

    override updateNullability(isNullable: boolean): Type {
        if (!isNullable) {
            return this;
        }

        return new UnionType(this, new LiteralType(NullConstant));
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
        if (this.isNullable) {
            return `${this.declaration.name}?`;
        } else {
            return this.declaration.name;
        }
    }

    abstract override updateNullability(isNullable: boolean): NamedType<T>;

    unwrap(): NamedType<T> {
        return this;
    }
}

export class ClassType extends NamedType<SdsClass> {
    constructor(
        declaration: SdsClass,
        readonly substitutions: TypeParameterSubstitutions,
        override readonly isNullable: boolean,
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
            other.isNullable === this.isNullable &&
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

        if (this.isNullable) {
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

        return new ClassType(this.declaration, newSubstitutions, this.isNullable);
    }

    override updateNullability(isNullable: boolean): ClassType {
        return new ClassType(this.declaration, this.substitutions, isNullable);
    }
}

export class EnumType extends NamedType<SdsEnum> {
    constructor(
        declaration: SdsEnum,
        override readonly isNullable: boolean,
    ) {
        super(declaration);
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EnumType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isNullable === this.isNullable;
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): Type {
        return this;
    }

    override updateNullability(isNullable: boolean): EnumType {
        return new EnumType(this.declaration, isNullable);
    }
}

export class EnumVariantType extends NamedType<SdsEnumVariant> {
    constructor(
        declaration: SdsEnumVariant,
        override readonly isNullable: boolean,
    ) {
        super(declaration);
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EnumVariantType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isNullable === this.isNullable;
    }

    override substituteTypeParameters(_substitutions: TypeParameterSubstitutions): Type {
        return this;
    }

    override updateNullability(isNullable: boolean): EnumVariantType {
        return new EnumVariantType(this.declaration, isNullable);
    }
}

export class TypeParameterType extends NamedType<SdsTypeParameter> {
    constructor(
        declaration: SdsTypeParameter,
        override readonly isNullable: boolean,
    ) {
        super(declaration);
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof TypeParameterType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isNullable === this.isNullable;
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): Type {
        const substitution = substitutions.get(this.declaration);

        if (!substitution) {
            return this;
        } else if (this.isNullable) {
            return substitution.updateNullability(true);
        } else {
            return substitution;
        }
    }

    override updateNullability(isNullable: boolean): TypeParameterType {
        return new TypeParameterType(this.declaration, isNullable);
    }
}

/**
 * A type that represents an actual class, enum, or enum variant instead of an instance of it.
 */
export class StaticType extends Type {
    override readonly isNullable = false;

    constructor(readonly instanceType: NamedType<SdsDeclaration>) {
        super();
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

    override updateNullability(isNullable: boolean): Type {
        if (!isNullable) {
            return this;
        }

        return new UnionType(this, new LiteralType(NullConstant));
    }
}

export class UnionType extends Type {
    readonly possibleTypes: Type[];
    override readonly isNullable: boolean;

    constructor(...possibleTypes: Type[]) {
        super();

        this.possibleTypes = possibleTypes;
        this.isNullable = possibleTypes.some((it) => it.isNullable);
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof UnionType)) {
            return false;
        }

        return (
            this.possibleTypes.length === other.possibleTypes.length &&
            this.possibleTypes.every((type, i) => type.equals(other.possibleTypes[i]))
        );
    }

    override toString(): string {
        return `union<${this.possibleTypes.join(', ')}>`;
    }

    override substituteTypeParameters(substitutions: TypeParameterSubstitutions): UnionType {
        if (isEmpty(substitutions)) {
            return this;
        }

        return new UnionType(...this.possibleTypes.map((it) => it.substituteTypeParameters(substitutions)));
    }

    override unwrap(): Type {
        if (this.possibleTypes.length === 1) {
            return this.possibleTypes[0]!.unwrap();
        }

        return new UnionType(...this.possibleTypes.map((it) => it.unwrap()));
    }

    override updateNullability(isNullable: boolean): Type {
        if (this.isNullable && !isNullable) {
            return new UnionType(...this.possibleTypes.map((it) => it.updateNullability(false)));
        } else if (!this.isNullable && isNullable) {
            if (isEmpty(this.possibleTypes)) {
                return new LiteralType(NullConstant);
            } else {
                return new UnionType(...this.possibleTypes.map((it) => it.updateNullability(true)));
            }
        } else {
            return this;
        }
    }
}

class UnknownTypeClass extends Type {
    readonly isNullable = false;

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

    override updateNullability(_isNullable: boolean): Type {
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
