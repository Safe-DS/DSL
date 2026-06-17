import { AstUtils } from 'langium';
import {
    SdsClass,
    SdsEnum,
    SdsEnumVariant,
    SdsExpression,
    SdsMemberAccess,
    isSdsCall,
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsMemberAccess,
    isSdsParameter,
    isSdsPlaceholder,
    isSdsReference,
} from '../../generated/ast.js';
import { Call } from './call.js';
import { Edge, Port } from './edge.js';
import { Placeholder } from './placeholder.js';
import { Parameter } from './parameter.js';
import { Parser } from './parser.js';

export class GenericExpression {
    public constructor(
        public readonly id: number,
        public readonly text: string,
        public readonly type: string,
        public readonly uniquePath: string,
    ) {}
}

export class Expression {
    public static parse(node: SdsExpression, parser: Parser) {
        if (isSdsCall(node) && !isEnumVariant(node.receiver)) return Call.parse(node, parser);

        if (isSdsReference(node) && isSdsPlaceholder(node.target.ref)) {
            return Placeholder.parse(node.target.ref, parser);
        }
        if (isSdsReference(node) && isSdsParameter(node.target.ref)) {
            return Parameter.parse(node.target.ref, parser);
        }

        if (!node.$cstNode) return parser.pushError('Missing CstNode', node);

        const id = parser.getNewId();
        const genericExpression = new GenericExpression(
            id,
            node.$cstNode.text,
            parser.computeType(node).toString(),
            parser.getUniquePath(node),
        );

        const children = AstUtils.streamAst(node).iterator();
        for (const child of children) {
            if (isSdsPlaceholder(child)) {
                Edge.create(
                    Port.fromPlaceholder(Placeholder.parse(child, parser), false),
                    Port.fromGenericExpression(genericExpression, true),
                    parser,
                );
            }
        }

        parser.graph.genericExpressionList.push(genericExpression);
        return genericExpression;
    }
}

type EnumVariantCall = SdsMemberAccess & {
    member: {
        target: {
            ref: SdsEnumVariant;
        };
    };
    receiver: SdsMemberAccess & {
        member: {
            target: {
                ref: SdsEnum;
            };
        };
        receiver: {
            target: {
                ref: SdsClass;
            };
        };
    };
};

const isEnumVariant = (receiver: SdsExpression): receiver is EnumVariantCall => {
    /* eslint-disable no-implicit-coercion */
    return (
        isSdsMemberAccess(receiver) &&
        !!receiver.member &&
        !!receiver.member.target.ref &&
        isSdsEnumVariant(receiver.member.target.ref) &&
        isSdsMemberAccess(receiver.receiver) &&
        isSdsReference(receiver.receiver.member) &&
        isSdsEnum(receiver.receiver.member.target.ref) &&
        isSdsReference(receiver.receiver.receiver) &&
        isSdsClass(receiver.receiver.receiver.target.ref)
    );
};
