<script lang="ts">
    import { categorysDark } from './assets/categories/categories';
    import PrimarySidebar from './lib/components/sidebars/PrimarySidebar.svelte';
    import Grid from '$lib/components/main/flow.svelte';
    import NodeExtension from '$lib/components/nodes/node-extension.svelte';

    const mainSidebarCategories: Category[] = [
        { name: 'Data Preparation', icon: categorysDark.preparation1 },
        { name: 'Data Preparation', icon: categorysDark.preparation2 },
        { name: 'Modeling', icon: categorysDark.modeling },
        { name: 'Evaluation', icon: categorysDark.evaluation },
        { name: 'Import', icon: categorysDark.import },
        { name: 'Export', icon: categorysDark.export },
    ];
</script>

<div class=" relative h-full w-full">
    <PrimarySidebar
        class="absolute left-0 top-0 z-30"
        categories={mainSidebarCategories}
    ></PrimarySidebar>
    <main class=" absolute left-0 top-0 h-full w-full">
        <Grid />
    </main>
</div>

<style>
</style>
