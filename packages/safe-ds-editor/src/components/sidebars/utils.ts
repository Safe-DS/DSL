/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Node as XYNode } from '@xyflow/svelte';
import type { CallProps } from '../nodes/node-call.svelte';
import type { PlaceholderProps } from '../nodes/node-placeholder.svelte';
import type { Parameter } from './SecondarySidebar.svelte';
import type { GenericExpressionProps } from '../nodes/node-generic-expression.svelte';
import type { CustomError, Datatype } from '$global';
import MessageHandler from '$/src/messaging/messageHandler';
import { getContext } from 'svelte';

export const getName = (xyNodeList: XYNode[]) => {
    if (xyNodeList.length === 0) return '';

    const nameList: string[] = xyNodeList.map((node) => {
        if (Object.keys(node.data).includes('call')) {
            const { call } = node.data as CallProps;
            return call.name;
        }
        if (Object.keys(node.data).includes('placeholder')) {
            const { placeholder } = node.data as PlaceholderProps;
            return placeholder.name;
        }
        if (Object.keys(node.data).includes('genericExpression')) {
            const { genericExpression } = node.data as GenericExpressionProps;
            return 'Expression';
        }
        return '';
    });

    if (nameList.length === 1) return nameList[0];

    return `[${nameList.join(', ')}]`;
};

export const getDescription = async (xyNodeList: XYNode[]): Promise<string> => {
    if (xyNodeList.length !== 1) return '';
    const xyNode = xyNodeList[0];

    if (Object.keys(xyNode.data).includes('placeholder'))
        return 'No Documentation available for Placeholders';

    if (Object.keys(xyNode.data).includes('genericExpression'))
        return 'No Documentation available for General Expressions';

    let uniquePath;
    if (Object.keys(xyNode.data).includes('call')) {
        const { call } = xyNode.data as CallProps;
        uniquePath = call.uniquePath;
    }

    const handleError = getContext('handleError') as (error: CustomError) => void;
    if (!uniquePath) {
        handleError({
            action: 'notify',
            message: 'Unable to retrieve Documentation',
        });
        return '';
    }

    const response = await MessageHandler.getNodeDescription(uniquePath);
    console.log(response);
    return response.description;
};

export const getParameterList = (xyNode: XYNode) => {
    if (Object.keys(xyNode.data).includes('call')) {
        const { call } = xyNode.data as CallProps;
        const result: Parameter[] = call.parameterList.map((parameter) => {
            return {
                name: parameter.name,
                argumentText: parameter.argumentText,
                defaultValue: parameter.defaultValue,
                type: parameter.type,
            };
        });

        return result;
    }
    if (Object.keys(xyNode.data).includes('genericExpression')) {
        const { genericExpression } = xyNode.data as GenericExpressionProps;
        return [];
    }
    return [];
};

export const intersect = (list: Parameter[][]) => {
    if (list.length === 0) return [] as Parameter[];
    if (list.length === 1) return list[0];

    const compareParameter = (a: Parameter, b: Parameter) => a.name === b.name;

    const intersection = list[0].filter((parameter) =>
        list.every((parameterList) =>
            parameterList.some((otherParameter) => compareParameter(parameter, otherParameter)),
        ),
    );

    return intersection;
};
