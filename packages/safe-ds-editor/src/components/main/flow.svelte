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
    import { colorPallet as colors } from '$/tailwind.config';
    import type { Ast, CustomError } from '$global';
    import {
        callToNode,
        edgeToEdge,
        genericExpressionToNode,
        nodeTypes,
        placeholderToNode,
        type NodeCustom,
    } from '$/src/components/main/utils.';
    import { getContext } from 'svelte';
    import { calculateLayout } from './layout';

    export let astWritable: Writable<Ast>;

    const handleError = getContext('handleError') as (error: CustomError) => void;
    const { fitView } = useSvelteFlow();

    const nodes = writable<NodeCustom[]>([]);
    const edges = writable<XYEdge[]>([]);

    let latestCall = 0;
    astWritable.subscribe(async (ast) => {
        const nodeList = ([] as NodeCustom[])
            .concat(ast.callList.map(callToNode))
            .concat(ast.placeholderList.map(placeholderToNode))
            .concat(ast.genericExpressionList.map(genericExpressionToNode));

        const edgeList: XYEdge[] = ast.edgeList.map(edgeToEdge);
        edges.set(edgeList);

        const currentCall = ++latestCall;
        const nodeListLayouted = await calculateLayout(nodeList, edgeList, currentCall);
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
    });
</script>

<div class=" h-full">
    <div class=" text-xl">{$nodes.length}</div>
    <button
        on:click={async () => {
            const nodeListLayouted = await calculateLayout($nodes, $edges, 0);
            if (!nodeListLayouted) {
                handleError({
                    action: 'block',
                    message: 'Unable to calculate Layout for graph',
                });
                return;
            }
            nodes.set(nodeListLayouted);
        }}>Relayout</button
    >
    <SvelteFlow
        {nodes}
        {edges}
        {nodeTypes}
        fitView
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        on:nodeclick={(event) => console.log('on node click', event.detail.node)}
        on:edgeclick={(event) => console.log('on edge click', event.detail.edge)}
    >
        <Controls position="bottom-right" />
        <Background
            class=" bg-menu-700"
            patternColor={colors.grid.patternColor}
            variant={BackgroundVariant.Cross}
        />
        <MiniMap
            bgColor={colors.grid.background}
            maskColor={colors.grid.minimapMask}
            position="top-right"
        />
    </SvelteFlow>
</div>
