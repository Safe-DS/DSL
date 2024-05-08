<script lang="ts">
    import { addEmptyTabHistoryEntry } from '../apis/historyApi';
    import PlusIcon from '../icons/Plus.svelte';
    import { disableNonContextMenuEffects, restoreNonContextMenuEffects } from '../toggleNonContextMenuEffects';
    import { preventClicks } from '../webviewState';

    let contextMenuVisible = false;
    let menuRef: HTMLElement;

    const toggleMenu = function () {
        if ($preventClicks) return;

        contextMenuVisible = !contextMenuVisible;

        if (contextMenuVisible) {
            preventClicks.set(true);
            disableNonContextMenuEffects();
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
    };

    const handleClickOutside = function (event: MouseEvent) {
        if (contextMenuVisible) {
            if (menuRef && !menuRef.contains(event.target as Node)) {
                preventClicks.set(false);
                restoreNonContextMenuEffects();
                contextMenuVisible = false;
                document.removeEventListener('click', handleClickOutside);
            }
        }
    };

    const selectOption = function (callback: () => void) {
        preventClicks.set(false);
        restoreNonContextMenuEffects();
        contextMenuVisible = false;
        document.removeEventListener('click', handleClickOutside);
        callback();
    };

    const createEmptyPlot = function () {
        addEmptyTabHistoryEntry();
    };
</script>

<div class="wrapper" bind:this={menuRef}>
    <div role="none" class="iconWrapper" on:click={toggleMenu}>
        <PlusIcon />
    </div>
    {#if contextMenuVisible}
        <div class="contextMenu">
            <button class="contextItem" on:click={() => selectOption(createEmptyPlot)}>New Plot</button>
        </div>
    {/if}
</div>

<style>
    .wrapper {
        width: 35px;
        height: 35px;
        cursor: pointer;
        position: relative;
    }

    .contextMenu {
        position: absolute;
        border: 2px solid var(--bg-dark);
        background-color: var(--bg-bright);
        z-index: 1000;
        padding: 0;
        color: var(--font-dark);
        display: flex;
        flex-direction: column;
        width: max-content;
        top: 50%;
        left: 100%;
        min-width: 100px;
    }

    .contextMenu button {
        padding: 5px 15px;
        cursor: pointer;
        background-color: var(--bg-bright);
        color: var(--font-dark);
        text-align: left;
        width: 100%;
    }

    .contextMenu button:hover {
        background-color: var(--primary-color);
        color: var(--font-bright);
    }
</style>
