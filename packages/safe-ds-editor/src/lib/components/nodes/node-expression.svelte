<script context="module" lang="ts">
    export type ExpressionProps = { expression: Expression };
</script>

<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import statusIndicator from '$lib/traits/status-indicator';
    import { node } from 'src/assets/node/node';

    type $$Props = NodeProps;

    export let data: { expression: Expression };
    const { expression } = data;
</script>

<div
    use:statusIndicator={{ status: expression.status }}
    class="rounded-expressionFrame shadow-node relative cursor-default pr-1"
>
    <div class="bg-node_main rounded-expressionCore core relative">
        <div class="flex flex-row p-3 pr-6">
            <svelte:component
                this={node.expressionIcon}
                className="active:opacity-50 transition-opacity duration-75 cursor-pointer h-10 w-10 flex-shrink-0 stroke-node_main_text p-1 shadow-node"
            />
            <Handle
                class="-left-2 h-2.5 w-2.5"
                id={`$expression|target`}
                type="target"
                position={Position.Left}
            /><Handle
                class="-right-3 h-2.5 w-2.5"
                id={`$expression|source`}
                type="source"
                position={Position.Right}
            />
        </div>
    </div>
</div>

<style>
    .core {
        height: calc(100% + 100px);
    }
</style>
