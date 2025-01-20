<script context="module" lang="ts">
    export type CallProps = { call: Call; status: Status; openSegmentEditor: () => void };
</script>

<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import { tooltip } from '$src/traits/tooltip';
    import { Call } from '$global';
    import CategoryIcon from '$assets/category/categoryIcon.svelte';
    import StatusIndicator, { type Status } from '$src/components/ui/status-indicator/status-indicator.svelte';

    type $$Props = NodeProps;
    export let data: $$Props['data'];
    export let selected: $$Props['selected'] = undefined;
    $: ({ call, status, openSegmentEditor } = data as CallProps);
    let expanded: boolean = true;
</script>

<button
    use:tooltip={{ content: call.name, delay: 150 }}
    data-state={selected ? 'selected' : ''}
    class={` bg-node-normal [&[data-state=selected]]:shadow-highlight shadow-node relative w-[260px] cursor-default rounded-sm pb-2 focus-visible:outline-none`}
    on:dblclick={() => openSegmentEditor()}
>
    <div class="flex w-full flex-row items-center p-1">
        <CategoryIcon name={call.category} className="w-14 h-14 p-1 pr-4 stroke-text-normal" />
        <div class="flex h-16 flex-col justify-center">
            <span class="text-text-muted truncate text-left text-lg">{call.self ?? ''}</span>
            <span class="text-text-normal truncate text-left text-2xl font-bold">{call.name}</span>
        </div>
        {#if !call.self && !(call.category === 'Segment')}
            <Handle type="target" position={Position.Left} id="self" class=" absolute top-3 -ml-2.5 h-3 w-3" />
        {/if}
    </div>
    <StatusIndicator {status} class="h-1 w-full" />
    {#if expanded}
        <div class=" bg-node-dark flex w-full flex-col py-2">
            {#each call.resultList as result}
                <div class="text-text-muted relative w-full px-1 text-right text-lg">
                    {result.name}
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={result.name}
                        class=" absolute -mr-2.5 h-3 w-3"
                    />
                </div>
            {/each}
            {#each call.parameterList as parameter}
                <div class="text-text-muted relative w-full px-1 text-left text-lg">
                    {parameter.name}
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={parameter.name}
                        class="absolute -ml-2.5 h-3 w-3"
                    />
                </div>
            {/each}
        </div>
    {/if}
    {#if !expanded && call.parameterList.length > 0}
        <Handle type="target" position={Position.Left} class=" absolute -ml-2.5 h-3 w-3" />
    {/if}
    {#if !expanded && call.resultList.length > 0}
        <Handle type="source" position={Position.Right} class=" absolute -mr-2.5 h-3 w-3" />
    {/if}
</button>
