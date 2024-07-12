<script lang="ts">
    import Lambda from './lambda.svelte';
    import Number from './number.svelte';
    import String from './string.svelte';
    import Table from './table.svelte';

    const svgMap: { [key: string]: typeof Lambda } = {
        lambda: Lambda,
        number: Number,
        string: String,
        table: Table,
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
