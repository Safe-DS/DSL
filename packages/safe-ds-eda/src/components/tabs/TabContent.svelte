<script lang="ts">
    import type { EmptyTab, Tab } from '../../../types/state';
    import ImageContent from './content/ImageContent.svelte';
    import CaretIcon from '../../icons/Caret.svelte';
    import DropDownButton from '../utilities/DropDownButton.svelte';
    import { currentState } from '../../webviewState';

    export let tab: Tab | EmptyTab;
    export let sidebarWidth: number;

    const columnNames = $currentState.table?.columns.map((column) => column[1].name) || [];
    const possibleTableNames = ['Histogram', 'Bar Plot', 'Heatmap', 'Line Plot', 'Scatter Plot', 'Info Panel'];

    const getTabName = function () {
        if (tab.type === 'histogram') {
            return 'Histogram';
        } else if (tab.type === 'barPlot') {
            return 'Bar Plot';
        } else if (tab.type === 'heatmap') {
            return 'Heatmap';
        } else if (tab.type === 'linePlot') {
            return 'Line Plot';
        } else if (tab.type === 'scatterPlot') {
            return 'Scatter Plot';
        } else if (tab.type === 'empty') {
            return 'Select type';
        } else if (tab.type === 'infoPanel') return 'Info Panel';
        else {
            throw new Error('Invalid tab type');
        }
    };

    const newTypeSelected = function (selected: string) {
        console.log(selected);
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
                    />
                    <span class="outdated"
                        >{#if tab.type !== 'empty' && tab.content.outdated}
                            Outdated!
                        {/if}</span
                    >
                </div>
            </div>
            <div class="rightInfo">
                {#if tab.type !== 'empty' && tab.imageTab && (tab.columnNumber === 'one' || tab.columnNumber === 'two')}
                    <div class="axis">
                        {#if tab.columnNumber === 'one'}
                            <span class="axisName">Column</span>
                            <div class="columnDropdown">
                                <DropDownButton
                                    initialOption={tab.content.columnName}
                                    onSelect={newTypeSelected}
                                    possibleOptions={columnNames}
                                    fontSize="1.1em"
                                    height="30px"
                                    width="120px"
                                />
                            </div>
                        {:else}
                            <span class="axisName">X-Axis</span>
                            <div class="columnDropdown">
                                <DropDownButton
                                    initialOption={tab.content.xAxisColumnName}
                                    onSelect={newTypeSelected}
                                    possibleOptions={columnNames}
                                    fontSize="1.1em"
                                    height="30px"
                                    width="120px"
                                />
                            </div>
                        {/if}
                    </div>
                {/if}
                {#if tab.imageTab && tab.type !== 'empty' && tab.columnNumber === 'two'}
                    <div class="columnSwitchButton">--</div>
                    <div class="axis">
                        <span class="axisName">Y-Axis</span>
                        <DropDownButton
                            initialOption={tab.content.yAxisColumnName}
                            onSelect={newTypeSelected}
                            possibleOptions={columnNames}
                            fontSize="1.1em"
                            height="30px"
                            width="120px"
                        />
                    </div>
                {/if}
            </div>
        </div>
        <div class="content">
            {#if tab.type !== 'empty' && tab.imageTab}
                <ImageContent image={tab.content.encodedImage} />
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
</style>
