<script context="module" lang="ts">
    export type GenericExpressionProps = {
        genericExpression: GenericExpression;
        status: Status;
    };
</script>

<script lang="ts">
    import { tooltip } from '$src/traits/tooltip';
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import { GenericExpression } from '$global';
    import StatusIndicator, { type Status } from '$src/components/ui/status-indicator/status-indicator.svelte';

    type $$Props = NodeProps;
    export let data: $$Props['data'];
    export let selected: $$Props['selected'] = undefined;
    $: ({ genericExpression, status } = data as GenericExpressionProps);
</script>

<div
    use:tooltip={{ content: genericExpression.text, delay: 150 }}
    data-state={selected ? 'selected' : ''}
    class=" bg-node-normal [&[data-state=selected]]:shadow-highlight shadow-node flex h-24 w-[260px] cursor-default flex-row rounded-sm"
>
    <Handle type="target" id="target" position={Position.Left} class=" absolute -ml-2.5 h-3 w-3" />
    <Handle type="source" id="source" position={Position.Right} class=" absolute -mr-2.5 h-3 w-3" />
    <StatusIndicator {status} direction="vertical" class="w-1 rounded-l-sm" />
    <div class="flex h-full flex-grow items-center p-2">
        <div class=" bg-node-dark w-full p-1 py-4">
            <span class="text-text-muted w-full whitespace-pre text-left text-xl">{genericExpression.text}</span>
        </div>
    </div>
</div>
