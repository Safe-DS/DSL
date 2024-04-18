<script lang="ts">
    import { categorys } from './assets/categories/categories';
    import PrimarySidebar from './lib/components/sidebars/PrimarySidebar.svelte';
    import Grid from '$lib/components/main/flow.svelte';
    import NodeExtension from '$lib/components/nodes/node-extension.svelte';
    import { node } from './assets/node/node';

    const mainSidebarCategories: Category[] = [
        { name: 'Data Preparation', icon: categorys.preparation1 },
        { name: 'Modeling', icon: categorys.modeling },
        { name: 'Evaluation', icon: categorys.evaluation },
        { name: 'Import', icon: categorys.import },
        { name: 'Export', icon: categorys.export },
        { name: 'Extension', icon: node.extension },
    ];
</script>

<div class="relative h-full w-full">
    <PrimarySidebar
        class="absolute left-0 top-0 z-30"
        categories={mainSidebarCategories}
    ></PrimarySidebar>
    <main class="absolute left-0 top-0 h-full w-full">
        <Grid />
    </main>
</div>

<style>
</style>
