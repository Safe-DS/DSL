import { SdsCallable } from '../generated/ast.js';
import { stream, Stream } from 'langium';

export class CallGraph {
    constructor(
        readonly root: SdsCallable,
        readonly children: CallGraph[],
    ) {}

    streamCalledCallables(): Stream<SdsCallable> {
        return stream(this.streamGenerator());
    }

    private *streamGenerator(): Generator<SdsCallable, void> {
        yield this.root;
        for (const child of this.children) {
            yield* child.streamGenerator();
        }
    }
}
