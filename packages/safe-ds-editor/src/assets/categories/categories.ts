import type { SvgComponent } from '$types/assets';
import Evaluation from './assets/evaluation.svelte';
import Export from './assets/export.svelte';
import Import from './assets/import.svelte';
import Modeling from './assets/modeling.svelte';
import Preparation1 from './assets/preparation1.svelte';
import Preparation2 from './assets/preparation2.svelte';

type Categories = {
    evaluation: SvgComponent;
    export: SvgComponent;
    import: SvgComponent;
    modeling: SvgComponent;
    preparation1: SvgComponent;
    preparation2: SvgComponent;
};

export const categorys: Categories = {
    evaluation: Evaluation,
    export: Export,
    import: Import,
    modeling: Modeling,
    preparation1: Preparation1,
    preparation2: Preparation2,
};
