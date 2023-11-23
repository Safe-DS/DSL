<script lang="ts">
    import { currentState } from '../webviewState';
    import CaretIcon from '../icons/caret.svelte';

    let showProfiling = false;
    let minTableWidth = 0;
    let minTableWidthString = '0px';
    let headerElements: HTMLElement[] = [];

    let numRows = 0;
    $: {
        if ($currentState.table) {
            numRows = 0;
            $currentState.table.columns.forEach((column) => {
                if (column.values.length > numRows) {
                    numRows = column.values.length;
                }
                minTableWidth += 100;
            });
            minTableWidthString = `${minTableWidth}px`;
        }
    }

    function getColumnWidth(column: string) {
        const baseWidth = 20; // Minimum width in rem
        const scale = 50; // Adjust this scale factor to suit your layout

        // Use the logarithm of the character count, and scale it
        const width = baseWidth + Math.log(column.length + 1) * scale;

        return `${width}px`;
    }

    let isDragging = false;
    let startWidth: number;
    let startX: number;
    let targetColumn: HTMLElement;

    function startDrag(event: MouseEvent, columnIndex: number): void {
        const columnElement = headerElements[columnIndex];
        isDragging = true;
        startX = event.clientX;
        startWidth = columnElement.offsetWidth;
        targetColumn = columnElement;
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }

    function doDrag(event: MouseEvent): void {
        if (isDragging && targetColumn) {
            const currentWidth = startWidth + event.clientX - startX;
            targetColumn.style.width = `${currentWidth}px`;
        }
    }

    function stopDrag(): void {
        isDragging = false;
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
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
                        <th bind:this={headerElements[index]} style="width: {getColumnWidth(column[1].name)}"
                            >{column[1].name}
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div class="resize-handle" on:mousedown={(event) => startDrag(event, index)}></div>
                        </th>
                    {/each}
                </tr>
            </thead>
            <tr class="hiddenProfilingWrapper no-hover">
                <td class="firstColumn border-right profiling"></td>
                {#each $currentState.table.columns as column}
                    <td class="profiling" class:expanded={showProfiling}>
                        <div class="content" class:expanded={showProfiling}>
                            Heyyyyyyyyyyy <br /> Hey
                        </div>
                    </td>
                {/each}
            </tr>
            <tr>
                <td
                    class="profilingBanner"
                    on:click={() => (showProfiling = !showProfiling)}
                    colspan={$currentState.table.columns.size + 1}
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
                        {#each $currentState.table.columns as column}
                            <td>{column[1].values[i] || ''}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
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
        border-right: 2px solid var(--bg-bright);
        background-color: var(--primary-color);
        color: var(--bg-bright);
        font-weight: 500;
        font-size: 1.1rem;
        position: relative;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        width: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-right: 2px solid var(--bg-bright);
        font-size: 0.8rem;
    }

    .profilingBanner {
        height: 35px;
        width: 100%;
        background-color: var(--bg-dark);
        font-size: 1.1rem;
        border-top: 3px solid var(--bg-bright);
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
        max-height: 100px; /* Adjust this value based on the actual content size */
        opacity: 1;
        transition:
            max-height 0.9s ease,
            opacity 0.5s ease;
    }
</style>
