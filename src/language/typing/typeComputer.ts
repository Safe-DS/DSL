import { AstNode } from 'langium';

export const computeType = (_node: AstNode): Type => {
    return {
        equals(_other: Type): boolean {
            return true;
        },

        toString(): string {
            return 'test';
        },
    };
};

interface Type {
    equals(other: Type): boolean;

    toString(): string;
}
