<script lang="ts">
    import { Ast, CustomError, GlobalReference } from '$global';
    import { onMount, setContext } from 'svelte';
    import ErrorPage from '$pages/ErrorPage.svelte';
    import MessageHandler from '$src/messaging/messageHandler';
    import { writable } from 'svelte/store';
    import { SvelteFlowProvider, type Node as XYNode } from '@xyflow/svelte';
    import type { PaneAPI } from 'paneforge';
    import * as Resizable from '$src/components/ui/resizable';
    import Sidebar from '$/src/components/sidebars/sidebar.svelte';
    import Flow from '$/src/components/flow/flow.svelte';
    import Button from '../components/ui/button/button.svelte';
    import { HamburgerMenu } from 'svelte-radix';

    MessageHandler.initialize();
    MessageHandler.listenToMessages();

    let ast = writable<Ast>(new Ast());
    let errorList = writable<CustomError[]>([]);
    let globalReferences = writable<GlobalReference[]>([]);

    async function fetchAst() {
        const response = await MessageHandler.getAst();
        errorList.set(response.errorList);
        ast.set(response.ast);
    }

    async function fetchGlobalReferences() {
        const response = await MessageHandler.getGlobalReferences();
        console.log(
            response.globalReferences
                .map((ref) => ref.parent + '.' + ref.name)
                .sort()
                .join('\n'),
        );
        globalReferences.set(response.globalReferences);
    }

    onMount(async () => {
        await fetchAst();
        await fetchGlobalReferences();
    });

    function handleError(error: CustomError) {
        if (error.action === 'block')
            errorList.update((array) => {
                array.push(error);
                return array;
            });

        if (error.action === 'notify') console.log(error.message);
    }
    setContext('handleError', handleError);

    let selectedNodeList: XYNode[] = [];

    let mainSidebar: PaneAPI;
    let isCollapsed = false;
</script>

{#if $errorList.length > 0}
    <ErrorPage bind:errorList />
{:else}
    <div class=" border-menu-400 relative box-border h-full w-full border-t-[1px]">
        <main class="h-full w-full">
            <Resizable.PaneGroup direction="horizontal">
                <Resizable.Pane
                    defaultSize={25}
                    collapsedSize={0}
                    collapsible={true}
                    minSize={5}
                    bind:pane={mainSidebar}
                    onCollapse={() => (isCollapsed = true)}
                    onExpand={() => (isCollapsed = false)}
                >
                    <Sidebar {globalReferences} {selectedNodeList} />
                </Resizable.Pane>

                {#if isCollapsed}
                    <Button
                        class="bg-menu-400 absolute left-2 top-2 p-2"
                        on:click={() => {
                            mainSidebar.expand();
                        }}
                    >
                        <HamburgerMenu size={20} />
                    </Button>
                {/if}

                <Resizable.Handle class=" bg-menu-400 z-10 after:!w-2" />

                <Resizable.Pane>
                    <SvelteFlowProvider>
                        <Flow
                            on:selectionChange={(event) => {
                                selectedNodeList = event.detail;
                            }}
                            astWritable={ast}
                        />
                    </SvelteFlowProvider>
                </Resizable.Pane>
            </Resizable.PaneGroup>
        </main>
    </div>
{/if}
