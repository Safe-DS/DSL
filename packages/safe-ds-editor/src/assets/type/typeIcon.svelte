<script lang="ts">
    // https://danmarshall.github.io/google-font-to-svg-path/
    import { cn } from '$/src/pages/utils';
    import Lambda from './lambda.svelte';
    import Table from './table.svelte';
    import Image from './image.svelte';
    import ImageList from './imageList.svelte';

    const svgMap: { [key: string]: typeof Lambda } = {
        lambda: Lambda,
        table: Table,
        image: Image,
        imagelist: ImageList,
    };

    export let name: string;
    export let className = '';

    const SvgComponent = svgMap[name.toLowerCase()];
</script>

{#if SvgComponent}
    <SvgComponent {className} />
{:else}
    <div class={cn(' flex h-full w-full items-center justify-center text-center font-bold whitespace-pre', className)}>
        {name}
    </div>
{/if}
