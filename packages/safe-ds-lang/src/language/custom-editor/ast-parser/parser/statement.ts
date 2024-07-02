import {
    SdsStatement,
    isSdsAssignment,
    isSdsExpressionStatement,
} from "../../../generated/ast.js";
import { Call } from "../extractor/call.js";
import { Edge, Port } from "../extractor/edge.js";
import { Utils, zip } from "../utils.js";
import { parseAssignee } from "./assignee.js";
import { Expression } from "./expression.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Statement";

export const parseStatement = (statement: SdsStatement): void => {
    if (isSdsAssignment(statement)) {
        const assigneeList = statement.assigneeList
            ? statement.assigneeList.assignees.map(parseAssignee)
            : [];

        const expression = statement.expression
            ? Expression.get(statement.expression)
            : [];

        if (expression instanceof Call) {
            if (assigneeList.length !== expression.resultList.length) {
                Utils.pushError(
                    LOGGING_TAG,
                    `${assigneeList.length < expression.resultList.length ? "Assignees" : "Expression Result"} missing in line ${statement.expression?.$cstNode?.range.start.line}`,
                );
            }

            zip(assigneeList, expression.resultList).forEach(
                ([assignee, result]) => {
                    if (assignee) {
                        Edge.create(
                            Port.fromResult(result, expression.id),
                            Port.fromPlaceholder(assignee),
                        );
                    }
                },
            );
        } else {
        }
    }

    if (isSdsExpressionStatement(statement)) {
        Expression.get(statement.expression);
    }
};
