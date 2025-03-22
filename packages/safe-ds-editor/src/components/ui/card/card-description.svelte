<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn } from '$pages/utils';

    type $$Props = HTMLAttributes<HTMLParagraphElement>;

    let className: $$Props['class'] = undefined;
    export { className as class };
</script>

<p class={cn('text-text-muted text-sm', className)} {...$$restProps}>
    <slot />
</p>
