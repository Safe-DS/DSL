import { isSdsParameter, type SdsParameter } from '../generated/ast.js';
import { getQualifiedName } from '../helpers/nodeProperties.js';

/**
 * A reason why a function is impure.
 */
export abstract class ImpurityReason {
    /**
     * Whether the impurity reason is a side effect.
     */
    abstract isSideEffect: boolean;

    /**
     * Returns whether this impurity reason is equal to another object.
     */
    abstract equals(other: unknown): boolean;

    /**
     * Returns a string representation of this impurity reason.
     */
    abstract toString(): string;

    /**
     * Returns whether this impurity reason can affect a future impurity reason.
     * @param future Future Impurity reason to test, if this reason may have an effect on it.
     */
    abstract canAffectFutureImpurityReason(future: ImpurityReason): boolean;
}

/**
 * The function reads from a file.
 *
 * @param path The path of the read file. This can either be a parameter or a constant string.
 */
export class FileRead extends ImpurityReason {
    override isSideEffect = false;

    constructor(readonly path: SdsParameter | string | undefined) {
        super();
    }

    override equals(other: unknown): boolean {
        return other instanceof FileRead && this.path === other.path;
    }

    override toString(): string {
        if (isSdsParameter(this.path)) {
            return `File read from ${getQualifiedName(this.path)}`;
        } else if (typeof this.path === 'string') {
            return `File read from "${this.path}"`;
        } else {
            return 'File read from ?';
        }
    }

    override canAffectFutureImpurityReason(_future: ImpurityReason): boolean {
        // Reads can't affect other reasons
        return false;
    }
}

/**
 * The function writes to a file.
 *
 * @param path The path of the written file. This can either be a parameter or a constant string.
 */
export class FileWrite extends ImpurityReason {
    override isSideEffect = true;

    constructor(readonly path: SdsParameter | string | undefined) {
        super();
    }

    override equals(other: unknown): boolean {
        return other instanceof FileWrite && this.path === other.path;
    }

    override toString(): string {
        if (isSdsParameter(this.path)) {
            return `File write to ${getQualifiedName(this.path)}`;
        } else if (typeof this.path === 'string') {
            return `File write to "${this.path}"`;
        } else {
            return 'File write to ?';
        }
    }

    override canAffectFutureImpurityReason(future: ImpurityReason): boolean {
        if (future instanceof FileWrite || future instanceof FileRead) {
            if (typeof this.path === 'string' && typeof future.path === 'string') {
                // Writes only have an effect on other reads and writes, if the files is known and is the same
                return this.path === future.path;
            }
        }
        return future !== EndlessRecursion;
    }
}

/**
 * The function calls a callable that is given as a parameter and that might be impure.
 *
 * @param parameter The parameter that is called.
 */
export class PotentiallyImpureParameterCall extends ImpurityReason {
    override isSideEffect = true;

    constructor(readonly parameter: SdsParameter | undefined) {
        super();
    }

    override equals(other: unknown): boolean {
        return other instanceof PotentiallyImpureParameterCall && this.parameter === other.parameter;
    }

    override toString(): string {
        if (isSdsParameter(this.parameter)) {
            return `Potentially impure call of ${getQualifiedName(this.parameter)}`;
        } else {
            return 'Potentially impure call of ?';
        }
    }

    override canAffectFutureImpurityReason(future: ImpurityReason): boolean {
        return future !== EndlessRecursion;
    }
}

/**
 * The function calls an unknown callable.
 */
class UnknownCallableCallClass extends ImpurityReason {
    override isSideEffect = true;

    override equals(other: unknown): boolean {
        return other instanceof UnknownCallableCallClass;
    }

    override toString(): string {
        return 'Unknown callable call';
    }

    canAffectFutureImpurityReason(future: ImpurityReason): boolean {
        /* c8 ignore next 2 */
        return future !== EndlessRecursion;
    }
}

export const UnknownCallableCall = new UnknownCallableCallClass();

/**
 * A function contains a call that leads to endless recursion.
 */
class EndlessRecursionClass extends ImpurityReason {
    override isSideEffect = true;

    override equals(other: unknown): boolean {
        return other instanceof EndlessRecursionClass;
    }

    override toString(): string {
        return 'Endless recursion';
    }

    override canAffectFutureImpurityReason(_future: ImpurityReason): boolean {
        /* c8 ignore next 3 */
        // Endless recursions don't have any effect on others
        return false;
    }
}

export const EndlessRecursion = new EndlessRecursionClass();

/**
 * A function is impure due to some reason that is not covered by the other impurity reasons.
 */
class OtherImpurityReasonClass extends ImpurityReason {
    override isSideEffect = true;

    override equals(other: unknown): boolean {
        return other instanceof OtherImpurityReasonClass;
    }

    override toString(): string {
        return 'Other';
    }

    canAffectFutureImpurityReason(future: ImpurityReason): boolean {
        return future !== EndlessRecursion;
    }
}

/**
 * A function is impure due to some reason that is not covered by the other impurity reasons.
 */
export const OtherImpurityReason = new OtherImpurityReasonClass();
