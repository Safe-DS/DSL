<script lang="ts">
    import { addInternalToHistory } from '../apis/historyApi';
    import { disableNonContextMenuEffects, restoreNonContextMenuEffects } from '../toggleNonContextMenuEffects';
    import { preventClicks, table } from '../webviewState';

    export let flexAsRow = true;

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

    const showColumn = function (columnName: string) {
        table.update(($table) => {
            return {
                ...$table!,
                columns: $table!.columns.map((column) => {
                    if (columnName === column.name) {
                        return {
                            ...column,
                            hidden: !column.hidden,
                        };
                    }
                    return column;
                }),
            };
        });

        addInternalToHistory({
            action: 'showColumn',
            alias: `Show column ${columnName}`,
            type: 'internal',
            columnName: columnName,
        });
    };
</script>

<div class="wrapper" bind:this={menuRef}>
    <div class="text" class:textColumn={!flexAsRow} on:mouseup={toggleMenu} role="none">
        <span>{$table?.columns.filter((col) => !col.hidden).length ?? 0}/{$table?.columns.length ?? 0}</span>
        <span>Columns </span>
    </div>
    {#if contextMenuVisible && $table}
        <div class="contextMenu">
            {#each $table.columns.filter((col) => col.hidden) as column}
                <button class="contextItem" on:click={() => selectOption(() => showColumn(column.name))}
                    >Show {column.name}</button
                >
            {/each}
            {#if $table.columns.filter((col) => col.hidden).length === 0}
                <button disabled>No Col. Hidden</button>
            {/if}
        </div>
    {/if}
</div>

<style>
    .wrapper {
        cursor: pointer;
        position: relative;
        z-index: 100;
    }

    .text {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
        gap: 5px;
    }

    .textColumn {
        flex-direction: column;
        gap: 0px;
    }

    .text:hover * {
        color: var(--dark-color);
    }

    .contextMenu {
        position: absolute;
        border: 2px solid var(--medium-light-color);
        background-color: var(--lightest-color);
        z-index: 100;
        padding: 0;
        color: var(--darkest-color);
        display: flex;
        flex-direction: column;
        width: max-content;
        left: 50%;
        bottom: 100%;
        min-width: 100px;
    }

    .contextMenu button {
        padding: 5px 15px;
        cursor: pointer;
        background-color: var(--lightest-color);
        color: var(--darkest-color);
        text-align: left;
        width: 100%;
    }

    .contextMenu button:hover {
        background-color: var(--primary-color);
        color: var(--light-color);
    }

    .contextMenu :disabled:hover {
        background-color: var(--lightest-color);
        color: var(--darkest-color);
        cursor: default;
    }
</style>
