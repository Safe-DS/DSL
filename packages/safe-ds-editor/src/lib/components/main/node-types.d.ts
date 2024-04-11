import { type Node } from '@xyflow/svelte';
import type { StatementProps } from '../nodes/node-statement.svelte';
import type { PlaceholderProps } from '../nodes/node-placeholder.svelte';
import type { ExpressionProps } from '../nodes/node-expression.svelte';
import type { ExtensionProps } from '../nodes/node-extension.svelte';

type StatementNode = Node<StatementProps, 'statement'>;
type PlaceholderNode = Node<PlaceholderProps, 'placeholder'>;
type ExpressionNode = Node<ExpressionProps, 'expression'>;
type ExtensionNode = Node<ExtensionProps, 'extension'>;

type NodeCustom =
    | StatementNode
    | PlaceholderNode
    | ExpressionNode
    | ExtensionNode;
