<script context="module" lang="ts">
    export type StatementProps = { statement: Statement };
</script>

<script lang="ts">
    import tooltip from '$lib/traits/tooltip';

    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import ChevonRight from 'svelte-radix/ChevronRight.svelte';
    import Port from './node-statement-port.svelte';
    import statusIndicator from '$lib/traits/status-indicator';

    type $$Props = NodeProps;

    export let data: { statement: Statement };
    const { statement } = data;

    let expanded: boolean = true;
</script>

<div
    use:tooltip={{ content: statement.name, delay: 150 }}
    class=" bg-node_main shadow-node w-[160px] cursor-default rounded-sm"
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        data-state={expanded ? 'open' : 'closed'}
        class=" flex cursor-pointer flex-row items-center p-1 [&[data-state=open]>svg:last-of-type]:rotate-90"
        on:click={() => {
            expanded = !expanded;
        }}
        on:keypress={(event) => {
            if (event.key === 'Enter') expanded = !expanded;
        }}
    >
        <svelte:component
            this={statement.category.icon}
            className="h-6 w-6 flex-shrink-0 stroke-node_main_text mr-1"
        />
        <!-- <ChevonRight
            class="duration-35 text-vscode_foreground mr-1 h-4 w-4 shrink-0 transition-transform focus:outline-none"
        /> -->
        <span class="text-node_main_text truncate">{statement.name}</span>
    </div>
    <div
        use:statusIndicator={{ status: statement.status }}
        class=" h-1 w-full"
    ></div>
    {#if expanded}
        <div class=" bg-vscode_main_background grid py-1">
            <Port
                nameFunction="testfunction"
                nameParameter="Testparameter1"
                type="source"
            ></Port>
            <Port
                nameFunction="testfunction"
                nameParameter="Testparameter2"
                type="target"
            ></Port>
            <Port
                nameFunction="testfunction"
                nameParameter="Testparameter3"
                type="target"
            ></Port>
            <Port
                nameFunction="testfunction"
                nameParameter="Testparameter4"
                type="target"
                optional={true}
            ></Port>
        </div>
    {/if}
    <div class="bg-node_main min-h-2 rounded-b-sm">
        {#if !expanded}
            <Port nameFunction="testfunction" type="both"></Port>
        {/if}
    </div>
</div>
