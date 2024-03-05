import { type Node } from '@xyflow/svelte';
import { StatementProps } from '../nodes/node-statement.svelte';
import type { PlaceholderProps } from '../nodes/node-placeholder.svelte';

type StatementNode = Node<StatementProps, 'statement'>;
type PlaceholderNode = Node<PlaceholderProps, 'placeholder'>;

type NodeCustom = StatementNode | PlaceholderNode;
