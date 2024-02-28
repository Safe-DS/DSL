import type { SvgComponent } from 'types/assets';
import ExpressionLight from './lightmode/expression-light.svelte';
import ExtensionLight from './lightmode/extension-light.svelte';
import WarningLight from './lightmode/warning-light.svelte';
import ExpressionDark from './darkmode/expression-dark.svelte';
import ExtensionDark from './darkmode/extension-dark.svelte';
import WarningDark from './darkmode/warning-dark.svelte';

type Node = {
    expression: SvgComponent;
    extension: SvgComponent;
    warning: SvgComponent;
};

export const nodeLight: Node = {
    expression: ExpressionLight,
    extension: ExtensionLight,
    warning: WarningLight,
};

export const nodeDark: Node = {
    expression: ExpressionDark,
    extension: ExtensionDark,
    warning: WarningDark,
};
