<script lang="ts">
    import { categorys } from './assets/categories/categories';
    import PrimarySidebar from './lib/components/sidebars/PrimarySidebar.svelte';
    import Grid from '$lib/components/main/flow.svelte';
    import { node } from './assets/node/node';
    import type { Error } from 'types/error';
    import { setContext } from 'svelte';
    import { ScrollArea } from '$lib/components/ui/scroll-area';

    const mainSidebarCategories: Category[] = [
        { name: 'Data Preparation', icon: categorys.preparation1 },
        { name: 'Modeling', icon: categorys.modeling },
        { name: 'Evaluation', icon: categorys.evaluation },
        { name: 'Import', icon: categorys.import },
        { name: 'Export', icon: categorys.export },
        { name: 'Segments', icon: node.extension },
    ];

    export let criticalErrorList: Error[] = [];
    export let ast: string;

    function handleError(error: Error[]) {
        error.forEach((error) => {
            switch (error.action) {
                case 'block':
                    criticalErrorList.push(error);
                case 'notify':
                    // Todo: Use the Vs Code Notification instead
                    console.log(`[${error.source}] ${error.message}`);
            }
        });
    }
    setContext('handleError', handleError);
</script>

{#if criticalErrorList.length > 0}
    <div class=" flex h-full w-full flex-col items-center justify-center gap-4">
        <span class="text-xs text-red-600">Critical Error</span>
        <ScrollArea class="h-3/4 w-3/4 rounded-md border-2 border-red-600 p-6">
            <div class="flex flex-col gap-2 select-text">
                {#each criticalErrorList as error}
                    <div
                        class="select-text whitespace-pre-wrap text-xl font-bold text-red-600"
                    >
                        {error.source}
                    </div>
                    <div class="select-text whitespace-pre-wrap text-sm text-gray-300">
                        {error.message}
                    </div>
                {/each}
            </div>
        </ScrollArea>
        <button
            class=" w-20"
            on:click={() => {
                criticalErrorList = [];
            }}>Continue</button
        >
    </div>
{:else}
    <div class="relative h-full w-full">
        <PrimarySidebar
            class="absolute left-0 top-0 z-30"
            categories={mainSidebarCategories}
        ></PrimarySidebar>
        <main class="absolute left-0 top-0 h-full w-full">
            <Grid />
        </main>
    </div>
{/if}

<style>
</style>
