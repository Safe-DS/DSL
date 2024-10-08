<script lang="ts">
    import TableView from './components/TableView.svelte';
    import Sidebar from './components/Sidebar.svelte';
    import { throttle } from 'lodash';
    import { currentTabIndex, tabKey, tableKey, tabs } from './webviewState';
    import TabContent from './components/tabs/TabContent.svelte';

    let sidebarWidth = 307; // Initial width of the sidebar in pixels

    const handleDrag = function (e: MouseEvent) {
        const onMouseMove = function (mouseMoveEvent: MouseEvent) {
            const dx = mouseMoveEvent.clientX - prevX;
            prevX = mouseMoveEvent.clientX;
            if (sidebarWidth + dx < 10) {
                sidebarWidth = 10;
            } else {
                sidebarWidth += dx;
            }
        };
        const throttledOnMouseMove = throttle(onMouseMove, 30);

        let prevX = e.clientX;

        const onMouseUp = function () {
            document.removeEventListener('mousemove', throttledOnMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', clearTextSelection);
        };

        document.addEventListener('mousemove', throttledOnMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', clearTextSelection);
    };

    const clearTextSelection = function () {
        const selection = window.getSelection();
        if (selection) selection.removeAllRanges();
    };
</script>

<main>
    <div class="sidebarWrapper" style:width="{sidebarWidth}px">
        <Sidebar width={sidebarWidth} />
        <button class="resizer" on:mousedown={handleDrag}></button>
    </div>
    <div class="contentWrapper">
        <div class:hide={$currentTabIndex !== undefined}>
            {#key $tableKey}
                <TableView {sidebarWidth} />
            {/key}
        </div>
        {#key $tabKey}
            {#if $tabs.length > 0}
                {#each $tabs as tab, index}
                    <div class:hide={index !== $currentTabIndex}>
                        <TabContent {tab} {sidebarWidth} />
                    </div>
                {/each}
            {/if}
        {/key}
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: row;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }

    .sidebarWrapper {
        flex-shrink: 0;
        overflow: hidden;
        position: relative;
        background-color: var(--medium-light-color);
        height: 100%;
        z-index: 10;
    }

    .contentWrapper {
        flex: 1;
        width: 100%;
    }

    .contentWrapper * {
        height: 100%;
        width: 100%;
    }

    .resizer {
        width: 5px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        cursor: ew-resize;
        background-color: transparent;
        z-index: 20;
    }

    .hide {
        display: none;
    }
</style>
