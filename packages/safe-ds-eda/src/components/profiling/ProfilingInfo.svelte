<script lang="ts">
    import type { Profiling, ProfilingDetail } from '../../../types/state';

    export let profiling: Profiling;
    export let imageWidth: number = 200;

    const getProfilingItemColor = function (profilingItem: ProfilingDetail) {
        if (profilingItem.interpretation === 'good') {
            return 'var(--primary-color)';
        } else if (profilingItem.interpretation === 'error') {
            return 'var(--error-color)';
        } else if (profilingItem.interpretation === 'warn') {
            return 'var(--warn-color)';
        } else if (profilingItem.interpretation === 'bold') {
            return 'var(--font-dark)';
        } else if (profilingItem.interpretation === 'default') {
            return 'var(--font-light)';
        } else if (profilingItem.interpretation === 'category') {
            return 'var(--font-light)';
        } else {
            return 'var(--font-light)';
        }
    };
</script>

<div class="wrapper">
    <div class="profilingItemsTop">
        {#each profiling.top as profilingTopItem}
            {#if profilingTopItem.type === 'text'}
                <div class="profilingItem">
                    <span style="color: {getProfilingItemColor(profilingTopItem)};">{profilingTopItem.value}</span>
                </div>
            {:else if profilingTopItem.type === 'numerical'}
                <div class="profilingItem">
                    <span class="profilingItemFirst" style="color: {getProfilingItemColor(profilingTopItem)};"
                        >{profilingTopItem.name}:</span
                    >
                    <span style="color: {getProfilingItemColor(profilingTopItem)};">{profilingTopItem.value}</span>
                </div>
            {:else if profilingTopItem.type === 'image'}
                <div class="profilingItem">
                    <img
                        style="width: {imageWidth}px;"
                        class="profilingImage"
                        src={'data:image/' + profilingTopItem.value.format + ';base64,' + profilingTopItem.value.bytes}
                        alt="profiling histogram"
                    />
                </div>
            {/if}
        {/each}
    </div>
    <div class="profilingItemsBottom">
        {#each profiling.bottom as profilingBottomItem}
            {#if profilingBottomItem.type === 'text'}
                <div class="profilingItem">
                    <span style="color: {getProfilingItemColor(profilingBottomItem)};">{profilingBottomItem.value}</span
                    >
                </div>
            {:else if profilingBottomItem.type === 'numerical'}
                <div class="profilingItem">
                    <span class="profilingItemFirst" style="color: {getProfilingItemColor(profilingBottomItem)};"
                        >{profilingBottomItem.name}:</span
                    >
                    <span style="color: {getProfilingItemColor(profilingBottomItem)};">{profilingBottomItem.value}</span
                    >
                </div>
            {:else if profilingBottomItem.type === 'image'}
                <div class="profilingItem">
                    <img
                        style="width: {imageWidth}px;"
                        class="profilingImage"
                        src={'data:image/' +
                            profilingBottomItem.value.format +
                            ';base64,' +
                            profilingBottomItem.value.bytes}
                        alt="profiling histogram"
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

    .profilingItemFirst {
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
        height: 150px;
        object-fit: cover;
        object-position: left;
    }
</style>
