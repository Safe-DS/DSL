<script context="module" lang="ts">
    export type Parameter = {
        name: string;
        argumentText: string | undefined;
        defaultValue: string | undefined;
        isConstant: boolean;
        type: string;
    };
</script>

<script lang="ts">
    import { type Node as XYNode } from '@xyflow/svelte';
    import { intersect, getParameterList } from './utils';
    import { cn } from '$src/pages/utils';
    import type { ClassValue } from 'clsx';

    export let className: ClassValue;
    export { className as class };
    export let selectedNodeList: XYNode[];

    $: parameterList = intersect(selectedNodeList.map(getParameterList));
</script>

<div class={cn('grid grid-cols-[auto_1fr] gap-2 p-2', className)}>
    {#each parameterList as parameter}
        <p class="whitespace-nowrap p-1">
            {parameter.name}
        </p>
        <input
            class="text-text-normal placeholder:text-text-muted bg-menu-400 truncate min-w-0 rounded-md p-1"
            type="text"
            placeholder={parameter.defaultValue && parameter.defaultValue !== 'null' ? parameter.defaultValue : ''}
            bind:value={parameter.argumentText}
        />
    {/each}
</div>
