<script context="module" lang="ts">
    export type StatementProps = { statement: Statement };
</script>

<script lang="ts">
    import tooltip from '$pages/traits/tooltip';

    import { type NodeProps } from '@xyflow/svelte';
    import ChevonRight from 'svelte-radix/ChevronRight.svelte';
    import Port from './port.svelte';
    import statusIndicator from '$pages/traits/status-indicator';

    type $$Props = NodeProps;

    export let data: { statement: Statement };
    const { statement } = data;

    let expanded: boolean = true;
</script>

<div
    use:tooltip={{ content: statement.name, delay: 150 }}
    class=" bg-node_main shadow-node w-[160px] cursor-default rounded-sm"
>
    <!-- [&[data-state=open]>svg:last-of-type]:rotate-90 -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        data-state={expanded ? 'open' : 'closed'}
        class=" flex cursor-pointer flex-row items-center p-1"
        on:click={() => {
            expanded = !expanded;
        }}
    >
        <svelte:component
            this={statement.category.icon}
            className="h-6 w-6 flex-shrink-0 stroke-text_main mr-1"
        />
        <!-- <ChevonRight
            class="duration-35 text-text_main mr-1 h-4 w-4 shrink-0 transition-transform focus:outline-none"
        /> -->
        <span class="text-text_main truncate">{statement.name}</span>
    </div>
    <div
        use:statusIndicator={{ status: statement.status }}
        class=" h-1 w-full"
    ></div>
    {#if expanded}
        <div class=" bg-background_dark grid py-1">
            <div
                class="text-text_secondary relative w-full justify-center px-1 text-right text-sm"
            >
                Testparameter1
                <Port
                    nameNode="testfunction"
                    namePort="Testparameter1"
                    type="source"
                ></Port>
            </div>
            <div
                class="text-text_secondary relative w-full justify-center px-1 text-sm"
            >
                Testparameter2
                <Port
                    nameNode="testfunction"
                    namePort="Testparameter2"
                    type="target"
                ></Port>
            </div>
            <div
                class="text-text_secondary relative w-full justify-center px-1 text-sm"
            >
                Testparameter3
                <Port
                    nameNode="testfunction"
                    namePort="Testparameter3"
                    type="target"
                ></Port>
            </div>
            <div
                class="text-text_secondary relative w-full justify-center px-1 text-sm"
            >
                Testparameter4
                <Port
                    nameNode="testfunction"
                    namePort="Testparameter4"
                    type="target"
                    optional={true}
                ></Port>
            </div>
        </div>
    {/if}
    <div class="bg-node_main min-h-2 rounded-b-sm"></div>
    {#if !expanded}
        <Port nameNode="testfunction" type="both"></Port>
    {/if}
</div>
