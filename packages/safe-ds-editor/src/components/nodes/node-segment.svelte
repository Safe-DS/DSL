<script context="module" lang="ts">
    export type SegmentProps = { segment: Segment; status: Status };
</script>

<script lang="ts">
    import { type NodeProps } from '@xyflow/svelte';
    import type { Segment } from '$global';
    import { Handle, Position } from '@xyflow/svelte';
    import type { Status } from '../ui/status-indicator/status-indicator.svelte';

    type $$Props = NodeProps;
    export let data: $$Props['data'];
    export let selected: $$Props['selected'] = undefined;
    $: ({ segment } = data as SegmentProps);
</script>

<div
    data-state={selected}
    class=" border-text-normal rounded-md relative flex h-full w-full flex-col justify-center border"
>
    <div class="flex flex-row">
        <div class=" flex-grow">
            <div class="absolute right-full top-1/2 flex -translate-y-1/2 flex-col gap-5">
                {#each segment.parameterList as parameter}
                    <div class="text-text-muted relative h-9 text-lg flex items-center">
                        <p class="absolute right-0 mr-2.5 flex items-center">{parameter.name}</p>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={parameter.name}
                            class="absolute left-1 h-3 w-3"
                        />
                    </div>
                {/each}
            </div>
        </div>
        <div class=" flex-grow">
            <div class="absolute left-full top-1/2 flex -translate-y-1/2 flex-col gap-5">
                {#each segment.resultList as result}
                    <div class="text-text-muted relative h-9 text-lg flex items-center">
                        <p class="absolute left-0 ml-2.5 flex items-center">{result.name}</p>
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={result.name}
                            class="absolute -left-4 h-3 w-3"
                        />
                    </div>
                {/each}
            </div>
        </div>
    </div>
    <div class="absolute -left-96 -top-96"></div>
</div>
