declare type DataType = 'string' | 'number' | 'lambda' | 'table' | 'undefined';

// Helper type to map DataType to TypeScript types
declare type DataTypeValue<T extends DataType> = T extends 'string'
    ? string
    : T extends 'number'
    ? number
    : T extends 'lambda'
    ? string
    : T extends 'table'
    ? string
    : T extends 'undefined'
    ? undefined
    : never;

declare type Statement = {
    name: string;
    category: Category;
    parameters: Parameter[];
    status: NodeStatus;
};

declare type Parameter<T extends Datetype> = {
    name: string;
    type: DataType;
    value: DataTypeValue<T>;
    optional: boolean;
};

declare type Category = {
    name: string;
    icon: SvgComponent;
};

declare type NodeStatus = 'ready' | 'queued' | 'done' | 'error';
