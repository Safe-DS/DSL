import { Call } from './ast-parser/call.js';
import { GenericExpression } from './ast-parser/expression.js';
import { Edge } from './ast-parser/edge.js';
import { Placeholder } from './ast-parser/placeholder.js';
import { Segment } from './ast-parser/segment.js';

export { SegmentGroupId } from './ast-parser/segment.js';
export { Segment } from './ast-parser/segment.js';
export { Placeholder } from './ast-parser/placeholder.js';
export { Call } from './ast-parser/call.js';
export { GenericExpression } from './ast-parser/expression.js';
export { Edge } from './ast-parser/edge.js';
export { Parameter } from './ast-parser/parameter.js';
export { Result } from './ast-parser/result.js';

export interface Collection {
    pipeline: Graph;
    segmentList: Segment[];
    errorList: CustomError[];
}

export class Graph {
    constructor(
        public readonly type: 'segment' | 'pipeline',
        public readonly placeholderList: Placeholder[] = [],
        public readonly callList: Call[] = [],
        public readonly genericExpressionList: GenericExpression[] = [],
        public readonly edgeList: Edge[] = [],
        public uniquePath: string = '',
        public name: string = '',
    ) {}
}

export class Buildin {
    constructor(
        public readonly name: string,
        public readonly parent: string | undefined,
        public readonly category:
            | 'DataImport'
            | 'DataExport'
            | 'DataProcessing'
            | 'DataExploration'
            | 'Modeling'
            | 'ModelEvaluation'
            | (string & Record<never, never>),
    ) {}
}

export class CustomError {
    constructor(
        public readonly action: 'block' | 'notify',
        public readonly message: string,
    ) {}
}
