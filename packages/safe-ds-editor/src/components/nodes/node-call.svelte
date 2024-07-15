<script context="module" lang="ts">
    export type CallProps = { call: Call };
</script>

<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import tooltip from '$src/traits/tooltip';
    import statusIndicator from '$src/traits/status-indicator';
    import { Call } from '$global';
    import CategoryIcon from '$assets/category/categoryIcon.svelte';
    import { getCategory } from './utils';

    type $$Props = NodeProps;
    export let data: $$Props['data'];
    const { call } = data as CallProps;

    let expanded: boolean = true;
</script>

<div
    use:tooltip={{ content: call.name, delay: 150 }}
    class=" bg-node-normal shadow-node w-[260px] cursor-default rounded-sm pb-2"
>
    <button
        class=" flex w-full cursor-pointer flex-row items-center p-1"
        on:mousedown={() => {
            expanded = !expanded;
        }}
    >
        <CategoryIcon name={getCategory(call)} className={' w-12 h-12 mr-2 stroke-text-normal '} />
        <div class="flex flex-col">
            <span class="text-text-muted truncate text-left text-lg">{call.self}</span>
            <span class="text-text-normal truncate text-left text-2xl font-bold">{call.name}</span>
        </div>
        {#if !call.self}
            <Handle
                type="target"
                position={Position.Left}
                id="self"
                class=" absolute top-3 -ml-2.5 h-3 w-3"
            />
        {/if}
    </button>
    <div use:statusIndicator={{ status: 'done' }} class=" h-1 w-full"></div>
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
                <div class="text-text-muted relative w-full px-1 text-lg">
                    {parameter.name}
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={parameter.name}
                        class=" absolute -ml-2.5 h-3 w-3"
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
</div>
