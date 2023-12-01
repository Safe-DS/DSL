<script lang="ts">
    import { currentState, currentTabIndex } from '../webviewState';
    import CaretIcon from '../icons/caret.svelte';
    import HistoryIcon from '../icons/history.svelte';
    import UndoIcon from '../icons/undo.svelte';
    import TableIcon from '../icons/table.svelte';
    import LinePlotTab from './Tabs/LinePlotTab.svelte';
</script>

<div class="sidebar">
    <div class="titleBar">
        <span class="tableName"
            >{$currentState.table?.name}
            <span class="caret"><CaretIcon /></span>
        </span>
        <span class="rowCounts">{$currentState.table?.visibleRows}/{$currentState.table?.totalRows} Rows</span>
    </div>
    <div class="historyBar">
        <span class="historyItem noSelect"><span class="icon historyIcon"><HistoryIcon /></span>History</span>
        <span class="historyItem noSelect"><span class="icon undoIcon"><UndoIcon /></span>Undo</span>
        <span class="historyItem noSelect"><span class="icon redoIcon"><UndoIcon /></span>Redo</span>
    </div>
    <div class="tabs">
        <nav class="tab" class:tabActive={$currentTabIndex === 0} on:click={() => currentTabIndex.update((cs) => 0)}>
            <span class="icon tableIcon"><TableIcon /></span>Table
        </nav>
        {#if $currentState.tabs}
            {#each $currentState.tabs as tab, index}
                {#if tab.type === 'linePlot'}
                    <nav on:click={() => currentTabIndex.update((cs) => index + 1)}>
                        <LinePlotTab tabOject={tab} active={$currentTabIndex === index + 1} />
                    </nav>
                {/if}
            {/each}
        {/if}
    </div>
</div>

<style>
    .sidebar {
        background-color: var(--bg-dark);
        color: var(--font-dark);
        border-right: 2px solid var(--bg-bright);
    }

    .titleBar {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        height: 63px;
        padding: 0px 20px 0px 20px;
        margin-bottom: 10px;
    }

    .tableName {
        display: flex;
        flex-direction: row;
        font-size: 1.8rem;
        margin-right: 8px;
    }

    .caret {
        margin-left: 7px;
        margin-right: 20px;
        padding-top: 10px;
        transform: rotate(180deg);
    }

    .historyBar {
        font-size: 1.3rem;
        background-color: var(--bg-bright);
        padding: 19.5px 20px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid var(--bg-medium);
    }

    .historyItem {
        display: flex;
        flex-direction: row;
        align-items: center;
        cursor: pointer;
        margin-right: 20px;
    }
    .historyItem:last-of-type {
        margin-right: 0px;
    }
    .icon {
        margin-right: 7px;
        padding-top: 2px;
    }

    .redoIcon {
        -webkit-transform: scaleX(-1);
        transform: scaleX(-1);
    }

    .tabs {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: fit-content;
    }

    .tab {
        width: 100%;
        height: 50px;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-left: 20px;
        cursor: pointer;
        background-color: var(--bg-medium);
        font-size: 1.1rem;
    }
    .tabActive {
        background-color: var(--bg-bright);
        font-size: 1.4rem;
        height: 50px;
    }
</style>
