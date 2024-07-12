<script lang="ts">
    import Delete from './delete.svelte';
    import Edit from './edit.svelte';
    import Expand from './expand.svelte';
    import Open from './open.svelte';
    import TooltipArrow from './tooltipArrow.svelte';

    const svgMap: { [key: string]: typeof Delete } = {
        delete: Delete,
        edit: Edit,
        expand: Expand,
        open: Open,
        tooltipArrow: TooltipArrow,
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
