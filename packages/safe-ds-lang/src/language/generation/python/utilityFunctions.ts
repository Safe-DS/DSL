import { expandToNode, Generated } from 'langium/generate';

const CODEGEN_PREFIX = '__gen_';

export const UTILITY_EAGER_OR: UtilityFunction = {
    name: `${CODEGEN_PREFIX}eager_or`,
    code: expandToNode`
        def ${CODEGEN_PREFIX}eager_or(left_operand: bool, right_operand: bool) -> bool:
            return left_operand or right_operand
    `,
};

export const UTILITY_EAGER_AND: UtilityFunction = {
    name: `${CODEGEN_PREFIX}eager_and`,
    code: expandToNode`
        def ${CODEGEN_PREFIX}eager_and(left_operand: bool, right_operand: bool) -> bool:
            return left_operand and right_operand
    `,
};

export const UTILITY_EAGER_ELVIS: UtilityFunction = {
    name: `${CODEGEN_PREFIX}eager_elvis`,
    code: expandToNode`
        def ${CODEGEN_PREFIX}eager_elvis(left_operand: ${CODEGEN_PREFIX}T, right_operand: ${CODEGEN_PREFIX}T) -> ${CODEGEN_PREFIX}T:
            return left_operand if left_operand is not None else right_operand
    `,
    typeVariables: [`${CODEGEN_PREFIX}T`],
};

export const UTILITY_NULL_SAFE_CALL: UtilityFunction = {
    name: `${CODEGEN_PREFIX}null_safe_call`,
    code: expandToNode`
        def ${CODEGEN_PREFIX}null_safe_call(receiver: Any, callable: Callable[[], ${CODEGEN_PREFIX}T]) -> ${CODEGEN_PREFIX}T | None:
            return callable() if receiver is not None else None
    `,
    imports: [
        { importPath: 'typing', declarationName: 'Any' },
        { importPath: 'typing', declarationName: 'Callable' },
    ],
    typeVariables: [`${CODEGEN_PREFIX}T`],
};

export const UTILITY_NULL_SAFE_INDEXED_ACCESS: UtilityFunction = {
    name: `${CODEGEN_PREFIX}null_safe_indexed_access`,
    code: expandToNode`
        def ${CODEGEN_PREFIX}null_safe_indexed_access(receiver: Any, index: Any) -> ${CODEGEN_PREFIX}T | None:
            return receiver[index] if receiver is not None else None
    `,
    imports: [{ importPath: 'typing', declarationName: 'Any' }],
    typeVariables: [`${CODEGEN_PREFIX}T`],
};

export const UTILITY_NULL_SAFE_MEMBER_ACCESS: UtilityFunction = {
    name: `${CODEGEN_PREFIX}null_safe_member_access`,
    code: expandToNode`
        def ${CODEGEN_PREFIX}null_safe_member_access(receiver: Any, member_name: str) -> ${CODEGEN_PREFIX}T | None:
            return getattr(receiver, member_name) if receiver is not None else None
    `,
    imports: [{ importPath: 'typing', declarationName: 'Any' }],
    typeVariables: [`${CODEGEN_PREFIX}T`],
};

export interface UtilityFunction {
    readonly name: string;
    readonly code: Generated;
    readonly imports?: ImportData[];
    readonly typeVariables?: string[];
}

interface ImportData {
    readonly importPath: string;
    readonly declarationName?: string;
    readonly alias?: string;
}
