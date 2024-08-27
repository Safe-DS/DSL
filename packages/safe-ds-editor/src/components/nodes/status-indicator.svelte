<script context="module" lang="ts">
    export type NodeStatus = 'ready' | 'queued' | 'done' | 'processing' | 'error';
</script>

<script lang="ts">
    import { cn } from '$/src/pages/utils';
    import type { ClassValue } from 'clsx';

    export let className: ClassValue;
    export { className as class };
    export let status: NodeStatus;

    const getStyle = (status: NodeStatus): string => {
        switch (status) {
            case 'ready':
                return ' bg-neutral-400';
            case 'queued':
                return ' bg-yellow-500';
            case 'done':
                return ' bg-green-400';
            case 'error':
                return ' bg-red-600';
            default:
                return '';
        }
    };
</script>

<div class={cn(getStyle(status), className)}><slot /></div>
