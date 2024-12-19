import ELK, { type ElkNode, type ElkPort } from 'elkjs/lib/elk.bundled.js';
import { type Node as XYNode, type Edge as XYEdge } from '@xyflow/svelte';

import '@xyflow/svelte/dist/style.css';
import type { NodeCustom } from './utils.';
import { Call, GenericExpression, Placeholder, SegmentGroupId } from '$global';

export const calculateLayout = async (
    nodeList: XYNode[],
    edgeList: XYEdge[],
    isSegemnt: boolean,
): Promise<NodeCustom[] | undefined> => {
    if (nodeList.length === 0) return [];
    console.time(`calculateLayout - With ${nodeList.length} nodes and ${edgeList.length} edges`);

    const elk = new ELK();
    const options = {
        'elk.algorithm': 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': '300',
        'elk.spacing.nodeNode': '80',
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

    let layout;
    try {
        layout = await elk.layout(graph);
    } catch (e) {
        console.log(e);
    } finally {
        if (!layout) return undefined;
        if (!layout.children) return undefined;
    }

    const positionList = layout.children
        .map((node) => {
            return { id: node.id, x: node.x, y: node.y };
        })
        .filter((node) => node.x !== undefined || node.y !== undefined);

    if (positionList.length < nodeList.length) return undefined;

    let nodeListLayouted = nodeList.map((node, index) => {
        const nodePosition = positionList[index];
        node.position.x = nodePosition.x as number;
        node.position.y = nodePosition.y as number;
        return node;
    });

    if (isSegemnt) {
        const segmentIndex = positionList.findIndex(
            (node) => node.id === SegmentGroupId.toString(),
        );
        if (segmentIndex < 0) return undefined;

        const boundingBox = nodeListLayouted
            .filter((_, index) => index !== segmentIndex)
            .reduce(
                (acc, node) => ({
                    minX: Math.min(acc.minX, node.position.x),
                    maxX: Math.max(acc.maxX, node.position.x + (node.width ?? 0)),
                    minY: Math.min(acc.minY, node.position.y),
                    maxY: Math.max(acc.maxY, node.position.y + (node.height ?? 0)),
                }),
                {
                    minX: Infinity,
                    maxX: -Infinity,
                    minY: Infinity,
                    maxY: -Infinity,
                },
            );

        const offset = 300;
        const dimensions = {
            x: boundingBox.minX - offset,
            y: boundingBox.minY - offset,
            width: boundingBox.maxX - boundingBox.minX + offset + offset,
            height: boundingBox.maxY - boundingBox.minY + offset + offset,
        };

        nodeListLayouted = nodeListLayouted.map((node, index) => {
            if (index === segmentIndex) {
                return {
                    ...nodeListLayouted[segmentIndex],
                    position: { x: dimensions.x, y: dimensions.y },
                    width: dimensions.width,
                    height: dimensions.height,
                };
            } else {
                return {
                    ...node,
                    position: {
                        x: node.position.x - boundingBox.minX + offset,
                        y: node.position.y - boundingBox.minY + offset,
                    },
                };
            }
        });
    }

    console.timeEnd(`calculateLayout - With ${nodeList.length} nodes and ${edgeList.length} edges`);
    return nodeListLayouted as NodeCustom[];
};

const getPorts = (node: XYNode): ElkPort[] => {
    const ignoreList = ['runUntilHere', 'isSegment', 'status', 'openSegmentEditor'];
    const key = Object.keys(node.data)
        .filter((k) => !ignoreList.includes(k))
        .pop();

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
    if (key === 'segment') {
        return [];
    }

    console.log(`Unknown key: ${key}`);
    console.log(
        'You probably forgot to add a new Node Data key to the ignore list for the layout node parsing in the getPorts() function.',
    );
    return [];
};
