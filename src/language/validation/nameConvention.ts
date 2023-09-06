import { SdsDeclaration } from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';

const blockLambdaPrefix = '__block_lambda_';

export const nameMustNotStartWithBlockLambdaPrefix = (node: SdsDeclaration, accept: ValidationAcceptor) => {
    if (node.name.startsWith(blockLambdaPrefix)) {
        accept(
            'error',
            "Names of declarations must not start with '__block_lambda_'. This is reserved for code generation of block lambdas.",
            {
                node,
                property: 'name',
                code: 'nameConvention/blockLambdaPrefix',
            },
        );
    }
};
