<script lang="ts">
    import { currentHistoryIndex, undoHistoryEntries } from '../apis/historyApi';
    import { history } from '../webviewState';
</script>

<div class="wrapper">
    {#if $history.length === 0}
        <span class="historyItem">No history</span>
    {/if}
    {#each $history as historyItem, index}
        <span
            class="historyItem"
            class:inactiveItem={$currentHistoryIndex < index}
            role="none"
            on:click={() => ($currentHistoryIndex > index ? undoHistoryEntries(historyItem.id) : undefined)}
        >
            {index + 1}. {historyItem.alias}
            {#if historyItem.loading}
                <span class="spinner"></span>
            {/if}
        </span>
    {/each}
</div>

<style>
    .wrapper {
        height: 100%;
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .historyItem {
        cursor: pointer;
        color: var(--darkest-color);
        font-size: 1.1em;
        display: flex;
        align-items: center;
    }

    .inactiveItem {
        color: var(--medium-color);
    }

    .spinner {
        margin-left: 10px;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-top: 2px solid var(--darkest-color);
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
