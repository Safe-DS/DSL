import {
    SdsAssignee,
    SdsStatement,
    isSdsAssignment,
    isSdsExpressionStatement,
    isSdsPlaceholder,
} from "../../generated/ast.js";
import { Call } from "./call.js";
import { Edge, Port } from "./edge.js";
import { Expression, GenericExpression } from "./expression.js";
import { Placeholder } from "./placeholder.js";
import { CustomError, Utils, zip } from "./utils.js";

export class Statement {
    public static parse(node: SdsStatement) {
        if (isSdsAssignment(node)) {
            if (!node.assigneeList || node.assigneeList.assignees.length < 1) {
                return Utils.pushError("Assignee(s) missing", node);
            }
            const assigneeList = node.assigneeList.assignees.map(
                Assignee.parse,
            );
            if (!containsNoErrors(assigneeList)) {
                return assigneeList.find(
                    (element) => element instanceof CustomError,
                )!;
            }

            if (!node.expression) {
                return Utils.pushError("Expression missing", node);
            }
            const expression = Expression.parse(node.expression);
            if (expression instanceof CustomError) return expression;

            if (expression instanceof Call) {
                if (assigneeList.length > expression.resultList.length) {
                    Utils.pushError("Result(s) missing", node.expression);
                }
                if (assigneeList.length < expression.resultList.length) {
                    Utils.pushError("Assignee(s) missing", node.assigneeList);
                }

                zip(expression.resultList, assigneeList).forEach(
                    ([result, assignee]) => {
                        Edge.create(
                            Port.fromResult(result, expression.id),
                            Port.fromPlaceholder(assignee),
                        );
                        assignee.type = result.type;
                    },
                );
            }
            if (expression instanceof GenericExpression) {
                if (assigneeList.length > 1)
                    return Utils.pushError(
                        "To many assignees",
                        node.assigneeList,
                    );
                const assignee = assigneeList[0]!;
                Edge.create(
                    Port.fromGenericExpression(expression, false),
                    Port.fromPlaceholder(assignee),
                );
                assignee.type = expression.type;
            }
        }

        if (isSdsExpressionStatement(node)) {
            Expression.parse(node.expression);
        }

        return;
    }
}

const Assignee = {
    parse(node: SdsAssignee) {
        if (!isSdsPlaceholder(node))
            return Utils.pushError("Not a Placeholder", node);

        return Placeholder.parse(node);
    },
};

const containsNoErrors = <T>(array: (T | CustomError)[]): array is T[] => {
    return !array.some((element) => element instanceof CustomError);
};
