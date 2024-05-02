<script lang="ts">
    import type { Tab } from '../../../types/state.js';
    import BarPlotIcon from '../../icons/BarPlot.svelte';
    import LinePlotIcon from '../../icons/LinePlot.svelte';

    export let tabObject: Tab;
    export let active: boolean;
    export let width: number;
</script>

<div class="wrapper" class:activeWrapper={active}>
    <div class="main">
        <span class="icon">
            {#if tabObject.type === 'linePlot'}
                <LinePlotIcon />
            {:else if tabObject.type === 'boxplot'}
                <BarPlotIcon />
            {:else if tabObject.type === 'heatmap'}
                <BarPlotIcon />
            {:else if tabObject.type === 'infoPanel'}
                <BarPlotIcon />
            {:else if tabObject.type === 'histogram'}
                <BarPlotIcon />
            {:else if tabObject.type === 'scatterPlot'}
                <BarPlotIcon />
            {/if}
        </span>
        <span class="title"
            >{#if width > 109}
                {#if tabObject.type === 'histogram'}
                    Histogram
                {:else if tabObject.type === 'boxplot'}
                    Boxplot
                {:else if tabObject.type === 'heatmap'}
                    Heatmap
                {:else if tabObject.type === 'infoPanel'}
                    Info panel
                {:else if tabObject.type === 'linePlot'}
                    Line Plot
                {:else if tabObject.type === 'scatterPlot'}
                    Scatter Plot
                {/if}
            {/if}</span
        >
    </div>
    <span class="comment"
        >{#if width > 300}{tabObject.tabComment}{/if}</span
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
        background-color: var(--bg-medium);
        font-size: 1.1rem;
        cursor: pointer;
    }

    .activeWrapper {
        background-color: var(--bg-bright);
        font-size: 1.4rem;
    }

    .main {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 40px;
    }

    .icon {
        margin-right: 7px;
        padding-top: 2px;
    }

    .comment {
        margin-left: auto;
        font-size: 0.9rem;
        color: var(--font-light);
    }
</style>
