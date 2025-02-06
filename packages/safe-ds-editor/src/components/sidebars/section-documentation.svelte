<script lang="ts">
    import Markdown from '@magidoc/plugin-svelte-marked';
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

<div class={cn('flex h-full w-full select-text flex-col gap-3 text-wrap p-2 pl-3 pt-4', className)}>
    <Markdown source={description} />
</div>
