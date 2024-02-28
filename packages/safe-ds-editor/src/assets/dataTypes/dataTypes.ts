import type { SvgComponent } from 'types/assets';
import TableDark from './darkmode/table-dark.svelte';
import LambdaLight from './lightmode/lambda-light.svelte';
import NumberLight from './lightmode/number-light.svelte';
import StringLight from './lightmode/string-light.svelte';
import TableLight from './lightmode/table-light.svelte';
import LambdaDark from './darkmode/lambda-dark.svelte';
import NumberDark from './darkmode/number-dark.svelte';
import StringDark from './darkmode/string-dark.svelte';

type DataTypes = {
    lambda: SvgComponent;
    number: SvgComponent;
    string: SvgComponent;
    table: SvgComponent;
};

export const dataTypesLight: DataTypes = {
    lambda: LambdaLight,
    number: NumberLight,
    string: StringLight,
    table: TableLight,
};

export const dataTypesDark: DataTypes = {
    lambda: LambdaDark,
    number: NumberDark,
    string: StringDark,
    table: TableDark,
};
