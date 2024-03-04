import { type Node } from '@xyflow/svelte';
import { StatementProps } from '../nodes/node-statement.svelte';

type StatementNode = Node<StatementProps, 'statement'>;

type NodeCustom = StatementNode;
