<script lang="ts">
    import TableView from './components/TableView.svelte';
    import Sidebar from './components/Sidebar.svelte';
    import { throttle } from 'lodash';

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
    <div class="sidebarWrapper" style="width: {sidebarWidth}px;" class:white-bg={sidebarWidth < 100}>
        <Sidebar width={sidebarWidth} />
        <div class="resizer" on:mousedown={handleDrag}></div>
    </div>
    <div class="tableWrapper">
        <TableView {sidebarWidth} />
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
        background-color: var(--bg-bright);
    }

    .white-bg {
        background-color: var(--bg-bright);
    }

    .tableWrapper {
        flex: 1;
        overflow: scroll;
    }

    .resizer {
        width: 5px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        cursor: ew-resize;
        background-color: transparent;
    }
</style>
