<script lang="ts">
    import { writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        MiniMap,
        Background,
        BackgroundVariant,
        type Edge as XYEdge,
        useSvelteFlow,
    } from '@xyflow/svelte';
    import { Segment, SegmentGroupId, type CustomError, type Graph } from '$global';
    import {
        callToNode,
        edgeToEdge,
        genericExpressionToNode,
        nodeTypes,
        placeholderToNode,
        segmentToNode,
        type NodeCustom,
    } from '$/src/components/flow/utils';
    import { createEventDispatcher, getContext } from 'svelte';
    import { calculateLayout } from './layout';
    import MenuIcon from '$/src/assets/menu/menuIcon.svelte';
    import { colorPallet } from '$/tailwind.config';

    export let pipeline: Graph | Segment;

    const dispatch = createEventDispatcher();
    const handleError = getContext('handleError') as (error: CustomError) => void;
    const { fitView, updateNodeData } = useSvelteFlow();

    const nodes = writable<NodeCustom[]>([]);
    const edges = writable<XYEdge[]>([]);

    $: if (pipeline) {
        updateGraph(pipeline);
    }

    const runUntilHere = (id: string) => {
        const target = $nodes.find((node) => node.id === id);
        if (!target) {
            return;
        }

        const findIncoming = (node: NodeCustom) => {
            return $edges.filter((edge) => edge.target === node.id);
        };

        const findPrev = (node: NodeCustom) => {
            const incoming = findIncoming(node);
            return $nodes.filter((e) => incoming.find((edge) => edge.source === e.id));
        };

        const getAllPreviousPlaceholders = (node: NodeCustom) => {
            const placeholderList = [];
            const queue = [node];
            const visited = new Set<string>();
            while (queue.length > 0) {
                const current = queue.shift();
                if (!current || visited.has(current.id)) {
                    continue;
                }
                visited.add(current.id);
                updateNodeData(current.id, {
                    status: 'waiting',
                });

                if (current.type === 'placeholder') {
                    placeholderList.push(current);
                }

                const prevNodes = findPrev(current);
                queue.push(...prevNodes);
            }
            return placeholderList;
        };

        const placeholderList = getAllPreviousPlaceholders(target);

        const getChunk = (placeholder: NodeCustom) => {
            const chunk: NodeCustom[] = [placeholder];
            const visited = new Set<string>();
            let i = 0;
            while (i < chunk.length) {
                const current = chunk[i];
                i++;
                if (visited.has(current.id)) {
                    continue;
                }
                visited.add(current.id);

                const prevNodes = findPrev(current).filter((node) => node.type !== 'placeholder');
                chunk.push(...prevNodes);
            }
            return chunk;
        };

        let totalWaitTime = 0;
        const executionQueue = placeholderList
            .reverse()
            .map((placeholder) => {
                const waitTime = Math.floor(Math.random() * 12 + 4) * 500;
                totalWaitTime = waitTime + totalWaitTime;
                return { chunk: getChunk(placeholder), waitTime: totalWaitTime };
            })
            .sort((a, b) => a.waitTime - b.waitTime);

        executionQueue.forEach((element, index) => {
            setTimeout(() => {
                element.chunk.forEach((node) => {
                    updateNodeData(node.id, { status: 'done' });
                });
                const nextChunk = executionQueue[index + 1];
                if (nextChunk)
                    nextChunk.chunk.forEach((node) => {
                        updateNodeData(node.id, {
                            status: 'processing',
                        });
                    });
            }, element.waitTime);
        });
        if (executionQueue[0]) {
            executionQueue[0].chunk.forEach((node) => {
                updateNodeData(node.id, { status: 'processing' });
            });
        }
    };

    let latestCall = 0;
    const updateGraph = async (graph: Graph | Segment) => {
        const currentCall = ++latestCall;
        const isSegment = graph.type === 'segment';
        const nodeList = ([] as NodeCustom[])
            .concat(
                graph.callList.map((call) =>
                    callToNode(call, isSegment, () => {
                        dispatch('editSegment', call.name);
                    }),
                ),
            )
            .concat(graph.placeholderList.map((placeholder) => placeholderToNode(placeholder, isSegment, runUntilHere)))
            .concat(
                graph.genericExpressionList.map((genericExpression) =>
                    genericExpressionToNode(genericExpression, isSegment),
                ),
            )
            .concat(isSegment ? [segmentToNode(graph as Segment)] : [])
            .sort((a, b) => a.id.localeCompare(b.id));

        const edgeList: XYEdge[] = graph.edgeList.map(edgeToEdge);

        const nodeListLayouted = await calculateLayout(
            nodeList,
            edgeList.filter(
                (edge) => !(edge.source === SegmentGroupId.toString()) && !(edge.target === SegmentGroupId.toString()),
            ),
            isSegment,
        );
        if (currentCall !== latestCall) return;

        if (!nodeListLayouted) {
            handleError({
                action: 'block',
                message: 'Unable to calculate Layout for graph',
            });
            return;
        }

        nodes.set(nodeListLayouted);
        edges.set(edgeList);
        setTimeout(() => fitView(), 0);
    };

    const triggerSelection = (event: CustomEvent) => {
        const selectedNodeList = event.type === 'paneclick' ? [] : $nodes.filter((node) => node.selected);
        dispatch('selectionChange', selectedNodeList);
    };
</script>

<div class=" relative h-full">
    <div class=" absolute left-2 top-2 z-10 flex flex-row justify-center gap-2">
        <button
            title="Relayout"
            class="bg-menu-400 hover:bg-menu-300 rounded p-1"
            on:click={async () => {
                const nodeListLayouted = await calculateLayout(
                    $nodes,
                    $edges.filter(
                        (edge) =>
                            !(edge.source === SegmentGroupId.toString()) &&
                            !(edge.target === SegmentGroupId.toString()),
                    ),
                    pipeline.type === 'segment',
                );
                if (!nodeListLayouted) {
                    handleError({
                        action: 'block',
                        message: 'Unable to calculate Layout for graph',
                    });
                    return;
                }
                nodes.set(nodeListLayouted);
            }}
        >
            <MenuIcon name={'layout'} className="w-7 h-7 p-1 stroke-text-normal" />
        </button>
        {#if pipeline.type === 'segment'}
            <button
                class=" bg-menu-400 hover:bg-menu-300 rounded p-1"
                title="Back"
                on:mousedown={() => dispatch('editPipeline')}
            >
                <MenuIcon name={'back'} className="w-7 h-7 p-2 stroke-text-normal" />
            </button>
        {/if}
        <div class="flex flex-row items-center gap-1 whitespace-pre">
            <span class=" text-text-muted">
                {pipeline.type === 'segment' ? 'Segment:' : 'Pipeline:'}
            </span>
            {pipeline.name}
        </div>
    </div>

    <SvelteFlow
        {edges}
        {nodes}
        {nodeTypes}
        fitView
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        selectionOnDrag={false}
        on:nodeclick={triggerSelection}
        on:paneclick={triggerSelection}
    >
        <Controls position="bottom-right" />
        <Background
            class=" bg-menu-700"
            patternColor={colorPallet.grid.patternColor}
            variant={BackgroundVariant.Cross}
        />
        <MiniMap
            bgColor={colorPallet.grid.background}
            maskColor={colorPallet.grid.minimapMask}
            nodeColor={(node) => (node.type !== 'segment' ? '#e2e2e2' : 'none')}
            position="top-right"
        />
    </SvelteFlow>
</div>
