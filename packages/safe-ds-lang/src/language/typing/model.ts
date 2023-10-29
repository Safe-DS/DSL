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
     * Returns a copy of this type with the given nullability. If nullability is fixed for a type, it may return the
     * instance itself.
     */
    updateNullability(_isNullable: boolean): Type {
        return this;
    }

    /**
     * Removes any unnecessary containers from the type.
     */
    unwrap(): Type {
        return this;
    }
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
}

export class LiteralType extends Type {
    override readonly isNullable: boolean;

    constructor(readonly constants: Constant[]) {
        super();

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

    override updateNullability(isNullable: boolean): LiteralType {
        if (this.isNullable && !isNullable) {
            return new LiteralType(this.constants.filter((it) => it !== NullConstant));
        } else if (!this.isNullable && isNullable) {
            return new LiteralType([...this.constants, NullConstant]);
        } else {
            return this;
        }
    }
}

export class NamedTupleType<T extends SdsDeclaration> extends Type {
    override readonly isNullable = false;

    constructor(readonly entries: NamedTupleEntry<T>[]) {
        super();
    }

    /**
     * The length of this tuple.
     */
    readonly length: number = this.entries.length;

    /**
     * Returns the type of the entry at the given index. If the index is out of bounds, returns `undefined`.
     */
    getTypeOfEntryByIndex(index: number): Type {
        return this.entries[index]?.type ?? UnknownType;
    }

    /**
     * If this only has one entry, returns its type. Otherwise, returns this.
     */
    override unwrap(): Type {
        if (this.entries.length === 1) {
            return this.entries[0].type;
        }

        return this;
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
}

export class UnionType extends Type {
    override readonly isNullable: boolean;

    constructor(readonly possibleTypes: Type[]) {
        super();

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
}

class UnknownTypeClass extends Type {
    readonly isNullable = false;

    override equals(other: Type): boolean {
        return other instanceof UnknownTypeClass;
    }

    override toString(): string {
        return '?';
    }
}

export const UnknownType = new UnknownTypeClass();

/* c8 ignore start */
class NotImplementedTypeClass extends Type {
    override readonly isNullable = false;

    override equals(other: Type): boolean {
        return other instanceof NotImplementedTypeClass;
    }

    override toString(): string {
        return '$NotImplemented';
    }
}

export const NotImplementedType = new NotImplementedTypeClass();
/* c8 ignore stop */
