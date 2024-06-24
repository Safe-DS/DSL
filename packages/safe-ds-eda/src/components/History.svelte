<script lang="ts">
    import { currentHistoryIndex, redoHistoryEntries, undoHistoryEntries } from '../apis/historyApi';
    import { history } from '../webviewState';
</script>

<div class="wrapper">
    {#if $history.length === 0}
        <span class="historyItem">No history</span>
    {/if}
    {#each [...$history].reverse() as historyItem, index}
        <span
            class="historyItem"
            role="none"
            on:click={() =>
                $currentHistoryIndex > ($history.length - 1 - index)
                    ? undoHistoryEntries(historyItem.id)
                    : $currentHistoryIndex < ($history.length - 1 - index)
                      ? redoHistoryEntries(historyItem.id)
                      : null}
        >
            <span class="historyText" class:inactiveItem={$currentHistoryIndex < ($history.length - 1 - index)} class:currentItem={$currentHistoryIndex === ($history.length - 1 - index)}
                >{($history.length - index)}. {historyItem.alias}</span
            >
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
        font-size: 1.15em;
        display: flex;
        align-items: center;
        overflow: hidden;
    }

    .historyItem:hover * {
        color: var(--dark-color);
    }

    .historyText {
        display: -webkit-box;
        -webkit-line-clamp: 2; /* Number of lines to show */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-wrap: break-word; /* Ensures long words break correctly */
        max-width: calc(100% - 26px); /* Account for the spinner width */
    }

    .inactiveItem {
        color: var(--medium-color);
    }

    .currentItem {
        font-weight: bold;
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
