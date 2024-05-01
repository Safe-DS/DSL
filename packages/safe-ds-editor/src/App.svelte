<script lang="ts">
    import { categorys } from './assets/categories/categories';
    import PrimarySidebar from './lib/components/sidebars/PrimarySidebar.svelte';
    import Grid from '$lib/components/main/flow.svelte';
    import NodeExtension from '$lib/components/nodes/node-extension.svelte';
    import { node } from './assets/node/node';
    import type { Error } from 'types/error';
    import { setContext } from 'svelte';
    import MessageHandler from './messaging/messageHandler';

    const mainSidebarCategories: Category[] = [
        { name: 'Data Preparation', icon: categorys.preparation1 },
        { name: 'Modeling', icon: categorys.modeling },
        { name: 'Evaluation', icon: categorys.evaluation },
        { name: 'Import', icon: categorys.import },
        { name: 'Export', icon: categorys.export },
        { name: 'Segments', icon: node.extension },
    ];

    export let criticalError: Error | null = null;
    export let ast: string;

    function handleError(error: Error) {
        switch (error.action) {
            case 'block':
                criticalError = error;
            case 'notify':
                // Todo: Use the Vs Code Notification instead
                console.log(`[${error.source}] ${error.message}`);
        }
    }
    setContext('handleError', handleError);
</script>

{#if criticalError}
    <div class=" flex h-full w-full flex-col items-center justify-center gap-4">
        <span class="text-xs text-red-600">Critical Error</span>
        <div class="flex w-1/2 flex-col gap-2 border-2 border-red-600 p-6">
            <div class=" whitespace-pre-wrap text-xl font-bold text-red-600">
                {criticalError.source}
            </div>
            <div class="whitespace-pre-wrap text-sm text-gray-300">
                {criticalError.message}
            </div>
        </div>
        <button class=" w-20" on:click={() => {
            criticalError = null
        }}>Continue</button>
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
