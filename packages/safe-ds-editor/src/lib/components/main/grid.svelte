<script lang="ts">
    import { writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        MiniMap,
        Background,
        Panel,
        BackgroundVariant,
    } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/style.css';
    import { customColors as colors } from '../../../../tailwind.config';

    const nodes = writable([
        {
            id: '1',
            type: 'input',
            data: { label: 'Input Node' },
            position: { x: 0, y: 0 },
        },
        {
            id: '2',
            type: 'default',
            data: { label: 'Node' },
            position: { x: 0, y: 150 },
        },
    ]);

    const edges = writable([
        {
            id: '1-2',
            type: 'default',
            source: '1',
            target: '2',
            label: 'Edge Text',
        },
    ]);

    // proOptions={{ hideAttribution: true }}
    const snapGrid: [number, number] = [25, 25];
</script>

<div class=" h-full">
    <SvelteFlow
        {nodes}
        {edges}
        {snapGrid}
        fitView
        proOptions={{ hideAttribution: true }}
        on:nodeclick={(event) =>
            console.log('on node click', event.detail.node)}
    >
        <Controls />
        <Background
            class="bg-vscode_main_background"
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
