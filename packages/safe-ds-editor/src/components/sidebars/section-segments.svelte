<script lang="ts">
    import type { ClassValue } from 'clsx';
    import { cn } from '$src/pages/utils';
    import type { Writable } from 'svelte/store';
    import type { Segment } from '$global';
    import { createEventDispatcher } from 'svelte';

    export let className: ClassValue;
    export { className as class };
    export let segmentList: Writable<Segment[]>;

    const dispatch = createEventDispatcher();
</script>

<div class={cn('flex h-full w-full flex-col p-2 pl-3', className)}>
    {#each $segmentList as segment, index}
        <div class=" flex flex-row p-2">
            <span class="  cursor-grab">{segment.name}</span>
            <div class=" flex-grow" />
            <button
                class=" bg-menu-400 hover:bg-menu-300 rounded p-1"
                on:mousedown={() => dispatch('editSegment', index)}>Edit</button
            >
        </div>
    {/each}
</div>
