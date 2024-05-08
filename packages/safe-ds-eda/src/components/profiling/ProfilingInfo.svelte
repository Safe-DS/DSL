<script lang="ts">
    import type { Profiling, ProfilingDetailImage } from '../../../types/state';
    import { addAndDeployTabHistoryEntry, getAndIncrementEntryId } from '../../apis/historyApi.js';
    import ZoomIcon from '../../icons/Zoom.svelte';

    export let profiling: Profiling;
    export let imageWidth: number = 200;
    export let columnName: string;

    let hoveringImage = false;

    const zoomIntoImage = function (profilingItem: ProfilingDetailImage) {
        const entryId = getAndIncrementEntryId();
        addAndDeployTabHistoryEntry(
            {
                action: 'histogram',
                alias: `View ${columnName} Histogram`,
                type: 'external-visualizing',
                columnName: columnName,
                id: entryId,
                columnNumber: 'one',
            },
            {
                type: 'histogram',
                tabComment: columnName,
                content: {
                    columnName: columnName,
                    encodedImage: profilingItem.value,
                    outdated: false,
                },
                id: crypto.randomUUID(),
                imageTab: true,
                columnNumber: 'one',
                isInGeneration: false,
            },
        );
    };
</script>

<div class="wrapper">
    <div class="profilingItemsTop">
        <div class="profilingItem">
            <span class="profilingItemKey {profiling.validRatio.interpretation}">{profiling.validRatio.name}:</span>
            <span class={profiling.validRatio.interpretation}>{profiling.validRatio.value}</span>
        </div>
        <div class="profilingItem">
            <span class="profilingItemKey {profiling.missingRatio.interpretation}">{profiling.missingRatio.name}:</span>
            <span class={profiling.missingRatio.interpretation}>{profiling.missingRatio.value}</span>
        </div>
    </div>
    <div class="profilingItemsBottom">
        {#each profiling.other as profilingItem}
            {#if profilingItem.type === 'text'}
                <div class="profilingItem">
                    <span class={profilingItem.interpretation}>{profilingItem.value}</span>
                </div>
            {:else if profilingItem.type === 'numerical'}
                <div class="profilingItem">
                    <span class="profilingItemKey {profilingItem.interpretation}">{profilingItem.name}:</span>
                    <span class={profilingItem.interpretation}>{profilingItem.value}</span>
                </div>
            {:else if profilingItem.type === 'image'}
                <div
                    role="none"
                    class="zoomIconWrapper"
                    class:hoveringImage
                    style:left={imageWidth - 37 + 'px'}
                    on:click={() => zoomIntoImage(profilingItem)}
                >
                    <ZoomIcon />
                </div>
                <div
                    role="none"
                    class="profilingItem"
                    on:click={() => zoomIntoImage(profilingItem)}
                    on:mouseover={() => (hoveringImage = true)}
                    on:focus={() => (hoveringImage = true)}
                    on:mouseleave={() => (hoveringImage = false)}
                >
                    <img
                        style:width="{imageWidth}px"
                        class="profilingImage"
                        src={'data:image/' + profilingItem.value.format + ';base64,' + profilingItem.value.bytes}
                        alt="profiling plot"
                    />
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    .wrapper {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .profilingItem {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1px;
        user-select: none;
        line-height: 15px;
    }

    .profilingItemKey {
        margin-right: 10px;
    }

    .profilingItemsTop {
        margin-bottom: 20px;
        width: 100%;
    }

    .profilingItemsBottom {
        width: 100%;
        position: relative;
    }

    .profilingImage {
        height: 150px; /* default height, profiling height calculation works off this value */
        object-fit: cover;
        object-position: left;
        cursor: pointer;
    }

    .good {
        color: var(--primary-color);
    }

    .error {
        color: var(--error-color);
    }

    .warn {
        color: var(--warn-color);
    }

    .important {
        color: var(--font-dark);
    }

    .default {
        color: var(--font-light);
    }

    .category {
        color: var(--font-light);
    }

    .zoomIconWrapper {
        height: 17px;
        width: 17px;
        position: absolute;
        top: 30px;
        cursor: pointer;
        border-radius: 50%;
    }

    .zoomIconWrapper:hover {
        height: 25px;
        width: 25px;
    }

    .zoomIconWrapper.hoveringImage {
        height: 25px;
        width: 25px;
    }
</style>
