<script context="module" lang="ts">
    export type GenericExpressionProps = {
        genericExpression: GenericExpression;
    };
</script>

<script lang="ts">
    import tooltip from '$src/traits/tooltip';
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import ChevonRight from 'svelte-radix/ChevronRight.svelte';
    import Port from '$src/components/nodes/port.svelte';
    import statusIndicator from '$src/traits/status-indicator';
    import NodeIcon from '$assets/node/nodeIcon.svelte';
    import { split } from 'postcss/lib/list';
    import { GenericExpression } from '$global';

    type $$Props = NodeProps;

    export let data: { genericExpression: GenericExpression };
    const { genericExpression } = data;

    let expanded: boolean = false;
</script>

<div
    class=" bg-node_main shadow-node flex cursor-default flex-row gap-1 rounded-sm"
>
    <Port nameNode="expressions-dummy" type="both"></Port>
    <div
        class="w-1 rounded-l-sm"
        use:statusIndicator={{ status: 'done' }}
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
            <NodeIcon
                className="stroke-text_main h-12 w-12 p-1"
                name={'genericExpressionIcon'}
            />
        </div>
        {#if expanded}
            <div class=" bg-background_dark grid p-1 pr-3">
                {#each genericExpression.text.split('\n') as line}
                    <span class="text-text_secondary whitespace-pre text-sm"
                        >{line}</span
                    >
                {/each}
            </div>
        {/if}
    </div>
</div>
