<script lang="ts">
    import { Tabs as TabsPrimitive } from 'bits-ui';
    import { cn } from '$lib/utils.js';

    type $$Props = TabsPrimitive.TriggerProps;
    type $$Events = TabsPrimitive.TriggerEvents;

    let className: $$Props['class'] = undefined;
    export let value: $$Props['value'];
    export { className as class };
</script>

<TabsPrimitive.Trigger
    class={cn(
        'data-[state=active]:text-text_main data-[state=active]:bg-background_dark inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow',
        className,
    )}
    {value}
    {...$$restProps}
    on:click
    on:keydown
    on:focus
>
    <slot />
</TabsPrimitive.Trigger>
