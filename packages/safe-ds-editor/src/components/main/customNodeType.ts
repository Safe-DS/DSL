import { type Node } from '@xyflow/svelte';
import type { CallProps } from '$src/components/nodes/node-call.svelte';
import type { PlaceholderProps } from '$src/components/nodes/node-placeholder.svelte';
import type { GenericExpressionProps } from '$src/components/nodes/node-generic-expression.svelte';

type CallNode = Node<CallProps, 'call'>;
type PlaceholderNode = Node<PlaceholderProps, 'placeholder'>;
type GenericExpressionNode = Node<GenericExpressionProps, 'genericExpression'>;

export type NodeCustom = CallNode | PlaceholderNode | GenericExpressionNode;
