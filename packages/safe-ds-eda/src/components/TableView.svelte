<script lang="ts">
    import { onMount } from 'svelte';
    import { throttle } from 'lodash';
    import { currentState } from '../webviewState';
    import CaretIcon from '../icons/caret.svelte';

    let showProfiling = false;
    let minTableWidthString = '0px';
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
            minTableWidthString = `${minTableWidth}px`;
        }
    }

    function getColumnWidth(columnName: string) {
        if (savedColumnWidths.has(columnName)) {
            return `${savedColumnWidths.get(columnName)}px`;
        }
        const baseWidth = 35; // Minimum width
        const scale = 55;

        // Use the logarithm of the character count, and scale it
        const width = baseWidth + Math.log(columnName.length + 1) * scale;

        // Save the width for future use
        savedColumnWidths.set(columnName, width);

        return `${width}px`;
    }

    // --- Column resizing ---
    let isResizeDragging = false;
    let startWidth: number;
    let startX: number;
    let targetColumn: HTMLElement;

    const throttledDoResizeDrag = throttle(doResizeDrag, 30);

    function startResizeDrag(event: MouseEvent, columnIndex: number): void {
        event.stopPropagation();
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
    let containerRect: DOMRect | null = null;

    const throttledHandleReorderDragOver = throttle(handleReorderDragOver, 30);

    function handleReorderDragStart(event: MouseEvent, columnIndex: number): void {
        document.addEventListener('mouseup', handleReorderDragEnd);
        isReorderDragging = true;
        dragStartIndex = columnIndex;
        dragCurrentIndex = columnIndex;
        draggedColumn = headerElements[columnIndex];
        draggedColumn.classList.add('dragging');

        // Lower the z-index of all other headers
        headerElements.forEach((header, index) => {
            if (index !== columnIndex) {
                header.style.zIndex = '0'; // Or any value lower than the dragging header
            }
        });
    }

    function handleReorderDragOver(event: MouseEvent, columnIndex: number): void {
        if (isReorderDragging && dragStartIndex !== null && draggedColumn) {
            dragCurrentIndex = columnIndex;
            if (!containerRect) containerRect = draggedColumn.parentElement!.getBoundingClientRect();
            requestAnimationFrame(() => {
                draggedColumn!.style.left = event.clientX - containerRect!.x + 'px';
                draggedColumn!.style.top = event.clientY + 'px';
            });
        }
    }

    function handleReorderDragEnd(): void {
        if (isReorderDragging && dragStartIndex !== null && dragCurrentIndex !== null) {
            if (draggedColumn) {
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
        }
    }

    // --- Scroll loading ---
    let tableContainer: HTMLElement; // Reference to the table container
    const rowHeight = 33; // Adjust based on your row height
    const buffer = 25; // Number of rows to render outside the viewport
    let visibleStart = 0;
    let visibleEnd = 0;
    let visibleRowCount = 10;
    let scrollTop = 0;
    let intervalId: number;

    onMount(() => {
        updateScrollTop();
        recalculateVisibleRowCount();
        tableContainer.addEventListener('scroll', throttledUpdateVisibleRows);
        tableContainer.addEventListener('scroll', updateScrollTop);
        window.addEventListener('resize', throttledRecalculateVisibleRowCount);
        intervalId = setInterval(updateVisibleRows, 500); // To catch cases of fast scroll bar scrolling that leave table blank

        return () => {
            tableContainer.removeEventListener('scroll', throttledUpdateVisibleRows);
            tableContainer.addEventListener('scroll', updateScrollTop);
            window.removeEventListener('resize', throttledRecalculateVisibleRowCount);
            clearInterval(intervalId);
        };
    });

    const throttledUpdateVisibleRows = throttle(updateVisibleRows, 40);

    function updateVisibleRows(): void {
        visibleStart = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
        visibleEnd = visibleStart + visibleRowCount;
    }

    function updateScrollTop(): void {
        scrollTop = tableContainer.scrollTop;
        console.log(scrollTop + window.innerHeight);
        console.log(numRows * rowHeight);
        if (scrollTop + window.innerHeight >= numRows * rowHeight) {
            updateVisibleRows();
        }
    }

    const throttledRecalculateVisibleRowCount = throttle(recalculateVisibleRowCount, 20);

    function recalculateVisibleRowCount(): void {
        visibleRowCount = Math.ceil(tableContainer.clientHeight / rowHeight) + buffer;
        updateVisibleRows();
    }
</script>

<div bind:this={tableContainer} class="table-container">
    {#if !$currentState.table}
        <span>Loading ...</span>
    {:else}
        <div class="content-wrapper" style="height: {numRows * rowHeight}px;">
            <table>
                <thead style="min-width: {minTableWidthString}; position: relative; top: {scrollTop}px;">
                    <tr class="headerRow" style="height: {rowHeight}px;">
                        <th class="firstColumn" on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}></th>
                        {#each $currentState.table.columns as column, index}
                            <th
                                bind:this={headerElements[index]}
                                class:reorderHighlighted={isReorderDragging && dragCurrentIndex === index}
                                style="width: {getColumnWidth(column[1].name)}"
                                on:mousedown={(event) => handleReorderDragStart(event, index)}
                                on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                >{column[1].name}
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <div
                                    class="resize-handle"
                                    on:mousedown={(event) => startResizeDrag(event, index)}
                                ></div>
                            </th>
                        {/each}
                    </tr>
                </thead>
                <tr class="hiddenProfilingWrapper no-hover" style="top: {scrollTop}px;">
                    <td
                        class="firstColumn border-right profiling"
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
                </tr>
                <tr class="profilingBannerRow" style="height: {rowHeight}px; top: {scrollTop}px;">
                    <td
                        class="firstColumn border-right profilingBanner"
                        on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                    ></td>
                    <td
                        class="profilingBanner"
                        on:click={() => (showProfiling = !showProfiling)}
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
                </tr>
                <tbody style="position: relative; top: {visibleStart * rowHeight}px;">
                    {#each Array(Math.min(visibleEnd, numRows) - visibleStart) as _, i}
                        <tr style="height: {rowHeight}px;">
                            <td class="firstColumn" on:mousemove={(event) => throttledHandleReorderDragOver(event, 0)}
                                >{visibleStart + i}</td
                            >
                            {#each $currentState.table.columns as column, index}
                                <td on:mousemove={(event) => throttledHandleReorderDragOver(event, index)}
                                    >{column[1].values[visibleStart + i] || ''}</td
                                >
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
    {#if numRows === -1}
        <!-- Just so this class gets compiled -->
        <span class="dragging">No data</span>
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
        position: sticky;
        top: 0;
        z-index: 10;
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
    .no-hover:hover {
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

    .firstColumn {
        padding: 5px 5px 5px 5px;
        width: 45px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.8rem;
        border-left: 3px solid var(--bg-bright) !important;
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

    .reorderHighlighted {
        border-left: 3px solid rgb(75, 75, 75) !important;
        border-bottom: 3px solid var(--bg-bright) !important;
    }

    .dragging {
        position: absolute;
        pointer-events: none; /* Make it non-interactive */
        z-index: 1000; /* Ensure it's on top */
        border: 3px solid var(--bg-dark);
    }
</style>
