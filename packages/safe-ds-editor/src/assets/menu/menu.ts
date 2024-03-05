import type { SvgComponent } from 'types/assets';
import ExpandDark from './darkmode/expand-dark.svelte';
import ExpandLight from './lightmode/expand-light.svelte';
import TooltipArrowLight from './lightmode/tooltip-arrow-light.svelte';
import TooltipArrowDark from './darkmode/tooltip-arrow-dark.svelte';

type Menu = {
    expand: SvgComponent;
    tooltipArrow: SvgComponent;
};

export const menuLight: Menu = {
    expand: ExpandLight,
    tooltipArrow: TooltipArrowLight,
};

export const menuDark: Menu = {
    expand: ExpandDark,
    tooltipArrow: TooltipArrowDark,
};
