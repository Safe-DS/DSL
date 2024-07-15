<!-- <script context="module" lang="ts">
    export type ExtensionProps = { extension: Segment };
</script> -->

<script lang="ts">
    // import tooltip from '$pages/traits/tooltip';

    import { type NodeProps } from '@xyflow/svelte';
    // import ChevonRight from 'svelte-radix/ChevronRight.svelte';
    // import Port from './port.svelte';
    // import statusIndicator from '$pages/traits/status-indicator';
    // import { menu } from 'src/assets/menu/menuIcon.svelte';
    // import Button from '../ui/button/button.svelte';

    type $$Props = NodeProps;

    // export let data: { extension: Extension };
    // const { extension } = data;
    // const statement = extension;
    // let expanded: boolean = true;
</script>

<div></div>
<!-- <div
    use:tooltip={{ content: statement.name, delay: 150 }}
    class=" bg-node-normal shadow-node w-[160px] cursor-default rounded-sm"
>
    <div
        use:statusIndicator={{ status: statement.status }}
        class="rounded-sm p-1"
    >
        <div
            data-state={expanded ? 'open' : 'closed'}
            class="bg-node-normal flex cursor-pointer flex-row items-center p-1 [&[data-state=open]>svg:last-of-type]:rotate-90"
            on:click={() => {
                expanded = !expanded;
            }}
            on:keypress={(event) => {
                if (event.key === 'Enter') expanded = !expanded;
            }}
        >
            <Button
                class="text-text-normal mr-1 h-6 w-6 px-4"
                variant="ghost"
                size="icon"
                on:click={(event) => {
                    event.stopPropagation();
                }}
            >
                <svelte:component
                    this={menu.open}
                    className="h-6 w-6 flex-shrink-0"
                />
            </Button>
            <ChevonRight
                class="duration-35 text-text-normal mr-1 h-4 w-4 shrink-0 transition-transform focus:outline-none"
            /> 
            <span class="text-text-normal truncate">{statement.name}</span>
        </div>

        {#if expanded}
            <div class=" bg-menu-700 grid py-1">
                <div
                    class="text-text-muted relative w-full justify-center px-1 text-right text-sm"
                >
                    Testparameter1
                    <Port
                        nameNode="testfunction"
                        namePort="Testparameter1"
                        type="source"
                        margin={2.5}
                    ></Port>
                </div>
                <div
                    class="text-text-muted relative w-full justify-center px-1 text-sm"
                >
                    Testparameter2
                    <Port
                        nameNode="testfunction"
                        namePort="Testparameter2"
                        type="target"
                        margin={2.5}
                    ></Port>
                </div>
                <div
                    class="text-text-muted relative w-full justify-center px-1 text-sm"
                >
                    Testparameter3
                    <Port
                        nameNode="testfunction"
                        namePort="Testparameter3"
                        type="target"
                        margin={2.5}
                    ></Port>
                </div>
                <div
                    class="text-text-muted relative w-full justify-center px-1 text-sm"
                >
                    Testparameter4
                    <Port
                        nameNode="testfunction"
                        namePort="Testparameter4"
                        type="target"
                        optional={true}
                        margin={2.5}
                    ></Port>
                </div>
            </div>
        {/if}
        <div class="bg-node-normal min-h-2 rounded-b-sm"></div>
        {#if !expanded}
            <Port nameNode="testfunction" type="both" margin={2.5}></Port>
        {/if}
    </div>
</div> -->
