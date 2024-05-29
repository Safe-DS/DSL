import {
    SdsStatement,
    isSdsAssignment,
    isSdsExpressionStatement,
} from "../../../generated/ast.js";
import {
    createEdge,
    isPort,
    isPortList,
    placeholderToPort,
} from "../extractor/edge.js";
import { Placeholder, isPlaceholder } from "../extractor/placeholder.js";
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

        if (!isPortList(expressionResult)) return;

        if (assigneeList.length !== expressionResult.length) {
            Utils.pushError(
                LOGGING_TAG,
                `${assigneeList.length < expressionResult.length ? "Assignees" : "Expression Result"} missing in line ${statement.expression?.$cstNode?.range.start.line}`,
            );
        }

        zip(assigneeList, expressionResult).forEach(
            ([assignee, expression]) => {
                if (isPlaceholder(assignee) && isPort(expression)) {
                    Utils.edgeList.push(
                        createEdge(expression, placeholderToPort(assignee)),
                    );
                }
            },
        );
    }

    if (isSdsExpressionStatement(statement)) {
        parseExpression(statement.expression);
    }
};
