import {
    SdsStatement,
    isSdsAssignment,
    isSdsExpressionStatement,
} from "../../../generated/ast.js";
import { Edge, Port } from "../extractor/edge.js";
import { Placeholder } from "../extractor/placeholder.js";
import { Utils, zip } from "../utils.js";
import { parseAssignee } from "./assignee.js";
import { parseExpression } from "./expression.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Statement";

export const parseStatement = (statement: SdsStatement): void => {
    if (isSdsAssignment(statement)) {
        const assigneeList = statement.assigneeList
            ? statement.assigneeList.assignees.map(parseAssignee)
            : ([] as Placeholder[]);

        const expressionResult = statement.expression
            ? parseExpression(statement.expression)
            : [];

        if (!Port.isPortList(expressionResult)) return;

        if (assigneeList.length !== expressionResult.length) {
            Utils.pushError(
                LOGGING_TAG,
                `${assigneeList.length < expressionResult.length ? "Assignees" : "Expression Result"} missing in line ${statement.expression?.$cstNode?.range.start.line}`,
            );
        }

        zip(assigneeList, expressionResult).forEach(
            ([assignee, expression]) => {
                if (
                    assignee instanceof Placeholder &&
                    expression instanceof Port
                ) {
                    Utils.edgeList.push(
                        new Edge(expression, Port.fromPlaceholder(assignee)),
                    );
                }
            },
        );
    }

    if (isSdsExpressionStatement(statement)) {
        parseExpression(statement.expression);
    }
};
