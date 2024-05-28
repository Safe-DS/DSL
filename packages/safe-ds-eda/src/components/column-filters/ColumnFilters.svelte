<script lang="ts">
    import type { PossibleColumnFilter } from '../../../types/state.js';

    export let possibleFilters: PossibleColumnFilter[];

    const handleSpecificValueFilterChange = (_event: Event) => {
        // TODO: Implement
    };
</script>

<div class="wrapper">
    {#each possibleFilters as filter}
        {#if filter.type === 'specificValue'}
            <div class="filterRow contextItem">
                <span class="filterName">Filter by value</span>
                <select on:change={handleSpecificValueFilterChange}>
                    {#each filter.values as value}
                        <option {value}>{value}</option>
                    {/each}
                </select>
            </div>
        {/if}
    {/each}
</div>

<style>
    .wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .filterRow {
        display: flex;
        flex-direction: row;
        gap: 5px;
    }

    .filterName {
        color: var(--dark-color);
    }
</style>
