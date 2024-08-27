<script lang="ts">
    import { cn } from '$/src/pages/utils';
    import type { ClassValue } from 'clsx';
    import { ChevronRight } from 'svelte-radix';

    export let name: string;
    export let className: ClassValue;
    export { className as class };

    let showPane: boolean = false;
</script>

<button
    class={cn(
        `hover:bg-menu-400 flex w-full flex-row items-center whitespace-nowrap p-1 text-left text-lg hover:underline [&[data-state=open]>svg:first-of-type]:rotate-90`,
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
    <div class="flex h-9 w-9 justify-center align-middle">
        <slot name="icon" />
    </div>
    {name}
</button>
{#if showPane}
    <slot />
{/if}
