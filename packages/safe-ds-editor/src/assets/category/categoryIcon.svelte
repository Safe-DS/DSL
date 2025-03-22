<script lang="ts">
    import Segment from './Segment.svelte';
    import ModelEvaluation from './ModelEvaluation.svelte';
    import DataExport from './DataExport.svelte';
    import DataImport from './DataImport.svelte';
    import Modeling from './Modeling.svelte';
    import DataProcessing from './DataProcessing.svelte';
    import DataExploration from './DataExploration.svelte';
    import Utilities from './Utilities.svelte';
    import { cn } from '$/src/pages/utils';

    const svgMap: { [key: string]: typeof ModelEvaluation } = {
        modelevaluation: ModelEvaluation,
        dataexport: DataExport,
        dataimport: DataImport,
        modeling: Modeling,
        dataprocessing: DataProcessing,
        dataexploration: DataExploration,
        segment: Segment,
        utilities: Utilities,
    };

    export let name: string;
    export let className = '';

    const SvgComponent = svgMap[name.toLowerCase()];
</script>

{#if SvgComponent}
    <SvgComponent {className} />
{:else}
    <div class={cn(`flex items-center justify-center`, className)}>
        <p>-</p>
    </div>
{/if}
