<script lang="ts">
    import { onMount } from 'svelte';
    import { throttle } from 'lodash';
    import { table, preventClicks, tableLoading, savedColumnWidths, showProfiling } from '../webviewState';
    import CaretIcon from '../icons/Caret.svelte';
    import ErrorIcon from '../icons/Error.svelte';
    import type {
        Column,
        OneColumnTabTypes,
        PossibleColumnFilter,
        PossibleSorts,
        Profiling,
        ProfilingDetail,
        ProfilingDetailStatistical,
        TwoColumnTabTypes,
    } from '../../types/state.js';
    import ProfilingInfo from './profiling/ProfilingInfo.svelte';
    import { derived, get } from 'svelte/store';
    import ColumnFilters from './column-filters/ColumnFilters.svelte';
    import { imageWidthToHeightRatio } from '../../consts.config';
    import { addInternalToHistory, executeExternalHistoryEntry } from '../apis/historyApi';
    import { disableNonContextMenuEffects, restoreNonContextMenuEffects } from '../toggleNonContextMenuEffects';

    export let sidebarWidth: number;

    let profilingImageWidth = 200;

    let minTableWidth = 0;
    let numRows = 0;
    const headerElements: HTMLElement[] = [];
    let maxProfilingItemCount = 0;

    //#region Startup
    $: if ($table) {
        minTableWidth = 0;
        numRows = 0;
        maxProfilingItemCount = 0;
        $table.columns.forEach((column: Column) => {
            if (column.values.length > numRows) {
                numRows = column.values.length;
            }
            minTableWidth += 100;

            // Find which is the talles profiling type present in this table to adjust which profilings to give small height to, to have them adhere to good spacing
            // (cannot give to tallest one, as then it will all be small)
            if (column.profiling) {
                let profilingItemCount = 0;
                if (column.profiling.validRatio) profilingItemCount += 1;
                if (column.profiling.missingRatio) profilingItemCount += 1;
                for (const profilingItem of column.profiling.other) {
                    profilingItemCount += calcProfilingItemValue(profilingItem);
                }
                if (profilingItemCount > maxProfilingItemCount) {
                    maxProfilingItemCount = profilingItemCount;
                }
            }
        });

        if ($showProfiling) {
            setTimeout(() => {
                if ($showProfiling && fullHeadBackground && profilingInfo) {
                    // To catch where we reninitialize the table and thus this is triggered after old one is gone already
                    fullHeadBackground.style.height = 2 * rowHeight + profilingInfo.clientHeight + 'px'; // To also update when profiling info is initially coming and profiling was already open
                }
            }, 700); // 700ms is the transition time of the profiling info opening/incresing in height
        }
    }

    $: if (headerElements.length > 0) {
        // Is svelte reactive but so far only runs once which is what we want, consideration to have loop in onMount that waits until headerElements is filled and then runs this code once
        for (const column of headerElements) {
            const columnName = column.innerText.trim();
            if (get(savedColumnWidths).has(columnName)) continue; // Only set intital width if not already set

            // // Example of how to calculate width based on content length, might be needed in place of profilingImageWidth approach again
            // const baseWidth = 35; // Minimum width
            // const scale = 55;
            // // Use the logarithm of the character count, and scale it
            // const width = baseWidth + Math.log(columnName.length + 1) * scale;

            const width = profilingImageWidth + 2 * 12; // Image width + 2 borders

            // Save the width for future use
            savedColumnWidths.update((map) => {
                map.set(columnName, width);
                return map;
            });
        }

        lastHeight = tableContainer.clientHeight; // For recalculateVisibleRowCount
    }
    //#endregion

    //#region Cell interaction
    const handleMainCellClick = function (): void {
        if (!$preventClicks) {
            selectedColumnIndexes = [];
            selectedRowIndexes = [];
        }
    };
    //#endregion

    //#region Column interaction
    let holdTimeout: NodeJS.Timeout;
    let isClick = true; // Flag to distinguish between click and hold
    let currentMouseUpHandler: ((event: MouseEvent) => void) | null = null; // For being able to properly remove the mouseup listener when col clicked and not held

    const handleColumnInteractionStart = function (event: MouseEvent, columnIndex: number): void {
        // Check if the left or right mouse button was pressed
        if (event.button !== 0 && event.button !== 2) return;

        if (event.button === 2) {
            // Right click
            handleColumnRightClick(event, columnIndex);
            return;
        }

        // Right click still allowed to happen
        if ($preventClicks) {
            return;
        }

        isClick = true; // Assume it's a click initially

        holdTimeout = setTimeout(() => handleReorderDragStart(columnIndex, event), 300); // milliseconds delay for hold detection

        // Define the handler function
        currentMouseUpHandler = (mouseUpEvent: MouseEvent) => {
            handleColumnMouseUp(mouseUpEvent, columnIndex);
        };

        // Add mouseup listener to clear the timeout if the button is released
        document.addEventListener('mouseup', currentMouseUpHandler);
    };

    const handleColumnMouseUp = function (event: MouseEvent, columnIndex: number): void {
        clearTimeout(holdTimeout);
        if (currentMouseUpHandler) document.removeEventListener('mouseup', currentMouseUpHandler);

        if (isClick) {
            handleColumnClick(event, columnIndex);
        }
    };

    //#region Column resizing
    let isResizeDragging = false;
    let startWidth: number;
    let startX: number;
    let targetColumn: HTMLElement;
    const resizeWidthMap: Map<string, number> = new Map();

    const doResizeDrag = function (event: MouseEvent): void {
        if (isResizeDragging && targetColumn) {
            const currentWidth = startWidth + event.clientX - startX;
            if (currentWidth < 20) return; // Minimum width
            requestAnimationFrame(() => {
                targetColumn.style.width = `${currentWidth}px`;
                savedColumnWidths.update((map) => {
                    map.set(targetColumn.innerText.trim(), currentWidth);
                    return map;
                });
                resizeWidthMap.set(targetColumn.innerText.trim(), currentWidth);
            });
        }
    };

    const throttledDoResizeDrag = throttle(doResizeDrag, 30);

    const startResizeDrag = function (event: MouseEvent, columnIndex: number): void {
        event.stopPropagation();
        const columnElement = headerElements[columnIndex];
        isResizeDragging = true;
        startX = event.clientX;
        startWidth = columnElement.offsetWidth;
        targetColumn = columnElement;
        resizeWidthMap.set(targetColumn.innerText.trim(), startWidth);
        document.addEventListener('mousemove', throttledDoResizeDrag);
        document.addEventListener('mouseup', stopResizeDrag);
    };

    const stopResizeDrag = function (): void {
        isResizeDragging = false;
        document.removeEventListener('mousemove', throttledDoResizeDrag);
        document.removeEventListener('mouseup', stopResizeDrag);

        addInternalToHistory({
            action: 'resizeColumn',
            alias: `Resize column ${targetColumn!.innerText.trim()}`,
            type: 'internal',
            columnName: targetColumn!.innerText.trim(),
            value: resizeWidthMap.get(targetColumn!.innerText.trim())!,
        });
    };
    //#endregion

    //#region Column reordering
    let isReorderDragging = false;
    let dragStartIndex: number | null = null;
    let dragCurrentIndex: number | null = null;
    let draggedColumnName: string | null = null;
    let reorderPrototype: HTMLElement;
    let savedColumnWidthBeforeReorder = 0;

    const handleReorderDragStart = function (columnIndex: number, event: MouseEvent): void {
        isClick = false; // If timeout completes, it's a hold
        document.addEventListener('mouseup', handleReorderDragEnd);
        savedColumnWidthBeforeReorder = get(savedColumnWidths).get(headerElements[columnIndex].innerText.trim())!;
        draggedColumnName = headerElements[columnIndex].innerText.trim();
        isReorderDragging = true;
        dragStartIndex = columnIndex;
        dragCurrentIndex = columnIndex;
        selectedColumnIndexes = []; // Clear so reordering doesn't interfere with selection

        // First iteration in case user holds still
        dragCurrentIndex = columnIndex;
        requestAnimationFrame(() => {
            reorderPrototype!.style.left = event.clientX + tableContainer.scrollLeft - sidebarWidth + 'px';
            reorderPrototype!.style.top = event.clientY + scrollTop + 'px';
        });
    };

    const handleReorderDragOver = function (event: MouseEvent, columnIndex: number): void {
        if (isReorderDragging && dragStartIndex !== null && draggedColumnName) {
            dragCurrentIndex = columnIndex;
            requestAnimationFrame(() => {
                reorderPrototype!.style.left = event.clientX + tableContainer.scrollLeft - sidebarWidth + 'px';
                reorderPrototype!.style.top = event.clientY + scrollTop + 'px';
            });
        }
    };

    const throttledHandleReorderDragOver = throttle(handleReorderDragOver, 30);

    const handleReorderDragEnd = function (): void {
        if (isReorderDragging && dragStartIndex !== null && dragCurrentIndex !== null) {
            if (draggedColumnName) {
                savedColumnWidths.update((map) => {
                    map.set(draggedColumnName!, savedColumnWidthBeforeReorder);
                    return map;
                });
                draggedColumnName = null;
            }
            // Reset the z-index of all headers
            headerElements.forEach((header) => {
                header.style.zIndex = ''; // Reset to default
            });
            if (dragCurrentIndex > dragStartIndex) {
                dragCurrentIndex -= 1;
            }

            table.update(($table) => {
                const newColumns = [...$table!.columns];
                const movedItem = newColumns.splice(dragStartIndex!, 1)[0];
                newColumns.splice(dragCurrentIndex!, 0, movedItem);

                addInternalToHistory({
                    action: 'reorderColumns',
                    alias: `Reorder column ${$table!.columns[dragStartIndex!].name}`,
                    type: 'internal',
                    columnOrder: newColumns.map((column) => column.name),
                });

                return { ...$table!, columns: newColumns };
            });

            document.removeEventListener('mouseup', handleReorderDragEnd);
            isReorderDragging = false;
            dragStartIndex = null;
            dragCurrentIndex = null;
        }
    };
    //#endregion

    //#region Column selecting
    let selectedColumnIndexes: number[] = [];

    const handleColumnClick = function (event: MouseEvent, columnIndex: number): void {
        // Logic for what happens when a header is clicked
        if ($preventClicks) {
            return;
        }

        // Check if Ctrl (or Cmd on Mac) is held down
        if (event.ctrlKey || event.metaKey) {
            // Toggle the selected state of the column
            const index = selectedColumnIndexes.indexOf(columnIndex);
            if (index > -1) {
                // Already selected, so remove from the selection
                removeColumnFromSelection(columnIndex, index);
            } else {
                // Not selected, add to the selection
                // Add the index and create a new array to trigger reactivity
                addColumnToSelection(columnIndex);
            }
        } else {
            const index = selectedColumnIndexes.indexOf(columnIndex);
            if (index > -1 && selectedColumnIndexes.length === 1) {
                // Already selected, so clear selection
                selectedColumnIndexes = [];
            } else {
                // Not selected, replace the current selection
                // Replace the current selection with a new array to trigger reactivity
                setSelectionToColumn(columnIndex);
            }
        }
    };

    const addColumnToSelection = function (columnIndex: number): void {
        if (selectedRowIndexes.length > 0) {
            selectedRowIndexes = [];
        }

        // Add the index and create a new array to trigger reactivity
        selectedColumnIndexes = [...selectedColumnIndexes, columnIndex];
    };

    const removeColumnFromSelection = function (columnIndex: number, selectedColumnIndexesIndex?: number): void {
        if (selectedRowIndexes.length > 0) {
            selectedRowIndexes = [];
        }

        // Remove the index and create a new array to trigger reactivity
        selectedColumnIndexes = [
            ...selectedColumnIndexes.slice(0, selectedColumnIndexesIndex ?? selectedColumnIndexes.indexOf(columnIndex)),
            ...selectedColumnIndexes.slice(
                (selectedColumnIndexesIndex ?? selectedColumnIndexes.indexOf(columnIndex)) + 1,
            ),
        ];
    };

    const setSelectionToColumn = function (columnIndex: number): void {
        if (selectedRowIndexes.length > 0) {
            selectedRowIndexes = [];
        }

        // Replace the current selection with a new array to trigger reactivity
        selectedColumnIndexes = [columnIndex];
    };
    //#endregion
    //#endregion // Column interaction

    //#region Row selecting
    let selectedRowIndexes: number[] = [];

    const handleRowClick = function (event: MouseEvent, rowIndex: number): void {
        // Logic for what happens when a row is clicked
        if ($preventClicks) {
            return;
        }

        if (selectedColumnIndexes.length > 0) {
            selectedColumnIndexes = [];
        }

        // Check if Ctrl (or Cmd on Mac) is held down
        if (event.ctrlKey || event.metaKey) {
            // Toggle the selected state of the row
            const index = selectedRowIndexes.indexOf(rowIndex);
            if (index > -1) {
                // Already selected, so remove from the selection
                // Remove the index and create a new array to trigger reactivity
                selectedRowIndexes = [...selectedRowIndexes.slice(0, index), ...selectedRowIndexes.slice(index + 1)];
            } else {
                // Not selected, add to the selection
                // Add the index and create a new array to trigger reactivity
                selectedRowIndexes = [...selectedRowIndexes, rowIndex];
            }
        } else {
            const index = selectedRowIndexes.indexOf(rowIndex);
            if (index > -1 && selectedRowIndexes.length === 1) {
                // Already selected, so clear selection
                selectedRowIndexes = [];
            } else {
                // Not selected, replace the current selection
                // Replace the current selection with a new array to trigger reactivity
                selectedRowIndexes = [rowIndex];
            }
        }
    };
    //#endregion

    //#region Scroll loading
    let tableContainer: HTMLElement; // Reference to the table container
    const rowHeight = 33; // Adjust based on your row height
    const buffer = 40; // Number of rows to render outside the viewport
    let visibleStart = 0;
    let visibleEnd = 0;
    let visibleRowCount = 10;
    let scrollTop = 0;
    let scrollLeft = 0;
    let lastHeight = 0;

    const updateVisibleRows = function (): void {
        visibleStart = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
        visibleEnd = visibleStart + visibleRowCount + buffer;
    };

    const throttledUpdateVisibleRows = throttle(updateVisibleRows, 40);

    const updateScrollTop = function (): void {
        if (currentContextMenu) {
            currentContextMenu.style.top = currentContextMenu.offsetTop - scrollTop + tableContainer.scrollTop + 'px';
        }
        scrollTop = tableContainer.scrollTop;
        scrollLeft = tableContainer.scrollLeft;
    };

    const recalculateVisibleRowCount = function (): void {
        if (lastHeight === tableContainer.clientHeight) {
            // Not recalculating if height didn't change
            return;
        }
        lastHeight = tableContainer.clientHeight;
        visibleRowCount = Math.ceil(tableContainer.clientHeight / rowHeight) + buffer;
        updateVisibleRows();
    };

    const throttledRecalculateVisibleRowCount = throttle(recalculateVisibleRowCount, 20);
    //#endregion

    //#region Right clicks
    let currentContextMenu: HTMLElement | null = null;

    // Column header right click
    let showingColumnHeaderRightClickMenu = false;
    let rightClickedColumnIndex = -1;
    let rightClickColumnMenuElement: HTMLElement;

    const handleColumnRightClick = function (event: MouseEvent, columnIndex: number): void {
        // Logic for what happens when a header is right clicked
        doDefaultContextMenuSetup();
        showingColumnHeaderRightClickMenu = true;
        rightClickedColumnIndex = columnIndex;

        requestAnimationFrame(() => {
            currentContextMenu = rightClickColumnMenuElement; // So scrolling can edit the position, somehow assignment does only work in requestAnimationFrame, maybe bc of delay, could lead to bugs maybe in future, keep note of
            rightClickColumnMenuElement!.style.left = event.clientX + tableContainer.scrollLeft - sidebarWidth + 'px';
            rightClickColumnMenuElement!.style.top = event.clientY + scrollTop + 'px';
        });

        // Click anywhere else to close the menu
        window.addEventListener('click', handleRightClickEnd);
    };

    // Filter context menu
    let showingFilterContextMenu = false;
    let filterColumnIndex = -1;
    let filterContextMenuElement: HTMLElement;

    const handleFilterContextMenu = function (event: MouseEvent, columnIndex: number): void {
        if (event.button !== 0 || $preventClicks) return;

        // Logic for what happens when a filter icon is clicked
        event.stopPropagation();
        doDefaultContextMenuSetup();
        showingFilterContextMenu = true;
        filterColumnIndex = columnIndex;

        requestAnimationFrame(() => {
            currentContextMenu = filterContextMenuElement; // So scrolling can edit the position, somehow assignment does only work in requestAnimationFrame, maybe bc of delay, could lead to bugs maybe in future, keep note of
            filterContextMenuElement!.style.left = event.clientX + tableContainer.scrollLeft - sidebarWidth + 'px';
            filterContextMenuElement!.style.top = event.clientY + scrollTop + 'px';
        });

        // Click anywhere else to close the menu, if not clicked in the menu
        window.addEventListener('mousedown', handleRightClickEnd);
    };

    // Scaling methods

    const doDefaultContextMenuSetup = function (): void {
        preventClicks.set(true);
        disableNonContextMenuEffects();
    };

    const handleRightClickEnd = function (event: MouseEvent): void {
        const generalCleanup = function (): void {
            restoreNonContextMenuEffects();
            setTimeout(() => preventClicks.set(false), 100); // To give time for relevant click events to be prevented
            currentContextMenu = null;
            window.removeEventListener('click', handleRightClickEnd);
            window.removeEventListener('mousedown', handleRightClickEnd);
        };

        // Code specific to each menu
        if (showingColumnHeaderRightClickMenu) {
            showingColumnHeaderRightClickMenu = false;
            rightClickedColumnIndex = -1;
            generalCleanup();
        }
        if (showingFilterContextMenu) {
            if (event.target instanceof HTMLElement) {
                let element = event.target;

                const hasParentWithClass = (elementToScan: HTMLElement, className: string) => {
                    let currentElement: HTMLElement = elementToScan;
                    while (currentElement && currentElement !== document.body) {
                        if (currentElement.classList.contains(className)) {
                            return true;
                        }
                        if (!currentElement.parentElement) {
                            return false;
                        }
                        currentElement = currentElement.parentElement;
                    }
                    return false;
                };

                // Check if the clicked element or any of its parents have the 'contextMenu' class
                if (hasParentWithClass(element, 'contextMenu')) {
                    return;
                }
            }
            showingFilterContextMenu = false;
            filterColumnIndex = -1;
            generalCleanup();
        }
    };
    //#endregion // Right clicks

    //#region Column hiding
    const toggleHideColumn = function (columnIndex: number): void {
        let visible = true;
        table.update(($table) => {
            return {
                ...$table!,
                columns: $table!.columns.map((column, index) => {
                    if (index === columnIndex) {
                        visible = column.hidden;
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
            action: visible ? 'showColumn' : 'hideColumn',
            alias: `${visible ? 'Show' : 'Hide'} column ${$table!.columns[columnIndex].name}`,
            type: 'internal',
            columnName: $table!.columns[columnIndex].name,
        });

        selectedColumnIndexes = selectedColumnIndexes.filter((selectedIndex) => selectedIndex !== columnIndex);
    };
    //#endregion

    //#region Plotting
    const generateTwoColumnTab = function (type: TwoColumnTabTypes) {
        if (selectedColumnIndexes.length !== 2) {
            throw new Error('Two columns must be selected to generate a two column plot');
        }
        const xAxisColumnName = $table!.columns[selectedColumnIndexes[0]].name;
        const yAxisColumnName = $table!.columns[selectedColumnIndexes[1]].name;

        executeExternalHistoryEntry({
            action: type,
            alias: `View ${type === 'linePlot' ? 'Lineplot' : 'Scatterplot'} of ${xAxisColumnName} x ${yAxisColumnName}`,
            type: 'external-visualizing',
            columnNumber: 'two',
            xAxisColumnName,
            yAxisColumnName,
            newTabId: crypto.randomUUID(),
        });
        return;
    };

    const generateOneColumnTab = function (type: OneColumnTabTypes, columnIndex: number) {
        if (type === 'infoPanel') {
            throw new Error('Not implemented yet.');
        }
        const columnName = $table!.columns[columnIndex].name;

        executeExternalHistoryEntry({
            action: type,
            alias: `View ${type === 'histogram' ? 'Histogram' : 'Boxplot'} of ${columnName}`,
            type: 'external-visualizing',
            columnNumber: 'one',
            columnName,
            newTabId: crypto.randomUUID(),
        });
        return;
    };
    //#endregion // Plotting

    //#region Sorting
    const sortByColumn = function (event: MouseEvent, columnIndex: number, direction: PossibleSorts | null) {
        if (event.button !== 0 || $preventClicks) return;

        event.stopPropagation();

        const columnName = $table!.columns[columnIndex].name;

        if (!direction) {
            executeExternalHistoryEntry({
                action: 'voidSortByColumn',
                alias: `Remove sorting by ${columnName}`,
                type: 'external-manipulating',
                columnName,
            });
            return;
        }

        executeExternalHistoryEntry({
            action: 'sortByColumn',
            alias: `Sort by ${columnName} ${direction === 'asc' ? 'ascending' : 'descending'}`,
            type: 'external-manipulating',
            columnName,
            sort: direction,
        });
    };
    //#endregion // Sorting

    //#region Profiling ---
    let fullHeadBackground: HTMLElement;
    let profilingInfo: HTMLElement;

    const toggleProfiling = function (): void {
        if (!$preventClicks) {
            showProfiling.set(!$showProfiling);
            if ($showProfiling) {
                setTimeout(() => {
                    fullHeadBackground.style.height = 2 * rowHeight + profilingInfo.clientHeight + 'px';
                }, 700); // 700ms is the transition time of the profiling info opening/incresing in height
            } else {
                fullHeadBackground.style.height = rowHeight * 2 + 'px';
            }
        }
    };

    const getOptionalProfilingHeight = function (profiling: Profiling): string {
        let profilingItemCount = 0;

        if (profiling.validRatio) profilingItemCount += 1;
        if (profiling.missingRatio) profilingItemCount += 1;

        for (const profilingItem of profiling.other) {
            profilingItemCount += calcProfilingItemValue(profilingItem);
        }

        if (profilingItemCount === maxProfilingItemCount) {
            return '';
        } else {
            return '30px';
        }
    };

    const calcProfilingItemValue = function (profilingItem: ProfilingDetail): number {
        // To edit when Profiling type scales/changes
        if (profilingItem.type === 'image') {
            return Math.floor(profilingImageWidth / imageWidthToHeightRatio / 15); // imageHeight / 15 which is the set line height in profilingInfo
        } else {
            return 1;
        }
    };

    // As store to update on profiling changes
    const hasProfilingErrors = derived(table, ($table) => {
        if (!$table) return false;
        for (const column of $table.columns) {
            if (!column.profiling || column.hidden) continue;
            if (
                column.profiling.missingRatio?.interpretation === 'error' ||
                column.profiling.validRatio?.interpretation === 'error'
            ) {
                return true;
            }
            for (const profilingItem of column.profiling.other) {
                if (profilingItem.type === 'numerical' && profilingItem.interpretation === 'error') {
                    return true;
                }
            }
        }
        return false;
    });

    const getPosiibleColumnFilters = function (columnIndex: number): PossibleColumnFilter[] {
        if (!$table) return [];

        const column = $table.columns[columnIndex];

        if (!column.profiling) return [];

        const possibleColumnFilters: PossibleColumnFilter[] = [];

        if (column.type === 'categorical') {
            const profilingCategories: ProfilingDetailStatistical[] = column.profiling.other.filter(
                (profilingItem: ProfilingDetail) =>
                    profilingItem.type === 'numerical' && profilingItem.interpretation === 'category',
            ) as ProfilingDetailStatistical[];

            // If there is distinct categories in profiling, use those as filter options, else use search string
            if (profilingCategories.length > 0) {
                possibleColumnFilters.push({
                    type: 'specificValue',
                    values: ['-'].concat(profilingCategories.map((profilingItem) => profilingItem.name)),
                });
            } else {
                possibleColumnFilters.push({
                    type: 'searchString',
                });
            }
        } else {
            const colMax = column.values.reduce(
                (acc: number, val: number) => Math.max(acc, val),
                Number.NEGATIVE_INFINITY,
            );
            const colMin = column.values.reduce(
                (acc: number, val: number) => Math.min(acc, val),
                Number.NEGATIVE_INFINITY,
            );

            possibleColumnFilters.push({
                type: 'valueRange',
                min: colMin,
                max: colMax,
            });
        }

        return possibleColumnFilters;
    };
    //#endregion

    //#region Lifecycle
    let interval: NodeJS.Timeout;

    onMount(() => {
        updateScrollTop();
        recalculateVisibleRowCount();
        tableContainer.addEventListener('scroll', throttledUpdateVisibleRows);
        tableContainer.addEventListener('scroll', updateScrollTop);
        window.addEventListener('resize', throttledRecalculateVisibleRowCount);
        interval = setInterval(updateVisibleRows, 500); // To catch cases of fast scroll bar scrolling that leave table blank

        return () => {
            tableContainer.removeEventListener('scroll', throttledUpdateVisibleRows);
            tableContainer.addEventListener('scroll', updateScrollTop);
            window.removeEventListener('resize', throttledRecalculateVisibleRowCount);
            clearInterval(interval);
        };
    });
    //#endregion
</script>

<div bind:this={tableContainer} class="tableContainer">
    {#if !$table}
        <div class="loadingScreen">
            <span class="loading">Loading...</span>
        </div>
    {:else}
        {#if $tableLoading}
            <div class="loadingScreen" style:top="{scrollTop}px" style:left="{scrollLeft}px">
                <span class="loading">Loading...</span>
            </div>
        {/if}
        <div class="contentWrapper" style:height="{numRows * rowHeight}px">
            <table>
                <div
                    bind:this={fullHeadBackground}
                    class="fullHeadBackground"
                    style:top="{scrollTop}px"
                    style:height="{rowHeight * 2}px"
                ></div>
                <!-- Table Headers, mainly Column name and first/last row for indices -->
                <thead style="min-width: {minTableWidth}px; position: relative; top: {scrollTop}px;">
                    <tr class="headerRow" style:height="{rowHeight}px">
                        <th
                            class="borderColumn borderColumnHeader"
                            on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}>#</th
                        >
                        {#each $table.columns as column, index}
                            {#if !column.hidden}
                                <th
                                    bind:this={headerElements[index]}
                                    class:reorderHighlightedLeft={isReorderDragging && dragCurrentIndex === index}
                                    style="width: {$savedColumnWidths.get(
                                        column.name,
                                    )}px; position: relative; {isReorderDragging && dragStartIndex === index
                                        ? 'display: none;'
                                        : ''}"
                                    on:mousedown={(event) => handleColumnInteractionStart(event, index)}
                                    on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                    >{column.name}
                                    <!-- <div
                                        role="none"
                                        class="filterIconWrapper"
                                        on:mousedown={(event) => handleFilterContextMenu(event, index)}
                                    >
                                        <FilterIcon />
                                    </div> -->
                                    <div
                                        class="sortIconsWrapper"
                                        style:display={($savedColumnWidths.get(column.name) ?? 0) > 60
                                            ? 'inline-flex'
                                            : 'none'}
                                    >
                                        <div
                                            class="sortIconWrapper"
                                            role="none"
                                            on:mousedown={(event) =>
                                                sortByColumn(
                                                    event,
                                                    index,
                                                    column.appliedSort === 'desc' ? null : 'desc',
                                                )}
                                        >
                                            <CaretIcon
                                                color={column.appliedSort === 'desc'
                                                    ? 'var(--lightest-color)'
                                                    : 'var(--transparent-medium)'}
                                                hoverColor="var(--transparent-light)"
                                            />
                                        </div>
                                        <div
                                            class="sortIconWrapper rotate"
                                            role="none"
                                            on:mousedown={(event) =>
                                                sortByColumn(event, index, column.appliedSort === 'asc' ? null : 'asc')}
                                        >
                                            <CaretIcon
                                                color={column.appliedSort === 'asc'
                                                    ? 'var(--lightest-color)'
                                                    : 'var(--transparent-medium)'}
                                                hoverColor="var(--transparent-light)"
                                            />
                                        </div>
                                    </div>
                                    <button class="resizeHandle" on:mousedown={(event) => startResizeDrag(event, index)}
                                    ></button>
                                </th>
                            {:else}
                                <th
                                    bind:this={headerElements[index]}
                                    class:reorderHighlightedLeftHiddenColumn={isReorderDragging &&
                                        dragCurrentIndex === index}
                                    class="hiddenColumnHeader"
                                    on:mousedown={(event) =>
                                        event.button === 2 ? handleColumnRightClick(event, index) : null}
                                    on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                >
                                </th>
                            {/if}
                        {/each}
                        <th
                            class="borderColumn borderColumnHeader"
                            class:reorderHighlightedLeft={isReorderDragging &&
                                dragCurrentIndex === $table.columns.length}
                            on:mousemove={(event) => throttledHandleReorderDragOver(event, $table?.columns.length ?? 0)}
                            >#</th
                        >
                    </tr>
                </thead>
                <!-- Profiling info -->
                <tr bind:this={profilingInfo} class="hiddenProfilingWrapper noHover" style:top="{scrollTop}px">
                    <td
                        class="borderColumn borderRight profiling"
                        on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                    ></td>
                    {#each $table.columns as column, index}
                        {#if !column.hidden}
                            <td
                                class="profiling"
                                class:expanded={$showProfiling}
                                style="height: {$showProfiling && column.profiling
                                    ? getOptionalProfilingHeight(column.profiling)
                                    : ''}; {isReorderDragging && dragStartIndex === index ? 'display: none;' : ''}"
                                on:mousedown={(event) =>
                                    event.button === 2 ? handleColumnRightClick(event, index) : null}
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                            >
                                <div class="content" class:expanded={$showProfiling}>
                                    {#if !column.profiling}
                                        <div>Loading ...</div>
                                    {:else}
                                        <ProfilingInfo
                                            profiling={column.profiling}
                                            columnName={column.name}
                                            imageWidth={profilingImageWidth}
                                        />
                                    {/if}
                                </div>
                            </td>
                        {:else}
                            <td
                                class="profiling"
                                class:expanded={$showProfiling}
                                style="height: {$showProfiling && column.profiling
                                    ? getOptionalProfilingHeight(column.profiling)
                                    : ''};"
                                on:mousedown={(event) =>
                                    event.button === 2 ? handleColumnRightClick(event, index) : null}
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                            >
                            </td>{/if}
                    {/each}
                    <td
                        class="borderColumn profiling"
                        on:mousemove={(event) => throttledHandleReorderDragOver(event, $table?.columns.length ?? 0)}
                    ></td>
                </tr>
                <!-- Profiling banner, to toggle profiling info -->
                <tr class="profilingBannerRow" style:height="{rowHeight}px" style:top="{scrollTop}px">
                    <td
                        class="borderColumn borderRight profilingBanner"
                        on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                    ></td>
                    <td
                        class="profilingBanner"
                        on:click={toggleProfiling}
                        on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                        on:mouseup={handleReorderDragEnd}
                    >
                        <div>
                            <span>{$showProfiling ? 'Hide Profiling' : 'Show Profiling'}</span>
                            {#if $hasProfilingErrors}
                                <div class="errorIconWrapper">
                                    <ErrorIcon />
                                </div>
                            {/if}
                            <div class="caretIconWrapper" class:rotate={!$showProfiling}>
                                <CaretIcon />
                            </div>
                        </div>
                    </td>
                    {#each $table.columns as _column, index}
                        {#if index !== $table.columns.length - 1}
                            <td
                                style=" {isReorderDragging && dragStartIndex === index + 1 ? 'display: none;' : ''}"
                                class="profilingBanner"
                                on:click={toggleProfiling}
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, index + 1)}
                            >
                            </td>
                        {/if}
                    {/each}
                    <td
                        class="borderColumn profilingBanner"
                        on:mousemove={(event) => throttledHandleReorderDragOver(event, $table?.columns.length ?? 0)}
                    ></td>
                </tr>
                <!-- Table contents -->
                <tbody style="position: relative; top: {visibleStart * rowHeight}px;">
                    {#each Array(Math.min(visibleEnd, numRows) - visibleStart) as _, i}
                        <tr style:height="{rowHeight}px">
                            <td
                                class="borderColumn cursorPointer"
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                                on:click={(event) => handleRowClick(event, visibleStart + i)}
                                class:selectedColumn={selectedRowIndexes.includes(visibleStart + i)}
                                >{visibleStart + i}</td
                            >
                            {#each $table.columns as column, index}
                                {#if !column.hidden}
                                    <td
                                        style={isReorderDragging && dragStartIndex === index ? 'display: none;' : ''}
                                        on:click={handleMainCellClick}
                                        on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                        class:selectedColumn={selectedColumnIndexes.includes(index) ||
                                            selectedRowIndexes.includes(visibleStart + i)}
                                        >{column.values[visibleStart + i] !== null &&
                                        column.values[visibleStart + i] !== undefined
                                            ? column.values[visibleStart + i]
                                            : ''}</td
                                    >
                                {:else}
                                    <td
                                        on:click={handleMainCellClick}
                                        on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                    >
                                    </td>{/if}
                            {/each}
                            <td
                                class="borderColumn borderColumnEndIndex cursorPointer"
                                on:mousemove={(event) =>
                                    throttledHandleReorderDragOver(event, $table?.columns.length ?? 0)}
                                on:click={(event) => handleRowClick(event, visibleStart + i)}
                                class:selectedColumn={selectedRowIndexes.includes(visibleStart + i)}
                                >{visibleStart + i}</td
                            >
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
    <!-- Main part over -->
    {#if numRows === -1}
        <!-- Just so these classes get compiled -->
        <span class="dragging selectedColumn">No data</span>
    {/if}
    {#if draggedColumnName}
        <th
            bind:this={reorderPrototype}
            style:width="{$savedColumnWidths.get(draggedColumnName)}px"
            style:height="{rowHeight + 2.5}px"
            class="dragging"
            >{draggedColumnName}
        </th>
    {/if}
    <!-- Context menus -->
    {#if showingColumnHeaderRightClickMenu}
        <div class="contextMenu" bind:this={rightClickColumnMenuElement}>
            {#if $table?.columns[rightClickedColumnIndex].hidden ?? false}
                <button class="contextItem" type="button" on:click={() => toggleHideColumn(rightClickedColumnIndex)}
                    >Show Column '{$table?.columns[rightClickedColumnIndex].name}'</button
                >
            {:else}
                <button class="contextItem" type="button" on:click={() => toggleHideColumn(rightClickedColumnIndex)}
                    >Hide Column</button
                >
                <button class="contextItem" type="button" on:click={() => setSelectionToColumn(rightClickedColumnIndex)}
                    >Select Column</button
                >
                {#if selectedColumnIndexes.includes(rightClickedColumnIndex)}
                    <button
                        class="contextItem"
                        type="button"
                        on:click={() => removeColumnFromSelection(rightClickedColumnIndex)}>Deselect Column</button
                    >
                {:else if selectedColumnIndexes.length >= 1}
                    <button
                        class="contextItem"
                        type="button"
                        on:click={() => addColumnToSelection(rightClickedColumnIndex)}>Add To Selection</button
                    >
                {/if}
                {#if selectedColumnIndexes.length === 2}
                    <button class="contextItem" type="button" on:click={() => generateTwoColumnTab('scatterPlot')}
                        >Plot Scatterplot</button
                    >
                    <button class="contextItem" type="button" on:click={() => generateTwoColumnTab('linePlot')}
                        >Plot Lineplot</button
                    >
                {/if}
                <button
                    class="contextItem"
                    type="button"
                    on:click={() => generateOneColumnTab('histogram', rightClickedColumnIndex)}>Plot Histogram</button
                >
                <button
                    class="contextItem"
                    type="button"
                    on:click={() => generateOneColumnTab('boxPlot', rightClickedColumnIndex)}
                >
                    Plot Boxplot</button
                >
            {/if}
        </div>
    {/if}
    {#if showingFilterContextMenu}
        <div class="contextMenu" bind:this={filterContextMenuElement}>
            <ColumnFilters possibleFilters={getPosiibleColumnFilters(filterColumnIndex)} />
        </div>
    {/if}
</div>

<style>
    .loadingScreen {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        position: absolute;
        background-color: var(--transparent-medium);
        z-index: 1000;
    }

    .loadingScreen .loading {
        color: var(--medium-color);
        font-weight: 600;
        font-size: 2.5rem;
        font-family: monospace;
    }

    .tableContainer {
        overflow-y: auto;
        height: 100%;
        position: relative;
    }

    .contentWrapper {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background-color: var(--medium-light-color);
        overflow: visible;
    }

    .fullHeadBackground {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        background-color: white;
        z-index: 2;
    }

    table {
        table-layout: fixed;
        width: 100.1%; /* To prevent lagging on vert scroll */
        background-color: var(--medium-light-color);
        overflow-x: scroll;
        position: relative;
    }

    .headerRow {
        position: relative;
        top: 0;
        z-index: 500;
    }

    thead tr:hover {
        background-color: transparent;
    }
    th {
        border-left: 3px solid var(--lightest-color);
        border-right: 2px solid var(--lightest-color);
        border-bottom: 3px solid var(--lightest-color);
        border-top: 3px solid var(--lightest-color);
        background-color: var(--primary-color);
        color: var(--lightest-color);
        font-weight: 500;
        font-size: 1.1rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: none;
        cursor: pointer;
    }

    th:hover {
        color: var(--medium-light-color);
    }

    th,
    td {
        white-space: nowrap;
        overflow: hidden;
        border-right: 2px solid var(--medium-light-color);
    }
    tbody {
        border-left: 3px solid var(--lightest-color);
        z-index: 1;
    }
    tr {
        border-bottom: 2px solid var(--medium-light-color);
        background-color: var(--lightest-color);
    }
    tr:hover {
        background-color: var(--primary-color-desaturated);
    }

    .selectedColumn {
        background-color: var(--primary-color-desaturated);
    }

    .noHover:hover {
        background-color: var(--medium-light-color) !important;
    }

    .resizeHandle {
        cursor: ew-resize;
        width: 3px; /* Adjust as needed */
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
    }

    .borderRight {
        border-right: 2px solid var(--lightest-color);
    }
    .hiddenProfilingWrapper {
        position: relative !important;
        z-index: 10;
    }

    .borderColumn {
        padding: 5px 5px 5px 5px;
        width: 45px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.8rem;
        border-left: 3px solid var(--lightest-color) !important;
    }

    .borderColumnEndIndex {
        border-left: 2px solid var(--medium-light-color) !important;
        text-align: right;
    }

    .borderColumnHeader {
        font-size: 1.3rem;
        text-align: center;
        vertical-align: middle;
    }

    .rotate {
        transform: rotate(180deg);
    }

    .caretIconWrapper {
        display: inline-flex;
        justify-content: center;
        height: 100%;
        width: 20px;
        margin-left: 5px;
    }

    .errorIconWrapper {
        display: inline-flex;
        justify-content: center;
        height: 100%;
        width: 13px;
        margin-left: 2px;
    }

    .filterIconWrapper {
        display: inline-flex;
        justify-content: center;
        height: 100%;
        width: 13px;
        margin-left: 2px;
        transform: translateY(2px);
    }

    .sortIconsWrapper {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        height: 66%;
        position: absolute;
        right: 0px;
        top: 17%;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, var(--primary-color) 28%);
        padding-left: 11px;
        padding-right: 10px;
    }

    .sortIconWrapper {
        display: inline-flex;
        justify-content: center;
        height: 100%;
        width: 11px;
    }

    .reorderHighlightedLeft {
        background: linear-gradient(
            to left,
            var(--primary-color) 0%,
            var(--primary-color) calc(100% - 4px),
            var(--lightest-color) calc(100% - 4px),
            var(--lightest-color) 100%
        );
    }

    .reorderHighlightedLeftHiddenColumn {
        background: linear-gradient(
            to left,
            var(--medium-light-color) 0%,
            var(--medium-light-color) calc(100% - 4px),
            var(--dark-color) calc(100% - 2px),
            var(--dark-color) 100%
        );
    }

    .dragging {
        position: absolute !important;
        pointer-events: none; /* Make it non-interactive */
        z-index: 1000; /* Ensure it's on top */
        border: 3px solid var(--medium-light-color);
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: center;
        padding: 12px 8px;
        text-overflow: ellipsis;
    }

    .contextMenu {
        position: absolute;
        border: 2px solid var(--medium-light-color);
        background-color: var(--lightest-color);
        z-index: 1000;
        padding: 0;
        color: var(--darkest-color);
        display: flex;
        flex-direction: column;
        width: max-content;
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

    .profilingBannerRow {
        position: relative;
        z-index: 10;
        border-top: 2px solid var(--lightest-color);
    }

    .profilingBannerRow * {
        border-left: none !important;
        border-right: none !important;
        overflow: visible;
    }

    .profiling {
        padding: 0;
        border-right: 2px solid var(--lightest-color);
        border-left: 3px solid var(--lightest-color);
        background-color: var(--medium-light-color) !important;
    }

    .profiling.expanded {
        padding: 10px 2px 10px 12px;
    }

    .profiling .content {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: none;
        height: 100%;
    }

    .profiling .content.expanded {
        overflow-y: auto;
        max-height: 500px;
        opacity: 1;
        transition:
            max-height 0.7s ease,
            opacity 0.5s ease;
    }

    .profilingBanner {
        height: 35px;
        width: 100%;
        background-color: var(--medium-light-color);
        font-size: 1.1rem;
        border-top: 2px solid var(--lightest-color);
        border-left: 3px solid var(--lightest-color);
        border-bottom: 3px solid var(--lightest-color);
        user-select: none;
        padding-left: 0;
        z-index: 10;
    }

    .profilingBanner:hover {
        cursor: pointer;
    }

    .hiddenColumnHeader {
        background-color: var(--medium-light-color);
        width: 15px;
        padding: 0px;
        cursor: default;
    }
</style>
