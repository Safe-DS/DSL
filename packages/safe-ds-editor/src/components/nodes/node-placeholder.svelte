<script context="module" lang="ts">
    export type PlaceholderProps = {
        placeholder: Placeholder;
        runUntilHere: (id: string) => void;
        isSegment: boolean;
        status: Status;
    };
</script>

<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import { Placeholder } from '$global';
    import DataTypeIcon from '$src/assets/type/typeIcon.svelte';
    import StatusIndicator, { type Status } from '$src/components/ui/status-indicator/status-indicator.svelte';
    import * as ContextMenu from '$src/components/ui/context-menu';

    type $$Props = NodeProps;
    export let data: $$Props['data'];
    export let id: $$Props['id'];
    export let selected: $$Props['selected'] = undefined;
    $: ({ placeholder, runUntilHere, isSegment, status } = data as PlaceholderProps);
    let isHovered = false;
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>
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
                class="text-text-normal absolute -left-6 -top-2 block w-36 -translate-y-full text-center text-2xl font-bold data-[state=truncated]:truncate"
            >
                {placeholder.name}
            </span>
            <div class="flex h-full w-full flex-col bg-transparent">
                <StatusIndicator {status} class={`h-4 w-full rounded-t-xl`} />
                <div class="bg-node-normal flex-grow"></div>
                <StatusIndicator {status} class={`h-4 w-full rounded-b-xl`} />
                <div class="absolute left-0 top-0 h-24 w-24 rounded-xl bg-transparent py-1">
                    <div class="bg-node-normal h-full w-full rounded-xl">
                        <DataTypeIcon
                            name={placeholder.type}
                            className={'overflow-hidden h-full w-full stroke-text-normal p-2'}
                        />
                        <Handle type="target" id="target" position={Position.Left} class=" absolute -ml-2.5 h-3 w-3" />
                        <Handle type="source" id="source" position={Position.Right} class=" absolute -mr-2.5 h-3 w-3" />
                    </div>
                </div>
            </div>
        </div>
    </ContextMenu.Trigger>
    <ContextMenu.Content class=" bg-node-dark border-node-dark text-text-normal">
        <ContextMenu.Item
            disabled={isSegment}
            class="data-[highlighted]:bg-node-normal data-[highlighted]:text-text-normal"
            on:click={() => {
                console.log('run until here');
                runUntilHere(id);
            }}>Run until here</ContextMenu.Item
        >
    </ContextMenu.Content>
</ContextMenu.Root>
