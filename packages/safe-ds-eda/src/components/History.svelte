<script lang="ts">
    import { history } from '../webviewState';
</script>

<div class="wrapper">
    {#if $history.length === 0}
        <span class="historyItem">No history</span>
    {/if}
    {#each $history as historyItem, index}
        <span class="historyItem">{index}. {historyItem.alias}</span>
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
    }
</style>
