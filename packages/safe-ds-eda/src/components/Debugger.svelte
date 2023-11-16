<script lang="ts">
    import { resetGlobalState } from '../Apis/extensionApi';
    import { currentState } from '../webviewState';

    function resetAllState() {
        currentState.set({ tableIdentifier: undefined, randomText: '' });
        resetGlobalState();
    }
</script>

<main>
    <h1>{$currentState.tableIdentifier ?? 'Select Table'}</h1>
    <button
        on:click={() => {
            $currentState.randomText = Math.ceil(Math.random() * 100).toString();
        }}>rdm state</button
    >
    <h1>{$currentState.randomText}</h1>
    <p>
        {JSON.stringify($currentState)}
    </p>
    <button on:click={() => resetAllState()}>reset state</button>
</main>
