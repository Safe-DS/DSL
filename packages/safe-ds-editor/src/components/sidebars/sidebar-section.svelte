<script lang="ts">
    import { cn } from '$pages/utils';
    import type { ClassValue } from 'clsx';
    import { ScrollArea } from '$src/components/ui/scroll-area';
    import * as Resizable from '$src/components/ui/resizable';
    import ChevronRight from 'svelte-radix/ChevronRight.svelte';

    export let name: string;
    export let order: number;
    export let showPane: boolean = true;
    export let showResizeHandle: boolean = false;
    export let className: ClassValue;
    export { className as class };
</script>

<button
    class={cn(
        'hover:bg-menu-500 flex flex-row items-center whitespace-nowrap p-1 text-left hover:underline [&[data-state=open]>svg:first-of-type]:rotate-90',
        className,
    )}
    data-state={showPane ? 'open' : 'closed'}
    on:mousedown={() => {
        showPane = !showPane;
    }}
>
    <ChevronRight
        class="duration-35 mr-2 h-4 w-4 shrink-0 transition-transform focus:outline-none"
    />
    {name}
</button>
{#if showPane}
    <Resizable.Pane class="h-full w-full" {order} minSize={5}>
        <ScrollArea class="h-full w-full p-1"><slot /></ScrollArea>
    </Resizable.Pane>
{/if}

{#if showResizeHandle && showPane}
    <Resizable.Handle class=" bg-menu-400 z-10 after:h-2" />
{/if}
