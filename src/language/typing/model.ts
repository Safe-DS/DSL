import {
    isSdsNull,
    SdsCallable,
    SdsClass,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsLiteral,
} from '../generated/ast.js';

/* c8 ignore start */
export abstract class Type {
    abstract isNullable: boolean;

    unwrap(): Type {
        return this;
    }

    abstract copyWithNullability(isNullable: boolean): Type;

    abstract equals(other: Type): boolean;

    abstract toString(): string;
}

export class CallableType extends Type {
    override isNullable: boolean = false;

    constructor(
        readonly sdsCallable: SdsCallable,
        readonly inputType: NamedTupleType,
        readonly outputType: NamedTupleType,
    ) {
        super();
    }

    getParameterTypeByPosition(position: number): Type | undefined {
        return this.inputType.getTypeOfEntryByPosition(position);
    }

    override copyWithNullability(_isNullable: boolean): CallableType {
        return this;
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof CallableType)) {
            return false;
        }

        return (
            other.sdsCallable === this.sdsCallable &&
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

    constructor(readonly values: SdsLiteral[]) {
        super();

        this.isNullable = values.some(isSdsNull);
    }

    override copyWithNullability(isNullable: boolean): LiteralType {
        if (isNullable && !this.isNullable) {
            throw Error('Not implemented');
        } else if (!isNullable && this.isNullable) {
            throw Error('Not implemented');
        } else {
            return this;
        }
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof LiteralType)) {
            return false;
        }

        throw Error('Not implemented');
    }

    override toString(): string {
        throw Error('Not implemented');
    }
}

export class NamedTupleType extends Type {
    override readonly isNullable = false;

    constructor(readonly entries: NamedTupleEntry[]) {
        super();
    }

    getTypeOfEntryByPosition(position: number): Type | undefined {
        return this.entries[position]?.type;
    }

    get length(): number {
        return this.entries.length;
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

    override copyWithNullability(_isNullable: boolean): NamedTupleType {
        return this;
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof NamedTupleType)) {
            return false;
        }

        if (other.entries.length !== this.entries.length) {
            return false;
        }

        for (let i = 0; i < this.entries.length; i++) {
            const otherEntry = other.entries[i];
            const entry = this.entries[i];

            if (!entry.equals(otherEntry)) {
                return false;
            }
        }

        return true;
    }

    override toString(): string {
        return `(${this.entries.join(', ')})`;
    }
}

export class NamedTupleEntry {
    constructor(
        readonly name: string,
        readonly type: Type,
    ) {}

    toString(): string {
        return `${this.name}: ${this.type}`;
    }

    equals(other: NamedTupleEntry): boolean {
        return this.name === other.name && this.type.equals(other.type);
    }
}

export abstract class NamedType extends Type {
    protected constructor(readonly sdsDeclaration: SdsDeclaration) {
        super();
    }

    abstract override copyWithNullability(isNullable: boolean): NamedType;

    override toString(): string {
        if (this.isNullable) {
            return `${this.sdsDeclaration.name}?`;
        } else {
            return this.sdsDeclaration.name;
        }
    }
}

export class ClassType extends NamedType {
    constructor(
        readonly sdsClass: SdsClass,
        override readonly isNullable: boolean,
    ) {
        super(sdsClass);
    }

    override copyWithNullability(isNullable: boolean): ClassType {
        return new ClassType(this.sdsClass, isNullable);
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof ClassType)) {
            return false;
        }

        return other.sdsClass === this.sdsClass && other.isNullable === this.isNullable;
    }
}

export class EnumType extends NamedType {
    constructor(
        readonly sdsEnum: SdsEnum,
        override readonly isNullable: boolean,
    ) {
        super(sdsEnum);
    }

    override copyWithNullability(isNullable: boolean): EnumType {
        return new EnumType(this.sdsEnum, isNullable);
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof EnumType)) {
            return false;
        }

        return other.sdsEnum === this.sdsEnum && other.isNullable === this.isNullable;
    }
}

export class EnumVariantType extends NamedType {
    constructor(
        readonly sdsEnumVariant: SdsEnumVariant,
        override readonly isNullable: boolean,
    ) {
        super(sdsEnumVariant);
    }

    override copyWithNullability(isNullable: boolean): EnumVariantType {
        return new EnumVariantType(this.sdsEnumVariant, isNullable);
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof EnumVariantType)) {
            return false;
        }

        return other.sdsEnumVariant === this.sdsEnumVariant && other.isNullable === this.isNullable;
    }
}

/**
 * A type that represents an actual class, enum, or enum variant instead of an instance of it.
 */
export class StaticType extends Type {
    override readonly isNullable = false;

    constructor(readonly instanceType: NamedType) {
        super();
    }

    override copyWithNullability(_isNullable: boolean): StaticType {
        return this;
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof StaticType)) {
            return false;
        }

        return other.instanceType.equals(this.instanceType);
    }

    override toString(): string {
        return `$type<${this.instanceType}>`;
    }
}

export class UnionType extends Type {
    override readonly isNullable = false;

    constructor(readonly possibleTypes: Type[]) {
        super();
    }

    override copyWithNullability(_isNullable: boolean): UnionType {
        return this;
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof UnionType)) {
            return false;
        }

        if (other.possibleTypes.length !== this.possibleTypes.length) {
            return false;
        }

        return other.possibleTypes.every((otherPossibleType) =>
            this.possibleTypes.some((possibleType) => possibleType.equals(otherPossibleType)),
        );
    }

    override toString(): string {
        return `union<${this.possibleTypes.join(', ')}>`;
    }
}

export class VariadicType extends Type {
    override readonly isNullable = false;

    constructor(readonly elementType: Type) {
        super();
    }

    override copyWithNullability(_isNullable: boolean): VariadicType {
        return this;
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof VariadicType)) {
            return false;
        }

        return other.elementType.equals(this.elementType);
    }

    override toString(): string {
        return `vararg<${this.elementType}>`;
    }
}

class UnknownTypeClass extends Type {
    readonly isNullable = false;

    copyWithNullability(_isNullable: boolean): UnknownTypeClass {
        return this;
    }

    override equals(other: Type): boolean {
        return other instanceof UnknownTypeClass;
    }

    toString(): string {
        return '$Unknown';
    }
}

export const UnknownType = new UnknownTypeClass();

class NotImplementedTypeClass extends Type {
    override readonly isNullable = false;

    copyWithNullability(_isNullable: boolean): NotImplementedTypeClass {
        return this;
    }

    override equals(other: Type): boolean {
        return other instanceof NotImplementedTypeClass;
    }

    toString(): string {
        return '$NotImplemented';
    }
}

export const NotImplementedType = new NotImplementedTypeClass();
/* c8 ignore stop */
