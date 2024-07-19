import { type Node as XYNode, type Edge as XYEdge } from '@xyflow/svelte';
import type { CallProps } from '$src/components/nodes/node-call.svelte';
import type { PlaceholderProps } from '$src/components/nodes/node-placeholder.svelte';
import type { GenericExpressionProps } from '$src/components/nodes/node-generic-expression.svelte';
import type { Call, Edge, GenericExpression, Placeholder } from '$global';
import NodePlaceholder from '$src/components/nodes/node-placeholder.svelte';
import NodeCall from '$src/components/nodes/node-call.svelte';
import NodeGenericExpression from '$src/components/nodes/node-generic-expression.svelte';

type CallNode = XYNode<CallProps, 'call'>;
type PlaceholderNode = XYNode<PlaceholderProps, 'placeholder'>;
type GenericExpressionNode = XYNode<GenericExpressionProps, 'genericExpression'>;

export type NodeCustom = CallNode | PlaceholderNode | GenericExpressionNode;

export const nodeTypes = {
    call: NodeCall,
    genericExpression: NodeGenericExpression,
    placeholder: NodePlaceholder,
};

export const callToNode = (call: Call): NodeCustom => {
    return {
        id: call.id.toString(),
        type: 'call',
        data: { call },
        position: { x: 0, y: 0 },
        width: 260,
        height: 75 + (call.parameterList.length + call.resultList.length) * 24,
    };
};

export const placeholderToNode = (placeholder: Placeholder): NodeCustom => {
    return {
        id: placeholder.name,
        type: 'placeholder',
        data: { placeholder },
        position: { x: 0, y: 0 },
        width: 120,
        height: 95,
    };
};

export const genericExpressionToNode = (genericExpression: GenericExpression): NodeCustom => {
    return {
        id: genericExpression.id.toString(),
        type: 'genericExpression',
        data: { genericExpression },
        position: { x: 0, y: 300 },
        width: 260,
        height: 65,
    };
};

export const edgeToEdge = (edge: Edge, index: number): XYEdge => {
    return {
        id: index.toString(),
        source: edge.from.nodeId,
        sourceHandle: edge.from.portIdentifier,
        target: edge.to.nodeId,
        targetHandle: edge.to.portIdentifier,
    };
};
