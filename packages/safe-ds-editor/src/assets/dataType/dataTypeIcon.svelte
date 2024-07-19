<script lang="ts">
    import { cn } from '$/src/pages/utils';
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

    export let name: string;
    export let className = '';

    const SvgComponent = svgMap[name.toLowerCase()];
</script>

{#if SvgComponent}
    <SvgComponent {className} />
{:else}
    <div class={cn(' flex h-full w-full items-center justify-center text-center', className)}>
        {name}
    </div>
{/if}
