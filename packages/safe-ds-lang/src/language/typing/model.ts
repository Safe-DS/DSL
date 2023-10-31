import { isEmpty } from '../../helpers/collectionUtils.js';
import {
    SdsAbstractResult,
    SdsCallable,
    SdsClass,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsParameter,
} from '../generated/ast.js';
import { Constant, NullConstant } from '../partialEvaluation/model.js';

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
    abstract equals(other: Type): boolean;

    /**
     * Returns a string representation of this type.
     */
    abstract toString(): string;

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

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof CallableType)) {
            return false;
        }

        return (
            other.callable === this.callable &&
            other.inputType.equals(this.inputType) &&
            other.outputType.equals(this.outputType)
        );
    }

    override toString(): string {
        return `${this.inputType} -> ${this.outputType}`;
    }

    override unwrap(): CallableType {
        return new CallableType(
            this.callable,
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

    override equals(other: Type): boolean {
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

    override equals(other: Type): boolean {
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
    override unwrap(): Type {
        if (this.entries.length === 1) {
            return this.entries[0].type.unwrap();
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

    equals(other: NamedTupleEntry<SdsDeclaration>): boolean {
        return this.declaration === other.declaration && this.name === other.name && this.type.equals(other.type);
    }

    toString(): string {
        return `${this.name}: ${this.type}`;
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
        override readonly isNullable: boolean,
    ) {
        super(declaration);
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof ClassType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isNullable === this.isNullable;
    }

    override updateNullability(isNullable: boolean): ClassType {
        return new ClassType(this.declaration, isNullable);
    }
}

export class EnumType extends NamedType<SdsEnum> {
    constructor(
        declaration: SdsEnum,
        override readonly isNullable: boolean,
    ) {
        super(declaration);
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EnumType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isNullable === this.isNullable;
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

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EnumVariantType)) {
            return false;
        }

        return other.declaration === this.declaration && other.isNullable === this.isNullable;
    }

    override updateNullability(isNullable: boolean): EnumVariantType {
        return new EnumVariantType(this.declaration, isNullable);
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

    override equals(other: Type): boolean {
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

    override equals(other: Type): boolean {
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

    override unwrap(): Type {
        if (this.possibleTypes.length === 1) {
            return this.possibleTypes[0].unwrap();
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

    override equals(other: Type): boolean {
        return other instanceof UnknownTypeClass;
    }

    override toString(): string {
        return '?';
    }

    override unwrap(): Type {
        return this;
    }

    override updateNullability(_isNullable: boolean): Type {
        return this;
    }
}

export const UnknownType = new UnknownTypeClass();
