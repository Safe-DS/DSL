import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js';
import { Position, type Node as XYNode, type Edge as XYEdge } from '@xyflow/svelte';

import '@xyflow/svelte/dist/style.css';
import type { NodeCustom } from './utils.';

export const calculateLayout = async (
    nodeList: XYNode[],
    edgeList: XYEdge[],
    index: number,
): Promise<NodeCustom[] | undefined> => {
    if (nodeList.length === 0) return [];
    console.time(
        `calculateLayout - ${index} Call with ${nodeList.length} nodes and ${edgeList.length} edges`,
    );

    const elk = new ELK();
    const options = {
        'elk.algorithm': 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': '200',
        'elk.spacing.nodeNode': '50',
        'elk.portConstraints': 'FIXED_ORDER',
    };

    const graph: ElkNode = {
        id: 'root',
        layoutOptions: options,
        children: nodeList.map((node) => ({
            ...node,
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
            // targetPosition: node.data instanceof Call ? undefined : Position.Left,
            // sourcePosition: node.data instanceof Call ? undefined : Position.Right,
            // // ports: !(node.data instanceof Call)
            //     ? undefined
            //     : [
            //           ...node.data.resultList.map((result) => {
            //               return {
            //                   id: result.name,
            //                   layoutOptions: { 'elk.core.options.PortSide': 'EAST' },
            //               };
            //           }),
            //           ...node.data.parameterList.reverse().map((parameter) => {
            //               return {
            //                   id: parameter.name,
            //                   layoutOptions: { 'elk.core.options.PortSide': 'WEST' },
            //               };
            //           }),
            //       ],
        })),
        edges: edgeList.map((edge) => {
            return {
                ...edge,
                sources: [edge.source],
                targets: [edge.target],
            };
        }),
    };

    const layout = await elk.layout(graph);

    // nodeList.forEach((child) => {
    //     console.log('NODE: ' + JSON.stringify(child) + '\n');
    // });
    // layout.children?.forEach((child) => {
    //     console.log('LAYOUT: ' + JSON.stringify(child) + '\n');
    // });

    const positionList = layout.children?.map((node) => {
        return { id: node.id, x: node.x, y: node.y };
    });

    if (
        !positionList ||
        positionList?.some((node) => node.x === undefined || node.y === undefined)
    ) {
        return undefined;
    }

    const nodeListLayouted = nodeList.map((node, i) => {
        const nodePosition = positionList[i];
        node.position.x = nodePosition.x as number;
        node.position.y = nodePosition.y as number;
        return node;
    });

    console.timeEnd(
        `calculateLayout - ${index} Call with ${nodeList.length} nodes and ${edgeList.length} edges`,
    );
    return nodeListLayouted as NodeCustom[];
};
