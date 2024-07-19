<script lang="ts">
    import Evaluation from './evaluation.svelte';
    import Export from './export.svelte';
    import Import from './import.svelte';
    import Modelling from './modelling.svelte';
    import Preparation1 from './preparation1.svelte';
    import Preparation2 from './preparation2.svelte';

    const svgMap: { [key: string]: typeof Evaluation } = {
        evaluation: Evaluation,
        export: Export,
        import: Import,
        modelling: Modelling,
        preparation1: Preparation1,
        preparation2: Preparation2,
    };

    export let name: string;
    export let className = '';

    const SvgComponent = svgMap[name.toLowerCase()];
</script>

{#if SvgComponent}
    <SvgComponent {className} />
{:else}
    <div>Category Undefined</div>
{/if}
