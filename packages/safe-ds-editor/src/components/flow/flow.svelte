<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        MiniMap,
        Background,
        BackgroundVariant,
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

    export let pipeline: Writable<Graph | Segment>;

    const dispatch = createEventDispatcher();
    const handleError = getContext('handleError') as (error: CustomError) => void;
    const { fitView } = useSvelteFlow();

    const nodes = writable<NodeCustom[]>([]);
    const edges = writable<XYEdge[]>([]);

    let latestCall = 0;
    pipeline.subscribe(async (graph) => {
        const isSegemnt = graph.type == 'segment';
        const nodeList = ([] as NodeCustom[])
            .concat(graph.ast.callList.map((call) => callToNode(call, isSegemnt)))
            .concat(
                graph.ast.placeholderList.map((placeholder) =>
                    placeholderToNode(placeholder, isSegemnt),
                ),
            )
            .concat(
                graph.ast.genericExpressionList.map((genericExpression) =>
                    genericExpressionToNode(genericExpression, isSegemnt),
                ),
            )
            .concat(isSegemnt ? [segmentToNode(graph as Segment)] : [])
            .sort((a, b) => a.id.localeCompare(b.id));
        console.log(nodeList);

        const edgeList: XYEdge[] = graph.ast.edgeList.map(edgeToEdge);
        edges.set(edgeList);

        const currentCall = ++latestCall;
        const nodeListLayouted = await calculateLayout(
            nodeList,
            edgeList.filter(
                (edge) =>
                    !(edge.source == SegmentGroupId.toString()) &&
                    !(edge.target == SegmentGroupId.toString()),
            ),
            isSegemnt,
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
        fitView();
        window.requestAnimationFrame(() => fitView());
        setTimeout(() => fitView(), 0);
    });

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
                    $pipeline.type === 'segment',
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
        {#if $pipeline.type == 'segment'}
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
                {$pipeline.type == 'segment' ? 'Segment:' : 'Pipeline:'}
            </span>
            {$pipeline.name}
        </div>
    </div>

    <SvelteFlow
        {nodes}
        {edges}
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
