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

    let expanded: boolean = true;
</script>

<div
    class=" bg-node_main shadow-node flex cursor-default flex-row gap-1 rounded-sm"
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
            class=" flex cursor-pointer flex-row items-center p-1"
            on:click={() => {
                expanded = !expanded;
            }}
            on:keypress={(event) => {
                if (event.key === 'Enter') expanded = !expanded;
            }}
        >
            <svelte:component
                this={node.expressionIcon}
                className="h-11 w-11 stroke-node_main_text"
            />
        </div>
        {#if expanded}
            <div class=" bg-vscode_main_background grid p-1 pr-3">
                {#each expression.text.split('\n') as line}
                    <span class=" whitespace-pre text-sm">{line}</span>
                {/each}
            </div>
        {/if}
    </div>
</div>
