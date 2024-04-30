import type { SvgComponent } from 'types/assets';
import Extension from './assets/extension.svelte';
import Warning from './assets/warning.svelte';
import ExpressionIcon from './assets/expression-icon-old.svelte';

type Node = {
    expressionIcon: SvgComponent;
    extension: SvgComponent;
    warning: SvgComponent;
};

export const node: Node = {
    expressionIcon: ExpressionIcon,
    extension: Extension,
    warning: Warning,
};
