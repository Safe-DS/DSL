<script lang="ts">
    import GenericExpression from './genericExpression.svelte';
    import GenericExpressionOld from './genericExpressionOld.svelte';
    import Segment from './segment.svelte';
    import Warning from './warning.svelte';

    const svgMap: { [key: string]: typeof Warning } = {
        expressionIcon: GenericExpression,
        expressionIconOld: GenericExpressionOld,
        warning: Warning,
        extension: Segment,
    };

    export let name;
    export let className = '';

    $: SvgComponent = svgMap[name];
</script>

{#if SvgComponent}
    <SvgComponent {className} />
{:else}
    <div></div>
{/if}
