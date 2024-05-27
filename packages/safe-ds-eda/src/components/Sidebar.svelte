<script lang="ts">
    import { table, currentTabIndex, preventClicks, tabs } from '../webviewState';
    import CaretIcon from '../icons/Caret.svelte';
    import HistoryIcon from '../icons/History.svelte';
    import UndoIcon from '../icons/Undo.svelte';
    import TableIcon from '../icons/Table.svelte';
    import SidebarTab from './tabs/SidebarTab.svelte';
    import NewTabButton from './NewTabButton.svelte';
    import ColumnCounts from './ColumnCounts.svelte';

    export let width: number;

    const changeTab = function (index?: number) {
        if (!$preventClicks) {
            currentTabIndex.update((_cs) => index);
        }
    };
</script>

<div class="sidebar">
    <div class="titleBar">
        {#if width > 109}
            <span class="tableName"
                >{$table?.name ?? 'Loading ...'}
                <span class="caret"><CaretIcon /></span>
            </span>
        {/if}
    </div>
    {#if width > 50}
        <div class="historyBar" class:no-borders={width < 50}>
            <span class="historyItem noSelect"
                ><span class="icon historyIcon"><HistoryIcon /></span>{#if width > 200}History{/if}</span
            >
            <span class="historyItem noSelect"
                ><span class="icon undoIcon"><UndoIcon /></span>{#if width > 200}Undo{/if}</span
            >
            <span class="historyItem noSelect"
                ><span class="icon redoIcon"><UndoIcon /></span>{#if width > 200}Redo{/if}</span
            >
        </div>
    {/if}
    <div class="tabs">
        {#if width > 50}
            <button class="tab" class:tabActive={$currentTabIndex === undefined} on:click={() => changeTab(undefined)}>
                <span class="icon tableIcon"><TableIcon /></span>{#if width > 109}Table{/if}
            </button>
            {#if $tabs}
                {#each $tabs as tab, index}
                    <button class="sidebarButton" on:click={() => changeTab(index)}>
                        <SidebarTab tabObject={tab} active={$currentTabIndex === index} {width} />
                    </button>
                {/each}
            {/if}
        {/if}
    </div>
    {#if width > 50}
        <div class="newTab">
            <NewTabButton />
        </div>
    {/if}
    {#if width > 109}
        <div
            class="footer"
            style:width="{width}px"
            class:footerCellsCrunched={width < 300}
            class:footerCrunched={width < 200}
        >
            <div class="footerCell">
                <span>{$table?.visibleRows ?? 0}/{$table?.totalRows ?? 0}</span>
                <span>Rows</span>
            </div>
            <div class="footerCell columnCount">
                <ColumnCounts flexAsRow={width >= 300} />
            </div>
        </div>
    {/if}
</div>

<style>
    .sidebar {
        background-color: var(--medium-light-color);
        color: var(--darkest-color);
        height: calc(100% - 64px);
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
        z-index: 10;
    }

    .footer {
        height: 64px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        position: fixed;
        bottom: 0;
        background-color: var(--light-color);
        padding: 20px;
        gap: 20px;
        z-index: 10;
    }

    .footerCell {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        z-index: 10;
        gap: 5px;
    }

    .footerCrunched {
        flex-direction: column;
        height: 120px;
        gap: 10px;
    }

    .footerCellsCrunched .footerCell {
        flex-direction: column;
        gap: 0px;
    }

    .columnCount {
        cursor: pointer;
    }

    .titleBar {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        height: 64px;
        padding: 0 20px 0 20px;
        margin-bottom: 10px;
    }

    .sidebarButton {
        height: 50px;
        padding: 0px;
        border-top: 2px solid var(--lightest-color);
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
        background-color: var(--lightest-color);
        padding: 19.5px 20px 0 20px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
        align-items: center;
        border-bottom: 2px solid var(--light-color);
    }

    .no-borders {
        border: 0;
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
        margin-right: 0;
    }

    .icon {
        margin-right: 7px;
        padding-top: 2px;
    }

    .tableIcon {
        margin-right: 10px;
    }

    .redoIcon {
        transform: scaleX(-1);
    }

    .tabs {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .tab {
        width: 100%;
        height: 50px;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-left: 20px;
        cursor: pointer;
        background-color: var(--light-color);
        font-size: 1.1rem;
    }
    .tabActive {
        background-color: var(--lightest-color);
        font-size: 1.4rem;
        height: 50px;
    }

    .newTab {
        position: relative;
        top: 20px;
        left: 10px;
        margin-bottom: 100px;
    }

    @media (max-width: 300px) {
        .historyBar .icon {
            display: none;
        }
    }
</style>
