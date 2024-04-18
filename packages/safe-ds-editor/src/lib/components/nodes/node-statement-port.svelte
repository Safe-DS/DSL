<script lang="ts">
    import { cn } from '$lib/utils';
    import { Handle, Position } from '@xyflow/svelte';

    export let nameFunction: string;
    export let nameParameter: string = '';
    export let type: 'target' | 'source' | 'both';
    export let optional: boolean = false;
</script>

<div
    class={`${
        type === 'both' ? 'text-transparent' : 'text-text_secondary'
    } relative w-full justify-center px-1 text-sm ${
        type === 'target' ? 'text-left' : 'text-right'
    }`}
>
    {#if type === 'both'}
        <Handle
            class="-left-2 h-2.5 w-2.5"
            id={`${nameFunction}|groupTarget`}
            type="target"
            position={Position.Left}
        />
        <Handle
            class="-right-2 h-2.5 w-2.5"
            id={`${nameFunction}|groupSource`}
            type="source"
            position={Position.Right}
        />Placeholder
    {:else}
        <Handle
            class={` border-text_main h-2.5 w-2.5 rounded-full border-[1px] ${
                type === 'target' ? '-left-2' : '-right-2'
            } ${
                optional
                    ? 'bg-text_main ring-[2px] ring-inset ring-node_main'
                    : ''
            }`}
            id={`${nameFunction}|${nameParameter}`}
            {type}
            position={type == 'target' ? Position.Left : Position.Right}
        />

        {nameParameter}
    {/if}
</div>
