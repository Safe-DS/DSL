import { type Node } from '@xyflow/svelte';
import type { CallProps } from '../nodes/node-call.svelte';
import type { PlaceholderProps } from '../nodes/node-placeholder.svelte';
import type { GenericExpressionProps } from '../nodes/node-generic-expression.svelte';

type CallNode = Node<CallProps, 'call'>;
type PlaceholderNode = Node<PlaceholderProps, 'placeholder'>;
type GenericExpressionNode = Node<GenericExpressionProps, 'genericExpression'>;

export type NodeCustom = CallNode | PlaceholderNode | GenericExpressionNode;
