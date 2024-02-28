import type { SvgComponent } from 'types/assets';
import EvaluationDark from './darkmode/evaluation-dark.svelte';
import ExportDark from './darkmode/export-dark.svelte';
import ImportDark from './darkmode/import-dark.svelte';
import ModelingDark from './darkmode/modeling-dark.svelte';
import Preparation1Dark from './darkmode/preparation1-dark.svelte';
import Preparation2Dark from './darkmode/preparation2-dark.svelte';
import EvaluationLight from './lightmode/evaluation-light.svelte';
import ExportLight from './lightmode/export-light.svelte';
import ImportLight from './lightmode/import-light.svelte';
import ModelingLight from './lightmode/modeling-light.svelte';
import Preparation1Light from './lightmode/preparation1-light.svelte';
import Preparation2Light from './lightmode/preparation2-light.svelte';

type Categories = {
    evaluation: SvgComponent;
    export: SvgComponent;
    import: SvgComponent;
    modeling: SvgComponent;
    preparation1: SvgComponent;
    preparation2: SvgComponent;
};

export const categorysLight: Categories = {
    evaluation: EvaluationLight,
    export: ExportLight,
    import: ImportLight,
    modeling: ModelingLight,
    preparation1: Preparation1Light,
    preparation2: Preparation2Light,
};
export const categorysDark: Categories = {
    evaluation: EvaluationDark,
    export: ExportDark,
    import: ImportDark,
    modeling: ModelingDark,
    preparation1: Preparation1Dark,
    preparation2: Preparation2Dark,
};
