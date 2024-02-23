<script lang="ts">
    // import MainWindow from './MainWindow.svelte';
    // import PrimarySidebar from './PrimarySidebar.svelte';
    // import SecondarySidebar from './SecondarySidebar.svelte';
    // import './global.css';

    const mainSidebarCategories = [
        { name: 'Data Preparation', fileName: 'preparation1.svg' },
        { name: 'Data Preparation', fileName: 'preparation2.svg' },
        { name: 'Modeling', fileName: 'modeling.svg' },
        { name: 'Evaluation', fileName: 'evaluation.svg' },
        { name: 'Import', fileName: 'import.svg' },
        { name: 'Export', fileName: 'export.svg' },
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

<main class="w-full h-full">
    <div class="h-full w-full m-0 flex">
        <!-- <PrimarySidebar {mainSidebarCategories} /> -->
        <!-- <MainWindow />
        <SecondarySidebar {mainSidebarCategories} /> -->
    </div>
</main>

<style>
</style>
