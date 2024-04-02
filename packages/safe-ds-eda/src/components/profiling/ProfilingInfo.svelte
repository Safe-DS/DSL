<script lang="ts">
    import type { Profiling } from '../../../types/state';

    export let profiling: Profiling;
    export let imageWidth: number = 200;
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
</style>
