import { type Node as XYNode, type Edge as XYEdge } from '@xyflow/svelte';
import type { CallProps } from '$src/components/nodes/node-call.svelte';
import type { PlaceholderProps } from '$src/components/nodes/node-placeholder.svelte';
import type { GenericExpressionProps } from '$src/components/nodes/node-generic-expression.svelte';
import type { SegmentProps } from '$src/components/nodes/node-segment.svelte';
import {
    SegmentGroupId,
    type Call,
    type Edge,
    type GenericExpression,
    type Placeholder,
    type Segment,
} from '$global';
import NodePlaceholder from '$/src/components/nodes/node-placeholder.svelte';
import NodeCall from '$src/components/nodes/node-call.svelte';
import NodeGenericExpression from '$src/components/nodes/node-generic-expression.svelte';
import SegmentCustonNode from '$/src/components/nodes/node-segment.svelte';

type CallNode = XYNode<CallProps, 'call'>;
type PlaceholderNode = XYNode<PlaceholderProps, 'placeholder'>;
type GenericExpressionNode = XYNode<GenericExpressionProps, 'genericExpression'>;
type SegmentNode = XYNode<SegmentProps, 'segment'>;

export type NodeCustom = CallNode | PlaceholderNode | GenericExpressionNode | SegmentNode;

export const nodeTypes = {
    call: NodeCall,
    genericExpression: NodeGenericExpression,
    placeholder: NodePlaceholder,
    segment: SegmentCustonNode,
};

export const callToNode = (call: Call, isSegment: boolean): NodeCustom => {
    return {
        id: call.id.toString(),
        parentId: isSegment ? SegmentGroupId.toString() : undefined,
        extent: isSegment ? 'parent' : undefined,
        type: 'call',
        data: { call, status: 'none' },
        position: { x: 0, y: 0 },
        width: 260,
        height: 75 + (call.parameterList.length + call.resultList.length) * 24,
    };
};

export const placeholderToNode = (
    placeholder: Placeholder,
    isSegment: boolean,
    runUntilHere: (id: string) => void,
): NodeCustom => {
    return {
        id: placeholder.name,
        parentId: isSegment ? SegmentGroupId.toString() : undefined,
        extent: isSegment ? 'parent' : undefined,
        type: 'placeholder',
        data: { placeholder, runUntilHere, isSegment, status: 'none' },
        position: { x: 0, y: 0 },
        width: 120,
        height: 95,
    };
};

export const genericExpressionToNode = (
    genericExpression: GenericExpression,
    isSegment: boolean,
): NodeCustom => {
    return {
        id: genericExpression.id.toString(),
        parentId: isSegment ? SegmentGroupId.toString() : undefined,
        extent: isSegment ? 'parent' : undefined,
        type: 'genericExpression',
        data: { genericExpression, status: 'none' },
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
        selectable: false,
    };
};

export const segmentToNode = (segment: Segment): NodeCustom => {
    return {
        id: SegmentGroupId.toString(),
        draggable: true,
        type: 'segment',
        data: { segment, status: 'none' },
        position: { x: 0, y: 0 },
        width: 1000,
        height: 1000,
    };
};
