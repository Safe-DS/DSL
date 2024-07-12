<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        MiniMap,
        Background,
        BackgroundVariant,
    } from '@xyflow/svelte';
    import { customColors as colors } from '../../../../tailwind.config';
    import NodePlaceholder from '../nodes/node-placeholder.svelte';
    import NodeCall from '../nodes/node-call.svelte';
    import NodeGenericExpression from '../nodes/node-generic-expression.svelte';
    import { NodeCustom } from './customNodeType';

    const nodes: Writable<NodeCustom[]> = writable([]);

    const edges = writable([]);

    const nodeTypes = {
        call: NodeCall,
        placeholder: NodePlaceholder,
        genericExpression: NodeGenericExpression,
    };

    const snapGrid: [number, number] = [20, 20];
</script>

<div class=" h-full">
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
