export const getPlaceholderIconName = (type: string) => {
    const localType = type.toLowerCase();

    if (localType.startsWith('list<')) return 'List[ ]';
    if (localType.startsWith('map<')) return 'Map{ }';
    if (localType.startsWith('literal<')) {
        const literalType = localType.replace('literal<', '').replace('>', '');

        if (literalType === 'true') return 'Boolean';
        if (literalType === 'false') return 'Boolean';
        if (literalType.startsWith('"')) return 'String';

        if (literalType.includes('.')) return 'Float';

        return 'Int';
    }

    return type;
};

export const collapseExpression = (expression: string) => {
    return expression.replace(/\n/gu, ' ').replace(/\s+/gu, ' ').trim();
};
