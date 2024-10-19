<script lang="ts">
    import { CustomError, GlobalReference, Graph, Segment } from '$global';
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

    let currentGraph = writable<Graph | Segment>(new Graph('pipeline'));
    let pipeline = writable<Graph>(new Graph('pipeline'));
    let segmentList = writable<Segment[]>([]);
    let errorList = writable<CustomError[]>([]);
    let globalReferences = writable<GlobalReference[]>([]);

    async function fetchParsedDocument() {
        const response = await MessageHandler.getAst();
        errorList.set(response.errorList);
        pipeline.set(response.pipeline);
        currentGraph.set(response.pipeline);
        segmentList.set(response.segmentList);
    }

    MessageHandler.handleSyncEvent((elements) => {
        pipeline.set(elements.pipeline);
        errorList.set(elements.errorList);
        segmentList.set(elements.segmentList);

        const match = elements.segmentList.find(
            (e) => e.type === $currentGraph.type && e.name === $currentGraph.name,
        );

        if (match) {
            currentGraph.set(new Graph('pipeline'));
            setTimeout(() => currentGraph.set(match), 0);
        } else {
            currentGraph.set(new Graph('pipeline'));
            setTimeout(() => currentGraph.set(elements.pipeline), 0);
        }
    });

    async function fetchGlobalReferences() {
        const response = await MessageHandler.getGlobalReferences();
        globalReferences.set(response.globalReferences);
    }

    onMount(async () => {
        await fetchParsedDocument();
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

    function handleEditSegment(event: CustomEvent<number>) {
        const index: number = event.detail;
        const segment = $segmentList[index];
        currentGraph.set(segment);
    }
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
                    <Sidebar
                        on:editSegment={handleEditSegment}
                        {segmentList}
                        {globalReferences}
                        {selectedNodeList}
                    />
                </Resizable.Pane>

                {#if isCollapsed}
                    <Button
                        class="bg-menu-400 absolute left-2 top-2 p-2"
                        on:click={() => {
                            mainSidebar.expand();
                            mainSidebar.resize(25);
                        }}
                    >
                        <HamburgerMenu size={20} />
                    </Button>
                {/if}

                <Resizable.Handle class=" bg-menu-400 z-10 after:!w-2" />

                <Resizable.Pane>
                    <SvelteFlowProvider>
                        <Flow
                            on:editPipeline={() => {
                                currentGraph.set($pipeline);
                            }}
                            on:selectionChange={(event) => {
                                selectedNodeList = event.detail;
                            }}
                            pipeline={$currentGraph}
                        />
                    </SvelteFlowProvider>
                </Resizable.Pane>
            </Resizable.PaneGroup>
        </main>
    </div>
{/if}
