<script lang="ts">
    import type { EmptyTab, ExternalVisualizingRebuildHistoryEntry, Tab } from '../../../types/state';
    import ImageContent from './content/ImageContent.svelte';
    import DropDownButton from '../utilities/DropDownButton.svelte';
    import { currentState } from '../../webviewState';
    import { imageWidthToHeightRatio } from '../../../consts.config';
    import { executeExternalHistoryEntry } from '../../apis/historyApi';

    export let tab: Tab | EmptyTab;
    export let sidebarWidth: number;

    const columnNames = $currentState.table?.columns.map((column) => column[1].name) || [];
    const possibleTableNames = ['Histogram', 'Boxplot', 'Heatmap', 'Line Plot', 'Scatter Plot', 'Info Panel'];

    let buildATab: any = {};
    let isLoadingGeneratedTab = false;
    let previousTab: Tab | EmptyTab = tab;
    let changesDisabled = false;

    $: isInBuildingState = Object.keys(buildATab).length > 0;
    $: tabInfo = isInBuildingState ? buildATab : tab;
    $: buildATabComplete = Object.keys(buildATab).length > 0 ? completeBuildATab() !== undefined : false;
    $: if (tab !== previousTab) {
        previousTab = tab;
        resetLoadingState();
    }

    const getTabName = function (fromTab = tab) {
        if (!fromTab) return 'Select type';
        if (fromTab.type === 'histogram') {
            return 'Histogram';
        } else if (fromTab.type === 'boxplot') {
            return 'Boxplot';
        } else if (fromTab.type === 'heatmap') {
            return 'Heatmap';
        } else if (fromTab.type === 'linePlot') {
            return 'Line Plot';
        } else if (fromTab.type === 'scatterPlot') {
            return 'Scatter Plot';
        } else if (fromTab.type === 'infoPanel') return 'Info Panel';
        else {
            throw new Error('Invalid tab type');
        }
    };

    const newTypeSelected = function (selected: string) {
        if (selected === 'Histogram') {
            buildATab.type = 'histogram';
            buildATab.columnNumber = 'one';
        } else if (selected === 'Boxplot') {
            buildATab.type = 'boxplot';
            buildATab.columnNumber = 'one';
        } else if (selected === 'Heatmap') {
            buildATab.type = 'heatmap';
            buildATab.columnNumber = 'none';
        } else if (selected === 'Line Plot') {
            buildATab.type = 'linePlot';
            buildATab.columnNumber = 'two';
        } else if (selected === 'Scatter Plot') {
            buildATab.type = 'scatterPlot';
            buildATab.columnNumber = 'two';
        } else if (selected === 'Info Panel') {
            buildATab.type = 'infoPanel';
            buildATab.columnNumber = 'none';
        } else {
            throw new Error('Invalid tab type');
        }
    };

    const newXAxisSelected = function (selected: string) {
        buildATab.xAxisColumnName = selected;
    };

    const newYAxisSelected = function (selected: string) {
        buildATab.yAxisColumnName = selected;
    };

    const completeBuildATab = function (): ExternalVisualizingRebuildHistoryEntry | undefined {
        if (Object.keys(buildATab).length === 0) return undefined;
        if (buildATab.columnNumber === 'one') {
            if (!buildATab.xAxisColumnName) return undefined;
            return {
                action: buildATab.type,
                initialHistoryEntryId: tab.initialHistoryEntryId,
                alias: 'Generate ' + getTabName(buildATab),
                type: 'external-visualizing',
                columnName: buildATab.xAxisColumnName,
            };
        } else if (buildATab.columnNumber === 'two') {
            if (!buildATab.xAxisColumnName || !buildATab.yAxisColumnName) return undefined;
            return {
                action: buildATab.type,
                initialHistoryEntryId: tab.initialHistoryEntryId,
                alias: 'Generate ' + getTabName(buildATab),
                type: 'external-visualizing',
                xAxisColumnName: buildATab.xAxisColumnName,
                yAxisColumnName: buildATab.yAxisColumnName,
            };
        } else {
            return {
                action: buildATab.type,
                initialHistoryEntryId: tab.initialHistoryEntryId,
                alias: 'Generate ' + getTabName(buildATab),
                type: 'external-visualizing',
            };
        }
    };

    const generateTab = function () {
        const builtTab = completeBuildATab();
        if (builtTab) {
            changesDisabled = true;
            isLoadingGeneratedTab = true;
            executeExternalHistoryEntry(builtTab);
        }
    };

    const resetLoadingState = function () {
        if (isLoadingGeneratedTab) {
            isLoadingGeneratedTab = false;
            buildATab = {};
            changesDisabled = false;
        }
    };
</script>

<div class="wrapper" style:width={'calc(100vw - ' + sidebarWidth + 'px)'}>
    <div class="sideWrapper"></div>
    <div class="middleWrapper">
        <div class="infoBar">
            <div class="leftInfo">
                <div class="leftInfoRow">
                    <DropDownButton
                        initialOption={getTabName()}
                        onSelect={newTypeSelected}
                        possibleOptions={possibleTableNames}
                        {changesDisabled}
                    />
                    <span class="outdated"
                        >{#if tab.type !== 'empty' && tab.content.outdated}
                            Outdated!
                        {/if}</span
                    >
                </div>
            </div>
            <div class="rightInfo">
                {#if tabInfo.type !== 'empty' && (tabInfo.columnNumber === 'one' || tabInfo.columnNumber === 'two')}
                    <div class="axis">
                        {#if tabInfo.columnNumber === 'one'}
                            <span class="axisName">Column</span>
                            <div class="columnDropdown">
                                <DropDownButton
                                    initialOption={tabInfo.content?.columnName ?? tabInfo.xAxisColumnName ?? 'Select'}
                                    onSelect={newXAxisSelected}
                                    possibleOptions={columnNames}
                                    fontSize="1.1em"
                                    height="30px"
                                    width="120px"
                                    {changesDisabled}
                                />
                            </div>
                        {:else}
                            <span class="axisName">X-Axis</span>
                            <div class="columnDropdown">
                                <DropDownButton
                                    initialOption={tabInfo.content?.xAxisColumnName ??
                                        tabInfo.xAxisColumnName ??
                                        'Select'}
                                    onSelect={newXAxisSelected}
                                    possibleOptions={columnNames}
                                    fontSize="1.1em"
                                    height="30px"
                                    width="120px"
                                    {changesDisabled}
                                />
                            </div>
                        {/if}
                    </div>
                {/if}
                {#if tabInfo.type !== 'empty' && tabInfo.columnNumber === 'two'}
                    <div class="columnSwitchButton">--</div>
                    <div class="axis">
                        <span class="axisName">Y-Axis</span>
                        <DropDownButton
                            initialOption={tabInfo.content?.yAxisColumnName ?? tabInfo.yAxisColumnName ?? 'Select'}
                            onSelect={newYAxisSelected}
                            possibleOptions={columnNames}
                            fontSize="1.1em"
                            height="30px"
                            width="120px"
                            {changesDisabled}
                        />
                    </div>
                {/if}
            </div>
        </div>
        <div class="content">
            {#if tab.type !== 'empty' && tab.imageTab}
                <div style:visibility={isInBuildingState ? 'hidden' : 'visible'}>
                    <ImageContent image={tab.content.encodedImage} />
                </div>
                {#if isInBuildingState}
                    {#if isLoadingGeneratedTab}
                        <div class="loading" style="aspect-ratio: {imageWidthToHeightRatio};">
                            <p>Loading ...</p>
                        </div>
                    {:else if buildATabComplete}
                        <div class="loading" style="aspect-ratio: {imageWidthToHeightRatio};">
                            <button class="generateButton" on:click={generateTab}>Generate</button>
                        </div>
                    {:else}
                        <div class="loading" style="aspect-ratio: {imageWidthToHeightRatio};">
                            <p>Complete selections</p>
                        </div>
                    {/if}
                {/if}
            {/if}
        </div>
    </div>
    <div class="sideWrapper"></div>
</div>

<style>
    .wrapper {
        height: 100%;
        padding: 4vw 50px;
        overflow-x: scroll;
        background-color: var(--bg-bright);
        display: grid;
        grid-template-columns: 1fr auto 1fr;
    }

    .infoBar {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        max-width: 750px;
        margin-bottom: 4vw;
    }

    .leftInfoRow {
        display: flex;
        flex-direction: row;
    }

    .rightInfo {
        display: flex;
        flex-direction: row;
        gap: 20px;
    }

    .outdated {
        color: var(--error-color);
        font-size: 16px;
        margin-left: 20px;
        align-self: flex-end;
    }

    .axis {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }

    .axisName {
        font-size: 1.2em;
        color: var(--font-light);
    }

    .loading {
        min-width: 500px;
        max-width: 800px;
        margin: 0 auto;
        background-color: var(--bg-medium);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .content {
        position: relative;
        z-index: 0;
    }

    .generateButton {
        padding: 10px 20px;
        background-color: var(--primary-color);
        color: var(--font-bright);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        width: fit-content;
    }

    .generateButton:hover {
        background-color: var(--primary-color-desaturated);
        color: var(--font-light);
    }
</style>
