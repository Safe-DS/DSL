<script lang="ts">
    import PrimarySidebar from '$src/components/sidebars/PrimarySidebar.svelte';
    import Board from '$src/components/main/board.svelte';
    import { Ast, CustomError } from '$global';
    import { onMount, setContext } from 'svelte';
    import ErrorPage from '$pages/ErrorPage.svelte';
    import MessageHandler from '../messaging/messageHandler';
    import { writable } from 'svelte/store';

    MessageHandler.initialize();
    MessageHandler.listenToMessages();

    let ast = writable<Ast>(new Ast());
    let errorList = writable<CustomError[]>([]);

    async function fetchAst() {
        const response = await MessageHandler.getAst();
        errorList.set(response.errorList);
        ast.set(response.ast);
    }
    onMount(async () => {
        await fetchAst();
    });

    function handleError(error: CustomError) {
        if (error.action === 'block')
            errorList.update((array) => {
                array.push(error);
                return array;
            });

        if (error.action === 'notify') console.log(error.message);
    }
    setContext('handleError', handleError);
</script>

{#if $errorList.length > 0}
    <ErrorPage bind:errorList />
{:else}
    <div class="relative h-full w-full">
        <div class="absolute left-0 top-0 z-50">{$ast.callList.length}</div>
        <PrimarySidebar class="absolute left-0 top-10 z-30" />
        <main class="absolute left-0 top-0 h-full w-full">
            <Board {ast} />
        </main>
    </div>
{/if}

<style>
</style>
