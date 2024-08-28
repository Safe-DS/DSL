<script lang="ts">
    import Segment from './segment.svelte';
    import Warning from './warning.svelte';

    const svgMap: { [key: string]: typeof Warning } = {
        warning: Warning,
        segment: Segment,
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
