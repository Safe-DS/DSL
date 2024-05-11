<script lang="ts">
    import { addEmptyTabHistoryEntry } from '../apis/historyApi';
    import PlusIcon from '../icons/Plus.svelte';
    import { preventClicks } from '../webviewState';

    const createEmptyTab = function () {
        if ($preventClicks) return;
        addEmptyTabHistoryEntry();
    };
</script>

<div class="wrapper">
    <div role="none" class="iconWrapper" on:click={createEmptyTab}>
        <PlusIcon />
    </div>
</div>

<style>
    .wrapper {
        width: 35px;
        height: 35px;
        cursor: pointer;
        position: relative;
    }
</style>
