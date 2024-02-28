import type { SvgComponent } from 'types/assets';
import ExpandDark from './darkmode/expand-dark.svelte';
import ExpandLight from './lightmode/expand-light.svelte';

type Menu = {
    expand: SvgComponent;
};

export const menuLight: Menu = {
    expand: ExpandLight,
};

export const menuDark: Menu = {
    expand: ExpandDark,
};
