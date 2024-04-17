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
    import type { NodeCustom } from './node-types';
    import NodePlaceholder from '../nodes/node-placeholder.svelte';
    import NodeStatement from '../nodes/node-statement.svelte';
    import NodeExpression from '../nodes/node-expression.svelte';
    import NodeExtension from '../nodes/node-extension.svelte';
    import { getIconFromDatatype } from 'src/assets/dataTypes/dataTypes';
    import { categorys } from 'src/assets/categories/categories';

    const parameters: Parameter<DataType>[] = [
        {
            name: 'Text Parameter',
            type: { type: 'string', icon: getIconFromDatatype('string') },
            value: 'Das hier ist ein String!',
            optional: false,
        },
        {
            name: 'Zahlen Parameter',
            type: { type: 'number', icon: getIconFromDatatype('number') },
            value: '420',
            optional: false,
        },
        {
            name: 'Lambda Parameter',
            type: { type: 'lambda', icon: getIconFromDatatype('lambda') },
            value: '',
            optional: false,
        },
        {
            name: 'Tabelle Parameter',
            type: { type: 'table', icon: getIconFromDatatype('table') },
            value: 'Eingangsfunktion.VariablenName',
            optional: false,
        },
    ];

    const testStatement: Statement = {
        name: 'getReferenceByNameOrDate',
        category: { name: 'Modeling', icon: categorys.modeling },
        parameters: parameters,
        status: 'done',
    };

    const testPlaceholder: Placeholder = {
        name: 'Test',
        type: { type: 'table', icon: getIconFromDatatype('table') },
        status: 'done',
    };

    const testPlaceholder2: Placeholder = {
        name: 'LongNameThatGetsCutOff',
        type: { type: 'table', icon: getIconFromDatatype('table') },
        status: 'done',
    };

    const testExpression: Expression = {
        status: 'done',
        text: 'TestvariablenName\n*\n(\n    1\n    +\n    3\n)',
    };

    const testExtension: Extension = {
        name: 'testExtension',
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
        {
            id: '1',
            type: 'placeholder',
            data: { placeholder: testPlaceholder },
            position: { x: 0, y: 150 },
        },
        {
            id: '3',
            type: 'placeholder',
            data: { placeholder: testPlaceholder2 },
            position: { x: 0, y: 250 },
        },
        {
            id: '4',
            type: 'expression',
            data: { expression: testExpression },
            position: { x: 300, y: 0 },
        },
        {
            id: '5',
            type: 'extension',
            data: { extension: testExtension },
            position: { x: 300, y: 250 },
        },
    ]);

    const edges = writable([]);

    const nodeTypes = {
        statement: NodeStatement,
        placeholder: NodePlaceholder,
        expression: NodeExpression,
        extension: NodeExtension,
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
        nodesDraggable={false}
        on:nodeclick={(event) =>
            console.log('on node click', event.detail.node)}
        on:edgeclick={(event) =>
            console.log('on edge click', event.detail.edge)}
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
