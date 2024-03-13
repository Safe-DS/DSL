declare type DataType = {
    type: 'string' | 'number' | 'lambda' | 'table' | 'undefined';
    icon: SvgComponent;
};

// Helper type to map DataType to TypeScript types
declare type DataTypeValue<T extends DataType> = T.type extends 'string'
    ? string
    : T.type extends 'number'
    ? number
    : T.type extends 'lambda'
    ? string
    : T.type extends 'table'
    ? string
    : T.type extends 'undefined'
    ? undefined
    : never;

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

declare type Statement = {
    name: string;
    category: Category;
    parameters: Parameter[];
    status: NodeStatus;
};

declare type Placeholder = {
    name: string;
    type: DataType;
    status: NodeStatus;
};

declare type Expression = {
    status: NodeStatus;
};
