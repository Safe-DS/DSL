<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn } from '$pages/utils';

    type $$Props = HTMLAttributes<HTMLDivElement>;

    let className: $$Props['class'] = undefined;
    export { className as class };
</script>

<div class={cn('p-4 pt-0', className)} {...$$restProps}>
    <slot />
</div>
