<script lang="ts">
    import { onMount } from 'svelte';
    import { throttle } from 'lodash';
    import { currentState, preventClicks } from '../webviewState';
    import CaretIcon from '../icons/caret.svelte';

    export let sidebarWidth: number;

    $: if (sidebarWidth && tableContainer) {
        updateTableSpace();
    }

    let showProfiling = false;
    let minTableWidth = 0;
    let headerElements: HTMLElement[] = [];
    let savedColumnWidths: Map<string, number> = new Map();

    let numRows = 0;
    $: {
        let minTableWidth = 0;
        if ($currentState.table) {
            numRows = 0;
            $currentState.table.columns.forEach((column) => {
                if (column[1].values.length > numRows) {
                    numRows = column[1].values.length;
                }
                minTableWidth += 100;
            });
            minTableWidth = minTableWidth;
        }
    }

    function getColumnWidth(columnName: string): number {
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
    }

    function getColumnWidthFreshNumber(columnName: string): number {
        const baseWidth = 35; // Minimum width
        const scale = 55;

        // Use the logarithm of the character count, and scale it
        const width = baseWidth + Math.log(columnName.length + 1) * scale;

        return width;
    }

    // --- Column resizing ---
    let isResizeDragging = false;
    let startWidth: number;
    let startX: number;
    let targetColumn: HTMLElement;
    let resizeWidthMap: Map<string, number> = new Map();

    const throttledDoResizeDrag = throttle(doResizeDrag, 30);

    function startResizeDrag(event: MouseEvent, columnIndex: number): void {
        event.stopPropagation();
        clickOnColumn = true;
        const columnElement = headerElements[columnIndex];
        isResizeDragging = true;
        startX = event.clientX;
        startWidth = columnElement.offsetWidth;
        targetColumn = columnElement;
        document.addEventListener('mousemove', throttledDoResizeDrag);
        document.addEventListener('mouseup', stopResizeDrag);
    }

    function doResizeDrag(event: MouseEvent): void {
        if (isResizeDragging && targetColumn) {
            const currentWidth = startWidth + event.clientX - startX;
            requestAnimationFrame(() => {
                targetColumn.style.width = `${currentWidth}px`;
                savedColumnWidths.set(targetColumn.innerText, currentWidth);
            });
            resizeWidthMap.set(targetColumn.innerText, currentWidth);
            updateTableSpace();
        }
    }

    function stopResizeDrag(): void {
        isResizeDragging = false;
        document.removeEventListener('mousemove', throttledDoResizeDrag);
        document.removeEventListener('mouseup', stopResizeDrag);
    }

    // --- Column reordering ---
    let isReorderDragging = false;
    let dragStartIndex: number | null = null;
    let dragCurrentIndex: number | null = null;
    let draggedColumn: HTMLElement | null = null;
    let savedColumnWidthBeforeReorder = 0;
    let preventResizeTableSpaceUpdate = false;
    let holdTimeout: NodeJS.Timeout;
    let isClick = true; // Flag to distinguish between click and hold
    let clickOnColumn = false; // For global window click clear of selection

    let currentMouseUpHandler: ((event: MouseEvent) => void) | null = null; // For being able to properly remove the mouseup listener when col clicked and not held

    const throttledHandleReorderDragOver = throttle(handleReorderDragOver, 30);

    function handleColumnInteractionStart(event: MouseEvent, columnIndex: number): void {
        // Check if the left or right mouse button was pressed
        if (event.button !== 0 && event.button !== 2) return;

        clickOnColumn = true; // For global window click clear of selection

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
            savedColumnWidthBeforeReorder = savedColumnWidths.get(headerElements[columnIndex].innerText)!;
            preventResizeTableSpaceUpdate = true; // To not add the new space to current dragged column
            isReorderDragging = true;
            dragStartIndex = columnIndex;
            dragCurrentIndex = columnIndex;
            draggedColumn = headerElements[columnIndex];
            draggedColumn.classList.add('dragging');
            savedColumnWidths.set(draggedColumn.innerText, 0);
            updateTableSpace();

            // Not needed anymore apparently
            // // Lower the z-index of all other headers
            // headerElements.forEach((header, index) => {
            //     if (index !== columnIndex) {
            //         header.style.zIndex = '0'; // Or any value lower than the dragging header
            //     }
            // });
            selectedColumnIndexes = []; // Clear so reordering doesn't interfere with selection
        }, 300); // milliseconds delay for hold detection

        // Define the handler function
        currentMouseUpHandler = (event: MouseEvent) => {
            handleColumnMouseUp(event, columnIndex);
        };

        // Add mouseup listener to clear the timeout if the button is released
        document.addEventListener('mouseup', currentMouseUpHandler);
    }

    function handleColumnMouseUp(event: MouseEvent, columnIndex: number): void {
        clearTimeout(holdTimeout);
        if (currentMouseUpHandler) document.removeEventListener('mouseup', currentMouseUpHandler);

        if (isClick) {
            handleColumnClick(event, columnIndex);
        }
    }

    function handleReorderDragOver(event: MouseEvent, columnIndex: number): void {
        if (isReorderDragging && dragStartIndex !== null && draggedColumn) {
            dragCurrentIndex = columnIndex;
            requestAnimationFrame(() => {
                draggedColumn!.style.left = event.clientX + tableContainer.scrollLeft - sidebarWidth + 'px';
                draggedColumn!.style.top = event.clientY + 'px';
            });
        }
    }

    function handleReorderDragEnd(): void {
        if (isReorderDragging && dragStartIndex !== null && dragCurrentIndex !== null) {
            preventResizeTableSpaceUpdate = false;
            if (draggedColumn) {
                savedColumnWidths.set(draggedColumn.innerText, savedColumnWidthBeforeReorder);
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
        }
    }

    // --- Column selecting ---
    let selectedColumnIndexes: number[] = [];

    function handleColumnClick(event: MouseEvent, columnIndex: number): void {
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
            // Replace the current selection
            // Replace the current selection with a new array to trigger reactivity
            setSelectionToColumn(columnIndex);
        }

        console.log('Selected column indexes:', selectedColumnIndexes);
    }

    function addColumnToSelection(columnIndex: number): void {
        // Add the index and create a new array to trigger reactivity
        selectedColumnIndexes = [...selectedColumnIndexes, columnIndex];
    }

    function removeColumnFromSelection(columnIndex: number, selectedColumnIndexesIndex?: number): void {
        // Remove the index and create a new array to trigger reactivity
        selectedColumnIndexes = [
            ...selectedColumnIndexes.slice(0, selectedColumnIndexesIndex ?? selectedColumnIndexes.indexOf(columnIndex)),
            ...selectedColumnIndexes.slice(
                (selectedColumnIndexesIndex ?? selectedColumnIndexes.indexOf(columnIndex)) + 1,
            ),
        ];
    }

    function setSelectionToColumn(columnIndex: number): void {
        // Replace the current selection with a new array to trigger reactivity
        selectedColumnIndexes = [columnIndex];
    }

    // --- Row selecting ---
    let selectedRowIndexes: number[] = [];
    let clickOnRow = false;

    function handleRowClick(event: MouseEvent, rowIndex: number): void {
        // Logic for what happens when a row is clicked
        if ($preventClicks) {
            return;
        }

        clickOnRow = true; // For global window click clear of selection

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
            // Replace the current selection
            // Replace the current selection with a new array to trigger reactivity
            selectedRowIndexes = [rowIndex];
        }

        console.log('Selected row indexes:', selectedRowIndexes);
    }

    // --- Scroll loading ---
    let tableContainer: HTMLElement; // Reference to the table container
    const rowHeight = 33; // Adjust based on your row height
    const buffer = 25; // Number of rows to render outside the viewport
    let visibleStart = 0;
    let visibleEnd = 0;
    let visibleRowCount = 10;
    let scrollTop = 0;
    let interval: NodeJS.Timeout;
    let lastHeight = 0;

    const throttledUpdateVisibleRows = throttle(updateVisibleRows, 40);

    function updateVisibleRows(): void {
        visibleStart = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
        visibleEnd = visibleStart + visibleRowCount;
    }

    function updateScrollTop(): void {
        if (currentContextMenu) {
            currentContextMenu.style.top = currentContextMenu.offsetTop - scrollTop + tableContainer.scrollTop + 'px';
        }
        scrollTop = tableContainer.scrollTop;
    }

    const throttledRecalculateVisibleRowCount = throttle(recalculateVisibleRowCount, 20);

    function recalculateVisibleRowCount(): void {
        if (lastHeight === tableContainer.clientHeight) {
            // Not recalculating if height didn't change
            return;
        }
        lastHeight = tableContainer.clientHeight;
        visibleRowCount = Math.ceil(tableContainer.clientHeight / rowHeight) + buffer;
        updateVisibleRows();
    }

    // --- Min Table with ---
    const throttledUpdateTableSpace = throttle(() => {
        if (!preventResizeTableSpaceUpdate) {
            updateTableSpace();
        }
    }, 100);

    function updateTableSpace(): void {
        console.log('Updating table space');
        const newPossibleSpace = tableContainer.offsetWidth;

        let beforeWidth = 0;
        for (const width of savedColumnWidths.values()) {
            beforeWidth += width;
        }

        if (newPossibleSpace > beforeWidth) {
            // Extend all column widths proportionally with new space
            for (const column of headerElements) {
                const newWidth = column.clientWidth + (newPossibleSpace - beforeWidth) / headerElements.length;
                column.style.width = newWidth + 'px';
                savedColumnWidths.set(column.innerText, newWidth);
            }
        } else {
            // Shrink all column widths proportionally with new space if not below minimum width dedicated by a: width by header text or b: with by manual resize
            for (const column of headerElements) {
                const newWidth = column.clientWidth - (beforeWidth - newPossibleSpace) / headerElements.length;
                if (resizeWidthMap.has(column.innerText)) {
                    // User resized manually, so don't shrink below that
                    if (resizeWidthMap.get(column.innerText)! <= newWidth) {
                        column.style.width = newWidth + 'px';
                        savedColumnWidths.set(column.innerText, newWidth);
                    } else if (column.clientWidth !== resizeWidthMap.get(column.innerText)!) {
                        // To update even on fast resize
                        column.style.width = resizeWidthMap.get(column.innerText)! + 'px';
                        savedColumnWidths.set(column.innerText, resizeWidthMap.get(column.innerText)!);
                    }
                } else {
                    // Use the minimum width dedicated by the header text
                    const minWidth = getColumnWidthFreshNumber(column.innerText);
                    if (minWidth <= newWidth) {
                        column.style.width = newWidth + 'px';
                        savedColumnWidths.set(column.innerText, newWidth);
                    } else if (column.clientWidth !== minWidth) {
                        // To update even on fast resize
                        column.style.width = minWidth + 'px';
                        savedColumnWidths.set(column.innerText, minWidth);
                    }
                }
            }
        }
    }

    $: if (headerElements.length > 0) {
        console.log('Updating table space');
        lastHeight = tableContainer.clientHeight;
        updateTableSpace();
    }

    // --- Right clicks ---
    let showingColumnHeaderRightClickMenu = false;
    let rightClickedColumnIndex = -1;
    let rightClickClumnMenuElement: HTMLElement;
    let currentContextMenu: HTMLElement | null = null;

    function handleColumnRightClick(event: MouseEvent, columnIndex: number): void {
        // Logic for what happens when a header is right clicked
        doDefaultContextMenuSetup();
        showingColumnHeaderRightClickMenu = true;
        rightClickedColumnIndex = columnIndex;

        requestAnimationFrame(() => {
            currentContextMenu = rightClickClumnMenuElement; // So scrolling can edit the position
            rightClickClumnMenuElement!.style.left = event.clientX + tableContainer.scrollLeft - sidebarWidth + 'px';
            rightClickClumnMenuElement!.style.top = event.clientY + scrollTop + 'px';
        });

        // Click anywhere else to close the menu, context menu selection has to prevent propagation
        window.addEventListener('click', handleRightClickEnd);
    }

    function doDefaultContextMenuSetup(): void {
        preventClicks.set(true);
        disableNonContextMenuEffects();
    }

    function handleRightClickEnd(): void {
        // Code specific to each menu
        showingColumnHeaderRightClickMenu = false;
        rightClickedColumnIndex = -1;
        // ----

        restoreNonContextMenuEffects();
        preventClicks.set(false);
        currentContextMenu = null;
        window.removeEventListener('click', handleRightClickEnd);
    }

    const originalHoverStyles = new Map<CSSStyleRule, string>();
    const originalCursorStyles = new Map<CSSStyleRule, string>();

    function disableNonContextMenuEffects() {
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
    }

    function restoreNonContextMenuEffects() {
        originalHoverStyles.forEach((style, rule) => {
            rule.style.cssText = style;
        });
        originalHoverStyles.clear();

        originalCursorStyles.forEach((style, rule) => {
            rule.style.cssText = style;
        });
        originalCursorStyles.clear();
    }

    // --- Profiling ---
    function toggleProfiling(): void {
        if (!$preventClicks) showProfiling = !showProfiling;
    }

    // --- Lifecycle ---
    onMount(() => {
        updateScrollTop();
        recalculateVisibleRowCount();
        tableContainer.addEventListener('scroll', throttledUpdateVisibleRows);
        tableContainer.addEventListener('scroll', updateScrollTop);
        window.addEventListener('resize', throttledRecalculateVisibleRowCount);
        window.addEventListener('resize', throttledUpdateTableSpace);
        const clearColumnSelection = async () => {
            if (!clickOnColumn) {
                selectedColumnIndexes = [];
            }
            clickOnColumn = false;
            console.log('Clearing column selection');
        };
        const clearRowSelection = async () => {
            if (!clickOnRow) {
                selectedRowIndexes = [];
            }
            console.log('Clearing row selection');
            clickOnRow = false;
        };
        window.addEventListener('click', clearColumnSelection);
        window.addEventListener('click', clearRowSelection);
        interval = setInterval(updateVisibleRows, 500); // To catch cases of fast scroll bar scrolling that leave table blank

        return () => {
            tableContainer.removeEventListener('scroll', throttledUpdateVisibleRows);
            tableContainer.addEventListener('scroll', updateScrollTop);
            window.removeEventListener('resize', throttledRecalculateVisibleRowCount);
            window.removeEventListener('resize', throttledUpdateTableSpace);
            window.removeEventListener('click', clearColumnSelection);
            window.removeEventListener('click', clearRowSelection);
            clearInterval(interval);
        };
    });
</script>

<div bind:this={tableContainer} class="table-container">
    {#if !$currentState.table}
        <span>Loading ...</span>
    {:else}
        <div class="content-wrapper" style="height: {numRows * rowHeight}px;">
            <table>
                <thead style="min-width: {minTableWidth}px; position: relative; top: {scrollTop}px;">
                    <tr class="headerRow" style="height: {rowHeight}px;">
                        <th class="borderColumn" on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                        ></th>
                        {#each $currentState.table.columns as column, index}
                            <th
                                bind:this={headerElements[index]}
                                class:reorderHighlightedRight={isReorderDragging && dragCurrentIndex === index}
                                class:reorderHighlightedLeft={isReorderDragging &&
                                    dragStartIndex !== index &&
                                    (dragCurrentIndex === index + 1 ||
                                        (dragStartIndex === index + 1 && dragCurrentIndex === index + 2))}
                                style="width: {getColumnWidth(column[1].name)}px; position: relative;"
                                on:mousedown={(event) => handleColumnInteractionStart(event, index)}
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                >{column[1].name}
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <div
                                    class="resize-handle"
                                    on:mousedown={(event) => startResizeDrag(event, index)}
                                ></div>
                            </th>
                        {/each}
                        <th
                            class="borderColumn"
                            on:mousemove={(event) =>
                                throttledHandleReorderDragOver(event, $currentState.table?.columns.length ?? 0)}
                        ></th>
                    </tr>
                </thead>
                <tr class="hiddenProfilingWrapper noHover" style="top: {scrollTop}px;">
                    <td
                        class="borderColumn border-right profiling"
                        on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                    ></td>
                    {#each $currentState.table.columns as column, index}
                        <td
                            class="profiling"
                            class:expanded={showProfiling}
                            on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                        >
                            <div class="content" class:expanded={showProfiling}>
                                Heyyyyyyyyyyy <br /> Hey<br /> Hey<br /> Hey<br /> Hey<br /> Hey<br /> Hey
                            </div>
                        </td>
                    {/each}
                    <td
                        class="borderColumn profiling"
                        on:mousemove={(event) =>
                            throttledHandleReorderDragOver(event, $currentState.table?.columns.length ?? 0)}
                    ></td>
                </tr>
                <tr class="profilingBannerRow" style="height: {rowHeight}px; top: {scrollTop}px;">
                    <td
                        class="borderColumn border-right profilingBanner"
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
                            <div class="iconWrapper" class:rotate={!showProfiling}>
                                <CaretIcon />
                            </div>
                        </div>
                    </td>
                    {#each $currentState.table.columns as column, i}
                        <td
                            class="profilingBanner"
                            on:click={() => (showProfiling = !showProfiling)}
                            on:mousemove={(event) => throttledHandleReorderDragOver(event, i + 1)}
                        >
                        </td>
                    {/each}
                    <td
                        class="borderColumn profilingBanner"
                        on:mousemove={(event) =>
                            throttledHandleReorderDragOver(event, $currentState.table?.columns.length ?? 0)}
                    ></td>
                </tr>
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
                                    on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                    class:selectedColumn={selectedColumnIndexes.includes(index) ||
                                        selectedRowIndexes.includes(visibleStart + i)}
                                    >{column[1].values[visibleStart + i] || ''}</td
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
    {#if numRows === -1}
        <!-- Just so these classes get compiled -->
        <span class="dragging selectedColumn">No data</span>
    {/if}
    {#if showingColumnHeaderRightClickMenu}
        <div class="contextMenu" bind:this={rightClickClumnMenuElement}>
            {#if selectedColumnIndexes.includes(rightClickedColumnIndex)}
                <button type="button" on:click={() => removeColumnFromSelection(rightClickedColumnIndex)}
                    >Deselect Column</button
                >
            {:else}
                {#if selectedColumnIndexes.length >= 1}
                    <button type="button" on:click={() => addColumnToSelection(rightClickedColumnIndex)}
                        >Add To Selection</button
                    >
                {/if}
                <button type="button" on:click={() => setSelectionToColumn(rightClickedColumnIndex)}
                    >Select Column</button
                >
            {/if}
        </div>
    {/if}
</div>

<style>
    .table-container {
        overflow-y: auto;
        height: 100%; /* Adjust based on your layout */
        position: relative; /* Needed for absolute positioning inside */
    }

    .content-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
    }

    table {
        table-layout: fixed;
        width: 100%;
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
    }
    table tr:nth-child(even) {
        background-color: var(--bg-bright);
    }
    table tr:nth-child(odd) {
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

    .resize-handle {
        cursor: ew-resize;
        width: 3px; /* Adjust as needed */
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
    }

    .border-right {
        border-right: 2px solid var(--bg-bright);
    }
    .hiddenProfilingWrapper {
        position: relative !important;
        z-index: 10;
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

    .profilingBanner {
        height: 35px;
        width: 100%;
        background-color: var(--bg-dark);
        font-size: 1.1rem;
        border-top: 2px solid var(--bg-bright);
        border-left: 3px solid var(--bg-bright);
        border-bottom: 3px solid var(--bg-bright);
        user-select: none;
        padding-left: 0px;
        z-index: 10;
    }
    .profilingBanner:hover {
        cursor: pointer;
    }

    .rotate {
        transform: rotate(180deg);
    }

    .iconWrapper {
        display: inline-flex;
        justify-content: center;
        height: 100%;
        width: 20px;
        margin-left: 5px;
    }

    .profiling {
        padding: 0;
        border-right: 2px solid var(--bg-bright);
        border-left: 3px solid var(--bg-bright);
        background-color: var(--bg-dark) !important;
    }

    .profiling.expanded {
        padding: 8px 12px;
    }

    .profiling .content {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: none;
    }

    .profiling .content.expanded {
        overflow-y: scroll;
        max-height: 200px; /* Adjust this value based on the actual content size */
        opacity: 1;
        transition:
            max-height 0.7s ease,
            opacity 0.5s ease;
    }

    .reorderHighlightedLeft {
        background: linear-gradient(to right, #036ed1 0%, #036ed1 calc(100% - 2px), white calc(100% - 2px), white 100%);
    }

    .reorderHighlightedRight {
        background: linear-gradient(to left, #036ed1 0%, #036ed1 calc(100% - 2px), white calc(100% - 2px), white 100%);
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
        padding: 0px;
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
</style>
