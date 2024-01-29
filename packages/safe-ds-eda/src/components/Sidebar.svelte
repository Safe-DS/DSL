<script lang="ts">
    import { currentState, currentTabIndex } from '../webviewState';
    import CaretIcon from '../icons/caret.svelte';
    import HistoryIcon from '../icons/history.svelte';
    import UndoIcon from '../icons/undo.svelte';
    import TableIcon from '../icons/table.svelte';
    import LinePlotTab from './Tabs/LinePlotTab.svelte';

    export let width: number;
</script>

<div class="sidebar">
    <div class="titleBar">
        {#if width > 100}
            <span class="tableName"
                >{$currentState.table?.name}
                <span class="caret"><CaretIcon /></span>
            </span>{/if}
        {#if width > 70}
            <span class="rowCounts">{$currentState.table?.visibleRows}/{$currentState.table?.totalRows} Rows</span>{/if}
    </div>
    <div class="historyBar" class:no-borders={width < 50}>
        {#if width > 50}
            <span class="historyItem noSelect"
                ><span class="icon historyIcon"><HistoryIcon /></span>{#if width > 200}History{/if}</span
            >
            <span class="historyItem noSelect"
                ><span class="icon undoIcon"><UndoIcon /></span>{#if width > 200}Undo{/if}</span
            >
            <span class="historyItem noSelect"
                ><span class="icon redoIcon"><UndoIcon /></span>{#if width > 200}Redo{/if}</span
            >
        {/if}
    </div>
    <div class="tabs">
        {#if width > 50}
            <nav
                class="tab"
                class:tabActive={$currentTabIndex === 0}
                on:click={() => currentTabIndex.update((cs) => 0)}
            >
                <span class="icon tableIcon"><TableIcon /></span>{#if width > 109}Table{/if}
            </nav>
            {#if $currentState.tabs}
                {#each $currentState.tabs as tab, index}
                    {#if tab.type === 'linePlot'}
                        <nav on:click={() => currentTabIndex.update((cs) => index + 1)}>
                            <LinePlotTab tabOject={tab} active={$currentTabIndex === index + 1} {width} />
                        </nav>
                    {/if}
                {/each}
            {/if}
        {/if}
    </div>
</div>

<style>
    .sidebar {
        background-color: var(--bg-dark);
        color: var(--font-dark);
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
        padding: 19.5px 20px 0px 20px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
        align-items: center;
        border-bottom: 2px solid var(--bg-medium);
    }

    .no-borders {
        border: 0px;
    }

    .historyItem {
        display: flex;
        flex-direction: row;
        align-items: center;
        cursor: pointer;
        margin-right: 20px;
        margin-bottom: 20px;
    }
    .historyItem:last-of-type {
        margin-right: 0px;
    }
    .icon {
        margin-right: 7px;
        padding-top: 2px;
    }

    .redoIcon {
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

    @media (max-width: 300px) {
        .historyBar .icon {
            display: none;
        }
    }
</style>
