<script lang="ts">
    import { Accordion as AccordionPrimitive } from 'bits-ui';
    import ChevronRight from 'svelte-radix/ChevronRight.svelte';
    import { cn } from '$lib/utils';

    type $$Props = AccordionPrimitive.TriggerProps;
    type $$Events = AccordionPrimitive.TriggerEvents;

    let className: $$Props['class'] = undefined;
    export let level: AccordionPrimitive.HeaderProps['level'] = 3;
    export { className as class };
</script>

<AccordionPrimitive.Header {level} class="flex">
    <AccordionPrimitive.Trigger
        class={cn(
            'flex items-center text-sm font-medium transition-all hover:underline [&[data-state=open]>svg:first-of-type]:rotate-90',
            className,
        )}
        {...$$restProps}
        on:click
    >
        <ChevronRight
            class=" duration-35 h-4 w-4 shrink-0 transition-transform focus:outline-none"
        />
        <slot />
    </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
