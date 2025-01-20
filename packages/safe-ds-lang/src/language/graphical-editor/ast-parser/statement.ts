import {
    SdsAssignee,
    SdsStatement,
    isSdsAssignment,
    isSdsExpressionStatement,
    isSdsPlaceholder,
    isSdsWildcard,
    isSdsYield,
} from '../../generated/ast.js';
import { CustomError } from '../global.js';
import { Call } from './call.js';
import { Edge, Port } from './edge.js';
import { Expression, GenericExpression } from './expression.js';
import { Parameter } from './parameter.js';
import { Placeholder } from './placeholder.js';
import { Result } from './result.js';
import { SegmentGroupId } from './segment.js';
import { zip } from './utils.js';
import { Parser } from './parser.js';

export class Statement {
    public static parse(node: SdsStatement, parser: Parser) {
        if (isSdsAssignment(node)) {
            if (!node.assigneeList || node.assigneeList.assignees.length < 1) {
                parser.pushError('Assignee(s) missing', node);
                return;
            }
            const assigneeList = node.assigneeList.assignees.map((assignee) => Assignee.parse(assignee, parser));
            if (!containsNoErrors(assigneeList)) {
                return;
            }

            if (!node.expression) {
                parser.pushError('Expression missing', node);
                return;
            }
            const expression = Expression.parse(node.expression, parser);
            if (expression instanceof CustomError) return;

            if (expression instanceof Call) {
                if (assigneeList.length > expression.resultList.length) {
                    parser.pushError('Result(s) missing', node.expression);
                }
                if (assigneeList.length < expression.resultList.length) {
                    parser.pushError('Assignee(s) missing', node.assigneeList);
                }

                zip(expression.resultList, assigneeList).forEach(([result, assignee]) => {
                    if (!assignee) return;
                    Edge.create(Port.fromResult(result, expression.id), Port.fromAssignee(assignee, true), parser);
                    assignee.type = result.type;
                });
            }
            if (expression instanceof GenericExpression) {
                if (assigneeList.length > 1) {
                    parser.pushError('To many assignees', node.assigneeList);
                    return;
                }
                const assignee = assigneeList[0]!;
                Edge.create(Port.fromGenericExpression(expression, false), Port.fromAssignee(assignee, true), parser);
                assignee.type = expression.type;
            }
            if (expression instanceof Placeholder) {
                if (assigneeList.length > 1) {
                    parser.pushError('To many assignees', node.assigneeList);
                    return;
                }
                const assignee = assigneeList[0]!;
                Edge.create(Port.fromPlaceholder(expression, false), Port.fromAssignee(assignee, true), parser);
                assignee.type = expression.type;
            }
            if (expression instanceof Parameter) {
                if (assigneeList.length > 1) {
                    parser.pushError('To many assignees', node.assigneeList);
                    return;
                }
                const assignee = assigneeList[0]!;
                Edge.create(Port.fromParameter(expression, SegmentGroupId), Port.fromAssignee(assignee, true), parser);
                assignee.type = expression.type;
            }
        }

        if (isSdsExpressionStatement(node)) {
            Expression.parse(node.expression, parser);
        }

        return;
    }
}

const Assignee = {
    parse(node: SdsAssignee, parser: Parser) {
        if (isSdsPlaceholder(node)) return Placeholder.parse(node, parser);

        if (isSdsYield(node) && (!node.result || !node.result.ref)) return parser.pushError('Missing assignee', node);
        if (isSdsYield(node)) return Result.parse(node.result!.ref!, parser);

        if (isSdsWildcard(node)) return;

        return parser.pushError(`Invalid assignee <${node.$type}>`, node);
    },
};

const containsNoErrors = <T>(array: (T | CustomError)[]): array is T[] => {
    return !array.some((element) => element instanceof CustomError);
};
