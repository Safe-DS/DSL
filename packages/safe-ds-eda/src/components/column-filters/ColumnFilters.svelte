<script lang="ts">
    import type { Column, NumericalFilter, PossibleColumnFilter } from '../../../types/state.js';
    import { executeExternalHistoryEntry } from '../../apis/historyApi.js';
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();

    export let possibleFilters: PossibleColumnFilter[];
    export let appliedFilters: Column['appliedFilters'];
    export let columnName: string;
    export let columnType: 'categorical' | 'numerical';

    let specificValue: string | number = '';
    let searchString = '';
    let minValue: number = 0;
    let maxValue: number = 0;

    const selectDone = () => {
        dispatch('done');
    };

    onMount(() => {
        let specificValueApplied = false;
        let searchStringApplied = false;
        let valueRangeApplied = false;

        appliedFilters.forEach((filter) => {
            if (filter.type === 'specificValue') {
                specificValueApplied = true;
                specificValue = filter.value;
            } else if (filter.type === 'searchString') {
                searchStringApplied = true;
                searchString = filter.searchString;
            } else if (filter.type === 'valueRange') {
                valueRangeApplied = true;
                minValue = filter.currentMin;
                maxValue = filter.currentMax;
            }
        });
        possibleFilters.forEach((filter) => {
            if (filter.type === 'specificValue' && !specificValueApplied) {
                specificValue = filter.values[0].toString();
            } else if (filter.type === 'valueRange' && !valueRangeApplied) {
                minValue = filter.min;
                maxValue = filter.max;
            } else if (filter.type === 'searchString' && !searchStringApplied) {
                searchString = '';
            }
        });
    });

    const handleSpecificValueFilterChange = (event: Event) => {
        specificValue = (event.target as HTMLSelectElement).value;
        if (specificValue === '-') {
            executeExternalHistoryEntry({
                type: 'external-manipulating',
                action: 'voidFilterColumn',
                alias: `Remove value filter on ${columnName}`,
                columnName,
                filterType: 'specificValue',
            });
            selectDone();
            return;
        }

        executeExternalHistoryEntry({
            type: 'external-manipulating',
            action: 'filterColumn',
            alias: `Filter ${columnName} by ${specificValue}`,
            columnName,
            filter: {
                type: 'specificValue',
                value: columnType === 'numerical' ? Number(specificValue) : specificValue,
            },
        });

        selectDone();
    };

    const confirmSearchStringFilter = () => {
        if (!searchString) return;

        executeExternalHistoryEntry({
            type: 'external-manipulating',
            action: 'filterColumn',
            alias: `Filter ${columnName} by contains "${searchString}"`,
            columnName,
            filter: {
                type: 'searchString',
                searchString,
            },
        });

        selectDone();
    };

    const handleValueRangeChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.name === 'minValue') {
            minValue = Number(target.value);
        } else if (target.name === 'maxValue') {
            maxValue = Number(target.value);
        }
    };

    const confirmValueRangeFilter = (totalMin: number, totalMax: number) => {
        if (minValue == null || maxValue == null) return;

        executeExternalHistoryEntry({
            type: 'external-manipulating',
            action: 'filterColumn',
            alias: `Filter ${columnName} between ${minValue} and ${maxValue}`,
            columnName,
            filter: {
                type: 'valueRange',
                currentMin: minValue,
                currentMax: maxValue,
                min: totalMin,
                max: totalMax,
            },
        });

        selectDone();
    };

    const isInvalidRange = (minValue: number, maxValue: number, totalMin: number, totalMax: number) => {
        return minValue >= maxValue || minValue < totalMin || maxValue > totalMax;
    };
</script>

<div class="wrapper">
    {#each possibleFilters as filter}
        {#if filter.type === 'specificValue'}
            <div class="filterRow contextItem">
                <span class="filterName">Value:</span>
                <select class="filterInput" on:change={handleSpecificValueFilterChange} bind:value={specificValue}>
                    {#each filter.values as value}
                        <option {value}>{value}</option>
                    {/each}
                </select>
            </div>
        {:else if filter.type === 'searchString'}
            <div class="filterRow contextItem">
                <span class="filterName">Contains:</span>
                <div class="searchStringContainer">
                    <input
                        type="text"
                        class="filterInput"
                        bind:value={searchString}
                        on:keypress={(event) => (event.key === 'Enter' ? confirmSearchStringFilter() : undefined)}
                    />
                    <button class="confirmButton" on:click={confirmSearchStringFilter}>&rarr;</button>
                </div>
            </div>
        {:else if filter.type === 'valueRange'}
            <div class="filterRow contextItem">
                <span class="filterName">Range:</span>
                <div class="rangeContainer">
                    <input
                        type="number"
                        name="minValue"
                        class="rangeInput"
                        min={filter.min}
                        max={filter.max}
                        placeholder="Min"
                        bind:value={minValue}
                        on:input={handleValueRangeChange}
                        class:invalid={minValue >= maxValue || minValue < filter.min || minValue > filter.max}
                    />
                    <input
                        type="number"
                        name="maxValue"
                        class="rangeInput"
                        min={filter.min}
                        max={filter.max}
                        placeholder="Max"
                        bind:value={maxValue}
                        on:input={handleValueRangeChange}
                        class:invalid={maxValue <= minValue || maxValue < filter.min || maxValue > filter.max}
                    />
                    <button
                        class="confirmButton"
                        on:click={() => confirmValueRangeFilter(filter.min, filter.max)}
                        disabled={isInvalidRange(minValue, maxValue, filter.min, filter.max)}
                        title={isInvalidRange(minValue, maxValue, filter.min, filter.max)
                            ? 'Invalid range values. Min should be less than Max and both should be within the allowed range.'
                            : ''}>&rarr;</button
                    >
                </div>
            </div>
        {/if}
    {/each}
</div>

<style>
    .wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 5px 10px;
        background-color: var(--lightest-color);
        border-radius: 5px;
    }

    .filterRow {
        display: grid;
        grid-template-columns: 1fr 2fr;
        align-items: center;
        gap: 10px;
        padding: 5px;
        border-radius: 5px;
    }

    .filterName {
        color: var(--dark-color);
        font-weight: bold;
        font-size: 1em;
    }

    .filterInput {
        width: 100%;
        padding: 5px;
        border: 1px solid var(--lightest-color);
        border-radius: 3px;
        background-color: var(--lightest-color);
        font-size: 1em;
        border-color: var(--medium-color);
    }

    .filterInput:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .searchStringContainer {
        display: flex;
        align-items: center;
        gap: 5px;
        width: 150px;
    }

    .rangeContainer {
        display: flex;
        align-items: center;
        gap: 5px;
        width: 100%;
    }

    .rangeInput {
        flex-grow: 1;
        padding: 5px;
        border: 1px solid var(--lightest-color);
        border-radius: 3px;
        background-color: var(--lightest-color);
        font-size: 1em;
        border-color: var(--medium-color);
    }

    .rangeInput:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .rangeInput.invalid {
        border-color: var(--error-color);
        color: var(--error-color);
    }

    .confirmButton {
        background-color: var(--primary-color);
        border: none;
        cursor: pointer;
        font-size: 1.2em;
        padding: 5px 10px;
        color: var(--lightest-color);
        border-radius: 3px;
        width: 40px;
        transition: background-color 0.2s;
    }

    .confirmButton:hover:not(:disabled) {
        background-color: var(--primary-color-desaturated);
    }

    .confirmButton:disabled {
        background-color: var(--medium-color);
        cursor: not-allowed;
    }
</style>
