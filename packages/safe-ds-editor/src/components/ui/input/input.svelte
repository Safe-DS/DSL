<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import type { InputEvents } from './index.js';
    import { cn } from '$pages/utils';

    type $$Props = HTMLInputAttributes;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type $$Events = InputEvents;

    let className: $$Props['class'] = undefined;
    export let value: $$Props['value'] = undefined;
    export { className as class };

    // Workaround for https://github.com/sveltejs/svelte/issues/9305
    // Fixed in Svelte 5, but not backported to 4.x.
    export let readonly: $$Props['readonly'] = undefined;
</script>

<input
    class={cn(
        'placeholder:text-text-muted border-menu-400 focus:border-menu-50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50',
        className,
    )}
    bind:value
    {readonly}
    on:blur
    on:change
    on:click
    on:focus
    on:focusin
    on:focusout
    on:keydown
    on:keypress
    on:keyup
    on:mouseover
    on:mouseenter
    on:mouseleave
    on:paste
    on:input
    on:wheel
    {...$$restProps}
/>
