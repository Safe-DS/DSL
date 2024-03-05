<script lang="ts">
    import type { Profiling } from '../../../types/state';

    export let profiling: Profiling;
</script>

<div class="wrapper">
    <div class="profilingItemsTop">
        {#each profiling.top as profilingTopItem}
            {#if profilingTopItem.type === 'name'}
                <div class="profilingItem">
                    <span style="color: {profilingTopItem.color ?? 'var(--font-light)'};">{profilingTopItem.name}</span>
                </div>
            {:else if profilingTopItem.type === 'numerical'}
                <div class="profilingItem">
                    <span class="profilingItemFirst" style="color: {profilingTopItem.color ?? 'var(--font-light)'};"
                        >{profilingTopItem.name}:</span
                    >
                    <span style="color: {profilingTopItem.color ?? 'var(--font-light)'};">{profilingTopItem.value}</span
                    >
                </div>
            {/if}
        {/each}
    </div>
    <div class="profilingItemsBottom">
        {#each profiling.bottom as profilingBottomItem}
            {#if profilingBottomItem.type === 'name'}
                <div class="profilingItem">
                    <span style="color: {profilingBottomItem.color ?? 'var(--font-light)'};"
                        >{profilingBottomItem.name}</span
                    >
                </div>
            {:else if profilingBottomItem.type === 'numerical'}
                <div class="profilingItem">
                    <span class="profilingItemFirst" style="color: {profilingBottomItem.color ?? 'var(--font-light)'};"
                        >{profilingBottomItem.name}:</span
                    >
                    <span style="color: {profilingBottomItem.color ?? 'var(--font-light)'};"
                        >{profilingBottomItem.value}</span
                    >
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
</style>
