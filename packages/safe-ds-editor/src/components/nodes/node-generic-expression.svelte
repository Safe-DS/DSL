<script context="module" lang="ts">
    export type GenericExpressionProps = {
        genericExpression: GenericExpression;
    };
</script>

<script lang="ts">
    import tooltip from '$src/traits/tooltip';
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import statusIndicator from '$src/traits/status-indicator';
    import { GenericExpression } from '$global';

    type $$Props = NodeProps;
    export let data: $$Props['data'];
    const { genericExpression } = data as GenericExpressionProps;
</script>

<div
    use:tooltip={{ content: genericExpression.text, delay: 150 }}
    class=" bg-node-normal shadow-node flex h-20 w-[260px] cursor-default flex-row rounded-sm"
>
    <Handle type="target" id="target" position={Position.Left} class=" absolute -ml-2.5 h-3 w-3" />
    <Handle type="source" id="source" position={Position.Right} class=" absolute -mr-2.5 h-3 w-3" />
    <div class="w-1 rounded-l-sm" use:statusIndicator={{ status: 'done' }}></div>
    <div class="flex h-full flex-grow items-center">
        <div class=" bg-node-dark m-2 w-full p-1 py-3">
            <span class="text-text-muted w-full whitespace-pre text-left text-lg"
                >{genericExpression.text}</span
            >
        </div>
    </div>
</div>
