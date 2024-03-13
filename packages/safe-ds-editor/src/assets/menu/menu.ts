import type { SvgComponent } from 'types/assets';
import Expand from './assets/expand.svelte';
import TooltipArrow from './assets/tooltip-arrow.svelte';

type Menu = {
    expand: SvgComponent;
    tooltipArrow: SvgComponent;
};

export const menu: Menu = {
    expand: Expand,
    tooltipArrow: TooltipArrow,
};
