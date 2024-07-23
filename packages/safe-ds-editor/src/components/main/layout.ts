import ELK, { type ElkNode, type ElkPort } from 'elkjs/lib/elk.bundled.js';
import { type Node as XYNode, type Edge as XYEdge } from '@xyflow/svelte';

import '@xyflow/svelte/dist/style.css';
import type { NodeCustom } from './utils.';
import { Call, GenericExpression, Placeholder } from '$global';

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
    };

    const graph: ElkNode = {
        id: 'root',
        layoutOptions: options,
        children: nodeList.map((node) => ({
            ...node,
            ports: getPorts(node),
            layoutOptions: {
                'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
            },
        })),
        edges: edgeList.map((edge) => {
            return {
                ...edge,
                sources: [`${edge.source}_${edge.sourceHandle}`],
                targets: [`${edge.target}_${edge.targetHandle}`],
            };
        }),
    };

    // nodeList.forEach((child) => {
    //     console.log('NODE: ' + JSON.stringify(child) + '\n');
    // });
    console.log(graph);
    const layout = await elk.layout(graph);

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

const getPorts = (node: XYNode): ElkPort[] => {
    const key = Object.keys(node.data).pop();

    if (key === 'call') {
        const data = node.data[key] as Call;
        const targetPorts = data.parameterList.map((parameter) => {
            return {
                id: `${data.id}_${parameter.name}`,
                layoutOptions: {
                    side: 'EAST',
                },
            };
        });
        const sourcePorts = data.resultList.map((result) => {
            return {
                id: `${data.id}_${result.name}`,
                layoutOptions: {
                    side: 'WEST',
                },
            };
        });
        const self = {
            id: `${data.id}_self`,
            layoutOptions: {
                side: 'WEST',
            },
        };

        return [self, ...targetPorts, ...sourcePorts];
    }
    if (key === 'placeholder') {
        const data = node.data[key] as Placeholder;
        return [
            {
                id: `${data.name}_source`,
                layoutOptions: {
                    side: 'EAST',
                },
            },
            {
                id: `${data.name}_target`,
                layoutOptions: {
                    side: 'WEST',
                },
            },
        ];
    }
    if (key === 'genericExpression') {
        const data = node.data[key] as GenericExpression;
        return [
            {
                id: `${data.id}_source`,
                layoutOptions: {
                    side: 'EAST',
                },
            },
            {
                id: `${data.id}_target`,
                layoutOptions: {
                    side: 'WEST',
                },
            },
        ];
    }

    return [];
};
