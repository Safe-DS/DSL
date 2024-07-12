<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        MiniMap,
        Background,
        BackgroundVariant,
        type Edge as XYEdge,
    } from '@xyflow/svelte';
    import { customColors as colors } from '$/tailwind.config';
    import NodePlaceholder from '$src/components/nodes/node-placeholder.svelte';
    import NodeCall from '$src/components/nodes/node-call.svelte';
    import NodeGenericExpression from '$src/components/nodes/node-generic-expression.svelte';
    import type { Ast } from '$global';
    import type { NodeCustom } from '$/src/components/main/customNodeType';

    export let ast: Writable<Ast>;

    const nodeTypes = {
        call: NodeCall,
        placeholder: NodePlaceholder,
        genericExpression: NodeGenericExpression,
    };

    const nodes = writable<NodeCustom[]>([]);
    ast.subscribe((ast) => {
        const nodeList: NodeCustom[] = $ast.callList.map((call) => {
            return {
                id: call.id.toString(),
                type: 'call',
                data: { call: call },
                position: { x: 0, y: 0 },
            };
        });
        nodes.set(nodeList);
    });

    console.log($ast.callList.length);

    const edges = writable<XYEdge[]>([]);

    const snapGrid: [number, number] = [20, 20];
</script>

<div class=" h-full">
    <button
        class="pl-52"
        on:mousedown={(event) => {
            console.log($ast.callList.length);
        }}>CLICK ME</button
    >
    <SvelteFlow
        {nodes}
        {edges}
        {nodeTypes}
        {snapGrid}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        on:nodeclick={(event) =>
            console.log('on node click', event.detail.node)}
        on:edgeclick={(event) =>
            console.log('on edge click', event.detail.edge)}
    >
        <Controls position="bottom-right" />
        <Background
            class="bg-background_dark"
            patternColor="rgba(255, 255, 255, 0)"
            variant={BackgroundVariant.Cross}
        />
        <MiniMap
            bgColor={colors.grid_background}
            maskColor={colors.grid_minimap_mask}
            position="top-right"
        />
    </SvelteFlow>
</div>
