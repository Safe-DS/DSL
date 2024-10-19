<script context="module" lang="ts">
    export type Status = 'done' | 'processing' | 'waiting' | 'none';
</script>

<script lang="ts">
    import { cn } from '$/src/pages/utils';
    import type { ClassValue } from 'clsx';

    export let className: ClassValue;
    export { className as class };
    export let status: Status;

    const getStyle = (status: Status): string => {
        switch (status) {
            case 'none':
                return ' bg-neutral-400';
            case 'processing':
            case 'waiting':
                return ' bg-yellow-500';
            case 'done':
                return ' bg-green-400';
            default:
                return '';
        }
    };
</script>

<div class={cn(getStyle(status), className)}><slot /></div>
