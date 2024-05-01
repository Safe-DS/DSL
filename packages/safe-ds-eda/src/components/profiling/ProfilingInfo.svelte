<script lang="ts">
    import type { Profiling } from '../../../types/state';
    import { addAndDeployTabHistoryEntry } from '../../apis/historyApi.js';
    import ZoomIcon from '../../icons/Zoom.svelte';

    export let profiling: Profiling;
    export let imageWidth: number = 200;
    export let columnName: string;
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
                    on:click={() => {
                        const randomId = Math.floor(Math.random() * 100);
                        addAndDeployTabHistoryEntry(
                            {
                                action: 'histogram',
                                alias: `View ${columnName} Histogram`,
                                type: 'external-visualizing',
                                columnName: columnName,
                                id: randomId,
                            },
                            {
                                type: 'histogram',
                                tabComment: columnName,
                                content: {
                                    columnName: columnName,
                                    encodedImage: profilingItem.value,
                                    outdated: false,
                                },
                                initalHistoryEntryId: randomId,
                                imageTab: true,
                                columnNumber: 'one',
                            },
                        );
                    }}
                >
                    <ZoomIcon />
                </div>
                <div class="profilingItem">
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
        right: 15px;
        cursor: pointer;
        border-radius: 50%;
    }

    .zoomIconWrapper:hover {
        height: 25px;
        width: 25px;
    }
</style>
