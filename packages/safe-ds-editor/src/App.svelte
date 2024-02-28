<script lang="ts">
    import { categorysDark } from './assets/categories/categories';
    import PrimarySidebar from './lib/components/sidebar/PrimarySidebar.svelte';
    import Grid from '$lib/components/main/grid.svelte';

    const mainSidebarCategories: Category[] = [
        { name: 'Data Preparation', icon: categorysDark.preparation1 },
        { name: 'Data Preparation', icon: categorysDark.preparation2 },
        { name: 'Modeling', icon: categorysDark.modeling },
        { name: 'Evaluation', icon: categorysDark.evaluation },
        { name: 'Import', icon: categorysDark.import },
        { name: 'Export', icon: categorysDark.export },
    ];

    const parameterss: Parameter<DataType>[] = [
        {
            name: 'Text Parameter',
            type: 'string',
            value: 'Das hier ist ein String!',
            optional: false,
        },
        {
            name: 'Zahlen Parameter',
            type: 'number',
            value: '420',
            optional: false,
        },
        {
            name: 'Lambda Parameter',
            type: 'lambda',
            value: '',
            optional: false,
        },
        {
            name: 'Tabelle Parameter',
            type: 'table',
            value: 'Eingangsfunktion.VariablenName',
            optional: false,
        },
    ];
</script>

<div class=" relative h-full w-full">
    <PrimarySidebar
        class="absolute left-0 top-0 z-10"
        categories={mainSidebarCategories}
    ></PrimarySidebar>
    <main class=" absolute left-0 top-0 h-full w-full">
        <Grid />
    </main>
</div>

<style>
</style>
