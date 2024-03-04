<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        MiniMap,
        Background,
        Panel,
        BackgroundVariant,
    } from '@xyflow/svelte';
    import { customColors as colors } from '../../../../tailwind.config';
    import NodeStatement from '../nodes/node-statement.svelte';
    import type { NodeCustom } from './node-types';
    import { categorysDark } from 'src/assets/categories/categories';

    const parameters: Parameter<DataType>[] = [
        {
            name: 'Text Parameter',
            type: 'string',
            value: 'Das hier ist ein String!',
            optional: false,
        },
        {
            name: 'Zahlen Parameter',
            type: 'number',
            value: '420',
            optional: false,
        },
        {
            name: 'Lambda Parameter',
            type: 'lambda',
            value: '',
            optional: false,
        },
        {
            name: 'Tabelle Parameter',
            type: 'table',
            value: 'Eingangsfunktion.VariablenName',
            optional: false,
        },
    ];

    const testStatement: Statement = {
        name: 'getReferenceByNameorDate',
        category: { name: 'Modeling', icon: categorysDark.modeling },
        parameters: parameters,
        status: 'done',
    };

    const nodes: Writable<NodeCustom[]> = writable([
        {
            id: '0',
            type: 'statement',
            data: { statement: testStatement },
            position: { x: 0, y: 0 },
        },
    ]);

    const edges = writable([]);

    const nodeTypes = {
        statement: NodeStatement,
    };

    const snapGrid: [number, number] = [25, 25];
</script>

<div class=" h-full">
    <SvelteFlow
        {nodes}
        {edges}
        {nodeTypes}
        {snapGrid}
        fitView
        proOptions={{ hideAttribution: true }}
        on:nodeclick={(event) =>
            console.log('on node click', event.detail.node)}
    >
        <Controls position="bottom-right" />
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
