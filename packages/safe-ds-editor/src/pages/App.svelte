<script lang="ts">
    import PrimarySidebar from '$src/components/sidebars/PrimarySidebar.svelte';
    import Board from '$src/components/main/board.svelte';
    import { CustomError, type Ast } from '$global';
    import { setContext } from 'svelte';
    import ErrorPage from '$pages/ErrorPage.svelte';

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
        <PrimarySidebar class="absolute left-0 top-0 z-30" />
        <main class="absolute left-0 top-0 h-full w-full">
            <!-- <Board /> -->
        </main>
    </div>
{/if}

<style>
</style>
