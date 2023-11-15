<script lang="ts">
    import { currentState } from '../webviewState';

    let numRows = 0;
    $: {
        if ($currentState.table)
            numRows = Math.max(...$currentState.table.columns.map((column) => column.values.length));
    }
</script>

<div>
    {#if !$currentState.table}
        <span>Loading ...</span>
    {:else}
        <table>
            <thead>
                <tr>
                    {#each $currentState.table.columns as column}
                        <th>{column.name}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each Array(numRows) as _, i}
                    <tr>
                        {#each $currentState.table.columns as column}
                            <td>{column.values[i] || ''}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
