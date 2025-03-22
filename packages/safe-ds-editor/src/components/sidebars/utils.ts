import type { Node as XYNode } from '@xyflow/svelte';
import type { CallProps } from '../nodes/node-call.svelte';
import type { PlaceholderProps } from '../nodes/node-placeholder.svelte';
import type { GenericExpressionProps } from '../nodes/node-generic-expression.svelte';
import type { CustomError } from '$global';
import { MessageHandler } from '$src/messageHandler';
import { getContext } from 'svelte';
import type { Parameter } from './section-parameter.svelte';
import { collapseExpression } from '$/src/components/nodes/utils';

export const getDescription = async (xyNodeList: XYNode[]): Promise<string> => {
    if (xyNodeList.length !== 1) return '';
    const xyNode = xyNodeList[0];

    if (Object.keys(xyNode.data).includes('placeholder')) return 'No Documentation available for Placeholders';

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

    const response = await MessageHandler.getDocumentation(uniquePath);
    return response ?? '';
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
                isConstant: parameter.isConstant,
            };
        });

        return result;
    }
    if (Object.keys(xyNode.data).includes('genericExpression')) {
        const { genericExpression } = xyNode.data as GenericExpressionProps;
        const parameter: Parameter = {
            name: 'text',
            argumentText: collapseExpression(genericExpression.text),
            defaultValue: '',
            type: genericExpression.type,
            isConstant: false,
        };
        return [parameter];
    }
    if (Object.keys(xyNode.data).includes('placeholder')) {
        const { placeholder } = xyNode.data as PlaceholderProps;
        const parameter: Parameter = {
            name: 'name',
            argumentText: placeholder.name,
            defaultValue: '',
            type: 'string',
            isConstant: false,
        };
        return [parameter];
    }
    return [];
};

export const intersect = (list: Parameter[][]) => {
    if (list.length === 0) return [] as Parameter[];
    if (list.length === 1) return list[0];

    const compareParameter = (a: Parameter, b: Parameter) => a.name === b.name;

    const intersection = list[0]
        .filter((parameter) =>
            list.every((parameterList) =>
                parameterList.some((otherParameter) => compareParameter(parameter, otherParameter)),
            ),
        )
        .map((parameter) => {
            const match = list.some((parameterList) =>
                parameterList.some((otherParameter) => otherParameter.argumentText !== parameter.argumentText),
            );
            if (match) return { ...parameter, argumentText: '...' };
            return parameter;
        });

    return intersection;
};

export const getTypeName = (xyNodeList: XYNode[]) => {
    if (xyNodeList.length !== 1) return undefined;
    const node = xyNodeList[0];

    if (Object.keys(node.data).includes('call')) {
        const { call } = node.data as CallProps;
        if (call.resultList.length !== 1) return;
        const result = call.resultList[0];
        return result.type;
    }
    if (Object.keys(node.data).includes('placeholder')) {
        const { placeholder } = node.data as PlaceholderProps;
        return placeholder.type;
    }
    if (Object.keys(node.data).includes('genericExpression')) {
        const { genericExpression } = node.data as GenericExpressionProps;
        return genericExpression.type;
    }
    return;
};
