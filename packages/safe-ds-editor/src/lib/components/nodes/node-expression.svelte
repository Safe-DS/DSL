<script context="module" lang="ts">
    export type ExpressionProps = { expression: Expression };
</script>

<script lang="ts">
    import tooltip from '$lib/traits/tooltip';

    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import ChevonRight from 'svelte-radix/ChevronRight.svelte';
    import Port from './port.svelte';
    import statusIndicator from '$lib/traits/status-indicator';
    import { node } from 'src/assets/node/node';

    type $$Props = NodeProps;

    export let data: { expression: Expression };
    const { expression } = data;
</script>

<div
    class=" rounded-placeholderFrame bg-node_main shadow-node w-[180px] cursor-default"
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class=" flex cursor-pointer flex-row items-center p-1 [&[data-state=open]>svg:last-of-type]:rotate-90"
    >
        <svelte:component
            this={node.expressionIcon}
            className="h-6 w-6 flex-shrink-0 stroke-node_main_text mr-1"
        />
    </div>
    <div
        use:statusIndicator={{ status: expression.status }}
        class=" h-1 w-full"
    ></div>

    <Port nameFunction="testfunction" type="both"></Port>
</div>
