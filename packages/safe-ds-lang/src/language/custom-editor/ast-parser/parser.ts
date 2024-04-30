import { AstNode, LangiumDocument } from 'langium';
import { SafeDsAstType, SdsModule, SdsPipeline, SdsStatement } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { getStatement } from './statement.js';

const LOGGING_TAG = 'CustomEditor] [AstParser';

export const parse = (document: LangiumDocument<AstNode>, safeDsServices: SafeDsServices) => {
    const root = document.parseResult.value as SdsModule;
    const sdsblock = (root.members[0] as SdsPipeline).body;
    const blockLines: SdsStatement[] = sdsblock.statements;
    const logger = safeDsServices.communication.MessagingProvider;

    const isDefined = <T extends AstNode, K extends keyof T>(
        node: T,
        member: K,
    ): node is T & Record<K, Exclude<T[K], undefined>> => {
        const result = node[member] !== undefined;
        if (!result) logger.error(LOGGING_TAG + `] [${node.$type}`, `<${String(member)}> is undefined`);
        return result;
    };

    const assertType = <T extends AstNode>(obj: AstNode): obj is T => {
        return true;
    };

    blockLines.forEach((line: SdsStatement) => {
        switch (line.$type) {
            case 'SdsAssignment': {
                if (!assertType<SafeDsAstType[typeof line.$type]>(line)) return;
                if (!isDefined(line, 'expression')) return;

                getStatement(line.expression, safeDsServices);
                return;
            }

            case 'SdsStatement':
                logger.warn(LOGGING_TAG, `Unexpected union node instance <${line.$type}> !`);
                return;

            case 'SdsExpressionStatement': {
                const node = line as SafeDsAstType['SdsExpressionStatement'];
                if (!isDefined(node, 'expression')) return;
                return;
                logger.warn(LOGGING_TAG, `Node type <${line.$type}> has not been implemented yet!`);
            }

            default:
                logger.error(LOGGING_TAG, `Unknown node type <${line.$type}> for line`);
        }
    });
};
