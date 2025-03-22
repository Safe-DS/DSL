<script lang="ts" context="module">
    export type Category = {
        name: string;
        subcategories: Category[] | undefined;
        filteredCount: number;
        elements: Buildin[];
    };
</script>

<script lang="ts">
    import Accordion from '$/src/components/ui/accordion/accordion.svelte';
    import { renderCategoryName } from '$/src/components/ui/category/utils';
    import { Buildin } from '$global';

    export let category: Category;
</script>

{#if !category.subcategories}
    {#each category.elements as element}
        <span>{element.parent + '.' + element.name}</span>
    {/each}
    {#if category.filteredCount > 0}
        <span class=" text-text-muted">{'... Filtered Elements: ' + category.filteredCount}</span>
    {/if}
{:else}
    <div class="pl-3">
        {#each category.subcategories as subcategory}
            <Accordion withIcon={false} name={renderCategoryName(subcategory)}>
                <div class="flex flex-col gap-2 py-2 pl-12">
                    <svelte:self category={subcategory} />
                </div>
            </Accordion>
        {/each}
    </div>
{/if}
