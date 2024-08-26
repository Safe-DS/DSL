<script lang="ts">
    import { marked } from 'marked';
    import { getDescription } from './utils';
    import { type Node as XYNode } from '@xyflow/svelte';
    import { cn } from '$src/pages/utils';
    import type { ClassValue } from 'clsx';

    export let className: ClassValue;
    export { className as class };
    export let selectedNodeList: XYNode[];

    let description: string = '';
    $: {
        getDescription(selectedNodeList).then((_) => (description = _));
    }
</script>

<div class={cn('flex select-text flex-col gap-3 text-wrap p-2', className)}>
    {@html marked(description)}
</div>
