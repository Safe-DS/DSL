<script context="module" lang="ts">
    export type StatementProps = { statement: Statement };
</script>

<script lang="ts">
    import tooltip from '$lib/traits/tooltip';

    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import ChevonRight from 'svelte-radix/ChevronRight.svelte';

    type $$Props = NodeProps;

    export let data: { statement: Statement };
    const { statement } = data;
</script>

<!-- <Handle id="test" type="target" position={Position.Left} /> -->

<div
    use:tooltip={{ content: statement.name, delay: 150 }}
    class=" flex w-[180px] flex-col rounded-sm bg-neutral-700"
>
    <div class=" flex flex-row items-center p-1">
        <svelte:component
            this={statement.category.icon}
            className="h-6 w-6 flex-shrink-0 stroke-vscode_foreground mr-1"
        />
        <ChevonRight
            class="duration-35 text-vscode_foreground mr-1 h-4 w-4 shrink-0 transition-transform focus:outline-none"
        />
        <script lang="ts">
            import * as Tooltip from '$lib/components/ui/tooltip';
        </script>
        <span class="truncate">{statement.name}</span>
    </div>
    <div class=" h-[4px] w-full bg-green-400"></div>
</div>
