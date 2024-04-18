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
    import { split } from 'postcss/lib/list';

    type $$Props = NodeProps;

    export let data: { expression: Expression };
    const { expression } = data;

    let expanded: boolean = false;
</script>

<div
    class=" flex cursor-default flex-row gap-1 rounded-sm bg-node_main shadow-node"
>
    <Port nameNode="expressions-dummy" type="both"></Port>
    <div
        class="w-1 rounded-l-sm"
        use:statusIndicator={{ status: expression.status }}
    ></div>
    <div class=" flex-grow">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            data-state={expanded ? 'open' : 'closed'}
            class=" flex cursor-pointer flex-row"
            on:click={() => {
                expanded = !expanded;
            }}
            on:keypress={(event) => {
                if (event.key === 'Enter') expanded = !expanded;
            }}
        >
            <svelte:component
                this={node.expressionIcon}
                className="h-12 w-12 stroke-text_main p-1"
            />
        </div>
        {#if expanded}
            <div class=" bg-background_dark grid p-1 pr-3">
                {#each expression.text.split('\n') as line}
                    <span class="text-text_secondary whitespace-pre text-sm"
                        >{line}</span
                    >
                {/each}
            </div>
        {/if}
    </div>
</div>
