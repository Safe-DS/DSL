<script lang="ts">
    import { writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        MiniMap,
        Background,
        BackgroundVariant,
        type Node as XYNode,
        type Edge as XYEdge,
        useSvelteFlow,
    } from '@xyflow/svelte';
    import { Edge, Segment, SegmentGroupId, type CustomError, type Graph } from '$global';
    import {
        callToNode,
        edgeToEdge,
        genericExpressionToNode,
        nodeTypes,
        placeholderToNode,
        segmentToNode,
        type NodeCustom,
    } from '$/src/components/flow/utils.';
    import { createEventDispatcher, getContext } from 'svelte';
    import { calculateLayout } from './layout';
    import MenuIcon from '$/src/assets/menu/menuIcon.svelte';
    import { colorPallet } from '$/tailwind.config';

    export let pipeline: Graph | Segment;

    const dispatch = createEventDispatcher();
    const handleError = getContext('handleError') as (error: CustomError) => void;
    const { fitView, updateNodeData, updateNode } = useSvelteFlow();

    const nodes = writable<NodeCustom[]>([]);
    const edges = writable<XYEdge[]>([]);

    let pipelineVersion = 0;
    $: if (pipeline) {
        pipelineVersion += 1;
        updateGraph(pipeline);
    }

    const runUntilHere = (id: string) => {
        const target = $nodes.find((node) => node.id === id);
        if (!target) {
            console.log(`Unknown node: ${id}`);
            return;
        }

        const findIncoming = (node: XYNode) => {
            return $edges.filter((edge) => edge.target === node.id);
        };

        const findPrev = (node: XYNode) => {
            const incoming = findIncoming(node);
            return $nodes.filter((node) => incoming.find((edge) => edge.source === node.id));
        };

        const placeholderList = [];
        const queue = [target];
        const visited = new Set<string>();
        while (queue.length > 0) {
            const current = queue.shift();
            if (!current || visited.has(current.id)) {
                continue;
            }
            visited.add(current.id);

            if (current.type === 'placeholder') {
                placeholderList.push(current);
            }

            const prevNodes = findPrev(current);
            queue.push(...prevNodes);
        }

        let totalWaitTime = 0;
        placeholderList.reverse().forEach((placeholder) => {
            const waitTime = Math.floor(Math.random() * 4 + 1) * 500;
            totalWaitTime = waitTime + totalWaitTime;
            setTimeout(() => {
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

                    const prevNodes = findPrev(current).filter(
                        (node) => node.type !== 'placeholder',
                    );
                    chunk.push(...prevNodes);
                }
                nodes.update((nodeList) => {
                    const tmp: NodeCustom[] = nodeList.map((node) => {
                        if (chunk.find((n) => n.id === node.id)) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    status: 'done',
                                },
                            };
                        }
                        return node;
                    });
                    return tmp;
                });
                chunk.forEach((node) => {
                    console.log('Node done: ' + node.id);
                    updateNodeData(node.id, {
                        status: 'done',
                    });
                });
            }, totalWaitTime);
        });
    };

    let latestCall = 0;
    async function updateGraph(pipeline: Graph | Segment) {
        const currentCall = ++latestCall;
        const isSegment = pipeline.type == 'segment';
        const nodeList = ([] as NodeCustom[])
            .concat(pipeline.ast.callList.map((call) => callToNode(call, isSegment)))
            .concat(
                pipeline.ast.placeholderList.map((placeholder) =>
                    placeholderToNode(placeholder, isSegment, runUntilHere),
                ),
            )
            .concat(
                pipeline.ast.genericExpressionList.map((genericExpression) =>
                    genericExpressionToNode(genericExpression, isSegment),
                ),
            )
            .concat(isSegment ? [segmentToNode(pipeline as Segment)] : [])
            .sort((a, b) => a.id.localeCompare(b.id));

        const edgeList: XYEdge[] = pipeline.ast.edgeList.map(edgeToEdge);

        const nodeListLayouted = await calculateLayout(
            nodeList,
            edgeList.filter(
                (edge) =>
                    !(edge.source == SegmentGroupId.toString()) &&
                    !(edge.target == SegmentGroupId.toString()),
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

        console.log(nodeListLayouted);
        console.log(edgeList);

        nodes.set(nodeListLayouted);
        edges.set(edgeList);
        fitView();
        window.requestAnimationFrame(() => fitView());
        setTimeout(() => fitView(), 0);
    }

    const triggerSelection = (event: CustomEvent) => {
        const selectedNodeList =
            event.type === 'paneclick' ? [] : $nodes.filter((node) => node.selected);
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
                            !(edge.source == SegmentGroupId.toString()) &&
                            !(edge.target == SegmentGroupId.toString()),
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
        {#if pipeline.type == 'segment'}
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
                {pipeline.type == 'segment' ? 'Segment:' : 'Pipeline:'}
            </span>
            {pipeline.name}
        </div>
    </div>
    {#key pipelineVersion}
        <SvelteFlow
            {edges}
            {nodes}
            {nodeTypes}
            fitView
            minZoom={0.1}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={true}
            selectionOnDrag={false}
            on:nodecontextmenu={({ detail: { event, node } }) => {
                // if (node.type) {
                //     event.preventDefault();
                // }
            }}
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
    {/key}
</div>
