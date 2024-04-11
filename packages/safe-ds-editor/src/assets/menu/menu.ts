import type { SvgComponent } from 'types/assets';
import Expand from './assets/expand.svelte';
import TooltipArrow from './assets/tooltip-arrow.svelte';
import Edit from './assets/edit.svelte';
import Open from './assets/open.svelte';

type Menu = {
    expand: SvgComponent;
    tooltipArrow: SvgComponent;
    edit: SvgComponent;
    open: SvgComponent;
};

export const menu: Menu = {
    expand: Expand,
    tooltipArrow: TooltipArrow,
    edit: Edit,
    open: Open,
};
