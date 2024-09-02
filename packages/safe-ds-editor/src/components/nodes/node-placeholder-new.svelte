<script context="module" lang="ts">
    export type PlaceholderProps = { placeholder: Placeholder };
</script>

<script lang="ts">
    import tooltip from '$src/traits/tooltip';
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import { Placeholder } from '$global';
    import DataTypeIcon from '$src/assets/type/typeIcon.svelte';
    import StatusIndicator from '$src/components/ui/status-indicator/status-indicator.svelte';

    type $$Props = NodeProps;
    export let data: $$Props['data'];
    export let selected: $$Props['selected'] = undefined;
    const { placeholder } = data as PlaceholderProps;
    let isHovered = false;
</script>

<div
    role="tooltip"
    data-state={selected ? 'selected' : ''}
    class="shadow-node [&[data-state=selected]]:shadow-highlight h-24 w-24 cursor-default rounded-xl"
    on:mouseover={() => (isHovered = true)}
    on:mouseout={() => (isHovered = false)}
    on:focus={() => {}}
    on:blur={() => {}}
>
    <span
        data-state={isHovered ? 'full' : 'truncated'}
        class="text-text-normal absolute -left-6 -top-2 block w-36 -translate-y-full text-center text-2xl font-bold [&[data-state=truncated]]:truncate"
    >
        {placeholder.name}
    </span>
    <div class="flex h-full w-full flex-col bg-transparent">
        <StatusIndicator status={'done'} class={`h-4 w-full rounded-t-xl`} />
        <div class="bg-node-normal flex-grow"></div>
        <StatusIndicator status={'done'} class={`h-4 w-full rounded-b-xl`} />
        <div class="absolute left-0 top-0 h-24 w-24 rounded-xl bg-transparent py-1">
            <div class="bg-node-normal h-full w-full rounded-xl">
                <DataTypeIcon
                    name={placeholder.type}
                    className={'overflow-hidden h-full w-full stroke-text-normal p-2'}
                />
                <Handle
                    type="target"
                    id="target"
                    position={Position.Left}
                    class=" absolute -ml-2.5 h-3 w-3"
                />
                <Handle
                    type="source"
                    id="source"
                    position={Position.Right}
                    class=" absolute -mr-2.5 h-3 w-3"
                />
            </div>
        </div>
    </div>
</div>
