<script lang="ts">
    // https://danmarshall.github.io/google-font-to-svg-path/
    import { cn } from '$/src/pages/utils';
    import Lambda from './lambda.svelte';
    import Float from './float.svelte';
    import String from './string.svelte';
    import Table from './table.svelte';

    const svgMap: { [key: string]: typeof Lambda } = {
        lambda: Lambda,
        float: Float,
        string: String,
        table: Table,
    };

    export let name: string;
    export let className = '';
    if (name.toLowerCase().includes('literal<')) name = 'Literal<···>';

    const SvgComponent = svgMap[name.toLowerCase()];
</script>

{#if SvgComponent}
    <SvgComponent {className} />
{:else}
    <div class={cn(' flex h-full w-full items-center justify-center text-center', className)}>
        {name}
    </div>
{/if}
