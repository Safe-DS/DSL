<script lang="ts">
    import type { EmptyTab, ExternalVisualizingHistoryEntry, Tab } from '../../../types/state';
    import ImageContent from './content/ImageContent.svelte';
    import DropDownButton from '../utilities/DropDownButton.svelte';
    import { cancelTabIdsWaiting, table } from '../../webviewState';
    import { imageWidthToHeightRatio } from '../../../consts.config';
    import { executeExternalHistoryEntry, setTabAsGenerating } from '../../apis/historyApi';
    import SwapIcon from '../../icons/Swap.svelte';
    import { derived, writable } from 'svelte/store';

    export let tab: Tab | EmptyTab;
    export let sidebarWidth: number;

    const allowsNonNumericalColumns = function (type: string) {
        return type === 'histogram';
    };

    const columnNames = derived(
        table,
        ($table) =>
            $table?.columns.map((column) => {
                return {
                    name: column.name,
                    color: column.hidden ? 'var(--error-color)' : undefined,
                    comment: column.hidden ? 'hidden' : undefined,
                };
            }) || [],
    );
    const numericalColumnNames = derived(
        table,
        ($table) =>
            $table?.columns
                .filter((column) => column.type === 'numerical')
                .map((column) => {
                    return {
                        name: column.name,
                        color: column.hidden ? 'var(--error-color)' : undefined,
                        comment: column.hidden ? 'hidden' : undefined,
                    };
                }) || [],
    );
    const possibleTableNames = ['Histogram', 'Boxplot', 'Heatmap', 'Lineplot', 'Scatterplot'];

    let isLoadingGeneratedTab = false;
    let previousTab: Tab | EmptyTab = tab;
    let changesDisabled = false;

    const buildATab = writable<any>({}); // Assuming initial value as an empty object

    // Derived store to check if there are keys in buildATab
    const isInBuildingState = derived(
        buildATab,
        ($buildATab) => Object.keys($buildATab).length > 0 || tab.type === 'empty',
    );

    // Derived store to decide between buildATab and tab based on isInBuildingState
    const tabInfo = derived([isInBuildingState, buildATab], ([$isInBuildingState, $buildATab]) =>
        $isInBuildingState ? $buildATab : tab,
    );

    // Derived store to check if the building is complete
    const buildATabComplete = derived(
        buildATab,
        ($buildATab) => Object.keys($buildATab).length > 0 && completeBuildATab() !== undefined,
    );

    $: if (tab !== previousTab) {
        previousTab = tab;
        resetLoadingState();
    }

    $: if ($cancelTabIdsWaiting) handleNewCancelledTab();

    const handleNewCancelledTab = function () {
        if (tab.id && $cancelTabIdsWaiting.includes(tab.id)) {
            resetLoadingState();
            cancelTabIdsWaiting.update((ids) => ids.filter((id) => id !== tab.id));
        }
    };

    const getTabName = function (fromTab = tab) {
        if (!fromTab || Object.keys(fromTab).length === 0) return 'Select type';
        if (fromTab.type === 'histogram') {
            return 'Histogram';
        } else if (fromTab.type === 'boxPlot') {
            return 'Boxplot';
        } else if (fromTab.type === 'heatmap') {
            return 'Heatmap';
        } else if (fromTab.type === 'linePlot') {
            return 'Lineplot';
        } else if (fromTab.type === 'scatterPlot') {
            return 'Scatterplot';
        } else if (fromTab.type === 'infoPanel') {
            return 'Info Panel';
        } else {
            throw new Error('Invalid tab type');
        }
    };

    const newTypeSelected = function (selected: string) {
        let copyOverColumns = false;
        if (!$isInBuildingState && tab.type !== 'empty') {
            setTabAsGenerating(tab);
            copyOverColumns = true;
        }

        if (selected === 'Histogram') {
            buildATab.update((buildingTab) => {
                buildingTab.type = 'histogram';
                buildingTab.columnNumber = 'one';
                return buildingTab;
            });
        } else if (selected === 'Boxplot') {
            buildATab.update((buildingTab) => {
                buildingTab.type = 'boxPlot';
                buildingTab.columnNumber = 'one';
                return buildingTab;
            });
        } else if (selected === 'Heatmap') {
            buildATab.update((buildingTab) => {
                buildingTab.type = 'heatmap';
                buildingTab.columnNumber = 'none';
                return buildingTab;
            });
        } else if (selected === 'Lineplot') {
            buildATab.update((buildingTab) => {
                buildingTab.type = 'linePlot';
                buildingTab.columnNumber = 'two';
                return buildingTab;
            });
        } else if (selected === 'Scatterplot') {
            buildATab.update((buildingTab) => {
                buildingTab.type = 'scatterPlot';
                buildingTab.columnNumber = 'two';
                return buildingTab;
            });
        } else if (selected === 'Info Panel') {
            buildATab.update((buildingTab) => {
                buildingTab.type = 'infoPanel';
                buildingTab.columnNumber = 'none';
                return buildingTab;
            });
        } else {
            throw new Error('Invalid tab type');
        }

        if (copyOverColumns && tab.type !== 'empty' && $buildATab.columnNumber !== 'none') {
            if (tab.columnNumber === 'one') {
                buildATab.update((buildingTab) => {
                    buildingTab.xAxisColumnName = tab.content.columnName;
                    return buildingTab;
                });
            } else if (tab.columnNumber === 'two') {
                buildATab.update((buildingTab) => {
                    buildingTab.xAxisColumnName = tab.content.xAxisColumnName;
                    buildingTab.yAxisColumnName = tab.content.yAxisColumnName;
                    return buildingTab;
                });
            }
        }

        // Check if columns now require numerical column only and if so check if selected column(s) are numerical
        if (!allowsNonNumericalColumns($buildATab.type)) {
            buildATab.update((buildingTab) => {
                if (
                    buildingTab.xAxisColumnName &&
                    !$numericalColumnNames.find((column) => column.name === buildingTab.xAxisColumnName)
                ) {
                    buildingTab.xAxisColumnName = undefined;
                }
                if (
                    buildingTab.yAxisColumnName &&
                    !$numericalColumnNames.find((column) => column.name === buildingTab.yAxisColumnName)
                ) {
                    buildingTab.yAxisColumnName = undefined;
                }
                return buildingTab;
            });
        }

        // Set yAxisColumnName to undefined if it is not required
        if ($buildATab.columnNumber === 'one') {
            buildATab.update((buildingTab) => {
                buildingTab.yAxisColumnName = undefined;
                return buildingTab;
            });
        }
    };

    const newXAxisSelected = function (selected: string) {
        if (!$isInBuildingState && tab.type !== 'empty') {
            setTabAsGenerating(tab);
            buildATab.set({ type: tab.type, columnNumber: tab.columnNumber });
            if (tab.columnNumber === 'two') {
                buildATab.update((buildingTab) => {
                    buildingTab.yAxisColumnName = tab.content.yAxisColumnName;
                    return buildingTab;
                });
            }
        }
        buildATab.update((buildingTab) => {
            buildingTab.xAxisColumnName = selected;
            return buildingTab;
        });
    };

    const newYAxisSelected = function (selected: string) {
        if (!$isInBuildingState && tab.type !== 'empty') {
            setTabAsGenerating(tab);
            buildATab.set({ type: tab.type, columnNumber: tab.columnNumber });
            if (tab.columnNumber === 'two') {
                buildATab.update((buildingTab) => {
                    buildingTab.xAxisColumnName = tab.content.xAxisColumnName;
                    return buildingTab;
                });
            }
        }
        buildATab.update((buildingTab) => {
            buildingTab.yAxisColumnName = selected;
            return buildingTab;
        });
    };

    const switchColumns = function () {
        if (!$isInBuildingState && tab.type !== 'empty') {
            if (tab.columnNumber !== 'two') return;
            setTabAsGenerating(tab);
            buildATab.set({
                type: tab.type,
                columnNumber: tab.columnNumber,
                xAxisColumnName: tab.content.yAxisColumnName,
                yAxisColumnName: tab.content.xAxisColumnName,
            });
            return;
        }
        buildATab.update((buildingTab) => {
            const temp = buildingTab.xAxisColumnName;
            buildingTab.xAxisColumnName = buildingTab.yAxisColumnName;
            buildingTab.yAxisColumnName = temp;
            return buildingTab;
        });
    };

    const completeBuildATab = function (): ExternalVisualizingHistoryEntry | undefined {
        if (Object.keys(buildATab).length === 0) return undefined;
        if ($buildATab.columnNumber === 'one') {
            if (!$buildATab.xAxisColumnName) return undefined;
            return {
                existingTabId: tab.id,
                action: $buildATab.type,
                alias: 'Generate ' + getTabName($buildATab) + ' in existing Tab',
                type: 'external-visualizing',
                columnName: $buildATab.xAxisColumnName,
                columnNumber: 'one',
            };
        } else if ($buildATab.columnNumber === 'two') {
            if (!$buildATab.xAxisColumnName || !$buildATab.yAxisColumnName) return undefined;
            return {
                existingTabId: tab.id,
                action: $buildATab.type,
                alias: 'Generate ' + getTabName($buildATab) + ' in existing Tab',
                type: 'external-visualizing',
                xAxisColumnName: $buildATab.xAxisColumnName,
                yAxisColumnName: $buildATab.yAxisColumnName,
                columnNumber: 'two',
            };
        } else {
            return {
                existingTabId: tab.id,
                action: $buildATab.type,
                alias: 'Generate ' + getTabName($buildATab) + ' in existing Tab',
                type: 'external-visualizing',
                columnNumber: 'none',
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
            buildATab.set({});
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
                        selectedOption={getTabName($tabInfo)}
                        onSelect={newTypeSelected}
                        possibleOptions={possibleTableNames.map((name) => ({ name }))}
                        {changesDisabled}
                    />
                    <span class="outdated"
                        >{#if tab.type !== 'empty' && tab.outdated && !$isInBuildingState}
                            Outdated!
                        {/if}</span
                    >
                </div>
            </div>
            <div class="rightInfo">
                {#if $tabInfo.type !== 'empty' && ($tabInfo.columnNumber === 'one' || $tabInfo.columnNumber === 'two')}
                    <div class="axis">
                        {#if $tabInfo.columnNumber === 'one'}
                            <span class="axisName">Column</span>
                            <div class="columnDropdown">
                                <DropDownButton
                                    selectedOption={$tabInfo.content?.columnName ??
                                        $tabInfo.xAxisColumnName ??
                                        'Select'}
                                    onSelect={newXAxisSelected}
                                    possibleOptions={allowsNonNumericalColumns($tabInfo.type)
                                        ? $columnNames
                                        : $numericalColumnNames}
                                    fontSize="1.1em"
                                    height="40px"
                                    width="140px"
                                    {changesDisabled}
                                />
                            </div>
                        {:else}
                            <span class="axisName">X-Axis</span>
                            <div class="columnDropdown">
                                <DropDownButton
                                    selectedOption={$tabInfo.content?.xAxisColumnName ??
                                        $tabInfo.xAxisColumnName ??
                                        'Select'}
                                    onSelect={newXAxisSelected}
                                    possibleOptions={allowsNonNumericalColumns($tabInfo.type)
                                        ? $columnNames
                                        : $numericalColumnNames}
                                    fontSize="1.1em"
                                    height="40px"
                                    width="140px"
                                    {changesDisabled}
                                />
                            </div>
                        {/if}
                    </div>
                {/if}
                {#if $tabInfo.type !== 'empty' && $tabInfo.columnNumber === 'two'}
                    <div
                        role="none"
                        class="columnSwitchButton"
                        on:click={(
                            $tabInfo.content
                                ? !$tabInfo.content?.xAxisColumnName || !$tabInfo.content?.yAxisColumnName
                                : !$tabInfo.xAxisColumnName || !$tabInfo.yAxisColumnName
                        )
                            ? undefined
                            : switchColumns}
                        class:inactive={$tabInfo.content
                            ? !$tabInfo.content?.xAxisColumnName || !$tabInfo.content?.yAxisColumnName
                            : !$tabInfo.xAxisColumnName || !$tabInfo.yAxisColumnName}
                    >
                        <SwapIcon />
                    </div>
                    <div class="axis">
                        <span class="axisName">Y-Axis</span>
                        <DropDownButton
                            selectedOption={$tabInfo.content?.yAxisColumnName ?? $tabInfo.yAxisColumnName ?? 'Select'}
                            onSelect={newYAxisSelected}
                            possibleOptions={allowsNonNumericalColumns($tabInfo.type)
                                ? $columnNames
                                : $numericalColumnNames}
                            fontSize="1.1em"
                            height="40px"
                            width="140px"
                            {changesDisabled}
                        />
                    </div>
                {/if}
            </div>
        </div>
        <div class="content">
            {#if tab.type !== 'empty' && tab.imageTab}
                <div style:visibility={$isInBuildingState ? 'hidden' : 'visible'}>
                    <ImageContent image={tab.content.encodedImage} />
                </div>
            {/if}
            {#if (tab.type === 'empty' || tab.imageTab) && $isInBuildingState}
                {#if isLoadingGeneratedTab}
                    <div class="loading" style="aspect-ratio: {imageWidthToHeightRatio};">
                        <p>Loading ...</p>
                    </div>
                {:else if $buildATabComplete}
                    <div class="loading" style="aspect-ratio: {imageWidthToHeightRatio};">
                        <button class="generateButton" on:click={generateTab}>Generate</button>
                    </div>
                {:else}
                    <div class="loading" style="aspect-ratio: {imageWidthToHeightRatio};">
                        <p>Complete selections</p>
                    </div>
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
        background-color: var(--lightest-color);
        display: grid;
        grid-template-columns: 1fr auto 1fr;
    }

    .infoBar {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        max-width: 750px;
        margin-bottom: 4vw;
        height: 65px;
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
        color: var(--dark-color);
    }

    .loading {
        min-width: 600px;
        margin: 0 auto;
        background-color: var(--light-color);
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
        min-width: 600px;
    }

    .generateButton {
        padding: 10px 20px;
        background-color: var(--primary-color);
        color: var(--light-color);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        width: fit-content;
    }

    .generateButton:hover {
        background-color: var(--primary-color-desaturated);
        color: var(--dark-color);
    }

    .columnSwitchButton {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        height: 20px;
        width: 20px;
    }

    .columnSwitchButton.inactive {
        cursor: not-allowed;
    }
</style>
