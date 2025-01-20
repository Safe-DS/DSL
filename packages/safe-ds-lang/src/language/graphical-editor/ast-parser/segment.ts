import { SdsSegment, SdsStatement } from '../../generated/ast.js';
import { Call, CustomError, Edge, GenericExpression, Graph, Placeholder } from '../global.js';
import { Parameter } from './parameter.js';
import { Parser } from './parser.js';
import { Result } from './result.js';
import { Statement } from './statement.js';
import { filterErrors } from './utils.js';

export const SegmentGroupId = -1;

export class Segment extends Graph {
    private constructor(
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
        uniquePath: string,
        name: string,
        placeholderList: Placeholder[],
        callList: Call[],
        genericExpressionList: GenericExpression[],
        edgeList: Edge[],
    ) {
        super('segment', placeholderList, callList, genericExpressionList, edgeList, uniquePath, name);
    }

    public static parse(node: SdsSegment, parser: Parser): { segment: Segment; errorList: CustomError[] } {
        const name = node.name;
        const uniquePath = parser.getUniquePath(node);

        const resultList = filterErrors((node.resultList?.results ?? []).map((result) => Result.parse(result, parser)));
        const parameterList = filterErrors(
            (node.parameterList?.parameters ?? []).map((parameter) => Parameter.parse(parameter, parser)),
        );

        const statementList: SdsStatement[] = node.body.statements;
        statementList.forEach((statement) => {
            Statement.parse(statement, parser);
        });

        const { graph, errorList } = parser.getResult();
        graph.uniquePath = uniquePath;
        graph.name = name;

        const segment = new Segment(
            parameterList,
            resultList,
            name,
            uniquePath,
            graph.placeholderList,
            graph.callList,
            graph.genericExpressionList,
            graph.edgeList,
        );
        return { segment, errorList };
    }
}
