type DataType = 'string' | 'number' | 'lambda' | 'table' | 'undefined';

// Helper type to map DataType to TypeScript types
type DataTypeValue<T extends DataType> = T extends 'string'
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

type Parameter<T extends Datetype> = {
    name: string;
    type: DataType;
    value: DataTypeValue<T>;
    optional: boolean;
};
