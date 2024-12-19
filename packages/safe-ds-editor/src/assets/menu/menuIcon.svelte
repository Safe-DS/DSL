<script lang="ts">
    import Back from './back.svelte';
    import Delete from './delete.svelte';
    import Edit from './edit.svelte';
    import Expand from './expand.svelte';
    import Layout from './layout.svelte';
    import Open from './open.svelte';
    import TooltipArrow from './tooltipArrow.svelte';

    const svgMap: { [key: string]: typeof Delete } = {
        delete: Delete,
        edit: Edit,
        expand: Expand,
        open: Open,
        tooltipArrow: TooltipArrow,
        layout: Layout,
        back: Back,
    };

    export let name: string;
    export let className = '';

    const SvgComponent = svgMap[name.toLowerCase()];
</script>

{#if SvgComponent}
    <SvgComponent {className} />
{:else}
    <div></div>
{/if}
