import {AstNode} from "langium";

export const computeType = (_node: AstNode): Type => {
    return {
        equals(_other: Type): boolean {
            return true
        }
    }
}

interface Type {
    equals(other: Type): boolean
}
