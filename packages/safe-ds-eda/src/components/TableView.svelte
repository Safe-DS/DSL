<script lang="ts">
    import { onMount } from 'svelte';
    import { throttle } from 'lodash';
    import { currentState, preventClicks } from '../webviewState';
    import CaretIcon from '../icons/Caret.svelte';
    import ErrorIcon from '../icons/Error.svelte';
    import FilterIcon from '../icons/Filter.svelte';
    import type {
        PossibleColumnFilter,
        Profiling,
        ProfilingDetail,
        ProfilingDetailStatistical,
    } from '../../types/state';
    import ProfilingInfo from './profiling/ProfilingInfo.svelte';
    import ColumnFilters from './column-filters/ColumnFilters.svelte';
    import { derived } from 'svelte/store';

    export let sidebarWidth: number;

    $: if (sidebarWidth && tableContainer) {
        updateTableSpace();
    }

    let showProfiling = false;
    let minTableWidth = 0;
    let numRows = 0;
    const borderColumnWidth = 45; // Set in CSS, change here if changes in css
    const headerElements: HTMLElement[] = [];
    let maxProfilingItemCount = 0;
    const savedColumnWidths: Map<string, number> = new Map();

    $: {
        if ($currentState.table) {
            minTableWidth = 0;
            numRows = 0;
            maxProfilingItemCount = 0;
            $currentState.table.columns.forEach((column) => {
                if (column[1].values.length > numRows) {
                    numRows = column[1].values.length;
                }
                minTableWidth += 100;

                // Find which is the talles profiling type present in this table to adjust which profilings to give small height to, to have them adhere to good spacing
                // (cannot give to tallest one, as then it will all be small)
                if (column[1].profiling.top.length > 0 || column[1].profiling.bottom.length > 0) {
                    let profilingItemCount = 0;
                    for (const profilingItem of column[1].profiling.top.concat(column[1].profiling.bottom)) {
                        profilingItemCount += calcProfilingItemValue(profilingItem);
                    }
                    if (profilingItemCount > maxProfilingItemCount) {
                        maxProfilingItemCount = profilingItemCount;
                    }
                }
            });
        }
    }

    const getColumnWidth = function (columnName: string): number {
        if (savedColumnWidths.has(columnName)) {
            return savedColumnWidths.get(columnName)!;
        }
        const baseWidth = 35; // Minimum width
        const scale = 55;

        // Use the logarithm of the character count, and scale it
        const width = baseWidth + Math.log(columnName.length + 1) * scale;

        // Save the width for future use
        savedColumnWidths.set(columnName, width);

        return width;
    };

    const getColumnWidthFreshNumber = function (columnName: string): number {
        const baseWidth = 35; // Minimum width
        const scale = 55;

        // Use the logarithm of the character count, and scale it
        return baseWidth + Math.log(columnName.length + 1) * scale;
    };

    const handleMainCellClick = function (): void {
        if (!$preventClicks) {
            selectedColumnIndexes = [];
            selectedRowIndexes = [];
        }
    };

    // --- Column resizing ---
    let isResizeDragging = false;
    let startWidth: number;
    let startX: number;
    let targetColumn: HTMLElement;
    const resizeWidthMap: Map<string, number> = new Map();

    const doResizeDrag = function (event: MouseEvent): void {
        if (isResizeDragging && targetColumn) {
            const currentWidth = startWidth + event.clientX - startX;
            requestAnimationFrame(() => {
                targetColumn.style.width = `${currentWidth}px`;
                savedColumnWidths.set(targetColumn.innerText.trim(), currentWidth);
            });
            resizeWidthMap.set(targetColumn.innerText.trim(), currentWidth);
            updateTableSpace();
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
        document.addEventListener('mousemove', throttledDoResizeDrag);
        document.addEventListener('mouseup', stopResizeDrag);
    };

    const stopResizeDrag = function (): void {
        isResizeDragging = false;
        document.removeEventListener('mousemove', throttledDoResizeDrag);
        document.removeEventListener('mouseup', stopResizeDrag);
    };

    // --- Column reordering ---
    let isReorderDragging = false;
    let dragStartIndex: number | null = null;
    let dragCurrentIndex: number | null = null;
    let draggedColumn: HTMLElement | null = null;
    let savedColumnWidthBeforeReorder = 0;
    let preventResizeTableSpaceUpdate = false;
    let holdTimeout: NodeJS.Timeout;
    let isClick = true; // Flag to distinguish between click and hold

    let currentMouseUpHandler: ((event: MouseEvent) => void) | null = null; // For being able to properly remove the mouseup listener when col clicked and not held

    const handleReorderDragOver = function (event: MouseEvent, columnIndex: number): void {
        if (isReorderDragging && dragStartIndex !== null && draggedColumn) {
            dragCurrentIndex = columnIndex;
            requestAnimationFrame(() => {
                draggedColumn!.style.left = event.clientX + tableContainer.scrollLeft - sidebarWidth + 'px';
                draggedColumn!.style.top = event.clientY + 'px';
            });
        }
    };

    const throttledHandleReorderDragOver = throttle(handleReorderDragOver, 30);

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

        holdTimeout = setTimeout(() => {
            isClick = false; // If timeout completes, it's a hold
            document.addEventListener('mouseup', handleReorderDragEnd);
            savedColumnWidthBeforeReorder = savedColumnWidths.get(headerElements[columnIndex].innerText.trim())!;
            preventResizeTableSpaceUpdate = true; // To not add the new space to current dragged column
            isReorderDragging = true;
            dragStartIndex = columnIndex;
            dragCurrentIndex = columnIndex;
            draggedColumn = headerElements[columnIndex];
            draggedColumn.classList.add('dragging');
            savedColumnWidths.set(draggedColumn.innerText.trim(), 0);
            updateTableSpace();
            selectedColumnIndexes = []; // Clear so reordering doesn't interfere with selection
        }, 300); // milliseconds delay for hold detection

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

    const handleReorderDragEnd = function (): void {
        if (isReorderDragging && dragStartIndex !== null && dragCurrentIndex !== null) {
            preventResizeTableSpaceUpdate = false;
            if (draggedColumn) {
                savedColumnWidths.set(draggedColumn.innerText.trim(), savedColumnWidthBeforeReorder);
                draggedColumn.style.left = '';
                draggedColumn.style.top = '';
                draggedColumn.classList.remove('dragging');
                draggedColumn = null;
            }
            // Reset the z-index of all headers
            headerElements.forEach((header) => {
                header.style.zIndex = ''; // Reset to default
            });
            if (dragCurrentIndex > dragStartIndex) {
                dragCurrentIndex -= 1;
            }
            currentState.update(($currentState) => {
                const newColumns = [...$currentState.table!.columns];
                const movedItem = newColumns.splice(dragStartIndex!, 1)[0];
                newColumns.splice(dragCurrentIndex!, 0, movedItem);
                // In newColumns also set the number of each column array to their new index
                newColumns.forEach((column, index) => {
                    column[0] = index;
                });
                return { ...$currentState, table: { ...$currentState.table!, columns: newColumns } };
            });
            document.removeEventListener('mouseup', handleReorderDragEnd);
            isReorderDragging = false;
            dragStartIndex = null;
            dragCurrentIndex = null;
            updateTableSpace();
            updateTableSpace(); // Have to somehow call twice, first time it thinks the window is around 10px bigger than it is
        }
    };

    // --- Column selecting ---
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

    // --- Row selecting ---
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

    // --- Scroll loading ---
    let tableContainer: HTMLElement; // Reference to the table container
    const rowHeight = 33; // Adjust based on your row height
    const buffer = 25; // Number of rows to render outside the viewport
    let visibleStart = 0;
    let visibleEnd = 0;
    let visibleRowCount = 10;
    let scrollTop = 0;
    let lastHeight = 0;

    const updateVisibleRows = function (): void {
        visibleStart = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
        visibleEnd = visibleStart + visibleRowCount;
    };

    const throttledUpdateVisibleRows = throttle(updateVisibleRows, 40);

    const updateScrollTop = function (): void {
        if (currentContextMenu) {
            currentContextMenu.style.top = currentContextMenu.offsetTop - scrollTop + tableContainer.scrollTop + 'px';
        }
        scrollTop = tableContainer.scrollTop;
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

    // --- Min Table with ---
    const throttledUpdateTableSpace = throttle(() => {
        if (!preventResizeTableSpaceUpdate) {
            updateTableSpace();
        }
    }, 100);

    const updateTableSpace = function (): void {
        if (isResizeDragging) return; // Don't update while resizing

        const newPossibleSpace = tableContainer.clientWidth;

        const utilitySpace = borderColumnWidth * 2; // 2 border columns
        let beforeWidth = utilitySpace;
        for (const width of savedColumnWidths.values()) {
            if (width !== 0) {
                beforeWidth += width;
            }
        }

        console.log('newPossibleSpace', newPossibleSpace);
        console.log('beforeWidth', beforeWidth);
        console.log(headerElements.map((column) => column.innerText.trim()));

        if (newPossibleSpace > beforeWidth) {
            // Extend all column widths proportionally with new space
            for (const column of headerElements) {
                const columnName = column.innerText.trim();
                const newWidth = column.offsetWidth + (newPossibleSpace - beforeWidth) / headerElements.length;
                column.style.width = newWidth + 'px';
                savedColumnWidths.set(columnName, newWidth);
            }
        } else {
            // Shrink all column widths proportionally with new space if not below minimum width dedicated by a: width by header text or b: with by manual resize
            for (const column of headerElements) {
                const columnName = column.innerText.trim();
                const newWidth = column.offsetWidth - (beforeWidth - newPossibleSpace) / headerElements.length;
                if (resizeWidthMap.has(columnName)) {
                    // User resized manually, so don't shrink below that
                    if (resizeWidthMap.get(columnName)! <= newWidth) {
                        column.style.width = newWidth + 'px';
                        savedColumnWidths.set(columnName, newWidth);
                    } else if (column.offsetWidth !== resizeWidthMap.get(columnName)!) {
                        // To update even on fast resize
                        column.style.width = resizeWidthMap.get(columnName)! + 'px';
                        savedColumnWidths.set(columnName, resizeWidthMap.get(columnName)!);
                    }
                } else {
                    // Use the minimum width dedicated by the header text
                    const minWidth = getColumnWidthFreshNumber(columnName);
                    if (minWidth <= newWidth) {
                        column.style.width = newWidth + 'px';
                        savedColumnWidths.set(columnName, newWidth);
                    } else if (column.clientWidth !== minWidth) {
                        // To update even on fast resize
                        column.style.width = minWidth + 'px';
                        savedColumnWidths.set(columnName, minWidth);
                    }
                }
            }
        }
    };

    $: if (headerElements.length > 0) {
        // Is svelte reactive but so far only runs once which is what we want, consideration to have loop in onMount that waits until headerElements is filled and then runs this code once
        lastHeight = tableContainer.clientHeight;
        updateTableSpace();
    }

    // --- Right clicks ---
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

                const hasParentWithClass = (element: HTMLElement, className: string) => {
                    while (element && element !== document.body) {
                        if (element.classList.contains(className)) {
                            return true;
                        }
                        if (!element.parentElement) {
                            return false;
                        }
                        element = element.parentElement;
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

    const originalHoverStyles = new Map<CSSStyleRule, string>();
    const originalCursorStyles = new Map<CSSStyleRule, string>();

    const disableNonContextMenuEffects = function () {
        const stylesheets = document.styleSheets;

        for (let i = 0; i < stylesheets.length; i++) {
            const rules = stylesheets[i].cssRules;
            const ownerNode = stylesheets[i].ownerNode;
            if (
                !(ownerNode instanceof Element) ||
                (ownerNode instanceof Element && ownerNode.id && !ownerNode.id.includes('svelte'))
            ) {
                // We only care for stylesheets that are svlete generated
                continue;
            }

            for (let j = 0; j < rules.length; j++) {
                // Remove all hover styles and cursor pointer styles from non context menu elements
                const rule = rules[j] as CSSStyleRule;
                if (rule.selectorText?.includes(':hover') && !rule.selectorText?.includes('contextMenu')) {
                    // Store the original hover style
                    originalHoverStyles.set(rule, rule.style.cssText);
                    // Disable the hover style
                    rule.style.cssText = '';
                }
                if (rule.style?.cursor === 'pointer' && !rule.selectorText?.includes('contextMenu')) {
                    // Store the original pointer style
                    originalCursorStyles.set(rule, rule.style.cssText);
                    // Disable the cursor pointer
                    rule.style.cursor = 'auto';
                }
            }
        }
    };

    const restoreNonContextMenuEffects = function () {
        originalHoverStyles.forEach((style, rule) => {
            rule.style.cssText = style;
        });
        originalHoverStyles.clear();

        originalCursorStyles.forEach((style, rule) => {
            rule.style.cssText = style;
        });
        originalCursorStyles.clear();
    };

    // --- Profiling ---
    const toggleProfiling = function (): void {
        if (!$preventClicks) showProfiling = !showProfiling;
    };

    const getOptionalProfilingHeight = function (profiling: Profiling): string {
        let profilingItemCount = 0;

        for (const profilingItem of profiling.top.concat(profiling.bottom)) {
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
            return 3; // Bigger than normal text line, should be set to 3x line height
        } else {
            return 1;
        }
    };

    // As store to update on profiling changes
    const hasProfilingErrors = derived(currentState, ($currentState) => {
        if (!$currentState.table) return false;
        for (const column of $currentState.table!.columns) {
            for (const profilingItem of column[1].profiling.top.concat(column[1].profiling.bottom)) {
                if (profilingItem.type === 'numerical' && profilingItem.interpretation === 'error') {
                    return true;
                }
            }
        }
        return false;
    });

    const getPosiibleColumnFilters = function (columnIndex: number): PossibleColumnFilter[] {
        if (!$currentState.table) return [];

        const column = $currentState.table.columns[columnIndex][1];

        const possibleColumnFilters: PossibleColumnFilter[] = [];

        if (column.type === 'categorical') {
            const profilingCategories: ProfilingDetailStatistical[] = column.profiling.bottom
                .concat(column.profiling.top)
                .filter(
                    (profilingItem) =>
                        profilingItem.type === 'numerical' && profilingItem.interpretation === 'category',
                ) as ProfilingDetailStatistical[];

            // If there is distinct categories in profiling, use those as filter options, else use search string
            if (profilingCategories.length > 0) {
                possibleColumnFilters.push({
                    type: 'specificValue',
                    values: ['-'].concat(profilingCategories.map((profilingItem) => profilingItem.name)),
                    columnName: column.name,
                });
            } else {
                possibleColumnFilters.push({
                    type: 'searchString',
                    columnName: column.name,
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
                columnName: column.name,
            });
        }

        return possibleColumnFilters;
    };

    // --- Lifecycle ---
    let interval: NodeJS.Timeout;

    onMount(() => {
        updateScrollTop();
        recalculateVisibleRowCount();
        tableContainer.addEventListener('scroll', throttledUpdateVisibleRows);
        tableContainer.addEventListener('scroll', updateScrollTop);
        window.addEventListener('resize', throttledRecalculateVisibleRowCount);
        window.addEventListener('resize', throttledUpdateTableSpace);
        interval = setInterval(updateVisibleRows, 500); // To catch cases of fast scroll bar scrolling that leave table blank

        return () => {
            tableContainer.removeEventListener('scroll', throttledUpdateVisibleRows);
            tableContainer.addEventListener('scroll', updateScrollTop);
            window.removeEventListener('resize', throttledRecalculateVisibleRowCount);
            window.removeEventListener('resize', throttledUpdateTableSpace);
            clearInterval(interval);
        };
    });
</script>

<div bind:this={tableContainer} class="tableContainer">
    {#if !$currentState.table}
        <span>Loading ...</span>
    {:else}
        <div class="contentWrapper" style="height: {numRows * rowHeight}px;">
            <table>
                <!-- Table Headers, mainly Column name and first/last row for indices -->
                <thead style="min-width: {minTableWidth}px; position: relative; top: {scrollTop}px;">
                    <tr class="headerRow" style="height: {rowHeight}px;">
                        <th
                            class="borderColumn borderColumnHeader"
                            on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}>#</th
                        >
                        {#each $currentState.table.columns as column, index}
                            <th
                                bind:this={headerElements[index]}
                                class:reorderHighlightedLeft={isReorderDragging && dragCurrentIndex === index}
                                style="width: {getColumnWidth(column[1].name)}px; position: relative;"
                                on:mousedown={(event) => handleColumnInteractionStart(event, index)}
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                >{column[1].name}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <div
                                    class="filterIconWrapper"
                                    on:mousedown={(event) => handleFilterContextMenu(event, index)}
                                >
                                    <FilterIcon />
                                </div>
                                <div class="sortIconsWrapper">
                                    <div class="sortIconWrapper">
                                        <CaretIcon color="var(--transparent)" />
                                    </div>
                                    <div class="sortIconWrapper rotate">
                                        <CaretIcon color="var(--transparent)" />
                                    </div>
                                </div>
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <div class="resizeHandle" on:mousedown={(event) => startResizeDrag(event, index)}></div>
                            </th>
                        {/each}
                        <th
                            class="borderColumn borderColumnHeader"
                            class:reorderHighlightedLeft={isReorderDragging &&
                                dragCurrentIndex === $currentState.table.columns.length}
                            on:mousemove={(event) =>
                                throttledHandleReorderDragOver(event, $currentState.table?.columns.length ?? 0)}>#</th
                        >
                    </tr>
                </thead>
                <!-- Profiling info -->
                <tr class="hiddenProfilingWrapper noHover" style="top: {scrollTop}px;">
                    <td
                        class="borderColumn borderRight profiling"
                        on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                    ></td>
                    {#each $currentState.table.columns as column, index}
                        <td
                            class="profiling"
                            class:expanded={showProfiling}
                            style="height: {showProfiling &&
                            (column[1].profiling.top.length !== 0 || column[1].profiling.bottom.length !== 0)
                                ? getOptionalProfilingHeight(column[1].profiling)
                                : ''};"
                            on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                        >
                            <div class="content" class:expanded={showProfiling}>
                                {#if column[1].profiling.top.length === 0 && column[1].profiling.bottom.length === 0}
                                    <div>Loading ...</div>
                                {:else}
                                    <ProfilingInfo profiling={column[1].profiling} />
                                {/if}
                            </div>
                        </td>
                    {/each}
                    <td
                        class="borderColumn profiling"
                        on:mousemove={(event) =>
                            throttledHandleReorderDragOver(event, $currentState.table?.columns.length ?? 0)}
                    ></td>
                </tr>
                <!-- Profiling banner, to toggle profiling info -->
                <tr class="profilingBannerRow" style="height: {rowHeight}px; top: {scrollTop}px;">
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
                            <span>{showProfiling ? 'Hide Profiling' : 'Show Profiling'}</span>
                            {#if $hasProfilingErrors}
                                <div class="errorIconWrapper">
                                    <ErrorIcon />
                                </div>
                            {/if}
                            <div class="caretIconWrapper" class:rotate={!showProfiling}>
                                <CaretIcon />
                            </div>
                        </div>
                    </td>
                    {#each $currentState.table.columns as _column, i}
                        {#if i !== $currentState.table.columns.length - 1}
                            <td
                                class="profilingBanner"
                                on:click={toggleProfiling}
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, i + 1)}
                            >
                            </td>
                        {/if}
                    {/each}
                    <td
                        class="borderColumn profilingBanner"
                        on:mousemove={(event) =>
                            throttledHandleReorderDragOver(event, $currentState.table?.columns.length ?? 0)}
                    ></td>
                </tr>
                <!-- Table contents -->
                <tbody style="position: relative; top: {visibleStart * rowHeight}px;">
                    {#each Array(Math.min(visibleEnd, numRows) - visibleStart) as _, i}
                        <tr style="height: {rowHeight}px;">
                            <td
                                class="borderColumn cursorPointer"
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                                on:click={(event) => handleRowClick(event, visibleStart + i)}
                                class:selectedColumn={selectedRowIndexes.includes(visibleStart + i)}
                                >{visibleStart + i}</td
                            >
                            {#each $currentState.table.columns as column, index}
                                <td
                                    on:click={handleMainCellClick}
                                    on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                    class:selectedColumn={selectedColumnIndexes.includes(index) ||
                                        selectedRowIndexes.includes(visibleStart + i)}
                                    >{column[1].values[visibleStart + i] !== null &&
                                    column[1].values[visibleStart + i] !== undefined
                                        ? column[1].values[visibleStart + i]
                                        : ''}</td
                                >
                            {/each}
                            <td
                                class="borderColumn borderColumnEndIndex cursorPointer"
                                on:mousemove={(event) =>
                                    throttledHandleReorderDragOver(event, $currentState.table?.columns.length ?? 0)}
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
    <!-- Context menus -->
    {#if showingColumnHeaderRightClickMenu}
        <div class="contextMenu" bind:this={rightClickColumnMenuElement}>
            {#if selectedColumnIndexes.includes(rightClickedColumnIndex)}
                <button
                    class="contextItem"
                    type="button"
                    on:click={() => removeColumnFromSelection(rightClickedColumnIndex)}>Deselect Column</button
                >
            {:else}
                {#if selectedColumnIndexes.length >= 1}
                    <button
                        class="contextItem"
                        type="button"
                        on:click={() => addColumnToSelection(rightClickedColumnIndex)}>Add To Selection</button
                    >
                {/if}
                <button class="contextItem" type="button" on:click={() => setSelectionToColumn(rightClickedColumnIndex)}
                    >Select Column</button
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
    .tableContainer {
        overflow-y: auto;
        height: 100%; /* Adjust based on your layout */
        position: relative; /* Needed for absolute positioning inside */
    }

    .contentWrapper {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background-color: var(--bg-dark);
    }

    table {
        table-layout: fixed;
        width: 100%;
        background-color: var(--bg-dark);
    }

    .headerRow {
        position: relative;
        top: 0;
        z-index: 1000;
    }
    thead tr:hover {
        background-color: transparent;
    }
    th {
        border-left: 3px solid var(--bg-bright);
        border-right: 2px solid var(--bg-bright);
        border-bottom: 3px solid var(--bg-bright);
        border-top: 3px solid var(--bg-bright);
        background-color: var(--primary-color);
        color: var(--bg-bright);
        font-weight: 500;
        font-size: 1.1rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: none;
        cursor: pointer;
    }

    th,
    td {
        white-space: nowrap;
        overflow: hidden;
        border-right: 2px solid var(--bg-dark);
    }
    tbody {
        border-left: 3px solid var(--bg-bright);
    }
    table tr {
        border-bottom: 2px solid var(--bg-dark);
        background-color: var(--bg-bright);
    }
    table tr:hover {
        background-color: var(--primary-color-desaturated);
    }

    .selectedColumn {
        background-color: var(--primary-color-desaturated);
    }

    .noHover:hover {
        background-color: var(--bg-dark) !important;
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
        border-right: 2px solid var(--bg-bright);
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
        border-left: 3px solid var(--bg-bright) !important;
    }

    .borderColumnEndIndex {
        border-left: 2px solid var(--bg-dark) !important;
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
        background: linear-gradient(to left, #036ed1 0%, #036ed1 calc(100% - 4px), white calc(100% - 4px), white 100%);
    }

    .dragging {
        position: absolute !important;
        pointer-events: none; /* Make it non-interactive */
        z-index: 1000; /* Ensure it's on top */
        border: 3px solid var(--bg-dark);
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
    }

    .contextMenu button {
        padding: 5px 15px;
        cursor: pointer;
        background-color: var(--bg-bright);
        color: var(--font-dark);
        text-align: left;
    }

    .contextMenu button:hover {
        background-color: var(--primary-color);
        color: var(--font-bright);
    }

    .profilingBannerRow {
        position: relative;
        z-index: 10;
        border-top: 2px solid var(--bg-bright);
    }

    .profilingBannerRow * {
        border-left: none !important;
        border-right: none !important;
        overflow: visible;
    }

    .profiling {
        padding: 0;
        border-right: 2px solid var(--bg-bright);
        border-left: 3px solid var(--bg-bright);
        background-color: var(--bg-dark) !important;
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
        overflow-y: scroll;
        max-height: 500px;
        opacity: 1;
        transition:
            max-height 0.7s ease,
            opacity 0.5s ease;
    }

    .profilingBanner {
        height: 35px;
        width: 100%;
        background-color: var(--bg-dark);
        font-size: 1.1rem;
        border-top: 2px solid var(--bg-bright);
        border-left: 3px solid var(--bg-bright);
        border-bottom: 3px solid var(--bg-bright);
        user-select: none;
        padding-left: 0;
        z-index: 10;
    }

    .profilingBanner:hover {
        cursor: pointer;
    }
</style>
