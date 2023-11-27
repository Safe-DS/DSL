<script lang="ts">
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
            console.log('Using saved width for', columnName);
            return `${savedColumnWidths.get(columnName)}px`;
        }
        const baseWidth = 35; // Minimum width
        const scale = 55; // Adjust this scale factor to suit your layout

        // Use the logarithm of the character count, and scale it
        const width = baseWidth + Math.log(columnName.length + 1) * scale;

        // Save the width for future use
        savedColumnWidths.set(columnName, width);
        console.log('Saving width for', columnName);

        return `${width}px`;
    }

    // --- Column resizing ---
    let isResizeDragging = false;
    let startWidth: number;
    let startX: number;
    let targetColumn: HTMLElement;

    function startResizeDrag(event: MouseEvent, columnIndex: number): void {
        event.stopPropagation();
        const columnElement = headerElements[columnIndex];
        isResizeDragging = true;
        startX = event.clientX;
        startWidth = columnElement.offsetWidth;
        targetColumn = columnElement;
        document.addEventListener('mousemove', doResizeDrag);
        document.addEventListener('mouseup', stopResizeDrag);
    }

    function doResizeDrag(event: MouseEvent): void {
        if (isResizeDragging && targetColumn) {
            const currentWidth = startWidth + event.clientX - startX;
            targetColumn.style.width = `${currentWidth}px`;
            savedColumnWidths.set(targetColumn.innerText, currentWidth);
        }
    }

    function stopResizeDrag(): void {
        isResizeDragging = false;
        document.removeEventListener('mousemove', doResizeDrag);
        document.removeEventListener('mouseup', stopResizeDrag);
    }

    // --- Column reordering ---
    let isReorderDragging = false;
    let dragStartIndex: number | null = null;
    let dragCurrentIndex: number | null = null;
    let draggedColumn: HTMLElement | null = null;
    let offsetX = 0;
    let offsetY = 0;

    function handleReorderDragStart(event: MouseEvent, columnIndex: number): void {
        document.addEventListener('mouseup', handleReorderDragEnd);
        isReorderDragging = true;
        dragStartIndex = columnIndex;
        dragCurrentIndex = columnIndex;
        draggedColumn = headerElements[columnIndex];
        draggedColumn.classList.add('dragging');
        const rect = draggedColumn.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        // Lower the z-index of all other headers
        headerElements.forEach((header, index) => {
            if (index !== columnIndex) {
                header.style.zIndex = '0'; // Or any value lower than the dragging header
            }
        });
    }

    function handleReorderDragOver(event: MouseEvent, columnIndex: number): void {
        if (isReorderDragging && dragStartIndex !== null && draggedColumn) {
            // Logic to provide visual feedback and determine the target column
            dragCurrentIndex = columnIndex;
            const containerRect = draggedColumn.parentElement!.getBoundingClientRect();
            draggedColumn.style.left = event.clientX - containerRect.left - offsetX + 'px';
            draggedColumn.style.top = event.clientY - containerRect.top - offsetY + 'px';
        }
    }

    function handleReorderDragEnd(): void {
        if (isReorderDragging && dragStartIndex !== null && dragCurrentIndex) {
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
                return { ...$currentState, table: { ...$currentState.table!, columns: newColumns } };
            });
            document.removeEventListener('mouseup', handleReorderDragEnd);
            isReorderDragging = false;
            dragStartIndex = null;
        }
    }
</script>

<div>
    {#if !$currentState.table}
        <span>Loading ...</span>
    {:else}
        <table style="min-width: {minTableWidthString};">
            <thead>
                <tr>
                    <th class="firstColumn"></th>
                    {#each $currentState.table.columns as column, index}
                        <th
                            bind:this={headerElements[index]}
                            class:reorderHighlighted={isReorderDragging && dragCurrentIndex === index}
                            style="width: {getColumnWidth(column[1].name)}"
                            on:mousedown={(event) => handleReorderDragStart(event, index)}
                            on:mousemove={(event) => handleReorderDragOver(event, index)}
                            on:mouseup={handleReorderDragEnd}
                            >{column[1].name}
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div class="resize-handle" on:mousedown={(event) => startResizeDrag(event, index)}></div>
                        </th>
                    {/each}
                </tr>
            </thead>
            <tr class="hiddenProfilingWrapper no-hover">
                <td class="firstColumn border-right profiling"></td>
                {#each $currentState.table.columns as column, index}
                    <td
                        class="profiling"
                        class:expanded={showProfiling}
                        on:mousemove={(event) => handleReorderDragOver(event, index)}
                    >
                        <div class="content" class:expanded={showProfiling}>
                            Heyyyyyyyyyyy <br /> Hey<br /> Hey<br /> Hey<br /> Hey<br /> Hey<br /> Hey
                        </div>
                    </td>
                {/each}
            </tr>
            <tr>
                <td
                    class="profilingBanner"
                    on:click={() => (showProfiling = !showProfiling)}
                    colspan={$currentState.table.columns.length + 1}
                >
                    <div>
                        <span>{showProfiling ? 'Hide Profiling' : 'Show Profiling'}</span>
                        <div class="iconWrapper" class:rotate={!showProfiling}>
                            <CaretIcon />
                        </div>
                    </div>
                </td>
            </tr>
            <tbody>
                {#each Array(numRows) as _, i}
                    <tr>
                        <td class="firstColumn">{i}</td>
                        {#each $currentState.table.columns as column, index}
                            <td on:mousemove={(event) => handleReorderDragOver(event, index)}
                                >{column[1].values[i] || ''}</td
                            >
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
    {#if numRows === -1}
        <span class="dragging">No data</span>
    {/if}
</div>

<style>
    table {
        table-layout: fixed;
        width: 100%;
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
        position: relative;
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

    .firstColumn {
        padding: 5px 5px 5px 5px;
        width: 45px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.8rem;
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
        padding-left: 50px;
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
