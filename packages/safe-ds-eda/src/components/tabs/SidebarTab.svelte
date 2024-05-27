<script lang="ts">
    import type { Tab } from '../../../types/state.js';
    import BarPlotIcon from '../../icons/BarPlot.svelte';
    import BoxPlotIcon from '../../icons/BoxPlot.svelte';
    import HeatmapIcon from '../../icons/Heatmap.svelte';
    import LinePlotIcon from '../../icons/LinePlot.svelte';
    import ScatterPlotIcon from '../../icons/ScatterPlot.svelte';

    export let tabObject: Tab;
    export let active: boolean;
    export let width: number;
</script>

<div class="wrapper" class:activeWrapper={active}>
    <div class="main">
        <div class="icon">
            {#if tabObject.isInGeneration}
                <div></div>
            {:else if tabObject.type === 'linePlot'}
                <LinePlotIcon />
            {:else if tabObject.type === 'boxPlot'}
                <BoxPlotIcon />
            {:else if tabObject.type === 'heatmap'}
                <HeatmapIcon />
            {:else if tabObject.type === 'infoPanel'}
                <BarPlotIcon />
            {:else if tabObject.type === 'histogram'}
                <BarPlotIcon />
            {:else if tabObject.type === 'scatterPlot'}
                <ScatterPlotIcon />
            {/if}
        </div>
        <span class="title"
            >{#if width > 300 || tabObject.isInGeneration || (tabObject.tabComment === '' && width > 109)}
                {#if tabObject.isInGeneration}
                    Generating...
                {:else if tabObject.outdated}
                    Outdated
                {:else if tabObject.type === 'histogram'}
                    Histogram
                {:else if tabObject.type === 'boxPlot'}
                    Boxplot
                {:else if tabObject.type === 'heatmap'}
                    Heatmap
                {:else if tabObject.type === 'infoPanel'}
                    Info panel
                {:else if tabObject.type === 'linePlot'}
                    Lineplot
                {:else if tabObject.type === 'scatterPlot'}
                    Scatterplot
                {/if}
            {/if}</span
        >
    </div>
    <span class="comment"
        >{#if width > 109 && !tabObject.isInGeneration}{tabObject.tabComment}{/if}</span
    >
</div>

<style>
    .wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 100%;
        padding: 0px 20px 0px 20px;
        margin-bottom: 10px;
        background-color: var(--light-color);
        font-size: 1.1rem;
        cursor: pointer;
    }

    .activeWrapper {
        background-color: var(--lightest-color);
        font-size: 1.2rem;
    }

    .main {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 40px;
    }

    .icon {
        margin-right: 10px;
        padding-top: 2px;
    }

    .comment {
        margin-left: auto;
        font-size: 0.9rem;
        color: var(--dark-color);
    }
</style>
