import type { SvgComponent } from 'types/assets';
import Table from './assets/table.svelte';
import Lambda from './assets/lambda.svelte';
import Number from './assets/number.svelte';
import String from './assets/string.svelte';

type DataTypes = {
    lambda: SvgComponent;
    number: SvgComponent;
    string: SvgComponent;
    table: SvgComponent;
};

export const dataTypes: DataTypes = {
    lambda: Lambda,
    number: Number,
    string: String,
    table: Table,
};

export const getIconFromDatatype = (
    type: 'string' | 'number' | 'lambda' | 'table' | 'undefined',
): SvgComponent => {
    switch (type) {
        case 'string':
            return String;
        case 'number':
            return Number;
        case 'lambda':
            return Lambda;
        case 'table':
            return Table;
        case 'undefined':
            return undefined;
    }
};
