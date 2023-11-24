<script lang="ts">
    import type { HistoryEntry } from '../../../../types/shared-eda-vscode/types';
    import { resetGlobalState } from '../Apis/extensionApi';
    import { currentState } from '../webviewState';

    function resetAllState() {
        currentState.set({ tableIdentifier: undefined, history: [] });
        resetGlobalState();
    }
</script>

<main>
    <h1>{$currentState.tableIdentifier ?? 'Select Table'}</h1>
    <p>
        {JSON.stringify($currentState)}
    </p>
    <button on:click={() => resetAllState()}>reset state</button>
</main>
