<script lang="ts">
    import { categorys } from '../assets/categories/categories';
    import PrimarySidebar from './components/sidebars/PrimarySidebar.svelte';
    import Grid from './components/main/flow.svelte';
    import { node } from '../assets/node/node';
    import { CustomError } from '$global';
    import { setContext } from 'svelte';
    import type { Ast } from '../../../safe-ds-lang/src/language/custom-editor/global';
    import ErrorPage from './ErrorPage.svelte';

    export let errorList: CustomError[];
    export let ast: Ast | undefined;

    function handleError(error: CustomError[]) {
        error.forEach((error) => {
            switch (error.action) {
                case 'block':
                    errorList.push(error);
                case 'notify':
                    // Todo: Use the Vs Code Notification instead
                    console.log(error.message);
            }
        });
    }
    setContext('handleError', handleError);
</script>

{#if errorList.length > 0}
    <ErrorPage {errorList} />
{:else}
    <div class="relative h-full w-full">
        <!-- <PrimarySidebar class="absolute left-0 top-0 z-30" categories={[]}
        ></PrimarySidebar> -->
        <main class="absolute left-0 top-0 h-full w-full">
            <!-- <Grid /> -->
        </main>
    </div>
{/if}

<style>
</style>
