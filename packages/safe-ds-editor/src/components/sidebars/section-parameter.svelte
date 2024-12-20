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
    import { intersect, getName, getParameterList } from './utils';
    import { cn } from '$src/pages/utils';
    import type { ClassValue } from 'clsx';

    export let className: ClassValue;
    export { className as class };
    export let selectedNodeList: XYNode[];

    $: name = getName(selectedNodeList);
    $: parameterList = intersect(selectedNodeList.map(getParameterList));
</script>

<div class={cn('flex flex-col gap-2 p-2 pl-3', className)}>
    <h2 class="text-text-highligh truncate text-xl font-bold">{name}</h2>
    <div class="p-1">
        {#each parameterList as parameter}
            <div class="flex flex-row items-center gap-2 rounded-sm p-1">
                <div class=" w-32 flex-shrink-0 truncate">
                    {parameter.name}
                </div>
                <input
                    class={`text-text-normal placeholder:text-text-muted bg-menu-400 flex-grow truncate rounded-md p-1`}
                    type="text"
                    placeholder={parameter.defaultValue && parameter.defaultValue !== 'null'
                        ? parameter.defaultValue
                        : ''}
                    bind:value={parameter.argumentText}
                />
            </div>
        {/each}
    </div>
</div>
