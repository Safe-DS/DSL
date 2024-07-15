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
    import { colorPallet as colors } from '$/tailwind.config';
    import NodePlaceholder from '$src/components/nodes/node-placeholder.svelte';
    import NodeCall from '$src/components/nodes/node-call.svelte';
    import NodeGenericExpression from '$src/components/nodes/node-generic-expression.svelte';
    import type { Ast } from '$global';
    import type { NodeCustom } from '$/src/components/main/customNodeType';

    export let astWritable: Writable<Ast>;

    const nodeTypes = {
        call: NodeCall,
        genericExpression: NodeGenericExpression,
        placeholder: NodePlaceholder,
    };

    const nodes = writable<NodeCustom[]>([]);
    astWritable.subscribe((ast) => {
        const callList: NodeCustom[] = ast.callList.map((call) => {
            return {
                id: call.id.toString(),
                type: 'call',
                data: { call: call },
                position: { x: 0, y: 0 },
            };
        });
        const placeholderList: NodeCustom[] = ast.placeholderList.map((placeholder) => {
            return {
                id: placeholder.name,
                type: 'placeholder',
                data: { placeholder: placeholder },
                position: { x: 0, y: 600 },
            };
        });
        const genericExpressionList: NodeCustom[] = ast.genericExpressionList.map(
            (genericExpression) => {
                return {
                    id: genericExpression.id.toString(),
                    type: 'genericExpression',
                    data: { genericExpression: genericExpression },
                    position: { x: 0, y: 300 },
                };
            },
        );
        nodes.set(
            ([] as NodeCustom[])
                .concat(callList.slice(0, 1))
                .concat(placeholderList.slice(0, 1))
                .concat(genericExpressionList.slice(0, 1)),
        );
    });

    const edges = writable<XYEdge[]>([]);

    const snapGrid: [number, number] = [20, 20];
</script>

<div class=" h-full">
    <div class=" text-xl">{$nodes.length}</div>
    <SvelteFlow
        {nodes}
        {edges}
        {nodeTypes}
        {snapGrid}
        fitView
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
